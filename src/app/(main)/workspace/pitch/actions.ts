"use server";

import { createClient } from "@/lib/supabase/server";
import type { PitchDeckSlides, PitchSlideData } from "@/types/pitch";
import type { ProgressData } from "@/types/project";
import type { BMCData } from "@/types/workspace";
import { createGigaChatModelSync } from "@/lib/ai/config";
import { PITCH_SLIDES, createEmptySlides } from "@/types/pitch";
import { BMC_BLOCKS } from "@/types/workspace";

// ---------------------------------------------------------------------------
// Load or create pitch deck
// ---------------------------------------------------------------------------

export async function loadPitchDeck(projectId: string) {
    const supabase = await createClient();

    const { data: deck } = await supabase
        .from("pitch_decks")
        .select("*")
        .eq("project_id", projectId)
        .order("created_at", { ascending: false })
        .limit(1)
        .single();

    if (deck) {
        return {
            id: deck.id as string,
            slides: deck.slides as unknown as PitchDeckSlides,
            template: deck.template as string,
        };
    }

    // Create new deck
    const slides = createEmptySlides();
    const { data: newDeck, error } = await supabase
        .from("pitch_decks")
        .insert({
            project_id: projectId,
            slides: slides as unknown as Record<string, unknown>[],
        })
        .select("id")
        .single();

    if (error) throw error;

    return {
        id: newDeck.id as string,
        slides,
        template: "default",
    };
}

// ---------------------------------------------------------------------------
// Save pitch deck slides (autosave)
// ---------------------------------------------------------------------------

export async function savePitchDeck(
    deckId: string,
    projectId: string,
    slides: PitchDeckSlides
) {
    const supabase = await createClient();

    // Save slides
    const { error: updateErr } = await supabase
        .from("pitch_decks")
        .update({
            slides: slides as unknown as Record<string, unknown>[],
            updated_at: new Date().toISOString(),
        })
        .eq("id", deckId);

    if (updateErr) throw updateErr;

    // Update progress_data for pitch stage
    const filledSlides = slides.filter((s) => s.content.trim().length > 0).length;

    const { data: project } = await supabase
        .from("projects")
        .select("progress_data")
        .eq("id", projectId)
        .single();

    if (project) {
        const progressData: ProgressData =
            (project.progress_data as ProgressData) || {};

        const pitchProgress = progressData.pitch || {
            status: "in_progress" as const,
            completedItems: [],
        };

        if (filledSlides >= 10 && !pitchProgress.completedItems.includes("create_pitch_deck")) {
            pitchProgress.completedItems = [...pitchProgress.completedItems, "create_pitch_deck"];
        }

        progressData.pitch = pitchProgress;

        await supabase
            .from("projects")
            .update({
                progress_data: progressData as unknown as Record<string, unknown>,
                updated_at: new Date().toISOString(),
            })
            .eq("id", projectId);
    }

    return { filledSlides };
}

// ---------------------------------------------------------------------------
// Auto-fill slide from project data
// ---------------------------------------------------------------------------

