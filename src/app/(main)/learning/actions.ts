"use server";

import { createClient } from "@/lib/supabase/server";
import { gamificationAction } from "@/lib/gamification/check-after-action";
import type { Lesson, UserLessonProgress } from "@/types/lesson";
import type { StageKey } from "@/types/project";
import { STAGES } from "@/types/project";

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

// ---------------------------------------------------------------------------
// Learning overview page helpers
// ---------------------------------------------------------------------------

export interface LessonWithProgress extends Lesson {
    progress: UserLessonProgress | null;
}

export interface StageGroup {
    key: StageKey;
    label: string;
    emoji: string;
    lessons: LessonWithProgress[];
}

/**
 * Fetch ALL lessons, grouped by stage, with user progress attached.
 */
export async function getAllLessonsGrouped(): Promise<{
    groups: StageGroup[];
    totalCompleted: number;
    totalLessons: number;
}> {
    const supabase = await createClient();
    const {
        data: { user },
    } = await supabase.auth.getUser();

    if (!user) throw new Error("Unauthorized");

    const { data: lessons, error } = await supabase
        .from("lessons")
        .select("*")
        .order("sort_order");

    if (error) throw error;

    const { data: progress } = await supabase
        .from("user_lesson_progress")
        .select("*")
        .eq("user_id", user.id);

    const progressMap = new Map(
        (progress || []).map((p) => [p.lesson_id, p as UserLessonProgress])
    );

    const lessonsWithProgress: LessonWithProgress[] = (lessons || []).map(
        (l) => ({
            ...(l as Lesson),
            progress: progressMap.get(l.id) || null,
        })
    );

    const totalCompleted = lessonsWithProgress.filter(
        (l) => l.progress?.status === "completed"
    ).length;

    const groups: StageGroup[] = STAGES.map((stage) => ({
        key: stage.key,
        label: stage.label,
        emoji: stage.emoji,
        lessons: lessonsWithProgress.filter((l) => l.stage === stage.key),
    })).filter((g) => g.lessons.length > 0);

    return {
        groups,
        totalCompleted,
        totalLessons: lessonsWithProgress.length,
    };
}

/**
 * Pick the recommended next lesson based on the user's project stage.
 */
export async function getRecommendedLesson(): Promise<LessonWithProgress | null> {
    const supabase = await createClient();
    const {
        data: { user },
    } = await supabase.auth.getUser();

    if (!user) return null;

    const { data: projects } = await supabase
        .from("projects")
        .select("stage")
        .eq("owner_id", user.id)
        .eq("is_active", true)
        .limit(1);

    const currentStage = (projects?.[0]?.stage as StageKey) || "idea";

    const { data: lessons } = await supabase
        .from("lessons")
        .select("*")
        .order("sort_order");

    const { data: progress } = await supabase
        .from("user_lesson_progress")
        .select("*")
        .eq("user_id", user.id);

    const progressMap = new Map(
        (progress || []).map((p) => [p.lesson_id, p as UserLessonProgress])
    );

    const lessonsWithProgress: LessonWithProgress[] = (lessons || []).map(
        (l) => ({
            ...(l as Lesson),
            progress: progressMap.get(l.id) || null,
        })
    );

    // First: try current stage
    const stageLesson = lessonsWithProgress.find(
        (l) => l.stage === currentStage && l.progress?.status !== "completed"
    );
    if (stageLesson) return stageLesson;

    // Fallback: any uncompleted lesson
    return (
        lessonsWithProgress.find(
            (l) => l.progress?.status !== "completed"
        ) || null
    );
}

/**
 * Get a random uncompleted micro lesson for dashboard display.
 */
export async function getRandomMicroLesson(): Promise<LessonWithProgress | null> {
    const supabase = await createClient();
    const {
        data: { user },
    } = await supabase.auth.getUser();

    if (!user) return null;

    const { data: lessons } = await supabase
        .from("lessons")
        .select("*")
        .eq("type", "micro")
        .order("sort_order");

    if (!lessons || lessons.length === 0) return null;

    const { data: progress } = await supabase
        .from("user_lesson_progress")
        .select("*")
        .eq("user_id", user.id);

    const completedIds = new Set(
        (progress || [])
            .filter((p) => p.status === "completed")
            .map((p) => p.lesson_id)
    );

    const uncompleted = (lessons || []).filter(
        (l) => !completedIds.has(l.id)
    );

    if (uncompleted.length === 0) return null;

    const randomIndex = Math.floor(Math.random() * uncompleted.length);
    const picked = uncompleted[randomIndex];

    const progressMap = new Map(
        (progress || []).map((p) => [p.lesson_id, p as UserLessonProgress])
    );

    return {
        ...(picked as Lesson),
        progress: progressMap.get(picked.id) || null,
    };
}
