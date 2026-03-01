

import { createClient } from "@/lib/supabase/server";
import type { ProgressData, StageKey } from "@/types/project";

// ---------------------------------------------------------------------------
// Scorecard criteria definitions
// ---------------------------------------------------------------------------

export interface ScorecardCriteria {
    key: string;
    label: string;
    labelShort: string;
    score: number; // 0-100
}

export interface ScorecardResult {
    criteria: ScorecardCriteria[];
    total: number; // weighted average 0-100
}

const CRITERIA_WEIGHTS: Record<string, number> = {
    problem_clarity: 1.2,
    target_audience: 1.2,
    idea_validation: 1.0,
    market_size: 0.8,
    custdev: 1.3,
    bmc: 1.0,
    vpc: 0.8,
    unit_economics: 0.9,
    mvp_definition: 1.0,
    pitch: 0.8,
};

// ---------------------------------------------------------------------------
// Compute scorecard from project data
// ---------------------------------------------------------------------------

export function computeScorecard(
    artifacts: Record<string, unknown>,
    progressData: ProgressData,
    bmcData?: unknown,
    vpcData?: unknown
): ScorecardResult {
    const criteria: ScorecardCriteria[] = [
        {
            key: "problem_clarity",
            label: "Ясность проблемы",
            labelShort: "Проблема",
            score: scoreProblemClarity(artifacts),
        },
        {
            key: "target_audience",
            label: "Целевая аудитория",
            labelShort: "ЦА",
            score: scoreTargetAudience(artifacts),
        },
        {
            key: "idea_validation",
            label: "Валидация идеи",
            labelShort: "Валидация",
            score: scoreIdeaValidation(artifacts, progressData),
        },
        {
            key: "market_size",
            label: "Размер рынка",
            labelShort: "Рынок",
            score: scoreMarketSize(artifacts),
        },
        {
            key: "custdev",
            label: "CustDev",
            labelShort: "CustDev",
            score: scoreCustDev(artifacts, progressData),
        },
        {
            key: "bmc",
            label: "Business Model Canvas",
            labelShort: "BMC",
            score: scoreBMC(bmcData),
        },
        {
            key: "vpc",
            label: "Value Proposition Canvas",
            labelShort: "VPC",
            score: scoreVPC(vpcData),
        },
        {
            key: "unit_economics",
            label: "Юнит-экономика",
            labelShort: "Юниты",
            score: scoreUnitEconomics(artifacts, progressData),
        },
        {
            key: "mvp_definition",
            label: "Определение MVP",
            labelShort: "MVP",
            score: scoreMVP(artifacts, progressData),
        },
        {
            key: "pitch",
            label: "Питч",
            labelShort: "Питч",
            score: scorePitch(artifacts, progressData),
        },
    ];

    // Weighted average
    let weightedSum = 0;
    let totalWeight = 0;
    for (const c of criteria) {
        const w = CRITERIA_WEIGHTS[c.key] || 1;
        weightedSum += c.score * w;
        totalWeight += w;
    }
    const total = totalWeight > 0 ? Math.round(weightedSum / totalWeight) : 0;

    return { criteria, total };
}

// ---------------------------------------------------------------------------
// Individual scoring functions
// ---------------------------------------------------------------------------

function hasArtifact(artifacts: Record<string, unknown>, key: string): boolean {
    const val = artifacts[key];
    if (!val) return false;
    if (typeof val === "string") return val.trim().length > 0;
    if (Array.isArray(val)) return val.length > 0;
    return true;
}

function stageCompleted(progressData: ProgressData, stage: StageKey): boolean {
    return progressData[stage]?.status === "completed";
}

function stageItemCount(progressData: ProgressData, stage: StageKey): number {
    return progressData[stage]?.completedItems?.length || 0;
}

function scoreProblemClarity(artifacts: Record<string, unknown>): number {
    let score = 0;
    if (hasArtifact(artifacts, "problem")) score += 50;
    if (hasArtifact(artifacts, "idea_formulation")) score += 30;
    if (hasArtifact(artifacts, "unique_value")) score += 20;
    return Math.min(100, score);
}

function scoreTargetAudience(artifacts: Record<string, unknown>): number {
    let score = 0;
    if (hasArtifact(artifacts, "target_audience")) score += 60;
    if (hasArtifact(artifacts, "problem")) score += 20;
    if (hasArtifact(artifacts, "custdev_results")) score += 20;
    return Math.min(100, score);
}

function scoreIdeaValidation(
    artifacts: Record<string, unknown>,
    progressData: ProgressData
): number {
    let score = 0;
    if (hasArtifact(artifacts, "hypotheses")) score += 30;
    if (hasArtifact(artifacts, "custdev_results")) score += 40;
    if (stageCompleted(progressData, "validation")) score += 30;
    else if (stageItemCount(progressData, "validation") > 0) score += 15;
    return Math.min(100, score);
}

