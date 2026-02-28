"use client";

import { useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import confetti from "canvas-confetti";

// ---------------------------------------------------------------------------
// Level data (mirrored from DB `levels` table — 5 fixed levels)
// ---------------------------------------------------------------------------

const LEVEL_DATA: Record<number, { title: string; icon: string }> = {
    1: { title: "Dreamer", icon: "💭" },
    2: { title: "Explorer", icon: "🔍" },
    3: { title: "Builder", icon: "🔨" },
    4: { title: "Launcher", icon: "🚀" },
    5: { title: "Founder", icon: "👑" },
};

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

interface LevelUpModalProps {
    level: number;
    onClose: () => void;
}

export function LevelUpModal({ level, onClose }: LevelUpModalProps) {
    const data = LEVEL_DATA[level] || { title: `Level ${level}`, icon: "⭐" };

    const fireConfetti = useCallback(() => {
        // Check for reduced motion preference
        const prefersReduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
        if (prefersReduced) return;

        // Burst from left
        confetti({
            particleCount: 80,
            spread: 70,
            origin: { x: 0.2, y: 0.6 },
            colors: ["#6366F1", "#818CF8", "#F97316", "#FB923C", "#22C55E"],
        });
        // Burst from right
        confetti({
            particleCount: 80,
            spread: 70,
            origin: { x: 0.8, y: 0.6 },
            colors: ["#6366F1", "#818CF8", "#F97316", "#FB923C", "#22C55E"],
        });

        // Second wave after 300ms
        setTimeout(() => {
            confetti({
                particleCount: 50,
                spread: 100,
                origin: { x: 0.5, y: 0.4 },
                colors: ["#6366F1", "#F97316", "#22C55E", "#FBBF24"],
            });
        }, 300);
    }, []);

    useEffect(() => {
        fireConfetti();
    }, [fireConfetti]);

    return (
        <AnimatePresence>
            <motion.div
                className="fixed inset-0 z-[100] flex items-center justify-center"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.2 }}
            >
                {/* Backdrop */}
                <motion.div
                    className="absolute inset-0 bg-surface-950/60 backdrop-blur-sm"
                    onClick={onClose}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                />

                {/* Modal card */}
                <motion.div
                    className="relative z-10 bg-surface-0 rounded-2xl shadow-lg p-8 max-w-sm w-[90%] text-center border border-surface-200"
                    initial={{ scale: 0.5, opacity: 0, y: 40 }}
                    animate={{ scale: 1, opacity: 1, y: 0 }}
                    exit={{ scale: 0.8, opacity: 0, y: 20 }}
                    transition={{
                        type: "spring",
                        stiffness: 350,
                        damping: 22,
                        delay: 0.1,
                    }}
                >
                    {/* Glow ring behind the icon */}
                    <motion.div
                        className="mx-auto mb-4 w-24 h-24 rounded-full flex items-center justify-center"
                        style={{
                            background:
                                "linear-gradient(135deg, var(--color-primary-400), var(--color-accent-500))",
                            boxShadow: "0 0 40px rgba(99,102,241,0.3), 0 0 80px rgba(249,115,22,0.15)",
                        }}
                        initial={{ scale: 0, rotate: -180 }}
                        animate={{ scale: 1, rotate: 0 }}
                        transition={{
                            type: "spring",
                            stiffness: 300,
                            damping: 15,
                            delay: 0.2,
                        }}
                    >
                        <span className="text-5xl" role="img" aria-label={data.title}>
                            {data.icon}
                        </span>
                    </motion.div>

                    {/* Title */}
                    <motion.p
                        className="text-caption uppercase tracking-widest text-primary-500 font-bold mb-1"
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.35 }}
                    >
                        Новый уровень!
                    </motion.p>

                    <motion.h2
                        className="text-h1 text-surface-900 mb-1"
                        style={{ fontFamily: "var(--font-heading)" }}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.4 }}
                    >
                        Level {level}
                    </motion.h2>

                    <motion.p
                        className="text-body-lg text-surface-500 mb-6"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.5 }}
                    >
                        {data.title}
                    </motion.p>

                    <motion.p
                        className="text-body-sm text-surface-400 mb-6"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.55 }}
                    >
                        Отличная работа! Продолжай двигаться вперёд 🚀
                    </motion.p>

                    {/* CTA */}
                    <motion.button
                        onClick={onClose}
                        className="w-full py-3 rounded-lg text-body font-semibold text-white cursor-pointer"
                        style={{
                            background: "linear-gradient(135deg, var(--color-primary-500), var(--color-primary-700))",
                            boxShadow: "var(--shadow-glow-primary)",
                        }}
                        whileHover={{ scale: 1.02, y: -1 }}
                        whileTap={{ scale: 0.97 }}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.6 }}
                    >
                        Продолжить
                    </motion.button>
                </motion.div>
            </motion.div>
        </AnimatePresence>
    );
}
