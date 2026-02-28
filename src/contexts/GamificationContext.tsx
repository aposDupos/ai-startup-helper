"use client";

import React, { createContext, useContext, useState, useCallback, useEffect, useRef } from "react";
import { XPToast, type ToastEvent } from "@/components/gamification/XPToast";
import { LevelUpModal } from "@/components/gamification/LevelUpModal";
import { AchievementModal, type AchievementData } from "@/components/gamification/AchievementModal";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface InitialEvents {
    xpGained: number;
    streakCount: number;
    milestoneReached: number | null;
}

interface GamificationContextValue {
    showXPToast: (amount: number, description?: string) => void;
    showLevelUp: (level: number) => void;
    showAchievement: (title: string, icon?: string, description?: string, xpReward?: number) => void;
    showStreakToast: (count: number, milestone?: number | null) => void;
    triggerConfetti: () => void;
}

const GamificationContext = createContext<GamificationContextValue | null>(null);

// ---------------------------------------------------------------------------
// Hook
// ---------------------------------------------------------------------------

export function useGamification() {
    const ctx = useContext(GamificationContext);
    if (!ctx) {
        throw new Error("useGamification must be used within GamificationProvider");
    }
    return ctx;
}

// ---------------------------------------------------------------------------
// Provider
// ---------------------------------------------------------------------------

interface GamificationProviderProps {
    children: React.ReactNode;
    initialEvents?: InitialEvents | null;
}

export function GamificationProvider({ children, initialEvents }: GamificationProviderProps) {
    // Toast state (XP + streak — small toasts)
    const [toasts, setToasts] = useState<ToastEvent[]>([]);
    const nextToastId = useRef(0);
    const initialProcessed = useRef(false);

    // Level Up modal state
    const [levelUpLevel, setLevelUpLevel] = useState<number | null>(null);

    // Achievement queue state
    const [achievementQueue, setAchievementQueue] = useState<AchievementData[]>([]);
    const nextAchId = useRef(0);

    // -----------------------------------------------------------------------
    // Toast helpers (XP & streak — small bottom-right toasts)
    // -----------------------------------------------------------------------

    const addToast = useCallback((toast: Omit<ToastEvent, "id">) => {
        const id = ++nextToastId.current;
        setToasts((prev) => [...prev, { ...toast, id }]);
    }, []);

    const removeToast = useCallback((id: number) => {
        setToasts((prev) => prev.filter((t) => t.id !== id));
    }, []);

    const showXPToast = useCallback(
        (amount: number, description?: string) => {
            addToast({ type: "xp", amount, description });
        },
        [addToast]
    );

    const showStreakToast = useCallback(
        (count: number, milestone?: number | null) => {
            addToast({ type: "streak", streakCount: count, milestone });
        },
        [addToast]
    );

    // -----------------------------------------------------------------------
    // Level Up Modal
    // -----------------------------------------------------------------------

    const showLevelUp = useCallback((level: number) => {
        setLevelUpLevel(level);
    }, []);

    const dismissLevelUp = useCallback(() => {
        setLevelUpLevel(null);
    }, []);

    // -----------------------------------------------------------------------
    // Achievement Modal (queued)
    // -----------------------------------------------------------------------

    const showAchievement = useCallback(
        (title: string, icon?: string, description?: string, xpReward?: number) => {
            const id = ++nextAchId.current;
            setAchievementQueue((prev) => [
                ...prev,
                { id, title, icon: icon || "🏆", description, xpReward },
            ]);
        },
        []
    );

    const dismissAchievement = useCallback((id: number) => {
        setAchievementQueue((prev) => prev.filter((a) => a.id !== id));
    }, []);

    // -----------------------------------------------------------------------
    // Confetti helper (for stage completion, etc.)
    // -----------------------------------------------------------------------

    const triggerConfetti = useCallback(() => {
        // Dynamic import to avoid SSR issues
        import("canvas-confetti").then((mod) => {
            const fire = mod.default;
            const prefersReduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
            if (prefersReduced) return;

            fire({
                particleCount: 100,
                spread: 80,
                origin: { x: 0.5, y: 0.5 },
                colors: ["#6366F1", "#F97316", "#22C55E", "#FBBF24"],
            });
        });
    }, []);

    // -----------------------------------------------------------------------
    // Process initial events (streak update on SSR)
    // -----------------------------------------------------------------------

    useEffect(() => {
        if (initialEvents && !initialProcessed.current) {
            initialProcessed.current = true;

            const timer = setTimeout(() => {
                if (initialEvents.xpGained > 0) {
                    showXPToast(initialEvents.xpGained, "Ежедневная активность");
                }
                if (initialEvents.milestoneReached) {
                    showStreakToast(
                        initialEvents.streakCount,
                        initialEvents.milestoneReached
                    );
                }
            }, 800);

            return () => clearTimeout(timer);
        }
    }, [initialEvents, showXPToast, showStreakToast]);

    // -----------------------------------------------------------------------
    // Context value
    // -----------------------------------------------------------------------

    const value: GamificationContextValue = {
        showXPToast,
        showLevelUp,
        showAchievement,
        showStreakToast,
        triggerConfetti,
    };

    return (
        <GamificationContext.Provider value={value}>
            {children}

            {/* Small toasts (XP, streak) — bottom-right */}
            <XPToast toasts={toasts} onRemove={removeToast} />

            {/* Level Up — full-screen modal */}
            {levelUpLevel !== null && (
                <LevelUpModal level={levelUpLevel} onClose={dismissLevelUp} />
            )}

            {/* Achievement — bottom-center slide-up */}
            <AchievementModal queue={achievementQueue} onDismiss={dismissAchievement} />
        </GamificationContext.Provider>
    );
}
