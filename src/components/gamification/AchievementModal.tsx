"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface AchievementData {
    id: number;
    title: string;
    description?: string;
    icon: string;
    xpReward?: number;
}

interface AchievementModalProps {
    queue: AchievementData[];
    onDismiss: (id: number) => void;
}

// ---------------------------------------------------------------------------
// Single achievement card
// ---------------------------------------------------------------------------

function AchievementCard({
    achievement,
    onDismiss,
}: {
    achievement: AchievementData;
    onDismiss: () => void;
}) {
    const [progress, setProgress] = useState(100);

    // Auto-dismiss countdown (5 seconds)
    useEffect(() => {
        const duration = 5000;
        const interval = 50;
        const step = (interval / duration) * 100;

        const timer = setInterval(() => {
            setProgress((prev) => {
                const next = prev - step;
                if (next <= 0) {
                    clearInterval(timer);
                    onDismiss();
                    return 0;
                }
                return next;
            });
        }, interval);

        return () => clearInterval(timer);
    }, [onDismiss]);

    return (
        <motion.div
            layout
            initial={{ y: 120, opacity: 0, scale: 0.9 }}
            animate={{ y: 0, opacity: 1, scale: 1 }}
            exit={{ y: 80, opacity: 0, scale: 0.9 }}
            transition={{ type: "spring", stiffness: 350, damping: 25 }}
            onClick={onDismiss}
            className="cursor-pointer pointer-events-auto"
        >
            <div
                className="relative overflow-hidden flex items-center gap-4 px-5 py-4 rounded-2xl shadow-lg min-w-[300px] max-w-[400px]"
                style={{
                    background: "linear-gradient(135deg, rgba(34,197,94,0.95), rgba(22,163,74,0.95))",
                    border: "1px solid rgba(255,255,255,0.2)",
                }}
            >
                {/* Badge icon */}
                <motion.div
                    className="w-14 h-14 rounded-xl flex items-center justify-center flex-shrink-0"
                    style={{
                        background: "rgba(255,255,255,0.2)",
                        backdropFilter: "blur(8px)",
                    }}
                    initial={{ scale: 0, rotate: -90 }}
                    animate={{ scale: 1, rotate: 0 }}
                    transition={{ type: "spring", stiffness: 400, damping: 15, delay: 0.15 }}
                >
                    <span className="text-3xl">{achievement.icon}</span>
                </motion.div>

                {/* Text */}
                <div className="flex-1 min-w-0">
                    <motion.p
                        className="text-[10px] font-bold uppercase tracking-widest text-white/70 mb-0.5"
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.2 }}
                    >
                        🏆 Достижение
                    </motion.p>
                    <motion.p
                        className="text-sm font-bold text-white truncate"
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.25 }}
                    >
                        {achievement.title}
                    </motion.p>
                    {achievement.description && (
                        <motion.p
                            className="text-xs text-white/80 truncate mt-0.5"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: 0.3 }}
                        >
                            {achievement.description}
                        </motion.p>
                    )}
                </div>

                {/* XP badge */}
                {achievement.xpReward && achievement.xpReward > 0 && (
                    <motion.div
                        className="flex-shrink-0 px-2.5 py-1 rounded-full text-xs font-bold"
                        style={{
                            background: "rgba(255,255,255,0.25)",
                            color: "white",
                            fontFamily: "var(--font-mono, monospace)",
                        }}
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ type: "spring", stiffness: 500, damping: 15, delay: 0.3 }}
                    >
                        +{achievement.xpReward} XP
                    </motion.div>
                )}

                {/* Progress bar (countdown) */}
                <div
                    className="absolute bottom-0 left-0 right-0 h-[3px]"
                    style={{ background: "rgba(255,255,255,0.15)" }}
                >
                    <motion.div
                        className="h-full"
                        style={{
                            width: `${progress}%`,
                            background: "rgba(255,255,255,0.5)",
                            transition: "width 50ms linear",
                        }}
                    />
                </div>
            </div>
        </motion.div>
    );
}

// ---------------------------------------------------------------------------
// Main component — shows first item from queue
// ---------------------------------------------------------------------------

export function AchievementModal({ queue, onDismiss }: AchievementModalProps) {
    const current = queue[0];

    if (!current) return null;

    return (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-[90] pointer-events-none">
            <AnimatePresence mode="wait">
                <AchievementCard
                    key={current.id}
                    achievement={current}
                    onDismiss={() => onDismiss(current.id)}
                />
            </AnimatePresence>
        </div>
    );
}
