"use client";

import { useState, useTransition } from "react";
import { motion } from "framer-motion";
import { Flame, Lightbulb, BarChart3, MessageSquare } from "lucide-react";
import Link from "next/link";
import { toggleReaction } from "@/app/(main)/discover/actions";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface ProjectCardProps {
    project: {
        id: string;
        title: string;
        description: string | null;
        stage: string;
        scorecard: { total?: number } | null;
        owner: {
            id: string;
            display_name: string;
            avatar_url: string | null;
        };
        reactions: {
            fire: number;
            creative: number;
            researched: number;
        };
        userReactions: string[];
        hasOpenReview: boolean;
        reviewRequestId: string | null;
    };
    showReviewBadge?: boolean;
}

// ---------------------------------------------------------------------------
// Stage labels
// ---------------------------------------------------------------------------

const STAGE_LABELS: Record<string, { label: string; emoji: string; color: string }> = {
    idea: { label: "Идея", emoji: "🏝️", color: "var(--color-primary-100)" },
    validation: { label: "Проверка", emoji: "🔍", color: "#FEF3C7" },
    business_model: { label: "Бизнес-модель", emoji: "📊", color: "#DBEAFE" },
    mvp: { label: "MVP", emoji: "🛠️", color: "#D1FAE5" },
    pitch: { label: "Питч", emoji: "🎤", color: "#FCE7F3" },
};

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export function ProjectCard({ project, showReviewBadge = true }: ProjectCardProps) {
    const [reactions, setReactions] = useState(project.reactions);
    const [userReactions, setUserReactions] = useState<string[]>(project.userReactions);
    const [isPending, startTransition] = useTransition();

    const stageMeta = STAGE_LABELS[project.stage] || STAGE_LABELS.idea;
    const score = project.scorecard?.total ?? null;

    const handleReaction = (type: "fire" | "creative" | "researched") => {
        // Optimistic update
        const isActive = userReactions.includes(type);
        const newUserReactions = isActive
            ? userReactions.filter((r) => r !== type)
            : [...userReactions, type];
        const newReactions = {
            ...reactions,
            [type]: isActive ? reactions[type] - 1 : reactions[type] + 1,
        };
        setUserReactions(newUserReactions);
        setReactions(newReactions);

        startTransition(async () => {
            try {
                const result = await toggleReaction(project.id, type);
                setReactions(result.counts);
            } catch {
                // Revert on error
                setUserReactions(project.userReactions);
                setReactions(project.reactions);
            }
        });
    };

    const avatarInitial = project.owner?.display_name?.charAt(0)?.toUpperCase() || "?";

    return (
        <motion.div
            className="p-5 rounded-xl bg-surface-0 border border-surface-200 shadow-sm flex flex-col gap-3 cursor-default"
            whileHover={{
                y: -2,
                boxShadow: "0 4px 16px rgba(28, 25, 23, 0.08)",
            }}
            transition={{ duration: 0.2, ease: "easeOut" }}
        >
            {/* Header: Stage Badge + Score */}
            <div className="flex items-center justify-between">
                <span
                    className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-caption font-medium"
                    style={{ backgroundColor: stageMeta.color }}
                >
                    {stageMeta.emoji} {stageMeta.label}
                </span>
                <div className="flex items-center gap-2">
                    {project.hasOpenReview && showReviewBadge && project.reviewRequestId && (
                        <Link
                            href={`/discover/review/${project.reviewRequestId}`}
                            className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-amber-100 text-caption font-medium text-amber-700 hover:bg-amber-200 transition-colors"
                        >
                            <MessageSquare size={12} /> Ждёт ревью
                        </Link>
                    )}
                    {score !== null && (
                        <span
                            className="text-caption font-bold"
                            style={{
                                fontFamily: "var(--font-mono)",
                                color: "var(--color-primary-500)",
                            }}
                        >
                            {score}/100
                        </span>
                    )}
                </div>
            </div>

            {/* Title & Description */}
            <div className="flex-1">
                <h3 className="text-h4 text-surface-900 line-clamp-1">{project.title}</h3>
                {project.description && (
                    <p className="text-body-sm text-surface-500 mt-1 line-clamp-2">
                        {project.description}
                    </p>
                )}
            </div>

            {/* Author */}
            <div className="flex items-center gap-2">
                <div className="w-6 h-6 rounded-full bg-primary-100 flex items-center justify-center text-[10px] font-bold text-primary-600">
                    {avatarInitial}
                </div>
                <span className="text-caption text-surface-400">
                    {project.owner?.display_name || "Аноним"}
                </span>
            </div>

            {/* Reactions */}
            <div className="flex items-center gap-2 pt-2 border-t border-surface-100">
                <ReactionButton
                    icon={<Flame size={14} strokeWidth={1.75} />}
                    label="🔥"
                    count={reactions.fire}
                    isActive={userReactions.includes("fire")}
                    onClick={() => handleReaction("fire")}
                    disabled={isPending}
                />
                <ReactionButton
                    icon={<Lightbulb size={14} strokeWidth={1.75} />}
                    label="💡"
                    count={reactions.creative}
                    isActive={userReactions.includes("creative")}
                    onClick={() => handleReaction("creative")}
                    disabled={isPending}
                />
                <ReactionButton
                    icon={<BarChart3 size={14} strokeWidth={1.75} />}
                    label="📊"
                    count={reactions.researched}
                    isActive={userReactions.includes("researched")}
                    onClick={() => handleReaction("researched")}
                    disabled={isPending}
                />
            </div>
        </motion.div>
    );
}

// ---------------------------------------------------------------------------
// Reaction Button sub-component
// ---------------------------------------------------------------------------

function ReactionButton({
    icon,
    label,
    count,
    isActive,
    onClick,
    disabled,
}: {
    icon: React.ReactNode;
    label: string;
    count: number;
    isActive: boolean;
    onClick: () => void;
    disabled: boolean;
}) {
    return (
        <motion.button
            type="button"
            className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-caption font-medium transition-colors"
            style={{
                backgroundColor: isActive
                    ? "var(--color-primary-50)"
                    : "var(--color-surface-50)",
                color: isActive
                    ? "var(--color-primary-600)"
                    : "var(--color-text-secondary)",
                border: isActive
                    ? "1px solid var(--color-primary-200)"
                    : "1px solid var(--color-surface-200)",
            }}
            whileTap={{ scale: 0.95 }}
            onClick={onClick}
            disabled={disabled}
            title={label}
        >
            {icon}
            <span style={{ fontFamily: "var(--font-mono)" }}>
                {count > 0 ? count : ""}
            </span>
        </motion.button>
    );
}
