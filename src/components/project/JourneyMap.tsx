"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { StageNode } from "./StageNode";
import { StagePath } from "./StagePath";
import { StageCard } from "./StageCard";
import {
    STAGES,
    getStageStatus,
    type StageKey,
    type ProgressData,
    type ChecklistItemData,
} from "@/types/project";
import type { Lesson } from "@/types/lesson";

interface JourneyMapProps {
    currentStage: StageKey;
    progressData: ProgressData;
    projectId: string;
    checklists: ChecklistItemData[];
    lessons: Record<string, Lesson>;
    completedLessonIds: string[];
}

const containerVariants = {
    hidden: {},
    show: {
        transition: { staggerChildren: 0.1 },
    },
};

const nodeVariants = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0, transition: { duration: 0.4, ease: [0.4, 0, 0.2, 1] as const } },
};

// Special animation for newly unlocked stages
const unlockVariants = {
    initial: { scale: 0.6, opacity: 0, filter: "grayscale(1)" },
    animate: {
        scale: 1,
        opacity: 1,
        filter: "grayscale(0)",
        transition: { type: "spring" as const, stiffness: 300, damping: 15 },
    },
};

export function JourneyMap({
    currentStage,
    progressData,
    projectId,
    checklists,
    lessons,
    completedLessonIds,
}: JourneyMapProps) {
    const [activeStage, setActiveStage] = useState<StageKey | null>(null);
    const [justUnlockedStage, setJustUnlockedStage] = useState<StageKey | null>(null);

    // Listen for stage-advanced events from ChatWindow
    useEffect(() => {
        function handleStageAdvanced(e: Event) {
            const detail = (e as CustomEvent).detail;
            if (detail?.newStage) {
                setJustUnlockedStage(detail.newStage as StageKey);
                // Clear the unlock animation after 3s
                setTimeout(() => setJustUnlockedStage(null), 3000);
            }
        }
        window.addEventListener("stage-advanced", handleStageAdvanced);
        return () => window.removeEventListener("stage-advanced", handleStageAdvanced);
    }, []);

    function handleStageClick(stageKey: StageKey) {
        const status = getStageStatus(stageKey, currentStage, progressData);
        if (status === "locked") return;
        setActiveStage(activeStage === stageKey ? null : stageKey);
    }

    return (
        <div className="space-y-4" data-journey-map>
            {/* Journey path header */}
            <div className="flex items-center justify-between mb-2">
                <h3 className="text-h4 text-surface-900">Путь основателя</h3>
                <span className="text-caption text-surface-400">
                    Этап {STAGES.findIndex((s) => s.key === currentStage) + 1} из {STAGES.length}
                </span>
            </div>

            {/* Horizontal journey path (desktop) / Vertical (mobile) */}
            <motion.div
                className="p-6 rounded-xl bg-surface-0 border border-surface-200 shadow-sm"
                variants={containerVariants}
                initial="hidden"
                animate="show"
            >
                {/* Desktop: Horizontal */}
                <div className="hidden md:flex items-center justify-between">
                    {STAGES.map((stage, i) => {
                        const status = getStageStatus(stage.key, currentStage, progressData);
                        return (
                            <motion.div
                                key={stage.key}
                                className="flex items-center flex-1 last:flex-initial"
                                variants={stage.key === justUnlockedStage ? undefined : nodeVariants}
                                initial={stage.key === justUnlockedStage ? unlockVariants.initial : undefined}
                                animate={stage.key === justUnlockedStage ? unlockVariants.animate : undefined}
                                style={stage.key === justUnlockedStage ? {
                                    boxShadow: "0 0 24px rgba(99,102,241,0.3)",
                                    borderRadius: 16,
                                } : undefined}
                            >
                                <StageNode
                                    stage={stage}
                                    status={status}
                                    isActive={activeStage === stage.key}
                                    onClick={() => handleStageClick(stage.key)}
                                />
                                {i < STAGES.length - 1 && (
                                    <StagePath
                                        status={
                                            getStageStatus(stage.key, currentStage, progressData) === "completed"
                                                ? "completed"
                                                : "locked"
                                        }
                                    />
                                )}
                            </motion.div>
                        );
                    })}
                </div>

                {/* Mobile: Vertical */}
                <div className="flex md:hidden flex-col gap-3">
                    {STAGES.map((stage, i) => {
                        const status = getStageStatus(stage.key, currentStage, progressData);
                        return (
                            <motion.div
                                key={stage.key}
                                className="flex items-center gap-3"
                                variants={nodeVariants}
                            >
                                <StageNode
                                    stage={stage}
                                    status={status}
                                    isActive={activeStage === stage.key}
                                    onClick={() => handleStageClick(stage.key)}
                                />
                                <div className="flex-1">
                                    <p
                                        className="text-body-sm font-semibold"
                                        style={{
                                            color:
                                                status === "in_progress"
                                                    ? "var(--color-primary-600)"
                                                    : status === "locked"
                                                        ? "var(--color-text-tertiary)"
                                                        : "var(--color-text-primary)",
                                        }}
                                    >
                                        {stage.label}
                                    </p>
                                    <p className="text-caption text-surface-400">{stage.description}</p>
                                </div>
                                {i < STAGES.length - 1 && (
                                    <div
                                        className="absolute left-[27px] md:hidden w-[3px] h-3 rounded-full mt-16"
                                        style={{
                                            backgroundColor:
                                                status === "completed"
                                                    ? "var(--color-primary-500)"
                                                    : "var(--color-surface-200)",
                                        }}
                                    />
                                )}
                            </motion.div>
                        );
                    })}
                </div>
            </motion.div>

            {/* Stage card (expanded) */}
            <AnimatePresence mode="wait">
                {activeStage && (
                    <StageCard
                        key={activeStage}
                        stageKey={activeStage}
                        projectId={projectId}
                        progressData={progressData}
                        checklists={checklists.filter((c) => c.stage === activeStage)}
                        lessons={lessons}
                        completedLessonIds={completedLessonIds}
                        onClose={() => setActiveStage(null)}
                    />
                )}
            </AnimatePresence>
        </div>
    );
}
