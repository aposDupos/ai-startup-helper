"use client";

import {
    Document,
    Page,
    Text,
    View,
    StyleSheet,
    pdf,
} from "@react-pdf/renderer";
import type { PitchDeckSlides } from "@/types/pitch";
import { PITCH_SLIDES } from "@/types/pitch";

// ---------------------------------------------------------------------------
// Styles
// ---------------------------------------------------------------------------

const styles = StyleSheet.create({
    page: {
        padding: 50,
        fontFamily: "Helvetica",
        backgroundColor: "#FFFFFF",
        position: "relative",
    },
    // Cover slide
    coverPage: {
        padding: 50,
        fontFamily: "Helvetica",
        backgroundColor: "#4F46E5",
        justifyContent: "center",
        alignItems: "center",
    },
    coverTitle: {
        fontSize: 36,
        fontWeight: "bold",
        color: "#FFFFFF",
        textAlign: "center",
        marginBottom: 12,
    },
    coverSubtitle: {
        fontSize: 14,
        color: "#C7D2FE",
        textAlign: "center",
    },
    // Regular slide
    slideNumber: {
        fontSize: 10,
        color: "#A8A29E",
        marginBottom: 8,
    },
    slideEmoji: {
        fontSize: 24,
        marginBottom: 8,
    },
    slideTitle: {
        fontSize: 28,
        fontWeight: "bold",
        color: "#1C1917",
        marginBottom: 16,
    },
    slideContent: {
        fontSize: 12,
        color: "#292524",
        lineHeight: 1.6,
    },
    slideNotes: {
        position: "absolute",
        bottom: 50,
        left: 50,
        right: 50,
        paddingTop: 12,
        borderTopWidth: 1,
        borderTopColor: "#E7E5E4",
    },
    notesLabel: {
        fontSize: 8,
        color: "#A8A29E",
        marginBottom: 4,
    },
    notesText: {
        fontSize: 9,
        color: "#78716C",
        lineHeight: 1.4,
    },
    footer: {
        position: "absolute",
        bottom: 25,
        left: 50,
        right: 50,
        flexDirection: "row",
        justifyContent: "space-between",
    },
    footerText: {
        fontSize: 8,
        color: "#A8A29E",
    },
    // Accent bar
    accentBar: {
        position: "absolute",
        top: 0,
        left: 0,
        width: 6,
        height: "100%",
        backgroundColor: "#6366F1",
    },
});

// ---------------------------------------------------------------------------
// PDF Document
// ---------------------------------------------------------------------------

interface PitchPDFProps {
    projectTitle: string;
    slides: PitchDeckSlides;
}

function PitchPDFDocument({ projectTitle, slides }: PitchPDFProps) {
    const date = new Date().toLocaleDateString("ru-RU");

    return (
        <Document>
            {slides.map((slide, i) => {
                const def = PITCH_SLIDES[i];
                const isCover = i === 0;

                if (isCover) {
                    return (
                        <Page key={slide.slideKey} size="A4" style={styles.coverPage}>
                            <Text style={styles.coverTitle}>
                                {slide.content || projectTitle}
                            </Text>
                            <Text style={styles.coverSubtitle}>
                                Pitch Deck • {date}
                            </Text>
                        </Page>
                    );
                }

                return (
                    <Page key={slide.slideKey} size="A4" style={styles.page}>
                        <View style={styles.accentBar} />
                        <Text style={styles.slideNumber}>
                            {def?.emoji} Слайд {i + 1}
                        </Text>
                        <Text style={styles.slideTitle}>
                            {slide.title || def?.title || `Слайд ${i + 1}`}
                        </Text>
                        <Text style={styles.slideContent}>
                            {slide.content || "Содержание не заполнено"}
                        </Text>

                        {slide.notes && (
                            <View style={styles.slideNotes}>
                                <Text style={styles.notesLabel}>
                                    📌 Заметки спикера:
                                </Text>
                                <Text style={styles.notesText}>
                                    {slide.notes}
                                </Text>
                            </View>
                        )}

                        <View style={styles.footer}>
                            <Text style={styles.footerText}>
                                {projectTitle}
                            </Text>
                            <Text style={styles.footerText}>
                                StartupCopilot • {date}
                            </Text>
                        </View>
                    </Page>
                );
            })}
        </Document>
    );
}

// ---------------------------------------------------------------------------
// Generate PDF blob
// ---------------------------------------------------------------------------

export async function generatePitchPDF(
    projectTitle: string,
    slides: PitchDeckSlides
): Promise<Blob> {
    const blob = await pdf(
        <PitchPDFDocument projectTitle={projectTitle} slides={slides} />
    ).toBlob();
    return blob;
}
