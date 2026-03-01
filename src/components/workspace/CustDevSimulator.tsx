"use client";

import { useState, useRef, useCallback } from "react";
import { Send, Square, MessageCircle, UserCheck, ArrowRight } from "lucide-react";
import { useGamification } from "@/contexts/GamificationContext";
import ReactMarkdown from "react-markdown";
import type { CustDevPersona } from "@/lib/ai/prompts/custdev-simulator";

interface CustDevMessage {
    id: string;
    role: "user" | "assistant";
    content: string;
}

interface CustDevSimulatorProps {
    projectId: string;
    projectTitle: string;
    artifacts: Record<string, unknown>;
}

// ---------------------------------------------------------------------------
// Persona Setup Card
// ---------------------------------------------------------------------------

function PersonaSetup({
    onStart,
}: {
    onStart: (persona: CustDevPersona) => void;
}) {
    const [age, setAge] = useState("25");
    const [role, setRole] = useState("");
    const [attitude, setAttitude] = useState<CustDevPersona["attitude"]>("neutral");

    return (
        <div className="flex-1 flex items-center justify-center p-8">
            <div className="w-full max-w-md space-y-6">
                <div className="text-center space-y-2">
                    <div className="text-5xl">🎭</div>
                    <h2 className="text-h2 text-surface-900">CustDev Тренажёр</h2>
                    <p className="text-body-sm text-surface-500">
                        Настрой персону клиента — AI будет отыгрывать потенциального
                        пользователя из твоей ЦА.
                    </p>
                </div>

                <div className="p-6 rounded-xl bg-surface-0 border border-surface-200 shadow-sm space-y-4">
                    {/* Age */}
                    <div>
                        <label className="text-body-sm font-medium text-surface-700 block mb-1.5">
                            Возраст клиента
                        </label>
                        <input
                            type="text"
                            className="w-full h-11 px-3 rounded-lg border border-surface-200 bg-surface-0 text-body text-surface-900 focus:outline-none focus:ring-2 focus:ring-primary-400 transition-all"
                            value={age}
                            onChange={(e) => setAge(e.target.value)}
                            placeholder="25"
                        />
                    </div>

                    {/* Role */}
                    <div>
                        <label className="text-body-sm font-medium text-surface-700 block mb-1.5">
                            Профессия / роль
                        </label>
                        <input
                            type="text"
                            className="w-full h-11 px-3 rounded-lg border border-surface-200 bg-surface-0 text-body text-surface-900 focus:outline-none focus:ring-2 focus:ring-primary-400 transition-all"
                            value={role}
                            onChange={(e) => setRole(e.target.value)}
                            placeholder="Студент, менеджер, владелец кафе..."
                        />
                    </div>

                    {/* Attitude */}
                    <div>
                        <label className="text-body-sm font-medium text-surface-700 block mb-1.5">
                            Отношение к проблеме
                        </label>
                        <div className="grid grid-cols-3 gap-2">
                            {(
                                [
                                    { key: "skeptic", label: "🤨 Скептик", desc: "Сомневается" },
                                    { key: "neutral", label: "😐 Нейтральный", desc: "Объективный" },
                                    { key: "enthusiast", label: "😃 Энтузиаст", desc: "Активно ищет" },
                                ] as const
                            ).map((opt) => (
                                <button
                                    key={opt.key}
                                    onClick={() => setAttitude(opt.key)}
                                    className={`p-3 rounded-lg border text-center transition-all ${attitude === opt.key
                                        ? "border-primary-500 bg-primary-50 shadow-sm"
                                        : "border-surface-200 hover:border-surface-300"
                                        }`}
                                >
                                    <div className="text-body-sm font-medium">{opt.label}</div>
                                    <div className="text-caption text-surface-400 mt-0.5">{opt.desc}</div>
                                </button>
                            ))}
                        </div>
                    </div>
                </div>

                <button
                    onClick={() => onStart({ age, role: role || "студент", attitude })}
                    disabled={!role.trim()}
                    className="w-full h-12 rounded-lg font-semibold text-white transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                    style={{
                        background:
                            "linear-gradient(135deg, var(--color-primary-500), var(--color-primary-700))",
                        fontFamily: "var(--font-heading)",
                    }}
                >
                    Начать интервью
                    <ArrowRight size={18} />
                </button>
            </div>
        </div>
    );
}

