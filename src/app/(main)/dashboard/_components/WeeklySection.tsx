import { createClient } from "@/lib/supabase/server";
import { WeeklyReportCard } from "@/components/gamification/WeeklyReportCard";
import { getWeeklyReport, shouldShowWeeklyReport } from "@/lib/reporting/weekly";

export async function WeeklySection() {
    const supabase = await createClient();
    const {
        data: { user },
    } = await supabase.auth.getUser();
    if (!user) return null;

    const { data: projects } = await supabase
        .from("projects")
        .select("id")
        .eq("owner_id", user.id)
        .eq("is_active", true)
        .limit(1);

    const activeProject = projects?.[0];
    if (!activeProject) return null;

    const showReport = await shouldShowWeeklyReport(user.id);
    if (!showReport) return null;

    const weeklyReport = await getWeeklyReport(user.id, activeProject.id);
    if (!weeklyReport) return null;

    return <WeeklyReportCard report={weeklyReport} />;
}
