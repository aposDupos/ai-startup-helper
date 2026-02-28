/**
 * Agent Router — uses langchain-gigachat SDK with native GigaChat function format.
 *
 * We bypass LangChain's broken Zod-to-JSONSchema conversion for GigaChat
 * and pass function definitions in raw GigaChat format directly.
 */

import { HumanMessage, SystemMessage, AIMessage, ToolMessage } from "@langchain/core/messages";
import type { BaseMessage } from "@langchain/core/messages";
import { createGigaChatModel, createGigaChatModelSync } from "@/lib/ai/config";
import { buildSystemPrompt, type StageContext, type UserRole } from "@/lib/ai/prompts";
import { executeSaveIdea } from "@/lib/ai/tools/save-idea";
import { executeEvaluateICE } from "@/lib/ai/tools/evaluate-ice";
import { executeCreateProject } from "@/lib/ai/tools/create-project";
import { executeCompleteChecklist } from "@/lib/ai/tools/complete-checklist";
import { executeReopenStage } from "@/lib/ai/tools/reopen-stage";
import type { StageKey } from "@/types/project";

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
// Native GigaChat function definitions (bypassing broken Zod conversion)
// ---------------------------------------------------------------------------

const GIGACHAT_FUNCTIONS = [
    {
        name: "save_idea",
        description:
            "Сохраняет идею стартапа в базу данных. Используй когда пользователь сформулировал идею и нужно её зафиксировать.",
        parameters: {
            type: "object",
            properties: {
                title: {
                    type: "string",
                    description: "Краткое название идеи (до 100 символов)",
                },
                description: {
                    type: "string",
                    description: "Описание идеи: проблема, решение, аудитория",
                },
            },
            required: ["title", "description"],
        },
    },
    {
        name: "evaluate_ice",
        description:
            "Оценивает идею по ICE-фреймворку (Impact, Confidence, Ease). Используй для объективной оценки.",
        parameters: {
            type: "object",
            properties: {
                impact: {
                    type: "number",
                    description: "Impact — потенциальное влияние (1-10)",
                },
                confidence: {
                    type: "number",
                    description: "Confidence — уверенность в успехе (1-10)",
                },
                ease: {
                    type: "number",
                    description: "Ease — лёгкость реализации (1-10)",
                },
                rationale: {
                    type: "string",
                    description: "Обоснование оценки",
                },
                idea_title: {
                    type: "string",
                    description: "Название идеи (опционально)",
                },
            },
            required: ["impact", "confidence", "ease", "rationale"],
        },
    },
    {
        name: "create_project_with_stage",
        description:
            "Создаёт новый стартап-проект с определённой стадией. Используй когда пользователь описал идею/проект и нужно создать проект.",
        parameters: {
            type: "object",
            properties: {
                title: {
                    type: "string",
                    description: "Краткое название проекта (до 100 символов)",
                },
                description: {
                    type: "string",
                    description: "Описание проекта",
                },
                stage: {
                    type: "string",
                    enum: ["idea", "validation", "business_model", "mvp", "pitch"],
                    description: "Стадия проекта",
                },
            },
            required: ["title", "description", "stage"],
        },
    },
    {
        name: "complete_checklist_item",
        description:
            "Отмечает пункт чеклиста как выполненный. Используй когда помог пользователю завершить шаг.",
        parameters: {
            type: "object",
            properties: {
                projectId: {
                    type: "string",
                    description: "UUID проекта",
                },
                stage: {
                    type: "string",
                    enum: ["idea", "validation", "business_model", "mvp", "pitch"],
                    description: "Стадия",
                },
                itemKey: {
                    type: "string",
                    description: "Ключ пункта чеклиста",
                },
            },
            required: ["projectId", "stage", "itemKey"],
        },
    },
    {
        name: "reopen_stage",
        description: "Переоткрывает стадию для доработки.",
        parameters: {
            type: "object",
            properties: {
                projectId: {
                    type: "string",
                    description: "UUID проекта",
                },
                stage: {
                    type: "string",
                    enum: ["idea", "validation", "business_model", "mvp", "pitch"],
                    description: "Стадия для переоткрытия",
                },
            },
            required: ["projectId", "stage"],
        },
    },
];

// ---------------------------------------------------------------------------
// Tool executor
// ---------------------------------------------------------------------------

