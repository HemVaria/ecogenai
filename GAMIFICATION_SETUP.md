# 🎮 Gamification System Setup

## Quick Setup (5 minutes)

### Step 1: Open Supabase SQL Editor

1. Go to [Supabase Dashboard](https://supabase.com/dashboard)
2. Select your project: `v0-manan-waste-management`
3. Click on **SQL Editor** in the left sidebar
4. Click **New query**

### Step 2: Run the Gamification Schema

Copy and paste the entire contents of `scripts/004_gamification_schema.sql` into the SQL editor and click **Run**.

This will create:
- ✅ `user_stats` - User points, levels, streaks, CO2 savings
- ✅ `badges` - Achievement definitions (10 default badges included)
- ✅ `user_badges` - User's earned badges
- ✅ `leaderboard_entries` - Leaderboard rankings
- ✅ `challenges` - Active challenges
- ✅ `user_challenges` - User challenge progress

### Step 3: Verify Tables Created

Run this query to verify:

```sql
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
  AND table_name IN ('user_stats', 'badges', 'user_badges', 'leaderboard_entries', 'challenges', 'user_challenges');
```

You should see all 6 tables listed.

### Step 4: Check Default Badges

Run this to see the 10 default badges:

```sql
SELECT name, description, icon, category, requirement_value, points_reward 
FROM badges 
ORDER BY requirement_value;
```

### Step 5: Refresh Your App

Refresh your browser at `http://localhost:3000/gamification` and the errors should be gone!

## What You'll Get

### 📊 User Stats Tracking
- Total points and levels
- Current streak & longest streak
- Total CO2 saved
- Items classified & recycled

### 🏆 Badge System (10 Default Badges)

**Classification Badges:**
- 🌱 First Steps (1 item) - 10 points
- 🌿 Getting Started (10 items) - 50 points
- 🌳 Eco Warrior (50 items) - 200 points
- ♻️ Recycling Hero (100 items) - 500 points

**Streak Badges:**
- 🔥 Streak Starter (3 days) - 30 points
- 🔥 On Fire (7 days) - 100 points
- ⚡ Unstoppable (30 days) - 500 points

**CO2 Saving Badges:**
- 🌍 Carbon Saver (10kg) - 100 points
- 🌎 Planet Protector (50kg) - 300 points
- 🌏 Earth Guardian (100kg) - 1000 points

### 🎯 Leaderboard System
- Daily, weekly, monthly, and all-time rankings
- Points-based competition

### 🎪 Challenge System
- Daily and weekly challenges
- Special events
- Progress tracking

## Troubleshooting

**If you see "Could not find table" errors:**
1. Make sure you ran the SQL script in the correct Supabase project
2. Check that your `.env.local` has the correct `NEXT_PUBLIC_SUPABASE_URL`
3. Verify tables exist using the verification query above

**If badges don't appear:**
1. Check that the INSERT statement ran successfully
2. Run: `SELECT COUNT(*) FROM badges;` - should return 10

**If you need to reset:**
```sql
-- WARNING: This will delete all gamification data
DROP TABLE IF EXISTS user_challenges CASCADE;
DROP TABLE IF EXISTS challenges CASCADE;
DROP TABLE IF EXISTS leaderboard_entries CASCADE;
DROP TABLE IF EXISTS user_badges CASCADE;
DROP TABLE IF EXISTS badges CASCADE;
DROP TABLE IF EXISTS user_stats CASCADE;

-- Then re-run the schema from 004_gamification_schema.sql
```

## Next Steps

After setup, users will automatically:
- Earn points for waste classifications
- Unlock badges based on achievements
- See their rank on the leaderboard
- Track their environmental impact

The system updates in real-time as users interact with the app! 🎉
