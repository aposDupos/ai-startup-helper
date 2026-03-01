"use client";

import { useState, useTransition } from "react";
import { motion } from "framer-motion";
import { ArrowBigUp, MessageSquare, Star } from "lucide-react";
import { toggleVote, type Discussion } from "@/app/(main)/community/actions";
import { ReplyThread } from "./ReplyThread";

// ---------------------------------------------------------------------------
// Stage map
// ---------------------------------------------------------------------------

const STAGE_MAP: Record<string, { label: string; emoji: string; color: string }> = {
    idea: { label: "Идея", emoji: "💡", color: "#EEF2FF" },
    validation: { label: "Валидация", emoji: "🔍", color: "#FEF3C7" },
    business_model: { label: "Бизнес-модель", emoji: "📊", color: "#ECFDF5" },
    mvp: { label: "MVP", emoji: "🛠", color: "#EFF6FF" },
    pitch: { label: "Питч", emoji: "🎤", color: "#FCE7F3" },
    general: { label: "Общее", emoji: "💬", color: "var(--color-surface-100)" },
};

// ---------------------------------------------------------------------------
// Time ago helper
// ---------------------------------------------------------------------------

function timeAgo(dateStr: string): string {
    const diff = Date.now() - new Date(dateStr).getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 1) return "только что";
    if (mins < 60) return `${mins} мин. назад`;
    const hours = Math.floor(mins / 60);
    if (hours < 24) return `${hours} ч. назад`;
    const days = Math.floor(hours / 24);
    if (days < 7) return `${days} дн. назад`;
    return new Date(dateStr).toLocaleDateString("ru-RU", { day: "numeric", month: "short" });
}

// ---------------------------------------------------------------------------
// Props
// ---------------------------------------------------------------------------

interface DiscussionPostProps {
    discussion: Discussion;
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export function DiscussionPost({ discussion }: DiscussionPostProps) {
    const [isPending, startTransition] = useTransition();
    const [voted, setVoted] = useState(discussion.user_voted);
    const [upvotes, setUpvotes] = useState(discussion.upvotes);
    const [showReplies, setShowReplies] = useState(false);

    const stageInfo = STAGE_MAP[discussion.stage || "general"] || STAGE_MAP.general;

    const handleVote = () => {
        startTransition(async () => {
            const result = await toggleVote(discussion.id);
            setVoted(result.voted);
            setUpvotes((prev) => (result.voted ? prev + 1 : prev - 1));
        });
    };

    return (
        <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.25 }}
            className="p-5 rounded-xl border border-surface-200 bg-surface-0 shadow-sm"
        >
            {/* Header */}
            <div className="flex items-center gap-2 mb-2">
                <span
                    className="text-[11px] font-semibold px-2 py-0.5 rounded-full"
                    style={{ backgroundColor: stageInfo.color, color: "var(--color-surface-700)" }}
                >
                    {stageInfo.emoji} {stageInfo.label}
                </span>
                <span className="text-caption text-surface-400">·</span>
                <span className="text-caption text-surface-500">{discussion.author_name}</span>
                <span className="text-caption text-surface-300 flex items-center gap-0.5">
                    <Star size={10} /> Lvl {discussion.author_level}
                </span>
                <span className="ml-auto text-caption text-surface-400">
                    {timeAgo(discussion.created_at)}
                </span>
            </div>

            {/* Title + Body */}
            <h3 className="text-body font-semibold text-surface-900 mb-1">{discussion.title}</h3>
            <p className="text-body-sm text-surface-600 line-clamp-3 mb-3 whitespace-pre-line">
                {discussion.body}
            </p>

            {/* Actions */}
            <div className="flex items-center gap-4">
                <button
                    onClick={handleVote}
                    disabled={isPending}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-caption font-semibold transition-all border"
                    style={{
                        borderColor: voted
                            ? "var(--color-primary-300)"
                            : "var(--color-surface-200)",
                        backgroundColor: voted
                            ? "var(--color-primary-50)"
                            : "transparent",
                        color: voted
                            ? "var(--color-primary-600)"
                            : "var(--color-surface-500)",
                    }}
                >
                    <ArrowBigUp
                        size={16}
                        strokeWidth={1.75}
                        fill={voted ? "var(--color-primary-500)" : "none"}
                    />
                    {upvotes}
                </button>

                <button
                    onClick={() => setShowReplies(!showReplies)}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-caption font-semibold text-surface-500 hover:bg-surface-50 transition-all"
                >
                    <MessageSquare size={14} strokeWidth={1.75} />
                    {discussion.reply_count} {discussion.reply_count === 1 ? "ответ" : "ответов"}
                </button>
            </div>

            {/* Replies */}
            {showReplies && (
                <div className="mt-4 pt-4 border-t border-surface-100">
                    <ReplyThread discussionId={discussion.id} />
                </div>
            )}
        </motion.div>
    );
}
