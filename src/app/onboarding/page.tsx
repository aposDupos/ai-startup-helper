"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import {
    GraduationCap,
    School,
    ChevronRight,
    ChevronLeft,
    Rocket,
    Sparkles,
    AlertTriangle,
} from "lucide-react";
import { createClient } from "@/lib/supabase/client";

const INTERESTS = [
    "Технологии",
    "Образование",
    "Здоровье",
    "Еда",
    "Социальные проекты",
    "Финтех",
    "Экология",
    "Геймдев",
    "Маркетплейсы",
    "AI / ML",
    "Креативные индустрии",
    "Спорт",
];

const EXPERIENCE_LEVELS = [
    {
        value: "beginner",
        emoji: "🌱",
        label: "Новичок",
        description: "Никогда не занимался бизнесом",
    },
    {
        value: "basic",
        emoji: "💡",
        label: "Есть идеи",
        description: "Думал о стартапе, но не начинал",
    },
    {
        value: "intermediate",
        emoji: "🚀",
        label: "Есть опыт",
        description: "Пробовал запускать проекты",
    },
];

interface OnboardingData {
    role: "student" | "schoolkid" | "";
    age: string;
    city: string;
    school_or_university: string;
    experience_level: string;
    interests: string[];
    has_idea: boolean | null;
    idea_text: string;
}