async function executeTool(
    toolName: string,
    args: Record<string, unknown>,
    userId: string
): Promise<ToolExecutionResult> {
    try {
        switch (toolName) {
            case "save_idea": {
                const result = await executeSaveIdea(
                    {
                        title: args.title as string,
                        description: args.description as string,
                    },
                    userId
                );
                return { toolName, result };
            }
            case "evaluate_ice": {
                const result = executeEvaluateICE({
                    impact: args.impact as number,
                    confidence: args.confidence as number,
                    ease: args.ease as number,
                    rationale: args.rationale as string,
                    idea_title: args.idea_title as string | undefined,
                });
                return { toolName, result };
            }
            case "create_project_with_stage": {
                const result = await executeCreateProject(
                    {
                        title: args.title as string,
                        description: args.description as string,
                        stage: args.stage as StageKey,
                    },
                    userId
                );
                return { toolName, result };
            }
            case "complete_checklist_item": {
                const result = await executeCompleteChecklist({
                    projectId: args.projectId as string,
                    stage: args.stage as StageKey,
                    itemKey: args.itemKey as string,
                });
                return { toolName, result };
            }
            case "reopen_stage": {
                const result = await executeReopenStage({
                    projectId: args.projectId as string,
                    stage: args.stage as StageKey,
                });
                return { toolName, result };
            }
            default:
                return { toolName, result: { error: `Unknown tool: ${toolName}` } };
        }
    } catch (err) {
        console.error(`[Tool:${toolName}] Error:`, err);
        return {
            toolName,
            result: { error: err instanceof Error ? err.message : "Tool error" },
        };
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
    projectContext?: import("@/lib/ai/prompts").ProjectContext | null
): Promise<{
    textStream: ReadableStream<string>;
    toolResultsPromise: Promise<ToolExecutionResult[]>;
}> {
    const systemPrompt = buildSystemPrompt(contextType, userRole, projectContext ?? null);

    const messages = toLangChainMessages(systemPrompt, [
        ...history,
        { role: "user", content: userMessage },
    ]);

    // Pass functions via call options in native GigaChat format
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
                // First call — may return text, tool_calls, or both
                const response = await modelWithTools.invoke(messages);

                console.log("[Agent] Response tool_calls:", JSON.stringify(response.tool_calls));
                console.log("[Agent] Response additional_kwargs:", JSON.stringify(response.additional_kwargs));

                // Check for tool calls (GigaChat uses function_call in additional_kwargs)
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

                    // Follow-up call to get final response (with tools still bound)
                    try {
                        const followUpModel = createGigaChatModelSync();
                        const followUpWithTools = followUpModel.bind({
                            tools: GIGACHAT_FUNCTIONS,
                        } as Record<string, unknown>);
                        const followUp = await followUpWithTools.invoke(toolMessages);
                        const followUpText =
                            typeof followUp.content === "string" ? followUp.content : "";
                        if (followUpText) {
                            controller.enqueue(followUpText);
                        } else {
                            // If no text came back, give a default success message
                            controller.enqueue("Готово! Я выполнил действие. Чем ещё могу помочь?");
                        }
                    } catch (followUpErr) {
                        console.error("[Agent] Follow-up error:", followUpErr);
                        controller.enqueue("Действие выполнено успешно! Продолжай, я слушаю.");
                    }
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

                    // Follow-up to get text response after tool
                    const followUpMessages: BaseMessage[] = [
                        ...messages,
                        response,
                        new ToolMessage({
                            content: JSON.stringify(result.result),
                            tool_call_id: functionCall.name,
                        }),
                    ];

                    try {
                        const followUpModel = createGigaChatModelSync();
                        const followUpWithTools = followUpModel.bind({
                            tools: GIGACHAT_FUNCTIONS,
                        } as Record<string, unknown>);
                        const followUp = await followUpWithTools.invoke(followUpMessages);
                        const followUpText =
                            typeof followUp.content === "string" ? followUp.content : "";
                        if (followUpText) {
                            controller.enqueue(followUpText);
                        } else {
                            controller.enqueue("Готово! Я выполнил действие. Чем ещё могу помочь?");
                        }
                    } catch (followUpErr) {
                        console.error("[Agent] Follow-up error:", followUpErr);
                        controller.enqueue("Действие выполнено успешно! Продолжай, я слушаю.");
                    }
                } else {
                    // No tool calls — just return text
                    const text =
                        typeof response.content === "string" ? response.content : "";
                    if (text) {
                        controller.enqueue(text);
                    }
                }
            } catch (err) {
                console.error("[Agent] Error:", err);
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