export async function autoFillSlide(
    projectId: string,
    slideKey: string
) {
    const supabase = await createClient();

    const { data: project, error } = await supabase
        .from("projects")
        .select("title, description, bmc_data, unit_economics, team_members")
        .eq("id", projectId)
        .single();

    if (error || !project) return null;

    const slideDef = PITCH_SLIDES.find((s) => s.key === slideKey);
    if (!slideDef) return null;

    switch (slideDef.autoFillSource) {
        case "project":
            return {
                content: `# ${project.title}\n\n${project.description || "Описание проекта"}`,
                notes: "Добавьте имена участников команды и слоган проекта.",
            };

        case "bmc": {
            const bmcData = project.bmc_data as unknown as BMCData | null;
            if (!bmcData) return { content: "BMC ещё не заполнен. Заполните BMC в разделе Workspace.", notes: "" };

            const lines = BMC_BLOCKS
                .filter((b) => {
                    const notes = bmcData[b.key];
                    return notes && notes.length > 0;
                })
                .map((b) => {
                    const notes = bmcData[b.key];
                    return `### ${b.emoji} ${b.label}\n${notes.map((n) => `- ${n.text}`).join("\n")}`;
                });

            return {
                content: lines.length > 0
                    ? lines.join("\n\n")
                    : "BMC ещё не заполнен.",
                notes: "Данные подтянуты из вашего BMC. Отредактируйте при необходимости.",
            };
        }

        case "unit_economics": {
            const ue = project.unit_economics as Record<string, number | null> | null;
            if (!ue) return { content: "Юнит-экономика ещё не рассчитана.", notes: "" };

            const lines = [
                ue.cac != null ? `- **CAC:** ${ue.cac.toLocaleString("ru-RU")} ₽` : null,
                ue.ltv != null ? `- **LTV:** ${ue.ltv.toLocaleString("ru-RU")} ₽` : null,
                ue.arpu != null ? `- **ARPU:** ${ue.arpu.toLocaleString("ru-RU")} ₽/мес` : null,
                ue.churn != null ? `- **Churn:** ${ue.churn}%/мес` : null,
                ue.payback_period != null ? `- **Payback:** ${ue.payback_period} мес` : null,
            ].filter(Boolean);

            return {
                content: lines.length > 0 ? lines.join("\n") : "Заполните юнит-экономику в Workspace.",
                notes: "Данные подтянуты из калькулятора юнит-экономики.",
            };
        }

        case "team": {
            interface TeamMember { name: string; role: string }
            const members = (project.team_members as unknown as TeamMember[] | null) || [];
            if (members.length === 0) return { content: "Добавьте участников команды в профиле проекта.", notes: "" };

            const memberLines = members.map((m) =>
                `- **${m.name}** — ${m.role}`
            );
            return {
                content: `## Наша команда\n\n${memberLines.join("\n")}`,
                notes: "Расскажите о компетенциях каждого участника.",
            };
        }

        default:
            return null;
    }
}

// ---------------------------------------------------------------------------
// Generate slide content with AI
// ---------------------------------------------------------------------------

export async function generateSlideContent(
    projectId: string,
    slideKey: string,
    existingContent: string
) {
    const supabase = await createClient();

    const { data: project, error } = await supabase
        .from("projects")
        .select("title, description, bmc_data, stage")
        .eq("id", projectId)
        .single();

    if (error || !project) throw new Error("Проект не найден");

    const slideDef = PITCH_SLIDES.find((s) => s.key === slideKey);
    if (!slideDef) throw new Error("Слайд не найден");

    const prompt = `Ты — AI-наставник для молодых предпринимателей. Помоги подготовить питч-дек.

Проект: "${project.title}" — ${project.description || "описание не указано"}.
Стадия проекта: ${project.stage}.

Слайд ${slideDef.number}: "${slideDef.title}" — ${slideDef.description}.
${existingContent ? `Текущий контент слайда (нужно улучшить):\n${existingContent}` : "Слайд пока пустой."}

Напиши убедительный контент для этого слайда питч-дека. Используй форматирование Markdown.
Контент должен быть:
- Кратким (3-5 основных пунктов)
- Убедительным для инвестора
- С конкретными данными, где возможно
- На русском языке

Ответь ТОЛЬКО контентом слайда, без пояснений.`;

    try {
        const model = createGigaChatModelSync();
        const response = await model.invoke(prompt);
        const text =
            typeof response.content === "string"
                ? response.content
                : JSON.stringify(response.content);

        return { content: text.trim() };
    } catch {
        return {
            content: `## ${slideDef.title}\n\n- Пункт 1\n- Пункт 2\n- Пункт 3\n\n_Не удалось сгенерировать контент AI. Заполните вручную._`,
        };
    }
}
