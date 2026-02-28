-- Migration 002: conversations + messages + ai_logs
-- Sprint 02 — AI Core

-- ============================================================
-- CONVERSATIONS
-- ============================================================

CREATE TABLE IF NOT EXISTS public.conversations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID REFERENCES public.projects(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  context_type TEXT NOT NULL DEFAULT 'general'
    CHECK (context_type = ANY (ARRAY[
      'idea_search', 'validation', 'bmc', 'mvp', 'pitch', 'general'
    ])),
  title TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.conversations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own conversations"
  ON public.conversations FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own conversations"
  ON public.conversations FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own conversations"
  ON public.conversations FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own conversations"
  ON public.conversations FOR DELETE
  USING (auth.uid() = user_id);

CREATE INDEX idx_conversations_user ON public.conversations(user_id, created_at DESC);

-- ============================================================
-- MESSAGES
-- ============================================================

CREATE TABLE IF NOT EXISTS public.messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_id UUID NOT NULL REFERENCES public.conversations(id) ON DELETE CASCADE,
  role TEXT NOT NULL CHECK (role = ANY (ARRAY['user', 'assistant', 'system', 'tool'])),
  content TEXT NOT NULL,
  metadata JSONB,        -- tool calls, ICE scores, saved ideas etc.
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view messages in own conversations"
  ON public.messages FOR SELECT
  USING (
    conversation_id IN (
      SELECT id FROM public.conversations WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Users can insert messages in own conversations"
  ON public.messages FOR INSERT
  WITH CHECK (
    conversation_id IN (
      SELECT id FROM public.conversations WHERE user_id = auth.uid()
    )
  );

CREATE INDEX idx_messages_conversation ON public.messages(conversation_id, created_at ASC);

-- ============================================================
-- AI_LOGS  (admin-only read)
-- ============================================================

CREATE TABLE IF NOT EXISTS public.ai_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  conversation_id UUID REFERENCES public.conversations(id) ON DELETE SET NULL,
  model TEXT NOT NULL,
  prompt_tokens INT,
  completion_tokens INT,
  latency_ms INT,
  status TEXT NOT NULL DEFAULT 'success' CHECK (status = ANY (ARRAY['success', 'error'])),
  error_message TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.ai_logs ENABLE ROW LEVEL SECURITY;

-- Users can read their own logs; only service role can insert
CREATE POLICY "Users can view own ai_logs"
  ON public.ai_logs FOR SELECT
  USING (auth.uid() = user_id);

-- Inserts happen only via service role key (server-side)
CREATE POLICY "Service role can insert ai_logs"
  ON public.ai_logs FOR INSERT
  WITH CHECK (true);

CREATE INDEX idx_ai_logs_user ON public.ai_logs(user_id, created_at DESC);
CREATE INDEX idx_ai_logs_conversation ON public.ai_logs(conversation_id);
