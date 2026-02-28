/**
 * GigaChat client — powered by langchain-gigachat (official Sber SDK).
 *
 * Uses LangChain BaseChatModel API: .invoke(), .stream(), .bindTools()
 * SSL: handled via Node.js https.Agent with rejectUnauthorized: false (dev)
 */

import { GigaChat } from "langchain-gigachat";
import { Agent } from "node:https";

// ---------------------------------------------------------------------------
// HTTPS Agent for НУЦ Минцифры certificate (dev bypass)
// In production: install the root cert instead
// ---------------------------------------------------------------------------

const httpsAgent = new Agent({
    rejectUnauthorized: false,
});

// ---------------------------------------------------------------------------
// Create model instance
// ---------------------------------------------------------------------------

export function createGigaChatModel(options?: {
    model?: string;
    temperature?: number;
    maxTokens?: number;
    streaming?: boolean;
}) {
    return new GigaChat({
        credentials: process.env.GIGACHAT_API_KEY,
        model: options?.model ?? "GigaChat",
        temperature: options?.temperature ?? 0.7,
        maxTokens: options?.maxTokens ?? 2048,
        streaming: options?.streaming ?? true,
        clientConfig: {
            httpsAgent,
        },
    } as ConstructorParameters<typeof GigaChat>[0]);
}

// ---------------------------------------------------------------------------
// Convenience: non-streaming model for tool execution follow-ups
// ---------------------------------------------------------------------------

export function createGigaChatModelSync() {
    return createGigaChatModel({ streaming: false });
}

// ---------------------------------------------------------------------------
// Re-export types for convenience
// ---------------------------------------------------------------------------

export type { GigaChat };
