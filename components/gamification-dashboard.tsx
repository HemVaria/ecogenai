"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Trophy, Flame, Leaf, Award, TrendingUp, Users } from "lucide-react"

// Utility functions that don't require database access
function calculateRank(points: number): string {
  if (points < 100) return "Beginner"
  if (points < 500) return "Eco Explorer"
  if (points < 1000) return "Recycling Hero"
  if (points < 2500) return "Green Guardian"
  if (points < 5000) return "Sustainability Champion"
  if (points < 10000) return "Earth Protector"
  return "Eco Legend"
}

function getPointsForNextLevel(currentLevel: number): number {
  return currentLevel * 100
}

interface UserStats {
  total_points: number
  level: number
  current_streak: number
  longest_streak: number
  total_co2_saved: number
  total_items_classified: number
  total_items_recycled: number
}

interface UserBadge {
  id: string
  earned_at: string
  badge: {
    name: string
    description: string
    icon: string
    points_reward: number
  }
}

interface LeaderboardEntry {
  rank: number
  user_id: string
  username: string
  points: number
  level: number
  avatar_url?: string
}

export default function GamificationDashboard() {
  const [stats, setStats] = useState<UserStats | null>(null)
  const [badges, setBadges] = useState<UserBadge[]>([])
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchGamificationData()
  }, [])

  const fetchGamificationData = async () => {
    try {
      const [statsRes, badgesRes, leaderboardRes] = await Promise.all([
        fetch("/api/gamification?action=stats"),
        fetch("/api/gamification?action=badges"),
        fetch("/api/gamification?action=leaderboard&period=all-time&limit=10"),
      ])

      const [statsData, badgesData, leaderboardData] = await Promise.all([
        statsRes.json(),
        badgesRes.json(),
        leaderboardRes.json(),
      ])

      setStats(statsData)
      setBadges(Array.isArray(badgesData) ? badgesData : [])
      setLeaderboard(Array.isArray(leaderboardData) ? leaderboardData : [])
    } catch (error) {
      console.error("Error fetching gamification data:", error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    )
  }

  if (!stats) {
    return (
      <div className="text-center py-8">
        <p className="text-muted-foreground">No stats available yet. Start classifying waste to earn points!</p>
      </div>
    )
  }

  // Ensure stats has default values
  const safeStats = {
    total_points: stats.total_points || 0,
    level: stats.level || 1,
    current_streak: stats.current_streak || 0,
    longest_streak: stats.longest_streak || 0,
    total_co2_saved: stats.total_co2_saved || 0,
    total_items_classified: stats.total_items_classified || 0,
    total_items_recycled: stats.total_items_recycled || 0,
  }

  const rank = calculateRank(safeStats.total_points)
  const pointsForNext = getPointsForNextLevel(safeStats.level)
  const pointsProgress = (safeStats.total_points % 100) / 100 * 100

  return (
    <div className="space-y-6">
      {/* Stats Overview */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Level</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{safeStats.level}</div>
            <p className="text-xs text-muted-foreground">{rank}</p>
            <Progress value={pointsProgress} className="mt-2" />
            <p className="text-xs text-muted-foreground mt-1">
              {safeStats.total_points % 100}/{pointsForNext} XP to Level {safeStats.level + 1}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Points</CardTitle>
            <Trophy className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{safeStats.total_points.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">XP earned</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Current Streak</CardTitle>
            <Flame className="h-4 w-4 text-orange-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{safeStats.current_streak} 🔥</div>
            <p className="text-xs text-muted-foreground">Longest: {safeStats.longest_streak} days</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">CO2 Saved</CardTitle>
            <Leaf className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{safeStats.total_co2_saved.toFixed(2)} kg</div>
            <p className="text-xs text-muted-foreground">{safeStats.total_items_recycled} items recycled</p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="badges" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="badges">Badges</TabsTrigger>
          <TabsTrigger value="leaderboard">Leaderboard</TabsTrigger>
        </TabsList>

        <TabsContent value="badges" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Award className="h-5 w-5" />
                Your Achievements
              </CardTitle>
              <CardDescription>
                {badges.length} badge{badges.length !== 1 ? "s" : ""} earned
              </CardDescription>
            </CardHeader>
            <CardContent>
              {badges.length === 0 ? (
                <p className="text-center text-muted-foreground py-8">
                  No badges yet. Keep classifying to earn your first badge!
                </p>
              ) : (
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                  {badges.map((userBadge) => (
                    <Card key={userBadge.id}>
                      <CardContent className="pt-6">
                        <div className="flex flex-col items-center text-center space-y-2">
                          <div className="text-4xl">{userBadge.badge.icon}</div>
                          <div className="font-semibold">{userBadge.badge.name}</div>
                          <p className="text-xs text-muted-foreground">{userBadge.badge.description}</p>
                          <Badge variant="secondary">+{userBadge.badge.points_reward} XP</Badge>
                          <p className="text-xs text-muted-foreground">
                            Earned {new Date(userBadge.earned_at).toLocaleDateString()}
                          </p>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="leaderboard" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                Global Leaderboard
              </CardTitle>
              <CardDescription>Top eco-warriors of all time</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {leaderboard.map((entry) => (
                  <div
                    key={entry.user_id}
                    className="flex items-center justify-between p-3 rounded-lg bg-muted/50 hover:bg-muted transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className={`flex items-center justify-center w-8 h-8 rounded-full font-bold ${
                          entry.rank === 1
                            ? "bg-yellow-500 text-white"
                            : entry.rank === 2
                            ? "bg-gray-400 text-white"
                            : entry.rank === 3
                            ? "bg-orange-600 text-white"
                            : "bg-muted-foreground/20"
                        }`}
                      >
                        {entry.rank}
                      </div>
                      <div>
                        <div className="font-semibold">{entry.username}</div>
                        <div className="text-xs text-muted-foreground">Level {entry.level}</div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-bold">{entry.points.toLocaleString()}</div>
                      <div className="text-xs text-muted-foreground">XP</div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
