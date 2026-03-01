"use client";

import { useState, useTransition } from "react";
import { Globe, GlobeLock } from "lucide-react";
import { toggleProjectPublic } from "@/app/(main)/discover/actions";
import { motion } from "framer-motion";

interface PublishButtonProps {
    projectId: string;
    initialIsPublic: boolean;
}

export function PublishButton({ projectId, initialIsPublic }: PublishButtonProps) {
    const [isPublic, setIsPublic] = useState(initialIsPublic);
    const [isPending, startTransition] = useTransition();

    const handleToggle = () => {
        startTransition(async () => {
            const newState = await toggleProjectPublic(projectId);
            setIsPublic(newState);
        });
    };

    return (
        <motion.button
            type="button"
            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg text-body-sm font-semibold transition-colors"
            style={{
                backgroundColor: isPublic
                    ? "var(--color-success-500)"
                    : "var(--color-surface-100)",
                color: isPublic ? "white" : "var(--color-text-secondary)",
                border: isPublic
                    ? "none"
                    : "1px solid var(--color-surface-200)",
            }}
            whileTap={{ scale: 0.97 }}
            onClick={handleToggle}
            disabled={isPending}
        >
            {isPublic ? (
                <>
                    <Globe size={16} strokeWidth={1.75} />
                    Опубликован
                </>
            ) : (
                <>
                    <GlobeLock size={16} strokeWidth={1.75} />
                    Опубликовать
                </>
            )}
        </motion.button>
    );
}
