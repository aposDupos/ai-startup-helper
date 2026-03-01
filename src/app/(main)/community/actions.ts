"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface Discussion {
    id: string;
    author_id: string;
    author_name: string;
    author_level: number;
    stage: string | null;
    title: string;
    body: string;
    upvotes: number;
    reply_count: number;
    created_at: string;
    user_voted: boolean;
}

export interface Reply {
    id: string;
    author_id: string;
    author_name: string;
    author_level: number;
    body: string;
    created_at: string;
}

// ---------------------------------------------------------------------------
// Get discussions with vote status
// ---------------------------------------------------------------------------

export async function getDiscussions(
    stageFilter: string = "all",
    page: number = 1
): Promise<{ discussions: Discussion[]; totalPages: number }> {
    const supabase = await createClient();
    const {
        data: { user },
    } = await supabase.auth.getUser();

    const PAGE_SIZE = 15;
    const offset = (page - 1) * PAGE_SIZE;

    let query = supabase
        .from("discussions")
        .select(
            "id, author_id, stage, title, body, upvotes, created_at, profiles!discussions_author_id_fkey(display_name, level)",
            { count: "exact" }
        )
        .order("created_at", { ascending: false })
        .range(offset, offset + PAGE_SIZE - 1);

    if (stageFilter !== "all") {
        query = query.eq("stage", stageFilter);
    }

    const { data: discussions, count } = await query;
    if (!discussions) return { discussions: [], totalPages: 0 };

    // Get reply counts
    const ids = discussions.map((d) => d.id);
    const { data: replies } = await supabase
        .from("discussion_replies")
        .select("discussion_id")
        .in("discussion_id", ids);

    const replyCountMap = new Map<string, number>();
    if (replies) {
        for (const r of replies) {
            replyCountMap.set(r.discussion_id, (replyCountMap.get(r.discussion_id) || 0) + 1);
        }
    }

    // Get user votes
    let userVotes = new Set<string>();
    if (user) {
        const { data: votes } = await supabase
            .from("discussion_votes")
            .select("discussion_id")
            .eq("user_id", user.id)
            .in("discussion_id", ids);

        if (votes) {
            userVotes = new Set(votes.map((v) => v.discussion_id));
        }
    }

    const totalPages = Math.ceil((count || 0) / PAGE_SIZE);

    return {
        discussions: discussions.map((d) => {
            const profile = d.profiles as unknown as {
                display_name: string;
                level: number;
            } | null;
            return {
                id: d.id,
                author_id: d.author_id,
                author_name: profile?.display_name || "Пользователь",
                author_level: profile?.level ?? 1,
                stage: d.stage,
                title: d.title,
                body: d.body,
                upvotes: d.upvotes ?? 0,
                reply_count: replyCountMap.get(d.id) || 0,
                created_at: d.created_at,
                user_voted: userVotes.has(d.id),
            };
        }),
        totalPages,
    };
}

// ---------------------------------------------------------------------------
// Create discussion
// ---------------------------------------------------------------------------

export async function createDiscussion(formData: {
    title: string;
    body: string;
    stage: string;
}) {
    const supabase = await createClient();
    const {
        data: { user },
    } = await supabase.auth.getUser();

    if (!user) throw new Error("Not authenticated");

    const { error } = await supabase.from("discussions").insert({
        author_id: user.id,
        title: formData.title,
        body: formData.body,
        stage: formData.stage || "general",
    });

    if (error) throw new Error(error.message);

    revalidatePath("/community");
    return { success: true };
}

// ---------------------------------------------------------------------------
// Toggle vote
// ---------------------------------------------------------------------------

export async function toggleVote(discussionId: string): Promise<{ voted: boolean }> {
    const supabase = await createClient();
    const {
        data: { user },
    } = await supabase.auth.getUser();

    if (!user) throw new Error("Not authenticated");

    // Check if already voted
    const { data: existing } = await supabase
        .from("discussion_votes")
        .select("user_id")
        .eq("user_id", user.id)
        .eq("discussion_id", discussionId)
        .maybeSingle();

    if (existing) {
        // Remove vote
        await supabase
            .from("discussion_votes")
            .delete()
            .eq("user_id", user.id)
            .eq("discussion_id", discussionId);

        revalidatePath("/community");
        return { voted: false };
    } else {
        // Add vote
        await supabase.from("discussion_votes").insert({
            user_id: user.id,
            discussion_id: discussionId,
        });

        revalidatePath("/community");
        return { voted: true };
    }
}

// ---------------------------------------------------------------------------
// Get replies for a discussion
// ---------------------------------------------------------------------------

export async function getReplies(discussionId: string): Promise<Reply[]> {
    const supabase = await createClient();

    const { data } = await supabase
        .from("discussion_replies")
        .select(
            "id, author_id, body, created_at, profiles!discussion_replies_author_id_fkey(display_name, level)"
        )
        .eq("discussion_id", discussionId)
        .order("created_at", { ascending: true });

    if (!data) return [];

    return data.map((r) => {
        const profile = r.profiles as unknown as {
            display_name: string;
            level: number;
        } | null;
        return {
            id: r.id,
            author_id: r.author_id,
            author_name: profile?.display_name || "Пользователь",
            author_level: profile?.level ?? 1,
            body: r.body,
            created_at: r.created_at,
        };
    });
}

// ---------------------------------------------------------------------------
// Create reply
// ---------------------------------------------------------------------------

export async function createReply(discussionId: string, body: string) {
    const supabase = await createClient();
    const {
        data: { user },
    } = await supabase.auth.getUser();

    if (!user) throw new Error("Not authenticated");

    const { error } = await supabase.from("discussion_replies").insert({
        discussion_id: discussionId,
        author_id: user.id,
        body,
    });

    if (error) throw new Error(error.message);

    revalidatePath("/community");
    return { success: true };
}
