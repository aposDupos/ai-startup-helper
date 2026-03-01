import { createClient } from "@/lib/supabase/server";
import { useStreakFreeze } from "@/lib/gamification/streaks";
import { NextResponse } from "next/server";

export async function POST() {
    const supabase = await createClient();
    const {
        data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
        return NextResponse.json(
            { success: false, message: "Unauthorized" },
            { status: 401 }
        );
    }

    const result = await useStreakFreeze(user.id);
    return NextResponse.json(result);
}
