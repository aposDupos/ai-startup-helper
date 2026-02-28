import { createClient } from "@/lib/supabase/server";
import {
    MessageCircle,
    BarChart3,
    BookOpen,
    Lightbulb,
    Flame,
    Star,
    ArrowRight,
    Plus,
} from "lucide-react";
import Link from "next/link";

const STAGES = [
    { key: "idea", label: "Идея", emoji: "💡" },
    { key: "validation", label: "Валидация", emoji: "🔍" },
    { key: "business_model", label: "Бизнес-модель", emoji: "📊" },
    { key: "mvp", label: "MVP", emoji: "⚡" },
    { key: "pitch", label: "Питч", emoji: "🎤" },
];

const QUICK_ACTIONS = [
    {
        icon: MessageCircle,
        label: "Начать чат с AI",
        description: "Обсуди идею с наставником",
        href: "/mentor",
        gradient: "linear-gradient(135deg, var(--color-primary-500), var(--color-primary-600))",
    },
    {
        icon: BarChart3,
        label: "Заполнить BMC",
        description: "Business Model Canvas",
        href: "/workspace",
        gradient: "linear-gradient(135deg, var(--color-accent-500), var(--color-accent-600))",
    },
    {
        icon: BookOpen,
        label: "Начать урок",
        description: "Академия стартапов",
        href: "/academy",
        gradient: "linear-gradient(135deg, var(--color-success-400), var(--color-success-500))",
    },
    {
        icon: Lightbulb,
        label: "Оценить идею",
        description: "ICE Score от AI",
        href: "/mentor",
        gradient: "linear-gradient(135deg, #A78BFA, #7C3AED)",
    },
];

