import { Users, Sparkles } from "lucide-react";
import { getMatches, getMyMatchingProfile } from "./actions";
import { MatchPageClient } from "./MatchPageClient";

export const metadata = {
    title: "Поиск со-основателя — StartupCopilot",
    description: "Найди партнёра с комплементарными навыками для своего стартапа!",
};

export default async function MatchPage() {
    const [matches, myProfile] = await Promise.all([
        getMatches(),
        getMyMatchingProfile(),
    ]);

    return (
        <div className="space-y-8">
            {/* Header */}
            <div className="animate-fade-in">
                <div className="flex items-center gap-3">
                    <Users size={28} strokeWidth={1.75} className="text-primary-500" />
                    <h1 className="text-h1 text-surface-900">Поиск со-основателя</h1>
                </div>
                <p className="text-body text-surface-500 mt-1">
                    Укажи свои навыки и найди партнёра с комплементарными скиллами
                </p>
            </div>

            <MatchPageClient
                initialMatches={matches}
                myProfile={myProfile}
            />
        </div>
    );
}
