"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Users, Copy, Check, LogOut, Star } from "lucide-react";
import { leaveGroup, type StudyGroup } from "@/app/(main)/groups/actions";

// ---------------------------------------------------------------------------
// Stage map
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

interface GroupCardProps {
    group: StudyGroup;
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export function GroupCard({ group }: GroupCardProps) {
    const [copied, setCopied] = useState(false);
    const stageInfo = STAGE_MAP[group.current_stage] || STAGE_MAP.idea;

    const inviteLink = `${typeof window !== "undefined" ? window.location.origin : ""}/groups?join=${group.invite_code}`;

    const handleCopyLink = () => {
        navigator.clipboard.writeText(inviteLink);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    const handleLeave = async () => {
        if (confirm("Точно хочешь выйти из группы?")) {
            await leaveGroup(group.id);
        }
    };

    return (
        <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className="p-5 rounded-xl border border-surface-200 bg-surface-0 shadow-sm hover:shadow-md transition-all"
            whileHover={{ y: -2 }}
        >
            {/* Header */}
            <div className="flex items-start justify-between mb-3">
                <div>
                    <h3 className="text-body font-semibold text-surface-900">{group.name}</h3>
                    <p className="text-caption text-surface-500 mt-0.5">
                        {stageInfo.emoji} {stageInfo.label} · от {group.creator_name}
                    </p>
                </div>
                <div
                    className="text-caption font-semibold px-2.5 py-1 rounded-full"
                    style={{
                        backgroundColor: "var(--color-primary-50)",
                        color: "var(--color-primary-600)",
                    }}
                >
                    {group.member_count}/{group.max_members}
                </div>
            </div>

            {/* Members */}
            <div className="flex items-center gap-1 mb-4">
                {group.members.slice(0, 5).map((member, i) => (
                    <div
                        key={member.user_id}
                        className="w-7 h-7 rounded-full flex items-center justify-center text-[10px] font-bold text-white border-2 border-surface-0"
                        style={{
                            background: `linear-gradient(135deg, var(--color-primary-${400 + (i % 3) * 100}), var(--color-primary-${500 + (i % 3) * 100}))`,
                            marginLeft: i > 0 ? "-6px" : "0",
                            zIndex: 5 - i,
                            position: "relative",
                        }}
                        title={`${member.display_name} · Level ${member.level}`}
                    >
                        {member.display_name.charAt(0).toUpperCase()}
                    </div>
                ))}
                {group.members.length > 5 && (
                    <span
                        className="text-caption text-surface-400 ml-1"
                        style={{ position: "relative", zIndex: 0 }}
                    >
                        +{group.members.length - 5}
                    </span>
                )}
            </div>

            {/* Actions */}
            <div className="flex gap-2">
                {group.is_member && (
                    <>
                        <button
                            onClick={handleCopyLink}
                            className="flex-1 flex items-center justify-center gap-2 py-2 rounded-lg text-caption font-semibold border transition-all"
                            style={{
                                borderColor: "var(--color-surface-200)",
                                color: "var(--color-surface-600)",
                            }}
                        >
                            {copied ? (
                                <>
                                    <Check size={14} /> Скопировано!
                                </>
                            ) : (
                                <>
                                    <Copy size={14} /> Ссылка
                                </>
                            )}
                        </button>
                        <button
                            onClick={handleLeave}
                            className="flex items-center justify-center gap-1 px-3 py-2 rounded-lg text-caption font-semibold transition-all"
                            style={{
                                color: "var(--color-surface-400)",
                            }}
                            title="Выйти из группы"
                        >
                            <LogOut size={14} />
                        </button>
                    </>
                )}
            </div>
        </motion.div>
    );
}
