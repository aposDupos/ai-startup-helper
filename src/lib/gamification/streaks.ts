"use server";

import { createClient } from "@/lib/supabase/server";
import { awardXP } from "./xp";

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const STREAK_MILESTONES: Record<number, number> = {
    3: 15,
    7: 30,
    14: 50,
    30: 100,
    60: 200,
    100: 500,
};

// ---------------------------------------------------------------------------
// Update streak
// ---------------------------------------------------------------------------

export interface StreakResult {
    streakCount: number;
    isNewDay: boolean;
    milestoneReached: number | null;
    xpBonus: number;
}

export async function updateStreak(userId: string): Promise<StreakResult> {
    const supabase = await createClient();

    const { data: profile } = await supabase
        .from("profiles")
        .select("streak_count, streak_last_active")
        .eq("id", userId)
        .single();

    const today = new Date().toISOString().split("T")[0]; // YYYY-MM-DD
    const lastActive = profile?.streak_last_active;
    const currentStreak = profile?.streak_count || 0;

    // Same day — no update needed
    if (lastActive === today) {
        return {
            streakCount: currentStreak,
            isNewDay: false,
            milestoneReached: null,
            xpBonus: 0,
        };
    }

    // Calculate new streak
    let newStreak: number;
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const yesterdayStr = yesterday.toISOString().split("T")[0];

    if (lastActive === yesterdayStr) {
        // Continue streak
        newStreak = currentStreak + 1;
    } else {
        // Reset streak
        newStreak = 1;
    }

    // Update profile
    await supabase
        .from("profiles")
        .update({
            streak_count: newStreak,
            streak_last_active: today,
            updated_at: new Date().toISOString(),
        })
        .eq("id", userId);

    // Check milestone
    const milestoneXP = STREAK_MILESTONES[newStreak] || null;
    let xpBonus = 0;

    if (milestoneXP) {
        xpBonus = milestoneXP;
        await awardXP(userId, milestoneXP, "streak", undefined, `Streak ${newStreak} days`);
    }

    // Daily activity XP
    await awardXP(userId, 5, "streak", undefined, "Daily activity");

    return {
        streakCount: newStreak,
        isNewDay: true,
        milestoneReached: milestoneXP ? newStreak : null,
        xpBonus: xpBonus + 5,
    };
}

// ---------------------------------------------------------------------------
// Get streak info
// ---------------------------------------------------------------------------

export interface StreakInfo {
    count: number;
    isActiveToday: boolean;
    nextMilestone: number | null;
    daysToNextMilestone: number;
}

export async function getStreakInfo(userId: string): Promise<StreakInfo> {
    const supabase = await createClient();

    const { data: profile } = await supabase
        .from("profiles")
        .select("streak_count, streak_last_active")
        .eq("id", userId)
        .single();

    const today = new Date().toISOString().split("T")[0];
    const count = profile?.streak_count || 0;
    const isActiveToday = profile?.streak_last_active === today;

    // Find next milestone
    const milestones = Object.keys(STREAK_MILESTONES)
        .map(Number)
        .sort((a, b) => a - b);
    const nextMilestone = milestones.find((m) => m > count) || null;
    const daysToNextMilestone = nextMilestone ? nextMilestone - count : 0;

    return {
        count,
        isActiveToday,
        nextMilestone,
        daysToNextMilestone,
    };
}
