"use server";

import { createClient } from "@/lib/supabase/server";
import { gamificationAction } from "./check-after-action";
import type { StageKey } from "@/types/project";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export type QuestType = "lesson" | "bmc_block" | "checklist_item" | "peer_review" | "quiz";

export interface DailyQuest {
    id: string;
    user_id: string;
    project_id: string | null;
    quest_type: QuestType;
    quest_target: string;
    quest_label: string;
    xp_reward: number;
    completed: boolean;
    completed_at: string | null;
    created_at: string;
}

// ---------------------------------------------------------------------------
// Quest generation templates per type
// ---------------------------------------------------------------------------

interface QuestTemplate {
    type: QuestType;
    target: string;
    label: string;
    actionUrl: string;
}

function getQuestCandidates(
    stage: StageKey,
    completedItems: string[],
    allChecklistItems: { item_key: string; label: string; stage: StageKey }[],
    completedLessonIds: string[],
    allLessons: { id: string; title: string; stage: string }[],
    bmcData: Record<string, unknown> | null
): QuestTemplate[] {
    const candidates: QuestTemplate[] = [];

    // 1. Uncompleted checklist items for current stage
    const stageItems = allChecklistItems.filter((c) => c.stage === stage);
    for (const item of stageItems) {
        if (!completedItems.includes(item.item_key)) {
            candidates.push({
                type: "checklist_item",
                target: item.item_key,
                label: `Выполни: «${item.label}»`,
                actionUrl: "/dashboard",
            });
        }
    }

    // 2. Uncompleted lessons for current stage
    const stageLessons = allLessons.filter((l) => l.stage === stage);
    for (const lesson of stageLessons) {
        if (!completedLessonIds.includes(lesson.id)) {
            candidates.push({
                type: "lesson",
                target: lesson.id,
                label: `Пройди урок: «${lesson.title}»`,
                actionUrl: `/learning/${lesson.id}`,
            });
        }
    }

    // 3. Empty BMC blocks (if at business_model stage or later)
    if (stage === "business_model" || stage === "mvp" || stage === "pitch") {
        const bmcKeys = [
            { key: "key_partners", label: "Ключевые партнёры" },
            { key: "key_activities", label: "Ключевые активности" },
            { key: "key_resources", label: "Ключевые ресурсы" },
            { key: "value_propositions", label: "Ценностное предложение" },
            { key: "customer_relationships", label: "Отношения с клиентами" },
            { key: "channels", label: "Каналы" },
            { key: "customer_segments", label: "Сегменты клиентов" },
            { key: "cost_structure", label: "Структура издержек" },
            { key: "revenue_streams", label: "Потоки доходов" },
        ];

        for (const block of bmcKeys) {
            const val = bmcData?.[block.key];
            const isEmpty = !val || (Array.isArray(val) && val.length === 0) ||
                (typeof val === "string" && val.trim() === "");
            if (isEmpty) {
                candidates.push({
                    type: "bmc_block",
                    target: block.key,
                    label: `Заполни блок BMC: «${block.label}»`,
                    actionUrl: "/workspace/bmc",
                });
            }
        }
    }

    // 4. Peer review (always available)
    candidates.push({
        type: "peer_review",
        target: "any",
        label: "Оставь ревью на проект другого участника",
        actionUrl: "/discover",
    });

    return candidates;
}

// ---------------------------------------------------------------------------
// Get today's quest (or null)
// ---------------------------------------------------------------------------

export async function getTodayQuest(userId: string): Promise<DailyQuest | null> {
    const supabase = await createClient();
    const today = new Date().toISOString().split("T")[0];

    const { data } = await supabase
        .from("daily_quests")
        .select("*")
        .eq("user_id", userId)
        .eq("quest_date", today)
        .limit(1)
        .single();

    return (data as DailyQuest) || null;
}

// ---------------------------------------------------------------------------
// Generate daily quest
// ---------------------------------------------------------------------------

