"use client";

import { useState, useCallback, useRef, useTransition } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
    ChevronLeft,
    ChevronRight,
    Sparkles,
    Download,
    Check,
    Loader2,
    RefreshCw,
    StickyNote,
} from "lucide-react";
import Link from "next/link";
import type { PitchDeckSlides, PitchSlideData } from "@/types/pitch";
import { PITCH_SLIDES } from "@/types/pitch";
import { savePitchDeck, generateSlideContent, autoFillSlide } from "@/app/(main)/workspace/pitch/actions";
import { toast } from "sonner";

interface PitchDeckWizardProps {
    deckId: string;
    projectId: string;
    projectTitle: string;
    initialSlides: PitchDeckSlides;
}

export function PitchDeckWizard({
    deckId,
    projectId,
    projectTitle,
    initialSlides,
}: PitchDeckWizardProps) {
    const [currentStep, setCurrentStep] = useState(0);
    const [slides, setSlides] = useState<PitchDeckSlides>(initialSlides);
    const [isGenerating, setIsGenerating] = useState(false);
    const [isAutoFilling, setIsAutoFilling] = useState(false);
    const [isPending, startTransition] = useTransition();
    const saveTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

    const currentSlideDef = PITCH_SLIDES[currentStep];
    const currentSlide = slides[currentStep];
    const filledCount = slides.filter((s) => s.content.trim().length > 0).length;

    // --- Autosave (debounced) -------------------------------------------

    const debouncedSave = useCallback(
        (updatedSlides: PitchDeckSlides) => {
            if (saveTimeoutRef.current) clearTimeout(saveTimeoutRef.current);
            saveTimeoutRef.current = setTimeout(() => {
                startTransition(async () => {
                    try {
                        await savePitchDeck(deckId, projectId, updatedSlides);
                    } catch {
                        toast.error("Ошибка сохранения");
                    }
                });
            }, 1500);
        },
        [deckId, projectId]
    );

    // --- Slide update ----------------------------------------------------

    const updateSlide = useCallback(
        (field: keyof PitchSlideData, value: string) => {
            setSlides((prev) => {
                const updated = [...prev];
                updated[currentStep] = { ...updated[currentStep], [field]: value };
                debouncedSave(updated);
                return updated;
            });
        },
        [currentStep, debouncedSave]
    );

    // --- AI Generation ---------------------------------------------------

    const handleGenerate = async () => {
        setIsGenerating(true);
        try {
            const result = await generateSlideContent(
                projectId,
                currentSlideDef.key,
                currentSlide.content
            );
            updateSlide("content", result.content);
            toast.success("Контент сгенерирован AI ✨");
        } catch {
            toast.error("Не удалось сгенерировать контент");
        } finally {
            setIsGenerating(false);
        }
    };

    // --- Auto-fill -------------------------------------------------------

    const handleAutoFill = async () => {
        if (!currentSlideDef.autoFillSource) return;
        setIsAutoFilling(true);
        try {
            const result = await autoFillSlide(projectId, currentSlideDef.key);
            if (result) {
                updateSlide("content", result.content);
                if (result.notes) updateSlide("notes", result.notes);
                toast.success("Данные подтянуты из проекта");
            } else {
                toast.info("Нет данных для автозаполнения");
            }
        } catch {
            toast.error("Ошибка автозаполнения");
        } finally {
            setIsAutoFilling(false);
        }
    };

    // --- Navigation ------------------------------------------------------

    const goNext = () => {
        if (currentStep < PITCH_SLIDES.length - 1) setCurrentStep(currentStep + 1);
    };
    const goPrev = () => {
        if (currentStep > 0) setCurrentStep(currentStep - 1);
    };

    return (
        <div className="space-y-6">
            {/* Progress bar */}
            <div className="space-y-3">
                <div className="flex items-center justify-between text-body-sm text-surface-500">
                    <span>
                        Слайд {currentStep + 1} из {PITCH_SLIDES.length}
                    </span>
                    <span>
                        Заполнено: {filledCount}/{PITCH_SLIDES.length}
                    </span>
                </div>
                <div className="flex gap-1">
                    {PITCH_SLIDES.map((s, i) => (
                        <button
                            key={s.key}
                            onClick={() => setCurrentStep(i)}
                            className={`h-2 flex-1 rounded-full transition-all duration-200 ${i === currentStep
                                    ? "bg-primary-500"
                                    : slides[i].content.trim()
                                        ? "bg-success-400"
                                        : "bg-surface-200"
                                } ${i === currentStep ? "scale-y-150" : "hover:bg-surface-300"}`}
                        />
                    ))}
                </div>
            </div>

            {/* Slide steps */}
            <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
                {PITCH_SLIDES.map((s, i) => (
                    <button
                        key={s.key}
                        onClick={() => setCurrentStep(i)}
                        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-caption whitespace-nowrap transition-all ${i === currentStep
                                ? "bg-primary-500 text-white shadow-sm"
                                : slides[i].content.trim()
                                    ? "bg-success-50 text-success-600 border border-success-200"
                                    : "bg-surface-100 text-surface-500 hover:bg-surface-200"
                            }`}
                    >
                        {slides[i].content.trim() && i !== currentStep && (
                            <Check size={12} strokeWidth={2.5} />
                        )}
                        <span>{s.emoji}</span>
                        <span>{s.title}</span>
                    </button>
                ))}
            </div>

            {/* Active slide editor */}
            <AnimatePresence mode="wait">
                <motion.div
                    key={currentStep}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    transition={{ duration: 0.25 }}
                    className="bg-surface-0 rounded-xl border border-surface-200 shadow-sm overflow-hidden"
                >
                    {/* Slide header */}
                    <div className="p-6 border-b border-surface-100 bg-surface-50">
                        <div className="flex items-center justify-between">
                            <div>
                                <h2 className="text-h3 text-surface-900">
                                    {currentSlideDef.emoji} {currentSlideDef.title}
                                </h2>
                                <p className="text-body-sm text-surface-500 mt-1">
                                    {currentSlideDef.description}
                                </p>
                            </div>
                            <div className="flex gap-2">
                                {currentSlideDef.autoFillSource && (
                                    <button
                                        onClick={handleAutoFill}
                                        disabled={isAutoFilling}
                                        className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-body-sm 
                                            bg-surface-100 text-surface-600 hover:bg-surface-200 
                                            disabled:opacity-50 transition-all"
                                    >
                                        {isAutoFilling ? (
                                            <Loader2 size={14} className="animate-spin" />
                                        ) : (
                                            <RefreshCw size={14} strokeWidth={1.75} />
                                        )}
                                        Автозаполнение
                                    </button>
                                )}
                                <button
                                    onClick={handleGenerate}
                                    disabled={isGenerating}
                                    className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-body-sm 
                                        bg-primary-500 text-white hover:bg-primary-600 
                                        disabled:opacity-50 transition-all shadow-sm"
                                >
                                    {isGenerating ? (
                                        <Loader2 size={14} className="animate-spin" />
                                    ) : (
                                        <Sparkles size={14} strokeWidth={1.75} />
                                    )}
                                    Сгенерировать AI
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Content editor */}
                    <div className="p-6 space-y-4">
                        <div>
                            <label className="text-body-sm font-medium text-surface-700 mb-2 block">
                                Контент слайда
                            </label>
                            <textarea
                                value={currentSlide.content}
                                onChange={(e) => updateSlide("content", e.target.value)}
                                placeholder={`Введите контент для слайда "${currentSlideDef.title}"...\nПоддерживается Markdown.`}
                                className="w-full min-h-[200px] p-4 rounded-lg border border-surface-200 
                                    bg-surface-0 text-body text-surface-900 
                                    placeholder:text-surface-400 
                                    focus:outline-none focus:ring-2 focus:ring-primary-300 focus:border-primary-400
                                    resize-y transition-all"
                            />
                        </div>

                        <div>
                            <label className="text-body-sm font-medium text-surface-700 mb-2 flex items-center gap-1.5">
                                <StickyNote size={14} strokeWidth={1.75} />
                                Заметки спикера
                            </label>
                            <textarea
                                value={currentSlide.notes}
                                onChange={(e) => updateSlide("notes", e.target.value)}
                                placeholder="Заметки для выступления (видны только вам)..."
                                className="w-full min-h-[80px] p-3 rounded-lg border border-surface-200 
                                    bg-surface-50 text-body-sm text-surface-700 
                                    placeholder:text-surface-400 
                                    focus:outline-none focus:ring-2 focus:ring-primary-300 focus:border-primary-400
                                    resize-y transition-all"
                            />
                        </div>
                    </div>

                    {/* Saving indicator */}
                    {isPending && (
                        <div className="px-6 pb-3 flex items-center gap-1.5 text-caption text-surface-400">
                            <Loader2 size={12} className="animate-spin" />
                            Сохранение...
                        </div>
                    )}
                </motion.div>
            </AnimatePresence>

            {/* Navigation */}
            <div className="flex items-center justify-between">
                <button
                    onClick={goPrev}
                    disabled={currentStep === 0}
                    className="flex items-center gap-1.5 px-4 py-2.5 rounded-lg text-body-sm 
                        bg-surface-100 text-surface-600 hover:bg-surface-200 
                        disabled:opacity-30 disabled:cursor-not-allowed transition-all"
                >
                    <ChevronLeft size={16} strokeWidth={1.75} />
                    Назад
                </button>

                <div className="flex gap-2">
                    <Link
                        href="/workspace/pitch/trainer"
                        className="flex items-center gap-1.5 px-4 py-2.5 rounded-lg text-body-sm 
                            bg-accent-500 text-white hover:bg-accent-600 transition-all shadow-sm"
                    >
                        🎤 Тренажёр питча
                    </Link>
                    <Link
                        href={`/api/export/pitch?projectId=${projectId}`}
                        target="_blank"
                        className="flex items-center gap-1.5 px-4 py-2.5 rounded-lg text-body-sm 
                            bg-surface-100 text-surface-600 hover:bg-surface-200 transition-all"
                    >
                        <Download size={16} strokeWidth={1.75} />
                        PDF
                    </Link>
                </div>

                <button
                    onClick={goNext}
                    disabled={currentStep === PITCH_SLIDES.length - 1}
                    className="flex items-center gap-1.5 px-4 py-2.5 rounded-lg text-body-sm 
                        bg-primary-500 text-white hover:bg-primary-600 
                        disabled:opacity-30 disabled:cursor-not-allowed transition-all shadow-sm"
                >
                    Далее
                    <ChevronRight size={16} strokeWidth={1.75} />
                </button>
            </div>
        </div>
    );
}
