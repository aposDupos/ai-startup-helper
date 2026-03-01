import { createClient } from "@/lib/supabase/server";
import { PublishButton } from "@/components/social/PublishButton";

export async function DashboardHeader() {
    const supabase = await createClient();
    const {
        data: { user },
    } = await supabase.auth.getUser();
    if (!user) return null;

    const { data: profile } = await supabase
        .from("profiles")
        .select("display_name")
        .eq("id", user.id)
        .single();

    const { data: projects } = await supabase
        .from("projects")
        .select("id, title, is_public")
        .eq("owner_id", user.id)
        .eq("is_active", true)
        .limit(1);

    const activeProject = projects?.[0];

    return (
        <div className="animate-fade-in">
            <h1 className="text-h1 text-surface-900">
                Привет, {profile?.display_name || "Основатель"}! 🚀
            </h1>
            <p className="text-body text-surface-500 mt-1">
                {activeProject
                    ? `Продолжай работу над «${activeProject.title}»`
                    : "Начни свой путь в мире стартапов"}
            </p>
            {activeProject && (
                <div className="mt-3 flex items-center gap-3 flex-wrap">
                    <PublishButton
                        projectId={activeProject.id}
                        initialIsPublic={activeProject.is_public || false}
                    />
                </div>
            )}
        </div>
    );
}
