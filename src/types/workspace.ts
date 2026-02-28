/**
 * Types for Workspace tools — BMC, VPC, Unit Economics.
 */

// ---------------------------------------------------------------------------
// Sticky Note — shared between BMC and VPC
// ---------------------------------------------------------------------------

export interface StickyNoteData {
    id: string;
    text: string;
    color: StickyNoteColor;
}

export type StickyNoteColor = "yellow" | "pink" | "blue" | "green";

export const STICKY_NOTE_COLORS: Record<StickyNoteColor, string> = {
    yellow: "#FEF3C7",
    pink: "#FCE7F3",
    blue: "#DBEAFE",
    green: "#D1FAE5",
};

// ---------------------------------------------------------------------------
// BMC Data (stored in projects.bmc_data JSONB)
// ---------------------------------------------------------------------------

export type BMCBlockKey =
    | "customer_segments"
    | "value_propositions"
    | "channels"
    | "customer_relationships"
    | "revenue_streams"
    | "key_resources"
    | "key_activities"
    | "key_partnerships"
    | "cost_structure";

export interface BMCBlockDefinition {
    key: BMCBlockKey;
    label: string;
    emoji: string;
    description: string;
    gridArea: string;
}

export const BMC_BLOCKS: BMCBlockDefinition[] = [
    { key: "key_partnerships", label: "Ключевые партнёры", emoji: "🤝", description: "Кто ваши партнёры и поставщики?", gridArea: "kp" },
    { key: "key_activities", label: "Ключевые активности", emoji: "⚡", description: "Что вы делаете?", gridArea: "ka" },
    { key: "key_resources", label: "Ключевые ресурсы", emoji: "🏗️", description: "Какие ресурсы нужны?", gridArea: "kr" },
    { key: "value_propositions", label: "Ценностное предложение", emoji: "💎", description: "Какую ценность вы создаёте?", gridArea: "vp" },
    { key: "customer_relationships", label: "Отношения с клиентами", emoji: "💬", description: "Как взаимодействуете?", gridArea: "cr" },
    { key: "channels", label: "Каналы", emoji: "📢", description: "Как доставляете ценность?", gridArea: "ch" },
    { key: "customer_segments", label: "Сегменты клиентов", emoji: "👥", description: "Для кого создаёте ценность?", gridArea: "cs" },
    { key: "cost_structure", label: "Структура затрат", emoji: "💸", description: "Основные расходы?", gridArea: "co" },
    { key: "revenue_streams", label: "Потоки доходов", emoji: "💰", description: "За что платят клиенты?", gridArea: "rs" },
];

export type BMCData = Record<BMCBlockKey, StickyNoteData[]>;

export function createEmptyBMCData(): BMCData {
    return {
        customer_segments: [],
        value_propositions: [],
        channels: [],
        customer_relationships: [],
        revenue_streams: [],
        key_resources: [],
        key_activities: [],
        key_partnerships: [],
        cost_structure: [],
    };
}

// ---------------------------------------------------------------------------
// VPC Data (stored in projects.vpc_data JSONB)
// ---------------------------------------------------------------------------

export type VPCZoneKey =
    | "jobs"
    | "pains"
    | "gains"
    | "products"
    | "pain_relievers"
    | "gain_creators";

export interface VPCZoneDefinition {
    key: VPCZoneKey;
    label: string;
    emoji: string;
    description: string;
    side: "customer" | "value";
}

export const VPC_ZONES: VPCZoneDefinition[] = [
    { key: "jobs", label: "Jobs (задачи)", emoji: "🎯", description: "Что пытается сделать клиент?", side: "customer" },
    { key: "pains", label: "Pains (боли)", emoji: "😣", description: "Что мешает клиенту?", side: "customer" },
    { key: "gains", label: "Gains (выгоды)", emoji: "🌟", description: "Чего хочет достичь клиент?", side: "customer" },
    { key: "products", label: "Products & Services", emoji: "📦", description: "Что вы предлагаете?", side: "value" },
    { key: "pain_relievers", label: "Pain Relievers", emoji: "💊", description: "Как снимаете боли?", side: "value" },
    { key: "gain_creators", label: "Gain Creators", emoji: "🚀", description: "Как создаёте выгоды?", side: "value" },
];

export type VPCData = Record<VPCZoneKey, StickyNoteData[]>;

export function createEmptyVPCData(): VPCData {
    return {
        jobs: [],
        pains: [],
        gains: [],
        products: [],
        pain_relievers: [],
        gain_creators: [],
    };
}

// ---------------------------------------------------------------------------
// Unit Economics Data (stored in projects.unit_economics JSONB)
// ---------------------------------------------------------------------------

export interface UnitEconomicsData {
    cac: number | null;  // Customer Acquisition Cost
    ltv: number | null;  // Lifetime Value
    arpu: number | null; // Average Revenue Per User (monthly)
    churn: number | null; // Monthly churn rate (0-100%)
    payback_period: number | null; // Months
}

export function createEmptyUnitEconomics(): UnitEconomicsData {
    return {
        cac: null,
        ltv: null,
        arpu: null,
        churn: null,
        payback_period: null,
    };
}

/**
 * Calculate derived metrics from unit economics inputs.
 */
export function calculateUnitEconomics(data: UnitEconomicsData) {
    const { arpu, churn, cac } = data;

    // LTV = ARPU / Churn (monthly churn as decimal)
    const calculatedLTV =
        arpu != null && churn != null && churn > 0
            ? arpu / (churn / 100)
            : null;

    // Payback = CAC / ARPU
    const calculatedPayback =
        cac != null && arpu != null && arpu > 0
            ? cac / arpu
            : null;

    // LTV/CAC ratio
    const ltvCacRatio =
        calculatedLTV != null && cac != null && cac > 0
            ? calculatedLTV / cac
            : null;

    return {
        ltv: calculatedLTV,
        payback_period: calculatedPayback,
        ltv_cac_ratio: ltvCacRatio,
        health:
            ltvCacRatio == null
                ? ("unknown" as const)
                : ltvCacRatio >= 3
                    ? ("good" as const)
                    : ltvCacRatio >= 1
                        ? ("warning" as const)
                        : ("danger" as const),
    };
}
