"use server";

import { createClient } from "@/lib/supabase/server";
import { gamificationAction } from "@/lib/gamification/check-after-action";

/**
 * Mark a lesson as completed and store the quiz score.
 */
export async function completeLessonProgress(
    lessonId: string,
    score: number
) {
    const supabase = await createClient();
    const {
        data: { user },
    } = await supabase.auth.getUser();

    if (!user) throw new Error("Unauthorized");

    const { error } = await supabase.from("user_lesson_progress").upsert(
        {
            user_id: user.id,
            lesson_id: lessonId,
            status: "completed",
            score,
            completed_at: new Date().toISOString(),
        },
        { onConflict: "user_id,lesson_id" }
    );

    if (error) throw error;

    // Award XP for lesson completion + check achievements
    const xpAmount = score >= 70 ? 50 : 25; // more XP for good scores
    const { xpResult, unlockedAchievements } = await gamificationAction(
        user.id,
        xpAmount,
        "lesson",
        lessonId,
        "Lesson completed"
    );

    return {
        xpGained: xpAmount,
        leveledUp: xpResult.leveledUp,
        newLevel: xpResult.newLevel,
        unlockedAchievements: unlockedAchievements.map((a) => ({
            title: a.title,
            icon: a.icon,
        })),
    };
}

/**
 * Get lessons for a specific stage with user progress.
 */
export async function getStageLessons(stage: string) {
    const supabase = await createClient();
    const {
        data: { user },
    } = await supabase.auth.getUser();

    if (!user) throw new Error("Unauthorized");

    const { data: lessons, error } = await supabase
        .from("lessons")
        .select("*")
        .eq("stage", stage)
        .order("sort_order");

    if (error) throw error;

    // Get user progress for these lessons
    const lessonIds = (lessons || []).map((l) => l.id);
    const { data: progress } = await supabase
        .from("user_lesson_progress")
        .select("*")
        .eq("user_id", user.id)
        .in("lesson_id", lessonIds);

    const progressMap = new Map(
        (progress || []).map((p) => [p.lesson_id, p])
    );

    return (lessons || []).map((lesson) => ({
        ...lesson,
        progress: progressMap.get(lesson.id) || null,
    }));
}
