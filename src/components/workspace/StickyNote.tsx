"use client";

import { useState, useRef, useEffect } from "react";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { X, GripVertical, Pencil, Check } from "lucide-react";
import { motion } from "framer-motion";
import type { StickyNoteData, StickyNoteColor } from "@/types/workspace";
import { STICKY_NOTE_COLORS } from "@/types/workspace";

interface StickyNoteProps {
    note: StickyNoteData;
    onUpdate: (id: string, text: string) => void;
    onDelete: (id: string) => void;
    onColorChange: (id: string, color: StickyNoteColor) => void;
}

const colorOptions: StickyNoteColor[] = ["yellow", "pink", "blue", "green"];

export function StickyNote({
    note,
    onUpdate,
    onDelete,
    onColorChange,
}: StickyNoteProps) {
    const [isEditing, setIsEditing] = useState(false);
    const [editText, setEditText] = useState(note.text);
    const textareaRef = useRef<HTMLTextAreaElement>(null);

    const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        transition,
        isDragging,
    } = useSortable({ id: note.id });

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
    };

    useEffect(() => {
        if (isEditing && textareaRef.current) {
            textareaRef.current.focus();
            textareaRef.current.select();
        }
    }, [isEditing]);

    const handleSave = () => {
        if (editText.trim()) {
            onUpdate(note.id, editText.trim());
        }
        setIsEditing(false);
    };

    return (
        <motion.div
            ref={setNodeRef}
            style={{
                ...style,
                backgroundColor: STICKY_NOTE_COLORS[note.color],
            }}
            className={`
                relative group rounded-lg p-3 shadow-xs
                transition-shadow hover:shadow-sm
                ${isDragging ? "opacity-50 shadow-md z-50" : ""}
            `}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            transition={{ duration: 0.15 }}
        >
            {/* Drag handle */}
            <button
                className="absolute -left-0.5 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-60 transition-opacity cursor-grab active:cursor-grabbing"
                {...attributes}
                {...listeners}
            >
                <GripVertical size={14} className="text-surface-800/40" />
            </button>

            {/* Actions */}
            <div className="absolute top-1 right-1 flex gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
                {/* Color dots */}
                <div className="flex gap-0.5 mr-1">
                    {colorOptions.map((c) => (
                        <button
                            key={c}
                            onClick={() => onColorChange(note.id, c)}
                            className="w-3 h-3 rounded-full border border-surface-800/10 transition-transform hover:scale-125"
                            style={{ backgroundColor: STICKY_NOTE_COLORS[c] }}
                        />
                    ))}
                </div>
                <button
                    onClick={() => {
                        setEditText(note.text);
                        setIsEditing(true);
                    }}
                    className="p-0.5 rounded hover:bg-surface-800/10 transition-colors"
                >
                    <Pencil size={12} className="text-surface-800/60" />
                </button>
                <button
                    onClick={() => onDelete(note.id)}
                    className="p-0.5 rounded hover:bg-red-100 transition-colors"
                >
                    <X size={12} className="text-red-500/60" />
                </button>
            </div>

            {/* Content */}
            {isEditing ? (
                <div className="flex items-end gap-1">
                    <textarea
                        ref={textareaRef}
                        value={editText}
                        onChange={(e) => setEditText(e.target.value)}
                        onKeyDown={(e) => {
                            if (e.key === "Enter" && !e.shiftKey) {
                                e.preventDefault();
                                handleSave();
                            }
                            if (e.key === "Escape") setIsEditing(false);
                        }}
                        className="w-full bg-transparent text-body-sm text-surface-900 resize-none outline-none leading-relaxed"
                        rows={2}
                    />
                    <button
                        onClick={handleSave}
                        className="p-1 rounded bg-surface-800/10 hover:bg-surface-800/20 transition-colors"
                    >
                        <Check size={12} />
                    </button>
                </div>
            ) : (
                <p
                    className="text-body-sm text-surface-900 leading-relaxed cursor-text pr-4"
                    onDoubleClick={() => {
                        setEditText(note.text);
                        setIsEditing(true);
                    }}
                >
                    {note.text}
                </p>
            )}
        </motion.div>
    );
}
