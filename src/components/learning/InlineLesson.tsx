"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { BookOpen, Clock, ChevronDown, ChevronUp, Award } from "lucide-react";
import { LessonContent } from "./LessonContent";
import { QuizWidget } from "./QuizWidget";
import type { Lesson } from "@/types/lesson";

interface InlineLessonProps {
    lesson: Lesson;
    isCompleted?: boolean;
    onComplete?: (lessonId: string, score: number) => void;
}

export function InlineLesson({
    lesson,
    isCompleted = false,
    onComplete,
}: InlineLessonProps) {
    const [isExpanded, setIsExpanded] = useState(false);
    const [showQuiz, setShowQuiz] = useState(false);
    const [completed, setCompleted] = useState(isCompleted);

    const handleQuizComplete = (score: number) => {
        setCompleted(true);
        onComplete?.(lesson.id, score);
    };

    return (
        <div
            className={`rounded-xl border overflow-hidden transition-all ${completed
                    ? "border-success-500/30 bg-success-500/3"
                    : "border-primary-200 bg-primary-50/30"
                }`}
        >
            {/* Header — always visible */}
            <button
                onClick={() => setIsExpanded(!isExpanded)}
                className="w-full flex items-center justify-between px-4 py-3 text-left hover:bg-primary-50/50 transition-colors"
            >
                <div className="flex items-center gap-2.5">
                    <div
                        className={`w-8 h-8 rounded-lg flex items-center justify-center ${completed
                                ? "bg-success-500/10"
                                : "bg-primary-500/10"
                            }`}
                    >
                        {completed ? (
                            <Award
                                size={16}
                                className="text-success-500"
                                strokeWidth={1.75}
                            />
                        ) : (
                            <BookOpen
                                size={16}
                                className="text-primary-500"
                                strokeWidth={1.75}
                            />
                        )}
                    </div>
                    <div>
                        <p className="text-body-sm font-medium text-surface-900">
                            📘 {lesson.title}
                        </p>
                        <div className="flex items-center gap-2 mt-0.5">
                            <span className="flex items-center gap-1 text-caption text-surface-400">
                                <Clock size={10} />
                                {lesson.duration_min} мин
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
                            {/* Lesson content */}
                            <LessonContent blocks={lesson.content} />

                            {/* Quiz section */}
                            {lesson.quiz.length > 0 && (
                                <div>
                                    {!showQuiz ? (
                                        <button
                                            onClick={() => setShowQuiz(true)}
                                            className="w-full py-2.5 rounded-lg text-body-sm font-medium text-primary-600 border border-primary-200 hover:bg-primary-50 transition-colors"
                                        >
                                            🧩 Пройти квиз
                                        </button>
                                    ) : (
                                        <QuizWidget
                                            questions={lesson.quiz}
                                            onComplete={handleQuizComplete}
                                        />
                                    )}
                                </div>
                            )}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
