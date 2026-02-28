"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { MessageCircle, ExternalLink, BookOpen } from "lucide-react";
import Link from "next/link";
import type { ChecklistItemData } from "@/types/project";
import type { Lesson } from "@/types/lesson";
import { InlineLesson } from "@/components/learning/InlineLesson";
import { completeLessonProgress } from "@/app/(main)/learning/actions";

interface ChecklistItemProps {
    item: ChecklistItemData;
    isCompleted: boolean;
    onToggle: (itemKey: string) => void;
    projectStage: string;
    lesson?: Lesson | null;
    isLessonCompleted?: boolean;
}

export function ChecklistItem({
    item,
    isCompleted,
    onToggle,
    projectStage,
    lesson,
    isLessonCompleted = false,
}: ChecklistItemProps) {
    const [showLesson, setShowLesson] = useState(false);

    const handleLessonComplete = async (lessonId: string, score: number) => {
        await completeLessonProgress(lessonId, score);
    };

    return (
        <div>
            <motion.div
                layout
                className="flex items-start gap-3 p-3 rounded-lg transition-colors group"
                style={{
                    backgroundColor: isCompleted ? "var(--color-primary-50)" : "transparent",
                }}
                whileHover={{ backgroundColor: isCompleted ? undefined : "var(--color-surface-50)" }}
            >
                {/* Checkbox */}
                <button
                    onClick={() => onToggle(item.item_key)}
                    className="mt-0.5 w-5 h-5 rounded-md border-2 flex items-center justify-center transition-all cursor-pointer shrink-0"
                    style={{
                        borderColor: isCompleted
                            ? "var(--color-primary-500)"
                            : "var(--color-surface-300)",
                        backgroundColor: isCompleted
                            ? "var(--color-primary-500)"
                            : "transparent",
                    }}
                >
                    {isCompleted && (
                        <motion.span
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            transition={{ type: "spring", stiffness: 400, damping: 15 }}
                            className="text-white text-xs"
                        >
                            ✓
                        </motion.span>
                    )}
                </button>

                {/* Content */}
                <div className="flex-1 min-w-0">
                    <p
                        className="text-body-sm font-medium transition-colors"
                        style={{
                            color: isCompleted
                                ? "var(--color-text-secondary)"
                                : "var(--color-text-primary)",
                            textDecoration: isCompleted ? "line-through" : "none",
                        }}
                    >
                        {item.label}
                    </p>
                    {item.description && (
                        <p className="text-caption text-surface-400 mt-0.5 line-clamp-2">
                            {item.description}
                        </p>
                    )}

                    {/* Action buttons */}
                    <div className="flex items-center gap-2 mt-2">
                        {!isCompleted && (
                            <Link
                                href={`/chat?stage=${projectStage}&item=${item.item_key}`}
                                className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-caption font-medium transition-colors"
                                style={{
                                    backgroundColor: "var(--color-primary-50)",
                                    color: "var(--color-primary-600)",
                                }}
                            >
                                <MessageCircle size={12} strokeWidth={1.75} />
                                Начать с AI
                            </Link>
                        )}

                        {item.linked_tool && (
                            <Link
                                href={`/workspace/${item.linked_tool}`}
                                className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-caption font-medium transition-colors"
                                style={{
                                    backgroundColor: "var(--color-surface-100)",
                                    color: "var(--color-text-secondary)",
                                }}
                            >
                                <ExternalLink size={12} strokeWidth={1.75} />
                                Открыть
                            </Link>
                        )}

                        {lesson && (
                            <button
                                onClick={() => setShowLesson(!showLesson)}
                                className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-caption font-medium transition-colors"
                                style={{
                                    backgroundColor: showLesson
                                        ? "var(--color-primary-500)"
                                        : "var(--color-accent-400)",
                                    color: "white",
                                }}
                            >
                                <BookOpen size={12} strokeWidth={1.75} />
                                {showLesson ? "Скрыть урок" : "Урок"}
                            </button>
                        )}
                    </div>
                </div>
            </motion.div>

            {/* Inline Lesson — expands below checklist item */}
            <AnimatePresence>
                {showLesson && lesson && (
                    <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        exit={{ opacity: 0, height: 0 }}
                        transition={{ duration: 0.2 }}
                        className="pl-11 pr-3 pb-3 overflow-hidden"
                    >
                        <InlineLesson
                            lesson={lesson}
                            isCompleted={isLessonCompleted}
                            onComplete={handleLessonComplete}
                        />
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
