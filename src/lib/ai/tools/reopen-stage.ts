/**
 * Agent Tool: reopen_stage
 * Marks a stage as needs_revision so the user can revisit it.
 */

import { createClient } from "@/lib/supabase/server";
import type { StageKey, ProgressData } from "@/types/project";

export interface ReopenStageInput {
    projectId: string;
    stage: StageKey;
}

export interface ReopenStageResult {
    success: boolean;
    error?: string;
}

export const reopenStageToolDefinition = {
    name: "reopen_stage",
    description:
        "Переоткрывает ранее завершённую стадию для доработки. Используй когда AI обнаружил, что предыдущий этап нуждается в ревизии (например, гипотезы не подтвердились после CustDev).",
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
                description: "Стадия, которую нужно переоткрыть",
            },
        },
        required: ["projectId", "stage"],
    },
} as const;

export async function executeReopenStage(
    input: ReopenStageInput
): Promise<ReopenStageResult> {
    try {
        const supabase = await createClient();

        const { data: project, error: fetchErr } = await supabase
            .from("projects")
            .select("progress_data")
            .eq("id", input.projectId)
            .single();

        if (fetchErr) throw fetchErr;

        const progressData: ProgressData =
            (project.progress_data as ProgressData) || {};

        progressData[input.stage] = {
            status: "needs_revision",
            completedItems: progressData[input.stage]?.completedItems || [],
            startedAt: progressData[input.stage]?.startedAt,
        };

        const { error: updateErr } = await supabase
            .from("projects")
            .update({
                progress_data: progressData as unknown as Record<string, unknown>,
                updated_at: new Date().toISOString(),
            })
            .eq("id", input.projectId);

        if (updateErr) throw updateErr;

        return { success: true };
    } catch (err) {
        console.error("[ReopenStageTool] Error:", err);
        return {
            success: false,
            error: err instanceof Error ? err.message : "Unknown error",
        };
    }
}
