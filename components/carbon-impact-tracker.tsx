"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Leaf, TrendingUp, TreePine, Droplet } from "lucide-react"

interface CarbonStats {
  total_co2_saved: number
  total_items_recycled: number
  total_items_classified: number
}

export default function CarbonImpactTracker() {
  const [stats, setStats] = useState<CarbonStats | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchCarbonStats()
  }, [])

  const fetchCarbonStats = async () => {
    try {
      const res = await fetch("/api/gamification?action=stats")
      const data = await res.json()
      setStats(data)
    } catch (error) {
      console.error("Error fetching carbon stats:", error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Environmental Impact</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (!stats) {
    return null
  }

  const co2Saved = stats.total_co2_saved || 0

  // Environmental equivalents (approximate calculations)
  const treesPlanted = Math.floor(co2Saved / 21) // 1 tree absorbs ~21kg CO2/year
  const milesNotDriven = Math.floor(co2Saved / 0.411) // 1 mile of driving = ~0.411kg CO2
  const waterBottlesSaved = Math.floor(stats.total_items_recycled * 0.7) // Assuming 70% plastic

  const impactMetrics = [
    {
      icon: TreePine,
      value: treesPlanted,
      label: "Trees Planted",
      description: "Equivalent environmental impact",
      color: "text-green-600",
      bgColor: "bg-green-50 dark:bg-green-950",
    },
    {
      icon: TrendingUp,
      value: `${milesNotDriven.toLocaleString()}`,
      label: "Miles Not Driven",
      description: "In carbon emissions saved",
      color: "text-blue-600",
      bgColor: "bg-blue-50 dark:bg-blue-950",
    },
    {
      icon: Droplet,
      value: waterBottlesSaved,
      label: "Plastic Items",
      description: "Diverted from landfills",
      color: "text-cyan-600",
      bgColor: "bg-cyan-50 dark:bg-cyan-950",
    },
    {
      icon: Leaf,
      value: `${co2Saved.toFixed(2)} kg`,
      label: "CO₂ Saved",
      description: "Total carbon emissions prevented",
      color: "text-emerald-600",
      bgColor: "bg-emerald-50 dark:bg-emerald-950",
    },
  ]

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Leaf className="h-5 w-5 text-green-600" />
          Your Environmental Impact
        </CardTitle>
        <CardDescription>
          See the real-world impact of your waste management efforts
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid gap-4 md:grid-cols-2">
          {impactMetrics.map((metric, index) => {
            const Icon = metric.icon
            return (
              <div
                key={index}
                className={`p-4 rounded-lg ${metric.bgColor} border border-opacity-20`}
              >
                <div className="flex items-start gap-3">
                  <div className={`p-2 rounded-lg bg-white/50 dark:bg-black/20`}>
                    <Icon className={`h-5 w-5 ${metric.color}`} />
                  </div>
                  <div className="flex-1">
                    <div className={`text-2xl font-bold ${metric.color}`}>
                      {metric.value}
                    </div>
                    <div className="font-semibold text-sm mt-1">{metric.label}</div>
                    <p className="text-xs text-muted-foreground mt-1">
                      {metric.description}
                    </p>
                  </div>
                </div>
              </div>
            )
          })}
        </div>

        {co2Saved > 0 && (
          <div className="mt-6 p-4 rounded-lg bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-950 dark:to-emerald-950 border border-green-200 dark:border-green-800">
            <p className="text-sm font-semibold text-green-700 dark:text-green-300">
              🌍 Amazing work! You've made a positive impact on the environment.
            </p>
            <p className="text-xs text-green-600 dark:text-green-400 mt-1">
              Keep classifying and recycling to increase your environmental contribution!
            </p>
          </div>
        )}

        {co2Saved === 0 && (
          <div className="mt-6 p-4 rounded-lg bg-muted border">
            <p className="text-sm font-semibold">
              🌱 Start your eco-journey today!
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              Classify your first waste item to begin tracking your environmental impact.
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
