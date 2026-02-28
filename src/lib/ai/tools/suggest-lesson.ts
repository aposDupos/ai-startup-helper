/**
 * Agent Tool: suggest_lesson
 * Searches DB for a relevant lesson and returns a deep link.
 */

import { createClient } from "@/lib/supabase/server";

export interface SuggestLessonInput {
    stage: string;
    topic?: string;
}

export interface SuggestLessonResult {
    success: boolean;
    lessonId?: string;
    title?: string;
    url?: string;
    error?: string;
}

export async function executeSuggestLesson(
    input: SuggestLessonInput
): Promise<SuggestLessonResult> {
    try {
        const supabase = await createClient();

        // Try searching by topic first
        if (input.topic) {
            const { data: topicLesson } = await supabase
                .from("lessons")
                .select("id, title")
                .ilike("title", `%${input.topic}%`)
                .limit(1)
                .single();

            if (topicLesson) {
                return {
                    success: true,
                    lessonId: topicLesson.id,
                    title: topicLesson.title,
                    url: `/learning/${topicLesson.id}`,
                };
            }
        }

        // Fallback: search by stage
        const { data: stageLesson } = await supabase
            .from("lessons")
            .select("id, title")
            .eq("stage", input.stage)
            .order("sort_order")
            .limit(1)
            .single();

        if (stageLesson) {
            return {
                success: true,
                lessonId: stageLesson.id,
                title: stageLesson.title,
                url: `/learning/${stageLesson.id}`,
            };
        }

        // No lessons found at all — suggest learning page
        return {
            success: true,
            lessonId: undefined,
            title: "Все уроки",
            url: "/learning",
        };
    } catch (err) {
        console.error("[SuggestLessonTool] Error:", err);
        return {
            success: false,
            error: err instanceof Error ? err.message : "Unknown error",
        };
    }
}
