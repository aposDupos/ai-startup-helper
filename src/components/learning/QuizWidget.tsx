"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Check, X, RotateCcw } from "lucide-react";
import type { QuizQuestion } from "@/types/lesson";

interface QuizWidgetProps {
    questions: QuizQuestion[];
    onComplete: (score: number) => void;
}

export function QuizWidget({ questions, onComplete }: QuizWidgetProps) {
    const [currentIndex, setCurrentIndex] = useState(0);
    const [selectedOption, setSelectedOption] = useState<number | null>(null);
    const [isChecked, setIsChecked] = useState(false);
    const [correctCount, setCorrectCount] = useState(0);
    const [isFinished, setIsFinished] = useState(false);

    const question = questions[currentIndex];
    const isCorrect = selectedOption === question?.correct;

    const handleCheck = () => {
        if (selectedOption === null) return;
        setIsChecked(true);
        if (isCorrect) {
            setCorrectCount((prev) => prev + 1);
        }
    };

    const handleNext = () => {
        if (currentIndex < questions.length - 1) {
            setCurrentIndex((prev) => prev + 1);
            setSelectedOption(null);
            setIsChecked(false);
        } else {
            const finalScore = isCorrect ? correctCount + 1 : correctCount;
            setIsFinished(true);
            onComplete(Math.round((finalScore / questions.length) * 100));
        }
    };

    const handleRestart = () => {
        setCurrentIndex(0);
        setSelectedOption(null);
        setIsChecked(false);
        setCorrectCount(0);
        setIsFinished(false);
    };

    if (isFinished) {
        const score = Math.round((correctCount / questions.length) * 100);
        return (
            <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="p-4 rounded-xl bg-surface-0 border border-surface-200 text-center"
            >
                <div className="text-3xl mb-2">
                    {score >= 70 ? "🎉" : score >= 40 ? "👍" : "📚"}
                </div>
                <p className="text-h3 text-surface-900 mb-1">
                    {score}% правильно
                </p>
                <p className="text-body-sm text-surface-500 mb-3">
                    {correctCount} из {questions.length} вопросов
                </p>
                {score < 100 && (
                    <button
                        onClick={handleRestart}
                        className="flex items-center gap-1.5 mx-auto px-3 py-1.5 text-body-sm text-primary-600 hover:bg-primary-50 rounded-lg transition-colors"
                    >
                        <RotateCcw size={14} />
                        Попробовать снова
                    </button>
                )}
            </motion.div>
        );
    }

    return (
        <div className="p-4 rounded-xl bg-surface-0 border border-surface-200">
            {/* Progress */}
            <div className="flex items-center justify-between mb-3">
                <span className="text-caption font-semibold text-surface-500">
                    Вопрос {currentIndex + 1} из {questions.length}
                </span>
                <div className="flex gap-1">
                    {questions.map((_, i) => (
                        <div
                            key={i}
                            className="w-2 h-2 rounded-full transition-colors"
                            style={{
                                backgroundColor:
                                    i < currentIndex
                                        ? "var(--color-success-500)"
                                        : i === currentIndex
                                            ? "var(--color-primary-500)"
                                            : "var(--color-surface-200)",
                            }}
                        />
                    ))}
                </div>
            </div>

            {/* Question */}
            <p className="text-body font-medium text-surface-900 mb-3">
                {question.question}
            </p>

            {/* Options */}
            <div className="space-y-2 mb-4">
                <AnimatePresence mode="wait">
                    {question.options.map((option, i) => {
                        const isSelected = selectedOption === i;
                        const showCorrect =
                            isChecked && i === question.correct;
                        const showWrong =
                            isChecked && isSelected && !isCorrect;

                        return (
                            <motion.button
                                key={`${currentIndex}-${i}`}
                                initial={{ opacity: 0, x: -5 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: i * 0.05 }}
                                onClick={() => {
                                    if (!isChecked) setSelectedOption(i);
                                }}
                                disabled={isChecked}
                                className={`
                                    w-full text-left p-3 rounded-lg border text-body-sm transition-all
                                    ${showCorrect
                                        ? "border-success-500 bg-success-500/5 text-success-700"
                                        : showWrong
                                            ? "border-red-500 bg-red-500/5 text-red-700"
                                            : isSelected
                                                ? "border-primary-400 bg-primary-50 text-primary-700"
                                                : "border-surface-200 text-surface-700 hover:border-primary-200 hover:bg-primary-50/50"
                                    }
                                    ${isChecked ? "cursor-default" : "cursor-pointer"}
                                `}
                            >
                                <div className="flex items-center justify-between">
                                    <span>{option}</span>
                                    {showCorrect && (
                                        <Check
                                            size={16}
                                            className="text-success-500"
                                        />
                                    )}
                                    {showWrong && (
                                        <X
                                            size={16}
                                            className="text-red-500"
                                        />
                                    )}
                                </div>
                            </motion.button>
                        );
                    })}
                </AnimatePresence>
            </div>

            {/* Action */}
            {!isChecked ? (
                <button
                    onClick={handleCheck}
                    disabled={selectedOption === null}
                    className={`
                        w-full py-2.5 rounded-lg text-body-sm font-medium transition-all
                        ${selectedOption !== null
                            ? "bg-primary-500 text-white hover:bg-primary-600"
                            : "bg-surface-100 text-surface-400 cursor-not-allowed"
                        }
                    `}
                >
                    Проверить
                </button>
            ) : (
                <button
                    onClick={handleNext}
                    className="w-full py-2.5 rounded-lg text-body-sm font-medium bg-primary-500 text-white hover:bg-primary-600 transition-colors"
                >
                    {currentIndex < questions.length - 1
                        ? "Далее"
                        : "Завершить"}
                </button>
            )}
        </div>
    );
}
