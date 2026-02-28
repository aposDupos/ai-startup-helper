import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { getUserXPInfo } from "@/lib/gamification/xp";
import { getUserAchievements } from "@/lib/gamification/achievements";
import { getStreakInfo } from "@/lib/gamification/streaks";
import { getLeaderboard } from "@/lib/gamification/leaderboard";
import { XPBar } from "@/components/gamification/XPBar";
import { AchievementsGrid } from "@/components/gamification/AchievementsGrid";
import { StreakFlame } from "@/components/gamification/StreakFlame";
import { LeaderboardTable } from "@/components/gamification/LeaderboardTable";

export default async function GamificationPage() {
    const supabase = await createClient();
    const {
        data: { user },
    } = await supabase.auth.getUser();

    if (!user) redirect("/auth/login");

    // Load all gamification data in parallel
    const [xpInfo, achievements, streak, leaderboard] = await Promise.all([
        getUserXPInfo(user.id),
        getUserAchievements(user.id),
        getStreakInfo(user.id),
        getLeaderboard(20),
    ]);

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
            <div>
                <h1 className="text-h1 text-surface-900">
                    🏆 Прогресс и достижения
                </h1>
                <p className="text-body text-surface-500 mt-1">
                    Твой уровень, достижения, стрик и рейтинг
                </p>
            </div>

            {/* XP + Streak row */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <XPBar xpInfo={xpInfo} />
                <StreakFlame streak={streak} />
            </div>

            {/* Achievements */}
            <AchievementsGrid achievements={achievements} />

            {/* Leaderboard */}
            <LeaderboardTable entries={leaderboard} currentUserId={user.id} />
        </div>
    );
}
