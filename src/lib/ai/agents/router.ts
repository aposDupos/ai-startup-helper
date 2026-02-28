/**
 * Agent Router — uses langchain-gigachat SDK for streaming and tool calling.
 */

import { HumanMessage, SystemMessage, AIMessage } from "@langchain/core/messages";
import type { BaseMessage } from "@langchain/core/messages";
import { createGigaChatModel } from "@/lib/ai/config";
import { buildSystemPrompt, type StageContext, type UserRole } from "@/lib/ai/prompts";
import { saveIdeaToolDefinition, executeSaveIdea } from "@/lib/ai/tools/save-idea";
import {
    evaluateICEToolDefinition,
    executeEvaluateICE,
} from "@/lib/ai/tools/evaluate-ice";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface ToolExecutionResult {
    toolName: string;
    result: unknown;
}

export interface GigaChatMessageInput {
    role: "system" | "user" | "assistant";
    content: string;
}

// ---------------------------------------------------------------------------
// Convert plain messages to LangChain BaseMessage[]
// ---------------------------------------------------------------------------

function toLangChainMessages(
    systemPrompt: string,
    history: GigaChatMessageInput[]
): BaseMessage[] {
    const messages: BaseMessage[] = [new SystemMessage(systemPrompt)];

    for (const msg of history) {
        if (msg.role === "user") {
            messages.push(new HumanMessage(msg.content));
        } else if (msg.role === "assistant") {
            messages.push(new AIMessage(msg.content));
        }
        // skip system — already added above
    }

    return messages;
}

// ---------------------------------------------------------------------------
// Tool execution
// ---------------------------------------------------------------------------

async function executeTool(
    toolName: string,
    args: Record<string, unknown>,
    userId: string
): Promise<ToolExecutionResult> {
    switch (toolName) {
        case "save_idea": {
            const result = await executeSaveIdea(
                args as { title: string; description: string },
                userId
            );
            return { toolName: "save_idea", result };
        }
        case "evaluate_ice": {
            const result = executeEvaluateICE(
                args as {
                    impact: number;
                    confidence: number;
                    ease: number;
                    rationale: string;
                    idea_title?: string;
                }
            );
            return { toolName: "evaluate_ice", result };
        }
        default:
            return { toolName, result: { error: `Unknown tool: ${toolName}` } };
    }
}

// ---------------------------------------------------------------------------
// Run agent with streaming
// ---------------------------------------------------------------------------

export async function runAgentStreaming(
    userMessage: string,
    history: GigaChatMessageInput[],
    contextType: StageContext,
    userRole: UserRole,
    userId: string
): Promise<{
    textStream: ReadableStream<string>;
    toolResultsPromise: Promise<ToolExecutionResult[]>;
}> {
    const systemPrompt = buildSystemPrompt(contextType, userRole);

    const messages = toLangChainMessages(systemPrompt, [
        ...history,
        { role: "user", content: userMessage },
    ]);

    const model = createGigaChatModel({ streaming: true });

    const toolResults: ToolExecutionResult[] = [];
    let resolveToolResults!: (value: ToolExecutionResult[]) => void;
    const toolResultsPromise = new Promise<ToolExecutionResult[]>((resolve) => {
        resolveToolResults = resolve;
    });

    const textStream = new ReadableStream<string>({
        async start(controller) {
            try {
                const stream = await model.stream(messages);

                let fullContent = "";

                for await (const chunk of stream) {
                    const content = chunk.content;
                    if (typeof content === "string" && content) {
                        fullContent += content;
                        controller.enqueue(content);
                    }

                    // Check for tool calls in the chunk
                    if (chunk.tool_calls && chunk.tool_calls.length > 0) {
                        for (const toolCall of chunk.tool_calls) {
                            if (toolCall.name && toolCall.args) {
                                const result = await executeTool(
                                    toolCall.name,
                                    toolCall.args as Record<string, unknown>,
                                    userId
                                );
                                toolResults.push(result);
                            }
                        }
                    }
                }
            } catch (err) {
                console.error("[Agent] Streaming error:", err);
                controller.enqueue(
                    "\n\nИзвини, произошла ошибка при обработке запроса. Попробуй ещё раз."
                );
            } finally {
                controller.close();
                resolveToolResults(toolResults);
            }
        },
    });

    return { textStream, toolResultsPromise };
}

export { saveIdeaToolDefinition, evaluateICEToolDefinition };
