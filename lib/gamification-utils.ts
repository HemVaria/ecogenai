// Utility functions that can be used in both client and server components
// These functions don't access the database

// Calculate rank from points
export function calculateRank(points: number): string {
  if (points < 100) return "Beginner"
  if (points < 500) return "Eco Explorer"
  if (points < 1000) return "Recycling Hero"
  if (points < 2500) return "Green Guardian"
  if (points < 5000) return "Sustainability Champion"
  if (points < 10000) return "Earth Protector"
  return "Eco Legend"
}

// Get points needed for next level
export function getPointsForNextLevel(currentLevel: number): number {
  return currentLevel * 100
}

// Interfaces (shared between client and server)
export interface UserStats {
  id: string
  user_id: string
  total_points: number
  level: number
  current_streak: number
  longest_streak: number
  last_activity_date: string
  total_co2_saved: number
  total_items_classified: number
  total_items_recycled: number
}

export interface Badge {
  id: string
  name: string
  description: string
  icon: string
  category: string
  requirement_type: string
  requirement_value: number
  points_reward: number
}

export interface UserBadge {
  id: string
  user_id: string
  badge_id: string
  earned_at: string
  badge: Badge
}

export interface LeaderboardEntry {
  rank: number
  user_id: string
  points: number
  username: string
  avatar_url?: string
  level: number
}
