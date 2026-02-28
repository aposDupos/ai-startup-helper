/**
 * Agent Tool: update_project_artifacts
 * Saves structured data (problem, target audience, hypotheses, etc.)
 * from chat conversations into the project.
 * Also auto-completes the corresponding checklist item.
 */

import { createClient } from "@/lib/supabase/server";
import { executeCompleteChecklist } from "./complete-checklist";
import type { StageKey } from "@/types/project";

export interface UpdateProjectArtifactsInput {
    projectId: string;
    field: string;
    value: string;
}

export interface UpdateProjectArtifactsResult {
    success: boolean;
    field?: string;
    checklistCompleted?: string;
    error?: string;
}

// Map artifact fields to checklist items for auto-completion
const ARTIFACT_TO_CHECKLIST: Record<string, { stage: StageKey; itemKey: string }> = {
    problem: { stage: "idea", itemKey: "define_problem" },
    target_audience: { stage: "idea", itemKey: "target_audience" },
    idea_formulation: { stage: "idea", itemKey: "formulate_idea" },
    hypotheses: { stage: "validation", itemKey: "custdev_questions" },
    custdev_results: { stage: "validation", itemKey: "analyze_results" },
    competitors: { stage: "validation", itemKey: "analyze_results" },
    unique_value: { stage: "business_model", itemKey: "fill_vpc" },
    revenue_model: { stage: "business_model", itemKey: "revenue_model" },
    mvp_features: { stage: "mvp", itemKey: "define_features" },
};

export async function executeUpdateProjectArtifacts(
    input: UpdateProjectArtifactsInput
): Promise<UpdateProjectArtifactsResult> {
    try {
        const supabase = await createClient();

        // Get current artifacts
        const { data: project, error: fetchErr } = await supabase
            .from("projects")
            .select("artifacts")
            .eq("id", input.projectId)
            .single();

        if (fetchErr) throw fetchErr;

        const artifacts = (project.artifacts as Record<string, unknown>) || {};

        // Update the specific field
        // For hypotheses, append to array
        if (input.field === "hypotheses") {
            const existing = (artifacts.hypotheses as string[]) || [];
            if (!existing.includes(input.value)) {
                existing.push(input.value);
            }
            artifacts.hypotheses = existing;
        } else {
            artifacts[input.field] = input.value;
        }

        // Save updated artifacts
        const { error: updateErr } = await supabase
            .from("projects")
            .update({
                artifacts,
                updated_at: new Date().toISOString(),
            })
            .eq("id", input.projectId);

        if (updateErr) throw updateErr;

        // Auto-complete the corresponding checklist item
        let checklistCompleted: string | undefined;
        const mapping = ARTIFACT_TO_CHECKLIST[input.field];
        if (mapping) {
            try {
                await executeCompleteChecklist({
                    projectId: input.projectId,
                    stage: mapping.stage,
                    itemKey: mapping.itemKey,
                });
                checklistCompleted = mapping.itemKey;
            } catch (err) {
                console.warn("[UpdateArtifacts] Checklist auto-complete failed:", err);
            }
        }

        return {
            success: true,
            field: input.field,
            checklistCompleted,
        };
    } catch (err) {
        console.error("[UpdateProjectArtifacts] Error:", err);
        return {
            success: false,
            error: err instanceof Error ? err.message : "Unknown error",
        };
    }
}