export default async function DashboardPage() {
    const supabase = await createClient();
    const {
        data: { user },
    } = await supabase.auth.getUser();

    const { data: profile } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", user!.id)
        .single();

    const { data: projects } = await supabase
        .from("projects")
        .select("*")
        .eq("owner_id", user!.id)
        .eq("is_active", true)
        .limit(1);

    const activeProject = projects?.[0];

    return (
        <div className="space-y-6">
            {/* Welcome Header */}
            <div className="animate-fade-in">
                <h1 className="text-h1 text-surface-900">
                    Привет, {profile?.display_name || "Основатель"}! 🚀
                </h1>
                <p className="text-body text-surface-500 mt-1">
                    {activeProject
                        ? `Продолжай работу над «${activeProject.title}»`
                        : "Начни свой путь в мире стартапов"}
                </p>
            </div>

            {/* Stage Progress */}
            <div className="p-6 rounded-xl bg-surface-0 border border-surface-200 shadow-sm">
                <h3 className="text-h4 text-surface-900 mb-4">Путь основателя</h3>
                <div className="flex items-center justify-between">
                    {STAGES.map((stage, i) => {
                        const currentStageIndex = activeProject
                            ? STAGES.findIndex((s) => s.key === activeProject.stage)
                            : 0;
                        const isCompleted = i < currentStageIndex;
                        const isCurrent = i === currentStageIndex;

                        return (
                            <div key={stage.key} className="flex items-center gap-0 flex-1">
                                <div className="flex flex-col items-center gap-1.5">
                                    <div
                                        className="w-10 h-10 rounded-full flex items-center justify-center text-lg transition-all"
                                        style={{
                                            backgroundColor: isCompleted
                                                ? "var(--color-primary-500)"
                                                : isCurrent
                                                    ? "var(--color-primary-50)"
                                                    : "var(--color-surface-100)",
                                            border: isCurrent
                                                ? "2px solid var(--color-primary-500)"
                                                : "2px solid transparent",
                                            boxShadow: isCurrent
                                                ? "var(--shadow-glow-primary)"
                                                : "none",
                                        }}
                                    >
                                        {isCompleted ? (
                                            <span className="text-white text-sm">✓</span>
                                        ) : (
                                            stage.emoji
                                        )}
                                    </div>
                                    <span
                                        className="text-caption font-medium"
                                        style={{
                                            color: isCurrent
                                                ? "var(--color-primary-600)"
                                                : "var(--color-text-secondary)",
                                        }}
                                    >
                                        {stage.label}
                                    </span>
                                </div>
                                {i < STAGES.length - 1 && (
                                    <div
                                        className="flex-1 h-0.5 mx-2"
                                        style={{
                                            backgroundColor:
                                                i < currentStageIndex
                                                    ? "var(--color-primary-500)"
                                                    : "var(--color-surface-200)",
                                        }}
                                    />
                                )}
                            </div>
                        );
                    })}
                </div>
            </div>

            {/* Quick Actions */}
            <div>
                <h3 className="text-h4 text-surface-900 mb-3">Быстрые действия</h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {QUICK_ACTIONS.map((action) => {
                        const Icon = action.icon;
                        return (
                            <Link
                                key={action.label}
                                href={action.href}
                                className="group p-4 rounded-xl bg-surface-0 border border-surface-200 shadow-sm transition-all hover:-translate-y-1 hover:shadow-md"
                            >
                                <div
                                    className="w-10 h-10 rounded-lg flex items-center justify-center text-white mb-3"
                                    style={{ background: action.gradient }}
                                >
                                    <Icon size={20} strokeWidth={1.75} />
                                </div>
                                <h4 className="text-body-sm font-semibold text-surface-900">
                                    {action.label}
                                </h4>
                                <p className="text-caption text-surface-400 mt-0.5">
                                    {action.description}
                                </p>
                                <ArrowRight
                                    size={14}
                                    className="mt-2 text-surface-300 group-hover:text-primary-500 transition-colors group-hover:translate-x-1 transition-transform"
                                />
                            </Link>
                        );
                    })}
                </div>
            </div>

            {/* XP + Streak row */}
            <div className="grid md:grid-cols-2 gap-4">
                {/* XP Card */}
                <div className="p-6 rounded-xl bg-surface-0 border border-surface-200 shadow-sm">
                    <div className="flex items-center justify-between mb-3">
                        <h3 className="text-h4 text-surface-900">Прогресс</h3>
                        <div className="flex items-center gap-1.5">
                            <Star
                                size={16}
                                strokeWidth={1.75}
                                className="text-accent-500"
                            />
                            <span
                                className="text-body-sm font-bold"
                                style={{
                                    fontFamily: "var(--font-mono)",
                                    color: "var(--color-accent-500)",
                                }}
                            >
                                {profile?.xp || 0} XP
                            </span>
                        </div>
                    </div>
                    <div className="flex items-center gap-3 mb-3">
                        <div
                            className="w-12 h-12 rounded-full flex items-center justify-center text-white text-h4 font-bold"
                            style={{
                                background:
                                    "linear-gradient(135deg, var(--color-primary-400), var(--color-primary-600))",
                                boxShadow: "var(--shadow-glow-primary)",
                            }}
                        >
                            {profile?.level || 1}
                        </div>
                        <div>
                            <p className="text-body-sm font-semibold text-surface-900">
                                Уровень {profile?.level || 1}
                            </p>
                            <p className="text-caption text-surface-400">
                                Ещё {1000 - ((profile?.xp || 0) % 1000)} XP до следующего
                            </p>
                        </div>
                    </div>
                    <div className="w-full h-2 rounded-full bg-surface-100">
                        <div
                            className="h-2 rounded-full transition-all"
                            style={{
                                width: `${((profile?.xp || 0) % 1000) / 10}%`,
                                background:
                                    "linear-gradient(90deg, var(--color-primary-400), var(--color-primary-600))",
                            }}
                        />
                    </div>
                </div>

                {/* Streak Card */}
                <div className="p-6 rounded-xl bg-surface-0 border border-surface-200 shadow-sm">
                    <h3 className="text-h4 text-surface-900 mb-3">Серия</h3>
                    <div className="flex items-center gap-3">
                        <span className="text-4xl animate-wiggle">🔥</span>
                        <div>
                            <p
                                className="text-h2"
                                style={{
                                    fontFamily: "var(--font-mono)",
                                    color: "var(--color-surface-900)",
                                }}
                            >
                                {profile?.streak_count || 0}
                            </p>
                            <p className="text-body-sm text-surface-500">
                                {(profile?.streak_count || 0) > 0
                                    ? "дней подряд!"
                                    : "Начни серию сегодня!"}
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Empty state: no project */}
            {!activeProject && (
                <div className="p-8 rounded-xl border-2 border-dashed border-surface-200 text-center">
                    <Lightbulb
                        size={40}
                        strokeWidth={1.75}
                        className="mx-auto mb-4 text-surface-300"
                    />
                    <h3 className="text-h3 text-surface-900 mb-2">
                        Ещё нет проекта?
                    </h3>
                    <p className="text-body text-surface-500 mb-4 max-w-[400px] mx-auto">
                        Создай свой первый стартап-проект или расскажи идею AI-наставнику.
                    </p>
                    <Link href="/mentor">
                        <button
                            className="inline-flex items-center gap-2 px-6 py-3 rounded-xl font-semibold text-white cursor-pointer"
                            style={{
                                background:
                                    "linear-gradient(135deg, var(--color-primary-500), var(--color-primary-600))",
                            }}
                        >
                            <Plus size={18} strokeWidth={1.75} />
                            Создать проект
                        </button>
                    </Link>
                </div>
            )}
        </div>
    );
}
