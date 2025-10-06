import { createClient } from "@/lib/supabase/server"

// Re-export types and utilities from gamification-utils
export type { UserStats, Badge, UserBadge, LeaderboardEntry } from "./gamification-utils"
export { calculateRank, getPointsForNextLevel } from "./gamification-utils"

import type { UserStats, Badge, UserBadge, LeaderboardEntry } from "./gamification-utils"

function isSchemaMissingError(error: any) {
  return (
    error?.code === "PGRST205" ||
    typeof error?.message === "string" && error.message.includes("Could not find the table")
  )
}

function mockUserStats(userId: string): UserStats {
  const total_points = 1240
  const level = Math.floor(total_points / 100) + 1
  return {
    id: "demo-stats",
    user_id: userId || "demo-user",
    total_points,
    level,
    current_streak: 4,
    longest_streak: 12,
    last_activity_date: new Date().toISOString(),
    total_co2_saved: 37.5,
    total_items_classified: 58,
    total_items_recycled: 41,
  }
}

function mockBadges(): UserBadge[] {
  const now = new Date().toISOString()
  return [
    {
      id: "demo-ub-1",
      user_id: "demo-user",
      badge_id: "demo-b-1",
      earned_at: now,
      badge: {
        id: "demo-b-1" as any,
        name: "First Steps",
        description: "Classify your first waste item",
        icon: "🌱",
        category: "classification",
        requirement_type: "count",
        requirement_value: 1,
        points_reward: 10,
      } as any,
    },
    {
      id: "demo-ub-2",
      user_id: "demo-user",
      badge_id: "demo-b-2",
      earned_at: now,
      badge: {
        id: "demo-b-2" as any,
        name: "Getting Started",
        description: "Classify 10 waste items",
        icon: "🌿",
        category: "classification",
        requirement_type: "count",
        requirement_value: 10,
        points_reward: 50,
      } as any,
    },
  ]
}

function mockLeaderboard(limit = 10): LeaderboardEntry[] {
  return Array.from({ length: limit }).map((_, i) => ({
    rank: i + 1,
    user_id: `demo-u-${i + 1}`,
    points: 2500 - i * 125,
    username: i === 0 ? "You" : `EcoUser${i + 1}`,
    avatar_url: undefined,
    level: Math.floor((2500 - i * 125) / 100) + 1,
  }))
}

function mockAllBadges(): Badge[] {
  return [
    { id: "b1" as any, name: "First Steps", description: "Classify your first waste item", icon: "🌱", category: "classification", requirement_type: "count", requirement_value: 1, points_reward: 10 },
    { id: "b2" as any, name: "Getting Started", description: "Classify 10 waste items", icon: "🌿", category: "classification", requirement_type: "count", requirement_value: 10, points_reward: 50 },
    { id: "b3" as any, name: "Eco Warrior", description: "Classify 50 waste items", icon: "🌳", category: "classification", requirement_type: "count", requirement_value: 50, points_reward: 200 },
    { id: "b4" as any, name: "Recycling Hero", description: "Classify 100 waste items", icon: "♻️", category: "classification", requirement_type: "count", requirement_value: 100, points_reward: 500 },
    { id: "b5" as any, name: "Streak Starter", description: "Maintain a 3-day streak", icon: "🔥", category: "streak", requirement_type: "streak", requirement_value: 3, points_reward: 30 },
    { id: "b6" as any, name: "On Fire", description: "Maintain a 7-day streak", icon: "🔥", category: "streak", requirement_type: "streak", requirement_value: 7, points_reward: 100 },
    { id: "b7" as any, name: "Unstoppable", description: "Maintain a 30-day streak", icon: "⚡", category: "streak", requirement_type: "streak", requirement_value: 30, points_reward: 500 },
    { id: "b8" as any, name: "Carbon Saver", description: "Save 10kg of CO2", icon: "🌍", category: "recycling", requirement_type: "co2", requirement_value: 10, points_reward: 100 },
    { id: "b9" as any, name: "Planet Protector", description: "Save 50kg of CO2", icon: "🌎", category: "recycling", requirement_type: "co2", requirement_value: 50, points_reward: 300 },
    { id: "b10" as any, name: "Earth Guardian", description: "Save 100kg of CO2", icon: "🌏", category: "recycling", requirement_type: "co2", requirement_value: 100, points_reward: 1000 },
  ] as any
}

export async function getUserStats(userId: string): Promise<UserStats | null> {
  const supabase = await createClient()
  const { data, error } = await supabase.from("user_stats").select("*").eq("user_id", userId).single()

  if (error) {
    console.error("[v0] Error fetching user stats:", error)
    if (isSchemaMissingError(error)) {
      return mockUserStats(userId)
    }
    return null
  }

  return data
}