export async function generateDailyQuest(
    userId: string,
    projectId: string
): Promise<DailyQuest> {
    const supabase = await createClient();

    // Check if quest already exists for today
    const existing = await getTodayQuest(userId);
    if (existing) return existing;

    // Fetch project data
    const { data: project } = await supabase
        .from("projects")
        .select("stage, progress_data, bmc_data")
        .eq("id", projectId)
        .single();

    const stage = (project?.stage as StageKey) || "idea";
    const progressData = (project?.progress_data as Record<string, { completedItems?: string[] }>) || {};
    const completedItems = progressData[stage]?.completedItems || [];
    const bmcData = (project?.bmc_data as Record<string, unknown>) || null;

    // Fetch checklists
    const { data: checklists } = await supabase
        .from("stage_checklists")
        .select("item_key, label, stage")
        .order("sort_order");

    // Fetch lessons
    const { data: lessons } = await supabase
        .from("lessons")
        .select("id, title, stage")
        .order("sort_order");

    // Fetch completed lessons
    const { data: lessonProgress } = await supabase
        .from("user_lesson_progress")
        .select("lesson_id")
        .eq("user_id", userId)
        .eq("status", "completed");

    const completedLessonIds = (lessonProgress || []).map((p) => p.lesson_id);

    // Get yesterday's quest type to avoid repeating
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const yesterdayStr = yesterday.toISOString().split("T")[0];

    const { data: yesterdayQuest } = await supabase
        .from("daily_quests")
        .select("quest_type")
        .eq("user_id", userId)
        .eq("quest_date", yesterdayStr)
        .limit(1)
        .single();

    const yesterdayType = yesterdayQuest?.quest_type || null;

    // Build candidates
    const allCandidates = getQuestCandidates(
        stage,
        completedItems,
        (checklists || []) as { item_key: string; label: string; stage: StageKey }[],
        completedLessonIds,
        (lessons || []) as { id: string; title: string; stage: string }[],
        bmcData
    );

    // Filter out yesterday's type if possible
    let candidates = allCandidates.filter((c) => c.type !== yesterdayType);
    if (candidates.length === 0) candidates = allCandidates;

    // Pick a random candidate
    const pick = candidates[Math.floor(Math.random() * candidates.length)] || {
        type: "lesson" as QuestType,
        target: "any",
        label: "Загляни в раздел обучения и пройди урок",
        actionUrl: "/learning",
    };

    // Insert quest
    const { data: quest, error } = await supabase
        .from("daily_quests")
        .insert({
            user_id: userId,
            project_id: projectId,
            quest_type: pick.type,
            quest_target: pick.target,
            quest_label: pick.label,
            xp_reward: 15,
        })
        .select()
        .single();

    if (error) {
        // Likely race condition — quest was already created
        const fallback = await getTodayQuest(userId);
        if (fallback) return fallback;
        throw error;
    }

    return quest as DailyQuest;
}

// ---------------------------------------------------------------------------
// Complete daily quest
// ---------------------------------------------------------------------------

export async function completeDailyQuest(
    userId: string,
    questId: string
): Promise<{ success: boolean; xpAwarded: number }> {
    const supabase = await createClient();

    // Verify quest belongs to user and is not completed
    const { data: quest } = await supabase
        .from("daily_quests")
        .select("*")
        .eq("id", questId)
        .eq("user_id", userId)
        .eq("completed", false)
        .single();

    if (!quest) {
        return { success: false, xpAwarded: 0 };
    }

    // Mark complete
    await supabase
        .from("daily_quests")
        .update({
            completed: true,
            completed_at: new Date().toISOString(),
        })
        .eq("id", questId);

    // Award XP
    await gamificationAction(
        userId,
        quest.xp_reward || 15,
        "daily_quest",
        questId,
        `Daily quest completed: ${quest.quest_label}`
    );

    return { success: true, xpAwarded: quest.xp_reward || 15 };
}

// ---------------------------------------------------------------------------
// Get quest action URL based on type
// ---------------------------------------------------------------------------

export async function getQuestActionUrl(quest: DailyQuest): Promise<string> {
    switch (quest.quest_type) {
        case "lesson":
            return `/learning/${quest.quest_target}`;
        case "bmc_block":
            return "/workspace/bmc";
        case "checklist_item":
            return "/dashboard";
        case "peer_review":
            return "/discover";
        case "quiz":
            return "/learning";
        default:
            return "/dashboard";
    }
}
