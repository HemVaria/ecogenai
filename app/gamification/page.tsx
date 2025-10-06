import GamificationDashboard from "@/components/gamification-dashboard"
import CarbonImpactTracker from "@/components/carbon-impact-tracker"
import { Metadata } from "next"

export const metadata: Metadata = {
  title: "Gamification - Waste Management",
  description: "Track your progress, earn badges, and compete on the leaderboard",
}

export default function GamificationPage() {
  return (
    <div className="container mx-auto px-4 py-8 max-w-7xl">
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">🎮 Your Progress</h1>
          <p className="text-muted-foreground mt-2">
            Track your eco-journey, earn badges, and compete with the community
          </p>
        </div>
        <CarbonImpactTracker />
        <GamificationDashboard />
      </div>
    </div>
  )
}
