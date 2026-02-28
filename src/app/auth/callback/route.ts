import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

// Handle Supabase auth callback (email confirmation, magic links, OAuth)
export async function GET(request: Request) {
    const { searchParams, origin } = new URL(request.url);
    const code = searchParams.get("code");
    const next = searchParams.get("next") ?? "/onboarding";

    if (code) {
        const supabase = await createClient();
        const { error } = await supabase.auth.exchangeCodeForSession(code);

        if (!error) {
            // Check if user has completed onboarding
            const {
                data: { user },
            } = await supabase.auth.getUser();

            if (user) {
                const { data: profile } = await supabase
                    .from("profiles")
                    .select("onboarding_completed")
                    .eq("id", user.id)
                    .single();

                const redirectTo =
                    profile?.onboarding_completed ? "/dashboard" : next;
                return NextResponse.redirect(`${origin}${redirectTo}`);
            }

            return NextResponse.redirect(`${origin}${next}`);
        }
    }

    // If something went wrong, redirect to error or login
    return NextResponse.redirect(`${origin}/login`);
}
