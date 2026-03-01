-- Sprint 15: Daily Quests + Streak Freezes + Push Subscriptions
-- ============================================================

-- 1. Daily Quests
-- ============================================================

CREATE TYPE quest_type AS ENUM ('lesson', 'bmc_block', 'checklist_item', 'peer_review', 'quiz');

CREATE TABLE daily_quests (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    project_id UUID REFERENCES projects(id) ON DELETE SET NULL,
    quest_type quest_type NOT NULL,
    quest_target TEXT NOT NULL,          -- e.g. lesson id, bmc block key, checklist item_key
    quest_label TEXT NOT NULL,           -- human-readable description
    xp_reward INT NOT NULL DEFAULT 15,
    completed BOOLEAN NOT NULL DEFAULT FALSE,
    completed_at TIMESTAMPTZ,
    quest_date DATE NOT NULL DEFAULT CURRENT_DATE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Enforce one quest per user per day
CREATE UNIQUE INDEX uq_daily_quest_per_day
    ON daily_quests (user_id, quest_date);

-- Fast lookups
CREATE INDEX idx_daily_quests_user ON daily_quests (user_id, created_at DESC);

-- RLS
ALTER TABLE daily_quests ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users read own quests"
    ON daily_quests FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users update own quests"
    ON daily_quests FOR UPDATE
    USING (auth.uid() = user_id);

CREATE POLICY "Users insert own quests"
    ON daily_quests FOR INSERT
    WITH CHECK (auth.uid() = user_id);


-- 2. Streak Freezes
-- ============================================================

CREATE TABLE streak_freezes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    used_at DATE NOT NULL DEFAULT CURRENT_DATE,
    week_start DATE NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- One freeze per user per week
CREATE UNIQUE INDEX uq_streak_freeze_per_week
    ON streak_freezes (user_id, week_start);

CREATE INDEX idx_streak_freezes_user ON streak_freezes (user_id, used_at DESC);

-- RLS
ALTER TABLE streak_freezes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users read own freezes"
    ON streak_freezes FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users insert own freezes"
    ON streak_freezes FOR INSERT
    WITH CHECK (auth.uid() = user_id);


-- 3. Push Subscriptions (for PWA notifications)
-- ============================================================

CREATE TABLE push_subscriptions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    endpoint TEXT NOT NULL,
    p256dh TEXT NOT NULL,
    auth_key TEXT NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    UNIQUE (user_id, endpoint)
);

CREATE INDEX idx_push_subscriptions_user ON push_subscriptions (user_id);

-- RLS
ALTER TABLE push_subscriptions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users manage own subscriptions"
    ON push_subscriptions FOR ALL
    USING (auth.uid() = user_id);
