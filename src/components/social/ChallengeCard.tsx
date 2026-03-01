"use client";

import { useState, useTransition } from "react";
import { motion } from "framer-motion";
import { Clock, Users, Zap, Trophy, Check, Plus } from "lucide-react";
import { joinChallenge, type Challenge } from "@/app/(main)/challenges/actions";

// ---------------------------------------------------------------------------
// Type icon map
// ---------------------------------------------------------------------------

const TYPE_ICONS: Record<string, { emoji: string; color: string }> = {
    timed: { emoji: "⏰", color: "var(--color-accent-500)" },
    milestone: { emoji: "🎯", color: "var(--color-primary-500)" },
    social: { emoji: "👥", color: "var(--color-success-500)" },
};

// ---------------------------------------------------------------------------
// Time remaining helper
// ---------------------------------------------------------------------------

function timeRemaining(endsAt: string | null): string {
    if (!endsAt) return "Бессрочно";
    const diff = new Date(endsAt).getTime() - Date.now();
    if (diff <= 0) return "Завершён";
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    if (days > 0) return `${days} дн. ${hours} ч.`;
    return `${hours} ч.`;
}

// ---------------------------------------------------------------------------
// Props
// ---------------------------------------------------------------------------

interface ChallengeCardProps {
    challenge: Challenge;
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export function ChallengeCard({ challenge }: ChallengeCardProps) {
    const [isPending, startTransition] = useTransition();
    const [status, setStatus] = useState(challenge.user_status);
    const typeInfo = TYPE_ICONS[challenge.type || "milestone"] || TYPE_ICONS.milestone;

    const handleJoin = () => {
        startTransition(async () => {
            await joinChallenge(challenge.id);
            setStatus("active");
        });
    };

    const isJoined = status === "active" || status === "completed";
    const isCompleted = status === "completed";
    const remaining = timeRemaining(challenge.ends_at);

    return (
        <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className="p-5 rounded-xl border bg-surface-0 shadow-sm hover:shadow-md transition-all"
            style={{
                borderColor: isCompleted
                    ? "var(--color-success-400)"
                    : "var(--color-surface-200)",
            }}
            whileHover={{ y: -2 }}
        >
            {/* Header */}
            <div className="flex items-start gap-3 mb-3">
                <span className="text-2xl">{typeInfo.emoji}</span>
                <div className="flex-1 min-w-0">
                    <h3 className="text-body-sm font-semibold text-surface-900">
                        {challenge.title}
                    </h3>
                    {challenge.description && (
                        <p className="text-caption text-surface-500 mt-0.5 line-clamp-2">
                            {challenge.description}
                        </p>
                    )}
                </div>
            </div>

            {/* Stats */}
            <div className="flex items-center gap-4 mb-4 text-caption text-surface-500">
                <div className="flex items-center gap-1">
                    <Zap size={14} strokeWidth={1.75} style={{ color: "var(--color-accent-500)" }} />
                    <span style={{ fontFamily: "var(--font-mono)", color: "var(--color-accent-500)" }}>
                        +{challenge.xp_reward} XP
                    </span>
                </div>
                <div className="flex items-center gap-1">
                    <Clock size={14} strokeWidth={1.75} />
                    <span>{remaining}</span>
                </div>
                <div className="flex items-center gap-1">
                    <Users size={14} strokeWidth={1.75} />
                    <span>{challenge.participant_count}</span>
                </div>
            </div>

            {/* Action */}
            {isCompleted ? (
                <div
                    className="flex items-center justify-center gap-2 py-2.5 rounded-lg text-body-sm font-semibold"
                    style={{
                        backgroundColor: "var(--color-success-400)",
                        color: "white",
                    }}
                >
                    <Trophy size={16} strokeWidth={1.75} />
                    Завершёно!
                </div>
            ) : isJoined ? (
                <div
                    className="flex items-center justify-center gap-2 py-2.5 rounded-lg text-body-sm font-semibold border"
                    style={{
                        borderColor: "var(--color-primary-200)",
                        color: "var(--color-primary-600)",
                        backgroundColor: "var(--color-primary-50)",
                    }}
                >
                    <Check size={16} strokeWidth={1.75} />
                    Участвую
                </div>
            ) : (
                <button
                    onClick={handleJoin}
                    disabled={isPending}
                    className="w-full flex items-center justify-center gap-2 py-2.5 rounded-lg text-body-sm font-semibold text-white transition-all disabled:opacity-50"
                    style={{
                        background:
                            "linear-gradient(135deg, var(--color-primary-500), var(--color-primary-600))",
                    }}
                >
                    <Plus size={16} strokeWidth={1.75} />
                    {isPending ? "Вступаю..." : "Присоединиться"}
                </button>
            )}
        </motion.div>
    );
}
