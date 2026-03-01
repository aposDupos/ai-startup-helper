// ---------------------------------------------------------------------------
// Matching Algorithm — complementary skill matching
// ---------------------------------------------------------------------------

export type Skill = 'dev' | 'design' | 'marketing' | 'sales' | 'finance' | 'product';

// Define which skills complement each other
const COMPLEMENTARY_MAP: Record<Skill, Skill[]> = {
    dev: ['marketing', 'sales', 'design', 'product'],
    design: ['dev', 'marketing', 'sales'],
    marketing: ['dev', 'design', 'finance', 'product'],
    sales: ['dev', 'design', 'finance', 'product'],
    finance: ['marketing', 'sales', 'product'],
    product: ['dev', 'design', 'marketing'],
};

export const SKILL_LABELS: Record<Skill, string> = {
    dev: 'Разработка',
    design: 'Дизайн',
    marketing: 'Маркетинг',
    sales: 'Продажи',
    finance: 'Финансы',
    product: 'Продукт',
};

export const SKILL_COLORS: Record<Skill, string> = {
    dev: '#818CF8',      // primary-400
    design: '#F472B6',   // pink
    marketing: '#FB923C', // accent-400
    sales: '#4ADE80',    // success
    finance: '#FBBF24',  // amber
    product: '#22D3EE',  // cyan
};

/**
 * Calculate a "complementarity score" between two skill sets.
 * Higher = more complementary (different but useful together).
 */
export function complementarityScore(mySkills: Skill[], theirSkills: Skill[]): number {
    if (mySkills.length === 0 || theirSkills.length === 0) return 0;

    let score = 0;

    for (const mySkill of mySkills) {
        const complements = COMPLEMENTARY_MAP[mySkill] || [];
        for (const theirSkill of theirSkills) {
            if (complements.includes(theirSkill)) {
                score += 10;
            }
        }
        // Penalize overlap (same skills = less complementary)
        if (theirSkills.includes(mySkill)) {
            score -= 3;
        }
    }

    // Bonus for stage match (handled externally)
    return score;
}

/**
 * Sort candidates by complementarity to the user's skills.
 */
export function rankMatches<T extends { skills: Skill[] }>(
    mySkills: Skill[],
    candidates: T[],
): T[] {
    return [...candidates]
        .map((c) => ({ ...c, _score: complementarityScore(mySkills, c.skills) }))
        .sort((a, b) => b._score - a._score)
        .map(({ _score, ...rest }) => rest as unknown as T);
}
