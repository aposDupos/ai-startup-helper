"use client";

import { AlertTriangle, RefreshCw } from "lucide-react";

interface SectionErrorProps {
    sectionName?: string;
    onRetry?: () => void;
}

/**
 * Inline fallback for when a section fails to load.
 */
export function SectionError({ sectionName, onRetry }: SectionErrorProps) {
    return (
        <div className="p-6 rounded-xl bg-surface-0 border border-error-400/30 shadow-sm">
            <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-error-400/10 flex items-center justify-center flex-shrink-0">
                    <AlertTriangle size={20} className="text-error-500" />
                </div>
                <div className="flex-1 min-w-0">
                    <p className="text-body-sm font-medium text-surface-900">
                        Не удалось загрузить{" "}
                        {sectionName ? `«${sectionName}»` : "секцию"}
                    </p>
                    <p className="text-caption text-surface-500">
                        Попробуйте обновить страницу или повторить попытку
                    </p>
                </div>
                {onRetry && (
                    <button
                        onClick={onRetry}
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-body-sm font-medium text-primary-600 bg-primary-50 hover:bg-primary-100 transition-colors"
                    >
                        <RefreshCw size={14} />
                        Повторить
                    </button>
                )}
            </div>
        </div>
    );
}
