"use client";

import { useState, useTransition } from "react";
import { Star, Send, CheckCircle } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { submitReview } from "@/app/(main)/discover/review-actions";
import type { ReviewComment } from "@/app/(main)/discover/review-actions";

// ---------------------------------------------------------------------------
// Block definitions per artifact type
// ---------------------------------------------------------------------------

const ARTIFACT_BLOCKS: Record<string, { key: string; label: string }[]> = {
    bmc: [
        { key: "key_partners", label: "Ключевые партнёры" },
        { key: "key_activities", label: "Ключевые активности" },
        { key: "key_resources", label: "Ключевые ресурсы" },
        { key: "value_propositions", label: "Ценностные предложения" },
        { key: "customer_relationships", label: "Отношения с клиентами" },
        { key: "channels", label: "Каналы" },
        { key: "customer_segments", label: "Сегменты клиентов" },
        { key: "cost_structure", label: "Структура затрат" },
        { key: "revenue_streams", label: "Потоки доходов" },
    ],
    vpc: [
        { key: "customer_jobs", label: "Задачи клиента" },
        { key: "pains", label: "Боли" },
        { key: "gains", label: "Выгоды" },
        { key: "products_services", label: "Продукты и услуги" },
        { key: "pain_relievers", label: "Обезболивающие" },
        { key: "gain_creators", label: "Создатели выгод" },
    ],
    pitch: [
        { key: "slide_problem", label: "Слайд: Проблема" },
        { key: "slide_solution", label: "Слайд: Решение" },
        { key: "slide_market", label: "Слайд: Рынок" },
        { key: "slide_product", label: "Слайд: Продукт" },
        { key: "slide_business_model", label: "Слайд: Бизнес-модель" },
        { key: "slide_traction", label: "Слайд: Трекшн" },
        { key: "slide_competition", label: "Слайд: Конкуренция" },
        { key: "slide_team", label: "Слайд: Команда" },
        { key: "slide_financials", label: "Слайд: Финансы" },
        { key: "slide_ask", label: "Слайд: Запрос" },
    ],
};

// ---------------------------------------------------------------------------
// Props
// ---------------------------------------------------------------------------

