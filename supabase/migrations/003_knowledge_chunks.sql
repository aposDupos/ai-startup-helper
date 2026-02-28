-- Migration 003: knowledge_chunks with pgvector (RAG)
-- Sprint 02 — AI Core / RAG Prototype
-- Uses: pgvector extension (built-in on Supabase)
-- Embeddings generated via Supabase Edge Function + gte-small model (free, no GigaChat required)

-- Enable pgvector extension
CREATE EXTENSION IF NOT EXISTS vector WITH SCHEMA extensions;

-- ============================================================
-- KNOWLEDGE_CHUNKS
-- ============================================================
-- gte-small produces 384-dimensional embeddings
-- GigaChat Embeddings-2 would produce 1024-dim (if enabled later)

CREATE TABLE IF NOT EXISTS public.knowledge_chunks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  document_title TEXT NOT NULL,
  document_source TEXT,        -- 'lean-startup', 'jtbd', etc.
  content TEXT NOT NULL,
  chunk_index INT NOT NULL,
  embedding VECTOR(384),       -- gte-small dimensions; change to 1024 for GigaChat
  metadata JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Vector similarity search index (IVFFlat, good for ~1K-100K rows)
-- Created after data is loaded (needs at least 1 row for ivfflat)
-- CREATE INDEX idx_knowledge_embedding
--   ON public.knowledge_chunks
--   USING ivfflat (embedding vector_cosine_ops)
--   WITH (lists = 50);

-- Full-text search fallback (works without embeddings)
ALTER TABLE public.knowledge_chunks
  ADD COLUMN IF NOT EXISTS fts_vector TSVECTOR
    GENERATED ALWAYS AS (to_tsvector('russian', content)) STORED;

CREATE INDEX idx_knowledge_fts ON public.knowledge_chunks USING GIN (fts_vector);
CREATE INDEX idx_knowledge_source ON public.knowledge_chunks(document_source);

-- No RLS needed — this is read-only reference data (no user data)

-- ============================================================
-- FUNCTION: match_documents (vector similarity search)
-- ============================================================

CREATE OR REPLACE FUNCTION public.match_documents(
  query_embedding VECTOR(384),
  match_threshold FLOAT DEFAULT 0.7,
  match_count INT DEFAULT 3
)
RETURNS TABLE (
  id UUID,
  content TEXT,
  document_title TEXT,
  document_source TEXT,
  similarity FLOAT
)
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN QUERY
  SELECT
    kc.id,
    kc.content,
    kc.document_title,
    kc.document_source,
    1 - (kc.embedding <=> query_embedding) AS similarity
  FROM public.knowledge_chunks kc
  WHERE kc.embedding IS NOT NULL
    AND 1 - (kc.embedding <=> query_embedding) > match_threshold
  ORDER BY kc.embedding <=> query_embedding
  LIMIT match_count;
END;
$$;

-- ============================================================
-- FUNCTION: search_documents_fts (full-text search fallback)
-- ============================================================

CREATE OR REPLACE FUNCTION public.search_documents_fts(
  query_text TEXT,
  match_count INT DEFAULT 3,
  source_filter TEXT DEFAULT NULL
)
RETURNS TABLE (
  id UUID,
  content TEXT,
  document_title TEXT,
  document_source TEXT,
  rank FLOAT
)
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN QUERY
  SELECT
    kc.id,
    kc.content,
    kc.document_title,
    kc.document_source,
    ts_rank(kc.fts_vector, plainto_tsquery('russian', query_text))::FLOAT AS rank
  FROM public.knowledge_chunks kc
  WHERE kc.fts_vector @@ plainto_tsquery('russian', query_text)
    AND (source_filter IS NULL OR kc.document_source = source_filter)
  ORDER BY rank DESC
  LIMIT match_count;
END;
$$;