export async function getUserBadges(userId: string): Promise<UserBadge[]> {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from("user_badges")
    .select("*, badge:badges(*)")
    .eq("user_id", userId)
    .order("earned_at", { ascending: false })

  if (error) {
    console.error("[v0] Error fetching user badges:", error)
    if (isSchemaMissingError(error)) {
      return mockBadges()
    }
    return []
  }

  return data as unknown as UserBadge[]
}

export async function getLeaderboard(period: "daily" | "weekly" | "monthly" | "all-time" = "all-time", limit = 10): Promise<LeaderboardEntry[]> {
  const supabase = await createClient()

  // For all-time leaderboard, use user_stats
  if (period === "all-time") {
    const { data, error } = await supabase
      .from("user_stats")
      .select("user_id, total_points, level, profiles(username, avatar_url)")
      .order("total_points", { ascending: false })
      .limit(limit)

    if (error) {
      console.error("[v0] Error fetching leaderboard:", error)
      if (isSchemaMissingError(error)) {
        return mockLeaderboard(limit)
      }
      return []
    }

    return data.map((entry, index) => ({
      rank: index + 1,
      user_id: entry.user_id,
      points: entry.total_points,
      username: (entry.profiles as any)?.username || "Anonymous",
      avatar_url: (entry.profiles as any)?.avatar_url,
      level: entry.level,
    }))
  }

  // For period-based leaderboards
  const today = new Date()
  let periodStart: Date

  switch (period) {
    case "daily":
      periodStart = new Date(today.getFullYear(), today.getMonth(), today.getDate())
      break
    case "weekly":
      const dayOfWeek = today.getDay()
      periodStart = new Date(today.getTime() - dayOfWeek * 24 * 60 * 60 * 1000)
      periodStart.setHours(0, 0, 0, 0)
      break
    case "monthly":
      periodStart = new Date(today.getFullYear(), today.getMonth(), 1)
      break
    default:
      periodStart = new Date(0)
  }

  const { data, error } = await supabase
    .from("leaderboard_entries")
    .select("*, profiles(username, avatar_url)")
    .eq("period", period)
    .gte("period_start", periodStart.toISOString())
    .order("rank", { ascending: true })
    .limit(limit)

  if (error) {
    console.error("[v0] Error fetching leaderboard:", error)
    if (isSchemaMissingError(error)) {
      return mockLeaderboard(limit)
    }
    return []
  }

  return data.map((entry) => ({
    rank: entry.rank,
    user_id: entry.user_id,
    points: entry.points,
    username: (entry.profiles as any)?.username || "Anonymous",
    avatar_url: (entry.profiles as any)?.avatar_url,
    level: 1,
  }))
}

export async function getAllBadges(): Promise<Badge[]> {
  const supabase = await createClient()
  const { data, error } = await supabase.from("badges").select("*").order("requirement_value", { ascending: true })

  if (error) {
    console.error("[v0] Error fetching badges:", error)
    if (isSchemaMissingError(error)) {
      return mockAllBadges()
    }
    return []
  }

  return data
}

export async function getChallenges() {
  const supabase = await createClient()
  const today = new Date().toISOString()

  const { data, error } = await supabase
    .from("challenges")
    .select("*")
    .eq("is_active", true)
    .lte("start_date", today)
    .gte("end_date", today)
    .order("end_date", { ascending: true })

  if (error) {
    console.error("[v0] Error fetching challenges:", error)
    if (isSchemaMissingError(error)) {
      // minimal mock challenge
      const todayISO = new Date().toISOString().slice(0, 10)
      return [
        {
          id: "demo-ch-1",
          title: "Weekly Recycler",
          description: "Recycle 20 items this week",
          challenge_type: "weekly",
          goal_type: "recycling",
          goal_value: 20,
          points_reward: 100,
          start_date: todayISO,
          end_date: todayISO,
          is_active: true,
          created_at: new Date().toISOString(),
        },
      ] as any
    }
    return []
  }

  return data
}

export async function getUserChallengeProgress(userId: string) {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from("user_challenges")
    .select("*, challenge:challenges(*)")
    .eq("user_id", userId)
    .order("updated_at", { ascending: false })

  if (error) {
    console.error("[v0] Error fetching user challenges:", error)
    if (isSchemaMissingError(error)) {
      return [
        {
          id: "demo-uc-1",
          user_id: userId || "demo-user",
          challenge_id: "demo-ch-1",
          current_progress: 12,
          completed: false,
          completed_at: null,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
          challenge: {
            id: "demo-ch-1",
            title: "Weekly Recycler",
            description: "Recycle 20 items this week",
            challenge_type: "weekly",
            goal_type: "recycling",
            goal_value: 20,
            points_reward: 100,
            start_date: new Date().toISOString(),
            end_date: new Date(Date.now() + 6 * 86400000).toISOString(),
            is_active: true,
            created_at: new Date().toISOString(),
          },
        },
      ] as any
    }
    return []
  }

  return data
}
