"use client";

import {
    Document,
    Page,
    Text,
    View,
    StyleSheet,
    pdf,
} from "@react-pdf/renderer";
import type { BMCData, BMCBlockDefinition } from "@/types/workspace";
import { BMC_BLOCKS } from "@/types/workspace";

// ---------------------------------------------------------------------------
// Styles
// ---------------------------------------------------------------------------

const styles = StyleSheet.create({
    page: {
        padding: 30,
        fontFamily: "Helvetica",
        backgroundColor: "#FAFAF9",
    },
    title: {
        fontSize: 22,
        fontWeight: "bold",
        color: "#1C1917",
        marginBottom: 4,
    },
    subtitle: {
        fontSize: 10,
        color: "#78716C",
        marginBottom: 20,
    },
    grid: {
        flexDirection: "row",
        flexWrap: "wrap",
        gap: 6,
    },
    blockFull: {
        width: "19%",
        minHeight: 120,
        borderWidth: 1,
        borderColor: "#E7E5E4",
        borderRadius: 6,
        backgroundColor: "#FFFFFF",
        padding: 8,
    },
    blockHalf: {
        width: "49%",
        minHeight: 80,
        borderWidth: 1,
        borderColor: "#E7E5E4",
        borderRadius: 6,
        backgroundColor: "#FFFFFF",
        padding: 8,
    },
    blockHeader: {
        flexDirection: "row",
        alignItems: "center",
        marginBottom: 6,
        borderBottomWidth: 1,
        borderBottomColor: "#F5F5F4",
        paddingBottom: 4,
    },
    blockEmoji: {
        fontSize: 10,
        marginRight: 4,
    },
    blockTitle: {
        fontSize: 7,
        fontWeight: "bold",
        color: "#1C1917",
    },
    note: {
        backgroundColor: "#FEF3C7",
        borderRadius: 3,
        padding: 4,
        marginBottom: 3,
    },
    noteText: {
        fontSize: 7,
        color: "#292524",
        lineHeight: 1.3,
    },
    emptyText: {
        fontSize: 7,
        color: "#A8A29E",
        fontStyle: "italic",
    },
    footer: {
        position: "absolute",
        bottom: 20,
        left: 30,
        right: 30,
        flexDirection: "row",
        justifyContent: "space-between",
        borderTopWidth: 1,
        borderTopColor: "#E7E5E4",
        paddingTop: 8,
    },
    footerText: {
        fontSize: 7,
        color: "#A8A29E",
    },
});

// ---------------------------------------------------------------------------
// BMC PDF Document
// ---------------------------------------------------------------------------

interface BMCPDFProps {
    projectTitle: string;
    bmcData: BMCData;
}

function BMCBlockPDF({
    block,
    notes,
    style,
}: {
    block: BMCBlockDefinition;
    notes: BMCData[keyof BMCData];
    style: ReturnType<typeof StyleSheet.create>[string];
}) {
    return (
        <View style={style}>
            <View style={styles.blockHeader}>
                <Text style={styles.blockEmoji}>{block.emoji}</Text>
                <Text style={styles.blockTitle}>{block.label}</Text>
            </View>
            {notes.length > 0 ? (
                notes.map((note) => (
                    <View key={note.id} style={styles.note}>
                        <Text style={styles.noteText}>{note.text}</Text>
                    </View>
                ))
            ) : (
                <Text style={styles.emptyText}>Пока пусто</Text>
            )}
        </View>
    );
}

function BMCPDFDocument({ projectTitle, bmcData }: BMCPDFProps) {
    // BMC grid: top row = 5 blocks, bottom row = 2 half-width blocks
    const topRow: BMCBlockDefinition[] = BMC_BLOCKS.filter((b) =>
        ["key_partnerships", "key_activities", "value_propositions", "customer_relationships", "customer_segments"].includes(b.key)
    );
    const midRow: BMCBlockDefinition[] = BMC_BLOCKS.filter((b) =>
        ["key_resources", "channels"].includes(b.key)
    );
    const bottomRow: BMCBlockDefinition[] = BMC_BLOCKS.filter((b) =>
        ["cost_structure", "revenue_streams"].includes(b.key)
    );

    return (
        <Document>
            <Page size="A4" orientation="landscape" style={styles.page}>
                <Text style={styles.title}>Business Model Canvas</Text>
                <Text style={styles.subtitle}>
                    Проект: {projectTitle} • Дата:{" "}
                    {new Date().toLocaleDateString("ru-RU")}
                </Text>

                {/* Top row */}
                <View style={styles.grid}>
                    {topRow.map((block) => (
                        <BMCBlockPDF
                            key={block.key}
                            block={block}
                            notes={bmcData[block.key] || []}
                            style={styles.blockFull}
                        />
                    ))}
                </View>

                {/* Bottom row */}
                <View style={[styles.grid, { marginTop: 6 }]}>
                    {bottomRow.map((block) => (
                        <BMCBlockPDF
                            key={block.key}
                            block={block}
                            notes={bmcData[block.key] || []}
                            style={styles.blockHalf}
                        />
                    ))}
                </View>

                {/* Footer */}
                <View style={styles.footer}>
                    <Text style={styles.footerText}>
                        StartupCopilot — AI-наставник
                    </Text>
                    <Text style={styles.footerText}>
                        {new Date().toLocaleDateString("ru-RU")}
                    </Text>
                </View>
            </Page>
        </Document>
    );
}

// ---------------------------------------------------------------------------
// Generate PDF blob
// ---------------------------------------------------------------------------

export async function generateBMCPDF(
    projectTitle: string,
    bmcData: BMCData
): Promise<Blob> {
    const blob = await pdf(
        <BMCPDFDocument
            projectTitle={projectTitle}
            bmcData={bmcData}
        />
    ).toBlob();
    return blob;
}

// ---------------------------------------------------------------------------
// Download helper
// ---------------------------------------------------------------------------

export function downloadBlob(blob: Blob, filename: string) {
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
}
