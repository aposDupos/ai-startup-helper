import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { runAgentStreaming, type GigaChatMessageInput } from "@/lib/ai/agents/router";
import { logAICall } from "@/lib/ai/observability";
import { searchKnowledge, formatRAGContext } from "@/lib/ai/rag/search";
import type { StageContext, UserRole, ProjectContext } from "@/lib/ai/prompts";
import type { ProgressData } from "@/types/project";

export const runtime = "nodejs";
export const maxDuration = 60;

interface ChatRequestBody {
    message: string;
    conversationId?: string;
    contextType?: StageContext;
}

export async function POST(req: Request) {
    const supabase = await createClient();

    // 1. Auth check
    const {
        data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // 2. Parse body
    let body: ChatRequestBody;
    try {
        body = await req.json();
    } catch {
        return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
    }

    const {
        message,
        conversationId: existingConversationId,
        contextType: rawContextType,
    } = body;

    const contextType = rawContextType || "general";

    if (!message?.trim()) {
        return NextResponse.json({ error: "Message is required" }, { status: 400 });
    }

    // 3. Get user profile for role-based tone
    const { data: profile } = await supabase
        .from("profiles")
        .select("role")
        .eq("id", user.id)
        .single();

    const userRole: UserRole = (profile?.role as UserRole) ?? "student";

    // 3b. Load active project + checklists for context injection
    let projectContext: ProjectContext | null = null;

    const { data: activeProject } = await supabase
        .from("projects")
        .select("id, title, description, stage, progress_data, artifacts")
        .eq("owner_id", user.id)
        .eq("is_active", true)
        .single();

    if (activeProject) {
        const progressData = (activeProject.progress_data as ProgressData) || {};
        const currentStage = activeProject.stage || "idea";
        const stageProgress = progressData[currentStage as keyof ProgressData];
        const completedItems = stageProgress?.completedItems || [];

        // Load checklist items for the current stage
        const { data: checklistItems } = await supabase
            .from("stage_checklists")
            .select("item_key, label")
            .eq("stage", currentStage)
            .order("sort_order", { ascending: true });

        const allItemKeys = (checklistItems || []).map((c) => c.item_key);
        const remainingItems = allItemKeys.filter((k) => !completedItems.includes(k));
        const remainingLabels = (checklistItems || [])
            .filter((c) => !completedItems.includes(c.item_key))
            .map((c) => c.label);

        projectContext = {
            id: activeProject.id,
            title: activeProject.title,
            description: activeProject.description,
            stage: currentStage,
            completedItems,
            totalItems: allItemKeys.length,
            remainingItems: remainingLabels,
            artifacts: (activeProject.artifacts as Record<string, unknown>) || undefined,
        };
    }

    // 3c. RAG — search knowledge base for relevant context
    let ragContext: string | undefined;
    try {
        const knowledgeChunks = await searchKnowledge(message, 3);
        if (knowledgeChunks.length > 0) {
            ragContext = formatRAGContext(knowledgeChunks);
        }
    } catch (err) {
        console.error("[Chat] RAG search failed (continuing without context):", err);
    }

    // 4. Get or create conversation
    let conversationId = existingConversationId;

    if (!conversationId) {
        const { data: newConv, error: convError } = await supabase
            .from("conversations")
            .insert({
                user_id: user.id,
                context_type: contextType,
                title: message.slice(0, 80),
            })
            .select("id")
            .single();

        if (convError || !newConv) {
            console.error("[Chat] Failed to create conversation:", convError);
            return NextResponse.json(
                { error: "Failed to create conversation", details: convError?.message },
                { status: 500 }
            );
        }
        conversationId = newConv.id;
    }

    // 5. Load last 20 messages for context
    const { data: historyRows } = await supabase
        .from("messages")
        .select("role, content")
        .eq("conversation_id", conversationId)
        .order("created_at", { ascending: true })
        .limit(20);

    const history: GigaChatMessageInput[] = (historyRows ?? [])
        .filter((m) => m.content && m.content.trim() !== "")
        .map((m) => ({
            role: m.role as GigaChatMessageInput["role"],
            content: m.content,
        }));

    // 6. Save user message
    await supabase.from("messages").insert({
        conversation_id: conversationId,
        role: "user",
        content: message,
    });

    // 7. Run agent and stream response
    const startTime = Date.now();
    let fullAssistantText = "";
    let toolResults: unknown[] = [];

    try {
        const { textStream, toolResultsPromise } = await runAgentStreaming(
            message,
            history,
            contextType as StageContext,
            userRole,
            user.id,
            projectContext,
            ragContext
        );

        // Create SSE response stream
        const encoder = new TextEncoder();

        const responseStream = new ReadableStream({
            async start(controller) {
                // Stream conversation metadata first
                controller.enqueue(
                    encoder.encode(
                        `data: ${JSON.stringify({ type: "meta", conversationId })}\n\n`
                    )
                );

                // Stream text tokens
                const reader = textStream.getReader();
                while (true) {
                    const { done, value } = await reader.read();
                    if (done) break;
                    fullAssistantText += value;
                    controller.enqueue(
                        encoder.encode(
                            `data: ${JSON.stringify({ type: "token", content: value })}\n\n`
                        )
                    );
                }

                // Wait for tool results
                toolResults = await toolResultsPromise;
                if (toolResults.length > 0) {
                    controller.enqueue(
                        encoder.encode(
                            `data: ${JSON.stringify({ type: "tools", results: toolResults })}\n\n`
                        )
                    );
                }

                controller.enqueue(encoder.encode("data: [DONE]\n\n"));
                controller.close();

                // 8. Save assistant message (after stream completes)
                if (fullAssistantText.trim()) {
                    await supabase.from("messages").insert({
                        conversation_id: conversationId,
                        role: "assistant",
                        content: fullAssistantText,
                        metadata:
                            toolResults.length > 0 ? { tool_results: toolResults } : null,
                    });
                }

                // 9. Log AI call
                await logAICall({
                    userId: user.id,
                    conversationId: conversationId!,
                    model: "GigaChat",
                    latencyMs: Date.now() - startTime,
                    status: "success",
                });
            },
        });

        return new Response(responseStream, {
            headers: {
                "Content-Type": "text/event-stream",
                "Cache-Control": "no-cache",
                Connection: "keep-alive",
                "X-Conversation-Id": conversationId!,
            },
        });
    } catch (err) {
        const errorMessage = err instanceof Error ? err.message : "AI error";

        await logAICall({
            userId: user.id,
            conversationId: conversationId!,
            model: "GigaChat",
            latencyMs: Date.now() - startTime,
            status: "error",
            errorMessage,
        });

        return NextResponse.json({ error: errorMessage }, { status: 500 });
    }
}
