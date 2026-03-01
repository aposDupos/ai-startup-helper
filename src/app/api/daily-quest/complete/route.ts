import { createClient } from "@/lib/supabase/server";
import { completeDailyQuest } from "@/lib/gamification/daily-quest";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
    const supabase = await createClient();
    const {
        data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
        return NextResponse.json({ success: false, xpAwarded: 0 }, { status: 401 });
    }

    const { questId } = await req.json();
    if (!questId) {
        return NextResponse.json({ success: false, xpAwarded: 0 }, { status: 400 });
    }

    const result = await completeDailyQuest(user.id, questId);
    return NextResponse.json(result);
}
