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

    // Check if onboarding is completed
    const { data: profile } = await supabase
        .from("profiles")
        .select("onboarding_completed")
        .eq("id", user.id)
        .single();

    if (profile && !profile.onboarding_completed) {
        redirect("/onboarding");
    }

    return (
        <div className="min-h-screen bg-surface-50">
            <Sidebar />
            <main className="md:ml-[240px] pb-20 md:pb-0">
                <div className="max-w-[1280px] mx-auto px-4 md:px-8 py-6 md:py-8">
                    {children}
                </div>
            </main>
            <BottomNav />
        </div>
    );
}
