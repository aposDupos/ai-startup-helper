"use client";

import { useState, useTransition } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Settings, Search, Sparkles, Check } from "lucide-react";
import { MatchCard } from "@/components/social/MatchCard";
import { updateMatchingProfile, type MatchProfile } from "./actions";
import { SKILL_LABELS, SKILL_COLORS, type Skill } from "@/lib/matching/algorithm";

// ---------------------------------------------------------------------------
// All available skills
// ---------------------------------------------------------------------------

const ALL_SKILLS: Skill[] = ["dev", "design", "marketing", "sales", "finance", "product"];

// ---------------------------------------------------------------------------
// Props
// ---------------------------------------------------------------------------

interface MatchPageClientProps {
    initialMatches: MatchProfile[];
    myProfile: {
        skills: string[] | null;
        bio: string | null;
        looking_for_cofounder: boolean | null;
    } | null;
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export function MatchPageClient({ initialMatches, myProfile }: MatchPageClientProps) {
    const [showSettings, setShowSettings] = useState(!myProfile?.looking_for_cofounder);
    const [selectedSkills, setSelectedSkills] = useState<Skill[]>(
        (myProfile?.skills as Skill[]) || []
    );
    const [bio, setBio] = useState(myProfile?.bio || "");
    const [lookingFor, setLookingFor] = useState(myProfile?.looking_for_cofounder ?? false);
    const [isPending, startTransition] = useTransition();
    const [saved, setSaved] = useState(false);

    const toggleSkill = (skill: Skill) => {
        setSelectedSkills((prev) =>
            prev.includes(skill) ? prev.filter((s) => s !== skill) : [...prev, skill]
        );
    };

    const handleSave = () => {
        startTransition(async () => {
            await updateMatchingProfile({
                skills: selectedSkills,
                bio,
                looking_for_cofounder: lookingFor,
            });
            setSaved(true);
            setTimeout(() => setSaved(false), 2000);
        });
    };

    const container = { hidden: {}, show: { transition: { staggerChildren: 0.06 } } };
    const item = { hidden: { opacity: 0, y: 12 }, show: { opacity: 1, y: 0 } };

    return (
        <div className="space-y-6">
            {/* Profile Settings Card */}
            <div className="p-6 rounded-xl border border-surface-200 bg-surface-0 shadow-sm">
                <button
                    onClick={() => setShowSettings(!showSettings)}
                    className="flex items-center gap-2 text-body-sm font-semibold text-surface-900 w-full"
                >
                    <Settings size={18} strokeWidth={1.75} className="text-primary-500" />
                    Мой профиль для матчинга
                    <span className="ml-auto text-caption text-surface-400">
                        {showSettings ? "Свернуть" : "Развернуть"}
                    </span>
                </button>

                <AnimatePresence>
                    {showSettings && (
                        <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: "auto", opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            transition={{ duration: 0.25 }}
                            className="overflow-hidden"
                        >
                            <div className="mt-4 space-y-4">
                                {/* Looking for co-founder toggle */}
                                <label className="flex items-center gap-3 cursor-pointer">
                                    <div
                                        onClick={() => setLookingFor(!lookingFor)}
                                        className="w-11 h-6 rounded-full relative transition-colors cursor-pointer"
                                        style={{
                                            backgroundColor: lookingFor
                                                ? "var(--color-primary-500)"
                                                : "var(--color-surface-200)",
                                        }}
                                    >
                                        <div
                                            className="absolute top-0.5 w-5 h-5 bg-white rounded-full shadow-sm transition-transform"
                                            style={{
                                                transform: lookingFor
                                                    ? "translateX(22px)"
                                                    : "translateX(2px)",
                                            }}
                                        />
                                    </div>
                                    <span className="text-body-sm text-surface-700">
                                        Ищу со-основателя
                                    </span>
                                </label>

                                {/* Skills */}
                                <div>
                                    <p className="text-body-sm font-medium text-surface-700 mb-2">
                                        Мои навыки
                                    </p>
                                    <div className="flex flex-wrap gap-2">
                                        {ALL_SKILLS.map((skill) => {
                                            const isSelected = selectedSkills.includes(skill);
                                            return (
                                                <button
                                                    key={skill}
                                                    onClick={() => toggleSkill(skill)}
                                                    className="px-3 py-1.5 rounded-full text-caption font-semibold transition-all border"
                                                    style={{
                                                        backgroundColor: isSelected
                                                            ? SKILL_COLORS[skill]
                                                            : "transparent",
                                                        borderColor: isSelected
                                                            ? SKILL_COLORS[skill]
                                                            : "var(--color-surface-200)",
                                                        color: isSelected
                                                            ? "white"
                                                            : "var(--color-surface-600)",
                                                    }}
                                                >
                                                    {SKILL_LABELS[skill]}
                                                </button>
                                            );
                                        })}
                                    </div>
                                </div>

                                {/* Bio */}
                                <div>
                                    <p className="text-body-sm font-medium text-surface-700 mb-2">
                                        О себе
                                    </p>
                                    <textarea
                                        value={bio}
                                        onChange={(e) => setBio(e.target.value)}
                                        placeholder="Расскажи кратко о себе: опыт, цели, чего ищешь..."
                                        rows={3}
                                        maxLength={500}
                                        className="w-full p-3 rounded-lg border border-surface-200 text-body-sm text-surface-900 placeholder:text-surface-300 focus:outline-none focus:ring-2 focus:ring-primary-200 bg-surface-0 resize-none"
                                    />
                                </div>

                                {/* Save */}
                                <button
                                    onClick={handleSave}
                                    disabled={isPending}
                                    className="flex items-center gap-2 px-5 py-2.5 rounded-lg text-body-sm font-semibold text-white transition-all disabled:opacity-50"
                                    style={{
                                        background:
                                            "linear-gradient(135deg, var(--color-primary-500), var(--color-primary-600))",
                                    }}
                                >
                                    {saved ? (
                                        <>
                                            <Check size={16} /> Сохранено!
                                        </>
                                    ) : isPending ? (
                                        "Сохраняю..."
                                    ) : (
                                        "Сохранить профиль"
                                    )}
                                </button>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>

            {/* Matches Grid */}
            {initialMatches.length > 0 ? (
                <div>
                    <div className="flex items-center gap-2 mb-4">
                        <Sparkles size={18} strokeWidth={1.75} className="text-accent-500" />
                        <h2 className="text-h3 text-surface-900">
                            Подходящие партнёры
                        </h2>
                        <span className="text-caption text-surface-400 ml-1">
                            ({initialMatches.length})
                        </span>
                    </div>
                    <motion.div
                        variants={container}
                        initial="hidden"
                        animate="show"
                        className="grid md:grid-cols-2 lg:grid-cols-3 gap-4"
                    >
                        {initialMatches.map((match) => (
                            <motion.div key={match.id} variants={item}>
                                <MatchCard profile={match} />
                            </motion.div>
                        ))}
                    </motion.div>
                </div>
            ) : (
                <div className="text-center py-16">
                    <Search
                        size={48}
                        strokeWidth={1.5}
                        className="mx-auto mb-4"
                        style={{ color: "var(--color-surface-300)" }}
                    />
                    <h3 className="text-h3 text-surface-500 mb-2">Пока нет совпадений</h3>
                    <p className="text-body-sm text-surface-400 max-w-sm mx-auto">
                        Заполни свой профиль и включи &quot;Ищу со-основателя&quot; — мы найдём тебе партнёра с
                        комплементарными навыками!
                    </p>
                </div>
            )}
        </div>
    );
}
