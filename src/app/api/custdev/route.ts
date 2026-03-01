import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createGigaChatModel } from "@/lib/ai/config";
import {
    buildCustDevSystemPrompt,
    buildFeedbackPrompt,
    type CustDevPersona,
    type ProjectArtifacts,
} from "@/lib/ai/prompts/custdev-simulator";
import { HumanMessage, SystemMessage, AIMessage } from "@langchain/core/messages";
import { awardXP } from "@/lib/gamification/xp";

export const runtime = "nodejs";
export const maxDuration = 60;

interface CustDevRequestBody {
    message: string;
    persona: CustDevPersona;
    history: { role: "user" | "assistant"; content: string }[];
    projectId: string;
    endSession?: boolean;
}

export async function POST(req: Request) {
    const supabase = await createClient();
    const {
        data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body: CustDevRequestBody = await req.json();
    const { message, persona, history, projectId, endSession } = body;

    // Load project artifacts
    const { data: project } = await supabase
        .from("projects")
        .select("artifacts, title")
        .eq("id", projectId)
        .eq("owner_id", user.id)
        .single();

    if (!project) {
        return NextResponse.json({ error: "Project not found" }, { status: 404 });
    }

    const artifacts: ProjectArtifacts =
        (project.artifacts as ProjectArtifacts) || {};

    // Build message history
    const langchainMessages = history.map((m) =>
        m.role === "user"
            ? new HumanMessage(m.content)
            : new AIMessage(m.content)
    );

    // If ending session — generate feedback
    if (endSession) {
        const feedbackModel = createGigaChatModel({
            streaming: false,
            temperature: 0.3,
            maxTokens: 2048,
        });

        const feedbackPrompt = buildFeedbackPrompt(
            history.map((m) => ({ role: m.role, content: m.content }))
        );

        const feedbackResult = await feedbackModel.invoke([
            new SystemMessage(feedbackPrompt),
            new HumanMessage("Проанализируй интервью и дай фидбэк."),
        ]);

        // Award XP for completing session
        const xpResult = await awardXP(
            user.id,
            30,
            "custdev_session",
            projectId,
            "CustDev simulator session completed"
        );

        return NextResponse.json({
            feedback: typeof feedbackResult.content === "string"
                ? feedbackResult.content
                : String(feedbackResult.content),
            xp: {
                gained: 30,
                newXP: xpResult.newXP,
                leveledUp: xpResult.leveledUp,
                newLevel: xpResult.newLevel,
            },
        });
    }

    // Regular interview message — stream response
    const systemPrompt = buildCustDevSystemPrompt(persona, artifacts);
    const model = createGigaChatModel({
        streaming: true,
        temperature: 0.8,
        maxTokens: 512,
    });

    const allMessages = [
        new SystemMessage(systemPrompt),
        ...langchainMessages,
        new HumanMessage(message),
    ];

    const stream = new ReadableStream({
        async start(controller) {
            try {
                const response = await model.stream(allMessages);

                for await (const chunk of response) {
                    const content =
                        typeof chunk.content === "string"
                            ? chunk.content
                            : String(chunk.content);
                    if (content) {
                        const data = JSON.stringify({ type: "token", content });
                        controller.enqueue(
                            new TextEncoder().encode(`data: ${data}\n\n`)
                        );
                    }
                }

                controller.enqueue(
                    new TextEncoder().encode("data: [DONE]\n\n")
                );
            } catch (err) {
                console.error("[CustDev] Stream error:", err);
                const errorData = JSON.stringify({
                    type: "error",
                    content: "Произошла ошибка. Попробуй ещё раз.",
                });
                controller.enqueue(
                    new TextEncoder().encode(`data: ${errorData}\n\n`)
                );
            } finally {
                controller.close();
            }
        },
    });

    return new Response(stream, {
        headers: {
            "Content-Type": "text/event-stream",
            "Cache-Control": "no-cache",
            Connection: "keep-alive",
        },
    });
}
