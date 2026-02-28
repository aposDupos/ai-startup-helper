"use server";

import { createClient } from "@/lib/supabase/server";
import type { PitchDeckSlides, TrainingRound, TrainingResults, TrainingCriterion } from "@/types/pitch";
import { TRAINING_CRITERIA } from "@/types/pitch";
import { createGigaChatModelSync } from "@/lib/ai/config";
import { gamificationAction } from "@/lib/gamification/check-after-action";

// ---------------------------------------------------------------------------
// Start training — first investor question
// ---------------------------------------------------------------------------

export async function startTraining(projectId: string) {
    const supabase = await createClient();

    const { data: deck } = await supabase
        .from("pitch_decks")
        .select("slides")
        .eq("project_id", projectId)
        .order("created_at", { ascending: false })
        .limit(1)
        .single();

    const slides = (deck?.slides as unknown as PitchDeckSlides) || [];
    const pitchSummary = slides
        .filter((s) => s.content.trim())
        .map((s) => `${s.title}: ${s.content.substring(0, 200)}`)
        .join("\n");

    const prompt = `Ты — опытный российский венчурный инвестор. Ты проводишь предварительную встречу с командой стартапа.

Вот краткое содержание их питч-дека:
${pitchSummary || "Питч-дек ещё не заполнен. Задай общий вопрос о проекте."}

Задай свой ПЕРВЫЙ вопрос. Будь прямым и конкретным, как настоящий инвестор.
Ответь ТОЛЬКО вопросом, без пояснений. 1-2 предложения максимум.`;

    try {
        const model = createGigaChatModelSync();
        const response = await model.invoke(prompt);
        const text =
            typeof response.content === "string"
                ? response.content
                : JSON.stringify(response.content);
        return { question: text.trim() };
    } catch {
        return { question: "Расскажите, какую проблему решает ваш продукт и почему именно сейчас?" };
    }
}

// ---------------------------------------------------------------------------
// Send answer - get follow-up question
// ---------------------------------------------------------------------------

export async function sendAnswer(
    projectId: string,
    rounds: TrainingRound[],
    currentAnswer: string
) {
    const supabase = await createClient();

    const { data: project } = await supabase
        .from("projects")
        .select("title, description")
        .eq("id", projectId)
        .single();

    const history = rounds
        .map((r) => `Инвестор: ${r.question}\nОснователь: ${r.answer}`)
        .join("\n\n");

    const prompt = `Ты — опытный российский венчурный инвестор. Проводишь встречу со стартапом "${project?.title || ""}".

Диалог до сих пор:
${history}

Инвестор: ${rounds[rounds.length - 1]?.question || "Расскажите о проекте"}
Основатель: ${currentAnswer}

${rounds.length >= 7 ? "Это последний раунд. Задай финальный вопрос или скажи 'Спасибо, достаточно'." : "Задай следующий вопрос. Углубляйся в слабые места ответов."} 

Ответь ТОЛЬКО вопросом, без пояснений. 1-2 предложения максимум.`;

    try {
        const model = createGigaChatModelSync();
        const response = await model.invoke(prompt);
        const text =
            typeof response.content === "string"
                ? response.content
                : JSON.stringify(response.content);
        return { question: text.trim(), shouldEnd: rounds.length >= 8 };
    } catch {
        return {
            question: "Как вы планируете привлечь первых 100 клиентов?",
            shouldEnd: rounds.length >= 8,
        };
    }
}

// ---------------------------------------------------------------------------
// Generate feedback after all rounds
// ---------------------------------------------------------------------------

export async function generateFeedback(
    projectId: string,
    rounds: TrainingRound[]
) {
    const supabase = await createClient();

    // Get user for gamification
    const { data: { user } } = await supabase.auth.getUser();

    const { data: project } = await supabase
        .from("projects")
        .select("title")
        .eq("id", projectId)
        .single();

    const history = rounds
        .map((r, i) => `Вопрос ${i + 1}: ${r.question}\nОтвет: ${r.answer}`)
        .join("\n\n");

    const criteriaList = TRAINING_CRITERIA.map((c) => c.label).join(", ");

    const prompt = `Ты — опытный венчурный инвестор. Ты провёл тренировочную сессию со стартапом "${project?.title || ""}".

Вот весь диалог:
${history}

Дай развёрнутый фидбэк в формате JSON:
{
  "criteria": [
    ${TRAINING_CRITERIA.map(
        (c) => `{"key": "${c.key}", "label": "${c.label}", "score": <число 1-10>, "comment": "<1 предложение>"}`
    ).join(",\n    ")}
  ],
  "strengths": ["сильная сторона 1", "сильная сторона 2"],
  "improvements": ["что улучшить 1", "что улучшить 2", "что улучшить 3"]
}

Ответь СТРОГО JSON, без пояснений.`;

    try {
        const model = createGigaChatModelSync();
        const response = await model.invoke(prompt);
        const text =
            typeof response.content === "string"
                ? response.content
                : JSON.stringify(response.content);

        const jsonMatch = text.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
            const parsed = JSON.parse(jsonMatch[0]) as {
                criteria: TrainingCriterion[];
                strengths: string[];
                improvements: string[];
            };

            const results: TrainingResults = {
                rounds,
                criteria: parsed.criteria,
                strengths: parsed.strengths,
                improvements: parsed.improvements,
                completedAt: new Date().toISOString(),
            };

            // Save to pitch_decks
            const { data: deck } = await supabase
                .from("pitch_decks")
                .select("id")
                .eq("project_id", projectId)
                .order("created_at", { ascending: false })
                .limit(1)
                .single();

            if (deck) {
                await supabase
                    .from("pitch_decks")
                    .update({
                        training_results: results as unknown as Record<string, unknown>,
                        updated_at: new Date().toISOString(),
                    })
                    .eq("id", deck.id);
            }

            // Award XP for pitch training session
            if (user) {
                await gamificationAction(
                    user.id, 30, "pitch_training", projectId, "Pitch training completed"
                );
            }

            return results;
        }

        throw new Error("Failed to parse feedback");
    } catch {
        // Fallback
        return {
            rounds,
            criteria: TRAINING_CRITERIA.map((c) => ({
                key: c.key,
                label: c.label,
                score: 5,
                comment: "Не удалось получить оценку AI",
            })),
            strengths: ["Вы дошли до конца тренировки!"],
            improvements: ["Попробуйте ещё раз для более точной оценки"],
            completedAt: new Date().toISOString(),
        } as TrainingResults;
    }
}
