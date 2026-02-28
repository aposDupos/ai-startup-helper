"use client";

import { useState, useTransition } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { BookOpen, Clock, ChevronDown, ChevronUp, Award, Zap } from "lucide-react";
import { LessonContent } from "./LessonContent";
import { QuizWidget } from "./QuizWidget";
import { completeLessonProgress } from "@/app/(main)/learning/actions";
import type { Lesson } from "@/types/lesson";
import { useGamification } from "@/contexts/GamificationContext";

interface MicroLessonCardProps {
    lesson: Lesson;
    isCompleted?: boolean;
}

export function MicroLessonCard({
    lesson,
    isCompleted: initialCompleted = false,
}: MicroLessonCardProps) {
    const [isExpanded, setIsExpanded] = useState(false);
    const [showQuiz, setShowQuiz] = useState(false);
    const [completed, setCompleted] = useState(initialCompleted);
    const [isPending, startTransition] = useTransition();
    const { showXPToast, showLevelUp, showAchievement } = useGamification();

    // For micro lessons, show only first 2 content blocks
    const microContent = lesson.content.slice(0, 2);
    // Only 1 quiz question for micro
    const microQuiz = lesson.quiz.slice(0, 1);

    const handleQuizComplete = (score: number) => {
        startTransition(async () => {
            try {
                const result = await completeLessonProgress(lesson.id, score);
                setCompleted(true);
                showXPToast(result.xpGained, "Мини-урок завершён!");
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

    return (
        <div
            className={`rounded-xl border overflow-hidden transition-all ${completed
                ? "border-success-500/30 bg-success-500/3"
                : "border-accent-200 bg-accent-500/3"
                }`}
        >
            {/* Header — always visible */}
            <button
                onClick={() => setIsExpanded(!isExpanded)}
                className="w-full flex items-center justify-between px-4 py-3 text-left hover:bg-accent-500/5 transition-colors cursor-pointer"
            >
                <div className="flex items-center gap-2.5">
                    <div
                        className={`w-8 h-8 rounded-lg flex items-center justify-center ${completed
                            ? "bg-success-500/10"
                            : "bg-accent-500/10"
                            }`}
                    >
                        {completed ? (
                            <Award
                                size={16}
                                className="text-success-500"
                                strokeWidth={1.75}
                            />
                        ) : (
                            <Zap
                                size={16}
                                className="text-accent-500"
                                strokeWidth={1.75}
                            />
                        )}
                    </div>
                    <div>
                        <div className="flex items-center gap-2">
                            <p className="text-body-sm font-medium text-surface-900">
                                {lesson.title}
                            </p>
                            <span
                                className="text-[10px] font-bold px-1.5 py-0.5 rounded-full uppercase tracking-wider"
                                style={{
                                    backgroundColor: "var(--color-accent-500)",
                                    color: "white",
                                }}
                            >
                                Micro
                            </span>
                        </div>
                        <div className="flex items-center gap-2 mt-0.5">
                            <span className="flex items-center gap-1 text-caption text-surface-400">
                                <Clock size={10} />
                                {lesson.estimated_minutes || lesson.duration_min} мин
                            </span>
                            {completed && (
                                <span className="text-caption font-medium text-success-500">
                                    ✓ Пройден
                                </span>
                            )}
                        </div>
                    </div>
                </div>
                {isExpanded ? (
                    <ChevronUp
                        size={16}
                        className="text-surface-400"
                    />
                ) : (
                    <ChevronDown
                        size={16}
                        className="text-surface-400"
                    />
                )}
            </button>

            {/* Expandable content */}
            <AnimatePresence>
                {isExpanded && (
                    <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.2 }}
                        className="overflow-hidden"
                    >
                        <div className="px-4 pb-4 space-y-4">
                            {/* Lesson content (limited) */}
                            <LessonContent blocks={microContent} />

                            {/* Quiz section */}
                            {microQuiz.length > 0 && !completed && (
                                <div>
                                    {!showQuiz ? (
                                        <button
                                            onClick={() => setShowQuiz(true)}
                                            className="w-full py-2.5 rounded-lg text-body-sm font-medium text-accent-600 border border-accent-200 hover:bg-accent-50 transition-colors cursor-pointer"
                                        >
                                            🧩 Пройти квиз
                                        </button>
                                    ) : (
                                        <QuizWidget
                                            questions={microQuiz}
                                            onComplete={handleQuizComplete}
                                        />
                                    )}
                                </div>
                            )}

                            {/* Completion indicator */}
                            {completed && (
                                <div className="text-center py-2">
                                    <span className="text-body-sm text-success-600 font-medium">
                                        ✅ Урок завершён!
                                    </span>
                                </div>
                            )}

                            {isPending && (
                                <div className="text-center py-2">
                                    <span className="text-caption text-surface-400">
                                        Сохранение...
                                    </span>
                                </div>
                            )}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
