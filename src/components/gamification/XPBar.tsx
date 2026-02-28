"use client";

import { motion } from "framer-motion";
import type { UserXPInfo } from "@/lib/gamification/xp";

interface XPBarProps {
    xpInfo: UserXPInfo;
}

export function XPBar({ xpInfo }: XPBarProps) {
    return (
        <div className="bg-surface-0 rounded-xl border border-surface-200 p-5 space-y-3">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ type: "spring", stiffness: 400, damping: 15 }}
                        className="w-12 h-12 rounded-full bg-primary-100 flex items-center justify-center text-2xl"
                    >
                        {xpInfo.levelIcon}
                    </motion.div>
                    <div>
                        <h3 className="text-h4 text-surface-900">
                            Ур. {xpInfo.level} — {xpInfo.levelTitle}
                        </h3>
                        <p className="text-caption text-surface-500">
                            {xpInfo.xp} XP
                            {xpInfo.nextLevelXP
                                ? ` • ${xpInfo.xpToNextLevel} до след. уровня`
                                : " • Максимальный уровень! 🎉"}
                        </p>
                    </div>
                </div>
            </div>

            {/* Progress bar */}
            <div className="h-3 bg-surface-100 rounded-full overflow-hidden">
                <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${xpInfo.progress}%` }}
                    transition={{ duration: 0.8, ease: "easeOut" }}
                    className="h-full rounded-full bg-gradient-to-r from-primary-400 to-primary-600"
                />
            </div>

            {xpInfo.nextLevelXP && (
                <div className="flex justify-between text-caption text-surface-400">
                    <span>Ур. {xpInfo.level}</span>
                    <span>Ур. {xpInfo.level + 1}</span>
                </div>
            )}
        </div>
    );
}
