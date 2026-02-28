import Link from "next/link";
import { BookOpen, Clock, Star, CheckCircle2, Sparkles } from "lucide-react";
import { getAllLessonsGrouped, getRecommendedLesson } from "./actions";
import { MicroLessonCard } from "@/components/learning/MicroLessonCard";
import type { StageGroup, LessonWithProgress } from "./actions";

export default async function LearningPage() {
    const { groups, totalCompleted, totalLessons } =
        await getAllLessonsGrouped();
    const recommended = await getRecommendedLesson();

    return (
        <div className="space-y-8 animate-fade-in">
            {/* Header */}
            <div>
                <h1 className="text-h1 text-surface-900">📚 Обучение</h1>
                <p className="text-body text-surface-500 mt-1">
                    {totalCompleted} из {totalLessons} уроков завершено
                </p>
                {/* Progress bar */}
                <div className="w-full max-w-md h-2 rounded-full bg-surface-100 mt-3">
                    <div
                        className="h-2 rounded-full transition-all"
                        style={{
                            width: `${totalLessons > 0 ? (totalCompleted / totalLessons) * 100 : 0}%`,
                            background:
                                "linear-gradient(90deg, var(--color-primary-400), var(--color-primary-600))",
                        }}
                    />
                </div>
            </div>

            {/* AI Recommendation */}
            {recommended && (
                <div
                    className="p-6 rounded-xl border-2 border-primary-200 shadow-sm"
                    style={{
                        background:
                            "linear-gradient(135deg, var(--color-primary-50), var(--color-surface-0))",
                    }}
                >
                    <div className="flex items-center gap-2 mb-3">
                        <Sparkles
                            size={20}
                            strokeWidth={1.75}
                            className="text-primary-500"
                        />
                        <h2 className="text-h3 text-surface-900">
                            ⭐ Рекомендуем
                        </h2>
                    </div>
                    <p className="text-body-sm text-surface-600 mb-4">
                        На основе вашего прогресса, рекомендуем пройти этот урок
                        следующим.
                    </p>
                    <RecommendedLessonCard lesson={recommended} />
                </div>
            )}

            {/* Stage Groups */}
            {groups.map((group) => (
                <StageSection key={group.key} group={group} recommendedId={recommended?.id} />
            ))}
        </div>
    );
}

// ---------------------------------------------------------------------------
// Stage Section
// ---------------------------------------------------------------------------

function StageSection({
    group,
    recommendedId,
}: {
    group: StageGroup;
    recommendedId?: string;
}) {
    const completed = group.lessons.filter(
        (l) => l.progress?.status === "completed"
    ).length;

    return (
        <section>
            <div className="flex items-center gap-2 mb-4">
                <span className="text-2xl">{group.emoji}</span>
                <h2 className="text-h2 text-surface-900">{group.label}</h2>
                <span className="text-caption text-surface-400 ml-2">
                    {completed}/{group.lessons.length} пройдено
                </span>
            </div>
            <div className="grid gap-3">
                {group.lessons.map((lesson) => (
                    <LessonRow
                        key={lesson.id}
                        lesson={lesson}
                        isRecommended={lesson.id === recommendedId}
                    />
                ))}
            </div>
        </section>
    );
}

// ---------------------------------------------------------------------------
// Lesson Row
// ---------------------------------------------------------------------------

function LessonRow({
    lesson,
    isRecommended,
}: {
    lesson: LessonWithProgress;
    isRecommended: boolean;
}) {
    const isCompleted = lesson.progress?.status === "completed";
    const isMicro = lesson.type === "micro";

    if (isMicro) {
        return (
            <div
                className={`${isRecommended ? "ring-2 ring-primary-300 ring-offset-2" : ""} rounded-xl`}
            >
                <MicroLessonCard lesson={lesson} isCompleted={isCompleted} />
            </div>
        );
    }

    return (
        <Link
            href={`/learning/${lesson.id}`}
            className={`flex items-center justify-between p-4 rounded-xl border transition-all hover:shadow-md hover:-translate-y-0.5 ${isCompleted
                    ? "border-success-500/30 bg-success-500/3"
                    : isRecommended
                        ? "border-primary-300 bg-primary-50/50 ring-2 ring-primary-200 ring-offset-1"
                        : "border-surface-200 bg-surface-0"
                }`}
        >
            <div className="flex items-center gap-3">
                <div
                    className={`w-10 h-10 rounded-lg flex items-center justify-center ${isCompleted
                            ? "bg-success-500/10"
                            : "bg-primary-500/10"
                        }`}
                >
                    {isCompleted ? (
                        <CheckCircle2
                            size={20}
                            className="text-success-500"
                            strokeWidth={1.75}
                        />
                    ) : (
                        <BookOpen
                            size={20}
                            className="text-primary-500"
                            strokeWidth={1.75}
                        />
                    )}
                </div>
                <div>
                    <p className="text-body font-medium text-surface-900">
                        {lesson.title}
                    </p>
                    <div className="flex items-center gap-3 mt-0.5">
                        <span className="flex items-center gap-1 text-caption text-surface-400">
                            <Clock size={12} />
                            {lesson.estimated_minutes} мин
                        </span>
                        <span
                            className="text-caption font-semibold px-2 py-0.5 rounded-full"
                            style={{
                                backgroundColor: "var(--color-primary-50)",
                                color: "var(--color-primary-600)",
                            }}
                        >
                            FULL
                        </span>
                        {isCompleted && lesson.progress?.score != null && (
                            <span className="flex items-center gap-1 text-caption text-success-600 font-medium">
                                <Star size={12} />
                                {lesson.progress.score}%
                            </span>
                        )}
                    </div>
                </div>
            </div>
            {isRecommended && !isCompleted && (
                <span className="text-caption font-semibold text-primary-500">
                    ⭐ Следующий
                </span>
            )}
        </Link>
    );
}

// ---------------------------------------------------------------------------
// Recommended Lesson Card (compact preview)
// ---------------------------------------------------------------------------

function RecommendedLessonCard({
    lesson,
}: {
    lesson: LessonWithProgress;
}) {
    const isMicro = lesson.type === "micro";

    if (isMicro) {
        return <MicroLessonCard lesson={lesson} isCompleted={false} />;
    }

    return (
        <Link
            href={`/learning/${lesson.id}`}
            className="flex items-center gap-3 p-4 rounded-xl border border-primary-200 bg-surface-0 hover:shadow-md hover:-translate-y-0.5 transition-all"
        >
            <div className="w-10 h-10 rounded-lg flex items-center justify-center bg-primary-500/10">
                <BookOpen
                    size={20}
                    className="text-primary-500"
                    strokeWidth={1.75}
                />
            </div>
            <div className="flex-1">
                <p className="text-body font-medium text-surface-900">
                    {lesson.title}
                </p>
                <div className="flex items-center gap-3 mt-0.5">
                    <span className="flex items-center gap-1 text-caption text-surface-400">
                        <Clock size={12} />
                        {lesson.estimated_minutes} мин
                    </span>
                    <span
                        className="text-caption font-semibold px-2 py-0.5 rounded-full"
                        style={{
                            backgroundColor: "var(--color-primary-50)",
                            color: "var(--color-primary-600)",
                        }}
                    >
                        {isMicro ? "MICRO" : "FULL"}
                    </span>
                </div>
            </div>
            <span className="text-body-sm font-medium text-primary-600">
                Начать →
            </span>
        </Link>
    );
}
