"use client";

import { useState, useCallback, useRef, useEffect } from "react";
import {
    DndContext,
    closestCenter,
    PointerSensor,
    useSensor,
    useSensors,
    type DragEndEvent,
    type DragStartEvent,
    DragOverlay,
} from "@dnd-kit/core";
import { arrayMove } from "@dnd-kit/sortable";
import { motion } from "framer-motion";
import { Download, Save, Check } from "lucide-react";
import { BMCBlock } from "./BMCBlock";
import { saveBMCData } from "@/app/(main)/workspace/bmc/actions";
import {
    BMC_BLOCKS,
    type BMCData,
    type BMCBlockKey,
    type StickyNoteData,
    type StickyNoteColor,
    createEmptyBMCData,
} from "@/types/workspace";

interface BMCCanvasProps {
    projectId: string;
    projectTitle: string;
    initialData: BMCData;
}

export function BMCCanvas({ projectId, projectTitle, initialData }: BMCCanvasProps) {
    const [bmcData, setBmcData] = useState<BMCData>(() => ({
        ...createEmptyBMCData(),
        ...initialData,
    }));
    const [saveStatus, setSaveStatus] = useState<"idle" | "saving" | "saved">(
        "idle"
    );
    const [activeId, setActiveId] = useState<string | null>(null);

    const saveTimeoutRef = useRef<NodeJS.Timeout | null>(null);

    const sensors = useSensors(
        useSensor(PointerSensor, {
            activationConstraint: { distance: 5 },
        })
    );

    // Debounced autosave
    const triggerSave = useCallback(
        (data: BMCData) => {
            if (saveTimeoutRef.current) {
                clearTimeout(saveTimeoutRef.current);
            }
            setSaveStatus("saving");
            saveTimeoutRef.current = setTimeout(async () => {
                try {
                    await saveBMCData(projectId, data);
                    setSaveStatus("saved");
                    setTimeout(() => setSaveStatus("idle"), 2000);
                } catch {
                    setSaveStatus("idle");
                }
            }, 800);
        },
        [projectId]
    );

    // Cleanup timeout
    useEffect(() => {
        return () => {
            if (saveTimeoutRef.current) clearTimeout(saveTimeoutRef.current);
        };
    }, []);

    // Note operations
    const addNote = useCallback(
        (blockKey: string, text: string, color: StickyNoteColor = "yellow") => {
            setBmcData((prev) => {
                const key = blockKey as BMCBlockKey;
                const newNote: StickyNoteData = {
                    id: crypto.randomUUID(),
                    text,
                    color,
                };
                const updated = {
                    ...prev,
                    [key]: [...(prev[key] || []), newNote],
                };
                triggerSave(updated);
                return updated;
            });
        },
        [triggerSave]
    );

    const updateNote = useCallback(
        (blockKey: string, noteId: string, text: string) => {
            setBmcData((prev) => {
                const key = blockKey as BMCBlockKey;
                const updated = {
                    ...prev,
                    [key]: prev[key].map((n) =>
                        n.id === noteId ? { ...n, text } : n
                    ),
                };
                triggerSave(updated);
                return updated;
            });
        },
        [triggerSave]
    );

    const deleteNote = useCallback(
        (blockKey: string, noteId: string) => {
            setBmcData((prev) => {
                const key = blockKey as BMCBlockKey;
                const updated = {
                    ...prev,
                    [key]: prev[key].filter((n) => n.id !== noteId),
                };
                triggerSave(updated);
                return updated;
            });
        },
        [triggerSave]
    );

    const changeColor = useCallback(
        (blockKey: string, noteId: string, color: StickyNoteColor) => {
            setBmcData((prev) => {
                const key = blockKey as BMCBlockKey;
                const updated = {
                    ...prev,
                    [key]: prev[key].map((n) =>
                        n.id === noteId ? { ...n, color } : n
                    ),
                };
                triggerSave(updated);
                return updated;
            });
        },
        [triggerSave]
    );

    // DnD handlers
    const handleDragStart = (event: DragStartEvent) => {
        setActiveId(event.active.id as string);
    };

    const handleDragEnd = (event: DragEndEvent) => {
        setActiveId(null);
        const { active, over } = event;
        if (!over) return;

        // Find source and target blocks
        let sourceBlock: BMCBlockKey | null = null;
        let targetBlock: BMCBlockKey | null = null;

        for (const key of Object.keys(bmcData) as BMCBlockKey[]) {
            if (bmcData[key].some((n) => n.id === active.id)) {
                sourceBlock = key;
            }
        }

        // If dropped on a block zone
        const overData = over.data?.current;
        if (overData?.blockKey) {
            targetBlock = overData.blockKey as BMCBlockKey;
        } else {
            // Dropped on another note — find its block
            for (const key of Object.keys(bmcData) as BMCBlockKey[]) {
                if (bmcData[key].some((n) => n.id === over.id)) {
                    targetBlock = key;
                }
            }
        }

        if (!sourceBlock || !targetBlock) return;

        setBmcData((prev) => {
            if (sourceBlock === targetBlock) {
                // Same block — reorder
                const oldIndex = prev[sourceBlock!].findIndex(
                    (n) => n.id === active.id
                );
                const newIndex = prev[sourceBlock!].findIndex(
                    (n) => n.id === over.id
                );
                if (oldIndex === -1 || newIndex === -1) return prev;
                const updated = {
                    ...prev,
                    [sourceBlock!]: arrayMove(
                        prev[sourceBlock!],
                        oldIndex,
                        newIndex
                    ),
                };
                triggerSave(updated);
                return updated;
            } else {
                // Cross-block move
                const note = prev[sourceBlock!].find(
                    (n) => n.id === active.id
                );
                if (!note) return prev;
                const updated = {
                    ...prev,
                    [sourceBlock!]: prev[sourceBlock!].filter(
                        (n) => n.id !== active.id
                    ),
                    [targetBlock!]: [...prev[targetBlock!], note],
                };
                triggerSave(updated);
                return updated;
            }
        });
    };

    // Filled blocks count
    const filledCount = Object.values(bmcData).filter(
        (notes) => notes.length > 0
    ).length;

    return (
        <div>
            {/* Status bar */}
            <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                    <span className="text-body-sm text-surface-500">
                        Заполнено:{" "}
                        <span
                            className="font-bold"
                            style={{
                                fontFamily: "var(--font-mono)",
                                color:
                                    filledCount >= 9
                                        ? "var(--color-success-500)"
                                        : "var(--color-surface-900)",
                            }}
                        >
                            {filledCount}/9
                        </span>{" "}
                        блоков
                    </span>
                    {saveStatus === "saving" && (
                        <span className="flex items-center gap-1 text-caption text-surface-400">
                            <Save size={12} className="animate-pulse" />
                            Сохраняю...
                        </span>
                    )}
                    {saveStatus === "saved" && (
                        <motion.span
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            className="flex items-center gap-1 text-caption text-success-500"
                        >
                            <Check size={12} />
                            Сохранено
                        </motion.span>
                    )}
                </div>
                <button
                    onClick={async () => {
                        const { generateBMCPDF, downloadBlob } = await import(
                            "@/lib/export/bmc-pdf"
                        );
                        const blob = await generateBMCPDF(projectTitle, bmcData);
                        downloadBlob(blob, `BMC_${projectTitle}.pdf`);
                    }}
                    className="flex items-center gap-1.5 px-3 py-1.5 text-body-sm font-medium text-primary-600 border border-primary-200 rounded-lg hover:bg-primary-50 transition-colors"
                >
                    <Download size={14} strokeWidth={1.75} />
                    Скачать PDF
                </button>
            </div>

            {/* BMC Grid */}
            <DndContext
                sensors={sensors}
                collisionDetection={closestCenter}
                onDragStart={handleDragStart}
                onDragEnd={handleDragEnd}
            >
                <div
                    className="grid gap-3"
                    style={{
                        gridTemplateColumns: "repeat(5, 1fr)",
                        gridTemplateRows: "auto auto",
                        gridTemplateAreas: `
                            "kp ka vp cr cs"
                            "kp kr vp ch cs"
                            "co co rs rs rs"
                        `,
                    }}
                >
                    {BMC_BLOCKS.map((block) => (
                        <BMCBlock
                            key={block.key}
                            block={block}
                            notes={bmcData[block.key] || []}
                            projectId={projectId}
                            onAddNote={addNote}
                            onUpdateNote={updateNote}
                            onDeleteNote={deleteNote}
                            onColorChange={changeColor}
                        />
                    ))}
                </div>

                <DragOverlay>
                    {activeId ? (
                        <div className="p-3 rounded-lg shadow-lg bg-yellow-100 text-body-sm opacity-80 rotate-3">
                            {(() => {
                                for (const notes of Object.values(bmcData)) {
                                    const note = notes.find(
                                        (n) => n.id === activeId
                                    );
                                    if (note) return note.text;
                                }
                                return "";
                            })()}
                        </div>
                    ) : null}
                </DragOverlay>
            </DndContext>
        </div>
    );
}
