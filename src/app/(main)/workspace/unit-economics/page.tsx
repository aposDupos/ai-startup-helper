import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { UnitEconomicsCalc } from "@/components/workspace/UnitEconomicsCalc";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import type { UnitEconomicsData } from "@/types/workspace";
import { createEmptyUnitEconomics } from "@/types/workspace";

export default async function UnitEconomicsPage() {
    const supabase = await createClient();
    const {
        data: { user },
    } = await supabase.auth.getUser();

    if (!user) redirect("/auth/login");

    const { data: projects } = await supabase
        .from("projects")
        .select("id, title, unit_economics")
        .eq("owner_id", user.id)
        .eq("is_active", true)
        .limit(1);

    const project = projects?.[0];
    if (!project) redirect("/dashboard");

    const unitEconomics: UnitEconomicsData =
        (project.unit_economics as unknown as UnitEconomicsData) ||
        createEmptyUnitEconomics();

    return (
        <div className="space-y-6">
            <div className="flex items-center gap-3">
                <Link
                    href="/dashboard"
                    className="flex items-center gap-1.5 text-body-sm text-surface-500 hover:text-primary-500 transition-colors"
                >
                    <ArrowLeft size={16} strokeWidth={1.75} />
                    Назад к карте
                </Link>
            </div>

            <div>
                <h1 className="text-h1 text-surface-900">
                    Юнит-экономика
                </h1>
                <p className="text-body text-surface-500 mt-1">
                    Рассчитай ключевые метрики для проекта «{project.title}»
                </p>
            </div>

            <UnitEconomicsCalc
                projectId={project.id}
                initialData={unitEconomics}
            />
        </div>
    );
}
