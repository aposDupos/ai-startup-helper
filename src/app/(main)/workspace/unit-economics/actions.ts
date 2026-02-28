"use server";

import { createClient } from "@/lib/supabase/server";
import type { UnitEconomicsData } from "@/types/workspace";
import type { ProgressData } from "@/types/project";

// ---------------------------------------------------------------------------
// Save Unit Economics Data
// ---------------------------------------------------------------------------

export async function saveUnitEconomics(
    projectId: string,
    data: UnitEconomicsData
) {
    const supabase = await createClient();

    // Get current progress
    const { data: project, error: fetchErr } = await supabase
        .from("projects")
        .select("progress_data")
        .eq("id", projectId)
        .single();

    if (fetchErr) throw fetchErr;

    const progressData: ProgressData =
        (project.progress_data as ProgressData) || {};

    const bmProgress = progressData.business_model || {
        status: "in_progress" as const,
        completedItems: [],
    };

    // Mark unit_economics as completed if all key fields are filled
    const isComplete =
        data.cac != null && data.arpu != null && data.churn != null;

    if (
        isComplete &&
        !bmProgress.completedItems.includes("unit_economics")
    ) {
        bmProgress.completedItems = [
            ...bmProgress.completedItems,
            "unit_economics",
        ];
    } else if (
        !isComplete &&
        bmProgress.completedItems.includes("unit_economics")
    ) {
        bmProgress.completedItems = bmProgress.completedItems.filter(
            (k) => k !== "unit_economics"
        );
    }

    progressData.business_model = bmProgress;

    const { error: updateErr } = await supabase
        .from("projects")
        .update({
            unit_economics: data as unknown as Record<string, unknown>,
            progress_data: progressData as unknown as Record<string, unknown>,
            updated_at: new Date().toISOString(),
        })
        .eq("id", projectId);

    if (updateErr) throw updateErr;
}
