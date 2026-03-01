/**
 * Skeleton — shimmer loading placeholder for Suspense fallbacks.
 */

export function Skeleton({ className = "" }: { className?: string }) {
    return (
        <div
            className={`animate-pulse rounded-xl bg-surface-100 ${className}`}
        />
    );
}

export function SkeletonCard({ className = "" }: { className?: string }) {
    return (
        <div className={`p-6 rounded-xl bg-surface-0 border border-surface-200 shadow-sm space-y-3 ${className}`}>
            <Skeleton className="h-5 w-1/3" />
            <Skeleton className="h-4 w-2/3" />
            <Skeleton className="h-4 w-1/2" />
        </div>
    );
}

export function SkeletonJourneyMap() {
    return (
        <div className="p-6 rounded-xl bg-surface-0 border border-surface-200 shadow-sm space-y-4">
            <Skeleton className="h-6 w-40" />
            <div className="flex gap-3">
                {[...Array(5)].map((_, i) => (
                    <Skeleton key={i} className="h-16 flex-1" />
                ))}
            </div>
            <Skeleton className="h-48 w-full" />
        </div>
    );
}

export function SkeletonScorecard() {
    return (
        <div className="grid md:grid-cols-2 gap-4">
            <div className="p-6 rounded-xl bg-surface-0 border border-surface-200 shadow-sm">
                <Skeleton className="h-48 w-full" />
            </div>
            <div className="p-6 rounded-xl bg-surface-0 border border-surface-200 shadow-sm">
                <Skeleton className="h-48 w-full" />
            </div>
        </div>
    );
}

export function SkeletonXPStreak() {
    return (
        <div className="grid md:grid-cols-2 gap-4">
            <SkeletonCard />
            <SkeletonCard />
        </div>
    );
}
