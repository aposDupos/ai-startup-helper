"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface Challenge {
    id: string;
    title: string;
    description: string | null;
    type: string | null;
    criteria: Record<string, unknown>;
    xp_reward: number;
    starts_at: string | null;
    ends_at: string | null;
    is_active: boolean;
    participant_count: number;
    user_status: "not_joined" | "active" | "completed" | "failed";
    user_progress: Record<string, unknown> | null;
}

export interface LeaderboardEntry {
    user_id: string;
    display_name: string;
    level: number;
    progress: Record<string, unknown>;
    status: string;
    completed_at: string | null;
}

// ---------------------------------------------------------------------------
// Get active challenges with user status
// ---------------------------------------------------------------------------

export async function getActiveChallenges(): Promise<Challenge[]> {
    const supabase = await createClient();
    const {
        data: { user },
    } = await supabase.auth.getUser();

    // Get active challenges
    const { data: challenges } = await supabase
        .from("challenges")
        .select("*")
        .eq("is_active", true)
        .order("created_at", { ascending: false });

    if (!challenges) return [];

    // Get participant counts
    const challengeIds = challenges.map((c) => c.id);
    const { data: allParticipants } = await supabase
        .from("user_challenges")
        .select("challenge_id, user_id")
        .in("challenge_id", challengeIds);

    const countMap = new Map<string, number>();
    if (allParticipants) {
        for (const p of allParticipants) {
            countMap.set(p.challenge_id, (countMap.get(p.challenge_id) || 0) + 1);
        }
    }

    // Get current user's participation
    let userMap = new Map<string, { status: string; progress: Record<string, unknown> }>();
    if (user) {
        const { data: userChallenges } = await supabase
            .from("user_challenges")
            .select("challenge_id, status, progress")
            .eq("user_id", user.id)
            .in("challenge_id", challengeIds);

        if (userChallenges) {
            for (const uc of userChallenges) {
                userMap.set(uc.challenge_id, {
                    status: uc.status || "active",
                    progress: (uc.progress as Record<string, unknown>) || {},
                });
            }
        }
    }

    return challenges.map((c) => {
        const userEntry = userMap.get(c.id);
        return {
            id: c.id,
            title: c.title,
            description: c.description,
            type: c.type,
            criteria: c.criteria as Record<string, unknown>,
            xp_reward: c.xp_reward ?? 100,
            starts_at: c.starts_at,
            ends_at: c.ends_at,
            is_active: c.is_active ?? true,
            participant_count: countMap.get(c.id) || 0,
            user_status: (userEntry?.status as Challenge["user_status"]) || "not_joined",
            user_progress: userEntry?.progress || null,
        };
    });
}

// ---------------------------------------------------------------------------
// Join a challenge
// ---------------------------------------------------------------------------

export async function joinChallenge(challengeId: string) {
    const supabase = await createClient();
    const {
        data: { user },
    } = await supabase.auth.getUser();

    if (!user) throw new Error("Not authenticated");

    const { error } = await supabase.from("user_challenges").insert({
        user_id: user.id,
        challenge_id: challengeId,
        status: "active",
        progress: {},
    });

    if (error) {
        if (error.code === "23505") {
            // Already joined
            return { success: true, already: true };
        }
        throw new Error(error.message);
    }

    revalidatePath("/challenges");
    return { success: true, already: false };
}

// ---------------------------------------------------------------------------
// Get leaderboard for a challenge
// ---------------------------------------------------------------------------

export async function getChallengeLeaderboard(
    challengeId: string
): Promise<LeaderboardEntry[]> {
    const supabase = await createClient();

    const { data } = await supabase
        .from("user_challenges")
        .select(
            "user_id, status, progress, completed_at, profiles!user_challenges_user_id_fkey(display_name, level)"
        )
        .eq("challenge_id", challengeId)
        .order("completed_at", { ascending: true, nullsFirst: false });

    if (!data) return [];

    return data.map((row) => {
        const profile = row.profiles as unknown as {
            display_name: string;
            level: number;
        } | null;
        return {
            user_id: row.user_id,
            display_name: profile?.display_name || "Пользователь",
            level: profile?.level ?? 1,
            progress: (row.progress as Record<string, unknown>) || {},
            status: row.status || "active",
            completed_at: row.completed_at,
        };
    });
}
