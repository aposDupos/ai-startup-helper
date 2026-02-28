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

/** Standard multiple-choice quiz question (backward-compatible). */
export interface StandardQuizQuestion {
    type?: "standard"; // optional for backward compat
    question: string;
    options: string[];
    correct: number; // 0-based index
}

/** Contextual quiz question whose text uses template variables and
 *  can be either free-text or reflection-based. */
export interface ContextualQuizQuestion {
    type: "contextual_quiz";
    question_template: string;
    answer_source?: string; // e.g. "artifacts.problem"
    answer_type: "open" | "reflection";
}

export type QuizQuestion = StandardQuizQuestion | ContextualQuizQuestion;

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

export function isContextualQuiz(q: QuizQuestion): q is ContextualQuizQuestion {
    return q.type === "contextual_quiz";
}

export function isStandardQuiz(q: QuizQuestion): q is StandardQuizQuestion {
    return !q.type || q.type === "standard";
}

// ---------------------------------------------------------------------------
// Lesson row from DB
// ---------------------------------------------------------------------------

export interface Lesson {
    id: string;
    stage: StageKey;
    title: string;
    type: "micro" | "full";
    content: LessonContentBlock[];
    quiz: QuizQuestion[];
    duration_min: number;
    estimated_minutes: number;
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
