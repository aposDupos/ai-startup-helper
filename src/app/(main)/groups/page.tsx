import { Users } from "lucide-react";
import { getMyGroups } from "./actions";
import { GroupsClient } from "./GroupsClient";

export const metadata = {
    title: "Study Groups — StartupCopilot",
    description: "Создай или вступи в группу и проходи стартап-стадии вместе!",
};

export default async function GroupsPage({
    searchParams,
}: {
    searchParams: Promise<{ join?: string }>;
}) {
    const params = await searchParams;
    const joinCode = params?.join || null;
    const groups = await getMyGroups();

    return (
        <div className="space-y-8">
            {/* Header */}
            <div className="animate-fade-in">
                <div className="flex items-center gap-3">
                    <Users size={28} strokeWidth={1.75} className="text-primary-500" />
                    <h1 className="text-h1 text-surface-900">Study Groups</h1>
                </div>
                <p className="text-body text-surface-500 mt-1">
                    Создай группу из 5–7 человек и проходите стартап-стадии вместе!
                </p>
            </div>

            <GroupsClient
                initialGroups={groups}
                joinCode={joinCode}
            />
        </div>
    );
}
