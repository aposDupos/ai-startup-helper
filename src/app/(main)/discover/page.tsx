import { Globe, Search, TrendingUp } from "lucide-react";
import { getPublicProjects, getTopProjectsThisWeek } from "./actions";
import { DiscoverClient } from "./DiscoverClient";

export const metadata = {
    title: "Галерея проектов — StartupCopilot",
    description: "Просматривай проекты других предпринимателей, оставляй фидбэк и вдохновляйся!",
};

export default async function DiscoverPage({
    searchParams,
}: {
    searchParams: Promise<{ page?: string; sort?: string; stage?: string; review?: string }>;
}) {
    const params = await searchParams;
    const page = Number(params?.page) || 1;
    const sort = (params?.sort as "new" | "popular" | "score") || "new";
    const stage = (params?.stage as "all" | "idea" | "validation" | "business_model" | "mvp" | "pitch") || "all";
    const reviewFilter = params?.review === "open";

    const [{ projects, totalPages }, topProjects] = await Promise.all([
        getPublicProjects(page, sort, stage, reviewFilter),
        getTopProjectsThisWeek(),
    ]);

    return (
        <div className="space-y-8">
            {/* Header */}
            <div className="animate-fade-in">
                <div className="flex items-center gap-3">
                    <Globe size={28} strokeWidth={1.75} className="text-primary-500" />
                    <h1 className="text-h1 text-surface-900">Галерея проектов</h1>
                </div>
                <p className="text-body text-surface-500 mt-1">
                    Просматривай проекты, оставляй фидбэк и вдохновляйся чужими идеями!
                </p>
            </div>

            {/* Top Projects This Week */}
            {topProjects.length > 0 && (
                <div className="p-6 rounded-xl border border-surface-200 bg-surface-0 shadow-sm">
                    <div className="flex items-center gap-2 mb-4">
                        <TrendingUp size={20} strokeWidth={1.75} className="text-accent-500" />
                        <h2 className="text-h3 text-surface-900">Топ за неделю</h2>
                    </div>
                    <div className="grid md:grid-cols-3 gap-4">
                        {topProjects.map((project) => (
                            <div
                                key={project.id}
                                className="p-4 rounded-lg bg-surface-50 border border-surface-100"
                            >
                                <h3 className="text-body-sm font-semibold text-surface-900 line-clamp-1">
                                    {project.title}
                                </h3>
                                <p className="text-caption text-surface-400 mt-1">
                                    {project.owner?.display_name || "Аноним"} &middot;{" "}
                                    <span style={{ fontFamily: "var(--font-mono)" }}>
                                        {project.scorecard?.total ?? "—"}/100
                                    </span>
                                </p>
                                <div className="flex items-center gap-2 mt-2 text-caption text-surface-400">
                                    <span>🔥 {project.reactions.fire}</span>
                                    <span>💡 {project.reactions.creative}</span>
                                    <span>📊 {project.reactions.researched}</span>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Filters + Grid */}
            <DiscoverClient
                initialProjects={projects}
                totalPages={totalPages}
                currentPage={page}
                currentSort={sort}
                currentStage={stage}
            />
        </div>
    );
}
