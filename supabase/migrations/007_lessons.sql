-- Migration 007: lessons + user_lesson_progress
-- Sprint 04: Workspace + Learning

-- ============================================================
-- LESSONS — inline micro-lessons linked to stages
-- ============================================================

CREATE TABLE IF NOT EXISTS public.lessons (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  stage TEXT NOT NULL CHECK (stage = ANY (ARRAY['idea', 'validation', 'business_model', 'mvp', 'pitch'])),
  title TEXT NOT NULL,
  content JSONB NOT NULL DEFAULT '[]',
  quiz JSONB NOT NULL DEFAULT '[]',
  duration_min INTEGER DEFAULT 5,
  audience TEXT DEFAULT 'all' CHECK (audience = ANY (ARRAY['all', 'school', 'university'])),
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.lessons ENABLE ROW LEVEL SECURITY;

-- Lessons are readable by all authenticated users
CREATE POLICY "Authenticated users can read lessons"
  ON public.lessons FOR SELECT
  TO authenticated
  USING (true);

-- ============================================================
-- USER LESSON PROGRESS — track per-user lesson completion
-- ============================================================

CREATE TABLE IF NOT EXISTS public.user_lesson_progress (
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  lesson_id UUID REFERENCES public.lessons(id) ON DELETE CASCADE,
  status TEXT DEFAULT 'not_started' CHECK (status = ANY (ARRAY['not_started', 'in_progress', 'completed'])),
  score INTEGER,
  completed_at TIMESTAMPTZ,
  PRIMARY KEY (user_id, lesson_id)
);

ALTER TABLE public.user_lesson_progress ENABLE ROW LEVEL SECURITY;

-- Users can read/write their own progress
CREATE POLICY "Users can view own lesson progress"
  ON public.user_lesson_progress FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own lesson progress"
  ON public.user_lesson_progress FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own lesson progress"
  ON public.user_lesson_progress FOR UPDATE
  USING (auth.uid() = user_id);

-- ============================================================
-- FK: stage_checklists.linked_lesson_id → lessons.id
-- ============================================================

ALTER TABLE public.stage_checklists
  ADD CONSTRAINT fk_linked_lesson
  FOREIGN KEY (linked_lesson_id) REFERENCES public.lessons(id)
  ON DELETE SET NULL;

-- ============================================================
-- Indexes
-- ============================================================

CREATE INDEX IF NOT EXISTS idx_lessons_stage ON public.lessons(stage);
CREATE INDEX IF NOT EXISTS idx_user_lesson_progress_user ON public.user_lesson_progress(user_id);
