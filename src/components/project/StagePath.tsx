"use client";

import type { StageStatus } from "@/types/project";

interface StagePathProps {
    status: StageStatus;
}

export function StagePath({ status }: StagePathProps) {
    const isCompleted = status === "completed";

    return (
        <div className="flex-1 flex items-center px-1 md:px-2 min-w-[20px]">
            <div
                className="w-full h-[3px] rounded-full transition-colors duration-300"
                style={{
                    background: isCompleted
                        ? "linear-gradient(90deg, var(--color-primary-400), var(--color-primary-600))"
                        : "var(--color-surface-200)",
                }}
            />
        </div>
    );
}
