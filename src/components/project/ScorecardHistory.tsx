"use client";

import {
    LineChart,
    Line,
    XAxis,
    YAxis,
    Tooltip,
    ResponsiveContainer,
    CartesianGrid,
} from "recharts";
import { TrendingUp } from "lucide-react";

interface HistoryEntry {
    score: number;
    created_at: string;
}

interface ScorecardHistoryProps {
    history: HistoryEntry[];
}

export function ScorecardHistory({ history }: ScorecardHistoryProps) {
    if (history.length < 2) {
        return (
            <div className="p-6 rounded-xl bg-surface-0 border border-surface-200 shadow-sm">
                <div className="flex items-center gap-2 mb-3">
                    <span className="text-lg">📈</span>
                    <h3 className="text-h4 text-surface-900">Динамика Score</h3>
                </div>
                <p className="text-body-sm text-surface-400">
                    Продолжай работу — график появится после нескольких обновлений Score.
                </p>
            </div>
        );
    }

    // Format chart data
    const chartData = history.map((entry) => ({
        date: new Date(entry.created_at).toLocaleDateString("ru-RU", {
            day: "numeric",
            month: "short",
        }),
        score: entry.score,
    }));

    // Motivational message
    const firstScore = history[0].score;
    const lastScore = history[history.length - 1].score;
    const diff = lastScore - firstScore;
    const firstDate = new Date(history[0].created_at);
    const daysDiff = Math.round(
        (Date.now() - firstDate.getTime()) / (1000 * 60 * 60 * 24)
    );

    let timeLabel: string;
    if (daysDiff <= 1) timeLabel = "Вчера";
    else if (daysDiff <= 7) timeLabel = `${daysDiff} дн. назад`;
    else if (daysDiff <= 30) timeLabel = `${Math.round(daysDiff / 7)} нед. назад`;
    else timeLabel = `${Math.round(daysDiff / 30)} мес. назад`;

    return (
        <div className="p-6 rounded-xl bg-surface-0 border border-surface-200 shadow-sm">
            <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                    <span className="text-lg">📈</span>
                    <h3 className="text-h4 text-surface-900">Динамика Score</h3>
                </div>
                {diff > 0 && (
                    <div className="flex items-center gap-1.5 text-success-500">
                        <TrendingUp size={16} strokeWidth={1.75} />
                        <span
                            className="text-body-sm font-bold"
                            style={{ fontFamily: "var(--font-mono)" }}
                        >
                            +{diff}
                        </span>
                    </div>
                )}
            </div>

            {/* Motivational message */}
            <div
                className="px-4 py-3 rounded-lg mb-4"
                style={{
                    background:
                        diff > 0
                            ? "linear-gradient(135deg, rgba(74, 222, 128, 0.1), rgba(34, 197, 94, 0.1))"
                            : "var(--color-surface-50)",
                }}
            >
                <p className="text-body-sm text-surface-700">
                    {diff > 0 ? (
                        <>
                            {timeLabel}:{" "}
                            <span
                                className="font-bold"
                                style={{ fontFamily: "var(--font-mono)" }}
                            >
                                {firstScore}
                            </span>{" "}
                            → Сейчас:{" "}
                            <span
                                className="font-bold"
                                style={{
                                    fontFamily: "var(--font-mono)",
                                    color: "var(--color-success-500)",
                                }}
                            >
                                {lastScore}
                            </span>{" "}
                            <span
                                className="font-bold"
                                style={{
                                    fontFamily: "var(--font-mono)",
                                    color: "var(--color-success-500)",
                                }}
                            >
                                (+{diff})
                            </span>{" "}
                            🚀
                        </>
                    ) : diff === 0 ? (
                        "Score стабилен — продолжай заполнять данные проекта!"
                    ) : (
                        <>
                            Score немного снизился. Это нормально — пересмотри стратегию и
                            двигайся дальше! 💪
                        </>
                    )}
                </p>
            </div>

            {/* Chart */}
            <div className="w-full" style={{ height: 200 }}>
                <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={chartData}>
                        <CartesianGrid
                            strokeDasharray="3 3"
                            stroke="var(--color-surface-100)"
                        />
                        <XAxis
                            dataKey="date"
                            tick={{
                                fill: "var(--color-text-tertiary)",
                                fontSize: 11,
                            }}
                            axisLine={{ stroke: "var(--color-surface-200)" }}
                        />
                        <YAxis
                            domain={[0, 100]}
                            tick={{
                                fill: "var(--color-text-tertiary)",
                                fontSize: 11,
                            }}
                            axisLine={{ stroke: "var(--color-surface-200)" }}
                            width={30}
                        />
                        <Tooltip
                            content={({ payload }) => {
                                if (!payload || payload.length === 0) return null;
                                const item = payload[0].payload;
                                return (
                                    <div className="px-3 py-2 rounded-lg bg-surface-900 text-white text-caption shadow-lg">
                                        <div>{item.date}</div>
                                        <div
                                            className="font-bold"
                                            style={{ fontFamily: "var(--font-mono)" }}
                                        >
                                            Score: {item.score}
                                        </div>
                                    </div>
                                );
                            }}
                        />
                        <Line
                            type="monotone"
                            dataKey="score"
                            stroke="var(--color-primary-500)"
                            strokeWidth={2.5}
                            dot={{
                                fill: "var(--color-primary-500)",
                                r: 4,
                                strokeWidth: 2,
                                stroke: "var(--color-surface-0)",
                            }}
                            activeDot={{
                                fill: "var(--color-primary-600)",
                                r: 6,
                                strokeWidth: 2,
                                stroke: "var(--color-surface-0)",
                            }}
                        />
                    </LineChart>
                </ResponsiveContainer>
            </div>
        </div>
    );
}
