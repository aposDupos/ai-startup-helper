import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { ChatWindow } from "@/components/chat/ChatWindow";

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

    // Load user's active project to pre-set context
    const { data: project } = await supabase
        .from("projects")
        .select("id, stage")
        .eq("owner_id", user.id)
        .eq("is_active", true)
        .single();

    return (
        <main className="h-[calc(100vh-4rem)] p-4 lg:p-6">
            <div className="h-full max-w-3xl mx-auto">
                <ChatWindow
                    projectStage={project?.stage}
                    initialContext={context}
                />
            </div>
        </main>
    );
}
