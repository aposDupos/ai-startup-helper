"use client";

import { useState } from "react";
import { BarChart3, ChevronDown, ChevronUp, TrendingUp, TrendingDown, Minus, BookOpen, CheckSquare, Target, Flame } from "lucide-react";
import type { WeeklyReport } from "@/lib/reporting/weekly";

interface WeeklyReportCardProps {
    report: WeeklyReport;
}

export function WeeklyReportCard({ report }: WeeklyReportCardProps) {
    const [expanded, setExpanded] = useState(false);

    const formatDate = (dateStr: string) => {
        const d = new Date(dateStr + "T00:00:00");
        return d.toLocaleDateString("ru-RU", { day: "numeric", month: "short" });
    };

    return (
        <div className="rounded-xl border border-surface-200 bg-surface-0 shadow-sm overflow-hidden transition-all duration-300">
            {/* Header — always visible */}
            <button
                onClick={() => setExpanded(!expanded)}
                className="w-full flex items-center gap-4 p-6 text-left hover:bg-surface-50/50 transition-colors"
            >
                <div
                    className="w-12 h-12 rounded-xl flex items-center justify-center shrink-0"
                    style={{
                        background: "linear-gradient(135deg, rgba(99, 102, 241, 0.1), rgba(99, 102, 241, 0.15))",
                    }}
                >
                    <BarChart3 size={24} strokeWidth={1.75} className="text-primary-500" />
                </div>

                <div className="flex-1 min-w-0">
                    <h3 className="text-h4 text-surface-900">📊 Отчёт за неделю</h3>
                    <p className="text-caption text-surface-400">
                        {formatDate(report.weekStart)} — {formatDate(report.weekEnd)}
                    </p>
                </div>

                {/* Quick stats */}
                <div className="hidden sm:flex items-center gap-3">
                    <span
                        className="text-body-sm font-bold"
                        style={{ fontFamily: "var(--font-mono)", color: "var(--color-accent-500)" }}
                    >
                        +{report.xpEarned} XP
                    </span>
                    {report.scoreDelta !== null && (
                        <span
                            className={`flex items-center gap-0.5 text-body-sm font-bold ${report.scoreDelta > 0
                                    ? "text-success-500"
                                    : report.scoreDelta < 0
                                        ? "text-red-500"
                                        : "text-surface-400"
                                }`}
                            style={{ fontFamily: "var(--font-mono)" }}
                        >
                            {report.scoreDelta > 0 ? (
                                <TrendingUp size={14} strokeWidth={2} />
                            ) : report.scoreDelta < 0 ? (
                                <TrendingDown size={14} strokeWidth={2} />
                            ) : (
                                <Minus size={14} strokeWidth={2} />
                            )}
                            {report.scoreDelta > 0 ? "+" : ""}{report.scoreDelta}
                        </span>
                    )}
                </div>

                <div className="text-surface-400">
                    {expanded ? (
                        <ChevronUp size={20} strokeWidth={1.75} />
                    ) : (
                        <ChevronDown size={20} strokeWidth={1.75} />
                    )}
                </div>
            </button>

            {/* Expandable content */}
            {expanded && (
                <div className="px-6 pb-6 space-y-4 animate-fade-in">
                    {/* Summary */}
                    <p className="text-body-sm text-surface-700 leading-relaxed">
                        {report.summary}
                    </p>

                    {/* Stats grid */}
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                        <StatBox
                            icon={<Target size={16} strokeWidth={1.75} className="text-accent-500" />}
                            label="XP"
                            value={`+${report.xpEarned}`}
                            color="accent"
                        />
                        <StatBox
                            icon={<BookOpen size={16} strokeWidth={1.75} className="text-primary-500" />}
                            label="Уроков"
                            value={String(report.lessonsCompleted)}
                            color="primary"
                        />
                        <StatBox
                            icon={<CheckSquare size={16} strokeWidth={1.75} className="text-success-500" />}
                            label="Пунктов"
                            value={String(report.checklistItemsDone)}
                            color="success"
                        />
                        <StatBox
                            icon={<Flame size={16} strokeWidth={1.75} className="text-orange-500" />}
                            label="Квестов"
                            value={String(report.questsCompleted)}
                            color="orange"
                        />
                    </div>

                    {/* Recommendation */}
                    <div className="p-4 rounded-xl bg-primary-50/50 border border-primary-100">
                        <p className="text-body-sm text-primary-800 font-medium mb-1">
                            💡 Рекомендация на неделю
                        </p>
                        <p className="text-body-sm text-primary-700">
                            {report.recommendation}
                        </p>
                    </div>
                </div>
            )}
        </div>
    );
}

// ---------------------------------------------------------------------------
// Stat box
// ---------------------------------------------------------------------------

function StatBox({
    icon,
    label,
    value,
    color,
}: {
    icon: React.ReactNode;
    label: string;
    value: string;
    color: string;
}) {
    return (
        <div className="flex items-center gap-2 p-3 rounded-xl bg-surface-50">
            {icon}
            <div>
                <p
                    className="text-body-sm font-bold text-surface-900"
                    style={{ fontFamily: "var(--font-mono)" }}
                >
                    {value}
                </p>
                <p className="text-caption text-surface-400">{label}</p>
            </div>
        </div>
    );
}
