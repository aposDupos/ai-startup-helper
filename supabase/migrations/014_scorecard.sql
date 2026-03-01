-- Sprint 12: Scorecard + Scorecard History
-- Add scorecard JSONB column to projects
ALTER TABLE projects ADD COLUMN IF NOT EXISTS scorecard JSONB DEFAULT '{}';

-- Scorecard history table
CREATE TABLE IF NOT EXISTS scorecard_history (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
    score INTEGER NOT NULL DEFAULT 0,
    criteria_snapshot JSONB NOT NULL DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT now()
);

-- Index for fast lookup by project
CREATE INDEX IF NOT EXISTS idx_scorecard_history_project
    ON scorecard_history(project_id, created_at DESC);

-- RLS
ALTER TABLE scorecard_history ENABLE ROW LEVEL SECURITY;

-- Owner can read their project's scorecard history
CREATE POLICY "Users can view own project scorecard history"
    ON scorecard_history FOR SELECT
    USING (
        project_id IN (
            SELECT id FROM projects WHERE owner_id = auth.uid()
        )
    );

-- Owner can insert into their project's scorecard history
CREATE POLICY "Users can insert own project scorecard history"
    ON scorecard_history FOR INSERT
    WITH CHECK (
        project_id IN (
            SELECT id FROM projects WHERE owner_id = auth.uid()
        )
    );
