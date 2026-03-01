/**
 * Dynamic XP level thresholds.
 *
 * Loads level definitions from the `levels` table and provides helpers
 * for computing current level, progress %, and next threshold.
 */

import { createClient } from "@/lib/supabase/server";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface LevelDef {
    level: number;
    title: string;
    min_xp: number;
    icon: string;
}

export interface LevelInfo {
    level: number;
    title: string;
    icon: string;
    currentXP: number;
    xpIntoLevel: number;
    xpRequiredForNext: number;
    progressPercent: number;
    nextLevelXP: number | null;
}

// ---------------------------------------------------------------------------
// Cache (module-level, lives for the life of the server process)
// ---------------------------------------------------------------------------

let cachedLevels: LevelDef[] | null = null;
let cacheTTL = 0;
const CACHE_DURATION_MS = 5 * 60 * 1000; // 5 minutes

async function getLevelDefs(): Promise<LevelDef[]> {
    if (cachedLevels && Date.now() < cacheTTL) {
        return cachedLevels;
    }

    const supabase = await createClient();
    const { data, error } = await supabase
        .from("levels")
        .select("level, title, min_xp, icon")
        .order("level", { ascending: true });

    if (error || !data || data.length === 0) {
        // Fallback hardcoded levels if DB is unavailable
        return [
            { level: 1, title: "Dreamer", min_xp: 0, icon: "💭" },
            { level: 2, title: "Explorer", min_xp: 100, icon: "🔍" },
            { level: 3, title: "Builder", min_xp: 500, icon: "🔨" },
            { level: 4, title: "Launcher", min_xp: 1500, icon: "🚀" },
            { level: 5, title: "Founder", min_xp: 5000, icon: "👑" },
        ];
    }

    cachedLevels = data;
    cacheTTL = Date.now() + CACHE_DURATION_MS;
    return data;
}

// ---------------------------------------------------------------------------
// Public API
// ---------------------------------------------------------------------------

/**
 * Compute level info for a given XP amount.
 */
export async function getLevelInfo(xp: number): Promise<LevelInfo> {
    const levels = await getLevelDefs();

    // Find current level (highest level whose min_xp <= xp)
    let current = levels[0];
    for (const lvl of levels) {
        if (xp >= lvl.min_xp) {
            current = lvl;
        } else {
            break;
        }
    }

    const currentIndex = levels.indexOf(current);
    const nextLevel = currentIndex < levels.length - 1 ? levels[currentIndex + 1] : null;

    const xpIntoLevel = xp - current.min_xp;
    const xpRequiredForNext = nextLevel ? nextLevel.min_xp - current.min_xp : 0;
    const progressPercent = xpRequiredForNext > 0
        ? Math.min(100, Math.round((xpIntoLevel / xpRequiredForNext) * 100))
        : 100;

    return {
        level: current.level,
        title: current.title,
        icon: current.icon,
        currentXP: xp,
        xpIntoLevel,
        xpRequiredForNext,
        progressPercent,
        nextLevelXP: nextLevel?.min_xp ?? null,
    };
}

/**
 * Check if XP amount crosses a level boundary, returning the new level if so.
 */
export async function checkLevelUp(
    oldXP: number,
    newXP: number
): Promise<{ leveledUp: boolean; newLevel?: LevelDef }> {
    const levels = await getLevelDefs();

    for (const lvl of levels) {
        if (oldXP < lvl.min_xp && newXP >= lvl.min_xp) {
            return { leveledUp: true, newLevel: lvl };
        }
    }

    return { leveledUp: false };
}
