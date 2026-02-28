import Link from "next/link";
import { ArrowLeft, BookOpen, Clock, CheckCircle2, Star } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { notFound } from "next/navigation";
import { LessonContent } from "@/components/learning/LessonContent";
import { FullLessonQuiz } from "@/components/learning/FullLessonQuiz";
import type { Lesson, UserLessonProgress } from "@/types/lesson";

interface LessonPageProps {
    params: Promise<{ lessonId: string }>;
}

export default async function LessonPage({ params }: LessonPageProps) {
    const { lessonId } = await params;
    const supabase = await createClient();
    const {
        data: { user },
    } = await supabase.auth.getUser();

    if (!user) notFound();

    const { data: lesson, error } = await supabase
        .from("lessons")
        .select("*")
        .eq("id", lessonId)
        .single();

    if (error || !lesson) notFound();

    const typedLesson = lesson as unknown as Lesson;

    // Get user progress
    const { data: progress } = await supabase
        .from("user_lesson_progress")
        .select("*")
        .eq("user_id", user.id)
        .eq("lesson_id", lessonId)
        .single();

    const isCompleted = progress?.status === "completed";
    const userProgress = progress as UserLessonProgress | null;

    return (
        <div className="max-w-3xl mx-auto space-y-6 animate-fade-in">
            {/* Breadcrumb */}
            <Link
                href="/learning"
                className="inline-flex items-center gap-1.5 text-body-sm text-surface-500 hover:text-primary-600 transition-colors"
            >
                <ArrowLeft size={16} strokeWidth={1.75} />
                ← Назад к урокам
            </Link>

            {/* Lesson Header */}
            <div className="p-6 rounded-xl bg-surface-0 border border-surface-200 shadow-sm">
                <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3">
                        <div
                            className={`w-12 h-12 rounded-xl flex items-center justify-center ${isCompleted
                                    ? "bg-success-500/10"
                                    : "bg-primary-500/10"
                                }`}
                        >
                            {isCompleted ? (
                                <CheckCircle2
                                    size={24}
                                    className="text-success-500"
                                    strokeWidth={1.75}
                                />
                            ) : (
                                <BookOpen
                                    size={24}
                                    className="text-primary-500"
                                    strokeWidth={1.75}
                                />
                            )}
                        </div>
                        <div>
                            <h1 className="text-h2 text-surface-900">
                                {typedLesson.title}
                            </h1>
                            <div className="flex items-center gap-3 mt-1">
                                <span className="flex items-center gap-1 text-caption text-surface-400">
                                    <Clock size={12} />
                                    {typedLesson.estimated_minutes} мин
                                </span>
                                <span
                                    className="text-caption font-semibold px-2 py-0.5 rounded-full"
                                    style={{
                                        backgroundColor:
                                            "var(--color-primary-50)",
                                        color: "var(--color-primary-600)",
                                    }}
                                >
                                    {typedLesson.type === "micro"
                                        ? "MICRO"
                                        : "FULL"}
                                </span>
                                {isCompleted && userProgress?.score != null && (
                                    <span className="flex items-center gap-1 text-caption text-success-600 font-medium">
                                        <Star size={12} />
                                        {userProgress.score}%
                                    </span>
                                )}
                            </div>
                        </div>
                    </div>
                    {isCompleted && (
                        <span className="text-body-sm font-medium text-success-500 bg-success-500/10 px-3 py-1 rounded-full">
                            ✅ Пройден
                        </span>
                    )}
                </div>

                {/* Progress indicator */}
                {typedLesson.quiz.length > 0 && (
                    <div className="mb-2">
                        <div className="flex items-center justify-between mb-1">
                            <span className="text-caption text-surface-400">
                                Прогресс
                            </span>
                            <span className="text-caption text-surface-500 font-medium">
                                {isCompleted ? "100" : "0"}%
                            </span>
                        </div>
                        <div className="w-full h-2 rounded-full bg-surface-100">
                            <div
                                className="h-2 rounded-full transition-all"
                                style={{
                                    width: isCompleted ? "100%" : "0%",
                                    background:
                                        "linear-gradient(90deg, var(--color-primary-400), var(--color-primary-600))",
                                }}
                            />
                        </div>
                    </div>
                )}
            </div>

            {/* Lesson Content */}
            <div className="p-6 rounded-xl bg-surface-0 border border-surface-200 shadow-sm">
                <LessonContent blocks={typedLesson.content} />
            </div>

            {/* Quiz Section */}
            {typedLesson.quiz.length > 0 && (
                <div className="p-6 rounded-xl bg-surface-0 border border-surface-200 shadow-sm">
                    <h2 className="text-h3 text-surface-900 mb-4">
                        🧩 Квиз
                    </h2>
                    <FullLessonQuiz
                        lessonId={typedLesson.id}
                        questions={typedLesson.quiz}
                        isAlreadyCompleted={isCompleted}
                        previousScore={userProgress?.score ?? null}
                    />
                </div>
            )}
        </div>
    );
}
