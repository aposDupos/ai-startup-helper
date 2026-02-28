"use client";

import { useState, useCallback, useRef, useEffect } from "react";
import {
    DndContext,
    closestCenter,
    PointerSensor,
    useSensor,
    useSensors,
    type DragEndEvent,
} from "@dnd-kit/core";
import {
    SortableContext,
    verticalListSortingStrategy,
    arrayMove,
} from "@dnd-kit/sortable";
import { useDroppable } from "@dnd-kit/core";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, Save, Check } from "lucide-react";
import { StickyNote } from "./StickyNote";
import { saveVPCData } from "@/app/(main)/workspace/vpc/actions";
import {
    VPC_ZONES,
    type VPCData,
    type VPCZoneKey,
    type StickyNoteData,
    type StickyNoteColor,
    createEmptyVPCData,
} from "@/types/workspace";

interface VPCCanvasProps {
    projectId: string;
    initialData: VPCData;
}

// ---------------------------------------------------------------------------
// Zone component
// ---------------------------------------------------------------------------

function VPCZone({
    zoneKey,
    label,
    emoji,
    description,
    notes,
    onAddNote,
    onUpdateNote,
    onDeleteNote,
    onColorChange,
}: {
    zoneKey: VPCZoneKey;
    label: string;
    emoji: string;
    description: string;
    notes: StickyNoteData[];
    onAddNote: (zoneKey: string, text: string) => void;
    onUpdateNote: (zoneKey: string, noteId: string, text: string) => void;
    onDeleteNote: (zoneKey: string, noteId: string) => void;
    onColorChange: (
        zoneKey: string,
        noteId: string,
        color: StickyNoteColor
    ) => void;
}) {
    const [isAdding, setIsAdding] = useState(false);
    const [newText, setNewText] = useState("");

    const { setNodeRef, isOver } = useDroppable({
        id: `zone-${zoneKey}`,
        data: { zoneKey },
    });

    const handleAdd = () => {
        if (newText.trim()) {
            onAddNote(zoneKey, newText.trim());
            setNewText("");
            setIsAdding(false);
        }
    };

    return (
        <div
            ref={setNodeRef}
            className={`
                flex flex-col rounded-xl border bg-surface-0 shadow-xs transition-all duration-200
                ${isOver ? "border-primary-400 shadow-md bg-primary-50/30" : "border-surface-200"}
            `}
        >
            <div className="flex items-center gap-1.5 px-3 py-2 border-b border-surface-100">
                <span className="text-base">{emoji}</span>
                <h3 className="text-caption font-semibold text-surface-900">
                    {label}
                </h3>
            </div>

            <div className="flex-1 p-2 space-y-2 overflow-y-auto max-h-52 min-h-[60px]">
                <SortableContext
                    items={notes.map((n) => n.id)}
                    strategy={verticalListSortingStrategy}
                >
                    <AnimatePresence mode="popLayout">
                        {notes.map((note) => (
                            <StickyNote
                                key={note.id}
                                note={note}
                                onUpdate={(id, text) =>
                                    onUpdateNote(zoneKey, id, text)
                                }
                                onDelete={(id) =>
                                    onDeleteNote(zoneKey, id)
                                }
                                onColorChange={(id, color) =>
                                    onColorChange(zoneKey, id, color)
                                }
                            />
                        ))}
                    </AnimatePresence>
                </SortableContext>

                {isAdding ? (
                    <div className="space-y-1.5">
                        <textarea
                            value={newText}
                            onChange={(e) => setNewText(e.target.value)}
                            onKeyDown={(e) => {
                                if (e.key === "Enter" && !e.shiftKey) {
                                    e.preventDefault();
                                    handleAdd();
                                }
                                if (e.key === "Escape") {
                                    setIsAdding(false);
                                    setNewText("");
                                }
                            }}
                            placeholder={description}
                            className="w-full p-2 text-body-sm rounded-md border border-surface-200 bg-surface-50 resize-none outline-none focus:border-primary-400 transition-colors"
                            rows={2}
                            autoFocus
                        />
                        <div className="flex gap-1.5">
                            <button
                                onClick={handleAdd}
                                className="px-2 py-1 text-caption font-medium text-white bg-primary-500 rounded-md hover:bg-primary-600 transition-colors"
                            >
                                Добавить
                            </button>
                            <button
                                onClick={() => {
                                    setIsAdding(false);
                                    setNewText("");
                                }}
                                className="px-2 py-1 text-caption text-surface-500 transition-colors"
                            >
                                Отмена
                            </button>
                        </div>
                    </div>
                ) : null}
            </div>

            <div className="px-2 py-1.5 border-t border-surface-100">
                <button
                    onClick={() => setIsAdding(true)}
                    className="flex items-center gap-1 px-2 py-1 text-caption text-surface-500 hover:text-primary-600 hover:bg-primary-50 rounded-md transition-colors"
                >
                    <Plus size={12} />
                    Добавить
                </button>
            </div>
        </div>
    );
}

// ---------------------------------------------------------------------------
// VPC Canvas
// ---------------------------------------------------------------------------

