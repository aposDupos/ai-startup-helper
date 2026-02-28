"use client";

import { useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import type { Message } from "./ChatWindow";
import { MessageBubble } from "./MessageBubble";
import { TypingIndicator } from "./TypingIndicator";

interface MessageListProps {
    messages: Message[];
    isStreaming: boolean;
    streamingContent: string;
}

export function MessageList({
    messages,
    isStreaming,
    streamingContent,
}: MessageListProps) {
    const bottomRef = useRef<HTMLDivElement>(null);

    // Auto-scroll to bottom on new messages
    useEffect(() => {
        bottomRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages, streamingContent]);

    return (
        <div className="flex-1 overflow-y-auto px-4 py-6 space-y-4">
            <AnimatePresence initial={false}>
                {messages.map((msg) => (
                    <motion.div
                        key={msg.id}
                        initial={{ opacity: 0, y: 12 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.25, ease: "easeOut" }}
                    >
                        <MessageBubble message={msg} />
                    </motion.div>
                ))}

                {/* Streaming message */}
                {isStreaming && streamingContent && (
                    <motion.div
                        key="streaming"
                        initial={{ opacity: 0, y: 12 }}
                        animate={{ opacity: 1, y: 0 }}
                    >
                        <MessageBubble
                            message={{
                                id: "streaming",
                                role: "assistant",
                                content: streamingContent,
                                createdAt: new Date(),
                            }}
                            isStreaming
                        />
                    </motion.div>
                )}

                {/* Typing indicator when waiting for first token */}
                {isStreaming && !streamingContent && (
                    <motion.div
                        key="typing"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                    >
                        <TypingIndicator />
                    </motion.div>
                )}
            </AnimatePresence>

            <div ref={bottomRef} />
        </div>
    );
}
