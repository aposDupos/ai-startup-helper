import { createClient } from "@/lib/supabase/server";
import { DailyQuestCard } from "@/components/gamification/DailyQuestCard";
import { StreakFreezeWrapper } from "@/components/gamification/StreakFreezeWrapper";
import { generateDailyQuest, getQuestActionUrl } from "@/lib/gamification/daily-quest";
import { checkStreakFreeze } from "@/lib/gamification/streaks";

export async function QuestsSection() {
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

    // Fetch daily quest + streak freeze in parallel
    const [questResult, freezeResult] = await Promise.allSettled([
        activeProject
            ? generateDailyQuest(user.id, activeProject.id).then(async (quest) => ({
                quest,
                actionUrl: await getQuestActionUrl(quest),
            }))
            : Promise.resolve(null),
        checkStreakFreeze(user.id),
    ]);

    const questData =
        questResult.status === "fulfilled" ? questResult.value : null;
    const freezeInfo =
        freezeResult.status === "fulfilled" ? freezeResult.value : null;

    return (
        <>
            {questData?.quest && (
                <DailyQuestCard
                    quest={questData.quest}
                    actionUrl={questData.actionUrl}
                />
            )}
            {freezeInfo && freezeInfo.streakAtRisk && (
                <StreakFreezeWrapper
                    streakCount={freezeInfo.streakCount}
                    streakAtRisk={freezeInfo.streakAtRisk}
                    alreadyUsedThisWeek={freezeInfo.alreadyUsedThisWeek}
                />
            )}
        </>
    );
}