export function VPCCanvas({ projectId, initialData }: VPCCanvasProps) {
    const [vpcData, setVpcData] = useState<VPCData>(() => ({
        ...createEmptyVPCData(),
        ...initialData,
    }));
    const [saveStatus, setSaveStatus] = useState<"idle" | "saving" | "saved">(
        "idle"
    );

    const saveTimeoutRef = useRef<NodeJS.Timeout | null>(null);

    const sensors = useSensors(
        useSensor(PointerSensor, {
            activationConstraint: { distance: 5 },
        })
    );

    const triggerSave = useCallback(
        (data: VPCData) => {
            if (saveTimeoutRef.current) clearTimeout(saveTimeoutRef.current);
            setSaveStatus("saving");
            saveTimeoutRef.current = setTimeout(async () => {
                try {
                    await saveVPCData(projectId, data);
                    setSaveStatus("saved");
                    setTimeout(() => setSaveStatus("idle"), 2000);
                } catch {
                    setSaveStatus("idle");
                }
            }, 800);
        },
        [projectId]
    );

    useEffect(() => {
        return () => {
            if (saveTimeoutRef.current) clearTimeout(saveTimeoutRef.current);
        };
    }, []);

    const addNote = useCallback(
        (zoneKey: string, text: string) => {
            setVpcData((prev) => {
                const key = zoneKey as VPCZoneKey;
                const newNote: StickyNoteData = {
                    id: crypto.randomUUID(),
                    text,
                    color: "yellow",
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
        (zoneKey: string, noteId: string, text: string) => {
            setVpcData((prev) => {
                const key = zoneKey as VPCZoneKey;
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
        (zoneKey: string, noteId: string) => {
            setVpcData((prev) => {
                const key = zoneKey as VPCZoneKey;
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
        (zoneKey: string, noteId: string, color: StickyNoteColor) => {
            setVpcData((prev) => {
                const key = zoneKey as VPCZoneKey;
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

    const handleDragEnd = (event: DragEndEvent) => {
        const { active, over } = event;
        if (!over) return;

        let sourceZone: VPCZoneKey | null = null;
        let targetZone: VPCZoneKey | null = null;

        for (const key of Object.keys(vpcData) as VPCZoneKey[]) {
            if (vpcData[key].some((n) => n.id === active.id)) sourceZone = key;
        }

        const overData = over.data?.current;
        if (overData?.zoneKey) {
            targetZone = overData.zoneKey as VPCZoneKey;
        } else {
            for (const key of Object.keys(vpcData) as VPCZoneKey[]) {
                if (vpcData[key].some((n) => n.id === over.id)) targetZone = key;
            }
        }

        if (!sourceZone || !targetZone) return;

        setVpcData((prev) => {
            if (sourceZone === targetZone) {
                const oldIndex = prev[sourceZone!].findIndex(
                    (n) => n.id === active.id
                );
                const newIndex = prev[sourceZone!].findIndex(
                    (n) => n.id === over.id
                );
                if (oldIndex === -1 || newIndex === -1) return prev;
                const updated = {
                    ...prev,
                    [sourceZone!]: arrayMove(
                        prev[sourceZone!],
                        oldIndex,
                        newIndex
                    ),
                };
                triggerSave(updated);
                return updated;
            } else {
                const note = prev[sourceZone!].find(
                    (n) => n.id === active.id
                );
                if (!note) return prev;
                const updated = {
                    ...prev,
                    [sourceZone!]: prev[sourceZone!].filter(
                        (n) => n.id !== active.id
                    ),
                    [targetZone!]: [...prev[targetZone!], note],
                };
                triggerSave(updated);
                return updated;
            }
        });
    };

    const customerZones = VPC_ZONES.filter((z) => z.side === "customer");
    const valueZones = VPC_ZONES.filter((z) => z.side === "value");
    const filledCount = Object.values(vpcData).filter(
        (n) => n.length > 0
    ).length;

    return (
        <div>
            {/* Status bar */}
            <div className="flex items-center gap-3 mb-4">
                <span className="text-body-sm text-surface-500">
                    Заполнено:{" "}
                    <span
                        className="font-bold"
                        style={{
                            fontFamily: "var(--font-mono)",
                            color:
                                filledCount >= 6
                                    ? "var(--color-success-500)"
                                    : "var(--color-surface-900)",
                        }}
                    >
                        {filledCount}/6
                    </span>{" "}
                    зон
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

            {/* VPC Layout: two halves */}
            <DndContext
                sensors={sensors}
                collisionDetection={closestCenter}
                onDragEnd={handleDragEnd}
            >
                <div className="grid md:grid-cols-2 gap-6">
                    {/* Value Map (left) */}
                    <div className="space-y-3">
                        <h2 className="text-h3 text-surface-900">
                            📦 Value Map
                        </h2>
                        <div className="grid gap-3">
                            {valueZones.map((zone) => (
                                <VPCZone
                                    key={zone.key}
                                    zoneKey={zone.key}
                                    label={zone.label}
                                    emoji={zone.emoji}
                                    description={zone.description}
                                    notes={vpcData[zone.key] || []}
                                    onAddNote={addNote}
                                    onUpdateNote={updateNote}
                                    onDeleteNote={deleteNote}
                                    onColorChange={changeColor}
                                />
                            ))}
                        </div>
                    </div>

                    {/* Customer Profile (right) */}
                    <div className="space-y-3">
                        <h2 className="text-h3 text-surface-900">
                            👤 Customer Profile
                        </h2>
                        <div className="grid gap-3">
                            {customerZones.map((zone) => (
                                <VPCZone
                                    key={zone.key}
                                    zoneKey={zone.key}
                                    label={zone.label}
                                    emoji={zone.emoji}
                                    description={zone.description}
                                    notes={vpcData[zone.key] || []}
                                    onAddNote={addNote}
                                    onUpdateNote={updateNote}
                                    onDeleteNote={deleteNote}
                                    onColorChange={changeColor}
                                />
                            ))}
                        </div>
                    </div>
                </div>
            </DndContext>
        </div>
    );
}
