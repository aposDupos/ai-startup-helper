"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, X, Send, MessagesSquare } from "lucide-react";
import { DiscussionPost } from "@/components/social/DiscussionPost";
import { createDiscussion, type Discussion } from "./actions";

// ---------------------------------------------------------------------------
// Stage filter options
// ---------------------------------------------------------------------------

const STAGES = [
    { value: "all", label: "Все" },
    { value: "general", label: "💬 Общее" },
    { value: "idea", label: "💡 Идея" },
    { value: "validation", label: "🔍 Валидация" },
    { value: "business_model", label: "📊 Бизнес-модель" },
    { value: "mvp", label: "🛠 MVP" },
    { value: "pitch", label: "🎤 Питч" },
];

// ---------------------------------------------------------------------------
// Props
// ---------------------------------------------------------------------------

interface CommunityClientProps {
    initialDiscussions: Discussion[];
    totalPages: number;
    currentPage: number;
    currentStage: string;
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export function CommunityClient({
    initialDiscussions,
    totalPages,
    currentPage,
    currentStage,
}: CommunityClientProps) {
    const router = useRouter();
    const [showForm, setShowForm] = useState(false);
    const [title, setTitle] = useState("");
    const [body, setBody] = useState("");
    const [stage, setStage] = useState("general");
    const [isPending, startTransition] = useTransition();

    const handleStageFilter = (stageValue: string) => {
        const params = new URLSearchParams();
        if (stageValue !== "all") params.set("stage", stageValue);
        router.push(`/community?${params.toString()}`);
    };

    const handleSubmit = () => {
        if (!title.trim() || !body.trim()) return;
        startTransition(async () => {
            await createDiscussion({ title: title.trim(), body: body.trim(), stage });
            setTitle("");
            setBody("");
            setShowForm(false);
            router.refresh();
        });
    };

    const container = { hidden: {}, show: { transition: { staggerChildren: 0.06 } } };
    const item = { hidden: { opacity: 0, y: 12 }, show: { opacity: 1, y: 0 } };

    return (
        <div className="space-y-6">
            {/* Filters + New Post */}
            <div className="flex flex-col sm:flex-row gap-4 sm:items-center sm:justify-between">
                <div className="flex flex-wrap gap-2">
                    {STAGES.map((s) => (
                        <button
                            key={s.value}
                            onClick={() => handleStageFilter(s.value)}
                            className="px-3 py-1.5 rounded-full text-caption font-semibold transition-all border"
                            style={{
                                backgroundColor:
                                    currentStage === s.value
                                        ? "var(--color-primary-500)"
                                        : "transparent",
                                borderColor:
                                    currentStage === s.value
                                        ? "var(--color-primary-500)"
                                        : "var(--color-surface-200)",
                                color:
                                    currentStage === s.value
                                        ? "white"
                                        : "var(--color-surface-600)",
                            }}
                        >
                            {s.label}
                        </button>
                    ))}
                </div>

                <button
                    onClick={() => setShowForm(!showForm)}
                    className="flex items-center gap-2 px-4 py-2.5 rounded-lg text-body-sm font-semibold text-white transition-all shrink-0"
                    style={{
                        background:
                            "linear-gradient(135deg, var(--color-primary-500), var(--color-primary-600))",
                    }}
                >
                    {showForm ? <X size={16} /> : <Plus size={16} />}
                    {showForm ? "Отмена" : "Новый пост"}
                </button>
            </div>

            {/* New Post Form */}
            <AnimatePresence>
                {showForm && (
                    <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.25 }}
                        className="overflow-hidden"
                    >
                        <div className="p-5 rounded-xl border border-surface-200 bg-surface-0 shadow-sm space-y-3">
                            <input
                                type="text"
                                value={title}
                                onChange={(e) => setTitle(e.target.value)}
                                placeholder="Заголовок поста"
                                className="w-full px-3 py-2.5 rounded-lg border border-surface-200 text-body-sm font-semibold text-surface-900 placeholder:text-surface-300 focus:outline-none focus:ring-2 focus:ring-primary-200 bg-surface-0"
                            />
                            <textarea
                                value={body}
                                onChange={(e) => setBody(e.target.value)}
                                placeholder="О чём хочешь поговорить?"
                                rows={4}
                                className="w-full px-3 py-2.5 rounded-lg border border-surface-200 text-body-sm text-surface-900 placeholder:text-surface-300 focus:outline-none focus:ring-2 focus:ring-primary-200 bg-surface-0 resize-none"
                            />
                            <div className="flex items-center gap-3">
                                <select
                                    value={stage}
                                    onChange={(e) => setStage(e.target.value)}
                                    className="px-3 py-2 rounded-lg border border-surface-200 text-body-sm text-surface-700 bg-surface-0 focus:outline-none focus:ring-2 focus:ring-primary-200"
                                >
                                    <option value="general">💬 Общее</option>
                                    <option value="idea">💡 Идея</option>
                                    <option value="validation">🔍 Валидация</option>
                                    <option value="business_model">📊 Бизнес-модель</option>
                                    <option value="mvp">🛠 MVP</option>
                                    <option value="pitch">🎤 Питч</option>
                                </select>
                                <button
                                    onClick={handleSubmit}
                                    disabled={isPending || !title.trim() || !body.trim()}
                                    className="flex items-center gap-2 px-4 py-2 rounded-lg text-body-sm font-semibold text-white transition-all disabled:opacity-50 ml-auto"
                                    style={{
                                        background:
                                            "linear-gradient(135deg, var(--color-primary-500), var(--color-primary-600))",
                                    }}
                                >
                                    <Send size={14} />
                                    {isPending ? "Публикую..." : "Опубликовать"}
                                </button>
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Discussion Feed */}
            {initialDiscussions.length > 0 ? (
                <motion.div
                    variants={container}
                    initial="hidden"
                    animate="show"
                    className="space-y-4"
                >
                    {initialDiscussions.map((discussion) => (
                        <motion.div key={discussion.id} variants={item}>
                            <DiscussionPost discussion={discussion} />
                        </motion.div>
                    ))}
                </motion.div>
            ) : (
                <div className="text-center py-16">
                    <MessagesSquare
                        size={48}
                        strokeWidth={1.5}
                        className="mx-auto mb-4"
                        style={{ color: "var(--color-surface-300)" }}
                    />
                    <h3 className="text-h3 text-surface-500 mb-2">Пока нет обсуждений</h3>
                    <p className="text-body-sm text-surface-400">
                        Будь первым — создай пост и начни обсуждение!
                    </p>
                </div>
            )}

            {/* Pagination */}
            {totalPages > 1 && (
                <div className="flex justify-center gap-2 pt-4">
                    {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
                        <button
                            key={p}
                            onClick={() => {
                                const params = new URLSearchParams();
                                if (currentStage !== "all") params.set("stage", currentStage);
                                if (p > 1) params.set("page", String(p));
                                router.push(`/community?${params.toString()}`);
                            }}
                            className="w-9 h-9 rounded-lg text-body-sm font-semibold transition-all"
                            style={{
                                backgroundColor:
                                    currentPage === p
                                        ? "var(--color-primary-500)"
                                        : "var(--color-surface-100)",
                                color:
                                    currentPage === p
                                        ? "white"
                                        : "var(--color-surface-600)",
                            }}
                        >
                            {p}
                        </button>
                    ))}
                </div>
            )}
        </div>
    );
}
