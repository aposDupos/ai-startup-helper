/**
 * Shared types for project stages, progress, and checklists.
 */

// ---------------------------------------------------------------------------
// Stage definitions
// ---------------------------------------------------------------------------

export type StageKey = "idea" | "validation" | "business_model" | "mvp" | "pitch";

export type StageStatus = "completed" | "in_progress" | "locked" | "needs_revision";

export interface StageDefinition {
    key: StageKey;
    label: string;
    emoji: string;
    description: string;
}

export const STAGES: StageDefinition[] = [
    { key: "idea", label: "Идея", emoji: "🏝️", description: "Поиск и формулирование идеи" },
    { key: "validation", label: "Проверка", emoji: "🔍", description: "CustDev и валидация гипотез" },
    { key: "business_model", label: "Бизнес-модель", emoji: "📊", description: "BMC, VPC, юнит-экономика" },
    { key: "mvp", label: "MVP", emoji: "🛠️", description: "Минимальный продукт и тестирование" },
    { key: "pitch", label: "Питч", emoji: "🎤", description: "Питч-дек и презентация" },
];

// ---------------------------------------------------------------------------
// Progress data (stored in projects.progress_data JSONB)
// ---------------------------------------------------------------------------

export interface StageProgress {
    status: StageStatus;
    completedItems: string[]; // item_key[]
    startedAt?: string;
    completedAt?: string;
}

export type ProgressData = Partial<Record<StageKey, StageProgress>>;

// ---------------------------------------------------------------------------
// Team members (stored in projects.team_members JSONB)
// ---------------------------------------------------------------------------

export type TeamRole = "hustler" | "hacker" | "hipster";

export interface TeamMember {
    id: string;
    name: string;
    role: TeamRole;
}

// ---------------------------------------------------------------------------
// Checklist item (from stage_checklists table)
// ---------------------------------------------------------------------------

export interface ChecklistItemData {
    id: string;
    stage: StageKey;
    item_key: string;
    label: string;
    description: string | null;
    linked_lesson_id: string | null;
    linked_tool: string | null;
    sort_order: number | null;
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

export function getStageIndex(key: StageKey): number {
    return STAGES.findIndex((s) => s.key === key);
}

export function getStageStatus(
    stageKey: StageKey,
    currentStage: StageKey,
    progressData: ProgressData
): StageStatus {
    const stageProgress = progressData[stageKey];

    // Explicit status from progress_data takes priority
    if (stageProgress?.status) {
        return stageProgress.status;
    }

    const stageIdx = getStageIndex(stageKey);
    const currentIdx = getStageIndex(currentStage);

    if (stageIdx < currentIdx) return "completed";
    if (stageIdx === currentIdx) return "in_progress";
    return "locked";
}

export function getNextStage(currentStage: StageKey): StageKey | null {
    const idx = getStageIndex(currentStage);
    if (idx < 0 || idx >= STAGES.length - 1) return null;
    return STAGES[idx + 1].key;
}
