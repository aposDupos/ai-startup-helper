"use client";

import { useState, useRef, useCallback, useMemo } from "react";
import { ChatInput } from "./ChatInput";
import { MessageList } from "./MessageList";
import { StageBadge } from "./StageBadge";
import type { StageContext } from "@/lib/ai/prompts";

export interface ToolResult {
    toolName: string;
    result: unknown;
}

export interface Message {
    id: string;
    role: "user" | "assistant" | "system";
    content: string;
    createdAt: Date;
    toolResults?: ToolResult[];
}

// Map entry point context to chat StageContext + greeting
const CONTEXT_MAP: Record<string, { stageContext: StageContext; greeting: string }> = {
    idea_search: {
        stageContext: "idea_search",
        greeting: "Привет! 👋 Давай найдём идею для стартапа. Расскажи о своих интересах, навыках и проблемах, которые ты видишь вокруг — мы вместе придумаем что-то крутое!",
    },
    idea_evaluation: {
        stageContext: "idea_evaluation",
        greeting: "Привет! 🎯 Расскажи свою идею, и я помогу её оценить. Опиши проблему, которую ты решаешь, и кто твоя целевая аудитория.",
    },
    project_assessment: {
        stageContext: "project_assessment",
        greeting: "Привет! 🚀 Расскажи о своём проекте — что уже сделано, на каком этапе находишься. Я определю стадию и помогу двигаться дальше.",
    },
};

// Map project.stage → valid StageContext for the DB check constraint
const STAGE_TO_CONTEXT: Record<string, StageContext> = {
    idea: "idea_search",
    validation: "validation",
    business_model: "bmc",
    mvp: "mvp",
    pitch: "pitch",
};

interface ChatWindowProps {
    initialConversationId?: string;
    initialMessages?: Message[];
    projectStage?: string;
    stageContext?: string;
    checklistItemKey?: string;
    initialContext?: string;
}

export function ChatWindow({
    initialConversationId,
    initialMessages = [],
    projectStage,
    initialContext,
}: ChatWindowProps) {
    // Derive initial context from entry point or project stage
    const contextConfig = initialContext ? CONTEXT_MAP[initialContext] : undefined;
    const derivedStageContext: StageContext =
        contextConfig?.stageContext
        ?? (projectStage ? STAGE_TO_CONTEXT[projectStage] : undefined)
        ?? "general";

    // Build initial messages with greeting if entry point context provided
    const startingMessages = useMemo(() => {
        if (initialMessages.length > 0) return initialMessages;
        if (contextConfig?.greeting) {
            return [
                {
                    id: crypto.randomUUID(),
                    role: "assistant" as const,
                    content: contextConfig.greeting,
                    createdAt: new Date(),
                },
            ];
        }
        return [];
    }, [initialMessages, contextConfig?.greeting]);

    const [messages, setMessages] = useState<Message[]>(startingMessages);
    const [streamingContent, setStreamingContent] = useState("");
    const [isStreaming, setIsStreaming] = useState(false);
    const [contextType] = useState<StageContext>(derivedStageContext);
    const [conversationId, setConversationId] = useState<string | undefined>(
        initialConversationId
    );
    const abortControllerRef = useRef<AbortController | null>(null);

    const handleSend = useCallback(
        async (message: string) => {
            if (isStreaming) return;

            // Add user message immediately
            const userMessage: Message = {
                id: crypto.randomUUID(),
                role: "user",
                content: message,
                createdAt: new Date(),
            };
            setMessages((prev) => [...prev, userMessage]);
            setIsStreaming(true);
            setStreamingContent("");

            const controller = new AbortController();
            abortControllerRef.current = controller;

            try {
                const response = await fetch("/api/chat", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                        message,
                        conversationId,
                        contextType,
                    }),
                    signal: controller.signal,
                });

                if (!response.ok) {
                    throw new Error(`HTTP ${response.status}`);
                }

                const reader = response.body!.getReader();
                const decoder = new TextDecoder();

                let accumulatedText = "";
                let toolResults: ToolResult[] = [];
                let newConversationId = conversationId;

                while (true) {
                    const { done, value } = await reader.read();
                    if (done) break;

                    const chunk = decoder.decode(value, { stream: true });
                    const lines = chunk.split("\n");

                    for (const line of lines) {
                        if (!line.startsWith("data: ")) continue;
                        const data = line.slice(6).trim();

                        if (data === "[DONE]") {
                            break;
                        }

                        try {
                            const parsed = JSON.parse(data) as {
                                type: "meta" | "token" | "tools";
                                content?: string;
                                conversationId?: string;
                                results?: ToolResult[];
                            };

                            if (parsed.type === "meta" && parsed.conversationId) {
                                newConversationId = parsed.conversationId;
                                setConversationId(parsed.conversationId);
                            } else if (parsed.type === "token" && parsed.content) {
                                accumulatedText += parsed.content;
                                setStreamingContent(accumulatedText);
                            } else if (parsed.type === "tools" && parsed.results) {
                                toolResults = parsed.results;
                            }
                        } catch {
                            // skip malformed
                        }
                    }
                }

                // Add completed assistant message
                if (accumulatedText.trim() || toolResults.length > 0) {
                    const assistantMessage: Message = {
                        id: crypto.randomUUID(),
                        role: "assistant",
                        content: accumulatedText,
                        createdAt: new Date(),
                        toolResults: toolResults.length > 0 ? toolResults : undefined,
                    };
                    setMessages((prev) => [...prev, assistantMessage]);
                }
            } catch (err: unknown) {
                if (err instanceof Error && err.name === "AbortError") return;

                const errorMessage: Message = {
                    id: crypto.randomUUID(),
                    role: "assistant",
                    content:
                        "Извини, произошла ошибка. Попробуй ещё раз.",
                    createdAt: new Date(),
                };
                setMessages((prev) => [...prev, errorMessage]);
            } finally {
                setIsStreaming(false);
                setStreamingContent("");
                abortControllerRef.current = null;
            }
        },
        [isStreaming, conversationId, contextType]
    );

    function handleStop() {
        abortControllerRef.current?.abort();
        setIsStreaming(false);
        if (streamingContent) {
            setMessages((prev) => [
                ...prev,
                {
                    id: crypto.randomUUID(),
                    role: "assistant",
                    content: streamingContent,
                    createdAt: new Date(),
                },
            ]);
        }
        setStreamingContent("");
    }

    return (
        <div className="flex flex-col h-full bg-surface-0 rounded-2xl border border-surface-200 overflow-hidden shadow-sm">
            {/* Read-only stage badge */}
            <StageBadge
                stage={contextType}
                hasProject={!!projectStage}
            />

            {/* Messages area */}
            {messages.length === 0 && !isStreaming ? (
                <div className="flex-1 flex items-center justify-center p-8">
                    <div className="text-center space-y-3 max-w-sm">
                        <div className="text-4xl">🚀</div>
                        <h3 className="text-h4 font-semibold text-surface-800">
                            Начни разговор
                        </h3>
                        <p className="text-body-sm text-surface-500">
                            Расскажи о своей идее или задай любой вопрос про стартапы.
                            AI-наставник поможет пройти путь от идеи до питча.
                        </p>
                    </div>
                </div>
            ) : (
                <MessageList
                    messages={messages}
                    isStreaming={isStreaming}
                    streamingContent={streamingContent}
                />
            )}

            {/* Input */}
            <ChatInput
                onSend={handleSend}
                isLoading={isStreaming}
                onStop={handleStop}
            />
        </div>
    );
}
