import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { ChatWindow } from "@/components/chat/ChatWindow";

export const metadata = {
    title: "AI-наставник — StartupCopilot",
    description: "Твой AI-наставник для стартапа. Поиск идеи, валидация, бизнес-модель, MVP и питч.",
};

export default async function ChatPage() {
    const supabase = await createClient();

    const {
        data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
        redirect("/login");
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
                />
            </div>
        </main>
    );
}
