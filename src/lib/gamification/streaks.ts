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
    streakAtRisk: boolean;
    canFreeze: boolean;
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
            streakAtRisk: false,
            canFreeze: false,
        };
    }

    // Calculate new streak
    let newStreak: number;
    let streakAtRisk = false;
    let canFreeze = false;
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const yesterdayStr = yesterday.toISOString().split("T")[0];

    if (lastActive === yesterdayStr) {
        // Continue streak
        newStreak = currentStreak + 1;
    } else if (currentStreak > 0 && lastActive) {
        // Streak broken — check for freeze
        const freezeInfo = await checkStreakFreeze(userId);
        if (freezeInfo.canFreeze) {
            // Don't reset yet — let the user decide via modal
            streakAtRisk = true;
            canFreeze = true;
            return {
                streakCount: currentStreak,
                isNewDay: true,
                milestoneReached: null,
                xpBonus: 0,
                streakAtRisk,
                canFreeze,
            };
        }
        // No freeze available — reset streak
        newStreak = 1;
    } else {
        // First day or no active streak
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
        streakAtRisk: false,
        canFreeze: false,
    };
}

// ---------------------------------------------------------------------------
// Streak freeze
// ---------------------------------------------------------------------------

export interface StreakFreezeInfo {
    canFreeze: boolean;
    alreadyUsedThisWeek: boolean;
    streakAtRisk: boolean;
    streakCount: number;
}

function getWeekStart(date: Date): string {
    const d = new Date(date);
    const day = d.getDay();
    const diff = d.getDate() - day + (day === 0 ? -6 : 1); // Monday
    d.setDate(diff);
    return d.toISOString().split("T")[0];
}

export async function checkStreakFreeze(userId: string): Promise<StreakFreezeInfo> {
    const supabase = await createClient();

    const { data: profile } = await supabase
        .from("profiles")
        .select("streak_count, streak_last_active")
        .eq("id", userId)
        .single();

    const today = new Date();
    const todayStr = today.toISOString().split("T")[0];
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    const yesterdayStr = yesterday.toISOString().split("T")[0];
    const weekStart = getWeekStart(today);

    const lastActive = profile?.streak_last_active || null;
    const streakCount = profile?.streak_count || 0;

    // Is streak at risk? (last active not today or yesterday)
    const streakAtRisk = streakCount > 0 && lastActive !== todayStr && lastActive !== yesterdayStr;

    // Check if freeze already used this week
    const { data: existingFreeze } = await supabase
        .from("streak_freezes")
        .select("id")
        .eq("user_id", userId)
        .eq("week_start", weekStart)
        .limit(1)
        .single();

    const alreadyUsedThisWeek = !!existingFreeze;
    const canFreeze = streakAtRisk && !alreadyUsedThisWeek;

    return { canFreeze, alreadyUsedThisWeek, streakAtRisk, streakCount };
}

export async function useStreakFreeze(userId: string): Promise<{ success: boolean; message: string }> {
    const supabase = await createClient();

    const freezeInfo = await checkStreakFreeze(userId);

    if (!freezeInfo.streakAtRisk) {
        return { success: false, message: "Стрик не под угрозой" };
    }

    if (freezeInfo.alreadyUsedThisWeek) {
        return { success: false, message: "Freeze уже использован на этой неделе" };
    }

    const today = new Date();
    const weekStart = getWeekStart(today);
    const todayStr = today.toISOString().split("T")[0];

    // Insert freeze record
    const { error } = await supabase.from("streak_freezes").insert({
        user_id: userId,
        used_at: todayStr,
        week_start: weekStart,
    });

    if (error) {
        if (error.code === "23505") {
            return { success: false, message: "Freeze уже использован на этой неделе" };
        }
        throw error;
    }

    // Preserve streak — update last_active to yesterday to prevent reset
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    const yesterdayStr = yesterday.toISOString().split("T")[0];

    await supabase
        .from("profiles")
        .update({
            streak_last_active: yesterdayStr,
            updated_at: new Date().toISOString(),
        })
        .eq("id", userId);

    return { success: true, message: `❄️ Стрик заморожен! ${freezeInfo.streakCount} дней сохранено.` };
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

