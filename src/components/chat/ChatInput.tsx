"use client";

import { useRef, useEffect, useState } from "react";
import { Send, Square } from "lucide-react";
import { motion } from "framer-motion";

interface ChatInputProps {
    onSend: (message: string) => void;
    isLoading: boolean;
    onStop?: () => void;
}

export function ChatInput({ onSend, isLoading, onStop }: ChatInputProps) {
    const [value, setValue] = useState("");
    const textareaRef = useRef<HTMLTextAreaElement>(null);

    // Auto-resize textarea
    useEffect(() => {
        const el = textareaRef.current;
        if (!el) return;
        el.style.height = "auto";
        el.style.height = `${Math.min(el.scrollHeight, 160)}px`;
    }, [value]);

    function handleKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>) {
        if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault();
            handleSend();
        }
    }

    function handleSend() {
        const trimmed = value.trim();
        if (!trimmed || isLoading) return;
        onSend(trimmed);
        setValue("");
    }

    return (
        <div className="border-t border-surface-200 bg-surface-0 px-4 py-3">
            <div className="flex gap-3 items-end max-w-3xl mx-auto">
                <div className="flex-1 relative">
                    <textarea
                        ref={textareaRef}
                        value={value}
                        onChange={(e) => setValue(e.target.value)}
                        onKeyDown={handleKeyDown}
                        placeholder="Напиши сообщение... (Enter — отправить, Shift+Enter — новая строка)"
                        disabled={isLoading}
                        rows={1}
                        className="w-full resize-none rounded-xl px-4 py-3 pr-12 text-sm leading-relaxed border border-surface-200 bg-surface-50 focus:bg-surface-0 focus:border-primary-400 focus:outline-none focus:ring-2 focus:ring-primary-100 transition-all placeholder-surface-400 disabled:opacity-50"
                        style={{ minHeight: "48px", maxHeight: "160px" }}
                    />
                </div>

                <motion.button
                    whileTap={{ scale: 0.95 }}
                    whileHover={{ scale: 1.05 }}
                    onClick={isLoading ? onStop : handleSend}
                    disabled={!isLoading && !value.trim()}
                    className="flex-shrink-0 w-11 h-11 rounded-xl flex items-center justify-center text-white transition-all disabled:opacity-40 disabled:cursor-not-allowed"
                    style={{
                        background: isLoading
                            ? "var(--color-surface-400)"
                            : "linear-gradient(135deg, var(--color-primary-500), var(--color-primary-600))",
                        boxShadow: isLoading
                            ? "none"
                            : "0 0 20px rgba(99, 102, 241, 0.25)",
                    }}
                    title={isLoading ? "Остановить" : "Отправить"}
                >
                    {isLoading ? (
                        <Square size={16} strokeWidth={2} />
                    ) : (
                        <Send size={16} strokeWidth={1.75} />
                    )}
                </motion.button>
            </div>
            <p className="text-center text-xs text-surface-400 mt-1.5">
                AI может ошибаться. Проверяй важную информацию.
            </p>
        </div>
    );
}
