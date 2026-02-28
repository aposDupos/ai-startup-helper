import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { PitchDeckWizard } from "@/components/workspace/PitchDeckWizard";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import type { PitchDeckSlides } from "@/types/pitch";
import { createEmptySlides } from "@/types/pitch";

export default async function PitchPage() {
    const supabase = await createClient();
    const {
        data: { user },
    } = await supabase.auth.getUser();

    if (!user) redirect("/auth/login");

    const { data: projects } = await supabase
        .from("projects")
        .select("id, title, description")
        .eq("owner_id", user.id)
        .eq("is_active", true)
        .limit(1);

    const project = projects?.[0];
    if (!project) redirect("/dashboard");

    // Load or create pitch deck
    const { data: existingDeck } = await supabase
        .from("pitch_decks")
        .select("id, slides, template")
        .eq("project_id", project.id)
        .order("created_at", { ascending: false })
        .limit(1)
        .single();

    let deckId: string;
    let slides: PitchDeckSlides;

    if (existingDeck) {
        deckId = existingDeck.id;
        slides = existingDeck.slides as unknown as PitchDeckSlides;
    } else {
        slides = createEmptySlides();
        const { data: newDeck, error } = await supabase
            .from("pitch_decks")
            .insert({
                project_id: project.id,
                slides: slides as unknown as Record<string, unknown>[],
            })
            .select("id")
            .single();

        if (error) redirect("/dashboard");
        deckId = newDeck.id;
    }

    return (
        <div className="space-y-6">
            {/* Back navigation */}
            <div className="flex items-center gap-3">
                <Link
                    href="/dashboard"
                    className="flex items-center gap-1.5 text-body-sm text-surface-500 hover:text-primary-500 transition-colors"
                >
                    <ArrowLeft size={16} strokeWidth={1.75} />
                    Назад к карте
                </Link>
            </div>

            {/* Header */}
            <div>
                <h1 className="text-h1 text-surface-900">
                    🎤 Pitch Deck
                </h1>
                <p className="text-body text-surface-500 mt-1">
                    Создай убедительный питч-дек для проекта «{project.title}»
                </p>
            </div>

            {/* Wizard */}
            <PitchDeckWizard
                deckId={deckId}
                projectId={project.id}
                projectTitle={project.title}
                initialSlides={slides}
            />
        </div>
    );
}
