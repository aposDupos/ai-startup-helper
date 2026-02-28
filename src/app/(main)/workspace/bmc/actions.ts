"use server";

import { createClient } from "@/lib/supabase/server";
import type { BMCData } from "@/types/workspace";
import type { ProgressData } from "@/types/project";
import { createGigaChatModelSync } from "@/lib/ai/config";
import { BMC_BLOCKS } from "@/types/workspace";

// ---------------------------------------------------------------------------
// Save BMC Data (autosave)
// ---------------------------------------------------------------------------

export async function saveBMCData(projectId: string, bmcData: BMCData) {
    const supabase = await createClient();

    // Count filled blocks for progress_data
    const filledBlocks = Object.values(bmcData).filter(
        (notes) => notes.length > 0
    ).length;

    // Get current progress
    const { data: project, error: fetchErr } = await supabase
        .from("projects")
        .select("progress_data")
        .eq("id", projectId)
        .single();

    if (fetchErr) throw fetchErr;

    const progressData: ProgressData =
        (project.progress_data as ProgressData) || {};

    // Update BMC-specific progress
    const bmProgress = progressData.business_model || {
        status: "in_progress" as const,
        completedItems: [],
    };

    // Mark fill_bmc as completed if all 9 blocks have at least 1 note
    if (filledBlocks >= 9 && !bmProgress.completedItems.includes("fill_bmc")) {
        bmProgress.completedItems = [...bmProgress.completedItems, "fill_bmc"];
    } else if (
        filledBlocks < 9 &&
        bmProgress.completedItems.includes("fill_bmc")
    ) {
        bmProgress.completedItems = bmProgress.completedItems.filter(
            (k) => k !== "fill_bmc"
        );
    }

    progressData.business_model = bmProgress;

    const { error: updateErr } = await supabase
        .from("projects")
        .update({
            bmc_data: bmcData as unknown as Record<string, unknown>,
            progress_data: progressData as unknown as Record<string, unknown>,
            updated_at: new Date().toISOString(),
        })
        .eq("id", projectId);

    if (updateErr) throw updateErr;

    return { filledBlocks };
}

// ---------------------------------------------------------------------------
// Get BMC Suggestions from AI
// ---------------------------------------------------------------------------

export async function getBMCSuggestions(
    projectId: string,
    blockKey: string
) {
    const supabase = await createClient();

    // Get project context
    const { data: project, error } = await supabase
        .from("projects")
        .select("title, description, bmc_data")
        .eq("id", projectId)
        .single();

    if (error) throw error;

    const blockDef = BMC_BLOCKS.find((b) => b.key === blockKey);
    if (!blockDef) throw new Error(`Unknown block: ${blockKey}`);

    const bmcData = (project.bmc_data || {}) as BMCData;
    const existingNotes = (bmcData[blockKey as keyof BMCData] || [])
        .map((n) => n.text)
        .join(", ");

    const prompt = `Ты — AI-наставник для молодых предпринимателей. 
Проект: "${project.title}" — ${project.description || "описание не указано"}.

Блок BMC: "${blockDef.label}" (${blockDef.description}).
${existingNotes ? `Уже есть: ${existingNotes}` : "Блок пока пустой."}

Предложи 3 коротких варианта для этого блока. Каждый вариант — 1-2 предложения.
Формат ответа — строго JSON массив из 3 строк:
["вариант 1", "вариант 2", "вариант 3"]`;

    try {
        const model = createGigaChatModelSync();
        const response = await model.invoke(prompt);
        const text =
            typeof response.content === "string"
                ? response.content
                : JSON.stringify(response.content);

        // Parse JSON array from response
        const jsonMatch = text.match(/\[[\s\S]*\]/);
        if (jsonMatch) {
            return JSON.parse(jsonMatch[0]) as string[];
        }
        return [text.trim()];
    } catch {
        return [
            `Подумайте о ${blockDef.label.toLowerCase()} вашего проекта`,
            "Исследуйте аналоги на рынке",
            "Спросите потенциальных клиентов",
        ];
    }
}
