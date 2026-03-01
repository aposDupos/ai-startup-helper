"use server";

import { createClient } from "@/lib/supabase/server";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface WeeklyReport {
    xpEarned: number;
    lessonsCompleted: number;
    checklistItemsDone: number;
    scoreDelta: number | null;
    currentScore: number | null;
    streakDays: number;
    questsCompleted: number;
    summary: string;
    recommendation: string;
    weekStart: string;
    weekEnd: string;
}

// ---------------------------------------------------------------------------
// Get weekly report
// ---------------------------------------------------------------------------

export async function getWeeklyReport(
    userId: string,
    projectId: string
): Promise<WeeklyReport | null> {
    const supabase = await createClient();

    const now = new Date();
    const dayOfWeek = now.getDay();

    // Show report on Mondays or first visit of the week
    // Calculate current week boundaries (Monday-Sunday)
    const monday = new Date(now);
    monday.setDate(now.getDate() - (dayOfWeek === 0 ? 6 : dayOfWeek - 1));
    monday.setHours(0, 0, 0, 0);

    // Last week boundaries
    const lastMonday = new Date(monday);
    lastMonday.setDate(lastMonday.getDate() - 7);
    const lastSunday = new Date(monday);
    lastSunday.setDate(lastSunday.getDate() - 1);
    lastSunday.setHours(23, 59, 59, 999);

    const weekStart = lastMonday.toISOString().split("T")[0];
    const weekEnd = lastSunday.toISOString().split("T")[0];

    // 1. XP earned last week
    const { data: xpData } = await supabase
        .from("xp_transactions")
        .select("amount")
        .eq("user_id", userId)
        .gte("created_at", lastMonday.toISOString())
        .lte("created_at", lastSunday.toISOString());

    const xpEarned = (xpData || []).reduce((sum, t) => sum + (t.amount || 0), 0);

    // 2. Lessons completed last week
    const { data: lessonsData } = await supabase
        .from("user_lesson_progress")
        .select("id")
        .eq("user_id", userId)
        .eq("status", "completed")
        .gte("updated_at", lastMonday.toISOString())
        .lte("updated_at", lastSunday.toISOString());

    const lessonsCompleted = lessonsData?.length || 0;

    // 3. Score delta (compare scorecard_history entries)
    const { data: scoreHistory } = await supabase
        .from("scorecard_history")
        .select("score, created_at")
        .eq("project_id", projectId)
        .gte("created_at", lastMonday.toISOString())
        .order("created_at", { ascending: true });

    let scoreDelta: number | null = null;
    let currentScore: number | null = null;
    if (scoreHistory && scoreHistory.length > 0) {
        const firstScore = scoreHistory[0].score;
        const lastScore = scoreHistory[scoreHistory.length - 1].score;
        scoreDelta = lastScore - firstScore;
        currentScore = lastScore;
    } else {
        // Get latest score
        const { data: latestScore } = await supabase
            .from("scorecard_history")
            .select("score")
            .eq("project_id", projectId)
            .order("created_at", { ascending: false })
            .limit(1)
            .single();
        currentScore = latestScore?.score || null;
    }

    // 4. Streak
    const { data: profile } = await supabase
        .from("profiles")
        .select("streak_count")
        .eq("id", userId)
        .single();

    const streakDays = profile?.streak_count || 0;

    // 5. Quests completed last week
    const { data: questsData } = await supabase
        .from("daily_quests")
        .select("id")
        .eq("user_id", userId)
        .eq("completed", true)
        .gte("quest_date", weekStart)
        .lte("quest_date", weekEnd);

    const questsCompleted = questsData?.length || 0;

    // 6. Checklist items done (approximate via project progress changes)
    // We don't track per-item timestamps, so estimate from XP source
    const { data: checklistXP } = await supabase
        .from("xp_transactions")
        .select("id")
        .eq("user_id", userId)
        .in("source", ["checklist", "stage_complete"])
        .gte("created_at", lastMonday.toISOString())
        .lte("created_at", lastSunday.toISOString());

    const checklistItemsDone = checklistXP?.length || 0;

    // Generate summary text
    const summary = generateSummary({
        xpEarned,
        lessonsCompleted,
        checklistItemsDone,
        scoreDelta,
        questsCompleted,
        streakDays,
    });

    const recommendation = generateRecommendation({
        xpEarned,
        lessonsCompleted,
        checklistItemsDone,
        scoreDelta,
        questsCompleted,
        streakDays,
    });

    return {
        xpEarned,
        lessonsCompleted,
        checklistItemsDone,
        scoreDelta,
        currentScore,
        streakDays,
        questsCompleted,
        summary,
        recommendation,
        weekStart,
        weekEnd,
    };
}

