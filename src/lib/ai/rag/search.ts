/**
 * RAG Search — finds relevant knowledge chunks for a user query.
 * 
 * Strategy:
 * 1. Vector similarity via Supabase Edge Function `search` (gte-small embeddings)
 * 2. Full-text search (PostgreSQL tsvector) — fallback when vector search returns nothing
 * 
 * Embedding generation:
 * - Auto-generated via `generate-embedding` Edge Function (database webhook)
 * - Triggers on INSERT/UPDATE to knowledge_chunks table
 * - Uses gte-small model (384 dimensions) built into Supabase Edge Runtime
 */

import { createClient } from "@/lib/supabase/server";

export interface KnowledgeChunk {
    id: string;
    content: string;
    documentTitle: string;
    documentSource: string;
    score: number;
}

/**
 * Search knowledge base using vector similarity (via Edge Function).
 * The Edge Function generates the query embedding using gte-small and
 * calls match_documents RPC.
 */
export async function searchKnowledgeVector(
    query: string,
    limit = 3,
    threshold = 0.7
): Promise<KnowledgeChunk[]> {
    try {
        const supabase = await createClient();

        const { data, error } = await supabase.functions.invoke("search", {
            body: {
                search: query,
                match_count: limit,
                match_threshold: threshold,
            },
        });

        if (error || !data?.results) return [];

        return (data.results as Array<{
            id: string;
            content: string;
            document_title: string;
            document_source: string;
            similarity: number;
        }>).map((row) => ({
            id: row.id,
            content: row.content,
            documentTitle: row.document_title,
            documentSource: row.document_source,
            score: row.similarity,
        }));
    } catch (err) {
        console.error("[RAG] Vector search failed:", err);
        return [];
    }
}

/**
 * Search knowledge base using full-text search (PostgreSQL tsvector).
 * Fallback for when embeddings are not yet generated.
 */
export async function searchKnowledgeFTS(
    query: string,
    limit = 3
): Promise<KnowledgeChunk[]> {
    try {
        const supabase = await createClient();

        const { data, error } = await supabase.rpc("search_documents_fts", {
            query_text: query,
            match_count: limit,
        });

        if (error || !data) return [];

        return (data as Array<{
            id: string;
            content: string;
            document_title: string;
            document_source: string;
            rank: number;
        }>).map((row) => ({
            id: row.id,
            content: row.content,
            documentTitle: row.document_title,
            documentSource: row.document_source,
            score: row.rank,
        }));
    } catch (err) {
        console.error("[RAG] FTS search failed:", err);
        return [];
    }
}

/**
 * Smart search: tries vector search first, falls back to FTS.
 */
export async function searchKnowledge(
    query: string,
    limit = 3
): Promise<KnowledgeChunk[]> {
    // Try vector search first
    const vectorResults = await searchKnowledgeVector(query, limit);
    if (vectorResults.length > 0) return vectorResults;

    // Fallback to full-text search
    return searchKnowledgeFTS(query, limit);
}

/**
 * Format knowledge chunks as context for injection into system prompt.
 */
export function formatRAGContext(chunks: KnowledgeChunk[]): string {
    if (chunks.length === 0) return "";

    const formattedChunks = chunks
        .map((c) => `[${c.documentTitle}]\n${c.content}`)
        .join("\n\n---\n\n");

    return `\n\nКОНТЕКСТ ИЗ БАЗЫ ЗНАНИЙ:\n${formattedChunks}\n`;
}
