/**
 * Agent Tool: save_idea
 * Saves a startup idea to the user's project in Supabase.
 */

import { createClient } from "@/lib/supabase/server";

export interface SaveIdeaInput {
    title: string;
    description: string;
}

export interface SaveIdeaResult {
    success: boolean;
    projectId?: string;
    error?: string;
}

export const saveIdeaToolDefinition = {
    name: "save_idea",
    description:
        "Сохраняет идею стартапа в профиль пользователя. Вызывай когда пользователь готов зафиксировать свою идею.",
    parameters: {
        type: "object",
        properties: {
            title: {
                type: "string",
                description: "Краткое название идеи (до 100 символов)",
            },
            description: {
                type: "string",
                description: "Описание идеи: что за продукт, какую проблему решает, кто целевая аудитория",
            },
        },
        required: ["title", "description"],
    },
} as const;

export async function executeSaveIdea(
    input: SaveIdeaInput,
    userId: string
): Promise<SaveIdeaResult> {
    try {
        const supabase = await createClient();

        // Check if user already has an active project
        const { data: existingProject } = await supabase
            .from("projects")
            .select("id")
            .eq("owner_id", userId)
            .eq("is_active", true)
            .single();

        if (existingProject) {
            // Update existing project with new idea
            const { error } = await supabase
                .from("projects")
                .update({
                    title: input.title,
                    description: input.description,
                    updated_at: new Date().toISOString(),
                })
                .eq("id", existingProject.id);

            if (error) throw error;
            return { success: true, projectId: existingProject.id };
        }

        // Create new project
        const { data, error } = await supabase
            .from("projects")
            .insert({
                owner_id: userId,
                title: input.title,
                description: input.description,
                stage: "idea",
                is_active: true,
                progress_data: {
                    idea: {
                        status: "in_progress",
                        completedItems: ["save_idea"],
                        startedAt: new Date().toISOString(),
                    },
                },
            })
            .select("id")
            .single();

        if (error) throw error;
        return { success: true, projectId: data.id };
    } catch (err) {
        console.error("[SaveIdeaTool] Error:", err);
        return {
            success: false,
            error: err instanceof Error ? err.message : "Unknown error",
        };
    }
}
