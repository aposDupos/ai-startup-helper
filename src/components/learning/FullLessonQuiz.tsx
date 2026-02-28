"use client";

import { useState, useTransition } from "react";
import { QuizWidget } from "./QuizWidget";
import { completeLessonProgress } from "@/app/(main)/learning/actions";
import { useGamification } from "@/contexts/GamificationContext";
import type { QuizQuestion } from "@/types/lesson";
import type { ProjectPersonalizationContext } from "@/lib/learning/personalize";

interface FullLessonQuizProps {
    lessonId: string;
    questions: QuizQuestion[];
    isAlreadyCompleted: boolean;
    previousScore: number | null;
    projectContext?: ProjectPersonalizationContext | null;
}

export function FullLessonQuiz({
    lessonId,
    questions,
    isAlreadyCompleted,
    previousScore,
    projectContext,
}: FullLessonQuizProps) {
    const [completed, setCompleted] = useState(isAlreadyCompleted);
    const [score, setScore] = useState<number | null>(previousScore);
    const [isPending, startTransition] = useTransition();
    const { showXPToast, showLevelUp, showAchievement } = useGamification();

    const handleComplete = (quizScore: number) => {
        startTransition(async () => {
            try {
                const result = await completeLessonProgress(lessonId, quizScore);
                setCompleted(true);
                setScore(quizScore);
                showXPToast(result.xpGained, "Урок завершён!");
                if (result.leveledUp) {
                    showLevelUp(result.newLevel);
                }
                if (result.unlockedAchievements) {
                    for (const a of result.unlockedAchievements) {
                        showAchievement(a.title, a.icon ?? undefined);
                    }
                }
            } catch (err) {
                console.error("Failed to complete lesson:", err);
            }
        });
    };

    if (completed && score != null) {
        return (
            <div className="text-center py-6">
                <div className="text-4xl mb-3">
                    {score >= 70 ? "🎉" : score >= 40 ? "👍" : "📚"}
                </div>
                <p className="text-h3 text-surface-900 mb-1">
                    {score}% правильно
                </p>
                <p className="text-body-sm text-success-600 font-medium">
                    ✅ Урок завершён!
                </p>
                {isPending && (
                    <p className="text-caption text-surface-400 mt-2">
                        Сохранение...
                    </p>
                )}
            </div>
        );
    }

    return (
        <div>
            <QuizWidget questions={questions} onComplete={handleComplete} projectContext={projectContext} />
            {isPending && (
                <div className="text-center mt-3">
                    <span className="text-caption text-surface-400">
                        Сохранение...
                    </span>
                </div>
            )}
        </div>
    );
}
