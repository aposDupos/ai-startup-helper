"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import { rankMatches, type Skill } from "@/lib/matching/algorithm";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface MatchProfile {
    id: string;
    display_name: string;
    avatar_url: string | null;
    skills: Skill[];
    bio: string | null;
    looking_for_cofounder: boolean;
    level: number;
    xp: number;
    project?: {
        title: string;
        stage: string;
    } | null;
}

// ---------------------------------------------------------------------------
// Get matches — complementary users looking for co-founders
// ---------------------------------------------------------------------------

export async function getMatches(): Promise<MatchProfile[]> {
    const supabase = await createClient();
    const {
        data: { user },
    } = await supabase.auth.getUser();

    if (!user) return [];

    // Get current user's skills
    const { data: myProfile } = await supabase
        .from("profiles")
        .select("skills")
        .eq("id", user.id)
        .single();

    const mySkills = (myProfile?.skills || []) as Skill[];

    // Get other users looking for co-founders
    const { data: candidates } = await supabase
        .from("profiles")
        .select("id, display_name, avatar_url, skills, bio, looking_for_cofounder, level, xp")
        .eq("looking_for_cofounder", true)
        .neq("id", user.id);

    if (!candidates || candidates.length === 0) return [];

    // Fetch their active projects
    const candidateIds = candidates.map((c) => c.id);
    const { data: projects } = await supabase
        .from("projects")
        .select("owner_id, title, stage")
        .in("owner_id", candidateIds)
        .eq("is_active", true);

    const projectMap = new Map<string, { title: string; stage: string }>();
    if (projects) {
        for (const p of projects) {
            if (!projectMap.has(p.owner_id)) {
                projectMap.set(p.owner_id, { title: p.title, stage: p.stage || "idea" });
            }
        }
    }

    const enriched: MatchProfile[] = candidates.map((c) => ({
        id: c.id,
        display_name: c.display_name,
        avatar_url: c.avatar_url,
        skills: (c.skills || []) as Skill[],
        bio: c.bio,
        looking_for_cofounder: c.looking_for_cofounder ?? false,
        level: c.level ?? 1,
        xp: c.xp ?? 0,
        project: projectMap.get(c.id) || null,
    }));

    // Rank by complementarity
    return rankMatches(mySkills, enriched);
}

// ---------------------------------------------------------------------------
// Get own matching profile
// ---------------------------------------------------------------------------

export async function getMyMatchingProfile() {
    const supabase = await createClient();
    const {
        data: { user },
    } = await supabase.auth.getUser();

    if (!user) return null;

    const { data } = await supabase
        .from("profiles")
        .select("skills, bio, looking_for_cofounder")
        .eq("id", user.id)
        .single();

    return data;
}

// ---------------------------------------------------------------------------
// Update matching profile
// ---------------------------------------------------------------------------

export async function updateMatchingProfile(formData: {
    skills: string[];
    bio: string;
    looking_for_cofounder: boolean;
}) {
    const supabase = await createClient();
    const {
        data: { user },
    } = await supabase.auth.getUser();

    if (!user) throw new Error("Not authenticated");

    const { error } = await supabase
        .from("profiles")
        .update({
            skills: formData.skills,
            bio: formData.bio,
            looking_for_cofounder: formData.looking_for_cofounder,
        })
        .eq("id", user.id);

    if (error) throw new Error(error.message);

    revalidatePath("/match");
    return { success: true };
}