function scoreMarketSize(artifacts: Record<string, unknown>): number {
    let score = 0;
    if (hasArtifact(artifacts, "target_audience")) score += 40;
    if (hasArtifact(artifacts, "competitors")) score += 30;
    if (hasArtifact(artifacts, "revenue_model")) score += 30;
    return Math.min(100, score);
}

function scoreCustDev(
    artifacts: Record<string, unknown>,
    progressData: ProgressData
): number {
    let score = 0;
    if (hasArtifact(artifacts, "custdev_results")) score += 50;
    const validationItems = stageItemCount(progressData, "validation");
    score += Math.min(50, validationItems * 15);
    return Math.min(100, score);
}

function scoreBMC(bmcData: unknown): number {
    if (!bmcData || typeof bmcData !== "object") return 0;
    const data = bmcData as Record<string, unknown>;
    let filledBlocks = 0;
    const bmcKeys = [
        "key_partners",
        "key_activities",
        "key_resources",
        "value_propositions",
        "customer_relationships",
        "channels",
        "customer_segments",
        "cost_structure",
        "revenue_streams",
    ];
    for (const key of bmcKeys) {
        const val = data[key];
        if (val && typeof val === "string" && val.trim().length > 0) filledBlocks++;
        else if (Array.isArray(val) && val.length > 0) filledBlocks++;
    }
    return Math.round((filledBlocks / 9) * 100);
}

function scoreVPC(vpcData: unknown): number {
    if (!vpcData || typeof vpcData !== "object") return 0;
    const data = vpcData as Record<string, unknown>;
    let filledBlocks = 0;
    const vpcKeys = [
        "customer_jobs",
        "pains",
        "gains",
        "products_services",
        "pain_relievers",
        "gain_creators",
    ];
    for (const key of vpcKeys) {
        const val = data[key];
        if (val && typeof val === "string" && val.trim().length > 0) filledBlocks++;
        else if (Array.isArray(val) && val.length > 0) filledBlocks++;
    }
    return Math.round((filledBlocks / 6) * 100);
}

function scoreUnitEconomics(
    artifacts: Record<string, unknown>,
    progressData: ProgressData
): number {
    let score = 0;
    if (hasArtifact(artifacts, "revenue_model")) score += 40;
    const bmItems = stageItemCount(progressData, "business_model");
    score += Math.min(40, bmItems * 15);
    if (stageCompleted(progressData, "business_model")) score += 20;
    return Math.min(100, score);
}

function scoreMVP(
    artifacts: Record<string, unknown>,
    progressData: ProgressData
): number {
    let score = 0;
    if (hasArtifact(artifacts, "mvp_features")) score += 50;
    const mvpItems = stageItemCount(progressData, "mvp");
    score += Math.min(30, mvpItems * 10);
    if (stageCompleted(progressData, "mvp")) score += 20;
    return Math.min(100, score);
}

function scorePitch(
    artifacts: Record<string, unknown>,
    progressData: ProgressData
): number {
    let score = 0;
    const pitchItems = stageItemCount(progressData, "pitch");
    score += Math.min(60, pitchItems * 15);
    if (stageCompleted(progressData, "pitch")) score += 40;
    else if (hasArtifact(artifacts, "idea_formulation") && hasArtifact(artifacts, "problem")) {
        score += 10;
    }
    return Math.min(100, score);
}

// ---------------------------------------------------------------------------
// Save scorecard to project + history
// ---------------------------------------------------------------------------

export async function saveScorecard(projectId: string): Promise<ScorecardResult | null> {
    const supabase = await createClient();
    const {
        data: { user },
    } = await supabase.auth.getUser();

    if (!user) return null;

    const { data: project } = await supabase
        .from("projects")
        .select("artifacts, progress_data, bmc_data, vpc_data")
        .eq("id", projectId)
        .eq("owner_id", user.id)
        .single();

    if (!project) return null;

    const artifacts = (project.artifacts as Record<string, unknown>) || {};
    const progressData = (project.progress_data as ProgressData) || {};

    const scorecard = computeScorecard(
        artifacts,
        progressData,
        project.bmc_data,
        project.vpc_data
    );

    // Save to project
    await supabase
        .from("projects")
        .update({
            scorecard: scorecard as unknown as Record<string, unknown>,
            updated_at: new Date().toISOString(),
        })
        .eq("id", projectId);

    // Save to history (debounce: only if last entry was >1 hour ago)
    const { data: lastEntry } = await supabase
        .from("scorecard_history")
        .select("created_at")
        .eq("project_id", projectId)
        .order("created_at", { ascending: false })
        .limit(1)
        .single();

    const shouldSaveHistory =
        !lastEntry ||
        Date.now() - new Date(lastEntry.created_at).getTime() > 3600000; // 1 hour

    if (shouldSaveHistory) {
        const criteriaSnapshot: Record<string, number> = {};
        for (const c of scorecard.criteria) {
            criteriaSnapshot[c.key] = c.score;
        }

        await supabase.from("scorecard_history").insert({
            project_id: projectId,
            score: scorecard.total,
            criteria_snapshot: criteriaSnapshot,
        });
    }

    return scorecard;
}
