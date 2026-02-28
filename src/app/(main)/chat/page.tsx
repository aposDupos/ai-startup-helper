import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { ChatWindow } from "@/components/chat/ChatWindow";
import { STAGES } from "@/types/project";
import type { ProgressData } from "@/types/project";

export const metadata = {
    title: "AI-наставник — StartupCopilot",
    description: "Твой AI-наставник для стартапа. Поиск идеи, валидация, бизнес-модель, MVP и питч.",
};

interface ChatPageProps {
    searchParams: Promise<{ context?: string }>;
}

export default async function ChatPage({ searchParams }: ChatPageProps) {
    const supabase = await createClient();

    const {
        data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
        redirect("/login");
    }

    // Read context from query params (e.g. /chat?context=idea_search)
    const params = await searchParams;
    const context = params.context;

    // Redirect learning context to the dedicated learning page
    if (context === "learning") {
        redirect("/learning");
    }

    // Load user profile for welcome message
    const { data: profile } = await supabase
        .from("profiles")
        .select("display_name")
        .eq("id", user.id)
        .single();

    const userName = profile?.display_name || user.email?.split("@")[0] || "Пользователь";

    // Load user's active project to pre-set context
    const { data: project } = await supabase
        .from("projects")
        .select("id, title, stage, progress_data")
        .eq("owner_id", user.id)
        .eq("is_active", true)
        .single();

    // Derive "last step" from project progress
    let lastStep: string | undefined;
    if (project?.stage) {
        const stageInfo = STAGES.find((s) => s.key === project.stage);
        lastStep = stageInfo?.label;

        // Try to get more specific — last completed checklist item
        const progressData = project.progress_data as ProgressData | null;
        if (progressData?.[project.stage as keyof ProgressData]) {
            const stageProgress = progressData[project.stage as keyof ProgressData];
            const items = stageProgress?.completedItems || [];
            if (items.length > 0) {
                lastStep = `${stageInfo?.label} — ${items[items.length - 1].replace(/_/g, " ")}`;
            }
        }
    }

    return (
        <main className="h-[calc(100vh-4rem)] p-4 lg:p-6">
            <div className="h-full max-w-3xl mx-auto">
                <ChatWindow
                    projectStage={project?.stage}
                    initialContext={context}
                    userName={userName}
                    hasProject={!!project}
                    lastStep={lastStep}
                />
            </div>
        </main>
    );
}

