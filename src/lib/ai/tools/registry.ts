/**
 * Tool Registry — single source of truth for all AI tool definitions and executors.
 *
 * Adding a new tool:
 *   1. Create `src/lib/ai/tools/my-tool.ts` with definition + execute function
 *   2. Import and register it in the `TOOLS` array below
 *   3. Update the AI system prompt if needed
 */

import { logger } from "@/lib/logger";
import { saveIdeaToolDefinition, executeSaveIdea } from "./save-idea";
import { evaluateICEToolDefinition, executeEvaluateICE } from "./evaluate-ice";
import { createProjectToolDefinition, executeCreateProject } from "./create-project";
import { completeChecklistToolDefinition, executeCompleteChecklist } from "./complete-checklist";
import { reopenStageToolDefinition, executeReopenStage } from "./reopen-stage";
import { updateProjectArtifactsToolDefinition, executeUpdateProjectArtifacts } from "./update-project-artifacts";
import { suggestLessonToolDefinition, executeSuggestLesson } from "./suggest-lesson";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface ToolDefinition {
    name: string;
    description: string;
    parameters: Record<string, unknown>;
}

export interface ToolExecutionResult {
    toolName: string;
    result: unknown;
}

interface RegisteredTool {
    definition: ToolDefinition;
    execute: (args: Record<string, unknown>, userId: string) => Promise<unknown>;
}

// ---------------------------------------------------------------------------
// Tool registry
// ---------------------------------------------------------------------------

const TOOLS: RegisteredTool[] = [
    {
        definition: saveIdeaToolDefinition,
        execute: (args, userId) =>
            executeSaveIdea(
                { title: args.title as string, description: args.description as string },
                userId
            ),
    },
    {
        definition: evaluateICEToolDefinition,
        execute: (args) =>
            Promise.resolve(
                executeEvaluateICE({
                    impact: args.impact as number,
                    confidence: args.confidence as number,
                    ease: args.ease as number,
                    rationale: args.rationale as string,
                    idea_title: args.idea_title as string | undefined,
                })
            ),
    },
    {
        definition: createProjectToolDefinition,
        execute: (args, userId) =>
            executeCreateProject(
                {
                    title: args.title as string,
                    description: args.description as string,
                    stage: args.stage as "idea" | "validation" | "business_model" | "mvp" | "pitch",
                },
                userId
            ),
    },
    {
        definition: completeChecklistToolDefinition,
        execute: (args) =>
            executeCompleteChecklist({
                projectId: args.projectId as string,
                stage: args.stage as "idea" | "validation" | "business_model" | "mvp" | "pitch",
                itemKey: args.itemKey as string,
            }),
    },
    {
        definition: reopenStageToolDefinition,
        execute: (args) =>
            executeReopenStage({
                projectId: args.projectId as string,
                stage: args.stage as "idea" | "validation" | "business_model" | "mvp" | "pitch",
            }),
    },
    {
        definition: updateProjectArtifactsToolDefinition,
        execute: (args) =>
            executeUpdateProjectArtifacts({
                projectId: args.projectId as string,
                field: args.field as string,
                value: args.value as string,
            }),
    },
    {
        definition: suggestLessonToolDefinition,
        execute: (args) =>
            executeSuggestLesson({
                stage: args.stage as string,
                topic: args.topic as string | undefined,
            }),
    },
];

// ---------------------------------------------------------------------------
// Public API
// ---------------------------------------------------------------------------

/** All GigaChat function definitions — pass to model.bind({ tools: ... }) */
export const GIGACHAT_FUNCTIONS: ToolDefinition[] = TOOLS.map((t) => t.definition);

/** Execute a tool by name */
export async function executeTool(
    toolName: string,
    args: Record<string, unknown>,
    userId: string
): Promise<ToolExecutionResult> {
    const tool = TOOLS.find((t) => t.definition.name === toolName);

    if (!tool) {
        logger.warn("ToolRegistry", `Unknown tool: ${toolName}`);
        return { toolName, result: { error: `Unknown tool: ${toolName}` } };
    }

    try {
        const result = await tool.execute(args, userId);
        return { toolName, result };
    } catch (err) {
        logger.error("ToolRegistry", `Tool ${toolName} failed:`, err);
        return {
            toolName,
            result: { error: err instanceof Error ? err.message : "Tool error" },
        };
    }
}
