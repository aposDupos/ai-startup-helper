/**
 * Agent Tool: create_project_with_stage
 * Creates a new project with a specific stage determined by AI.
 */

import { createClient } from "@/lib/supabase/server";
import type { StageKey, ProgressData } from "@/types/project";

export interface CreateProjectInput {
    title: string;
    description: string;
    stage: StageKey;
}

export interface CreateProjectResult {
    success: boolean;
    projectId?: string;
    stage?: StageKey;
    error?: string;
}

export const createProjectToolDefinition = {
    name: "create_project_with_stage",
    description:
        "Создаёт новый стартап-проект с определённой стадией. Используй когда пользователь описал идею/проект и нужно создать проект. Определи стадию на основе описания: idea (только идея), validation (уже общались с клиентами), business_model (есть бизнес-модель), mvp (есть продукт), pitch (готов к питчу).",
    parameters: {
        type: "object",
        properties: {
            title: {
                type: "string",
                description: "Краткое название проекта (до 100 символов)",
            },
            description: {
                type: "string",
                description: "Описание проекта: что за продукт, какую проблему решает, кто целевая аудитория",
            },
            stage: {
                type: "string",
                enum: ["idea", "validation", "business_model", "mvp", "pitch"],
                description: "Стадия проекта, определённая на основе описания пользователя",
            },
        },
        required: ["title", "description", "stage"],
    },
} as const;

export async function executeCreateProject(
    input: CreateProjectInput,
    userId: string
): Promise<CreateProjectResult> {
    try {
        const supabase = await createClient();

        // Build initial progress_data based on stage
        const progressData: ProgressData = {};
        const stages: StageKey[] = ["idea", "validation", "business_model", "mvp", "pitch"];
        const stageIndex = stages.indexOf(input.stage);

        // Mark earlier stages as completed
        for (let i = 0; i < stageIndex; i++) {
            progressData[stages[i]] = {
                status: "completed",
                completedItems: [],
                completedAt: new Date().toISOString(),
            };
        }

        // Current stage is in_progress
        progressData[input.stage] = {
            status: "in_progress",
            completedItems: [],
            startedAt: new Date().toISOString(),
        };

        // Deactivate existing projects
        await supabase
            .from("projects")
            .update({ is_active: false })
            .eq("owner_id", userId)
            .eq("is_active", true);

        // Create new project
        const { data, error } = await supabase
            .from("projects")
            .insert({
                owner_id: userId,
                title: input.title,
                description: input.description,
                stage: input.stage,
                progress_data: progressData as unknown as Record<string, unknown>,
                is_active: true,
            })
            .select("id")
            .single();

        if (error) throw error;
        return { success: true, projectId: data.id, stage: input.stage };
    } catch (err) {
        console.error("[CreateProjectTool] Error:", err);
        return {
            success: false,
            error: err instanceof Error ? err.message : "Unknown error",
        };
    }
}
