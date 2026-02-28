import { CheckCircle, Lightbulb } from "lucide-react";

interface IdeaSavedCardProps {
    data: {
        success: boolean;
        projectId?: string;
        error?: string;
    };
}

export function IdeaSavedCard({ data }: IdeaSavedCardProps) {
    if (!data.success) {
        return (
            <div className="w-full max-w-sm rounded-xl p-4 border-l-4 bg-red-50 border-l-red-400">
                <p className="text-sm text-red-600">
                    Не удалось сохранить идею: {data.error}
                </p>
            </div>
        );
    }

    return (
        <div
            className="w-full max-w-sm rounded-xl p-4 border-l-4 bg-success-50 space-y-2"
            style={{
                borderLeftColor: "var(--color-success-500)",
                background: "rgba(34, 197, 94, 0.05)",
            }}
        >
            <div className="flex items-center gap-2">
                <CheckCircle
                    size={16}
                    strokeWidth={1.75}
                    style={{ color: "var(--color-success-500)" }}
                />
                <span className="text-sm font-semibold text-surface-800">
                    Идея сохранена!
                </span>
            </div>
            <div className="flex items-start gap-2">
                <Lightbulb
                    size={14}
                    strokeWidth={1.75}
                    className="mt-0.5 flex-shrink-0 text-surface-400"
                />
                <p className="text-xs text-surface-600">
                    Идея добавлена в твой проект. Переходи к следующему шагу — валидации!
                </p>
            </div>
        </div>
    );
}
