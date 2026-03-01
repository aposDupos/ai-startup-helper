-- Sprint 13: Social — Peer Review & Gallery
-- Adds public gallery, review requests, reviews, and reactions

-- ============================================================
-- 1. Add is_public column to projects
-- ============================================================
ALTER TABLE projects ADD COLUMN IF NOT EXISTS is_public BOOLEAN DEFAULT false;

-- Allow authenticated users to read public projects
CREATE POLICY "Authenticated can view public projects"
    ON projects FOR SELECT
    USING (is_public = true AND auth.role() = 'authenticated');

-- ============================================================
-- 2. Review Requests
-- ============================================================
CREATE TABLE IF NOT EXISTS review_requests (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
    author_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    artifact_type TEXT NOT NULL CHECK (artifact_type IN ('bmc', 'vpc', 'pitch')),
    status TEXT NOT NULL DEFAULT 'open' CHECK (status IN ('open', 'reviewed', 'closed')),
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- Only one active (open) request per project+artifact
CREATE UNIQUE INDEX IF NOT EXISTS idx_review_requests_active
    ON review_requests(project_id, artifact_type) WHERE status = 'open';

CREATE INDEX IF NOT EXISTS idx_review_requests_status
    ON review_requests(status, created_at DESC);

ALTER TABLE review_requests ENABLE ROW LEVEL SECURITY;

-- Author can manage own requests
CREATE POLICY "Authors can view own review requests"
    ON review_requests FOR SELECT
    USING (author_id = auth.uid());

CREATE POLICY "Authors can insert own review requests"
    ON review_requests FOR INSERT
    WITH CHECK (author_id = auth.uid());

CREATE POLICY "Authors can update own review requests"
    ON review_requests FOR UPDATE
    USING (author_id = auth.uid());

-- Authenticated users can view open requests (for gallery filter)
CREATE POLICY "Authenticated can view open review requests"
    ON review_requests FOR SELECT
    USING (status = 'open' AND auth.role() = 'authenticated');

-- ============================================================
-- 3. Reviews (peer feedback)
-- ============================================================
CREATE TABLE IF NOT EXISTS reviews (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    request_id UUID NOT NULL REFERENCES review_requests(id) ON DELETE CASCADE,
    reviewer_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    comments JSONB NOT NULL DEFAULT '[]',  -- [{block: string, text: string}]
    rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
    created_at TIMESTAMPTZ DEFAULT now()
);

-- One review per reviewer per request
CREATE UNIQUE INDEX IF NOT EXISTS idx_reviews_unique
    ON reviews(request_id, reviewer_id);

CREATE INDEX IF NOT EXISTS idx_reviews_request
    ON reviews(request_id);

ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;

-- Reviewer can insert own reviews
CREATE POLICY "Reviewers can insert reviews"
    ON reviews FOR INSERT
    WITH CHECK (reviewer_id = auth.uid());

-- Reviewer can view own reviews
CREATE POLICY "Reviewers can view own reviews"
    ON reviews FOR SELECT
    USING (reviewer_id = auth.uid());

-- Project author can view reviews on their requests
CREATE POLICY "Authors can view reviews on own requests"
    ON reviews FOR SELECT
    USING (
        request_id IN (
            SELECT id FROM review_requests WHERE author_id = auth.uid()
        )
    );

-- ============================================================
-- 4. Project Reactions (kudos)
-- ============================================================
CREATE TABLE IF NOT EXISTS project_reactions (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
    type TEXT NOT NULL CHECK (type IN ('fire', 'creative', 'researched')),
    created_at TIMESTAMPTZ DEFAULT now(),
    UNIQUE(user_id, project_id, type)
);

CREATE INDEX IF NOT EXISTS idx_reactions_project
    ON project_reactions(project_id);

ALTER TABLE project_reactions ENABLE ROW LEVEL SECURITY;

-- Authenticated can insert reactions
CREATE POLICY "Authenticated can add reactions"
    ON project_reactions FOR INSERT
    WITH CHECK (user_id = auth.uid());

-- Authenticated can view all reactions
CREATE POLICY "Authenticated can view reactions"
    ON project_reactions FOR SELECT
    USING (auth.role() = 'authenticated');

-- Users can delete own reactions (toggle off)
CREATE POLICY "Users can remove own reactions"
    ON project_reactions FOR DELETE
    USING (user_id = auth.uid());
