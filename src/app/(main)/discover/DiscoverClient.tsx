"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { motion } from "framer-motion";
import { Search, Filter } from "lucide-react";
import { ProjectCard } from "@/components/social/ProjectCard";
import type { PublicProject, SortOption, StageFilter } from "./actions";

// ---------------------------------------------------------------------------
// Stage options
// ---------------------------------------------------------------------------

const STAGE_OPTIONS: { value: StageFilter; label: string }[] = [
    { value: "all", label: "Все стадии" },
    { value: "idea", label: "🏝️ Идея" },
    { value: "validation", label: "🔍 Проверка" },
    { value: "business_model", label: "📊 Бизнес-модель" },
    { value: "mvp", label: "🛠️ MVP" },
    { value: "pitch", label: "🎤 Питч" },
];

const SORT_OPTIONS: { value: SortOption; label: string }[] = [
    { value: "new", label: "Новые" },
    { value: "popular", label: "Популярные" },
    { value: "score", label: "По Score" },
];

// ---------------------------------------------------------------------------
// Props
// ---------------------------------------------------------------------------

interface DiscoverClientProps {
    initialProjects: PublicProject[];
    totalPages: number;
    currentPage: number;
    currentSort: SortOption;
    currentStage: StageFilter;
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export function DiscoverClient({
    initialProjects,
    totalPages,
    currentPage,
    currentSort,
    currentStage,
}: DiscoverClientProps) {
    const router = useRouter();
    const searchParams = useSearchParams();

    const updateFilter = (key: string, value: string) => {
        const params = new URLSearchParams(searchParams.toString());
        params.set(key, value);
        if (key !== "page") params.delete("page"); // reset page on filter change
        router.push(`/discover?${params.toString()}`);
    };

    const containerVariants = {
        hidden: {},
        show: { transition: { staggerChildren: 0.06 } },
    };

    const itemVariants = {
        hidden: { opacity: 0, y: 12 },
        show: { opacity: 1, y: 0, transition: { duration: 0.3 } },
    };

    return (
        <div className="space-y-6">
            {/* Filter Bar */}
            <div className="flex flex-wrap items-center gap-3 p-4 rounded-xl bg-surface-0 border border-surface-200 shadow-sm">
                <Filter size={18} strokeWidth={1.75} className="text-surface-400" />

                {/* Stage Filter */}
                <select
                    value={currentStage}
                    onChange={(e) => updateFilter("stage", e.target.value)}
                    className="px-3 py-2 rounded-lg border border-surface-200 bg-surface-50 text-body-sm focus:ring-2 focus:ring-primary-200 focus:border-primary-400 outline-none transition-colors"
                >
                    {STAGE_OPTIONS.map((opt) => (
                        <option key={opt.value} value={opt.value}>
                            {opt.label}
                        </option>
                    ))}
                </select>

                {/* Sort */}
                <select
                    value={currentSort}
                    onChange={(e) => updateFilter("sort", e.target.value)}
                    className="px-3 py-2 rounded-lg border border-surface-200 bg-surface-50 text-body-sm focus:ring-2 focus:ring-primary-200 focus:border-primary-400 outline-none transition-colors"
                >
                    {SORT_OPTIONS.map((opt) => (
                        <option key={opt.value} value={opt.value}>
                            {opt.label}
                        </option>
                    ))}
                </select>

                {/* Review filter */}
                <button
                    type="button"
                    className="px-3 py-2 rounded-lg text-body-sm font-medium transition-colors"
                    style={{
                        backgroundColor: searchParams.get("review") === "open"
                            ? "var(--color-primary-50)"
                            : "var(--color-surface-50)",
                        borderColor: searchParams.get("review") === "open"
                            ? "var(--color-primary-200)"
                            : "var(--color-surface-200)",
                        borderWidth: "1px",
                        color: searchParams.get("review") === "open"
                            ? "var(--color-primary-600)"
                            : "var(--color-text-secondary)",
                    }}
                    onClick={() => {
                        const params = new URLSearchParams(searchParams.toString());
                        if (params.get("review") === "open") {
                            params.delete("review");
                        } else {
                            params.set("review", "open");
                        }
                        params.delete("page");
                        router.push(`/discover?${params.toString()}`);
                    }}
                >
                    🔍 Ждут ревью
                </button>
            </div>

            {/* Projects Grid */}
            {initialProjects.length > 0 ? (
                <motion.div
                    className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4"
                    variants={containerVariants}
                    initial="hidden"
                    animate="show"
                >
                    {initialProjects.map((project) => (
                        <motion.div key={project.id} variants={itemVariants}>
                            <ProjectCard project={project} />
                        </motion.div>
                    ))}
                </motion.div>
            ) : (
                <div className="text-center py-16">
                    <Search
                        size={48}
                        strokeWidth={1.25}
                        className="mx-auto text-surface-300 mb-4"
                    />
                    <h3 className="text-h3 text-surface-600 mb-2">Пока нет проектов</h3>
                    <p className="text-body-sm text-surface-400">
                        Станьте первым! Опубликуйте свой проект из Dashboard.
                    </p>
                </div>
            )}

            {/* Pagination */}
            {totalPages > 1 && (
                <div className="flex items-center justify-center gap-2 pt-4">
                    {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
                        <button
                            key={p}
                            type="button"
                            className="w-10 h-10 rounded-lg text-body-sm font-medium transition-all"
                            style={{
                                backgroundColor:
                                    p === currentPage
                                        ? "var(--color-primary-500)"
                                        : "var(--color-surface-50)",
                                color:
                                    p === currentPage
                                        ? "white"
                                        : "var(--color-text-secondary)",
                                border:
                                    p === currentPage
                                        ? "none"
                                        : "1px solid var(--color-surface-200)",
                            }}
                            onClick={() => updateFilter("page", p.toString())}
                        >
                            {p}
                        </button>
                    ))}
                </div>
            )}
        </div>
    );
}
