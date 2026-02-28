"use client";

import React, { createContext, useContext, useState, useCallback, useEffect, useRef } from "react";
import { XPToast, type ToastEvent } from "@/components/gamification/XPToast";

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
    showLevelUpToast: (level: number) => void;
    showAchievementToast: (title: string, icon?: string) => void;
    showStreakToast: (count: number, milestone?: number | null) => void;
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
    const [toasts, setToasts] = useState<ToastEvent[]>([]);
    const nextId = useRef(0);
    const initialProcessed = useRef(false);

    const addToast = useCallback((toast: Omit<ToastEvent, "id">) => {
        const id = ++nextId.current;
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

    const showLevelUpToast = useCallback(
        (level: number) => {
            addToast({ type: "level_up", level });
        },
        [addToast]
    );

    const showAchievementToast = useCallback(
        (title: string, icon?: string) => {
            addToast({ type: "achievement", title, icon });
        },
        [addToast]
    );

    const showStreakToast = useCallback(
        (count: number, milestone?: number | null) => {
            addToast({ type: "streak", streakCount: count, milestone });
        },
        [addToast]
    );

    // Process initial events (streak update on SSR)
    useEffect(() => {
        if (initialEvents && !initialProcessed.current) {
            initialProcessed.current = true;

            // Delay slightly so page has a chance to render
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

    const value: GamificationContextValue = {
        showXPToast,
        showLevelUpToast,
        showAchievementToast,
        showStreakToast,
    };

    return (
        <GamificationContext.Provider value={value}>
            {children}
            <XPToast toasts={toasts} onRemove={removeToast} />
        </GamificationContext.Provider>
    );
}
