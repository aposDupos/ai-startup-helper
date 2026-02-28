/**
 * Lesson content personalization — replaces template variables
 * like {{project.title}} with real project data.
 */

export interface ProjectPersonalizationContext {
    title?: string;
    problem?: string;
    target_audience?: string;
    idea?: string;
}

const FALLBACKS: Record<string, string> = {
    "project.title": "твой проект",
    "project.problem": "твоя проблема",
    "project.target_audience": "твоя целевая аудитория",
    "project.idea": "твоя идея",
};

/**
 * Replace `{{project.xxx}}` placeholders with real data from the project.
 * If a variable is not available, a generic fallback is used.
 */
export function personalizeContent(
    text: string,
    context: ProjectPersonalizationContext | null | undefined
): string {
    return text.replace(/\{\{(project\.\w+)\}\}/g, (_match, key: string) => {
        if (context) {
            const field = key.replace("project.", "") as keyof ProjectPersonalizationContext;
            if (context[field]) {
                return context[field]!;
            }
        }
        return FALLBACKS[key] ?? key;
    });
}
