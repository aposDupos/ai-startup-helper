import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { Sidebar } from "@/components/shared/Sidebar";
import { BottomNav } from "@/components/shared/BottomNav";

export default async function MainLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const supabase = await createClient();
    const {
        data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
        redirect("/login");
    }

    // Check if onboarding is completed + fetch profile for sidebar
    const { data: profile } = await supabase
        .from("profiles")
        .select("onboarding_completed, display_name, level, xp, streak_count")
        .eq("id", user.id)
        .single();

    if (profile && !profile.onboarding_completed) {
        redirect("/onboarding");
    }

    const userProfile = {
        displayName: profile?.display_name || user.email?.split("@")[0] || "Пользователь",
        level: profile?.level ?? 1,
        xp: profile?.xp ?? 0,
        streakCount: profile?.streak_count ?? 0,
    };

    return (
        <div className="min-h-screen bg-surface-50">
            <Sidebar userProfile={userProfile} />
            <main className="md:ml-[240px] pb-20 md:pb-0">
                <div className="max-w-[1280px] mx-auto px-4 md:px-8 py-6 md:py-8">
                    {children}
                </div>
            </main>
            <BottomNav />
        </div>
    );
}
