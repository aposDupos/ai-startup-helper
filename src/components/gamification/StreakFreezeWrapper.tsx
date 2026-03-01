"use client";

import { useState } from "react";
import { StreakFreezeModal } from "./StreakFreezeModal";

interface StreakFreezeWrapperProps {
    streakCount: number;
    streakAtRisk: boolean;
    alreadyUsedThisWeek: boolean;
}

export function StreakFreezeWrapper({
    streakCount,
    streakAtRisk,
    alreadyUsedThisWeek,
}: StreakFreezeWrapperProps) {
    const [showModal, setShowModal] = useState(streakAtRisk);

    if (!showModal) return null;

    return (
        <StreakFreezeModal
            streakCount={streakCount}
            alreadyUsedThisWeek={alreadyUsedThisWeek}
            onClose={() => setShowModal(false)}
        />
    );
}
