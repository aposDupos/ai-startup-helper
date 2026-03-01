"use client";

import { motion } from "framer-motion";
import { Mail, Star } from "lucide-react";
import { SKILL_LABELS, SKILL_COLORS, type Skill } from "@/lib/matching/algorithm";

// ---------------------------------------------------------------------------
// Stage helpers
// ---------------------------------------------------------------------------

const STAGE_MAP: Record<string, { label: string; emoji: string }> = {
    idea: { label: "Идея", emoji: "💡" },
    validation: { label: "Валидация", emoji: "🔍" },
    business_model: { label: "Бизнес-модель", emoji: "📊" },
    mvp: { label: "MVP", emoji: "🛠" },
    pitch: { label: "Питч", emoji: "🎤" },
};

// ---------------------------------------------------------------------------
// Props
// ---------------------------------------------------------------------------

interface MatchCardProps {
    profile: {
        id: string;
        display_name: string;
        avatar_url: string | null;
        skills: Skill[];
        bio: string | null;
        level: number;
        xp: number;
        project?: {
            title: string;
            stage: string;
        } | null;
    };
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export function MatchCard({ profile }: MatchCardProps) {
    const initial = profile.display_name.charAt(0).toUpperCase();
    const stage = profile.project
        ? STAGE_MAP[profile.project.stage] || { label: profile.project.stage, emoji: "📌" }
        : null;

    return (
        <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className="p-5 rounded-xl border border-surface-200 bg-surface-0 shadow-sm hover:shadow-md transition-all"
            style={{ transition: "box-shadow 200ms ease, transform 200ms ease" }}
            whileHover={{ y: -2 }}
        >
            {/* Header: avatar + name */}
            <div className="flex items-center gap-3 mb-3">
                <div
                    className="w-10 h-10 rounded-full flex items-center justify-center text-body-sm font-bold text-white shrink-0"
                    style={{
                        background:
                            "linear-gradient(135deg, var(--color-primary-500), var(--color-primary-600))",
                    }}
                >
                    {initial}
                </div>
                <div className="min-w-0 flex-1">
                    <h3 className="text-body-sm font-semibold text-surface-900 truncate">
                        {profile.display_name}
                    </h3>
                    <div className="flex items-center gap-1.5 text-caption text-surface-400">
                        <Star size={12} strokeWidth={1.75} />
                        <span>Level {profile.level}</span>
                        <span className="mx-1">·</span>
                        <span style={{ fontFamily: "var(--font-mono)" }}>
                            {profile.xp} XP
                        </span>
                    </div>
                </div>
            </div>

            {/* Skills */}
            <div className="flex flex-wrap gap-1.5 mb-3">
                {profile.skills.map((skill) => (
                    <span
                        key={skill}
                        className="text-[11px] font-semibold px-2.5 py-0.5 rounded-full text-white"
                        style={{
                            backgroundColor: SKILL_COLORS[skill] || "var(--color-surface-300)",
                        }}
                    >
                        {SKILL_LABELS[skill] || skill}
                    </span>
                ))}
            </div>

            {/* Bio */}
            {profile.bio && (
                <p className="text-body-sm text-surface-500 line-clamp-2 mb-3">
                    {profile.bio}
                </p>
            )}

            {/* Project stage */}
            {profile.project && stage && (
                <div className="flex items-center gap-2 mb-4 text-caption text-surface-500">
                    <span>{stage.emoji}</span>
                    <span className="font-medium">{profile.project.title}</span>
                    <span className="text-surface-300">·</span>
                    <span>{stage.label}</span>
                </div>
            )}

            {/* CTA */}
            <button
                onClick={() => {
                    // For now: open a placeholder contact action
                    // In the future: internal messaging
                    alert(
                        `Связаться с ${profile.display_name} — пока на платформе нет внутренних сообщений. Скоро!`
                    );
                }}
                className="w-full flex items-center justify-center gap-2 py-2.5 rounded-lg text-body-sm font-semibold text-white transition-all"
                style={{
                    background:
                        "linear-gradient(135deg, var(--color-primary-500), var(--color-primary-600))",
                }}
            >
                <Mail size={16} strokeWidth={1.75} />
                Написать
            </button>
        </motion.div>
    );
}
