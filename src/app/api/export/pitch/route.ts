import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import type { PitchDeckSlides } from "@/types/pitch";

export async function GET(request: NextRequest) {
    const { searchParams } = new URL(request.url);
    const projectId = searchParams.get("projectId");

    if (!projectId) {
        return NextResponse.json({ error: "projectId required" }, { status: 400 });
    }

    const supabase = await createClient();
    const {
        data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get project
    const { data: project } = await supabase
        .from("projects")
        .select("title, owner_id")
        .eq("id", projectId)
        .single();

    if (!project || project.owner_id !== user.id) {
        return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    // Get pitch deck
    const { data: deck } = await supabase
        .from("pitch_decks")
        .select("slides")
        .eq("project_id", projectId)
        .order("created_at", { ascending: false })
        .limit(1)
        .single();

    if (!deck) {
        return NextResponse.json({ error: "Pitch deck not found" }, { status: 404 });
    }

    const slides = deck.slides as unknown as PitchDeckSlides;

    // Dynamic import to avoid server-side issues with react-pdf
    const { generatePitchPDF } = await import("@/lib/export/pitch-pdf");
    const blob = await generatePitchPDF(project.title, slides);

    const arrayBuffer = await blob.arrayBuffer();

    return new NextResponse(arrayBuffer, {
        headers: {
            "Content-Type": "application/pdf",
            "Content-Disposition": `attachment; filename="pitch-deck-${project.title}.pdf"`,
        },
    });
}
