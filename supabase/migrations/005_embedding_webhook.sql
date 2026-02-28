-- Migration 005: Embedding webhook setup
-- Creates infrastructure for auto-generating embeddings via Edge Function
-- Note: The Edge Function itself is deployed separately

-- This migration registered the embedding webhook for knowledge_chunks.
-- The actual webhook trigger calls the Supabase Edge Function 'embed'
-- when new rows are inserted into knowledge_chunks without embeddings.

-- If using Supabase Database Webhooks (pg_net), the webhook is configured
-- via the Supabase Dashboard, not SQL. This file documents the intent.

-- For manual embedding generation, use the match_documents and 
-- search_documents_fts functions defined in 003_knowledge_chunks.sql.
