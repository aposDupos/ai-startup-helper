"use server";

import { createClient } from "@/lib/supabase/server";
import { awardXP } from "./xp";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface Achievement {
    id: string;
    slug: string;
    title: string;
    description: string;
    icon: string | null;
    xp_reward: number;
    category: string;
    criteria: { type: string; value: number | string };
}

export interface UserAchievement extends Achievement {
    earned: boolean;
    earned_at: string | null;
}

// ---------------------------------------------------------------------------
// Check and unlock achievements
// ---------------------------------------------------------------------------

export async function checkAchievements(userId: string): Promise<UserAchievement[]> {
    const supabase = await createClient();

    // Get all achievements
    const { data: achievements } = await supabase
        .from("achievements")
        .select("*")
        .order("category");

    // Get user's earned achievements
    const { data: earned } = await supabase
        .from("user_achievements")
        .select("achievement_id, earned_at")
        .eq("user_id", userId);

    const earnedMap = new Map(
        (earned || []).map((e) => [e.achievement_id, e.earned_at])
    );

    // Get user stats for criteria checking
    const { data: profile } = await supabase
        .from("profiles")
        .select("xp, level, streak_count")
        .eq("id", userId)
        .single();

    const { data: projects } = await supabase
        .from("projects")
        .select("id, stage, bmc_data")
        .eq("owner_id", userId);

    const { data: lessonProgress } = await supabase
        .from("user_lesson_progress")
        .select("lesson_id")
        .eq("user_id", userId)
        .eq("status", "completed");

    const { data: pitchDecks } = await supabase
        .from("pitch_decks")
        .select("training_results")
        .in("project_id", (projects || []).map((p) => p.id));

    // Evaluate criteria
    const result: UserAchievement[] = [];
    const newUnlocks: Achievement[] = [];

    for (const ach of (achievements || []) as Achievement[]) {
        const isEarned = earnedMap.has(ach.id);
        let shouldUnlock = false;

        if (!isEarned) {
            shouldUnlock = evaluateCriteria(ach.criteria, {
                projectCount: (projects || []).length,
                stages: (projects || []).map((p) => p.stage),
                bmcData: projects?.[0]?.bmc_data as Record<string, unknown[]> | null,
                level: profile?.level || 1,
                streak: profile?.streak_count || 0,
                lessonsCompleted: (lessonProgress || []).length,
                pitchTrainingCompleted: (pitchDecks || []).some(
                    (d) => d.training_results != null
                ),
            });

            if (shouldUnlock) {
                newUnlocks.push(ach);
            }
        }

        result.push({
            ...ach,
            earned: isEarned || shouldUnlock,
            earned_at: earnedMap.get(ach.id) || (shouldUnlock ? new Date().toISOString() : null),
        });
    }

    // Unlock new achievements
    for (const ach of newUnlocks) {
        await unlockAchievement(userId, ach.id, ach.xp_reward);
    }

    return result;
}

// ---------------------------------------------------------------------------
// Evaluate criteria
// ---------------------------------------------------------------------------

interface CriteriaContext {
    projectCount: number;
    stages: string[];
    bmcData: Record<string, unknown[]> | null;
    level: number;
    streak: number;
    lessonsCompleted: number;
    pitchTrainingCompleted: boolean;
}

function evaluateCriteria(
    criteria: { type: string; value: number | string },
    ctx: CriteriaContext
): boolean {
    switch (criteria.type) {
        case "project_count":
            return ctx.projectCount >= (criteria.value as number);

        case "stage_reached":
            return ctx.stages.includes(criteria.value as string);

        case "bmc_blocks_filled":
            if (!ctx.bmcData) return false;
            const filled = Object.values(ctx.bmcData).filter(
                (notes) => Array.isArray(notes) && notes.length > 0
            ).length;
            return filled >= (criteria.value as number);

        case "level_reached":
            return ctx.level >= (criteria.value as number);

        case "streak":
            return ctx.streak >= (criteria.value as number);

        case "lesson_count":
            return ctx.lessonsCompleted >= (criteria.value as number);

        case "pitch_training_completed":
            return ctx.pitchTrainingCompleted;

        default:
            return false;
    }
}

// ---------------------------------------------------------------------------
// Unlock achievement
// ---------------------------------------------------------------------------

async function unlockAchievement(
    userId: string,
    achievementId: string,
    xpReward: number
) {
    const supabase = await createClient();

    // Insert user_achievement
    await supabase.from("user_achievements").insert({
        user_id: userId,
        achievement_id: achievementId,
    });

    // Award XP for achievement
    if (xpReward > 0) {
        await awardXP(userId, xpReward, "achievement", achievementId, "Achievement unlocked");
    }
}

// ---------------------------------------------------------------------------
// Get user achievements with status
// ---------------------------------------------------------------------------

export async function getUserAchievements(userId: string): Promise<UserAchievement[]> {
    return checkAchievements(userId);
}
