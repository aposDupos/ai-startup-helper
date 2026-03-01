import { createClient } from "@/lib/supabase/server";
import { MessageSquareText } from "lucide-react";
import Link from "next/link";

export async function ReviewNotifications() {
    const supabase = await createClient();
    const {
        data: { user },
    } = await supabase.auth.getUser();
    if (!user) return null;

    const { data: projects } = await supabase
        .from("projects")
        .select("id")
        .eq("owner_id", user.id)
        .eq("is_active", true)
        .limit(1);

    const activeProject = projects?.[0];
    if (!activeProject) return null;

    const { data: requests } = await supabase
        .from("review_requests")
        .select("id, artifact_type")
        .eq("project_id", activeProject.id)
        .eq("author_id", user.id)
        .in("status", ["reviewed", "open"]);

    if (!requests || requests.length === 0) return null;

    const requestIds = requests.map((r) => r.id);
    const { data: reviews } = await supabase
        .from("reviews")
        .select("request_id")
        .in("request_id", requestIds);

    const countMap = new Map<string, number>();
    for (const r of reviews || []) {
        countMap.set(r.request_id, (countMap.get(r.request_id) || 0) + 1);
    }

    const notifications = requests
        .filter((r) => (countMap.get(r.id) || 0) > 0)
        .map((r) => ({
            id: r.id,
            artifact_type: r.artifact_type,
            reviewCount: countMap.get(r.id) || 0,
        }));

    if (notifications.length === 0) return null;

    return (
        <div className="animate-fade-in space-y-2">
            {notifications.map((notif) => {
                const artifactLabel =
                    notif.artifact_type === "bmc"
                        ? "BMC"
                        : notif.artifact_type === "vpc"
                            ? "VPC"
                            : "Pitch";
                return (
                    <Link
                        key={notif.id}
                        href={`/discover/review/${notif.id}`}
                        className="flex items-center gap-3 p-4 rounded-xl border border-primary-200 bg-primary-50/50 hover:bg-primary-50 transition-colors shadow-sm group"
                    >
                        <div className="w-10 h-10 rounded-full bg-primary-100 flex items-center justify-center">
                            <MessageSquareText
                                size={20}
                                strokeWidth={1.75}
                                className="text-primary-600"
                            />
                        </div>
                        <div className="flex-1">
                            <p className="text-body-sm font-semibold text-surface-900">
                                У вас {notif.reviewCount}{" "}
                                {notif.reviewCount === 1
                                    ? "новое ревью"
                                    : "новых ревью"}{" "}
                                на {artifactLabel}
                            </p>
                            <p className="text-caption text-surface-500">
                                Посмотрите, что написали коллеги
                            </p>
                        </div>
                        <span className="text-body-sm font-medium text-primary-500 group-hover:text-primary-600 transition-colors">
                            Открыть →
                        </span>
                    </Link>
                );
            })}
        </div>
    );
}
