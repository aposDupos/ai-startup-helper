import { createClient } from "@/lib/supabase/server";
import { getLevelInfo } from "@/lib/gamification/levels";
import { Star, Flame } from "lucide-react";
import { ProjectPassport } from "@/components/project/ProjectPassport";
import { TeamSection } from "@/components/project/TeamSection";
import { MicroLessonCard } from "@/components/learning/MicroLessonCard";
import { getRandomMicroLesson } from "@/app/(main)/learning/actions";
import { getStageChecklists } from "../actions";
import type {
    ProgressData,
    StageKey,
    TeamMember,
    ChecklistItemData,
} from "@/types/project";

export async function ProjectContentSection() {
    const supabase = await createClient();
    const {
        data: { user },
    } = await supabase.auth.getUser();
    if (!user) return null;

    const { data: projects } = await supabase
        .from("projects")
        .select("id, stage, progress_data, team_members, artifacts")
        .eq("owner_id", user.id)
        .eq("is_active", true)
        .limit(1);

    const activeProject = projects?.[0];
    if (!activeProject) return null;

    const { data: profile } = await supabase
        .from("profiles")
        .select("xp, level, streak_count")
        .eq("id", user.id)
        .single();

    const [checklistsRaw, microLesson, levelInfo] = await Promise.all([
        getStageChecklists(),
        getRandomMicroLesson(),
        getLevelInfo(profile?.xp || 0),
    ]);

    const checklists = checklistsRaw as ChecklistItemData[];
    const progressData: ProgressData =
        (activeProject.progress_data as ProgressData) || {};
    const currentStage: StageKey =
        (activeProject.stage as StageKey) || "idea";
    const teamMembers: TeamMember[] =
        (activeProject.team_members as TeamMember[]) || [];
    const projectArtifacts: Record<string, unknown> =
        (activeProject.artifacts as Record<string, unknown>) || {};

    return (
        <>
            {/* Project Passport */}
            <ProjectPassport
                artifacts={projectArtifacts}
                currentStage={currentStage}
            />

            {/* AI Recommendation + Team row */}
            <div className="grid md:grid-cols-2 gap-4">
                <div className="p-6 rounded-xl bg-surface-0 border border-surface-200 shadow-sm">
                    <div className="flex items-center gap-2 mb-3">
                        <span className="text-lg">🤖</span>
                        <h3 className="text-h4 text-surface-900">Что дальше?</h3>
                    </div>
                    <p className="text-body-sm text-surface-600">
                        {getRecommendation(currentStage, progressData, checklists)}
                    </p>
                </div>

                <TeamSection
                    projectId={activeProject.id}
                    initialMembers={teamMembers}
                />
            </div>

            {/* Micro-lesson of the day */}
            {microLesson && (
                <div className="p-6 rounded-xl bg-surface-0 border border-surface-200 shadow-sm">
                    <div className="flex items-center gap-2 mb-3">
                        <span className="text-lg">📖</span>
                        <h3 className="text-h4 text-surface-900">Мини-урок дня</h3>
                    </div>
                    <MicroLessonCard lesson={microLesson} isCompleted={false} />
                </div>
            )}

            {/* XP + Streak row */}
            <div className="grid md:grid-cols-2 gap-4">
                {/* XP Card */}
                <div className="p-6 rounded-xl bg-surface-0 border border-surface-200 shadow-sm">
                    <div className="flex items-center justify-between mb-3">
                        <h3 className="text-h4 text-surface-900">Прогресс</h3>
                        <div className="flex items-center gap-1.5">
                            <Star
                                size={16}
                                strokeWidth={1.75}
                                className="text-accent-500"
                            />
                            <span className="text-body-sm font-bold font-mono text-accent-500">
                                {levelInfo.currentXP} XP
                            </span>
                        </div>
                    </div>
                    <div className="flex items-center gap-3 mb-3">
                        <div className="w-12 h-12 rounded-full flex items-center justify-center text-white text-h4 font-bold bg-gradient-to-br from-primary-400 to-primary-600 shadow-glow-primary">
                            {levelInfo.icon}
                        </div>
                        <div>
                            <p className="text-body-sm font-semibold text-surface-900">
                                {levelInfo.title} (Ур. {levelInfo.level})
                            </p>
                            <p className="text-caption text-surface-400">
                                {levelInfo.nextLevelXP
                                    ? `Ещё ${levelInfo.xpRequiredForNext - levelInfo.xpIntoLevel} XP до следующего`
                                    : "Максимальный уровень!"}
                            </p>
                        </div>
                    </div>
                    <div className="w-full h-2 rounded-full bg-surface-100">
                        <div
                            className="h-2 rounded-full transition-all bg-gradient-to-r from-primary-400 to-primary-600"
                            style={{
                                width: `${levelInfo.progressPercent}%`,
                            }}
                        />
                    </div>
                </div>

                {/* Streak Card */}
                <div className="p-6 rounded-xl bg-surface-0 border border-surface-200 shadow-sm">
                    <h3 className="text-h4 text-surface-900 mb-3">Серия</h3>
                    <div className="flex items-center gap-3">
                        <span className="text-4xl animate-wiggle">🔥</span>
                        <div>
                            <p className="text-h2 font-mono text-surface-900">
                                {profile?.streak_count || 0}
                            </p>
                            <p className="text-body-sm text-surface-500">
                                {(profile?.streak_count || 0) > 0
                                    ? "дней подряд!"
                                    : "Начни серию сегодня!"}
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}

// ---------------------------------------------------------------------------
// Helper: AI recommendation based on progress
// ---------------------------------------------------------------------------

function getRecommendation(
    currentStage: StageKey,
    progressData: ProgressData,
    checklists: ChecklistItemData[]
): string {
    const stageItems = checklists.filter((c) => c.stage === currentStage);
    const completed = progressData[currentStage]?.completedItems?.length || 0;
    const total = stageItems.length;

    if (total === 0) return "Загрузи данные проекта, чтобы получить рекомендации.";

    if (completed === 0) {
        const first = stageItems[0];
        return `Начни с первого пункта: «${first.label}». Это поможет двигаться дальше!`;
    }

    if (completed < total) {
        const remaining = stageItems.filter(
            (item) =>
                !progressData[currentStage]?.completedItems?.includes(item.item_key)
        );
        const next = remaining[0];
        return `Отлично, ${completed} из ${total} сделано! Следующий шаг: «${next?.label}».`;
    }

    return "Все пункты текущей стадии выполнены! Пора переходить к следующему этапу. 🎉";
}
