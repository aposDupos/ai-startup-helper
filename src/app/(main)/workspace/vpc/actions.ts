"use server";

import { createClient } from "@/lib/supabase/server";
import type { VPCData } from "@/types/workspace";
import type { ProgressData } from "@/types/project";

// ---------------------------------------------------------------------------
// Save VPC Data (autosave)
// ---------------------------------------------------------------------------

export async function saveVPCData(projectId: string, vpcData: VPCData) {
    const supabase = await createClient();

    // Count filled zones for progress
    const filledZones = Object.values(vpcData).filter(
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

    const bmProgress = progressData.business_model || {
        status: "in_progress" as const,
        completedItems: [],
    };

    // Mark fill_vpc as completed if all 6 zones have at least 1 note
    if (filledZones >= 6 && !bmProgress.completedItems.includes("fill_vpc")) {
        bmProgress.completedItems = [...bmProgress.completedItems, "fill_vpc"];
    } else if (
        filledZones < 6 &&
        bmProgress.completedItems.includes("fill_vpc")
    ) {
        bmProgress.completedItems = bmProgress.completedItems.filter(
            (k) => k !== "fill_vpc"
        );
    }

    progressData.business_model = bmProgress;

    const { error: updateErr } = await supabase
        .from("projects")
        .update({
            vpc_data: vpcData as unknown as Record<string, unknown>,
            progress_data: progressData as unknown as Record<string, unknown>,
            updated_at: new Date().toISOString(),
        })
        .eq("id", projectId);

    if (updateErr) throw updateErr;

    return { filledZones };
}
