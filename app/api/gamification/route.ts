import { type NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { getUserStats, getUserBadges, getLeaderboard, getAllBadges, getChallenges, getUserChallengeProgress } from "@/lib/gamification"

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const searchParams = request.nextUrl.searchParams
    const action = searchParams.get("action")

    switch (action) {
      case "stats":
        const stats = await getUserStats(user.id)
        return NextResponse.json(stats)

      case "badges":
        const badges = await getUserBadges(user.id)
        return NextResponse.json(badges)

      case "leaderboard":
        const period = (searchParams.get("period") as any) || "all-time"
        const limit = parseInt(searchParams.get("limit") || "10")
        const leaderboard = await getLeaderboard(period, limit)
        return NextResponse.json(leaderboard)

      case "all-badges":
        const allBadges = await getAllBadges()
        return NextResponse.json(allBadges)

      case "challenges":
        const challenges = await getChallenges()
        return NextResponse.json(challenges)

      case "challenge-progress":
        const progress = await getUserChallengeProgress(user.id)
        return NextResponse.json(progress)

      default:
        return NextResponse.json({ error: "Invalid action" }, { status: 400 })
    }
  } catch (error) {
    console.error("[v0] Gamification API error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
