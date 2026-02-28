/**
 * Types for the Learning module — lessons and quizzes.
 */

import type { StageKey } from "./project";

// ---------------------------------------------------------------------------
// Lesson content blocks (stored in lessons.content JSONB)
// ---------------------------------------------------------------------------

export type LessonContentBlock =
    | { type: "heading"; text: string }
    | { type: "paragraph"; text: string }
    | { type: "callout"; variant: "tip" | "warning" | "info"; text: string };

// ---------------------------------------------------------------------------
// Quiz (stored in lessons.quiz JSONB)
// ---------------------------------------------------------------------------

export interface QuizQuestion {
    question: string;
    options: string[];
    correct: number; // 0-based index
}

// ---------------------------------------------------------------------------
// Lesson row from DB
// ---------------------------------------------------------------------------

export interface Lesson {
    id: string;
    stage: StageKey;
    title: string;
    content: LessonContentBlock[];
    quiz: QuizQuestion[];
    duration_min: number;
    audience: "all" | "school" | "university";
    sort_order: number;
    created_at: string;
}

// ---------------------------------------------------------------------------
// User lesson progress row from DB
// ---------------------------------------------------------------------------

export interface UserLessonProgress {
    user_id: string;
    lesson_id: string;
    status: "not_started" | "in_progress" | "completed";
    score: number | null;
    completed_at: string | null;
}
