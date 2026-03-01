"use client";

import { useState, useEffect, useTransition } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Send, Star } from "lucide-react";
import { getReplies, createReply, type Reply } from "@/app/(main)/community/actions";

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
    return `${days} дн. назад`;
}

// ---------------------------------------------------------------------------
// Props
// ---------------------------------------------------------------------------

interface ReplyThreadProps {
    discussionId: string;
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export function ReplyThread({ discussionId }: ReplyThreadProps) {
    const [replies, setReplies] = useState<Reply[]>([]);
    const [loading, setLoading] = useState(true);
    const [newReply, setNewReply] = useState("");
    const [isPending, startTransition] = useTransition();

    useEffect(() => {
        getReplies(discussionId).then((data) => {
            setReplies(data);
            setLoading(false);
        });
    }, [discussionId]);

    const handleSubmit = () => {
        if (!newReply.trim()) return;
        const body = newReply.trim();
        setNewReply("");

        startTransition(async () => {
            await createReply(discussionId, body);
            const updated = await getReplies(discussionId);
            setReplies(updated);
        });
    };

    if (loading) {
        return (
            <div className="space-y-2">
                {[1, 2].map((i) => (
                    <div
                        key={i}
                        className="h-12 rounded-lg animate-pulse"
                        style={{ backgroundColor: "var(--color-surface-100)" }}
                    />
                ))}
            </div>
        );
    }

    return (
        <div className="space-y-3">
            {/* Replies list */}
            <AnimatePresence>
                {replies.map((reply) => (
                    <motion.div
                        key={reply.id}
                        initial={{ opacity: 0, y: 8 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0 }}
                        className="flex gap-3"
                    >
                        <div
                            className="w-7 h-7 rounded-full flex items-center justify-center text-[10px] font-bold text-white shrink-0"
                            style={{
                                background:
                                    "linear-gradient(135deg, var(--color-primary-400), var(--color-primary-500))",
                            }}
                        >
                            {reply.author_name.charAt(0).toUpperCase()}
                        </div>
                        <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-0.5">
                                <span className="text-caption font-semibold text-surface-700">
                                    {reply.author_name}
                                </span>
                                <span className="text-[10px] text-surface-300 flex items-center gap-0.5">
                                    <Star size={8} /> {reply.author_level}
                                </span>
                                <span className="text-[10px] text-surface-400">
                                    {timeAgo(reply.created_at)}
                                </span>
                            </div>
                            <p className="text-body-sm text-surface-600 whitespace-pre-line">
                                {reply.body}
                            </p>
                        </div>
                    </motion.div>
                ))}
            </AnimatePresence>

            {replies.length === 0 && (
                <p className="text-caption text-surface-400 text-center py-2">
                    Пока нет ответов — будь первым!
                </p>
            )}

            {/* Reply input */}
            <div className="flex gap-2 mt-2">
                <input
                    type="text"
                    value={newReply}
                    onChange={(e) => setNewReply(e.target.value)}
                    onKeyDown={(e) => {
                        if (e.key === "Enter" && !e.shiftKey) {
                            e.preventDefault();
                            handleSubmit();
                        }
                    }}
                    placeholder="Написать ответ..."
                    className="flex-1 px-3 py-2 rounded-lg border border-surface-200 text-body-sm text-surface-900 placeholder:text-surface-300 focus:outline-none focus:ring-2 focus:ring-primary-200 bg-surface-0"
                />
                <button
                    onClick={handleSubmit}
                    disabled={isPending || !newReply.trim()}
                    className="px-3 py-2 rounded-lg text-white transition-all disabled:opacity-40"
                    style={{
                        background:
                            "linear-gradient(135deg, var(--color-primary-500), var(--color-primary-600))",
                    }}
                >
                    <Send size={16} strokeWidth={1.75} />
                </button>
            </div>
        </div>
    );
}
