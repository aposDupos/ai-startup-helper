import { createClient } from "@/lib/supabase/server";
import { JourneyMap } from "@/components/project/JourneyMap";
import { CreateProjectWidget } from "@/components/project/CreateProjectWidget";
import { getStageChecklists, getLessonsMap } from "../actions";
import type {
    ProgressData,
    StageKey,
    ChecklistItemData,
} from "@/types/project";

export async function JourneyMapSection() {
    const supabase = await createClient();
    const {
        data: { user },
    } = await supabase.auth.getUser();
    if (!user) return null;

    const { data: projects } = await supabase
        .from("projects")
        .select("id, stage, progress_data")
        .eq("owner_id", user.id)
        .eq("is_active", true)
        .limit(1);

    const activeProject = projects?.[0];

    if (!activeProject) {
        return <CreateProjectWidget />;
    }

    const [checklistsRaw, lessonsData] = await Promise.all([
        getStageChecklists(),
        getLessonsMap(),
    ]);

    const checklists = checklistsRaw as ChecklistItemData[];
    const progressData: ProgressData =
        (activeProject.progress_data as ProgressData) || {};
    const currentStage: StageKey =
        (activeProject.stage as StageKey) || "idea";

    return (
        <JourneyMap
            currentStage={currentStage}
            progressData={progressData}
            projectId={activeProject.id}
            checklists={checklists}
            lessons={lessonsData.lessons}
            completedLessonIds={lessonsData.completedIds}
        />
    );
}
