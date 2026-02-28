"use client";

import { motion } from "framer-motion";
import { Lightbulb, Target, Rocket, BookOpen, ArrowRight } from "lucide-react";
import Link from "next/link";

const ENTRY_POINTS = [
    {
        icon: Lightbulb,
        emoji: "💡",
        title: "У меня нет идеи",
        description: "AI поможет найти идею стартапа на основе твоих интересов",
        href: "/chat?context=idea_search",
        gradient: "linear-gradient(135deg, #A78BFA, #7C3AED)",
    },
    {
        icon: Target,
        emoji: "🎯",
        title: "У меня есть идея",
        description: "Расскажи AI свою идею — он создаст проект и оценит её",
        href: "/chat?context=idea_evaluation",
        gradient: "linear-gradient(135deg, var(--color-primary-400), var(--color-primary-600))",
    },
    {
        icon: Rocket,
        emoji: "🚀",
        title: "У меня уже проект",
        description: "AI определит стадию и продолжит с нужного этапа",
        href: "/chat?context=project_assessment",
        gradient: "linear-gradient(135deg, var(--color-accent-400), var(--color-accent-600))",
    },
    {
        icon: BookOpen,
        emoji: "📚",
        title: "Хочу поучиться",
        description: "Начни с мини-урока о стартапах, а потом вернись",
        href: "/chat?context=learning",
        gradient: "linear-gradient(135deg, var(--color-success-400), var(--color-success-500))",
    },
];

const containerVariants = {
    hidden: {},
    show: { transition: { staggerChildren: 0.1 } },
};

const cardVariants = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0, transition: { duration: 0.4, ease: [0.4, 0, 0.2, 1] as const } },
};

export function CreateProjectWidget() {
    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="text-center space-y-2">
                <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: "spring", stiffness: 300, damping: 15, delay: 0.2 }}
                    className="text-5xl"
                >
                    🚀
                </motion.div>
                <h2 className="text-h2 text-surface-900">С чего начнём?</h2>
                <p className="text-body text-surface-500 max-w-md mx-auto">
                    Выбери с чего хочешь начать, а AI-наставник поможет на каждом шаге.
                </p>
            </div>

            {/* Entry point cards */}
            <motion.div
                className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-2xl mx-auto"
                variants={containerVariants}
                initial="hidden"
                animate="show"
            >
                {ENTRY_POINTS.map((entry) => {
                    const Icon = entry.icon;
                    return (
                        <motion.div key={entry.title} variants={cardVariants}>
                            <Link
                                href={entry.href}
                                className="group block p-5 rounded-xl bg-surface-0 border border-surface-200 shadow-sm transition-all hover:-translate-y-1 hover:shadow-md"
                            >
                                <div
                                    className="w-12 h-12 rounded-lg flex items-center justify-center text-white mb-3"
                                    style={{ background: entry.gradient }}
                                >
                                    <Icon size={22} strokeWidth={1.75} />
                                </div>
                                <h4 className="text-body font-semibold text-surface-900 mb-1">
                                    {entry.title}
                                </h4>
                                <p className="text-caption text-surface-400 mb-3 line-clamp-2">
                                    {entry.description}
                                </p>
                                <div className="flex items-center gap-1 text-caption font-medium text-primary-500 group-hover:gap-2 transition-all">
                                    Начать
                                    <ArrowRight
                                        size={14}
                                        strokeWidth={1.75}
                                        className="transition-transform group-hover:translate-x-0.5"
                                    />
                                </div>
                            </Link>
                        </motion.div>
                    );
                })}
            </motion.div>
        </div>
    );
}
