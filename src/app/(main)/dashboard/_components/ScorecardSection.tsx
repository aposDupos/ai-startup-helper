import { createClient } from "@/lib/supabase/server";
import { ScorecardRadar } from "@/components/project/ScorecardRadar";
import { ScorecardHistory } from "@/components/project/ScorecardHistory";
import { saveScorecard } from "@/lib/scoring/scorecard";

export async function ScorecardSection() {
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

    const scorecardData = await saveScorecard(activeProject.id);
    if (!scorecardData) return null;

    const { data: historyData } = await supabase
        .from("scorecard_history")
        .select("score, created_at")
        .eq("project_id", activeProject.id)
        .order("created_at", { ascending: true })
        .limit(30);

    return (
        <div className="grid md:grid-cols-2 gap-4">
            <ScorecardRadar
                criteria={scorecardData.criteria}
                total={scorecardData.total}
            />
            <ScorecardHistory history={historyData || []} />
        </div>
    );
}
