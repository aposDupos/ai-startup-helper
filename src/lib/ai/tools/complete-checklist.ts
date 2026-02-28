/**
 * Agent Tool: complete_checklist_item
 * Marks a checklist item as completed in the project's progress_data.
 */

import { createClient } from "@/lib/supabase/server";
import type { StageKey, ProgressData } from "@/types/project";
import { getNextStage } from "@/types/project";
import { gamificationAction } from "@/lib/gamification/check-after-action";

export interface CompleteChecklistInput {
    projectId: string;
    stage: StageKey;
    itemKey: string;
}

export interface CompleteChecklistResult {
    success: boolean;
    completedItems?: string[];
    stageAdvanced?: boolean;
    newStage?: string;
    xpGained?: number;
    leveledUp?: boolean;
    newLevel?: number;
    error?: string;
}

export const completeChecklistToolDefinition = {
    name: "complete_checklist_item",
    description:
        "Отмечает пункт чеклиста как выполненный. Используй когда пользователь выполнил задание или ты помог ему завершить шаг. Передай stage и itemKey.",
    parameters: {
        type: "object",
        properties: {
            projectId: {
                type: "string",
                description: "UUID проекта пользователя",
            },
            stage: {
                type: "string",
                enum: ["idea", "validation", "business_model", "mvp", "pitch"],
                description: "Стадия, к которой относится пункт",
            },
            itemKey: {
                type: "string",
                description: "Ключ пункта чеклиста (например: define_problem, target_audience)",
            },
        },
        required: ["projectId", "stage", "itemKey"],
    },
} as const;

export async function executeCompleteChecklist(
    input: CompleteChecklistInput
): Promise<CompleteChecklistResult> {
    try {
        const supabase = await createClient();

        // Get user ID for gamification
        const { data: { user } } = await supabase.auth.getUser();
        const userId = user?.id;

        const { data: project, error: fetchErr } = await supabase
            .from("projects")
            .select("progress_data, stage")
            .eq("id", input.projectId)
            .single();

        if (fetchErr) throw fetchErr;

        const progressData: ProgressData =
            (project.progress_data as ProgressData) || {};
        const stageProgress = progressData[input.stage] || {
            status: "in_progress" as const,
            completedItems: [],
        };

        if (!stageProgress.completedItems.includes(input.itemKey)) {
            stageProgress.completedItems.push(input.itemKey);
        }

        progressData[input.stage] = stageProgress;

        // Check if all items in this stage are completed
        const { data: stageItems } = await supabase
            .from("stage_checklists")
            .select("item_key")
            .eq("stage", input.stage);

        const allItemKeys = (stageItems || []).map((s) => s.item_key);
        const allDone = allItemKeys.length > 0 &&
            allItemKeys.every((k) => stageProgress.completedItems.includes(k));

        let stageAdvanced = false;
        let newStage: string | null = project.stage;

        if (allDone) {
            stageProgress.status = "completed";
            stageProgress.completedAt = new Date().toISOString();

            const nextStage = getNextStage(input.stage);
            if (nextStage && project.stage === input.stage) {
                newStage = nextStage;
                stageAdvanced = true;
                const ns: StageKey = nextStage;
                progressData[ns] = progressData[ns] || {
                    status: "in_progress",
                    completedItems: [],
                    startedAt: new Date().toISOString(),
                };
            }
        }

        const { error: updateErr } = await supabase
            .from("projects")
            .update({
                progress_data: progressData as unknown as Record<string, unknown>,
                stage: newStage,
                updated_at: new Date().toISOString(),
            })
            .eq("id", input.projectId);

        if (updateErr) throw updateErr;

        // Award XP for checklist item completion
        let xpGained = 0;
        let leveledUp = false;
        let resultLevel = 0;
        if (userId) {
            const itemResult = await gamificationAction(
                userId, 15, "checklist", input.itemKey, "Checklist item completed"
            );
            xpGained = 15;
            leveledUp = itemResult.xpResult.leveledUp;
            resultLevel = itemResult.xpResult.newLevel;

            // Bonus XP for completing entire stage
            if (allDone) {
                const stageResult = await gamificationAction(
                    userId, 50, "stage_complete", input.stage, `Stage ${input.stage} completed`
                );
                xpGained += 50;
                leveledUp = leveledUp || stageResult.xpResult.leveledUp;
                resultLevel = stageResult.xpResult.newLevel;
            }
        }

        return {
            success: true,
            completedItems: stageProgress.completedItems,
            stageAdvanced,
            newStage: stageAdvanced ? (newStage ?? undefined) : undefined,
            xpGained,
            leveledUp,
            newLevel: resultLevel || undefined,
        };
    } catch (err) {
        console.error("[CompleteChecklistTool] Error:", err);
        return {
            success: false,
            error: err instanceof Error ? err.message : "Unknown error",
        };
    }
}