export default function OnboardingPage() {
    const [step, setStep] = useState(0);
    const [isPending, startTransition] = useTransition();
    const router = useRouter();
    const [data, setData] = useState<OnboardingData>({
        role: "",
        age: "",
        city: "",
        school_or_university: "",
        experience_level: "",
        interests: [],
        has_idea: null,
        idea_text: "",
    });

    const totalSteps = 6;

    function updateData(partial: Partial<OnboardingData>) {
        setData((prev) => ({ ...prev, ...partial }));
    }

    function toggleInterest(interest: string) {
        setData((prev) => ({
            ...prev,
            interests: prev.interests.includes(interest)
                ? prev.interests.filter((i) => i !== interest)
                : [...prev.interests, interest],
        }));
    }

    function canProceed(): boolean {
        switch (step) {
            case 0:
                return data.role !== "";
            case 1:
                return data.age !== "" && data.city !== "";
            case 2:
                return true; // warning step — always can proceed
            case 3:
                return data.interests.length > 0;
            case 4:
                return data.experience_level !== "";
            case 5:
                return data.has_idea !== null;
            default:
                return true;
        }
    }

    async function handleComplete() {
        startTransition(async () => {
            const supabase = createClient();
            const {
                data: { user },
            } = await supabase.auth.getUser();

            if (!user) return;

            const age = parseInt(data.age, 10);

            await supabase
                .from("profiles")
                .update({
                    role: data.role,
                    age: isNaN(age) ? null : age,
                    city: data.city,
                    school_or_university: data.school_or_university,
                    experience_level: data.experience_level,
                    interests: data.interests,
                    onboarding_completed: true,
                    parent_consent: age >= 18,
                })
                .eq("id", user.id);

            // If user has an idea, create a project
            if (data.has_idea && data.idea_text.trim()) {
                await supabase.from("projects").insert({
                    owner_id: user.id,
                    title: data.idea_text.substring(0, 100),
                    description: data.idea_text,
                });
            }

            router.push("/dashboard");
        });
    }

    const isUnder18 = data.age !== "" && parseInt(data.age, 10) < 18;
    const showParentalWarning = step === 2 && isUnder18;

    return (
        <div className="min-h-screen flex flex-col items-center justify-center bg-surface-50 px-4 py-8">
            <div
                className="fixed inset-0 -z-10"
                style={{
                    background:
                        "radial-gradient(ellipse at top, var(--color-primary-50) 0%, transparent 50%)",
                }}
            />

            {/* Logo */}
            <div className="flex items-center gap-2 mb-6">
                <div
                    className="w-10 h-10 rounded-xl flex items-center justify-center text-white"
                    style={{
                        background:
                            "linear-gradient(135deg, var(--color-primary-500), var(--color-primary-600))",
                    }}
                >
                    <Rocket size={20} strokeWidth={1.75} />
                </div>
                <span className="text-h3 text-surface-900">
                    Startup<span className="text-primary-500">Copilot</span>
                </span>
            </div>

            {/* Step indicator */}
            <div className="flex items-center gap-2 mb-6">
                {Array.from({ length: totalSteps }).map((_, i) => (
                    <div
                        key={i}
                        className="h-1.5 rounded-full transition-all duration-300"
                        style={{
                            width: i === step ? "32px" : "12px",
                            backgroundColor:
                                i < step
                                    ? "var(--color-primary-500)"
                                    : i === step
                                        ? "var(--color-primary-400)"
                                        : "var(--color-surface-200)",
                        }}
                    />
                ))}
            </div>

            <Card className="w-full max-w-[480px] border-surface-200 shadow-md bg-surface-0">
                <CardHeader className="text-center">
                    <CardTitle className="text-h2 text-surface-900">
                        {step === 0 && "Кто ты? 🎓"}
                        {step === 1 && "Расскажи о себе 📍"}
                        {step === 2 && (isUnder18 ? "Важная информация ⚠️" : "Отлично! ✨")}
                        {step === 3 && "Что тебе интересно? 🎯"}
                        {step === 4 && "Твой опыт 💪"}
                        {step === 5 && "Есть идея стартапа? 💡"}
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div
                        className="min-h-[200px]"
                        style={{
                            animation: "fade-in 300ms ease-out",
                        }}
                        key={step}
                    >
                        {/* Step 0: Role selection */}
                        {step === 0 && (
                            <div className="grid grid-cols-2 gap-4">
                                <button
                                    type="button"
                                    onClick={() => updateData({ role: "schoolkid" })}
                                    className="p-6 rounded-xl border-2 text-center transition-all cursor-pointer hover:-translate-y-0.5"
                                    style={{
                                        borderColor:
                                            data.role === "schoolkid"
                                                ? "var(--color-primary-500)"
                                                : "var(--color-surface-200)",
                                        backgroundColor:
                                            data.role === "schoolkid"
                                                ? "var(--color-primary-50)"
                                                : "var(--color-surface-0)",
                                        boxShadow:
                                            data.role === "schoolkid"
                                                ? "var(--shadow-glow-primary)"
                                                : "none",
                                    }}
                                >
                                    <School
                                        size={32}
                                        strokeWidth={1.75}
                                        className="mx-auto mb-3"
                                        style={{
                                            color:
                                                data.role === "schoolkid"
                                                    ? "var(--color-primary-500)"
                                                    : "var(--color-surface-400)",
                                        }}
                                    />
                                    <div className="text-h4 text-surface-900">Школьник</div>
                                    <div className="text-body-sm text-surface-500 mt-1">
                                        14–17 лет
                                    </div>
                                </button>

                                <button
                                    type="button"
                                    onClick={() => updateData({ role: "student" })}
                                    className="p-6 rounded-xl border-2 text-center transition-all cursor-pointer hover:-translate-y-0.5"
                                    style={{
                                        borderColor:
                                            data.role === "student"
                                                ? "var(--color-primary-500)"
                                                : "var(--color-surface-200)",
                                        backgroundColor:
                                            data.role === "student"
                                                ? "var(--color-primary-50)"
                                                : "var(--color-surface-0)",
                                        boxShadow:
                                            data.role === "student"
                                                ? "var(--shadow-glow-primary)"
                                                : "none",
                                    }}
                                >
                                    <GraduationCap
                                        size={32}
                                        strokeWidth={1.75}
                                        className="mx-auto mb-3"
                                        style={{
                                            color:
                                                data.role === "student"
                                                    ? "var(--color-primary-500)"
                                                    : "var(--color-surface-400)",
                                        }}
                                    />
                                    <div className="text-h4 text-surface-900">Студент</div>
                                    <div className="text-body-sm text-surface-500 mt-1">
                                        18–25 лет
                                    </div>
                                </button>
                            </div>
                        )}

                        {/* Step 1: Personal info */}
                        {step === 1 && (
                            <div className="space-y-4">
                                <div className="space-y-2">
                                    <Label className="text-body-sm font-medium text-surface-700">
                                        Возраст
                                    </Label>
                                    <Input
                                        type="number"
                                        min={14}
                                        max={25}
                                        placeholder="16"
                                        value={data.age}
                                        onChange={(e) => updateData({ age: e.target.value })}
                                        className="h-11 rounded-lg border-surface-200"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label className="text-body-sm font-medium text-surface-700">
                                        Город
                                    </Label>
                                    <Input
                                        placeholder="Москва"
                                        value={data.city}
                                        onChange={(e) => updateData({ city: e.target.value })}
                                        className="h-11 rounded-lg border-surface-200"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label className="text-body-sm font-medium text-surface-700">
                                        Школа или университет
                                    </Label>
                                    <Input
                                        placeholder="МГУ / Лицей №1535"
                                        value={data.school_or_university}
                                        onChange={(e) =>
                                            updateData({ school_or_university: e.target.value })
                                        }
                                        className="h-11 rounded-lg border-surface-200"
                                    />
                                </div>
                            </div>
                        )}

                        {/* Step 2: Parental consent warning or skip */}
                        {step === 2 && (
                            <div className="space-y-4">
                                {showParentalWarning ? (
                                    <div className="p-4 rounded-xl bg-amber-50 border border-amber-200">
                                        <div className="flex items-start gap-3">
                                            <AlertTriangle
                                                size={24}
                                                className="text-amber-500 shrink-0 mt-0.5"
                                            />
                                            <div>
                                                <p className="text-h4 text-amber-800 mb-2">
                                                    Тебе меньше 18 лет
                                                </p>
                                                <p className="text-body-sm text-amber-700">
                                                    Для полного использования платформы потребуется
                                                    согласие родителя или опекуна. Мы попросим тебя указать
                                                    email родителя позже.
                                                </p>
                                                <p className="text-body-sm text-amber-600 mt-2">
                                                    Пока ты можешь продолжить знакомство с платформой! 🚀
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="text-center py-8">
                                        <Sparkles
                                            size={48}
                                            className="mx-auto mb-4 text-primary-500"
                                        />
                                        <p className="text-h3 text-surface-900 mb-2">
                                            Отлично, продолжаем!
                                        </p>
                                        <p className="text-body text-surface-500">
                                            Ещё пара вопросов, чтобы мы могли персонализировать
                                            платформу для тебя.
                                        </p>
                                    </div>
                                )}
                            </div>
                        )}

                        {/* Step 3: Interests */}
                        {step === 3 && (
                            <div className="space-y-3">
                                <p className="text-body-sm text-surface-500 mb-4">
                                    Выбери области, которые тебе интересны (можно несколько)
                                </p>
                                <div className="flex flex-wrap gap-2">
                                    {INTERESTS.map((interest) => {
                                        const selected = data.interests.includes(interest);
                                        return (
                                            <button
                                                key={interest}
                                                type="button"
                                                onClick={() => toggleInterest(interest)}
                                                className="px-4 py-2 rounded-full text-body-sm font-medium transition-all cursor-pointer"
                                                style={{
                                                    backgroundColor: selected
                                                        ? "var(--color-primary-500)"
                                                        : "var(--color-surface-100)",
                                                    color: selected
                                                        ? "#FFFFFF"
                                                        : "var(--color-text-primary)",
                                                    boxShadow: selected
                                                        ? "var(--shadow-glow-primary)"
                                                        : "none",
                                                    transform: selected ? "scale(1.05)" : "scale(1)",
                                                }}
                                            >
                                                {interest}
                                            </button>
                                        );
                                    })}
                                </div>
                            </div>
                        )}

                        {/* Step 4: Experience level */}
                        {step === 4 && (
                            <div className="space-y-3">
                                {EXPERIENCE_LEVELS.map((level) => {
                                    const selected = data.experience_level === level.value;
                                    return (
                                        <button
                                            key={level.value}
                                            type="button"
                                            onClick={() =>
                                                updateData({ experience_level: level.value })
                                            }
                                            className="w-full p-4 rounded-xl border-2 text-left transition-all cursor-pointer hover:-translate-y-0.5"
                                            style={{
                                                borderColor: selected
                                                    ? "var(--color-primary-500)"
                                                    : "var(--color-surface-200)",
                                                backgroundColor: selected
                                                    ? "var(--color-primary-50)"
                                                    : "var(--color-surface-0)",
                                            }}
                                        >
                                            <div className="flex items-center gap-3">
                                                <span className="text-2xl">{level.emoji}</span>
                                                <div>
                                                    <div className="text-h4 text-surface-900">
                                                        {level.label}
                                                    </div>
                                                    <div className="text-body-sm text-surface-500">
                                                        {level.description}
                                                    </div>
                                                </div>
                                            </div>
                                        </button>
                                    );
                                })}
                            </div>
                        )}

                        {/* Step 5: Idea */}
                        {step === 5 && (
                            <div className="space-y-4">
                                <div className="grid grid-cols-2 gap-3">
                                    <button
                                        type="button"
                                        onClick={() => updateData({ has_idea: true })}
                                        className="p-4 rounded-xl border-2 text-center transition-all cursor-pointer"
                                        style={{
                                            borderColor:
                                                data.has_idea === true
                                                    ? "var(--color-primary-500)"
                                                    : "var(--color-surface-200)",
                                            backgroundColor:
                                                data.has_idea === true
                                                    ? "var(--color-primary-50)"
                                                    : "var(--color-surface-0)",
                                        }}
                                    >
                                        <span className="text-2xl block mb-2">💡</span>
                                        <span className="text-h4 text-surface-900">Да, есть!</span>
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() =>
                                            updateData({ has_idea: false, idea_text: "" })
                                        }
                                        className="p-4 rounded-xl border-2 text-center transition-all cursor-pointer"
                                        style={{
                                            borderColor:
                                                data.has_idea === false
                                                    ? "var(--color-primary-500)"
                                                    : "var(--color-surface-200)",
                                            backgroundColor:
                                                data.has_idea === false
                                                    ? "var(--color-primary-50)"
                                                    : "var(--color-surface-0)",
                                        }}
                                    >
                                        <span className="text-2xl block mb-2">🤔</span>
                                        <span className="text-h4 text-surface-900">Пока нет</span>
                                    </button>
                                </div>
                                {data.has_idea && (
                                    <div className="space-y-2 animate-fade-in">
                                        <Label className="text-body-sm font-medium text-surface-700">
                                            Расскажи кратко о своей идее
                                        </Label>
                                        <textarea
                                            placeholder="Приложение для обмена учебниками между студентами..."
                                            value={data.idea_text}
                                            onChange={(e) =>
                                                updateData({ idea_text: e.target.value })
                                            }
                                            rows={3}
                                            className="w-full rounded-lg border border-surface-200 bg-surface-50 px-3 py-2 text-body text-surface-900 placeholder:text-surface-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent resize-none"
                                        />
                                    </div>
                                )}
                            </div>
                        )}
                    </div>

                    {/* Navigation buttons */}
                    <div className="flex justify-between mt-6 pt-4 border-t border-surface-100">
                        <Button
                            variant="ghost"
                            onClick={() => setStep((s) => Math.max(0, s - 1))}
                            disabled={step === 0}
                            className="cursor-pointer"
                        >
                            <ChevronLeft size={16} strokeWidth={1.75} />
                            Назад
                        </Button>

                        {step < totalSteps - 1 ? (
                            <Button
                                onClick={() => setStep((s) => Math.min(totalSteps - 1, s + 1))}
                                disabled={!canProceed()}
                                className="rounded-lg font-semibold text-white cursor-pointer"
                                style={{
                                    background: canProceed()
                                        ? "linear-gradient(135deg, var(--color-primary-500), var(--color-primary-600))"
                                        : "var(--color-surface-300)",
                                }}
                            >
                                Далее
                                <ChevronRight size={16} strokeWidth={1.75} />
                            </Button>
                        ) : (
                            <Button
                                onClick={handleComplete}
                                disabled={!canProceed() || isPending}
                                className="rounded-lg font-semibold text-white cursor-pointer"
                                style={{
                                    background: canProceed()
                                        ? "linear-gradient(135deg, var(--color-accent-500), var(--color-accent-600))"
                                        : "var(--color-surface-300)",
                                }}
                            >
                                {isPending ? (
                                    "Сохраняем..."
                                ) : (
                                    <>
                                        Начать! <Rocket size={16} strokeWidth={1.75} />
                                    </>
                                )}
                            </Button>
                        )}
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
