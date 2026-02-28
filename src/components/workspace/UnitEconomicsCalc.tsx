"use client";

import { useState, useCallback, useRef, useEffect } from "react";
import { motion } from "framer-motion";
import { Save, Check, TrendingUp, TrendingDown, AlertTriangle } from "lucide-react";
import { saveUnitEconomics } from "@/app/(main)/workspace/unit-economics/actions";
import {
    type UnitEconomicsData,
    calculateUnitEconomics,
    createEmptyUnitEconomics,
} from "@/types/workspace";

interface UnitEconomicsCalcProps {
    projectId: string;
    initialData: UnitEconomicsData;
}

const FIELDS = [
    {
        key: "cac" as const,
        label: "CAC",
        fullLabel: "Customer Acquisition Cost",
        description: "Стоимость привлечения одного клиента",
        unit: "₽",
        placeholder: "5000",
    },
    {
        key: "arpu" as const,
        label: "ARPU",
        fullLabel: "Average Revenue Per User",
        description: "Средний доход с пользователя в месяц",
        unit: "₽/мес",
        placeholder: "990",
    },
    {
        key: "churn" as const,
        label: "Churn Rate",
        fullLabel: "Отток клиентов",
        description: "Доля клиентов, уходящих за месяц",
        unit: "%",
        placeholder: "5",
    },
];

