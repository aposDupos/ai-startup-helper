"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import { gamificationAction } from "@/lib/gamification/check-after-action";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface ReviewRequest {
    id: string;
    project_id: string;
    author_id: string;
    artifact_type: "bmc" | "vpc" | "pitch";
    status: "open" | "reviewed" | "closed";
    created_at: string;
    project?: {
        id: string;
        title: string;
        bmc_data: unknown;
        vpc_data: unknown;
        artifacts: unknown;
        owner: {
            id: string;
            display_name: string;
        };
    };
}

export interface ReviewComment {
    block: string;
    text: string;
}

export interface Review {
    id: string;
    request_id: string;
    reviewer_id: string;
    comments: ReviewComment[];
    rating: number;
    created_at: string;
    reviewer?: {
        display_name: string;
    };
}

// ---------------------------------------------------------------------------
// Create review request
// ---------------------------------------------------------------------------

export async function createReviewRequest(
    projectId: string,
    artifactType: "bmc" | "vpc" | "pitch"
): Promise<{ success: boolean; error?: string }> {
    const supabase = await createClient();
    const {
        data: { user },
    } = await supabase.auth.getUser();

    if (!user) return { success: false, error: "Not authenticated" };

    // Check project is public
    const { data: project } = await supabase
        .from("projects")
        .select("is_public")
        .eq("id", projectId)
        .eq("owner_id", user.id)
        .single();

    if (!project?.is_public) {
        return { success: false, error: "Сначала опубликуйте проект в галерее" };
    }

    // Try to insert (unique index will prevent duplicates)
    const { error } = await supabase.from("review_requests").insert({
        project_id: projectId,
        author_id: user.id,
        artifact_type: artifactType,
        status: "open",
    });

    if (error) {
        if (error.code === "23505") {
            return { success: false, error: "Уже есть активный запрос на ревью для этого артефакта" };
        }
        return { success: false, error: error.message };
    }

    revalidatePath("/discover");
    return { success: true };
}

// ---------------------------------------------------------------------------
// Get active review request for an artifact
// ---------------------------------------------------------------------------

export async function getActiveRequest(
    projectId: string,
    artifactType: "bmc" | "vpc" | "pitch"
): Promise<ReviewRequest | null> {
    const supabase = await createClient();

    const { data } = await supabase
        .from("review_requests")
        .select("*")
        .eq("project_id", projectId)
        .eq("artifact_type", artifactType)
        .eq("status", "open")
        .single();

    return data;
}

// ---------------------------------------------------------------------------
// Get review request by ID (for review page)
// ---------------------------------------------------------------------------

export async function getReviewRequest(requestId: string): Promise<ReviewRequest | null> {
    const supabase = await createClient();

    const { data } = await supabase
        .from("review_requests")
        .select(`
            *,
            project:projects(
                id, title, bmc_data, vpc_data, artifacts,
                owner:profiles!projects_owner_id_fkey(id, display_name)
            )
        `)
        .eq("id", requestId)
        .single();

    if (!data) return null;

    return {
        ...data,
        project: Array.isArray(data.project) ? data.project[0] : data.project,
    } as ReviewRequest;
}

// ---------------------------------------------------------------------------
// Submit a review
// ---------------------------------------------------------------------------

export async function submitReview(
    requestId: string,
    comments: ReviewComment[],
    rating: number
): Promise<{ success: boolean; error?: string }> {
    const supabase = await createClient();
    const {
        data: { user },
    } = await supabase.auth.getUser();

    if (!user) return { success: false, error: "Not authenticated" };

    // Don't let author review their own request
    const { data: request } = await supabase
        .from("review_requests")
        .select("author_id")
        .eq("id", requestId)
        .single();

    if (request?.author_id === user.id) {
        return { success: false, error: "Нельзя ревьювить свой собственный проект" };
    }

    // Insert review
    const { error } = await supabase.from("reviews").insert({
        request_id: requestId,
        reviewer_id: user.id,
        comments,
        rating,
    });

    if (error) {
        if (error.code === "23505") {
            return { success: false, error: "Вы уже оставили ревью для этого запроса" };
        }
        return { success: false, error: error.message };
    }

    // Update request status to "reviewed"
    await supabase
        .from("review_requests")
        .update({ status: "reviewed", updated_at: new Date().toISOString() })
        .eq("id", requestId);

    // Award 15 XP for leaving a review
    await gamificationAction(user.id, 15, "peer_review", requestId, "Оставил ревью на проект");

    revalidatePath("/discover");
    return { success: true };
}

// ---------------------------------------------------------------------------
// Get reviews for a project (for author)
// ---------------------------------------------------------------------------

export async function getReviewsForProject(projectId: string): Promise<Review[]> {
    const supabase = await createClient();

    const { data: requests } = await supabase
        .from("review_requests")
        .select("id")
        .eq("project_id", projectId);

    if (!requests || requests.length === 0) return [];

    const requestIds = requests.map((r) => r.id);

    const { data: reviews } = await supabase
        .from("reviews")
        .select(`
            *,
            reviewer:profiles!reviews_reviewer_id_fkey(display_name)
        `)
        .in("request_id", requestIds)
        .order("created_at", { ascending: false });

    return (reviews || []).map((r) => ({
        ...r,
        comments: r.comments as ReviewComment[],
        reviewer: Array.isArray(r.reviewer) ? r.reviewer[0] : r.reviewer,
    }));
}