interface ReviewFormProps {
    requestId: string;
    artifactType: "bmc" | "vpc" | "pitch";
    artifactData: Record<string, unknown>;
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export function ReviewForm({ requestId, artifactType, artifactData }: ReviewFormProps) {
    const blocks = ARTIFACT_BLOCKS[artifactType] || [];
    const [comments, setComments] = useState<Record<string, string>>({});
    const [rating, setRating] = useState(0);
    const [hoverRating, setHoverRating] = useState(0);
    const [isPending, startTransition] = useTransition();
    const [submitted, setSubmitted] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleSubmit = () => {
        if (rating === 0) {
            setError("Поставьте общую оценку");
            return;
        }

        const reviewComments: ReviewComment[] = Object.entries(comments)
            .filter(([, text]) => text.trim().length > 0)
            .map(([block, text]) => ({ block, text: text.trim() }));

        if (reviewComments.length === 0) {
            setError("Оставьте хотя бы один комментарий");
            return;
        }

        setError(null);
        startTransition(async () => {
            const result = await submitReview(requestId, reviewComments, rating);
            if (result.success) {
                setSubmitted(true);
            } else {
                setError(result.error || "Ошибка при отправке ревью");
            }
        });
    };

    if (submitted) {
        return (
            <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="text-center py-12 px-6 rounded-xl bg-surface-0 border border-surface-200 shadow-sm"
            >
                <CheckCircle
                    size={48}
                    strokeWidth={1.5}
                    className="mx-auto mb-4"
                    style={{ color: "var(--color-success-500)" }}
                />
                <h3 className="text-h3 text-surface-900 mb-2">Спасибо за ревью! 🎉</h3>
                <p className="text-body text-surface-500 mb-1">
                    Вы получили +15 XP за помощь другому предпринимателю.
                </p>
                <p className="text-body-sm text-surface-400">
                    Автор проекта увидит ваш фидбэк.
                </p>
            </motion.div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Artifact blocks with comments */}
            {blocks.map((block) => {
                const data = artifactData?.[block.key];
                const displayData = typeof data === "string"
                    ? data
                    : Array.isArray(data)
                        ? data
                            .map((item) =>
                                typeof item === "object" && item !== null && "text" in item
                                    ? (item as { text: string }).text
                                    : String(item)
                            )
                            .join("\n• ")
                        : data
                            ? JSON.stringify(data)
                            : "";

                return (
                    <div
                        key={block.key}
                        className="p-4 rounded-xl bg-surface-0 border border-surface-200 shadow-sm"
                    >
                        <h4 className="text-body-sm font-semibold text-surface-900 mb-2">
                            {block.label}
                        </h4>

                        {/* Read-only data */}
                        <div className="p-3 rounded-lg bg-surface-50 border border-surface-100 mb-3">
                            <p className="text-body-sm text-surface-600 whitespace-pre-wrap">
                                {displayData || (
                                    <span className="text-surface-300 italic">Не заполнено</span>
                                )}
                            </p>
                        </div>

                        {/* Comment textarea */}
                        <textarea
                            placeholder={`Комментарий к «${block.label}»...`}
                            className="w-full px-3 py-2 rounded-lg border border-surface-200 bg-surface-0 text-body-sm focus:ring-2 focus:ring-primary-200 focus:border-primary-400 outline-none transition-colors resize-none"
                            rows={2}
                            value={comments[block.key] || ""}
                            onChange={(e) =>
                                setComments((prev) => ({
                                    ...prev,
                                    [block.key]: e.target.value,
                                }))
                            }
                        />
                    </div>
                );
            })}

            {/* Rating + Submit */}
            <div className="p-6 rounded-xl bg-surface-0 border border-surface-200 shadow-sm">
                <h4 className="text-body-sm font-semibold text-surface-900 mb-3">
                    Общая оценка
                </h4>

                {/* Star rating */}
                <div className="flex items-center gap-1 mb-4">
                    {[1, 2, 3, 4, 5].map((star) => (
                        <button
                            key={star}
                            type="button"
                            className="transition-transform hover:scale-110"
                            onMouseEnter={() => setHoverRating(star)}
                            onMouseLeave={() => setHoverRating(0)}
                            onClick={() => setRating(star)}
                        >
                            <Star
                                size={28}
                                strokeWidth={1.75}
                                fill={
                                    star <= (hoverRating || rating)
                                        ? "var(--color-accent-500)"
                                        : "none"
                                }
                                style={{
                                    color:
                                        star <= (hoverRating || rating)
                                            ? "var(--color-accent-500)"
                                            : "var(--color-surface-300)",
                                }}
                            />
                        </button>
                    ))}
                    {rating > 0 && (
                        <span className="ml-2 text-body-sm text-surface-500">
                            {rating}/5
                        </span>
                    )}
                </div>

                {/* Error */}
                <AnimatePresence>
                    {error && (
                        <motion.p
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: "auto" }}
                            exit={{ opacity: 0, height: 0 }}
                            className="text-caption text-red-500 mb-3"
                        >
                            {error}
                        </motion.p>
                    )}
                </AnimatePresence>

                {/* Submit button */}
                <motion.button
                    type="button"
                    className="inline-flex items-center gap-2 px-6 py-3 rounded-lg text-body-sm font-semibold text-white transition-colors"
                    style={{
                        background:
                            "linear-gradient(135deg, var(--color-primary-500), var(--color-primary-600))",
                        boxShadow: "var(--shadow-glow-primary)",
                    }}
                    whileTap={{ scale: 0.97 }}
                    onClick={handleSubmit}
                    disabled={isPending}
                >
                    <Send size={16} strokeWidth={1.75} />
                    {isPending ? "Отправляем..." : "Отправить ревью"}
                </motion.button>
            </div>
        </div>
    );
}
