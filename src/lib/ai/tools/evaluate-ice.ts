/**
 * Agent Tool: evaluate_ice
 * Evaluates a startup idea using the ICE framework (Impact, Confidence, Ease).
 */

export interface EvaluateICEInput {
    impact: number;       // 1-10: потенциальное влияние на рынок
    confidence: number;   // 1-10: уверенность в выполнении
    ease: number;         // 1-10: лёгкость реализации
    rationale: string;    // Обоснование оценок
    idea_title?: string;  // Название идеи (опционально)
}

export interface ICEResult {
    impact: number;
    confidence: number;
    ease: number;
    ice_score: number;    // Среднее = (impact + confidence + ease) / 3
    rationale: string;
    recommendation: string;
    idea_title?: string;
}

export const evaluateICEToolDefinition = {
    name: "evaluate_ice",
    description:
        "Оценивает идею стартапа по ICE-фреймворку (Impact, Confidence, Ease). Вызывай когда нужно дать структурированную оценку идее.",
    parameters: {
        type: "object",
        properties: {
            impact: {
                type: "number",
                description: "Влияние: насколько велик потенциальный эффект для рынка/пользователей (1-10)",
            },
            confidence: {
                type: "number",
                description: "Уверенность: насколько вы уверены в оценке влияния и в том, что идея сработает (1-10)",
            },
            ease: {
                type: "number",
                description: "Простота: насколько легко реализовать (ресурсы, время, экспертиза) (1-10)",
            },
            rationale: {
                type: "string",
                description: "Обоснование выставленных оценок на русском языке",
            },
            idea_title: {
                type: "string",
                description: "Название идеи (необязательно)",
            },
        },
        required: ["impact", "confidence", "ease", "rationale"],
    },
} as const;

export function executeEvaluateICE(input: EvaluateICEInput): ICEResult {
    const { impact, confidence, ease, rationale, idea_title } = input;

    // Clamp values to 1-10
    const clamp = (n: number) => Math.min(10, Math.max(1, Math.round(n)));
    const i = clamp(impact);
    const c = clamp(confidence);
    const e = clamp(ease);

    const ice_score = Math.round(((i + c + e) / 3) * 10) / 10;

    let recommendation: string;
    if (ice_score >= 7) {
        recommendation = "🚀 Сильная идея — рекомендуется двигаться дальше к валидации";
    } else if (ice_score >= 5) {
        recommendation =
            "⚡ Перспективная идея с оговорками — стоит проработать слабые стороны";
    } else {
        recommendation =
            "🔍 Идея требует доработки — пересмотри или найди способы улучшить показатели";
    }

    return {
        impact: i,
        confidence: c,
        ease: e,
        ice_score,
        rationale,
        recommendation,
        idea_title,
    };
}
