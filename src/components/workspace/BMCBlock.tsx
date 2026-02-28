"use client";

import { useState } from "react";
import {
    useDroppable,
    useDraggable,
} from "@dnd-kit/core";
import {
    SortableContext,
    verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { Plus, Sparkles } from "lucide-react";
import { AnimatePresence } from "framer-motion";
import { StickyNote } from "./StickyNote";
import { BMCSuggestionPanel } from "./BMCSuggestionPanel";
import type {
    StickyNoteData,
    StickyNoteColor,
    BMCBlockDefinition,
} from "@/types/workspace";

interface BMCBlockProps {
    block: BMCBlockDefinition;
    notes: StickyNoteData[];
    projectId: string;
    onAddNote: (blockKey: string, text: string, color?: StickyNoteColor) => void;
    onUpdateNote: (blockKey: string, noteId: string, text: string) => void;
    onDeleteNote: (blockKey: string, noteId: string) => void;
    onColorChange: (
        blockKey: string,
        noteId: string,
        color: StickyNoteColor
    ) => void;
}

export function BMCBlock({
    block,
    notes,
    projectId,
    onAddNote,
    onUpdateNote,
    onDeleteNote,
    onColorChange,
}: BMCBlockProps) {
    const [showSuggestions, setShowSuggestions] = useState(false);
    const [isAddingNote, setIsAddingNote] = useState(false);
    const [newNoteText, setNewNoteText] = useState("");

    const { setNodeRef, isOver } = useDroppable({
        id: `block-${block.key}`,
        data: { blockKey: block.key },
    });

    const handleAddNote = () => {
        if (newNoteText.trim()) {
            onAddNote(block.key, newNoteText.trim());
            setNewNoteText("");
            setIsAddingNote(false);
        }
    };

    const filledCount = notes.length;
    const fillOpacity = Math.min(filledCount / 3, 1);

    return (
        <div
            ref={setNodeRef}
            className={`
                flex flex-col rounded-xl border bg-surface-0 shadow-xs 
                transition-all duration-200
                ${isOver ? "border-primary-400 shadow-md bg-primary-50/30" : "border-surface-200"}
            `}
            style={{ gridArea: block.gridArea }}
        >
            {/* Block header */}
            <div className="flex items-center justify-between px-3 py-2 border-b border-surface-100">
                <div className="flex items-center gap-1.5 min-w-0">
                    <span className="text-base">{block.emoji}</span>
                    <h3 className="text-caption font-semibold text-surface-900 truncate">
                        {block.label}
                    </h3>
                </div>
                {/* Fill indicator */}
                <div
                    className="w-2 h-2 rounded-full transition-colors"
                    style={{
                        backgroundColor:
                            filledCount === 0
                                ? "var(--color-surface-200)"
                                : `rgba(34, 197, 94, ${0.3 + fillOpacity * 0.7})`,
                    }}
                />
            </div>

            {/* Sticky notes */}
            <div className="flex-1 p-2 space-y-2 overflow-y-auto max-h-64 min-h-[80px]">
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
                                    onUpdateNote(block.key, id, text)
                                }
                                onDelete={(id) =>
                                    onDeleteNote(block.key, id)
                                }
                                onColorChange={(id, color) =>
                                    onColorChange(block.key, id, color)
                                }
                            />
                        ))}
                    </AnimatePresence>
                </SortableContext>

                {/* Add note inline */}
                {isAddingNote ? (
                    <div className="space-y-1.5">
                        <textarea
                            value={newNoteText}
                            onChange={(e) => setNewNoteText(e.target.value)}
                            onKeyDown={(e) => {
                                if (e.key === "Enter" && !e.shiftKey) {
                                    e.preventDefault();
                                    handleAddNote();
                                }
                                if (e.key === "Escape") {
                                    setIsAddingNote(false);
                                    setNewNoteText("");
                                }
                            }}
                            placeholder={block.description}
                            className="w-full p-2 text-body-sm rounded-md border border-surface-200 bg-surface-50 resize-none outline-none focus:border-primary-400 transition-colors"
                            rows={2}
                            autoFocus
                        />
                        <div className="flex gap-1.5">
                            <button
                                onClick={handleAddNote}
                                className="px-2 py-1 text-caption font-medium text-white bg-primary-500 rounded-md hover:bg-primary-600 transition-colors"
                            >
                                Добавить
                            </button>
                            <button
                                onClick={() => {
                                    setIsAddingNote(false);
                                    setNewNoteText("");
                                }}
                                className="px-2 py-1 text-caption text-surface-500 hover:text-surface-700 transition-colors"
                            >
                                Отмена
                            </button>
                        </div>
                    </div>
                ) : null}
            </div>

            {/* Block actions */}
            <div className="flex gap-1 px-2 py-1.5 border-t border-surface-100">
                <button
                    onClick={() => setIsAddingNote(true)}
                    className="flex items-center gap-1 px-2 py-1 text-caption text-surface-500 hover:text-primary-600 hover:bg-primary-50 rounded-md transition-colors"
                >
                    <Plus size={12} />
                    Добавить
                </button>
                <button
                    onClick={() => setShowSuggestions(!showSuggestions)}
                    className="flex items-center gap-1 px-2 py-1 text-caption text-surface-500 hover:text-primary-600 hover:bg-primary-50 rounded-md transition-colors"
                >
                    <Sparkles size={12} />
                    AI
                </button>
            </div>

            {/* AI Suggestions */}
            <AnimatePresence>
                {showSuggestions && (
                    <div className="px-2 pb-2">
                        <BMCSuggestionPanel
                            projectId={projectId}
                            blockKey={block.key}
                            blockLabel={block.label}
                            onAccept={(text) =>
                                onAddNote(block.key, text)
                            }
                            onClose={() => setShowSuggestions(false)}
                        />
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
}