// ---------------------------------------------------------------------------
// Summary generation (template-based, no AI dependency)
// ---------------------------------------------------------------------------

interface StatsInput {
    xpEarned: number;
    lessonsCompleted: number;
    checklistItemsDone: number;
    scoreDelta: number | null;
    questsCompleted: number;
    streakDays: number;
}

function generateSummary(stats: StatsInput): string {
    const parts: string[] = [];

    if (stats.xpEarned > 0) {
        parts.push(`Ты заработал ${stats.xpEarned} XP`);
    }
    if (stats.lessonsCompleted > 0) {
        parts.push(`прошёл ${stats.lessonsCompleted} ${pluralize(stats.lessonsCompleted, "урок", "урока", "уроков")}`);
    }
    if (stats.checklistItemsDone > 0) {
        parts.push(`выполнил ${stats.checklistItemsDone} ${pluralize(stats.checklistItemsDone, "пункт", "пункта", "пунктов")} чеклиста`);
    }
    if (stats.questsCompleted > 0) {
        parts.push(`завершил ${stats.questsCompleted} ${pluralize(stats.questsCompleted, "квест", "квеста", "квестов")}`);
    }

    if (parts.length === 0) {
        return "На прошлой неделе не было активности. Не переживай, начни с малого! 💪";
    }

    let text = parts.join(", ") + ".";
    text = text.charAt(0).toUpperCase() + text.slice(1);

    if (stats.scoreDelta !== null && stats.scoreDelta > 0) {
        text += ` Скор проекта вырос на +${stats.scoreDelta}! 📈`;
    } else if (stats.scoreDelta !== null && stats.scoreDelta < 0) {
        text += ` Скор проекта снизился на ${stats.scoreDelta}. Давай исправим! 💪`;
    }

    if (stats.streakDays >= 7) {
        text += ` 🔥 Серия ${stats.streakDays} дней — впечатляет!`;
    }

    return text;
}

function generateRecommendation(stats: StatsInput): string {
    if (stats.xpEarned === 0 && stats.lessonsCompleted === 0) {
        return "Попробуй выполнять квест дня — это лёгкий способ войти в ритм и зарабатывать XP каждый день.";
    }

    if (stats.lessonsCompleted === 0 && stats.checklistItemsDone > 0) {
        return "Ты хорошо двигаешься по чеклисту! Попробуй пройти пару уроков — они помогут глубже понять каждый шаг.";
    }

    if (stats.lessonsCompleted > 0 && stats.checklistItemsDone === 0) {
        return "Отлично учишься! Теперь примени знания — выполни пару пунктов из чеклиста текущей стадии.";
    }

    if (stats.questsCompleted < 3) {
        return "Выполняй квесты дня чаще — это simple way зарабатывать XP и не ломать серию! 🎯";
    }

    if (stats.scoreDelta !== null && stats.scoreDelta <= 0) {
        return "Сфокусируйся на незаполненных блоках BMC и проработке целевой аудитории — это быстро повысит Score.";
    }

    return "Продолжай в том же духе! Ты на отличном пути. Попробуй оставить ревью на проект другого участника — это полезно для обоих! 🤝";
}

function pluralize(n: number, one: string, few: string, many: string): string {
    const abs = Math.abs(n) % 100;
    const last = abs % 10;
    if (abs > 10 && abs < 20) return many;
    if (last > 1 && last < 5) return few;
    if (last === 1) return one;
    return many;
}

// ---------------------------------------------------------------------------
// Check if should show report (Monday or first visit of the week)
// ---------------------------------------------------------------------------

export async function shouldShowWeeklyReport(userId: string): Promise<boolean> {
    const now = new Date();
    const dayOfWeek = now.getDay();

    // Show on Monday (1) or Sunday (0)
    if (dayOfWeek !== 1 && dayOfWeek !== 0) return false;

    // Check if already dismissed this week (we'll use a simple approach:
    // if it's Monday, always show; users can dismiss client-side)
    return true;
}
