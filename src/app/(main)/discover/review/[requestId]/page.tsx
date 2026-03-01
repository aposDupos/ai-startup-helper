import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { ArrowLeft, MessageSquare, User } from "lucide-react";
import Link from "next/link";
import { getReviewRequest } from "@/app/(main)/discover/review-actions";
import { ReviewForm } from "@/components/social/ReviewForm";

export default async function ReviewPage({
    params,
}: {
    params: Promise<{ requestId: string }>;
}) {
    const { requestId } = await params;
    const supabase = await createClient();
    const {
        data: { user },
    } = await supabase.auth.getUser();

    if (!user) redirect("/login");

    const request = await getReviewRequest(requestId);

    if (!request || !request.project) {
        return (
            <div className="text-center py-16">
                <h2 className="text-h2 text-surface-900 mb-2">Запрос не найден</h2>
                <p className="text-body text-surface-500 mb-4">
                    Возможно, запрос был закрыт или удалён.
                </p>
                <Link
                    href="/discover"
                    className="text-primary-500 hover:text-primary-600 text-body-sm font-medium"
                >
                    ← Вернуться в галерею
                </Link>
            </div>
        );
    }

    const isOwnProject = request.author_id === user.id;
    const project = request.project;

    // Determine artifact data
    let artifactData: Record<string, unknown> = {};
    if (request.artifact_type === "bmc" && project.bmc_data) {
        artifactData = project.bmc_data as Record<string, unknown>;
    } else if (request.artifact_type === "vpc" && project.vpc_data) {
        artifactData = project.vpc_data as Record<string, unknown>;
    } else if (request.artifact_type === "pitch" && project.artifacts) {
        const artifacts = project.artifacts as Record<string, unknown>;
        // Pitch data comes from artifacts
        artifactData = (artifacts.pitch_deck || {}) as Record<string, unknown>;
    }

    const artifactLabel =
        request.artifact_type === "bmc"
            ? "Business Model Canvas"
            : request.artifact_type === "vpc"
                ? "Value Proposition Canvas"
                : "Pitch Deck";

    // If own project, show received reviews
    if (isOwnProject) {
        const { data: reviews } = await supabase
            .from("reviews")
            .select(`
                *,
                reviewer:profiles!reviews_reviewer_id_fkey(display_name)
            `)
            .eq("request_id", requestId)
            .order("created_at", { ascending: false });

        return (
            <div className="space-y-6">
                {/* Back navigation */}
                <Link
                    href="/discover"
                    className="flex items-center gap-1.5 text-body-sm text-surface-500 hover:text-primary-500 transition-colors"
                >
                    <ArrowLeft size={16} strokeWidth={1.75} />
                    Назад в галерею
                </Link>

                {/* Header */}
                <div>
                    <h1 className="text-h1 text-surface-900">
                        Ревью: {artifactLabel}
                    </h1>
                    <p className="text-body text-surface-500 mt-1">
                        Проект «{project.title}»
                    </p>
                </div>

                {/* Reviews received */}
                {reviews && reviews.length > 0 ? (
                    <div className="space-y-4">
                        {reviews.map((review) => {
                            const comments = (review.comments as { block: string; text: string }[]) || [];
                            const reviewer = Array.isArray(review.reviewer)
                                ? review.reviewer[0]
                                : review.reviewer;
                            return (
                                <div
                                    key={review.id}
                                    className="p-5 rounded-xl bg-surface-0 border border-surface-200 shadow-sm space-y-3"
                                >
                                    <div className="flex items-center gap-2">
                                        <User size={16} strokeWidth={1.75} className="text-surface-400" />
                                        <span className="text-body-sm font-medium text-surface-900">
                                            {reviewer?.display_name || "Рецензент"}
                                        </span>
                                        <span className="text-caption text-surface-400">
                                            ⭐ {review.rating}/5
                                        </span>
                                    </div>
                                    {comments.map((c, i) => (
                                        <div key={i} className="p-3 rounded-lg bg-surface-50 border border-surface-100">
                                            <p className="text-caption font-medium text-surface-500 mb-1">
                                                {c.block}
                                            </p>
                                            <p className="text-body-sm text-surface-700">{c.text}</p>
                                        </div>
                                    ))}
                                </div>
                            );
                        })}
                    </div>
                ) : (
                    <div className="text-center py-12 rounded-xl bg-surface-0 border border-surface-200 shadow-sm">
                        <MessageSquare
                            size={40}
                            strokeWidth={1.25}
                            className="mx-auto text-surface-300 mb-3"
                        />
                        <p className="text-body text-surface-500">
                            Пока никто не оставил ревью
                        </p>
                    </div>
                )}
            </div>
        );
    }

    // Reviewer view
    return (
        <div className="space-y-6">
            {/* Back navigation */}
            <Link
                href="/discover"
                className="flex items-center gap-1.5 text-body-sm text-surface-500 hover:text-primary-500 transition-colors"
            >
                <ArrowLeft size={16} strokeWidth={1.75} />
                Назад в галерею
            </Link>

            {/* Header */}
            <div>
                <h1 className="text-h1 text-surface-900">
                    Ревью: {artifactLabel}
                </h1>
                <p className="text-body text-surface-500 mt-1">
                    Проект «{project.title}» — автор:{" "}
                    {(project.owner && typeof project.owner === "object" && "display_name" in project.owner)
                        ? (project.owner as { display_name: string }).display_name
                        : "Аноним"}
                </p>
            </div>

            {/* Review Form */}
            <ReviewForm
                requestId={requestId}
                artifactType={request.artifact_type}
                artifactData={artifactData}
            />
        </div>
    );
}
