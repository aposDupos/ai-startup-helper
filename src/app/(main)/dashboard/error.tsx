"use client";

import { useEffect } from "react";
import { AlertTriangle, RefreshCw } from "lucide-react";

export default function DashboardError({
    error,
    reset,
}: {
    error: Error & { digest?: string };
    reset: () => void;
}) {
    useEffect(() => {
        console.error("[Dashboard Error]", error);
    }, [error]);

    return (
        <div className="flex flex-col items-center justify-center min-h-[60vh] text-center px-4">
            <div className="w-16 h-16 rounded-full bg-error-400/10 flex items-center justify-center mb-4">
                <AlertTriangle size={32} className="text-error-500" />
            </div>
            <h2 className="text-h3 text-surface-900 mb-2">
                Что-то пошло не так
            </h2>
            <p className="text-body text-surface-500 mb-6 max-w-md">
                Произошла ошибка при загрузке дашборда. Попробуйте обновить
                страницу.
            </p>
            <button
                onClick={reset}
                className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-body-sm font-semibold text-white bg-primary-500 hover:bg-primary-600 transition-colors shadow-sm"
            >
                <RefreshCw size={16} />
                Попробовать снова
            </button>
        </div>
    );
}
