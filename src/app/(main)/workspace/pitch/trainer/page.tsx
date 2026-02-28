import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { PitchTrainer } from "@/components/workspace/PitchTrainer";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";

export default async function PitchTrainerPage() {
    const supabase = await createClient();
    const {
        data: { user },
    } = await supabase.auth.getUser();

    if (!user) redirect("/auth/login");

    const { data: projects } = await supabase
        .from("projects")
        .select("id, title")
        .eq("owner_id", user.id)
        .eq("is_active", true)
        .limit(1);

    const project = projects?.[0];
    if (!project) redirect("/dashboard");

    return (
        <div className="space-y-6">
            {/* Back navigation */}
            <div className="flex items-center gap-3">
                <Link
                    href="/workspace/pitch"
                    className="flex items-center gap-1.5 text-body-sm text-surface-500 hover:text-primary-500 transition-colors"
                >
                    <ArrowLeft size={16} strokeWidth={1.75} />
                    Назад к Pitch Deck
                </Link>
            </div>

            {/* Header */}
            <div>
                <h1 className="text-h1 text-surface-900">
                    🎤 Тренажёр питча
                </h1>
                <p className="text-body text-surface-500 mt-1">
                    AI-инвестор задаёт вопросы по проекту «{project.title}»
                </p>
            </div>

            {/* Trainer */}
            <PitchTrainer
                projectId={project.id}
                projectTitle={project.title}
            />
        </div>
    );
}
