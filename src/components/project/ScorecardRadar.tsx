"use client";

import {
    RadarChart,
    Radar,
    PolarGrid,
    PolarAngleAxis,
    PolarRadiusAxis,
    ResponsiveContainer,
    Tooltip,
} from "recharts";

interface ScorecardCriteria {
    key: string;
    label: string;
    labelShort: string;
    score: number;
}

interface ScorecardRadarProps {
    criteria: ScorecardCriteria[];
    total: number;
}

export function ScorecardRadar({ criteria, total }: ScorecardRadarProps) {
    const chartData = criteria.map((c) => ({
        name: c.labelShort,
        fullName: c.label,
        value: c.score,
    }));

    return (
        <div className="p-6 rounded-xl bg-surface-0 border border-surface-200 shadow-sm">
            <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                    <span className="text-lg">📊</span>
                    <h3 className="text-h4 text-surface-900">Startup Scorecard</h3>
                </div>
                <div
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-full"
                    style={{
                        background:
                            total >= 70
                                ? "linear-gradient(135deg, var(--color-success-400), var(--color-success-500))"
                                : total >= 40
                                    ? "linear-gradient(135deg, var(--color-accent-400), var(--color-accent-500))"
                                    : "linear-gradient(135deg, var(--color-surface-300), var(--color-surface-400))",
                    }}
                >
                    <span
                        className="text-body-sm font-bold text-white"
                        style={{ fontFamily: "var(--font-mono)" }}
                    >
                        Score: {total}/100
                    </span>
                </div>
            </div>

            <div className="w-full" style={{ height: 320 }}>
                <ResponsiveContainer width="100%" height="100%">
                    <RadarChart data={chartData} cx="50%" cy="50%" outerRadius="75%">
                        <PolarGrid
                            stroke="var(--color-surface-200)"
                            strokeDasharray="3 3"
                        />
                        <PolarAngleAxis
                            dataKey="name"
                            tick={{
                                fill: "var(--color-text-secondary)",
                                fontSize: 12,
                                fontFamily: "var(--font-body)",
                            }}
                        />
                        <PolarRadiusAxis
                            angle={90}
                            domain={[0, 100]}
                            tick={{
                                fill: "var(--color-text-tertiary)",
                                fontSize: 10,
                            }}
                            tickCount={5}
                        />
                        <Radar
                            name="Score"
                            dataKey="value"
                            stroke="var(--color-primary-500)"
                            fill="var(--color-primary-400)"
                            fillOpacity={0.25}
                            strokeWidth={2}
                        />
                        <Tooltip
                            content={({ payload }) => {
                                if (!payload || payload.length === 0) return null;
                                const item = payload[0].payload;
                                return (
                                    <div className="px-3 py-2 rounded-lg bg-surface-900 text-white text-caption shadow-lg">
                                        <div className="font-semibold">{item.fullName}</div>
                                        <div style={{ fontFamily: "var(--font-mono)" }}>
                                            {item.value}/100
                                        </div>
                                    </div>
                                );
                            }}
                        />
                    </RadarChart>
                </ResponsiveContainer>
            </div>

            {/* Criteria list */}
            <div className="grid grid-cols-2 gap-2 mt-4">
                {criteria.map((c) => (
                    <div
                        key={c.key}
                        className="flex items-center justify-between px-3 py-2 rounded-lg bg-surface-50"
                    >
                        <span className="text-caption text-surface-600 truncate">
                            {c.label}
                        </span>
                        <span
                            className="text-caption font-bold ml-2"
                            style={{
                                fontFamily: "var(--font-mono)",
                                color:
                                    c.score >= 70
                                        ? "var(--color-success-500)"
                                        : c.score >= 40
                                            ? "var(--color-accent-500)"
                                            : "var(--color-surface-400)",
                            }}
                        >
                            {c.score}
                        </span>
                    </div>
                ))}
            </div>
        </div>
    );
}
