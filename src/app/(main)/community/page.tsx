import { MessagesSquare } from "lucide-react";
import { getDiscussions } from "./actions";
import { CommunityClient } from "./CommunityClient";

export const metadata = {
    title: "Сообщество — StartupCopilot",
    description: "Обсуждай идеи, делись опытом и получай советы от других предпринимателей!",
};

export default async function CommunityPage({
    searchParams,
}: {
    searchParams: Promise<{ stage?: string; page?: string }>;
}) {
    const params = await searchParams;
    const stage = params?.stage || "all";
    const page = Number(params?.page) || 1;

    const { discussions, totalPages } = await getDiscussions(stage, page);

    return (
        <div className="space-y-8">
            {/* Header */}
            <div className="animate-fade-in">
                <div className="flex items-center gap-3">
                    <MessagesSquare size={28} strokeWidth={1.75} className="text-primary-500" />
                    <h1 className="text-h1 text-surface-900">Сообщество</h1>
                </div>
                <p className="text-body text-surface-500 mt-1">
                    Обсуждай идеи, делись опытом и помогай другим предпринимателям!
                </p>
            </div>

            <CommunityClient
                initialDiscussions={discussions}
                totalPages={totalPages}
                currentPage={page}
                currentStage={stage}
            />
        </div>
    );
}
