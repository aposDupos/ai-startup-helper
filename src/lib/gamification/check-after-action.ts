"use server";

import { awardXP, type AwardXPResult } from "./xp";
import { checkAchievements, type UserAchievement } from "./achievements";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface GamificationActionResult {
    xpResult: AwardXPResult;
    unlockedAchievements: UserAchievement[];
}

// ---------------------------------------------------------------------------
// Wrapper: award XP + check achievements
// ---------------------------------------------------------------------------

/**
 * Unified gamification action: awards XP and then checks for new achievements.
 * Use this instead of calling awardXP() directly so achievements are always checked.
 */
export async function gamificationAction(
    userId: string,
    amount: number,
    source: string,
    sourceId?: string,
    description?: string
): Promise<GamificationActionResult> {
    // 1. Award XP
    const xpResult = await awardXP(userId, amount, source, sourceId, description);

    // 2. Check achievements (will auto-unlock any newly earned ones)
    const allAchievements = await checkAchievements(userId);
    const unlockedAchievements = allAchievements.filter(
        (a) => a.earned && a.earned_at !== null && isRecentlyUnlocked(a.earned_at)
    );

    return { xpResult, unlockedAchievements };
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/**
 * Check if an achievement was unlocked in the last 10 seconds
 * (i.e., unlocked during this action, not previously).
 */
function isRecentlyUnlocked(earnedAt: string): boolean {
    const earned = new Date(earnedAt).getTime();
    const now = Date.now();
    return now - earned < 10_000;
}
