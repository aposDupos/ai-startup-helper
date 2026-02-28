"use client";

import { motion } from "framer-motion";
import { RotateCcw, Trophy, TrendingUp, AlertTriangle } from "lucide-react";
import type { TrainingResults } from "@/types/pitch";
import { TRAINING_CRITERIA } from "@/types/pitch";

interface PitchFeedbackProps {
    results: TrainingResults;
    onRestart: () => void;
}

export function PitchFeedback({ results, onRestart }: PitchFeedbackProps) {
    const avgScore =
        results.criteria.reduce((sum, c) => sum + c.score, 0) /
        results.criteria.length;

    const scoreColor =
        avgScore >= 7
            ? "text-success-500"
            : avgScore >= 5
                ? "text-accent-500"
                : "text-red-500";

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="space-y-6"
        >
            {/* Overall score */}
            <div className="bg-surface-0 rounded-xl border border-surface-200 p-8 text-center space-y-3">
                <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: "spring", stiffness: 300, damping: 15, delay: 0.2 }}
                    className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-surface-50 border-2 border-surface-200"
                >
                    <span className={`text-3xl font-bold font-mono ${scoreColor}`}>
                        {avgScore.toFixed(1)}
                    </span>
                </motion.div>
                <p className="text-body text-surface-500">
                    Средний балл из 10 • {results.rounds.length} раундов
                </p>
            </div>

            {/* Criteria breakdown */}
            <div className="bg-surface-0 rounded-xl border border-surface-200 p-6 space-y-4">
                <h3 className="text-h3 text-surface-900 flex items-center gap-2">
                    <Trophy size={20} strokeWidth={1.75} className="text-accent-500" />
                    Оценка по критериям
                </h3>

                <div className="space-y-3">
                    {results.criteria.map((criterion, i) => {
                        const def = TRAINING_CRITERIA.find((c) => c.key === criterion.key);
                        const barColor =
                            criterion.score >= 7
                                ? "bg-success-400"
                                : criterion.score >= 5
                                    ? "bg-accent-400"
                                    : "bg-red-400";

                        return (
                            <motion.div
                                key={criterion.key}
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: 0.1 * i }}
                                className="space-y-1.5"
                            >
                                <div className="flex items-center justify-between text-body-sm">
                                    <span className="text-surface-700">
                                        {def?.emoji} {criterion.label}
                                    </span>
                                    <span className="font-mono font-medium text-surface-900">
                                        {criterion.score}/10
                                    </span>
                                </div>
                                <div className="h-2 bg-surface-100 rounded-full overflow-hidden">
                                    <motion.div
                                        initial={{ width: 0 }}
                                        animate={{ width: `${criterion.score * 10}%` }}
                                        transition={{ duration: 0.6, delay: 0.2 + 0.1 * i }}
                                        className={`h-full rounded-full ${barColor}`}
                                    />
                                </div>
                                <p className="text-caption text-surface-500">
                                    {criterion.comment}
                                </p>
                            </motion.div>
                        );
                    })}
                </div>
            </div>

            {/* Strengths & improvements */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Strengths */}
                <div className="bg-surface-0 rounded-xl border border-success-200 p-5 space-y-3">
                    <h4 className="text-h4 text-surface-900 flex items-center gap-2">
                        <TrendingUp size={18} className="text-success-500" strokeWidth={1.75} />
                        Сильные стороны
                    </h4>
                    <ul className="space-y-2">
                        {results.strengths.map((s, i) => (
                            <motion.li
                                key={i}
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                transition={{ delay: 0.5 + 0.1 * i }}
                                className="flex items-start gap-2 text-body-sm text-surface-700"
                            >
                                <span className="text-success-500 mt-0.5">✓</span>
                                {s}
                            </motion.li>
                        ))}
                    </ul>
                </div>

                {/* Improvements */}
                <div className="bg-surface-0 rounded-xl border border-accent-200 p-5 space-y-3">
                    <h4 className="text-h4 text-surface-900 flex items-center gap-2">
                        <AlertTriangle size={18} className="text-accent-500" strokeWidth={1.75} />
                        Что улучшить
                    </h4>
                    <ul className="space-y-2">
                        {results.improvements.map((s, i) => (
                            <motion.li
                                key={i}
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                transition={{ delay: 0.6 + 0.1 * i }}
                                className="flex items-start gap-2 text-body-sm text-surface-700"
                            >
                                <span className="text-accent-500 mt-0.5">→</span>
                                {s}
                            </motion.li>
                        ))}
                    </ul>
                </div>
            </div>

            {/* Actions */}
            <div className="flex justify-center gap-3">
                <button
                    onClick={onRestart}
                    className="flex items-center gap-2 px-5 py-2.5 rounded-lg 
                        bg-primary-500 text-white hover:bg-primary-600 
                        transition-all shadow-sm active:scale-[0.97]"
                >
                    <RotateCcw size={16} strokeWidth={1.75} />
                    Попробовать ещё раз
                </button>
            </div>
        </motion.div>
    );
}
