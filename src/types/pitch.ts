/**
 * Types for Pitch Deck wizard and trainer.
 */

// ---------------------------------------------------------------------------
// Slide definitions
// ---------------------------------------------------------------------------

export interface PitchSlideDefinition {
    number: number;
    key: string;
    title: string;
    emoji: string;
    description: string;
    autoFillSource?: "bmc" | "unit_economics" | "team" | "project";
}

export const PITCH_SLIDES: PitchSlideDefinition[] = [
    { number: 1, key: "cover", title: "Обложка", emoji: "🎬", description: "Название проекта и команда", autoFillSource: "project" },
    { number: 2, key: "problem", title: "Проблема", emoji: "🔥", description: "Какую проблему вы решаете?" },
    { number: 3, key: "solution", title: "Решение", emoji: "💡", description: "Как вы решаете проблему?" },
    { number: 4, key: "market", title: "Рынок", emoji: "🌍", description: "TAM, SAM, SOM — размер рынка" },
    { number: 5, key: "product", title: "Продукт", emoji: "📱", description: "Описание MVP / продукта" },
    { number: 6, key: "business_model", title: "Бизнес-модель", emoji: "💰", description: "Из BMC: как зарабатываете?", autoFillSource: "bmc" },
    { number: 7, key: "competitors", title: "Конкуренты", emoji: "⚔️", description: "Сравнительный анализ" },
    { number: 8, key: "unit_economics", title: "Юнит-экономика", emoji: "📊", description: "CAC, LTV, Payback Period", autoFillSource: "unit_economics" },
    { number: 9, key: "team", title: "Команда", emoji: "👥", description: "Кто стоит за проектом?", autoFillSource: "team" },
    { number: 10, key: "roadmap", title: "Roadmap", emoji: "🗺️", description: "План и запрос к инвестору" },
];

// ---------------------------------------------------------------------------
// Slide data (stored in pitch_decks.slides JSONB)
// ---------------------------------------------------------------------------

export interface PitchSlideData {
    slideKey: string;
    title: string;
    content: string;
    notes: string;
}

export type PitchDeckSlides = PitchSlideData[];

export function createEmptySlides(): PitchDeckSlides {
    return PITCH_SLIDES.map((s) => ({
        slideKey: s.key,
        title: s.title,
        content: "",
        notes: "",
    }));
}

// ---------------------------------------------------------------------------
// Training results (stored in pitch_decks.training_results JSONB)
// ---------------------------------------------------------------------------

export interface TrainingRound {
    question: string;
    answer: string;
}

export interface TrainingCriterion {
    key: string;
    label: string;
    score: number; // 1-10
    comment: string;
}

export const TRAINING_CRITERIA: { key: string; label: string; emoji: string }[] = [
    { key: "clarity", label: "Ясность", emoji: "🔍" },
    { key: "persuasion", label: "Убедительность", emoji: "💪" },
    { key: "data", label: "Подкреплённость данными", emoji: "📊" },
    { key: "energy", label: "Энергия", emoji: "⚡" },
    { key: "readiness", label: "Готовность", emoji: "🎯" },
];

export interface TrainingResults {
    rounds: TrainingRound[];
    criteria: TrainingCriterion[];
    strengths: string[];
    improvements: string[];
    completedAt: string;
}
