"use server";

import { createClient } from "@/lib/supabase/server";
import type { ProgressData, StageKey, TeamMember } from "@/types/project";
import { getNextStage } from "@/types/project";

// ---------------------------------------------------------------------------
// Checklist items
// ---------------------------------------------------------------------------

export async function getStageChecklists() {
    const supabase = await createClient();
    const { data, error } = await supabase
        .from("stage_checklists")
        .select("*")
        .order("sort_order", { ascending: true });

    if (error) throw error;
    return data;
}

// ---------------------------------------------------------------------------
// Toggle checklist item
// ---------------------------------------------------------------------------

export async function toggleChecklistItem(
    projectId: string,
    stageKey: StageKey,
    itemKey: string
) {
    const supabase = await createClient();

    // Get current progress_data
    const { data: project, error: fetchErr } = await supabase
        .from("projects")
        .select("progress_data, stage")
        .eq("id", projectId)
        .single();

    if (fetchErr) throw fetchErr;

    const progressData: ProgressData = (project.progress_data as ProgressData) || {};
    const stageProgress = progressData[stageKey] || {
        status: "in_progress" as const,
        completedItems: [],
    };

    const completedItems = stageProgress.completedItems || [];
    const isCompleted = completedItems.includes(itemKey);

    if (isCompleted) {
        stageProgress.completedItems = completedItems.filter((k) => k !== itemKey);
        // If unchecking, revert status from completed
        if (stageProgress.status === "completed") {
            stageProgress.status = "in_progress";
        }
    } else {
        stageProgress.completedItems = [...completedItems, itemKey];
    }

    progressData[stageKey] = stageProgress;

    // Check if all items in this stage are now completed
    const { data: stageItems } = await supabase
        .from("stage_checklists")
        .select("item_key")
        .eq("stage", stageKey);

    const allItemKeys = (stageItems || []).map((s) => s.item_key);
    const allDone = allItemKeys.length > 0 &&
        allItemKeys.every((k) => stageProgress.completedItems.includes(k));

    // Auto-advance to next stage if all items completed
    let newStage: string | null = project.stage;
    if (allDone && !isCompleted) {
        stageProgress.status = "completed";
        stageProgress.completedAt = new Date().toISOString();

        const nextStage = getNextStage(stageKey);
        if (nextStage && project.stage === stageKey) {
            newStage = nextStage;
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
        .eq("id", projectId);

    if (updateErr) throw updateErr;

    return { progressData, stageAdvanced: newStage !== project.stage, newStage };
}

// ---------------------------------------------------------------------------
// Get project progress
// ---------------------------------------------------------------------------

export async function getProjectProgress(projectId: string) {
    const supabase = await createClient();
    const { data, error } = await supabase
        .from("projects")
        .select("progress_data, stage, team_members")
        .eq("id", projectId)
        .single();

    if (error) throw error;
    return {
        progressData: (data.progress_data as ProgressData) || {},
        stage: (data.stage as StageKey) || "idea",
        teamMembers: (data.team_members as TeamMember[]) || [],
    };
}

// ---------------------------------------------------------------------------
// Team members
// ---------------------------------------------------------------------------

export async function addTeamMember(
    projectId: string,
    member: Omit<TeamMember, "id">
) {
    const supabase = await createClient();

    const { data: project, error: fetchErr } = await supabase
        .from("projects")
        .select("team_members")
        .eq("id", projectId)
        .single();

    if (fetchErr) throw fetchErr;

    const members: TeamMember[] = (project.team_members as TeamMember[]) || [];
    const newMember: TeamMember = {
        id: crypto.randomUUID(),
        ...member,
    };
    members.push(newMember);

    const { error: updateErr } = await supabase
        .from("projects")
        .update({
            team_members: members as unknown as Record<string, unknown>[],
            updated_at: new Date().toISOString(),
        })
        .eq("id", projectId);

    if (updateErr) throw updateErr;
    return members;
}

export async function removeTeamMember(projectId: string, memberId: string) {
    const supabase = await createClient();

    const { data: project, error: fetchErr } = await supabase
        .from("projects")
        .select("team_members")
        .eq("id", projectId)
        .single();

    if (fetchErr) throw fetchErr;

    const members: TeamMember[] = (project.team_members as TeamMember[]) || [];
    const updated = members.filter((m) => m.id !== memberId);

    const { error: updateErr } = await supabase
        .from("projects")
        .update({
            team_members: updated as unknown as Record<string, unknown>[],
            updated_at: new Date().toISOString(),
        })
        .eq("id", projectId);

    if (updateErr) throw updateErr;
    return updated;
}
