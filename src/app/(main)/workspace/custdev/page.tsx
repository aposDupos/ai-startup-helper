import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { CustDevSimulator } from "@/components/workspace/CustDevSimulator";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";

export const metadata = {
    title: "CustDev Тренажёр — StartupCopilot",
    description:
        "Практикуй CustDev-интервью с AI, который играет роль потенциального клиента.",
};

export default async function CustDevPage() {
    const supabase = await createClient();
    const {
        data: { user },
    } = await supabase.auth.getUser();

    if (!user) redirect("/auth/login");

    const { data: projects } = await supabase
        .from("projects")
        .select("id, title, artifacts")
        .eq("owner_id", user.id)
        .eq("is_active", true)
        .limit(1);

    const project = projects?.[0];
    if (!project) redirect("/dashboard");

    const artifacts = (project.artifacts as Record<string, unknown>) || {};

    return (
        <div className="space-y-6 h-[calc(100vh-4rem)]">
            {/* Back navigation */}
            <div className="flex items-center gap-3">
                <Link
                    href="/dashboard"
                    className="flex items-center gap-1.5 text-body-sm text-surface-500 hover:text-primary-500 transition-colors"
                >
                    <ArrowLeft size={16} strokeWidth={1.75} />
                    Назад к карте
                </Link>
            </div>

            {/* Header */}
            <div>
                <h1 className="text-h1 text-surface-900">
                    CustDev Тренажёр 🎭
                </h1>
                <p className="text-body text-surface-500 mt-1">
                    Практикуй интервью с AI-клиентом для проекта «{project.title}»
                </p>
            </div>

            {/* Simulator */}
            <div className="h-[calc(100%-120px)]">
                <CustDevSimulator
                    projectId={project.id}
                    projectTitle={project.title}
                    artifacts={artifacts}
                />
            </div>
        </div>
    );
}
