-- Migration 009: Gamification
-- Achievements, XP transactions, levels, challenges

-- ===== ACHIEVEMENTS =====
CREATE TABLE achievements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug TEXT UNIQUE NOT NULL,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  icon TEXT,
  xp_reward INT DEFAULT 50,
  category TEXT CHECK (category IN ('milestone', 'activity', 'skill', 'social')),
  criteria JSONB NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ===== USER ACHIEVEMENTS =====
CREATE TABLE user_achievements (
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  achievement_id UUID REFERENCES achievements(id) ON DELETE CASCADE,
  earned_at TIMESTAMPTZ DEFAULT NOW(),
  PRIMARY KEY (user_id, achievement_id)
);

-- ===== XP TRANSACTIONS =====
CREATE TABLE xp_transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  amount INT NOT NULL,
  source TEXT CHECK (source IN ('lesson', 'quiz', 'stage', 'chat', 'achievement', 'streak', 'challenge', 'pitch')) NOT NULL,
  source_id UUID,
  description TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ===== LEVELS =====
CREATE TABLE levels (
  level INT PRIMARY KEY,
  title TEXT NOT NULL,
  min_xp INT NOT NULL,
  icon TEXT
);

-- ===== CHALLENGES =====
CREATE TABLE challenges (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT,
  type TEXT CHECK (type IN ('timed', 'milestone', 'social')),
  criteria JSONB NOT NULL,
  xp_reward INT DEFAULT 100,
  starts_at TIMESTAMPTZ,
  ends_at TIMESTAMPTZ,
  is_active BOOLEAN DEFAULT true
);

CREATE TABLE user_challenges (
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  challenge_id UUID REFERENCES challenges(id) ON DELETE CASCADE,
  progress JSONB DEFAULT '{}',
  status TEXT CHECK (status IN ('active', 'completed', 'failed')) DEFAULT 'active',
  joined_at TIMESTAMPTZ DEFAULT NOW(),
  completed_at TIMESTAMPTZ,
  PRIMARY KEY (user_id, challenge_id)
);

-- ===== INDEXES =====
CREATE INDEX idx_xp_transactions_user ON xp_transactions(user_id, created_at);
CREATE INDEX idx_user_achievements_user ON user_achievements(user_id);
CREATE INDEX idx_leaderboard ON profiles(xp DESC);

-- ===== RLS =====
ALTER TABLE achievements ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_achievements ENABLE ROW LEVEL SECURITY;
ALTER TABLE xp_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE levels ENABLE ROW LEVEL SECURITY;
ALTER TABLE challenges ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_challenges ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Achievements are public" ON achievements FOR SELECT USING (true);
CREATE POLICY "Users can view own achievements" ON user_achievements FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "System can insert user achievements" ON user_achievements FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can view own XP" ON xp_transactions FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "System can insert XP" ON xp_transactions FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Levels are public" ON levels FOR SELECT USING (true);

CREATE POLICY "Challenges are public" ON challenges FOR SELECT USING (true);
CREATE POLICY "Users can manage own challenges" ON user_challenges FOR ALL USING (auth.uid() = user_id);

-- ===== SEED: LEVELS =====
INSERT INTO levels (level, title, min_xp, icon) VALUES
  (1, 'Dreamer', 0, '💭'),
  (2, 'Explorer', 100, '🔍'),
  (3, 'Builder', 500, '🔨'),
  (4, 'Launcher', 1500, '🚀'),
  (5, 'Founder', 5000, '👑');

-- ===== SEED: ACHIEVEMENTS (15+) =====
INSERT INTO achievements (slug, title, description, icon, xp_reward, category, criteria) VALUES
  ('first_idea', 'Первая идея', 'Создай свой первый проект', '💡', 20, 'milestone', '{"type": "project_count", "value": 1}'),
  ('idea_master', 'Генератор идей', 'Создай 3 проекта', '🧠', 40, 'milestone', '{"type": "project_count", "value": 3}'),
  ('custdev_ready', 'Готов к CustDev', 'Дойди до стадии Проверка', '🔍', 30, 'skill', '{"type": "stage_reached", "value": "validation"}'),
  ('bmc_started', 'Первые шаги в BMC', 'Заполни 3 блока BMC', '📋', 20, 'skill', '{"type": "bmc_blocks_filled", "value": 3}'),
  ('bmc_complete', 'Бизнес-архитектор', 'Заполни все 9 блоков BMC', '🏗️', 50, 'skill', '{"type": "bmc_blocks_filled", "value": 9}'),
  ('pitch_ready', 'Pitch Perfect', 'Дойди до стадии Питч', '🎤', 100, 'milestone', '{"type": "stage_reached", "value": "pitch"}'),
  ('pitch_trained', 'Закалённый оратор', 'Пройди тренажёр питча', '🏆', 60, 'skill', '{"type": "pitch_training_completed", "value": 1}'),
  ('lesson_1', 'Первый урок', 'Пройди 1 урок', '📖', 10, 'activity', '{"type": "lesson_count", "value": 1}'),
  ('lesson_5', 'Прилежный ученик', 'Пройди 5 уроков', '📚', 30, 'activity', '{"type": "lesson_count", "value": 5}'),
  ('lesson_10', 'Книжный червь', 'Пройди 10 уроков', '🎓', 50, 'activity', '{"type": "lesson_count", "value": 10}'),
  ('streak_3', 'Разгон', '3 дня подряд на платформе', '🔥', 15, 'activity', '{"type": "streak", "value": 3}'),
  ('streak_7', 'На волне', '7 дней подряд на платформе', '🌊', 30, 'activity', '{"type": "streak", "value": 7}'),
  ('streak_14', 'Двухнедельный марафон', '14 дней подряд', '⚡', 50, 'activity', '{"type": "streak", "value": 14}'),
  ('streak_30', 'Месяц силы', '30 дней подряд', '💪', 100, 'activity', '{"type": "streak", "value": 30}'),
  ('level_2', 'Explorer', 'Достигни 2 уровня', '🔍', 20, 'milestone', '{"type": "level_reached", "value": 2}'),
  ('level_3', 'Builder', 'Достигни 3 уровня', '🔨', 30, 'milestone', '{"type": "level_reached", "value": 3}'),
  ('level_4', 'Launcher', 'Достигни 4 уровня', '🚀', 50, 'milestone', '{"type": "level_reached", "value": 4}'),
  ('level_5', 'Founder', 'Достигни 5 уровня', '👑', 100, 'milestone', '{"type": "level_reached", "value": 5}');
