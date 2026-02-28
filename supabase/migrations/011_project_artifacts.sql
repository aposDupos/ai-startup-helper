-- Migration 011: Add artifacts column to projects
-- Stores structured data extracted from AI chat conversations

ALTER TABLE projects ADD COLUMN IF NOT EXISTS artifacts JSONB DEFAULT '{}';

COMMENT ON COLUMN projects.artifacts IS 'Structured artifacts extracted from AI chat: problem, target_audience, hypotheses, etc.';

-- artifacts structure:
-- {
--   "problem": "description of the problem",
--   "target_audience": "description of target audience",  
--   "hypotheses": ["hypothesis 1", "hypothesis 2"],
--   "unique_value": "unique value proposition",
--   "custdev_results": "summary of customer development",
--   "competitors": "competitive analysis notes",
--   "mvp_features": "planned MVP features"
-- }
