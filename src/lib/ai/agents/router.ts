/**
 * Agent Router — uses langchain-gigachat SDK with native GigaChat function format.
 *
 * Uses the centralized tool registry for definitions and execution.
 */

import { HumanMessage, SystemMessage, AIMessage, ToolMessage } from "@langchain/core/messages";
import type { BaseMessage } from "@langchain/core/messages";
import { createGigaChatModel, createGigaChatModelSync } from "@/lib/ai/config";
import { buildSystemPrompt, type StageContext, type UserRole } from "@/lib/ai/prompts";
import { GIGACHAT_FUNCTIONS, executeTool } from "@/lib/ai/tools/registry";
import type { ToolExecutionResult } from "@/lib/ai/tools/registry";
import { logger } from "@/lib/logger";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export type { ToolExecutionResult };

export interface GigaChatMessageInput {
    role: "system" | "user" | "assistant";
    content: string;
}

// ---------------------------------------------------------------------------
// Follow-up after tool execution (deduplicated)
// ---------------------------------------------------------------------------

async function executeToolAndFollowUp(
    messages: BaseMessage[],
    toolResults: ToolExecutionResult[],
    controller: ReadableStreamDefaultController<string>
): Promise<void> {
    try {
        const followUpModel = createGigaChatModelSync();
        const followUpWithTools = followUpModel.bind({
            tools: GIGACHAT_FUNCTIONS,
        } as Record<string, unknown>);
        const followUp = await followUpWithTools.invoke(messages);
        const followUpText =
            typeof followUp.content === "string" ? followUp.content : "";
        if (followUpText) {
            controller.enqueue(followUpText);
        } else {
            controller.enqueue("Готово! Я выполнил действие. Чем ещё могу помочь?");
        }
    } catch (followUpErr) {
        logger.error("Agent", "Follow-up error:", followUpErr);
        controller.enqueue("Действие выполнено успешно! Продолжай, я слушаю.");
    }
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
    }

    return messages;
}

// ---------------------------------------------------------------------------
// Run agent with tool execution
// ---------------------------------------------------------------------------

export async function runAgentStreaming(
    userMessage: string,
    history: GigaChatMessageInput[],
    contextType: StageContext,
    userRole: UserRole,
    userId: string,
    projectContext?: import("@/lib/ai/prompts").ProjectContext | null,
    ragContext?: string
): Promise<{
    textStream: ReadableStream<string>;
    toolResultsPromise: Promise<ToolExecutionResult[]>;
}> {
    const systemPrompt = buildSystemPrompt(contextType, userRole, projectContext ?? null, ragContext);

    const messages = toLangChainMessages(systemPrompt, [
        ...history,
        { role: "user", content: userMessage },
    ]);

    const model = createGigaChatModel({ streaming: false });
    const modelWithTools = model.bind({
        tools: GIGACHAT_FUNCTIONS,
    } as Record<string, unknown>);

    const toolResults: ToolExecutionResult[] = [];
    let resolveToolResults!: (value: ToolExecutionResult[]) => void;
    const toolResultsPromise = new Promise<ToolExecutionResult[]>((resolve) => {
        resolveToolResults = resolve;
    });

    const textStream = new ReadableStream<string>({
        async start(controller) {
            try {
                const response = await modelWithTools.invoke(messages);

                logger.debug("Agent", "Response tool_calls:", JSON.stringify(response.tool_calls));

                const functionCall = response.additional_kwargs?.function_call as
                    | { name: string; arguments: string }
                    | undefined;
                const toolCalls = response.tool_calls;

                if (toolCalls && toolCalls.length > 0) {
                    // LangChain-style tool calls
                    const toolMessages: BaseMessage[] = [...messages, response];

                    for (const tc of toolCalls) {
                        const result = await executeTool(
                            tc.name,
                            tc.args as Record<string, unknown>,
                            userId
                        );
                        toolResults.push(result);
                        toolMessages.push(
                            new ToolMessage({
                                content: JSON.stringify(result.result),
                                tool_call_id: tc.id || tc.name,
                            })
                        );
                    }

                    await executeToolAndFollowUp(toolMessages, toolResults, controller);
                } else if (functionCall) {
                    // GigaChat native function_call format
                    let args: Record<string, unknown> = {};
                    try {
                        args = JSON.parse(functionCall.arguments);
                    } catch {
                        args = {};
                    }

                    const result = await executeTool(functionCall.name, args, userId);
                    toolResults.push(result);

                    const followUpMessages: BaseMessage[] = [
                        ...messages,
                        response,
                        new ToolMessage({
                            content: JSON.stringify(result.result),
                            tool_call_id: functionCall.name,
                        }),
                    ];

                    await executeToolAndFollowUp(followUpMessages, toolResults, controller);
                } else {
                    // No tool calls — just return text
                    const text =
                        typeof response.content === "string" ? response.content : "";
                    if (text) {
                        controller.enqueue(text);
                    }
                }
            } catch (err) {
                logger.error("Agent", "Error:", err);
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
