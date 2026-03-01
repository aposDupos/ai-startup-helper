"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface StudyGroup {
    id: string;
    name: string;
    max_members: number;
    current_stage: string;
    invite_code: string;
    created_by: string;
    creator_name: string;
    created_at: string;
    member_count: number;
    members: {
        user_id: string;
        display_name: string;
        level: number;
    }[];
    is_member: boolean;
}

// ---------------------------------------------------------------------------
// Get my groups
// ---------------------------------------------------------------------------

export async function getMyGroups(): Promise<StudyGroup[]> {
    const supabase = await createClient();
    const {
        data: { user },
    } = await supabase.auth.getUser();

    if (!user) return [];

    // Get all groups
    const { data: groups } = await supabase
        .from("study_groups")
        .select(
            "id, name, max_members, current_stage, invite_code, created_by, created_at, profiles!study_groups_created_by_fkey(display_name)"
        )
        .order("created_at", { ascending: false });

    if (!groups) return [];

    // Get all members for these groups
    const groupIds = groups.map((g) => g.id);
    const { data: members } = await supabase
        .from("study_group_members")
        .select(
            "group_id, user_id, profiles!study_group_members_user_id_fkey(display_name, level)"
        )
        .in("group_id", groupIds);

    const memberMap = new Map<
        string,
        { user_id: string; display_name: string; level: number }[]
    >();

    if (members) {
        for (const m of members) {
            const profile = m.profiles as unknown as {
                display_name: string;
                level: number;
            } | null;
            const entry = {
                user_id: m.user_id,
                display_name: profile?.display_name || "Пользователь",
                level: profile?.level ?? 1,
            };
            const existing = memberMap.get(m.group_id) || [];
            existing.push(entry);
            memberMap.set(m.group_id, existing);
        }
    }

    return groups.map((g) => {
        const groupMembers = memberMap.get(g.id) || [];
        const creatorProfile = g.profiles as unknown as { display_name: string } | null;
        return {
            id: g.id,
            name: g.name,
            max_members: g.max_members ?? 7,
            current_stage: g.current_stage || "idea",
            invite_code: g.invite_code,
            created_by: g.created_by,
            creator_name: creatorProfile?.display_name || "Пользователь",
            created_at: g.created_at,
            member_count: groupMembers.length,
            members: groupMembers,
            is_member: groupMembers.some((m) => m.user_id === user.id),
        };
    });
}

// ---------------------------------------------------------------------------
// Create group
// ---------------------------------------------------------------------------

export async function createGroup(name: string) {
    const supabase = await createClient();
    const {
        data: { user },
    } = await supabase.auth.getUser();

    if (!user) throw new Error("Not authenticated");

    // Create the group
    const { data: group, error } = await supabase
        .from("study_groups")
        .insert({
            name,
            created_by: user.id,
        })
        .select("id")
        .single();

    if (error) throw new Error(error.message);

    // Auto-join creator
    await supabase.from("study_group_members").insert({
        group_id: group.id,
        user_id: user.id,
    });

    revalidatePath("/groups");
    return { success: true, groupId: group.id };
}

// ---------------------------------------------------------------------------
// Join group by invite code
// ---------------------------------------------------------------------------

export async function joinGroupByCode(inviteCode: string) {
    const supabase = await createClient();
    const {
        data: { user },
    } = await supabase.auth.getUser();

    if (!user) throw new Error("Not authenticated");

    // Find group
    const { data: group } = await supabase
        .from("study_groups")
        .select("id, max_members")
        .eq("invite_code", inviteCode)
        .single();

    if (!group) throw new Error("Группа не найдена");

    // Check capacity
    const { count } = await supabase
        .from("study_group_members")
        .select("*", { count: "exact", head: true })
        .eq("group_id", group.id);

    if ((count || 0) >= (group.max_members ?? 7)) {
        throw new Error("Группа заполнена");
    }

    // Join
    const { error } = await supabase.from("study_group_members").insert({
        group_id: group.id,
        user_id: user.id,
    });

    if (error) {
        if (error.code === "23505") return { success: true, already: true };
        throw new Error(error.message);
    }

    revalidatePath("/groups");
    return { success: true, already: false };
}

// ---------------------------------------------------------------------------
// Leave group
// ---------------------------------------------------------------------------

export async function leaveGroup(groupId: string) {
    const supabase = await createClient();
    const {
        data: { user },
    } = await supabase.auth.getUser();

    if (!user) throw new Error("Not authenticated");

    await supabase
        .from("study_group_members")
        .delete()
        .eq("group_id", groupId)
        .eq("user_id", user.id);

    revalidatePath("/groups");
    return { success: true };
}
