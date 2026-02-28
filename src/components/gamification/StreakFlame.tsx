"use client";

import { motion } from "framer-motion";
import type { StreakInfo } from "@/lib/gamification/streaks";

interface StreakFlameProps {
    streak: StreakInfo;
}

export function StreakFlame({ streak }: StreakFlameProps) {
    const flameScale = Math.min(1 + streak.count * 0.05, 2);

    return (
        <div className="bg-surface-0 rounded-xl border border-surface-200 p-5">
            <div className="flex items-center gap-4">
                {/* Flame */}
                <motion.div
                    animate={{
                        scale: [flameScale, flameScale * 1.1, flameScale],
                        rotate: [0, -3, 3, 0],
                    }}
                    transition={{
                        duration: 1.5,
                        repeat: Infinity,
                        ease: "easeInOut",
                    }}
                    className="text-4xl"
                >
                    🔥
                </motion.div>

                <div className="flex-1">
                    <h3 className="text-h4 text-surface-900">
                        {streak.count} {streak.count === 1 ? "день" : streak.count < 5 ? "дня" : "дней"} подряд
                    </h3>
                    <p className="text-caption text-surface-500">
                        {streak.isActiveToday
                            ? "Сегодня отмечено ✅"
                            : "Зайди сегодня, чтобы не потерять серию!"}
                    </p>
                    {streak.nextMilestone && (
                        <p className="text-caption text-primary-500">
                            До награды: {streak.daysToNextMilestone} дн. (🎯 {streak.nextMilestone})
                        </p>
                    )}
                </div>

                {/* Streak days dots */}
                <div className="flex gap-1">
                    {Array.from({ length: 7 }).map((_, i) => (
                        <div
                            key={i}
                            className={`w-2.5 h-2.5 rounded-full transition-colors ${i < Math.min(streak.count, 7)
                                    ? "bg-accent-400"
                                    : "bg-surface-200"
                                }`}
                        />
                    ))}
                </div>
            </div>
        </div>
    );
}
