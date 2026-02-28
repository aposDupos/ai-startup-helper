"use client";

interface StageProgressBarProps {
    completed: number;
    total: number;
}

export function StageProgressBar({ completed, total }: StageProgressBarProps) {
    const percentage = total > 0 ? Math.round((completed / total) * 100) : 0;

    return (
        <div className="flex items-center gap-3">
            <div className="flex-1 h-2 rounded-full bg-surface-100 overflow-hidden">
                <div
                    className="h-full rounded-full transition-all duration-500 ease-out"
                    style={{
                        width: `${percentage}%`,
                        background:
                            percentage === 100
                                ? "linear-gradient(90deg, var(--color-success-400), var(--color-success-500))"
                                : "linear-gradient(90deg, var(--color-primary-400), var(--color-primary-600))",
                    }}
                />
            </div>
            <span
                className="text-caption font-semibold tabular-nums min-w-[44px] text-right"
                style={{
                    fontFamily: "var(--font-mono)",
                    color:
                        percentage === 100
                            ? "var(--color-success-500)"
                            : "var(--color-text-secondary)",
                }}
            >
                {completed}/{total}
            </span>
        </div>
    );
}
