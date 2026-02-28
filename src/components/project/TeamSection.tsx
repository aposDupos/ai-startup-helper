"use client";

import { useState, useTransition } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { UserPlus, X, Users } from "lucide-react";
import { addTeamMember, removeTeamMember } from "@/app/(main)/dashboard/actions";
import type { TeamMember, TeamRole } from "@/types/project";

const ROLES: { value: TeamRole; label: string; emoji: string }[] = [
    { value: "hustler", label: "Hustler", emoji: "💼" },
    { value: "hacker", label: "Hacker", emoji: "💻" },
    { value: "hipster", label: "Hipster", emoji: "🎨" },
];

interface TeamSectionProps {
    projectId: string;
    initialMembers: TeamMember[];
}

export function TeamSection({ projectId, initialMembers }: TeamSectionProps) {
    const [members, setMembers] = useState<TeamMember[]>(initialMembers);
    const [isAdding, setIsAdding] = useState(false);
    const [newName, setNewName] = useState("");
    const [newRole, setNewRole] = useState<TeamRole>("hustler");
    const [isPending, startTransition] = useTransition();

    function handleAdd() {
        if (!newName.trim()) return;

        startTransition(async () => {
            const updated = await addTeamMember(projectId, {
                name: newName.trim(),
                role: newRole,
            });
            setMembers(updated);
            setNewName("");
            setIsAdding(false);
        });
    }

    function handleRemove(memberId: string) {
        startTransition(async () => {
            const updated = await removeTeamMember(projectId, memberId);
            setMembers(updated);
        });
    }

    return (
        <div className="p-6 rounded-xl bg-surface-0 border border-surface-200 shadow-sm">
            <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                    <Users size={18} strokeWidth={1.75} className="text-surface-500" />
                    <h3 className="text-h4 text-surface-900">Команда</h3>
                </div>
                <button
                    onClick={() => setIsAdding(!isAdding)}
                    className="p-1.5 rounded-lg transition-colors cursor-pointer hover:bg-surface-100"
                >
                    <UserPlus size={18} strokeWidth={1.75} className="text-surface-400" />
                </button>
            </div>

            {/* Add member form */}
            <AnimatePresence>
                {isAdding && (
                    <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        exit={{ opacity: 0, height: 0 }}
                        className="overflow-hidden mb-3"
                    >
                        <div className="flex items-center gap-2 p-3 rounded-lg bg-surface-50">
                            <input
                                type="text"
                                value={newName}
                                onChange={(e) => setNewName(e.target.value)}
                                placeholder="Имя участника"
                                className="flex-1 px-3 py-1.5 rounded-lg text-body-sm bg-surface-0 border border-surface-200 outline-none focus:border-primary-500 transition-colors"
                                onKeyDown={(e) => e.key === "Enter" && handleAdd()}
                                autoFocus
                            />
                            <select
                                value={newRole}
                                onChange={(e) => setNewRole(e.target.value as TeamRole)}
                                className="px-2 py-1.5 rounded-lg text-body-sm bg-surface-0 border border-surface-200 outline-none cursor-pointer"
                            >
                                {ROLES.map((r) => (
                                    <option key={r.value} value={r.value}>
                                        {r.emoji} {r.label}
                                    </option>
                                ))}
                            </select>
                            <button
                                onClick={handleAdd}
                                disabled={!newName.trim() || isPending}
                                className="px-3 py-1.5 rounded-lg text-caption font-semibold text-white cursor-pointer disabled:opacity-50 transition-colors"
                                style={{
                                    background: "linear-gradient(135deg, var(--color-primary-500), var(--color-primary-600))",
                                }}
                            >
                                +
                            </button>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Members list */}
            {members.length === 0 ? (
                <p className="text-caption text-surface-400 text-center py-4">
                    Добавь участников команды
                </p>
            ) : (
                <div className="space-y-2">
                    {members.map((member) => {
                        const role = ROLES.find((r) => r.value === member.role);
                        return (
                            <motion.div
                                key={member.id}
                                layout
                                initial={{ opacity: 0, x: -10 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: 10 }}
                                className="flex items-center justify-between p-2.5 rounded-lg hover:bg-surface-50 transition-colors group"
                            >
                                <div className="flex items-center gap-2.5">
                                    <div
                                        className="w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold text-white"
                                        style={{
                                            background:
                                                member.role === "hustler"
                                                    ? "linear-gradient(135deg, var(--color-accent-400), var(--color-accent-600))"
                                                    : member.role === "hacker"
                                                        ? "linear-gradient(135deg, var(--color-primary-400), var(--color-primary-600))"
                                                        : "linear-gradient(135deg, #EC4899, #DB2777)",
                                        }}
                                    >
                                        {member.name.charAt(0).toUpperCase()}
                                    </div>
                                    <div>
                                        <p className="text-body-sm font-medium text-surface-900">
                                            {member.name}
                                        </p>
                                        <p className="text-caption text-surface-400">
                                            {role?.emoji} {role?.label}
                                        </p>
                                    </div>
                                </div>
                                <button
                                    onClick={() => handleRemove(member.id)}
                                    className="opacity-0 group-hover:opacity-100 p-1 rounded transition-opacity cursor-pointer"
                                >
                                    <X size={14} strokeWidth={1.75} className="text-surface-400" />
                                </button>
                            </motion.div>
                        );
                    })}
                </div>
            )}
        </div>
    );
}
