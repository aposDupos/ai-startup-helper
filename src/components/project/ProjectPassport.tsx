"use client";

import { FileText, CheckCircle2, Circle, AlertCircle } from "lucide-react";

interface ProjectPassportProps {
    artifacts: Record<string, unknown>;
    currentStage: string;
}

const ARTIFACT_CONFIG: {
    key: string;
    label: string;
    icon: string;
    stages: string[]; // relevant for these stages
}[] = [
        { key: "problem", label: "Проблема", icon: "🎯", stages: ["idea"] },
        { key: "target_audience", label: "Целевая аудитория", icon: "👥", stages: ["idea"] },
        { key: "idea_formulation", label: "Формулировка идеи", icon: "💡", stages: ["idea"] },
        { key: "hypotheses", label: "Гипотезы", icon: "🔬", stages: ["validation"] },
        { key: "competitors", label: "Конкуренты", icon: "⚔️", stages: ["validation"] },
        { key: "custdev_results", label: "Результаты CustDev", icon: "📊", stages: ["validation"] },
        { key: "unique_value", label: "Ценностное предложение", icon: "✨", stages: ["business_model"] },
        { key: "revenue_model", label: "Модель монетизации", icon: "💰", stages: ["business_model"] },
        { key: "mvp_features", label: "MVP-фичи", icon: "🛠️", stages: ["mvp"] },
    ];

// Stage order for relevance filtering
const STAGE_ORDER = ["idea", "validation", "business_model", "mvp", "pitch"];

export function ProjectPassport({ artifacts, currentStage }: ProjectPassportProps) {
    const currentStageIdx = STAGE_ORDER.indexOf(currentStage);

    // Show artifacts relevant up to current stage
    const relevantArtifacts = ARTIFACT_CONFIG.filter((a) => {
        const artifactStageIdx = Math.max(
            ...a.stages.map((s) => STAGE_ORDER.indexOf(s))
        );
        return artifactStageIdx <= currentStageIdx;
    });

    if (relevantArtifacts.length === 0) return null;

    const filledCount = relevantArtifacts.filter((a) => {
        const val = artifacts[a.key];
        if (!val) return false;
        if (Array.isArray(val)) return val.length > 0;
        return typeof val === "string" && val.length > 0;
    }).length;

    return (
        <div className="p-6 rounded-xl bg-surface-0 border border-surface-200 shadow-sm">
            <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                    <FileText size={18} strokeWidth={1.75} className="text-primary-500" />
                    <h3 className="text-h4 text-surface-900">Паспорт проекта</h3>
                </div>
                <span className="text-caption text-surface-400">
                    {filledCount}/{relevantArtifacts.length}
                </span>
            </div>

            <div className="space-y-2.5">
                {relevantArtifacts.map((config) => {
                    const value = artifacts[config.key];
                    const isFilled =
                        value &&
                        (Array.isArray(value)
                            ? value.length > 0
                            : typeof value === "string" && value.length > 0);

                    return (
                        <div
                            key={config.key}
                            className={`flex items-start gap-2.5 p-2.5 rounded-lg transition-colors ${isFilled
                                    ? "bg-success-50 border border-success-100"
                                    : "bg-surface-50 border border-surface-100"
                                }`}
                        >
                            {isFilled ? (
                                <CheckCircle2
                                    size={16}
                                    strokeWidth={1.75}
                                    className="text-success-500 mt-0.5 flex-shrink-0"
                                />
                            ) : (
                                <Circle
                                    size={16}
                                    strokeWidth={1.75}
                                    className="text-surface-300 mt-0.5 flex-shrink-0"
                                />
                            )}
                            <div className="min-w-0 flex-1">
                                <p className="text-body-sm font-medium text-surface-800">
                                    {config.icon} {config.label}
                                </p>
                                {isFilled ? (
                                    <p className="text-caption text-surface-600 mt-0.5 line-clamp-2">
                                        {Array.isArray(value)
                                            ? (value as string[]).join(" • ")
                                            : (value as string)}
                                    </p>
                                ) : (
                                    <p className="text-caption text-surface-400 mt-0.5">
                                        Обсуди в чате, чтобы заполнить
                                    </p>
                                )}
                            </div>
                        </div>
                    );
                })}
            </div>

            {filledCount < relevantArtifacts.length && (
                <div className="mt-3 flex items-center gap-1.5 text-caption text-surface-400">
                    <AlertCircle size={12} strokeWidth={1.75} />
                    <span>Поговори с AI-наставником, чтобы заполнить пустые поля</span>
                </div>
            )}
        </div>
    );
}
