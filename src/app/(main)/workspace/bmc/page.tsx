import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { BMCCanvas } from "@/components/workspace/BMCCanvas";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import type { BMCData } from "@/types/workspace";
import { createEmptyBMCData } from "@/types/workspace";
import { ReviewRequestButton } from "@/components/social/ReviewRequestButton";

export default async function BMCPage() {
    const supabase = await createClient();
    const {
        data: { user },
    } = await supabase.auth.getUser();

    if (!user) redirect("/auth/login");

    const { data: projects } = await supabase
        .from("projects")
        .select("id, title, bmc_data")
        .eq("owner_id", user.id)
        .eq("is_active", true)
        .limit(1);

    const project = projects?.[0];
    if (!project) redirect("/dashboard");

    const bmcData: BMCData =
        (project.bmc_data as unknown as BMCData) || createEmptyBMCData();

    return (
        <div className="space-y-6">
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
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-h1 text-surface-900">
                        Business Model Canvas
                    </h1>
                    <p className="text-body text-surface-500 mt-1">
                        Заполни 9 блоков бизнес-модели проекта «{project.title}»
                    </p>
                </div>
                <ReviewRequestButton projectId={project.id} artifactType="bmc" />
            </div>

            {/* Canvas */}
            <BMCCanvas
                projectId={project.id}
                projectTitle={project.title}
                initialData={bmcData}
            />
        </div>
    );
}
