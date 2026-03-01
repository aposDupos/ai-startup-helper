import { Trophy, Flame } from "lucide-react";
import { getActiveChallenges } from "./actions";
import { ChallengeCard } from "@/components/social/ChallengeCard";

export const metadata = {
    title: "Челленджи — StartupCopilot",
    description: "Присоединяйся к недельным челленджам, соревнуйся и получай бонусный XP!",
};

export default async function ChallengesPage() {
    const challenges = await getActiveChallenges();

    return (
        <div className="space-y-8">
            {/* Header */}
            <div className="animate-fade-in">
                <div className="flex items-center gap-3">
                    <Trophy size={28} strokeWidth={1.75} className="text-accent-500" />
                    <h1 className="text-h1 text-surface-900">Челленджи</h1>
                </div>
                <p className="text-body text-surface-500 mt-1">
                    Присоединяйся к челленджам, выполняй задания и получай бонусный XP!
                </p>
            </div>

            {/* Info Banner */}
            <div
                className="p-4 rounded-xl border flex items-center gap-3"
                style={{
                    borderColor: "var(--color-accent-200)",
                    backgroundColor: "rgba(249, 115, 22, 0.05)",
                }}
            >
                <Flame size={24} strokeWidth={1.75} style={{ color: "var(--color-accent-500)" }} />
                <div>
                    <p className="text-body-sm font-semibold text-surface-900">
                        Топ-3 участника получают бонус!
                    </p>
                    <p className="text-caption text-surface-500">
                        Первые три участника, завершившие челлендж, получают дополнительный XP и эксклюзивный бейдж.
                    </p>
                </div>
            </div>

            {/* Challenges Grid */}
            {challenges.length > 0 ? (
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {challenges.map((challenge) => (
                        <ChallengeCard key={challenge.id} challenge={challenge} />
                    ))}
                </div>
            ) : (
                <div className="text-center py-16">
                    <Trophy
                        size={48}
                        strokeWidth={1.5}
                        className="mx-auto mb-4"
                        style={{ color: "var(--color-surface-300)" }}
                    />
                    <h3 className="text-h3 text-surface-500 mb-2">Нет активных челленджей</h3>
                    <p className="text-body-sm text-surface-400">
                        Новые челленджи появятся скоро — заходи позже!
                    </p>
                </div>
            )}
        </div>
    );
}
