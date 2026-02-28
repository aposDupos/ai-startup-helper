"use server";

import { createClient } from "@/lib/supabase/server";

// ---------------------------------------------------------------------------
// Award XP
// ---------------------------------------------------------------------------

export interface AwardXPResult {
    newXP: number;
    leveledUp: boolean;
    newLevel: number;
    previousLevel: number;
}

export async function awardXP(
    userId: string,
    amount: number,
    source: string,
    sourceId?: string,
    description?: string
): Promise<AwardXPResult> {
    const supabase = await createClient();

    // Insert XP transaction
    await supabase.from("xp_transactions").insert({
        user_id: userId,
        amount,
        source,
        source_id: sourceId || null,
        description: description || null,
    });

    // Get current profile
    const { data: profile } = await supabase
        .from("profiles")
        .select("xp, level")
        .eq("id", userId)
        .single();

    const currentXP = (profile?.xp || 0) + amount;
    const previousLevel = profile?.level || 1;

    // Check new level
    const { data: levels } = await supabase
        .from("levels")
        .select("level, min_xp")
        .order("min_xp", { ascending: false });

    let newLevel = 1;
    if (levels) {
        for (const l of levels) {
            if (currentXP >= l.min_xp) {
                newLevel = l.level;
                break;
            }
        }
    }

    // Update profile
    await supabase
        .from("profiles")
        .update({
            xp: currentXP,
            level: newLevel,
            updated_at: new Date().toISOString(),
        })
        .eq("id", userId);

    return {
        newXP: currentXP,
        leveledUp: newLevel > previousLevel,
        newLevel,
        previousLevel,
    };
}

// ---------------------------------------------------------------------------
// Get user XP and level info
// ---------------------------------------------------------------------------

export interface UserXPInfo {
    xp: number;
    level: number;
    levelTitle: string;
    levelIcon: string;
    nextLevelXP: number | null;
    xpToNextLevel: number;
    progress: number; // 0-100
}

export async function getUserXPInfo(userId: string): Promise<UserXPInfo> {
    const supabase = await createClient();

    const { data: profile } = await supabase
        .from("profiles")
        .select("xp, level")
        .eq("id", userId)
        .single();

    const { data: levels } = await supabase
        .from("levels")
        .select("level, title, min_xp, icon")
        .order("level", { ascending: true });

    const currentXP = profile?.xp || 0;
    const currentLevel = profile?.level || 1;

    const currentLevelData = levels?.find((l) => l.level === currentLevel);
    const nextLevelData = levels?.find((l) => l.level === currentLevel + 1);

    const currentMin = currentLevelData?.min_xp || 0;
    const nextMin = nextLevelData?.min_xp || null;

    const xpToNextLevel = nextMin ? nextMin - currentXP : 0;
    const progress = nextMin
        ? Math.min(100, ((currentXP - currentMin) / (nextMin - currentMin)) * 100)
        : 100;

    return {
        xp: currentXP,
        level: currentLevel,
        levelTitle: currentLevelData?.title || "Dreamer",
        levelIcon: currentLevelData?.icon || "💭",
        nextLevelXP: nextMin,
        xpToNextLevel,
        progress,
    };
}
