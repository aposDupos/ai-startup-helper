"use client";

import { motion } from "framer-motion";
import type { LeaderboardEntry } from "@/lib/gamification/leaderboard";
import { Trophy } from "lucide-react";

interface LeaderboardTableProps {
    entries: LeaderboardEntry[];
    currentUserId: string;
}

const rankEmojis: Record<number, string> = {
    1: "🥇",
    2: "🥈",
    3: "🥉",
};

export function LeaderboardTable({ entries, currentUserId }: LeaderboardTableProps) {
    return (
        <div className="bg-surface-0 rounded-xl border border-surface-200 overflow-hidden">
            <div className="px-5 py-4 border-b border-surface-100 flex items-center gap-2">
                <Trophy size={20} className="text-accent-500" strokeWidth={1.75} />
                <h3 className="text-h3 text-surface-900">Лидерборд</h3>
            </div>

            <div className="divide-y divide-surface-100">
                {entries.map((entry, i) => {
                    const isCurrentUser = entry.id === currentUserId;

                    return (
                        <motion.div
                            key={entry.id}
                            initial={{ opacity: 0, x: -10 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.04 * i }}
                            className={`flex items-center gap-4 px-5 py-3 transition-colors ${isCurrentUser
                                    ? "bg-primary-50 border-l-2 border-l-primary-400"
                                    : "hover:bg-surface-50"
                                }`}
                        >
                            {/* Rank */}
                            <span className="w-8 text-center font-mono font-bold text-surface-600">
                                {rankEmojis[entry.rank] || entry.rank}
                            </span>

                            {/* Avatar */}
                            <div className="w-9 h-9 rounded-full bg-surface-200 flex items-center justify-center text-surface-500 text-sm overflow-hidden flex-shrink-0">
                                {entry.avatar_url ? (
                                    <img
                                        src={entry.avatar_url}
                                        alt=""
                                        className="w-full h-full object-cover"
                                    />
                                ) : (
                                    entry.display_name.charAt(0).toUpperCase()
                                )}
                            </div>

                            {/* Name */}
                            <div className="flex-1 min-w-0">
                                <p className={`text-body-sm truncate ${isCurrentUser ? "text-primary-700 font-medium" : "text-surface-800"}`}>
                                    {entry.display_name}
                                    {isCurrentUser && " (вы)"}
                                </p>
                                <p className="text-caption text-surface-400">
                                    Ур. {entry.level}
                                    {entry.streak_count > 0 && ` • 🔥 ${entry.streak_count}`}
                                </p>
                            </div>

                            {/* XP */}
                            <span className="text-body-sm font-mono font-medium text-primary-600">
                                {entry.xp.toLocaleString()} XP
                            </span>
                        </motion.div>
                    );
                })}

                {entries.length === 0 && (
                    <div className="px-5 py-8 text-center text-body-sm text-surface-500">
                        Пока нет данных. Будьте первым!
                    </div>
                )}
            </div>
        </div>
    );
}
