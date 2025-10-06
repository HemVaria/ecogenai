-- User gamification and rewards system
CREATE TABLE IF NOT EXISTS user_stats (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  total_points INTEGER DEFAULT 0,
  level INTEGER DEFAULT 1,
  current_streak INTEGER DEFAULT 0,
  longest_streak INTEGER DEFAULT 0,
  last_activity_date DATE,
  total_co2_saved NUMERIC(10, 2) DEFAULT 0,
  total_items_classified INTEGER DEFAULT 0,
  total_items_recycled INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id)
);

-- Badges and achievements
CREATE TABLE IF NOT EXISTS badges (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  icon TEXT,
  category TEXT, -- 'classification', 'recycling', 'streak', 'social', 'special'
  requirement_type TEXT, -- 'count', 'streak', 'co2', 'special'
  requirement_value INTEGER,
  points_reward INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- User badges (earned achievements)
CREATE TABLE IF NOT EXISTS user_badges (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  badge_id UUID REFERENCES badges(id) ON DELETE CASCADE NOT NULL,
  earned_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, badge_id)
);

-- Leaderboard entries
CREATE TABLE IF NOT EXISTS leaderboard_entries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  period TEXT NOT NULL, -- 'daily', 'weekly', 'monthly', 'all-time'
  rank INTEGER,
  points INTEGER DEFAULT 0,
  period_start DATE NOT NULL,
  period_end DATE NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, period, period_start)
);

-- Challenges
CREATE TABLE IF NOT EXISTS challenges (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT,
  challenge_type TEXT, -- 'daily', 'weekly', 'special'
  goal_type TEXT, -- 'classifications', 'recycling', 'streak'
  goal_value INTEGER NOT NULL,
  points_reward INTEGER DEFAULT 0,
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- User challenge progress
CREATE TABLE IF NOT EXISTS user_challenges (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  challenge_id UUID REFERENCES challenges(id) ON DELETE CASCADE NOT NULL,
  current_progress INTEGER DEFAULT 0,
  completed BOOLEAN DEFAULT false,
  completed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, challenge_id)
);

-- Enable RLS
ALTER TABLE user_stats ENABLE ROW LEVEL SECURITY;
ALTER TABLE badges ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_badges ENABLE ROW LEVEL SECURITY;
ALTER TABLE leaderboard_entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE challenges ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_challenges ENABLE ROW LEVEL SECURITY;

-- RLS Policies for user_stats
CREATE POLICY "Users can view their own stats"
  ON user_stats FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own stats"
  ON user_stats FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own stats"
  ON user_stats FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- RLS Policies for badges (public read)
CREATE POLICY "Anyone can view badges"
  ON badges FOR SELECT
  TO authenticated
  USING (true);

-- RLS Policies for user_badges
CREATE POLICY "Users can view their own badges"
  ON user_badges FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can view others' badges for leaderboard"
  ON user_badges FOR SELECT
  TO authenticated
  USING (true);

-- RLS Policies for leaderboard
CREATE POLICY "Anyone can view leaderboard"
  ON leaderboard_entries FOR SELECT
  TO authenticated
  USING (true);

-- RLS Policies for challenges
CREATE POLICY "Anyone can view active challenges"
  ON challenges FOR SELECT
  TO authenticated
  USING (is_active = true);

-- RLS Policies for user_challenges
CREATE POLICY "Users can view their own challenge progress"
  ON user_challenges FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own challenge progress"
  ON user_challenges FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own challenge progress"
  ON user_challenges FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Create indexes
CREATE INDEX idx_user_stats_user_id ON user_stats(user_id);
CREATE INDEX idx_user_stats_points ON user_stats(total_points DESC);
CREATE INDEX idx_user_badges_user_id ON user_badges(user_id);
CREATE INDEX idx_leaderboard_period ON leaderboard_entries(period, period_start, rank);
CREATE INDEX idx_challenges_active ON challenges(is_active, start_date, end_date);
CREATE INDEX idx_user_challenges_user_id ON user_challenges(user_id, completed);

-- Insert default badges
INSERT INTO badges (name, description, icon, category, requirement_type, requirement_value, points_reward) VALUES
('First Steps', 'Classify your first waste item', '🌱', 'classification', 'count', 1, 10),
('Getting Started', 'Classify 10 waste items', '🌿', 'classification', 'count', 10, 50),
('Eco Warrior', 'Classify 50 waste items', '🌳', 'classification', 'count', 50, 200),
('Recycling Hero', 'Classify 100 waste items', '♻️', 'classification', 'count', 100, 500),
('Streak Starter', 'Maintain a 3-day streak', '🔥', 'streak', 'streak', 3, 30),
('On Fire', 'Maintain a 7-day streak', '🔥', 'streak', 'streak', 7, 100),
('Unstoppable', 'Maintain a 30-day streak', '⚡', 'streak', 'streak', 30, 500),
('Carbon Saver', 'Save 10kg of CO2', '🌍', 'recycling', 'co2', 10, 100),
('Planet Protector', 'Save 50kg of CO2', '🌎', 'recycling', 'co2', 50, 300),
('Earth Guardian', 'Save 100kg of CO2', '🌏', 'recycling', 'co2', 100, 1000)
ON CONFLICT DO NOTHING;