// ---------------------------------------------------------------------------
// Main Simulator Component
// ---------------------------------------------------------------------------

export function CustDevSimulator({
    projectId,
    projectTitle,
    artifacts,
}: CustDevSimulatorProps) {
    const { showXPToast, showLevelUp } = useGamification();
    const [phase, setPhase] = useState<"setup" | "interview" | "feedback">("setup");
    const [persona, setPersona] = useState<CustDevPersona | null>(null);
    const [messages, setMessages] = useState<CustDevMessage[]>([]);
    const [streamingContent, setStreamingContent] = useState("");
    const [isStreaming, setIsStreaming] = useState(false);
    const [feedback, setFeedback] = useState<string | null>(null);
    const [isLoadingFeedback, setIsLoadingFeedback] = useState(false);
    const [input, setInput] = useState("");
    const [error, setError] = useState<string | null>(null);
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const abortRef = useRef<AbortController | null>(null);

    const scrollToBottom = useCallback(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, []);

    // Send message — defined BEFORE handleStart so it's available in closure
    const sendMessage = useCallback(
        async (
            text: string,
            p: CustDevPersona,
            currentMessages: CustDevMessage[]
        ) => {
            setIsStreaming(true);
            setStreamingContent("");
            setError(null);

            const userMsg: CustDevMessage = {
                id: crypto.randomUUID(),
                role: "user",
                content: text,
            };

            const updatedMessages = [...currentMessages, userMsg];
            // Don't add the first "Привет!" to visible messages (it's just a trigger)
            if (currentMessages.length > 0 || text !== "Привет!") {
                setMessages(updatedMessages);
            }

            const controller = new AbortController();
            abortRef.current = controller;

            try {
                const response = await fetch("/api/custdev", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                        message: text,
                        persona: p,
                        history: updatedMessages.map((m) => ({
                            role: m.role,
                            content: m.content,
                        })),
                        projectId,
                    }),
                    signal: controller.signal,
                });

                if (!response.ok) {
                    const errorText = await response.text().catch(() => "");
                    throw new Error(`HTTP ${response.status}: ${errorText}`);
                }

                const reader = response.body!.getReader();
                const decoder = new TextDecoder();
                let accumulated = "";

                while (true) {
                    const { done, value } = await reader.read();
                    if (done) break;

                    const chunk = decoder.decode(value, { stream: true });
                    const lines = chunk.split("\n");

                    for (const line of lines) {
                        if (!line.startsWith("data: ")) continue;
                        const data = line.slice(6).trim();
                        if (data === "[DONE]") break;

                        try {
                            const parsed = JSON.parse(data);
                            if (parsed.type === "token" && parsed.content) {
                                accumulated += parsed.content;
                                setStreamingContent(accumulated);
                            } else if (parsed.type === "error" && parsed.content) {
                                setError(parsed.content);
                            }
                        } catch {
                            // skip
                        }
                    }
                }

                if (accumulated.trim()) {
                    const aiMsg: CustDevMessage = {
                        id: crypto.randomUUID(),
                        role: "assistant",
                        content: accumulated,
                    };
                    const newMessages = [...updatedMessages, aiMsg];
                    setMessages(newMessages);
                }
            } catch (err: unknown) {
                if (err instanceof Error && err.name === "AbortError") return;
                console.error("[CustDev] Error:", err);
                const errMsg = err instanceof Error ? err.message : "Неизвестная ошибка";
                setError(`Ошибка: ${errMsg}`);
                setMessages((prev) => [
                    ...prev,
                    {
                        id: crypto.randomUUID(),
                        role: "assistant",
                        content: `⚠️ Произошла ошибка: ${errMsg}. Попробуй ещё раз.`,
                    },
                ]);
            } finally {
                setIsStreaming(false);
                setStreamingContent("");
                abortRef.current = null;
                setTimeout(scrollToBottom, 100);
            }
        },
        [projectId, scrollToBottom]
    );

    // Start interview — MUST be after sendMessage definition
    const handleStart = useCallback((p: CustDevPersona) => {
        setPersona(p);
        setPhase("interview");
        setError(null);
        // Send initial message to get AI greeting
        sendMessage("Привет!", p, []);
    }, [sendMessage]);

    // Handle send
    const handleSend = useCallback(() => {
        if (!input.trim() || isStreaming || !persona) return;
        const text = input.trim();
        setInput("");
        sendMessage(text, persona, messages);
    }, [input, isStreaming, persona, messages, sendMessage]);

    // End session & get feedback
    const handleEndSession = useCallback(async () => {
        if (!persona || messages.length < 2) return;
        setIsLoadingFeedback(true);

        try {
            const response = await fetch("/api/custdev", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    message: "",
                    persona,
                    history: messages.map((m) => ({
                        role: m.role,
                        content: m.content,
                    })),
                    projectId,
                    endSession: true,
                }),
            });

            const data = await response.json();
            setFeedback(data.feedback);
            setPhase("feedback");

            // Show XP notification
            if (data.xp) {
                showXPToast(data.xp.gained, "CustDev сессия завершена!");
                if (data.xp.leveledUp) {
                    showLevelUp(data.xp.newLevel);
                }
            }
        } catch {
            setFeedback("Не удалось получить фидбэк. Попробуй ещё раз.");
            setPhase("feedback");
        } finally {
            setIsLoadingFeedback(false);
        }
    }, [persona, messages, projectId, showXPToast, showLevelUp]);

    // Reset
    const handleReset = useCallback(() => {
        setPhase("setup");
        setPersona(null);
        setMessages([]);
        setFeedback(null);
        setStreamingContent("");
    }, []);

    // Count user messages (for showing "end session" button)
    const userMessageCount = messages.filter((m) => m.role === "user").length;

    // ---------------------------------------------------------------------------
    // Render
    // ---------------------------------------------------------------------------

    if (phase === "setup") {
        return (
            <div className="h-full flex flex-col bg-surface-0 rounded-2xl border border-surface-200 overflow-y-auto shadow-sm">
                <PersonaSetup onStart={handleStart} />
            </div>
        );
    }

    if (phase === "feedback") {
        return (
            <div className="h-full flex flex-col bg-surface-0 rounded-2xl border border-surface-200 overflow-hidden shadow-sm">
                <div className="flex-1 overflow-y-auto p-6 space-y-4">
                    <div className="text-center space-y-2 mb-6">
                        <div className="text-4xl">📊</div>
                        <h2 className="text-h2 text-surface-900">
                            Результаты интервью
                        </h2>
                        <p className="text-body-sm text-surface-400">
                            +30 XP за завершение сессии
                        </p>
                    </div>

                    {feedback && (
                        <div className="prose prose-sm max-w-none p-6 rounded-xl bg-surface-50 border border-surface-200">
                            <ReactMarkdown>{feedback}</ReactMarkdown>
                        </div>
                    )}
                </div>

                <div className="p-4 border-t border-surface-200">
                    <button
                        onClick={handleReset}
                        className="w-full h-11 rounded-lg font-semibold text-white transition-all flex items-center justify-center gap-2"
                        style={{
                            background:
                                "linear-gradient(135deg, var(--color-primary-500), var(--color-primary-700))",
                            fontFamily: "var(--font-heading)",
                        }}
                    >
                        Начать новую сессию
                    </button>
                </div>
            </div>
        );
    }

    // Interview phase
    return (
        <div className="h-full flex flex-col bg-surface-0 rounded-2xl border border-surface-200 overflow-hidden shadow-sm">
            {/* Header */}
            <div className="px-4 py-3 border-b border-surface-200 flex items-center justify-between bg-surface-50">
                <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-full flex items-center justify-center text-sm"
                        style={{ background: "linear-gradient(135deg, var(--color-accent-400), var(--color-accent-600))" }}>
                        🎭
                    </div>
                    <div>
                        <span className="text-body-sm font-medium text-surface-900">
                            CustDev: {projectTitle}
                        </span>
                        <p className="text-caption text-surface-400">
                            {persona?.role}, {persona?.age} лет •{" "}
                            {persona?.attitude === "skeptic"
                                ? "скептик"
                                : persona?.attitude === "enthusiast"
                                    ? "энтузиаст"
                                    : "нейтральный"}
                        </p>
                    </div>
                </div>

                {userMessageCount >= 3 && (
                    <button
                        onClick={handleEndSession}
                        disabled={isLoadingFeedback || isStreaming}
                        className="h-9 px-4 rounded-lg text-caption font-semibold text-white transition-all flex items-center gap-1.5 disabled:opacity-50"
                        style={{
                            background:
                                "linear-gradient(135deg, var(--color-success-400), var(--color-success-500))",
                        }}
                    >
                        <UserCheck size={14} />
                        {isLoadingFeedback ? "Анализирую..." : "Завершить"}
                    </button>
                )}
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3">
                {messages
                    .filter((m) => !(m.role === "user" && m.content === "Привет!" && messages.indexOf(m) === 0))
                    .map((msg) => (
                        <div
                            key={msg.id}
                            className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
                        >
                            <div
                                className={`max-w-[80%] px-4 py-2.5 rounded-2xl text-body-sm ${msg.role === "user"
                                    ? "bg-primary-500 text-white rounded-br-md"
                                    : "bg-surface-100 text-surface-900 rounded-bl-md"
                                    }`}
                            >
                                <ReactMarkdown>{msg.content}</ReactMarkdown>
                            </div>
                        </div>
                    ))}

                {/* Streaming */}
                {isStreaming && streamingContent && (
                    <div className="flex justify-start">
                        <div className="max-w-[80%] px-4 py-2.5 rounded-2xl rounded-bl-md bg-surface-100 text-body-sm text-surface-900">
                            <ReactMarkdown>{streamingContent}</ReactMarkdown>
                        </div>
                    </div>
                )}

                {/* Typing indicator */}
                {isStreaming && !streamingContent && (
                    <div className="flex justify-start">
                        <div className="px-4 py-2.5 rounded-2xl rounded-bl-md bg-surface-100">
                            <div className="flex gap-1">
                                <span className="w-2 h-2 rounded-full bg-surface-400 animate-bounce" style={{ animationDelay: "0ms" }} />
                                <span className="w-2 h-2 rounded-full bg-surface-400 animate-bounce" style={{ animationDelay: "150ms" }} />
                                <span className="w-2 h-2 rounded-full bg-surface-400 animate-bounce" style={{ animationDelay: "300ms" }} />
                            </div>
                        </div>
                    </div>
                )}

                <div ref={messagesEndRef} />
            </div>

            {/* Hint */}
            {userMessageCount >= 5 && userMessageCount < 8 && (
                <div className="px-4 py-2 bg-accent-50 border-t border-accent-200">
                    <p className="text-caption text-accent-700 flex items-center gap-1.5">
                        <MessageCircle size={14} />
                        Задай ещё несколько вопросов или нажми «Завершить» для получения фидбэка
                    </p>
                </div>
            )}

            {/* Input */}
            <div className="p-4 border-t border-surface-200">
                <div className="flex gap-2">
                    <input
                        type="text"
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        onKeyDown={(e) => {
                            if (e.key === "Enter" && !e.shiftKey) {
                                e.preventDefault();
                                handleSend();
                            }
                        }}
                        placeholder="Задай вопрос клиенту..."
                        disabled={isStreaming}
                        className="flex-1 h-11 px-4 rounded-lg border border-surface-200 bg-surface-0 text-body-sm text-surface-900 focus:outline-none focus:ring-2 focus:ring-primary-400 transition-all disabled:opacity-50"
                    />
                    <button
                        onClick={isStreaming ? () => abortRef.current?.abort() : handleSend}
                        disabled={!isStreaming && !input.trim()}
                        className="h-11 w-11 rounded-lg flex items-center justify-center text-white transition-all disabled:opacity-50"
                        style={{
                            background: isStreaming
                                ? "var(--color-surface-500)"
                                : "linear-gradient(135deg, var(--color-primary-500), var(--color-primary-700))",
                        }}
                    >
                        {isStreaming ? <Square size={16} /> : <Send size={16} />}
                    </button>
                </div>
            </div>
        </div>
    );
}
