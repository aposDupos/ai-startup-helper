import type { ICEResult } from "@/lib/ai/tools/evaluate-ice";

interface ICEScoreCardProps {
    data: ICEResult;
}

function ProgressBar({ value, color }: { value: number; color: string }) {
    return (
        <div className="h-2 bg-surface-100 rounded-full overflow-hidden">
            <div
                className="h-full rounded-full transition-all duration-500"
                style={{ width: `${(value / 10) * 100}%`, background: color }}
            />
        </div>
    );
}

export function ICEScoreCard({ data }: ICEScoreCardProps) {
    const scoreColor =
        data.ice_score >= 7
            ? "var(--color-success-500)"
            : data.ice_score >= 5
                ? "var(--color-accent-500)"
                : "var(--color-surface-400)";

    return (
        <div
            className="w-full max-w-sm rounded-xl p-4 border-l-4 bg-primary-50 space-y-3"
            style={{ borderLeftColor: "var(--color-primary-500)" }}
        >
            <div className="flex items-center justify-between">
                <span className="text-xs font-semibold uppercase tracking-wide text-primary-600">
                    ICE Score
                </span>
                <span
                    className="text-2xl font-bold font-mono"
                    style={{ color: scoreColor }}
                >
                    {data.ice_score}
                </span>
            </div>

            {data.idea_title && (
                <p className="text-sm font-medium text-surface-800">{data.idea_title}</p>
            )}

            <div className="space-y-2">
                <div>
                    <div className="flex justify-between text-xs text-surface-600 mb-1">
                        <span>Impact (Влияние)</span>
                        <span className="font-mono">{data.impact}/10</span>
                    </div>
                    <ProgressBar value={data.impact} color="var(--color-primary-500)" />
                </div>

                <div>
                    <div className="flex justify-between text-xs text-surface-600 mb-1">
                        <span>Confidence (Уверенность)</span>
                        <span className="font-mono">{data.confidence}/10</span>
                    </div>
                    <ProgressBar value={data.confidence} color="var(--color-primary-400)" />
                </div>

                <div>
                    <div className="flex justify-between text-xs text-surface-600 mb-1">
                        <span>Ease (Простота)</span>
                        <span className="font-mono">{data.ease}/10</span>
                    </div>
                    <ProgressBar value={data.ease} color="var(--color-accent-500)" />
                </div>
            </div>

            <p className="text-xs text-surface-600 leading-relaxed">{data.rationale}</p>
            <p className="text-xs font-medium text-surface-700">{data.recommendation}</p>
        </div>
    );
}
