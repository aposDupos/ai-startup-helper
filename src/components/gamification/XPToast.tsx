"use client";

import { useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface ToastEvent {
    id: number;
    type: "xp" | "level_up" | "achievement" | "streak";
    amount?: number;
    description?: string;
    level?: number;
    title?: string;
    icon?: string;
    streakCount?: number;
    milestone?: number | null;
}

interface XPToastProps {
    toasts: ToastEvent[];
    onRemove: (id: number) => void;
}

// ---------------------------------------------------------------------------
// Auto-dismiss hook
// ---------------------------------------------------------------------------

function useAutoDismiss(id: number, onRemove: (id: number) => void, duration = 3000) {
    useEffect(() => {
        const timer = setTimeout(() => onRemove(id), duration);
        return () => clearTimeout(timer);
    }, [id, onRemove, duration]);
}

// ---------------------------------------------------------------------------
// Individual toast item
// ---------------------------------------------------------------------------

function ToastItem({ toast, onRemove }: { toast: ToastEvent; onRemove: (id: number) => void }) {
    const isLevelUp = toast.type === "level_up";
    useAutoDismiss(toast.id, onRemove, isLevelUp ? 4000 : 3000);

    return (
        <motion.div
            layout
            initial={{ opacity: 0, x: 80, scale: 0.85 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            exit={{ opacity: 0, x: 80, scale: 0.85 }}
            transition={{ type: "spring", stiffness: 400, damping: 25 }}
            className="pointer-events-auto"
        >
            <div
                className="flex items-center gap-3 px-4 py-3 rounded-xl shadow-lg backdrop-blur-sm min-w-[200px]"
                style={{
                    background: getBackground(toast.type),
                    border: "1px solid rgba(255,255,255,0.15)",
                }}
            >
                <motion.span
                    initial={{ scale: 0, rotate: -180 }}
                    animate={{ scale: 1, rotate: 0 }}
                    transition={{ type: "spring", stiffness: 500, damping: 15, delay: 0.1 }}
                    className="text-xl"
                >
                    {getIcon(toast)}
                </motion.span>

                <div className="flex flex-col">
                    <motion.span
                        initial={{ opacity: 0, y: 5 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.15 }}
                        className="text-white font-semibold text-sm"
                        style={{ fontFamily: "var(--font-mono, monospace)" }}
                    >
                        {getTitle(toast)}
                    </motion.span>
                    {getSubtitle(toast) && (
                        <motion.span
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 0.8 }}
                            transition={{ delay: 0.25 }}
                            className="text-white/70 text-xs"
                        >
                            {getSubtitle(toast)}
                        </motion.span>
                    )}
                </div>
            </div>
        </motion.div>
    );
}

// ---------------------------------------------------------------------------
// Main component
// ---------------------------------------------------------------------------

export function XPToast({ toasts, onRemove }: XPToastProps) {
    return (
        <div className="fixed bottom-6 right-6 z-50 flex flex-col gap-2 items-end pointer-events-none">
            <AnimatePresence mode="popLayout">
                {toasts.map((toast) => (
                    <ToastItem key={toast.id} toast={toast} onRemove={onRemove} />
                ))}
            </AnimatePresence>
        </div>
    );
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function getBackground(type: ToastEvent["type"]): string {
    switch (type) {
        case "xp":
            return "linear-gradient(135deg, rgba(99,102,241,0.92), rgba(79,70,229,0.92))";
        case "level_up":
            return "linear-gradient(135deg, rgba(249,115,22,0.95), rgba(234,88,12,0.95))";
        case "achievement":
            return "linear-gradient(135deg, rgba(34,197,94,0.92), rgba(22,163,74,0.92))";
        case "streak":
            return "linear-gradient(135deg, rgba(249,115,22,0.92), rgba(239,68,68,0.92))";
    }
}

function getIcon(toast: ToastEvent): string {
    switch (toast.type) {
        case "xp":
            return "⭐";
        case "level_up":
            return "🎉";
        case "achievement":
            return toast.icon || "🏆";
        case "streak":
            return "🔥";
    }
}

function getTitle(toast: ToastEvent): string {
    switch (toast.type) {
        case "xp":
            return `+${toast.amount} XP`;
        case "level_up":
            return `Level Up! → ${toast.level}`;
        case "achievement":
            return toast.title || "Achievement Unlocked!";
        case "streak":
            return toast.milestone
                ? `🔥 ${toast.streakCount} дней подряд!`
                : `🔥 Streak: ${toast.streakCount}`;
    }
}

function getSubtitle(toast: ToastEvent): string | null {
    switch (toast.type) {
        case "xp":
            return toast.description || null;
        case "level_up":
            return "Поздравляем! 🚀";
        case "achievement":
            return "Новое достижение!";
        case "streak":
            return toast.milestone ? "Бонус XP начислен!" : null;
    }
}
