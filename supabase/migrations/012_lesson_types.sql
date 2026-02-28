-- 012_lesson_types.sql
-- Add lesson type (micro/full) and estimated_minutes columns

ALTER TABLE lessons ADD COLUMN IF NOT EXISTS type TEXT DEFAULT 'full' CHECK (type IN ('micro', 'full'));
ALTER TABLE lessons ADD COLUMN IF NOT EXISTS estimated_minutes INT DEFAULT 5;

-- Copy duration_min to estimated_minutes for consistency
UPDATE lessons SET estimated_minutes = duration_min;

-- Mark short lessons as micro
UPDATE lessons SET type = 'micro' WHERE title IN (
  'ICE-оценка идеи',
  'No-code инструменты',
  'Как говорить с инвесторами'
);
