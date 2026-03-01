"use client";

import { useState, useEffect, useTransition } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, Link as LinkIcon, X, Users } from "lucide-react";
import { GroupCard } from "@/components/social/GroupCard";
import {
    createGroup,
    joinGroupByCode,
    type StudyGroup,
} from "./actions";

// ---------------------------------------------------------------------------
// Props
// ---------------------------------------------------------------------------

interface GroupsClientProps {
    initialGroups: StudyGroup[];
    joinCode: string | null;
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export function GroupsClient({ initialGroups, joinCode }: GroupsClientProps) {
    const router = useRouter();
    const [showCreate, setShowCreate] = useState(false);
    const [showJoin, setShowJoin] = useState(false);
    const [groupName, setGroupName] = useState("");
    const [inviteCode, setInviteCode] = useState(joinCode || "");
    const [isPending, startTransition] = useTransition();
    const [error, setError] = useState<string | null>(null);

    // Auto-trigger join if joinCode is present
    useEffect(() => {
        if (joinCode) {
            setShowJoin(true);
            setInviteCode(joinCode);
        }
    }, [joinCode]);

    const myGroups = initialGroups.filter((g) => g.is_member);
    const otherGroups = initialGroups.filter((g) => !g.is_member);

    const handleCreate = () => {
        if (!groupName.trim()) return;
        setError(null);
        startTransition(async () => {
            try {
                await createGroup(groupName.trim());
                setGroupName("");
                setShowCreate(false);
                router.refresh();
            } catch (e: unknown) {
                setError(e instanceof Error ? e.message : "Ошибка");
            }
        });
    };

    const handleJoin = () => {
        if (!inviteCode.trim()) return;
        setError(null);
        startTransition(async () => {
            try {
                await joinGroupByCode(inviteCode.trim());
                setInviteCode("");
                setShowJoin(false);
                router.refresh();
            } catch (e: unknown) {
                setError(e instanceof Error ? e.message : "Ошибка");
            }
        });
    };

    const container = { hidden: {}, show: { transition: { staggerChildren: 0.06 } } };
    const item = { hidden: { opacity: 0, y: 12 }, show: { opacity: 1, y: 0 } };

    return (
        <div className="space-y-6">
            {/* Action buttons */}
            <div className="flex gap-3">
                <button
                    onClick={() => {
                        setShowCreate(!showCreate);
                        setShowJoin(false);
                    }}
                    className="flex items-center gap-2 px-4 py-2.5 rounded-lg text-body-sm font-semibold text-white transition-all"
                    style={{
                        background:
                            "linear-gradient(135deg, var(--color-primary-500), var(--color-primary-600))",
                    }}
                >
                    {showCreate ? <X size={16} /> : <Plus size={16} />}
                    {showCreate ? "Отмена" : "Создать группу"}
                </button>
                <button
                    onClick={() => {
                        setShowJoin(!showJoin);
                        setShowCreate(false);
                    }}
                    className="flex items-center gap-2 px-4 py-2.5 rounded-lg text-body-sm font-semibold border transition-all"
                    style={{
                        borderColor: "var(--color-surface-200)",
                        color: "var(--color-surface-700)",
                    }}
                >
                    <LinkIcon size={16} />
                    Вступить по коду
                </button>
            </div>

            {/* Error */}
            {error && (
                <div
                    className="p-3 rounded-lg text-body-sm"
                    style={{
                        backgroundColor: "rgba(239, 68, 68, 0.1)",
                        color: "#EF4444",
                    }}
                >
                    {error}
                </div>
            )}

            {/* Create form */}
            <AnimatePresence>
                {showCreate && (
                    <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        className="overflow-hidden"
                    >
                        <div className="p-5 rounded-xl border border-surface-200 bg-surface-0 shadow-sm space-y-3">
                            <input
                                type="text"
                                value={groupName}
                                onChange={(e) => setGroupName(e.target.value)}
                                placeholder="Название группы"
                                maxLength={50}
                                className="w-full px-3 py-2.5 rounded-lg border border-surface-200 text-body-sm text-surface-900 placeholder:text-surface-300 focus:outline-none focus:ring-2 focus:ring-primary-200 bg-surface-0"
                            />
                            <button
                                onClick={handleCreate}
                                disabled={isPending || !groupName.trim()}
                                className="px-5 py-2.5 rounded-lg text-body-sm font-semibold text-white transition-all disabled:opacity-50"
                                style={{
                                    background:
                                        "linear-gradient(135deg, var(--color-primary-500), var(--color-primary-600))",
                                }}
                            >
                                {isPending ? "Создаю..." : "Создать"}
                            </button>
                        </div>
                    </motion.div>
                )}

                {showJoin && (
                    <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        className="overflow-hidden"
                    >
                        <div className="p-5 rounded-xl border border-surface-200 bg-surface-0 shadow-sm space-y-3">
                            <input
                                type="text"
                                value={inviteCode}
                                onChange={(e) => setInviteCode(e.target.value)}
                                placeholder="Введи код приглашения (UUID)"
                                className="w-full px-3 py-2.5 rounded-lg border border-surface-200 text-body-sm text-surface-900 placeholder:text-surface-300 focus:outline-none focus:ring-2 focus:ring-primary-200 bg-surface-0"
                            />
                            <button
                                onClick={handleJoin}
                                disabled={isPending || !inviteCode.trim()}
                                className="px-5 py-2.5 rounded-lg text-body-sm font-semibold text-white transition-all disabled:opacity-50"
                                style={{
                                    background:
                                        "linear-gradient(135deg, var(--color-primary-500), var(--color-primary-600))",
                                }}
                            >
                                {isPending ? "Вступаю..." : "Вступить"}
                            </button>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* My Groups */}
            {myGroups.length > 0 && (
                <div>
                    <h2 className="text-h3 text-surface-900 mb-4">Мои группы</h2>
                    <motion.div
                        variants={container}
                        initial="hidden"
                        animate="show"
                        className="grid md:grid-cols-2 lg:grid-cols-3 gap-4"
                    >
                        {myGroups.map((group) => (
                            <motion.div key={group.id} variants={item}>
                                <GroupCard group={group} />
                            </motion.div>
                        ))}
                    </motion.div>
                </div>
            )}

            {/* Other groups */}
            {otherGroups.length > 0 && (
                <div>
                    <h2 className="text-h3 text-surface-900 mb-4">Другие группы</h2>
                    <motion.div
                        variants={container}
                        initial="hidden"
                        animate="show"
                        className="grid md:grid-cols-2 lg:grid-cols-3 gap-4"
                    >
                        {otherGroups.map((group) => (
                            <motion.div key={group.id} variants={item}>
                                <GroupCard group={group} />
                            </motion.div>
                        ))}
                    </motion.div>
                </div>
            )}

            {/* Empty state */}
            {initialGroups.length === 0 && (
                <div className="text-center py-16">
                    <Users
                        size={48}
                        strokeWidth={1.5}
                        className="mx-auto mb-4"
                        style={{ color: "var(--color-surface-300)" }}
                    />
                    <h3 className="text-h3 text-surface-500 mb-2">Пока нет групп</h3>
                    <p className="text-body-sm text-surface-400">
                        Создай первую группу и пригласи друзей по ссылке!
                    </p>
                </div>
            )}
        </div>
    );
}
