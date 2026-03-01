-- Sprint 14: Teams & Social
-- Adds co-founder matching fields, discussions, study groups

-- ---------------------------------------------------------------------------
-- 1. Profiles: co-founder matching fields
-- ---------------------------------------------------------------------------
ALTER TABLE profiles
  ADD COLUMN IF NOT EXISTS looking_for_cofounder BOOLEAN DEFAULT false,
  ADD COLUMN IF NOT EXISTS bio TEXT;

-- ---------------------------------------------------------------------------
-- 2. Discussions
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS discussions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  author_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  stage TEXT CHECK (stage IN ('idea', 'validation', 'business_model', 'mvp', 'pitch', 'general')),
  title TEXT NOT NULL,
  body TEXT NOT NULL,
  upvotes INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS discussion_replies (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  discussion_id UUID NOT NULL REFERENCES discussions(id) ON DELETE CASCADE,
  author_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  body TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS discussion_votes (
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  discussion_id UUID NOT NULL REFERENCES discussions(id) ON DELETE CASCADE,
  PRIMARY KEY (user_id, discussion_id)
);

-- ---------------------------------------------------------------------------
-- 3. Study Groups
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS study_groups (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  max_members INTEGER DEFAULT 7,
  current_stage TEXT DEFAULT 'idea' CHECK (current_stage IN ('idea', 'validation', 'business_model', 'mvp', 'pitch')),
  invite_code UUID DEFAULT gen_random_uuid(),
  created_by UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS study_group_members (
  group_id UUID NOT NULL REFERENCES study_groups(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  joined_at TIMESTAMPTZ DEFAULT now(),
  PRIMARY KEY (group_id, user_id)
);

-- ---------------------------------------------------------------------------
-- 4. RLS Policies
-- ---------------------------------------------------------------------------

-- Discussions
ALTER TABLE discussions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can read discussions" ON discussions FOR SELECT USING (true);
CREATE POLICY "Authenticated users can create discussions" ON discussions FOR INSERT WITH CHECK (auth.uid() = author_id);
CREATE POLICY "Authors can update own discussions" ON discussions FOR UPDATE USING (auth.uid() = author_id);
CREATE POLICY "Authors can delete own discussions" ON discussions FOR DELETE USING (auth.uid() = author_id);

-- Discussion replies
ALTER TABLE discussion_replies ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can read replies" ON discussion_replies FOR SELECT USING (true);
CREATE POLICY "Authenticated users can create replies" ON discussion_replies FOR INSERT WITH CHECK (auth.uid() = author_id);
CREATE POLICY "Authors can delete own replies" ON discussion_replies FOR DELETE USING (auth.uid() = author_id);

-- Discussion votes
ALTER TABLE discussion_votes ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can read votes" ON discussion_votes FOR SELECT USING (true);
CREATE POLICY "Users can vote" ON discussion_votes FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can remove own vote" ON discussion_votes FOR DELETE USING (auth.uid() = user_id);

-- Study groups
ALTER TABLE study_groups ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can read groups" ON study_groups FOR SELECT USING (true);
CREATE POLICY "Authenticated users can create groups" ON study_groups FOR INSERT WITH CHECK (auth.uid() = created_by);
CREATE POLICY "Creators can update own groups" ON study_groups FOR UPDATE USING (auth.uid() = created_by);

-- Study group members
ALTER TABLE study_group_members ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can read group members" ON study_group_members FOR SELECT USING (true);
CREATE POLICY "Users can join groups" ON study_group_members FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can leave groups" ON study_group_members FOR DELETE USING (auth.uid() = user_id);

-- ---------------------------------------------------------------------------
-- 5. Indexes
-- ---------------------------------------------------------------------------
CREATE INDEX IF NOT EXISTS idx_discussions_stage ON discussions(stage);
CREATE INDEX IF NOT EXISTS idx_discussions_created_at ON discussions(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_discussion_replies_discussion ON discussion_replies(discussion_id);
CREATE INDEX IF NOT EXISTS idx_study_groups_invite_code ON study_groups(invite_code);

-- ---------------------------------------------------------------------------
-- 6. Increment/Decrement upvotes function
-- ---------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION update_discussion_upvotes()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE discussions SET upvotes = upvotes + 1 WHERE id = NEW.discussion_id;
    RETURN NEW;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE discussions SET upvotes = upvotes - 1 WHERE id = OLD.discussion_id;
    RETURN OLD;
  END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER trg_update_discussion_upvotes
AFTER INSERT OR DELETE ON discussion_votes
FOR EACH ROW EXECUTE FUNCTION update_discussion_upvotes();
