"use client";

import { useState, useTransition } from "react";
import { Snowflake, X, AlertTriangle } from "lucide-react";

// ---------------------------------------------------------------------------
// Actions
// ---------------------------------------------------------------------------

async function useStreakFreezeAction(): Promise<{ success: boolean; message: string }> {
    const res = await fetch("/api/streak/freeze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
    });
    return res.json();
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

interface StreakFreezeModalProps {
    streakCount: number;
    alreadyUsedThisWeek: boolean;
    onClose: () => void;
}

export function StreakFreezeModal({
    streakCount,
    alreadyUsedThisWeek,
    onClose,
}: StreakFreezeModalProps) {
    const [isPending, startTransition] = useTransition();
    const [result, setResult] = useState<{
        success: boolean;
        message: string;
    } | null>(null);

    const handleFreeze = () => {
        startTransition(async () => {
            const res = await useStreakFreezeAction();
            setResult(res);
            if (res.success) {
                setTimeout(onClose, 2000);
            }
        });
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            {/* Backdrop */}
            <div
                className="absolute inset-0 bg-surface-950/50 backdrop-blur-sm"
                onClick={onClose}
            />

            {/* Modal */}
            <div
                className="relative w-full max-w-md rounded-2xl bg-surface-0 border border-surface-200 shadow-lg p-6 animate-fade-in"
                style={{ animation: "fadeIn 0.2s ease-out" }}
            >
                {/* Close button */}
                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 text-surface-400 hover:text-surface-600 transition-colors"
                >
                    <X size={20} strokeWidth={1.75} />
                </button>

                {/* Icon */}
                <div className="flex justify-center mb-4">
                    <div
                        className="w-16 h-16 rounded-2xl flex items-center justify-center"
                        style={{
                            background: "linear-gradient(135deg, #DBEAFE, #BFDBFE)",
                        }}
                    >
                        <Snowflake size={32} strokeWidth={1.75} className="text-blue-500" />
                    </div>
                </div>

                {/* Content */}
                <h2 className="text-h3 text-surface-900 text-center mb-2">
                    Ты пропустил вчера! 😰
                </h2>

                <div className="flex items-center justify-center gap-2 mb-4">
                    <span className="text-2xl">🔥</span>
                    <span
                        className="text-h2"
                        style={{ fontFamily: "var(--font-mono)", color: "var(--color-surface-900)" }}
                    >
                        {streakCount}
                    </span>
                    <span className="text-body-sm text-surface-500">дней на кону</span>
                </div>

                {result ? (
                    <div
                        className={`p-4 rounded-xl text-center text-body-sm font-medium ${result.success
                                ? "bg-blue-50 text-blue-700"
                                : "bg-red-50 text-red-700"
                            }`}
                    >
                        {result.message}
                    </div>
                ) : alreadyUsedThisWeek ? (
                    <div className="p-4 rounded-xl bg-amber-50 text-center">
                        <div className="flex items-center justify-center gap-2 mb-1">
                            <AlertTriangle size={16} strokeWidth={1.75} className="text-amber-500" />
                            <span className="text-body-sm font-semibold text-amber-700">
                                Freeze уже использован
                            </span>
                        </div>
                        <p className="text-caption text-amber-600">
                            Можно использовать 1 раз в неделю. К сожалению, стрик сброшен.
                        </p>
                    </div>
                ) : (
                    <div className="space-y-3">
                        <p className="text-body-sm text-surface-500 text-center">
                            Заморозь стрик, чтобы он не сбросился. Это можно сделать <b>1 раз в неделю</b>.
                        </p>

                        <button
                            onClick={handleFreeze}
                            disabled={isPending}
                            className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl text-body-sm font-semibold text-white transition-all duration-200 hover:-translate-y-px active:scale-[0.97] disabled:opacity-50"
                            style={{
                                background: "linear-gradient(135deg, #3B82F6, #2563EB)",
                                fontFamily: "var(--font-heading)",
                            }}
                        >
                            <Snowflake size={18} strokeWidth={2} />
                            {isPending ? "Замораживаю..." : "❄️ Заморозить стрик"}
                        </button>

                        <button
                            onClick={onClose}
                            className="w-full px-4 py-3 rounded-xl text-body-sm font-medium text-surface-500 bg-surface-50 hover:bg-surface-100 transition-colors"
                        >
                            Нет, всё ок
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
}
