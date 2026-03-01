"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface PublicProject {
    id: string;
    title: string;
    description: string | null;
    stage: string;
    is_public: boolean;
    scorecard: { total?: number } | null;
    created_at: string;
    owner: {
        id: string;
        display_name: string;
        avatar_url: string | null;
    };
    reactions: {
        fire: number;
        creative: number;
        researched: number;
    };
    userReactions: string[]; // types the current user has reacted with
    hasOpenReview: boolean;
    reviewRequestId: string | null;
}

export type SortOption = "new" | "popular" | "score";
export type StageFilter = "all" | "idea" | "validation" | "business_model" | "mvp" | "pitch";

const PAGE_SIZE = 12;

// ---------------------------------------------------------------------------
// Get public projects
// ---------------------------------------------------------------------------

export async function getPublicProjects(
    page: number = 1,
    sort: SortOption = "new",
    stageFilter: StageFilter = "all",
    onlyWithReviews: boolean = false
): Promise<{ projects: PublicProject[]; totalPages: number }> {
    const supabase = await createClient();
    const {
        data: { user },
    } = await supabase.auth.getUser();

    const offset = (page - 1) * PAGE_SIZE;

    // Build query for public projects
    let query = supabase
        .from("projects")
        .select(
            `
            id, title, description, stage, is_public, scorecard, created_at,
            owner:profiles!projects_owner_id_fkey(id, display_name, avatar_url)
        `,
            { count: "exact" }
        )
        .eq("is_public", true);

    if (stageFilter !== "all") {
        query = query.eq("stage", stageFilter);
    }

    // Sorting
    if (sort === "score") {
        query = query.order("created_at", { ascending: false }); // fallback, will sort client-side by score
    } else {
        query = query.order("created_at", { ascending: false });
    }

    query = query.range(offset, offset + PAGE_SIZE - 1);

    const { data: projects, count } = await query;

    if (!projects || projects.length === 0) {
        return { projects: [], totalPages: 0 };
    }

    const projectIds = projects.map((p) => p.id);

    // Fetch reactions counts
    const { data: reactions } = await supabase
        .from("project_reactions")
        .select("project_id, type")
        .in("project_id", projectIds);

    // Fetch user's own reactions
    const { data: userReactions } = user
        ? await supabase
            .from("project_reactions")
            .select("project_id, type")
            .eq("user_id", user.id)
            .in("project_id", projectIds)
        : { data: [] };

    // Fetch open review requests (with IDs for linking)
    const { data: openRequests } = await supabase
        .from("review_requests")
        .select("id, project_id")
        .in("project_id", projectIds)
        .eq("status", "open");

    const openRequestMap = new Map<string, string>();
    for (const r of openRequests || []) {
        openRequestMap.set(r.project_id, r.id);
    }

    // Build reaction counts per project
    const reactionCounts: Record<string, { fire: number; creative: number; researched: number }> = {};
    for (const r of reactions || []) {
        if (!reactionCounts[r.project_id]) {
            reactionCounts[r.project_id] = { fire: 0, creative: 0, researched: 0 };
        }
        reactionCounts[r.project_id][r.type as keyof typeof reactionCounts[string]]++;
    }

    // Build user reaction map
    const userReactionsMap: Record<string, string[]> = {};
    for (const r of userReactions || []) {
        if (!userReactionsMap[r.project_id]) {
            userReactionsMap[r.project_id] = [];
        }
        userReactionsMap[r.project_id].push(r.type);
    }

    let result: PublicProject[] = projects.map((p) => ({
        id: p.id,
        title: p.title,
        description: p.description,
        stage: p.stage,
        is_public: p.is_public,
        scorecard: p.scorecard as { total?: number } | null,
        created_at: p.created_at,
        owner: Array.isArray(p.owner) ? p.owner[0] : p.owner,
        reactions: reactionCounts[p.id] || { fire: 0, creative: 0, researched: 0 },
        userReactions: userReactionsMap[p.id] || [],
        hasOpenReview: openRequestMap.has(p.id),
        reviewRequestId: openRequestMap.get(p.id) || null,
    }));

    // Filter by review status if needed
    if (onlyWithReviews) {
        result = result.filter((p) => p.hasOpenReview);
    }

    // Sort by score client-side if needed
    if (sort === "score") {
        result.sort((a, b) => (b.scorecard?.total || 0) - (a.scorecard?.total || 0));
    } else if (sort === "popular") {
        result.sort((a, b) => {
            const totalA = a.reactions.fire + a.reactions.creative + a.reactions.researched;
            const totalB = b.reactions.fire + b.reactions.creative + b.reactions.researched;
            return totalB - totalA;
        });
    }

    const totalPages = Math.ceil((count || 0) / PAGE_SIZE);
    return { projects: result, totalPages };
}

// ---------------------------------------------------------------------------
// Get top projects this week
// ---------------------------------------------------------------------------

