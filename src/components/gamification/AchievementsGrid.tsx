"use client";

import { motion } from "framer-motion";
import type { UserAchievement } from "@/lib/gamification/achievements";
import { useState } from "react";

interface AchievementsGridProps {
    achievements: UserAchievement[];
}

export function AchievementsGrid({ achievements }: AchievementsGridProps) {
    const [selected, setSelected] = useState<UserAchievement | null>(null);

    const earned = achievements.filter((a) => a.earned);
    const locked = achievements.filter((a) => !a.earned);

    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between">
                <h3 className="text-h3 text-surface-900">🏆 Достижения</h3>
                <span className="text-body-sm text-surface-500">
                    {earned.length}/{achievements.length}
                </span>
            </div>

            {/* Grid */}
            <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-3">
                {achievements.map((ach, i) => (
                    <motion.button
                        key={ach.id}
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: 0.03 * i }}
                        onClick={() => setSelected(ach)}
                        className={`relative flex flex-col items-center gap-1.5 p-3 rounded-xl border transition-all 
                            ${ach.earned
                                ? "bg-surface-0 border-success-200 hover:border-success-300 shadow-sm"
                                : "bg-surface-50 border-surface-200 hover:border-surface-300 opacity-50"
                            }`}
                    >
                        <span className={`text-2xl ${ach.earned ? "" : "grayscale"}`}>
                            {ach.icon || "🏅"}
                        </span>
                        <span className="text-caption text-center text-surface-700 line-clamp-2">
                            {ach.title}
                        </span>
                        {ach.earned && (
                            <motion.div
                                initial={{ scale: 0 }}
                                animate={{ scale: 1 }}
                                className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-success-400 
                                    flex items-center justify-center text-white text-xs"
                            >
                                ✓
                            </motion.div>
                        )}
                    </motion.button>
                ))}
            </div>

            {/* Detail modal */}
            {selected && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4"
                    onClick={() => setSelected(null)}
                >
                    <motion.div
                        initial={{ scale: 0.9, y: 20 }}
                        animate={{ scale: 1, y: 0 }}
                        onClick={(e) => e.stopPropagation()}
                        className="bg-surface-0 rounded-2xl p-6 max-w-sm w-full shadow-xl space-y-3 text-center"
                    >
                        <span className="text-5xl block">{selected.icon || "🏅"}</span>
                        <h4 className="text-h3 text-surface-900">{selected.title}</h4>
                        <p className="text-body-sm text-surface-600">{selected.description}</p>

                        <div className="flex items-center justify-center gap-2 text-body-sm">
                            <span className="text-primary-500 font-medium">
                                +{selected.xp_reward} XP
                            </span>
                            <span className="text-surface-300">•</span>
                            <span className="text-surface-500 capitalize">
                                {selected.category}
                            </span>
                        </div>

                        {selected.earned ? (
                            <p className="text-caption text-success-500">
                                ✅ Получено{" "}
                                {selected.earned_at
                                    ? new Date(selected.earned_at).toLocaleDateString("ru-RU")
                                    : ""}
                            </p>
                        ) : (
                            <p className="text-caption text-surface-400">
                                🔒 Ещё не разблокировано
                            </p>
                        )}

                        <button
                            onClick={() => setSelected(null)}
                            className="px-4 py-2 rounded-lg bg-surface-100 text-surface-600 
                                hover:bg-surface-200 transition-colors text-body-sm"
                        >
                            Закрыть
                        </button>
                    </motion.div>
                </motion.div>
            )}
        </div>
    );
}
