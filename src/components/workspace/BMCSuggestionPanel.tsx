"use client";

import { useState } from "react";
import { Sparkles, Loader2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { getBMCSuggestions } from "@/app/(main)/workspace/bmc/actions";

interface BMCSuggestionPanelProps {
    projectId: string;
    blockKey: string;
    blockLabel: string;
    onAccept: (text: string) => void;
    onClose: () => void;
}

export function BMCSuggestionPanel({
    projectId,
    blockKey,
    blockLabel,
    onAccept,
    onClose,
}: BMCSuggestionPanelProps) {
    const [suggestions, setSuggestions] = useState<string[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [hasLoaded, setHasLoaded] = useState(false);

    const loadSuggestions = async () => {
        setIsLoading(true);
        try {
            const result = await getBMCSuggestions(projectId, blockKey);
            setSuggestions(result);
            setHasLoaded(true);
        } catch {
            setSuggestions([
                "Не удалось получить подсказки. Попробуйте ещё раз.",
            ]);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <motion.div
            initial={{ opacity: 0, y: 5 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 5 }}
            className="mt-2 p-3 rounded-lg border border-primary-200 bg-primary-50/50"
        >
            <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-1.5">
                    <Sparkles
                        size={14}
                        strokeWidth={1.75}
                        className="text-primary-500"
                    />
                    <span className="text-caption font-semibold text-primary-700">
                        AI-подсказки для «{blockLabel}»
                    </span>
                </div>
                <button
                    onClick={onClose}
                    className="text-caption text-surface-400 hover:text-surface-600 transition-colors"
                >
                    Закрыть
                </button>
            </div>

            {!hasLoaded && !isLoading && (
                <button
                    onClick={loadSuggestions}
                    className="w-full py-2 rounded-md text-body-sm font-medium text-primary-600 border border-primary-200 hover:bg-primary-100 transition-colors"
                >
                    Сгенерировать подсказки
                </button>
            )}

            {isLoading && (
                <div className="flex items-center justify-center gap-2 py-3">
                    <Loader2
                        size={16}
                        className="animate-spin text-primary-500"
                    />
                    <span className="text-body-sm text-primary-500">
                        Генерирую...
                    </span>
                </div>
            )}

            <AnimatePresence>
                {hasLoaded && !isLoading && (
                    <div className="space-y-2">
                        {suggestions.map((suggestion, i) => (
                            <motion.div
                                key={i}
                                initial={{ opacity: 0, x: -5 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: i * 0.1 }}
                                className="flex items-start gap-2 p-2 rounded-md bg-white/80 border border-primary-100"
                            >
                                <p className="flex-1 text-body-sm text-surface-800">
                                    {suggestion}
                                </p>
                                <button
                                    onClick={() => onAccept(suggestion)}
                                    className="shrink-0 px-2 py-1 text-caption font-medium text-white bg-primary-500 rounded-md hover:bg-primary-600 transition-colors"
                                >
                                    Добавить
                                </button>
                            </motion.div>
                        ))}
                        <button
                            onClick={loadSuggestions}
                            className="w-full py-1.5 text-caption text-primary-500 hover:text-primary-700 transition-colors"
                        >
                            Ещё подсказки
                        </button>
                    </div>
                )}
            </AnimatePresence>
        </motion.div>
    );
}
