"use client";

import ReactMarkdown from "react-markdown";
import { User, Bot } from "lucide-react";
import { ICEScoreCard } from "./ICEScoreCard";
import { IdeaSavedCard } from "./IdeaSavedCard";
import type { Message } from "./ChatWindow";

interface MessageBubbleProps {
    message: Message;
    isStreaming?: boolean;
}

export function MessageBubble({ message, isStreaming }: MessageBubbleProps) {
    const isUser = message.role === "user";

    return (
        <div className={`flex gap-3 ${isUser ? "flex-row-reverse" : "flex-row"}`}>
            {/* Avatar */}
            <div
                className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${isUser
                        ? "bg-primary-100 text-primary-600"
                        : "bg-surface-100 text-surface-600"
                    }`}
            >
                {isUser ? (
                    <User size={16} strokeWidth={1.75} />
                ) : (
                    <Bot size={16} strokeWidth={1.75} />
                )}
            </div>

            {/* Content */}
            <div className={`flex flex-col gap-2 max-w-[80%] ${isUser ? "items-end" : "items-start"}`}>
                {/* Text bubble */}
                <div
                    className={`rounded-2xl px-4 py-3 text-sm leading-relaxed ${isUser
                            ? "bg-primary-500 text-white rounded-tr-sm"
                            : "bg-surface-50 border border-surface-200 text-surface-900 rounded-tl-sm"
                        }`}
                    style={
                        isUser
                            ? {
                                background:
                                    "linear-gradient(135deg, var(--color-primary-500), var(--color-primary-600))",
                            }
                            : undefined
                    }
                >
                    {isUser ? (
                        <p className="whitespace-pre-wrap">{message.content}</p>
                    ) : (
                        <div className="prose prose-sm max-w-none prose-headings:font-semibold prose-headings:text-surface-900 prose-p:text-surface-800 prose-strong:text-surface-900 prose-code:bg-surface-100 prose-code:px-1 prose-code:rounded">
                            <ReactMarkdown>{message.content}</ReactMarkdown>
                            {isStreaming && (
                                <span className="inline-block w-0.5 h-4 bg-primary-500 animate-pulse ml-0.5 align-middle" />
                            )}
                        </div>
                    )}
                </div>

                {/* Tool result cards */}
                {message.toolResults?.map((result, i) => {
                    if (result.toolName === "evaluate_ice") {
                        return <ICEScoreCard key={i} data={result.result as never} />;
                    }
                    if (result.toolName === "save_idea") {
                        return <IdeaSavedCard key={i} data={result.result as never} />;
                    }
                    return null;
                })}
            </div>
        </div>
    );
}
