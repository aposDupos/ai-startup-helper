"use client";

import { useState, useTransition, useEffect } from "react";
import { MessageSquarePlus, CheckCircle, AlertCircle } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import {
    createReviewRequest,
    getActiveRequest,
} from "@/app/(main)/discover/review-actions";

interface ReviewRequestButtonProps {
    projectId: string;
    artifactType: "bmc" | "vpc" | "pitch";
}

export function ReviewRequestButton({ projectId, artifactType }: ReviewRequestButtonProps) {
    const [hasActiveRequest, setHasActiveRequest] = useState<boolean | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [isPending, startTransition] = useTransition();

    useEffect(() => {
        let mounted = true;
        getActiveRequest(projectId, artifactType).then((request) => {
            if (mounted) setHasActiveRequest(!!request);
        });
        return () => { mounted = false; };
    }, [projectId, artifactType]);

    const handleRequest = () => {
        setError(null);
        startTransition(async () => {
            const result = await createReviewRequest(projectId, artifactType);
            if (result.success) {
                setHasActiveRequest(true);
            } else {
                setError(result.error || "Ошибка при создании запроса");
            }
        });
    };

    // Loading state
    if (hasActiveRequest === null) return null;

    return (
        <div className="inline-flex flex-col gap-1">
            {hasActiveRequest ? (
                <div className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-amber-50 border border-amber-200 text-body-sm font-medium text-amber-700">
                    <CheckCircle size={16} strokeWidth={1.75} />
                    Ожидает ревью
                </div>
            ) : (
                <motion.button
                    type="button"
                    className="inline-flex items-center gap-2 px-4 py-2 rounded-lg text-body-sm font-semibold transition-colors"
                    style={{
                        backgroundColor: "var(--color-primary-50)",
                        color: "var(--color-primary-600)",
                        border: "1px solid var(--color-primary-200)",
                    }}
                    whileTap={{ scale: 0.97 }}
                    whileHover={{
                        backgroundColor: "var(--color-primary-100)",
                    }}
                    onClick={handleRequest}
                    disabled={isPending}
                >
                    <MessageSquarePlus size={16} strokeWidth={1.75} />
                    {isPending ? "Отправляем..." : "📝 Попросить фидбэк"}
                </motion.button>
            )}

            <AnimatePresence>
                {error && (
                    <motion.p
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        exit={{ opacity: 0, height: 0 }}
                        className="flex items-center gap-1 text-caption text-red-500"
                    >
                        <AlertCircle size={12} />
                        {error}
                    </motion.p>
                )}
            </AnimatePresence>
        </div>
    );
}
