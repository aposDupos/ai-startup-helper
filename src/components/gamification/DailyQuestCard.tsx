"use client";

import { useState, useEffect, useTransition } from "react";
import { Target, Check, Clock, ArrowRight } from "lucide-react";
import { useRouter } from "next/navigation";
import type { DailyQuest } from "@/lib/gamification/daily-quest";

// ---------------------------------------------------------------------------
// Actions (client-callable)
// ---------------------------------------------------------------------------

async function completeQuestAction(questId: string): Promise<{ success: boolean; xpAwarded: number }> {
    const res = await fetch("/api/daily-quest/complete", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ questId }),
    });
    return res.json();
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

interface DailyQuestCardProps {
    quest: DailyQuest;
    actionUrl: string;
}

export function DailyQuestCard({ quest, actionUrl }: DailyQuestCardProps) {
    const router = useRouter();
    const [completed, setCompleted] = useState(quest.completed);
    const [isPending, startTransition] = useTransition();
    const [timeLeft, setTimeLeft] = useState("");

    // Countdown timer to midnight
    useEffect(() => {
        function updateTimer() {
            const now = new Date();
            const midnight = new Date(now);
            midnight.setHours(24, 0, 0, 0);
            const diff = midnight.getTime() - now.getTime();

            const hours = Math.floor(diff / (1000 * 60 * 60));
            const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));

            setTimeLeft(`${hours}ч ${minutes}м`);
        }

        updateTimer();
        const interval = setInterval(updateTimer, 60_000);
        return () => clearInterval(interval);
    }, []);

    const handleComplete = () => {
        startTransition(async () => {
            const result = await completeQuestAction(quest.id);
            if (result.success) {
                setCompleted(true);
                router.refresh();
            }
        });
    };

    const handleNavigate = () => {
        if (actionUrl === "/dashboard") {
            // Same page — scroll to Journey Map and highlight
            const journeyMap = document.querySelector("[data-journey-map]");
            if (journeyMap) {
                journeyMap.scrollIntoView({ behavior: "smooth", block: "start" });
                journeyMap.classList.add("ring-2", "ring-primary-400", "ring-offset-2");
                setTimeout(() => {
                    journeyMap.classList.remove("ring-2", "ring-primary-400", "ring-offset-2");
                }, 2000);
            }
        } else {
            window.location.href = actionUrl;
        }
    };

    return (
        <div
            className={`
                p-6 rounded-xl border shadow-sm transition-all duration-300
                ${completed
                    ? "bg-success-50 border-success-300"
                    : "bg-surface-0 border-surface-200 hover:shadow-md hover:-translate-y-0.5"
                }
            `}
        >
            <div className="flex items-start gap-4">
                {/* Icon */}
                <div
                    className={`
                        w-12 h-12 rounded-xl flex items-center justify-center shrink-0 transition-all duration-300
                        ${completed
                            ? "bg-success-100"
                            : "bg-accent-50"
                        }
                    `}
                    style={completed ? undefined : {
                        background: "linear-gradient(135deg, rgba(251, 146, 60, 0.1), rgba(249, 115, 22, 0.15))",
                    }}
                >
                    {completed ? (
                        <Check size={24} strokeWidth={2.5} className="text-success-600" />
                    ) : (
                        <Target size={24} strokeWidth={1.75} className="text-accent-500" />
                    )}
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                        <h3 className="text-h4 text-surface-900">
                            {completed ? "✅ Квест выполнен!" : "🎯 Квест дня"}
                        </h3>
                        <span
                            className="text-caption font-semibold px-2 py-0.5 rounded-full"
                            style={{
                                fontFamily: "var(--font-mono)",
                                color: "var(--color-accent-600)",
                                background: "rgba(249, 115, 22, 0.1)",
                            }}
                        >
                            +{quest.xp_reward} XP
                        </span>
                    </div>

                    <p className={`text-body-sm ${completed ? "text-success-700 line-through" : "text-surface-600"}`}>
                        {quest.quest_label}
                    </p>

                    {/* Timer + actions */}
                    <div className="flex items-center gap-3 mt-3">
                        {!completed && (
                            <>
                                <button
                                    onClick={handleNavigate}
                                    className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg text-body-sm font-semibold text-white transition-all duration-200 hover:-translate-y-px active:scale-[0.97]"
                                    style={{
                                        background: "linear-gradient(135deg, var(--color-primary-500), var(--color-primary-600))",
                                        boxShadow: "var(--shadow-glow-primary)",
                                        fontFamily: "var(--font-heading)",
                                    }}
                                >
                                    Выполнить
                                    <ArrowRight size={16} strokeWidth={2} />
                                </button>

                                <button
                                    onClick={handleComplete}
                                    disabled={isPending}
                                    className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg text-body-sm font-semibold text-surface-600 bg-surface-100 hover:bg-surface-200 transition-all duration-200 active:scale-[0.97] disabled:opacity-50"
                                    style={{ fontFamily: "var(--font-heading)" }}
                                >
                                    <Check size={16} strokeWidth={2} />
                                    {isPending ? "..." : "Готово"}
                                </button>
                            </>
                        )}

                        <div className="flex items-center gap-1 ml-auto text-caption text-surface-400">
                            <Clock size={14} strokeWidth={1.75} />
                            <span style={{ fontFamily: "var(--font-mono)" }}>{timeLeft}</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
