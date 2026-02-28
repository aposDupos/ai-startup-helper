"use client";

import { useOptimistic, useTransition } from "react";
import { motion } from "framer-motion";
import { X } from "lucide-react";
import { ChecklistItem } from "./ChecklistItem";
import { StageProgressBar } from "./StageProgressBar";
import { toggleChecklistItem } from "@/app/(main)/dashboard/actions";
import {
    STAGES,
    type StageKey,
    type ProgressData,
    type ChecklistItemData,
} from "@/types/project";

interface StageCardProps {
    stageKey: StageKey;
    projectId: string;
    progressData: ProgressData;
    checklists: ChecklistItemData[];
    onClose: () => void;
}

export function StageCard({
    stageKey,
    projectId,
    progressData,
    checklists,
    onClose,
}: StageCardProps) {
    const stage = STAGES.find((s) => s.key === stageKey)!;
    const stageProgress = progressData[stageKey];
    const completedItems = stageProgress?.completedItems || [];

    const [isPending, startTransition] = useTransition();
    const [optimisticCompleted, setOptimisticCompleted] = useOptimistic(
        completedItems,
        (current: string[], itemKey: string) =>
            current.includes(itemKey)
                ? current.filter((k) => k !== itemKey)
                : [...current, itemKey]
    );

    function handleToggle(itemKey: string) {
        startTransition(async () => {
            setOptimisticCompleted(itemKey);
            await toggleChecklistItem(projectId, stageKey, itemKey);
        });
    }

    return (
        <motion.div
            initial={{ opacity: 0, height: 0, marginTop: 0 }}
            animate={{ opacity: 1, height: "auto", marginTop: 16 }}
            exit={{ opacity: 0, height: 0, marginTop: 0 }}
            transition={{ duration: 0.3, ease: "easeInOut" }}
            className="overflow-hidden"
        >
            <div className="p-6 rounded-xl bg-surface-0 border border-surface-200 shadow-sm">
                {/* Header */}
                <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3">
                        <span className="text-2xl">{stage.emoji}</span>
                        <div>
                            <h4 className="text-h4 text-surface-900">{stage.label}</h4>
                            <p className="text-caption text-surface-400">{stage.description}</p>
                        </div>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-1.5 rounded-lg transition-colors cursor-pointer hover:bg-surface-100"
                    >
                        <X size={18} strokeWidth={1.75} className="text-surface-400" />
                    </button>
                </div>

                {/* Progress bar */}
                <div className="mb-4">
                    <StageProgressBar
                        completed={optimisticCompleted.length}
                        total={checklists.length}
                    />
                </div>

                {/* Checklist items */}
                <div className="space-y-1">
                    {checklists
                        .sort((a, b) => (a.sort_order ?? 0) - (b.sort_order ?? 0))
                        .map((item) => (
                            <ChecklistItem
                                key={item.item_key}
                                item={item}
                                isCompleted={optimisticCompleted.includes(item.item_key)}
                                onToggle={handleToggle}
                                projectStage={stageKey}
                            />
                        ))}
                </div>

                {/* Loading indicator */}
                {isPending && (
                    <div className="mt-2 text-center">
                        <span className="text-caption text-surface-400">Сохранение...</span>
                    </div>
                )}
            </div>
        </motion.div>
    );
}
