"use client";

import type { LessonContentBlock } from "@/types/lesson";
import { Info, Lightbulb, AlertTriangle } from "lucide-react";

interface LessonContentProps {
    blocks: LessonContentBlock[];
}

const calloutIcons = {
    tip: Lightbulb,
    info: Info,
    warning: AlertTriangle,
};

const calloutStyles = {
    tip: "bg-success-500/5 border-success-500/20 text-success-700",
    info: "bg-primary-500/5 border-primary-500/20 text-primary-700",
    warning: "bg-accent-500/5 border-accent-500/20 text-accent-700",
};

export function LessonContent({ blocks }: LessonContentProps) {
    return (
        <div className="space-y-3">
            {blocks.map((block, i) => {
                switch (block.type) {
                    case "heading":
                        return (
                            <h4
                                key={i}
                                className="text-h4 text-surface-900"
                                style={{
                                    fontFamily: "var(--font-heading)",
                                }}
                            >
                                {block.text}
                            </h4>
                        );
                    case "paragraph":
                        return (
                            <p
                                key={i}
                                className="text-body-sm text-surface-700 leading-relaxed"
                            >
                                {block.text}
                            </p>
                        );
                    case "callout": {
                        const Icon = calloutIcons[block.variant];
                        return (
                            <div
                                key={i}
                                className={`flex gap-2.5 p-3 rounded-lg border ${calloutStyles[block.variant]}`}
                            >
                                <Icon size={16} className="shrink-0 mt-0.5" />
                                <p className="text-body-sm leading-relaxed">
                                    {block.text}
                                </p>
                            </div>
                        );
                    }
                    default:
                        return null;
                }
            })}
        </div>
    );
}
