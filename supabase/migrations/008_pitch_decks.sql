-- Migration 008: Pitch Decks
-- Stores pitch deck data for projects (10 slides)

CREATE TABLE pitch_decks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID REFERENCES projects(id) ON DELETE CASCADE NOT NULL,
  slides JSONB NOT NULL DEFAULT '[]'::jsonb,
  template TEXT DEFAULT 'default',
  training_results JSONB DEFAULT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index for fast lookup by project
CREATE INDEX idx_pitch_decks_project ON pitch_decks(project_id);

-- RLS
ALTER TABLE pitch_decks ENABLE ROW LEVEL SECURITY;

-- Owner can do everything
CREATE POLICY "Users can manage own pitch decks"
  ON pitch_decks
  FOR ALL
  USING (
    project_id IN (
      SELECT id FROM projects WHERE owner_id = auth.uid()
    )
  )
  WITH CHECK (
    project_id IN (
      SELECT id FROM projects WHERE owner_id = auth.uid()
    )
  );
