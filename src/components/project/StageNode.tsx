"use client";

import { motion } from "framer-motion";
import type { StageDefinition, StageStatus } from "@/types/project";

interface StageNodeProps {
    stage: StageDefinition;
    status: StageStatus;
    isActive: boolean;
    onClick: () => void;
}

const statusConfig: Record<StageStatus, {
    bg: string;
    border: string;
    textColor: string;
    opacity: number;
    glow: boolean;
}> = {
    completed: {
        bg: "var(--color-primary-500)",
        border: "var(--color-primary-500)",
        textColor: "var(--color-primary-600)",
        opacity: 1,
        glow: false,
    },
    in_progress: {
        bg: "var(--color-primary-50)",
        border: "var(--color-primary-500)",
        textColor: "var(--color-primary-600)",
        opacity: 1,
        glow: true,
    },
    locked: {
        bg: "var(--color-surface-100)",
        border: "var(--color-surface-200)",
        textColor: "var(--color-text-tertiary)",
        opacity: 0.6,
        glow: false,
    },
    needs_revision: {
        bg: "var(--color-warning-400)",
        border: "var(--color-warning-500)",
        textColor: "var(--color-warning-500)",
        opacity: 1,
        glow: true,
    },
};

export function StageNode({ stage, status, isActive, onClick }: StageNodeProps) {
    const config = statusConfig[status];

    return (
        <motion.button
            onClick={onClick}
            className="flex flex-col items-center gap-2 cursor-pointer relative group"
            style={{ opacity: config.opacity }}
            whileHover={status !== "locked" ? { scale: 1.08 } : undefined}
            whileTap={status !== "locked" ? { scale: 0.95 } : undefined}
        >
            {/* Node circle */}
            <motion.div
                className="w-14 h-14 md:w-16 md:h-16 rounded-full flex items-center justify-center text-2xl relative"
                style={{
                    backgroundColor: config.bg,
                    border: `2.5px solid ${config.border}`,
                    boxShadow: config.glow
                        ? "var(--shadow-glow-primary)"
                        : "var(--shadow-xs)",
                }}
                animate={
                    status === "in_progress"
                        ? {
                            boxShadow: [
                                "0 0 20px rgba(99, 102, 241, 0.15)",
                                "0 0 30px rgba(99, 102, 241, 0.35)",
                                "0 0 20px rgba(99, 102, 241, 0.15)",
                            ],
                        }
                        : undefined
                }
                transition={
                    status === "in_progress"
                        ? { duration: 2, repeat: Infinity, ease: "easeInOut" }
                        : undefined
                }
            >
                {status === "completed" ? (
                    <span className="text-white text-lg">✓</span>
                ) : status === "needs_revision" ? (
                    <span className="text-lg">⚠️</span>
                ) : (
                    <span>{stage.emoji}</span>
                )}
            </motion.div>

            {/* Label */}
            <span
                className="text-caption font-semibold text-center leading-tight max-w-[80px]"
                style={{ color: config.textColor }}
            >
                {stage.label}
            </span>

            {/* Active indicator */}
            {isActive && (
                <motion.div
                    layoutId="active-stage-indicator"
                    className="absolute -bottom-1 w-1.5 h-1.5 rounded-full"
                    style={{ backgroundColor: "var(--color-primary-500)" }}
                />
            )}
        </motion.button>
    );
}
