import { createClient } from "@/lib/supabase/server";
import {
    Star,
    Flame,
    Lightbulb,
} from "lucide-react";
import { JourneyMap } from "@/components/project/JourneyMap";
import { CreateProjectWidget } from "@/components/project/CreateProjectWidget";
import { TeamSection } from "@/components/project/TeamSection";
import { getStageChecklists, getLessonsMap } from "./actions";
import type {
    ProgressData,
    StageKey,
    TeamMember,
    ChecklistItemData,
} from "@/types/project";

export default async function DashboardPage() {
    const supabase = await createClient();
    const {
        data: { user },
    } = await supabase.auth.getUser();

    const { data: profile } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", user!.id)
        .single();

    const { data: projects } = await supabase
        .from("projects")
        .select("*")
        .eq("owner_id", user!.id)
        .eq("is_active", true)
        .limit(1);

    const activeProject = projects?.[0];

    // Load checklists for Journey Map
    let checklists: ChecklistItemData[] = [];
    let lessonsMap: Record<string, any> = {};
    let completedLessonIds: string[] = [];
    if (activeProject) {
        checklists = (await getStageChecklists()) as ChecklistItemData[];
        const lessonsData = await getLessonsMap();
        lessonsMap = lessonsData.lessons;
        completedLessonIds = lessonsData.completedIds;
    }

    const progressData: ProgressData =
        (activeProject?.progress_data as ProgressData) || {};
    const currentStage: StageKey =
        (activeProject?.stage as StageKey) || "idea";
    const teamMembers: TeamMember[] =
        (activeProject?.team_members as TeamMember[]) || [];

    return (
        <div className="space-y-6">
            {/* Welcome Header */}
            <div className="animate-fade-in">
                <h1 className="text-h1 text-surface-900">
                    Привет, {profile?.display_name || "Основатель"}! 🚀
                </h1>
                <p className="text-body text-surface-500 mt-1">
                    {activeProject
                        ? `Продолжай работу над «${activeProject.title}»`
                        : "Начни свой путь в мире стартапов"}
                </p>
            </div>

            {activeProject ? (
                <>
                    {/* Journey Map */}
                    <JourneyMap
                        currentStage={currentStage}
                        progressData={progressData}
                        projectId={activeProject.id}
                        checklists={checklists}
                        lessons={lessonsMap}
                        completedLessonIds={completedLessonIds}
                    />

                    {/* AI Recommendation + Team row */}
                    <div className="grid md:grid-cols-2 gap-4">
                        {/* AI Recommendation */}
                        <div className="p-6 rounded-xl bg-surface-0 border border-surface-200 shadow-sm">
                            <div className="flex items-center gap-2 mb-3">
                                <span className="text-lg">🤖</span>
                                <h3 className="text-h4 text-surface-900">Что дальше?</h3>
                            </div>
                            <p className="text-body-sm text-surface-600">
                                {getRecommendation(currentStage, progressData, checklists)}
                            </p>
                        </div>

                        {/* Team Section */}
                        <TeamSection
                            projectId={activeProject.id}
                            initialMembers={teamMembers}
                        />
                    </div>

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
                                    <span
                                        className="text-body-sm font-bold"
                                        style={{
                                            fontFamily: "var(--font-mono)",
                                            color: "var(--color-accent-500)",
                                        }}
                                    >
                                        {profile?.xp || 0} XP
                                    </span>
                                </div>
                            </div>
                            <div className="flex items-center gap-3 mb-3">
                                <div
                                    className="w-12 h-12 rounded-full flex items-center justify-center text-white text-h4 font-bold"
                                    style={{
                                        background:
                                            "linear-gradient(135deg, var(--color-primary-400), var(--color-primary-600))",
                                        boxShadow: "var(--shadow-glow-primary)",
                                    }}
                                >
                                    {profile?.level || 1}
                                </div>
                                <div>
                                    <p className="text-body-sm font-semibold text-surface-900">
                                        Уровень {profile?.level || 1}
                                    </p>
                                    <p className="text-caption text-surface-400">
                                        Ещё {1000 - ((profile?.xp || 0) % 1000)} XP до следующего
                                    </p>
                                </div>
                            </div>
                            <div className="w-full h-2 rounded-full bg-surface-100">
                                <div
                                    className="h-2 rounded-full transition-all"
                                    style={{
                                        width: `${((profile?.xp || 0) % 1000) / 10}%`,
                                        background:
                                            "linear-gradient(90deg, var(--color-primary-400), var(--color-primary-600))",
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
                                    <p
                                        className="text-h2"
                                        style={{
                                            fontFamily: "var(--font-mono)",
                                            color: "var(--color-surface-900)",
                                        }}
                                    >
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
            ) : (
                /* No project — show entry points */
                <CreateProjectWidget />
            )}
        </div>
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
            (item) => !progressData[currentStage]?.completedItems?.includes(item.item_key)
        );
        const next = remaining[0];
        return `Отлично, ${completed} из ${total} сделано! Следующий шаг: «${next?.label}».`;
    }

    return "Все пункты текущей стадии выполнены! Пора переходить к следующему этапу. 🎉";
}
