"use client";

import type { StageContext } from "@/lib/ai/prompts";

const STAGE_LABELS: Record<string, { emoji: string; label: string }> = {
    idea: { emoji: "💡", label: "Идея" },
    idea_search: { emoji: "💡", label: "Поиск идеи" },
    validation: { emoji: "🔍", label: "Валидация" },
    business_model: { emoji: "📊", label: "Бизнес-модель" },
    bmc: { emoji: "📊", label: "Бизнес-модель" },
    mvp: { emoji: "🚀", label: "MVP" },
    pitch: { emoji: "🎯", label: "Питч" },
};

interface StageBadgeProps {
    stage: StageContext | string;
    hasProject: boolean;
}

export function StageBadge({ stage, hasProject }: StageBadgeProps) {
    const stageInfo = hasProject
        ? STAGE_LABELS[stage] || { emoji: "📋", label: stage }
        : { emoji: "💬", label: "Общий чат" };

    return (
        <div className="flex items-center gap-1 px-4 py-2.5 border-b border-surface-200 bg-surface-0">
            <div
                className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-sm font-medium"
                style={{
                    backgroundColor: "var(--color-surface-100)",
                    color: "var(--color-text-secondary)",
                }}
            >
                <span>{stageInfo.emoji}</span>
                <span>Стадия: {stageInfo.label}</span>
            </div>
        </div>
    );
}
