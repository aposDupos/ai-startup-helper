import { Suspense } from "react";
import { Skeleton, SkeletonCard, SkeletonJourneyMap, SkeletonScorecard, SkeletonXPStreak } from "@/components/ui/Skeleton";
import { DashboardHeader } from "./_components/DashboardHeader";
import { JourneyMapSection } from "./_components/JourneyMapSection";
import { ScorecardSection } from "./_components/ScorecardSection";
import { QuestsSection } from "./_components/QuestsSection";
import { WeeklySection } from "./_components/WeeklySection";
import { ReviewNotifications } from "./_components/ReviewNotifications";
import { ProjectContentSection } from "./_components/ProjectContentSection";

export default function DashboardPage() {
    return (
        <div className="space-y-6">
            {/* Welcome Header */}
            <Suspense fallback={<div className="space-y-2"><Skeleton className="h-8 w-64" /><Skeleton className="h-5 w-96" /></div>}>
                <DashboardHeader />
            </Suspense>

            {/* Review Notifications */}
            <Suspense fallback={null}>
                <ReviewNotifications />
            </Suspense>

            {/* Journey Map */}
            <Suspense fallback={<SkeletonJourneyMap />}>
                <JourneyMapSection />
            </Suspense>

            {/* Daily Quest + Streak Freeze */}
            <Suspense fallback={<SkeletonCard />}>
                <QuestsSection />
            </Suspense>

            {/* Scorecard */}
            <Suspense fallback={<SkeletonScorecard />}>
                <ScorecardSection />
            </Suspense>

            {/* Weekly Report */}
            <Suspense fallback={null}>
                <WeeklySection />
            </Suspense>

            {/* Project Content (Passport, Recommendations, Team, Lesson, XP/Streak) */}
            <Suspense fallback={<div className="space-y-4"><SkeletonCard /><SkeletonXPStreak /></div>}>
                <ProjectContentSection />
            </Suspense>
        </div>
    );
}
