/**
 * AI Observability — logs every GigaChat call to ai_logs table.
 * Uses service role key to bypass RLS for inserts.
 */

import { createClient as createServerClient } from "@/lib/supabase/server";

export interface AICallLog {
    userId: string;
    conversationId?: string;
    model: string;
    promptTokens?: number;
    completionTokens?: number;
    latencyMs: number;
    status: "success" | "error";
    errorMessage?: string;
}

export async function logAICall(params: AICallLog): Promise<void> {
    try {
        const supabase = await createServerClient();

        await supabase.from("ai_logs").insert({
            user_id: params.userId,
            conversation_id: params.conversationId ?? null,
            model: params.model,
            prompt_tokens: params.promptTokens ?? null,
            completion_tokens: params.completionTokens ?? null,
            latency_ms: params.latencyMs,
            status: params.status,
            error_message: params.errorMessage ?? null,
        });
    } catch (err) {
        // Observability failures should never break the main flow
        console.error("[Observability] Failed to log AI call:", err);
    }
}

/**
 * Wraps an async AI call with timing and automatic logging.
 */
export async function withObservability<T>(
    params: Omit<AICallLog, "latencyMs" | "status" | "errorMessage">,
    fn: () => Promise<T>
): Promise<T> {
    const start = Date.now();
    try {
        const result = await fn();
        await logAICall({
            ...params,
            latencyMs: Date.now() - start,
            status: "success",
        });
        return result;
    } catch (err) {
        await logAICall({
            ...params,
            latencyMs: Date.now() - start,
            status: "error",
            errorMessage: err instanceof Error ? err.message : String(err),
        });
        throw err;
    }
}
