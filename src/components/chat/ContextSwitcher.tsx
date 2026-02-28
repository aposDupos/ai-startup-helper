"use client";

import type { StageContext } from "@/lib/ai/prompts";

const STAGES: { id: StageContext; label: string; emoji: string }[] = [
    { id: "idea_search", label: "Идея", emoji: "💡" },
    { id: "validation", label: "Валидация", emoji: "🔍" },
    { id: "bmc", label: "БМ", emoji: "📊" },
    { id: "mvp", label: "MVP", emoji: "🚀" },
    { id: "pitch", label: "Питч", emoji: "🎯" },
];

interface ContextSwitcherProps {
    current: StageContext;
    onChange: (stage: StageContext) => void;
    projectStage?: string; // current stage of user's project
}

export function ContextSwitcher({
    current,
    onChange,
    projectStage,
}: ContextSwitcherProps) {
    return (
        <div className="flex items-center gap-1 px-4 py-2 border-b border-surface-200 bg-surface-0 overflow-x-auto">
            {STAGES.map((stage) => {
                const isActive = current === stage.id;
                const isCurrentProjectStage = projectStage === stage.id;

                return (
                    <button
                        key={stage.id}
                        onClick={() => onChange(stage.id)}
                        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium whitespace-nowrap transition-all ${isActive
                                ? "text-primary-600 bg-primary-50"
                                : "text-surface-500 hover:text-surface-700 hover:bg-surface-50"
                            }`}
                        style={
                            isActive
                                ? { boxShadow: "inset 0 -2px 0 var(--color-primary-500)" }
                                : undefined
                        }
                    >
                        <span>{stage.emoji}</span>
                        <span>{stage.label}</span>
                        {isCurrentProjectStage && (
                            <span className="w-1.5 h-1.5 rounded-full bg-accent-500" />
                        )}
                    </button>
                );
            })}
        </div>
    );
}
