/**
 * Supabase Auth helpers — eliminates repetitive auth boilerplate in server
 * components and server actions.
 */

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import type { SupabaseClient } from "@supabase/supabase-js";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface AuthenticatedUser {
    user: { id: string; email?: string };
    supabase: SupabaseClient;
}

interface ProfileWithProject {
    user: { id: string; email?: string };
    supabase: SupabaseClient;
    profile: {
        id: string;
        display_name: string | null;
        role: string | null;
        xp: number;
        level: number;
        streak_count: number;
        timezone: string | null;
    } | null;
    project: {
        id: string;
        title: string;
        description: string | null;
        stage: string;
        progress_data: unknown;
        artifacts: unknown;
        team_members: unknown;
        is_public: boolean | null;
    } | null;
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/**
 * Get authenticated user or redirect to login.
 * Use in server components and server actions that require auth.
 */
export async function getAuthenticatedUser(): Promise<AuthenticatedUser> {
    const supabase = await createClient();
    const {
        data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
        redirect("/login");
    }

    return { user, supabase };
}

/**
 * Get the user's active project, or null if none exists.
 */
export async function getActiveProject(userId: string) {
    const supabase = await createClient();
    const { data: projects } = await supabase
        .from("projects")
        .select("*")
        .eq("owner_id", userId)
        .eq("is_active", true)
        .limit(1);

    return projects?.[0] ?? null;
}

/**
 * Get profile + active project for a user.
 * Convenient for pages that need both.
 */
export async function getProfileWithProject(userId: string): Promise<ProfileWithProject> {
    const supabase = await createClient();

    const [profileResult, projectResult] = await Promise.all([
        supabase.from("profiles").select("*").eq("id", userId).single(),
        supabase
            .from("projects")
            .select("*")
            .eq("owner_id", userId)
            .eq("is_active", true)
            .limit(1),
    ]);

    return {
        user: { id: userId },
        supabase,
        profile: profileResult.data,
        project: projectResult.data?.[0] ?? null,
    };
}