export async function getTopProjectsThisWeek(): Promise<PublicProject[]> {
    const supabase = await createClient();
    const {
        data: { user },
    } = await supabase.auth.getUser();

    const weekAgo = new Date();
    weekAgo.setDate(weekAgo.getDate() - 7);

    // Get reactions from the last week
    const { data: weeklyReactions } = await supabase
        .from("project_reactions")
        .select("project_id, type")
        .gte("created_at", weekAgo.toISOString());

    if (!weeklyReactions || weeklyReactions.length === 0) return [];

    // Count reactions per project
    const projectCounts: Record<string, number> = {};
    for (const r of weeklyReactions) {
        projectCounts[r.project_id] = (projectCounts[r.project_id] || 0) + 1;
    }

    // Sort by count and take top 3
    const topProjectIds = Object.entries(projectCounts)
        .sort(([, a], [, b]) => b - a)
        .slice(0, 3)
        .map(([id]) => id);

    if (topProjectIds.length === 0) return [];

    const { data: projects } = await supabase
        .from("projects")
        .select(
            `id, title, description, stage, is_public, scorecard, created_at,
            owner:profiles!projects_owner_id_fkey(id, display_name, avatar_url)`
        )
        .in("id", topProjectIds)
        .eq("is_public", true);

    if (!projects) return [];

    // Fetch all reactions for these projects
    const { data: allReactions } = await supabase
        .from("project_reactions")
        .select("project_id, type")
        .in("project_id", topProjectIds);

    const { data: userReactions } = user
        ? await supabase
            .from("project_reactions")
            .select("project_id, type")
            .eq("user_id", user.id)
            .in("project_id", topProjectIds)
        : { data: [] };

    const reactionCounts: Record<string, { fire: number; creative: number; researched: number }> = {};
    for (const r of allReactions || []) {
        if (!reactionCounts[r.project_id]) reactionCounts[r.project_id] = { fire: 0, creative: 0, researched: 0 };
        reactionCounts[r.project_id][r.type as keyof typeof reactionCounts[string]]++;
    }

    const userReactionsMap: Record<string, string[]> = {};
    for (const r of userReactions || []) {
        if (!userReactionsMap[r.project_id]) userReactionsMap[r.project_id] = [];
        userReactionsMap[r.project_id].push(r.type);
    }

    return projects.map((p) => ({
        id: p.id,
        title: p.title,
        description: p.description,
        stage: p.stage,
        is_public: p.is_public,
        scorecard: p.scorecard as { total?: number } | null,
        created_at: p.created_at,
        owner: Array.isArray(p.owner) ? p.owner[0] : p.owner,
        reactions: reactionCounts[p.id] || { fire: 0, creative: 0, researched: 0 },
        userReactions: userReactionsMap[p.id] || [],
        hasOpenReview: false,
        reviewRequestId: null,
    }));
}

// ---------------------------------------------------------------------------
// Toggle project publish status
// ---------------------------------------------------------------------------

export async function toggleProjectPublic(projectId: string): Promise<boolean> {
    const supabase = await createClient();
    const {
        data: { user },
    } = await supabase.auth.getUser();

    if (!user) return false;

    const { data: project } = await supabase
        .from("projects")
        .select("is_public")
        .eq("id", projectId)
        .eq("owner_id", user.id)
        .single();

    if (!project) return false;

    const newState = !project.is_public;

    const { error } = await supabase
        .from("projects")
        .update({ is_public: newState, updated_at: new Date().toISOString() })
        .eq("id", projectId)
        .eq("owner_id", user.id);

    if (error) return false;

    revalidatePath("/dashboard");
    revalidatePath("/discover");

    return newState;
}

// ---------------------------------------------------------------------------
// Toggle reaction
// ---------------------------------------------------------------------------

export async function toggleReaction(
    projectId: string,
    type: "fire" | "creative" | "researched"
): Promise<{ added: boolean; counts: { fire: number; creative: number; researched: number } }> {
    const supabase = await createClient();
    const {
        data: { user },
    } = await supabase.auth.getUser();

    if (!user) throw new Error("Not authenticated");

    // Check if reaction exists
    const { data: existing } = await supabase
        .from("project_reactions")
        .select("id")
        .eq("user_id", user.id)
        .eq("project_id", projectId)
        .eq("type", type)
        .single();

    if (existing) {
        // Remove reaction
        await supabase
            .from("project_reactions")
            .delete()
            .eq("id", existing.id);
    } else {
        // Add reaction
        await supabase.from("project_reactions").insert({
            user_id: user.id,
            project_id: projectId,
            type,
        });
    }

    // Fetch updated counts
    const { data: reactions } = await supabase
        .from("project_reactions")
        .select("type")
        .eq("project_id", projectId);

    const counts = { fire: 0, creative: 0, researched: 0 };
    for (const r of reactions || []) {
        counts[r.type as keyof typeof counts]++;
    }

    revalidatePath("/discover");

    return { added: !existing, counts };
}
