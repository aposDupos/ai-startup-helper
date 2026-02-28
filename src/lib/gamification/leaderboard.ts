"use server";

import { createClient } from "@/lib/supabase/server";

export interface LeaderboardEntry {
    id: string;
    display_name: string;
    avatar_url: string | null;
    xp: number;
    level: number;
    streak_count: number;
    rank: number;
}

export async function getLeaderboard(limit = 20): Promise<LeaderboardEntry[]> {
    const supabase = await createClient();

    const { data: profiles } = await supabase
        .from("profiles")
        .select("id, display_name, avatar_url, xp, level, streak_count")
        .order("xp", { ascending: false })
        .limit(limit);

    return (profiles || []).map((p, i) => ({
        id: p.id,
        display_name: p.display_name || "Анонимный",
        avatar_url: p.avatar_url,
        xp: p.xp || 0,
        level: p.level || 1,
        streak_count: p.streak_count || 0,
        rank: i + 1,
    }));
}