export function UnitEconomicsCalc({
    projectId,
    initialData,
}: UnitEconomicsCalcProps) {
    const [data, setData] = useState<UnitEconomicsData>(() => ({
        ...createEmptyUnitEconomics(),
        ...initialData,
    }));
    const [saveStatus, setSaveStatus] = useState<"idle" | "saving" | "saved">(
        "idle"
    );
    const saveTimeoutRef = useRef<NodeJS.Timeout | null>(null);

    const calculated = calculateUnitEconomics(data);

    const triggerSave = useCallback(
        (newData: UnitEconomicsData) => {
            if (saveTimeoutRef.current) clearTimeout(saveTimeoutRef.current);
            setSaveStatus("saving");
            saveTimeoutRef.current = setTimeout(async () => {
                try {
                    await saveUnitEconomics(projectId, {
                        ...newData,
                        ltv: calculated.ltv,
                        payback_period: calculated.payback_period,
                    });
                    setSaveStatus("saved");
                    setTimeout(() => setSaveStatus("idle"), 2000);
                } catch {
                    setSaveStatus("idle");
                }
            }, 800);
        },
        [projectId, calculated.ltv, calculated.payback_period]
    );

    useEffect(() => {
        return () => {
            if (saveTimeoutRef.current) clearTimeout(saveTimeoutRef.current);
        };
    }, []);

    const handleChange = (key: keyof UnitEconomicsData, value: string) => {
        const numValue = value === "" ? null : parseFloat(value);
        const updated = { ...data, [key]: numValue };
        setData(updated);
        triggerSave(updated);
    };

    const healthColor =
        calculated.health === "good"
            ? "var(--color-success-500)"
            : calculated.health === "warning"
                ? "var(--color-accent-500)"
                : calculated.health === "danger"
                    ? "#EF4444"
                    : "var(--color-surface-400)";

    const healthLabel =
        calculated.health === "good"
            ? "Отлично"
            : calculated.health === "warning"
                ? "Требует внимания"
                : calculated.health === "danger"
                    ? "Опасно"
                    : "Недостаточно данных";

    return (
        <div className="space-y-6">
            {/* Save status */}
            <div className="flex items-center gap-3">
                {saveStatus === "saving" && (
                    <span className="flex items-center gap-1 text-caption text-surface-400">
                        <Save size={12} className="animate-pulse" />
                        Сохраняю...
                    </span>
                )}
                {saveStatus === "saved" && (
                    <motion.span
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="flex items-center gap-1 text-caption text-success-500"
                    >
                        <Check size={12} />
                        Сохранено
                    </motion.span>
                )}
            </div>

            {/* Input fields */}
            <div className="grid md:grid-cols-3 gap-4">
                {FIELDS.map((field) => (
                    <motion.div
                        key={field.key}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: FIELDS.indexOf(field) * 0.1 }}
                        className="p-5 rounded-xl bg-surface-0 border border-surface-200 shadow-xs"
                    >
                        <div className="flex items-center justify-between mb-1">
                            <h3
                                className="text-h4 text-surface-900"
                                style={{ fontFamily: "var(--font-heading)" }}
                            >
                                {field.label}
                            </h3>
                            <span className="text-caption text-surface-400">
                                {field.unit}
                            </span>
                        </div>
                        <p className="text-caption text-surface-500 mb-3">
                            {field.description}
                        </p>
                        <input
                            type="number"
                            value={data[field.key] ?? ""}
                            onChange={(e) =>
                                handleChange(field.key, e.target.value)
                            }
                            placeholder={field.placeholder}
                            className="w-full px-3 py-2.5 rounded-lg border border-surface-200 bg-surface-50 text-body text-surface-900 outline-none focus:border-primary-400 focus:ring-2 focus:ring-primary-100 transition-all"
                            style={{ fontFamily: "var(--font-mono)" }}
                        />
                        <p className="text-caption text-surface-400 mt-1.5">
                            {field.fullLabel}
                        </p>
                    </motion.div>
                ))}
            </div>

            {/* Calculated metrics */}
            <div className="grid md:grid-cols-3 gap-4">
                {/* LTV */}
                <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                    className="p-5 rounded-xl bg-surface-0 border border-surface-200 shadow-xs"
                >
                    <h3 className="text-caption font-semibold text-surface-500 mb-1">
                        LTV (Lifetime Value)
                    </h3>
                    <p
                        className="text-h2 text-surface-900"
                        style={{ fontFamily: "var(--font-mono)" }}
                    >
                        {calculated.ltv != null
                            ? `${Math.round(calculated.ltv).toLocaleString("ru-RU")} ₽`
                            : "—"}
                    </p>
                    <p className="text-caption text-surface-400 mt-1">
                        ARPU / Churn Rate
                    </p>
                </motion.div>

                {/* Payback Period */}
                <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4 }}
                    className="p-5 rounded-xl bg-surface-0 border border-surface-200 shadow-xs"
                >
                    <h3 className="text-caption font-semibold text-surface-500 mb-1">
                        Payback Period
                    </h3>
                    <p
                        className="text-h2 text-surface-900"
                        style={{ fontFamily: "var(--font-mono)" }}
                    >
                        {calculated.payback_period != null
                            ? `${calculated.payback_period.toFixed(1)} мес`
                            : "—"}
                    </p>
                    <p className="text-caption text-surface-400 mt-1">
                        CAC / ARPU
                    </p>
                </motion.div>

                {/* LTV/CAC Ratio */}
                <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.5 }}
                    className="p-5 rounded-xl border shadow-xs"
                    style={{
                        backgroundColor:
                            calculated.health === "good"
                                ? "rgba(34, 197, 94, 0.05)"
                                : calculated.health === "warning"
                                    ? "rgba(249, 115, 22, 0.05)"
                                    : calculated.health === "danger"
                                        ? "rgba(239, 68, 68, 0.05)"
                                        : "var(--color-surface-0)",
                        borderColor:
                            calculated.health === "unknown"
                                ? "var(--color-surface-200)"
                                : healthColor,
                    }}
                >
                    <div className="flex items-center justify-between mb-1">
                        <h3 className="text-caption font-semibold text-surface-500">
                            LTV/CAC Ratio
                        </h3>
                        {calculated.health === "good" && (
                            <TrendingUp
                                size={16}
                                style={{ color: healthColor }}
                            />
                        )}
                        {calculated.health === "warning" && (
                            <AlertTriangle
                                size={16}
                                style={{ color: healthColor }}
                            />
                        )}
                        {calculated.health === "danger" && (
                            <TrendingDown
                                size={16}
                                style={{ color: healthColor }}
                            />
                        )}
                    </div>
                    <p
                        className="text-h2"
                        style={{
                            fontFamily: "var(--font-mono)",
                            color: healthColor,
                        }}
                    >
                        {calculated.ltv_cac_ratio != null
                            ? `${calculated.ltv_cac_ratio.toFixed(1)}x`
                            : "—"}
                    </p>
                    <p className="text-caption mt-1" style={{ color: healthColor }}>
                        {healthLabel}
                    </p>

                    {/* Visual bar */}
                    {calculated.ltv_cac_ratio != null && (
                        <div className="mt-3">
                            <div className="w-full h-2 rounded-full bg-surface-100 overflow-hidden">
                                <motion.div
                                    className="h-full rounded-full"
                                    style={{
                                        backgroundColor: healthColor,
                                    }}
                                    initial={{ width: 0 }}
                                    animate={{
                                        width: `${Math.min((calculated.ltv_cac_ratio / 5) * 100, 100)}%`,
                                    }}
                                    transition={{
                                        duration: 0.8,
                                        ease: "easeOut",
                                    }}
                                />
                            </div>
                            <div className="flex justify-between mt-1">
                                <span className="text-caption text-surface-400">
                                    0x
                                </span>
                                <span className="text-caption text-surface-400">
                                    3x (хорошо)
                                </span>
                                <span className="text-caption text-surface-400">
                                    5x+
                                </span>
                            </div>
                        </div>
                    )}
                </motion.div>
            </div>

            {/* Tips */}
            <div className="p-4 rounded-xl bg-primary-50/50 border border-primary-100">
                <h3 className="text-body-sm font-semibold text-primary-700 mb-2">
                    💡 Как интерпретировать
                </h3>
                <ul className="space-y-1 text-caption text-primary-600">
                    <li>
                        <strong>LTV/CAC ≥ 3x</strong> — здоровая бизнес-модель,
                        можно масштабировать
                    </li>
                    <li>
                        <strong>LTV/CAC 1-3x</strong> — бизнес работает, но
                        нужно оптимизировать
                    </li>
                    <li>
                        <strong>LTV/CAC &lt; 1x</strong> — бизнес теряет деньги на
                        каждом клиенте
                    </li>
                    <li>
                        <strong>Payback Period &lt; 12 мес</strong> — инвестиции
                        окупаются быстро
                    </li>
                </ul>
            </div>
        </div>
    );
}
