"use client";

import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Send, Loader2, UserCircle, Bot, Flag } from "lucide-react";
import type { TrainingRound, TrainingResults } from "@/types/pitch";
import { startTraining, sendAnswer, generateFeedback } from "@/app/(main)/workspace/pitch/trainer/actions";
import { PitchFeedback } from "./PitchFeedback";
import { toast } from "sonner";

interface PitchTrainerProps {
    projectId: string;
    projectTitle: string;
}

type TrainerState = "idle" | "loading" | "active" | "answering" | "feedback";

export function PitchTrainer({ projectId, projectTitle }: PitchTrainerProps) {
    const [state, setState] = useState<TrainerState>("idle");
    const [rounds, setRounds] = useState<TrainingRound[]>([]);
    const [currentQuestion, setCurrentQuestion] = useState("");
    const [answer, setAnswer] = useState("");
    const [feedbackResults, setFeedbackResults] = useState<TrainingResults | null>(null);
    const chatEndRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [rounds, currentQuestion]);

    // --- Start session ---------------------------------------------------

    const handleStart = async () => {
        setState("loading");
        try {
            const result = await startTraining(projectId);
            setCurrentQuestion(result.question);
            setState("active");
        } catch {
            toast.error("Не удалось начать тренировку");
            setState("idle");
        }
    };

    // --- Submit answer ---------------------------------------------------

    const handleSubmit = async () => {
        if (!answer.trim()) return;

        const completedRound: TrainingRound = {
            question: currentQuestion,
            answer: answer.trim(),
        };

        const updatedRounds = [...rounds, completedRound];
        setRounds(updatedRounds);
        setAnswer("");
        setState("answering");

        try {
            const result = await sendAnswer(projectId, updatedRounds, completedRound.answer);

            if (result.shouldEnd || updatedRounds.length >= 9) {
                // Generate feedback
                setState("loading");
                const feedback = await generateFeedback(projectId, updatedRounds);
                setFeedbackResults(feedback);
                setState("feedback");
            } else {
                setCurrentQuestion(result.question);
                setState("active");
            }
        } catch {
            toast.error("Ошибка обработки ответа");
            setState("active");
        }
    };

    // --- Finish early ----------------------------------------------------

    const handleFinishEarly = async () => {
        if (rounds.length < 2) {
            toast.info("Ответьте хотя бы на 2 вопроса для получения фидбэка");
            return;
        }

        setState("loading");
        try {
            const feedback = await generateFeedback(projectId, rounds);
            setFeedbackResults(feedback);
            setState("feedback");
        } catch {
            toast.error("Ошибка генерации фидбэка");
            setState("active");
        }
    };

    // --- Restart ---------------------------------------------------------

    const handleRestart = () => {
        setRounds([]);
        setCurrentQuestion("");
        setAnswer("");
        setFeedbackResults(null);
        setState("idle");
    };

    // -- Feedback view ----------------------------------------------------

    if (state === "feedback" && feedbackResults) {
        return <PitchFeedback results={feedbackResults} onRestart={handleRestart} />;
    }

    return (
        <div className="space-y-4">
            {/* Start screen */}
            {state === "idle" && (
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-surface-0 rounded-xl border border-surface-200 p-8 text-center space-y-4"
                >
                    <div className="text-6xl">🎙️</div>
                    <h2 className="text-h2 text-surface-900">
                        Тренировка питча
                    </h2>
                    <p className="text-body text-surface-500 max-w-md mx-auto">
                        AI-инвестор проведёт с вами тренировочную встречу по проекту «{projectTitle}».
                        Он задаст 5–10 каверзных вопросов и даст подробный фидбэк.
                    </p>
                    <button
                        onClick={handleStart}
                        className="px-6 py-3 rounded-lg bg-primary-500 text-white font-semibold 
                            hover:bg-primary-600 transition-all shadow-md hover:shadow-lg
                            active:scale-[0.97]"
                    >
                        Начать тренировку
                    </button>
                </motion.div>
            )}

            {/* Chat area */}
            {(state === "active" || state === "answering" || state === "loading") && (
                <div className="space-y-4">
                    {/* Chat messages */}
                    <div className="bg-surface-0 rounded-xl border border-surface-200 p-4 min-h-[400px] max-h-[600px] overflow-y-auto space-y-4">
                        {/* Completed rounds */}
                        {rounds.map((round, i) => (
                            <div key={i} className="space-y-3">
                                {/* Investor question */}
                                <motion.div
                                    initial={{ opacity: 0, x: -10 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    className="flex gap-3"
                                >
                                    <div className="w-8 h-8 rounded-full bg-accent-100 flex items-center justify-center flex-shrink-0">
                                        <Bot size={16} className="text-accent-600" strokeWidth={1.75} />
                                    </div>
                                    <div className="bg-accent-50 rounded-lg rounded-tl-sm px-4 py-2.5 max-w-[80%]">
                                        <p className="text-body-sm text-surface-800">{round.question}</p>
                                    </div>
                                </motion.div>

                                {/* User answer */}
                                <motion.div
                                    initial={{ opacity: 0, x: 10 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    className="flex gap-3 justify-end"
                                >
                                    <div className="bg-primary-50 rounded-lg rounded-tr-sm px-4 py-2.5 max-w-[80%]">
                                        <p className="text-body-sm text-surface-800">{round.answer}</p>
                                    </div>
                                    <div className="w-8 h-8 rounded-full bg-primary-100 flex items-center justify-center flex-shrink-0">
                                        <UserCircle size={16} className="text-primary-600" strokeWidth={1.75} />
                                    </div>
                                </motion.div>
                            </div>
                        ))}

                        {/* Current question */}
                        {currentQuestion && state !== "loading" && (
                            <motion.div
                                initial={{ opacity: 0, x: -10 }}
                                animate={{ opacity: 1, x: 0 }}
                                className="flex gap-3"
                            >
                                <div className="w-8 h-8 rounded-full bg-accent-100 flex items-center justify-center flex-shrink-0">
                                    <Bot size={16} className="text-accent-600" strokeWidth={1.75} />
                                </div>
                                <div className="bg-accent-50 rounded-lg rounded-tl-sm px-4 py-2.5 max-w-[80%]">
                                    <p className="text-body-sm text-surface-800">{currentQuestion}</p>
                                </div>
                            </motion.div>
                        )}

                        {/* Loading */}
                        {(state === "answering" || state === "loading") && (
                            <motion.div
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                className="flex gap-3"
                            >
                                <div className="w-8 h-8 rounded-full bg-accent-100 flex items-center justify-center flex-shrink-0">
                                    <Loader2 size={16} className="text-accent-600 animate-spin" />
                                </div>
                                <div className="bg-accent-50 rounded-lg rounded-tl-sm px-4 py-2.5">
                                    <p className="text-body-sm text-surface-500">
                                        {state === "loading" ? "Анализирую ваши ответы..." : "Думаю над следующим вопросом..."}
                                    </p>
                                </div>
                            </motion.div>
                        )}

                        <div ref={chatEndRef} />
                    </div>

                    {/* Input */}
                    {state === "active" && (
                        <div className="flex gap-3">
                            <textarea
                                value={answer}
                                onChange={(e) => setAnswer(e.target.value)}
                                placeholder="Ваш ответ инвестору..."
                                onKeyDown={(e) => {
                                    if (e.key === "Enter" && !e.shiftKey) {
                                        e.preventDefault();
                                        handleSubmit();
                                    }
                                }}
                                className="flex-1 p-3 rounded-lg border border-surface-200 bg-surface-0 
                                    text-body text-surface-900 placeholder:text-surface-400 
                                    focus:outline-none focus:ring-2 focus:ring-primary-300 
                                    resize-none min-h-[60px] max-h-[120px]"
                                rows={2}
                            />
                            <div className="flex flex-col gap-2">
                                <button
                                    onClick={handleSubmit}
                                    disabled={!answer.trim()}
                                    className="px-4 py-2.5 rounded-lg bg-primary-500 text-white 
                                        hover:bg-primary-600 disabled:opacity-30 transition-all"
                                >
                                    <Send size={16} strokeWidth={1.75} />
                                </button>
                                <button
                                    onClick={handleFinishEarly}
                                    className="px-4 py-2.5 rounded-lg bg-surface-100 text-surface-500 
                                        hover:bg-surface-200 transition-all text-xs"
                                    title="Завершить тренировку"
                                >
                                    <Flag size={16} strokeWidth={1.75} />
                                </button>
                            </div>
                        </div>
                    )}

                    {/* Round counter */}
                    <div className="text-center text-caption text-surface-400">
                        Раунд {rounds.length + (state === "active" ? 1 : 0)} из ~10
                    </div>
                </div>
            )}
        </div>
    );
}
