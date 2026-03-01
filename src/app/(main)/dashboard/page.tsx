import { createClient } from "@/lib/supabase/server";
import {
    Star,
    Flame,
    Lightbulb,
    MessageSquareText,
} from "lucide-react";
import Link from "next/link";
import { JourneyMap } from "@/components/project/JourneyMap";
import { CreateProjectWidget } from "@/components/project/CreateProjectWidget";
import { TeamSection } from "@/components/project/TeamSection";
import { ProjectPassport } from "@/components/project/ProjectPassport";
import { MicroLessonCard } from "@/components/learning/MicroLessonCard";
import { ScorecardRadar } from "@/components/project/ScorecardRadar";
import { ScorecardHistory } from "@/components/project/ScorecardHistory";
import { getStageChecklists, getLessonsMap } from "./actions";
import { getRandomMicroLesson } from "@/app/(main)/learning/actions";
import { saveScorecard } from "@/lib/scoring/scorecard";
import { PublishButton } from "@/components/social/PublishButton";
import { DailyQuestCard } from "@/components/gamification/DailyQuestCard";
import { StreakFreezeWrapper } from "@/components/gamification/StreakFreezeWrapper";
import { WeeklyReportCard } from "@/components/gamification/WeeklyReportCard";
import { generateDailyQuest, getQuestActionUrl } from "@/lib/gamification/daily-quest";
import { checkStreakFreeze } from "@/lib/gamification/streaks";
import { getWeeklyReport, shouldShowWeeklyReport } from "@/lib/reporting/weekly";
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

    // Micro lesson for dashboard
    const microLesson = await getRandomMicroLesson();

    // Compute and save scorecard
    let scorecardData = null;
    let scorecardHistory: { score: number; created_at: string }[] = [];
    if (activeProject) {
        scorecardData = await saveScorecard(activeProject.id);

        // Fetch scorecard history
        const { data: historyData } = await supabase
            .from("scorecard_history")
            .select("score, created_at")
            .eq("project_id", activeProject.id)
            .order("created_at", { ascending: true })
            .limit(30);

        scorecardHistory = historyData || [];
    }

    // Daily Quest
    let dailyQuest = null;
    let questActionUrl = "/dashboard";
    if (activeProject) {
        try {
            dailyQuest = await generateDailyQuest(user!.id, activeProject.id);
            questActionUrl = await getQuestActionUrl(dailyQuest);
        } catch {
            // Quest generation may fail on edge cases, ignore
        }
    }

    // Streak freeze check
    let freezeInfo = null;
    try {
        freezeInfo = await checkStreakFreeze(user!.id);
    } catch {
        // Ignore
    }

    // Weekly report (show on Mondays)
    let weeklyReport = null;
    if (activeProject) {
        try {
            const showReport = await shouldShowWeeklyReport(user!.id);
            if (showReport) {
                weeklyReport = await getWeeklyReport(user!.id, activeProject.id);
            }
        } catch {
            // Ignore
        }
    }

    // Fetch review notifications for user's project
    let reviewNotifications: { id: string; artifact_type: string; reviewCount: number }[] = [];
    if (activeProject) {
        const { data: requests } = await supabase
            .from("review_requests")
            .select("id, artifact_type")
            .eq("project_id", activeProject.id)
            .eq("author_id", user!.id)
            .in("status", ["reviewed", "open"]);

        if (requests && requests.length > 0) {
            const requestIds = requests.map((r) => r.id);
            const { data: reviews } = await supabase
                .from("reviews")
                .select("request_id")
                .in("request_id", requestIds);

            const countMap = new Map<string, number>();
            for (const r of reviews || []) {
                countMap.set(r.request_id, (countMap.get(r.request_id) || 0) + 1);
            }

            reviewNotifications = requests
                .filter((r) => (countMap.get(r.id) || 0) > 0)
                .map((r) => ({
                    id: r.id,
                    artifact_type: r.artifact_type,
                    reviewCount: countMap.get(r.id) || 0,
                }));
        }
    }

    const progressData: ProgressData =
        (activeProject?.progress_data as ProgressData) || {};
    const currentStage: StageKey =
        (activeProject?.stage as StageKey) || "idea";
    const teamMembers: TeamMember[] =
        (activeProject?.team_members as TeamMember[]) || [];
    const projectArtifacts: Record<string, unknown> =
        (activeProject?.artifacts as Record<string, unknown>) || {};

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
                {activeProject && (
                    <div className="mt-3 flex items-center gap-3 flex-wrap">
                        <PublishButton
                            projectId={activeProject.id}
                            initialIsPublic={activeProject.is_public || false}
                        />
                    </div>
                )}
            </div>

            {/* Review Notifications */}
            {reviewNotifications.length > 0 && (
                <div className="animate-fade-in space-y-2">
                    {reviewNotifications.map((notif) => {
                        const artifactLabel = notif.artifact_type === "bmc" ? "BMC" : notif.artifact_type === "vpc" ? "VPC" : "Pitch";
                        return (
                            <Link
                                key={notif.id}
                                href={`/discover/review/${notif.id}`}
                                className="flex items-center gap-3 p-4 rounded-xl border border-primary-200 bg-primary-50/50 hover:bg-primary-50 transition-colors shadow-sm group"
                            >
                                <div className="w-10 h-10 rounded-full bg-primary-100 flex items-center justify-center">
                                    <MessageSquareText size={20} strokeWidth={1.75} className="text-primary-600" />
                                </div>
                                <div className="flex-1">
                                    <p className="text-body-sm font-semibold text-surface-900">
                                        У вас {notif.reviewCount} {notif.reviewCount === 1 ? "новое ревью" : "новых ревью"} на {artifactLabel}
                                    </p>
                                    <p className="text-caption text-surface-500">
                                        Посмотрите, что написали коллеги
                                    </p>
                                </div>
                                <span className="text-body-sm font-medium text-primary-500 group-hover:text-primary-600 transition-colors">
                                    Открыть →
                                </span>
                            </Link>
                        );
                    })}
                </div>
            )}

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

                    {/* Daily Quest */}
                    {dailyQuest && (
                        <DailyQuestCard
                            quest={dailyQuest}
                            actionUrl={questActionUrl}
                        />
                    )}

                    {/* Project Passport */}
                    <ProjectPassport
                        artifacts={projectArtifacts}
                        currentStage={currentStage}
                    />

                    {/* Scorecard section */}
                    {scorecardData && (
                        <div className="grid md:grid-cols-2 gap-4">
                            <ScorecardRadar
                                criteria={scorecardData.criteria}
                                total={scorecardData.total}
                            />
                            <ScorecardHistory history={scorecardHistory} />
                        </div>
                    )}

                    {/* Weekly Report (Mondays) */}
                    {weeklyReport && (
                        <WeeklyReportCard report={weeklyReport} />
                    )}

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

                    {/* Micro-lesson of the day */}
                    {microLesson && (
                        <div className="p-6 rounded-xl bg-surface-0 border border-surface-200 shadow-sm">
                            <div className="flex items-center gap-2 mb-3">
                                <span className="text-lg">📖</span>
                                <h3 className="text-h4 text-surface-900">Мини-урок дня</h3>
                            </div>
                            <MicroLessonCard
                                lesson={microLesson}
                                isCompleted={false}
                            />
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

                    {/* Streak Freeze Modal */}
                    {freezeInfo && freezeInfo.streakAtRisk && (
                        <StreakFreezeWrapper
                            streakCount={freezeInfo.streakCount}
                            streakAtRisk={freezeInfo.streakAtRisk}
                            alreadyUsedThisWeek={freezeInfo.alreadyUsedThisWeek}
                        />
                    )}
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
