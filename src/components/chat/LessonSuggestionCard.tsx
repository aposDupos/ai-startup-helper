"use client";

import Link from "next/link";
import { BookOpen, ArrowRight } from "lucide-react";

interface LessonSuggestionCardProps {
    data: {
        title?: string;
        url?: string;
    };
}

export function LessonSuggestionCard({ data }: LessonSuggestionCardProps) {
    if (!data.url) return null;

    return (
        <Link
            href={data.url}
            className="group flex items-center gap-3 p-3 rounded-xl border border-primary-200 bg-primary-50/50 hover:bg-primary-100/60 transition-all"
        >
            <div className="w-9 h-9 rounded-lg bg-primary-500/10 flex items-center justify-center shrink-0">
                <BookOpen size={18} className="text-primary-500" strokeWidth={1.75} />
            </div>
            <div className="flex-1 min-w-0">
                <p className="text-caption font-medium text-primary-600 mb-0.5">
                    📘 Рекомендуем урок
                </p>
                <p className="text-body-sm font-medium text-surface-900 truncate">
                    {data.title || "Перейти к урокам"}
                </p>
            </div>
            <ArrowRight
                size={16}
                className="text-primary-400 group-hover:text-primary-600 group-hover:translate-x-0.5 transition-all shrink-0"
            />
        </Link>
    );
}
