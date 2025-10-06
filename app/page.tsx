"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import {
  ArrowRight,
  Recycle,
  Calendar,
  MapPin,
  ImageIcon,
  Sparkles,
  Leaf,
  Users,
  BarChart3,
  Clock,
  CheckCircle,
} from "lucide-react"
import { motion } from "framer-motion"
import { createClient } from "@/lib/supabase/client"

const features = [
  {
    id: "upload",
    icon: ImageIcon,
    title: "Upload Photo",
    description: "Take a picture of the waste that needs to be collected and upload it to our platform.",
    details:
      "Our AI-powered system can identify different types of waste materials and provide specific recycling guidelines. Simply snap a photo and let our technology do the rest.",
    color: "from-blue-500 to-cyan-500",
  },
  {
    id: "location",
    icon: MapPin,
    title: "Share Location",
    description: "Provide your location so waste management facilities know where to pick up the waste.",
    details:
      "We use secure location services to connect you with the nearest certified waste management facilities. Your privacy is protected while ensuring efficient service delivery.",
    color: "from-emerald-500 to-teal-500",
  },
  {
    id: "schedule",
    icon: Calendar,
    title: "Schedule Pickup",
    description: "Waste management facilities will review your request and schedule a convenient pickup time.",
    details:
      "Get real-time updates on pickup schedules, track your waste collection history, and receive notifications about environmental impact of your recycling efforts.",
    color: "from-purple-500 to-pink-500",
  },
]

const stats = [
  { icon: Users, value: "10K+", label: "Active Users" },
  { icon: Recycle, value: "50K+", label: "Items Recycled" },
  { icon: Leaf, value: "25T", label: "CO₂ Saved" },
  { icon: BarChart3, value: "95%", label: "Accuracy Rate" },
]

export default function Home() {
  const [user, setUser] = useState<any>(null)
  const [userStats, setUserStats] = useState({ classifications: 0, pickups: 0, pending: 0 })
  const [isLoading, setIsLoading] = useState(true)
  const supabase = createClient()

  useEffect(() => {
    const checkAuth = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser()
      setUser(user)

      if (user) {
        await loadUserStats()
      }

      setIsLoading(false)
    }

    checkAuth()

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null)
      if (session?.user) {
        loadUserStats()
      } else {
        setUserStats({ classifications: 0, pickups: 0, pending: 0 })
      }
    })

    return () => subscription.unsubscribe()
  }, [])

  const loadUserStats = async () => {
    try {
      // Get classification count
      const { count: classificationCount } = await supabase
        .from("waste_classifications")
        .select("*", { count: "exact", head: true })

      // Get pickup counts
      const { count: pickupCount } = await supabase.from("pickup_requests").select("*", { count: "exact", head: true })

      const { count: pendingCount } = await supabase
        .from("pickup_requests")
        .select("*", { count: "exact", head: true })
        .eq("status", "pending")

      setUserStats({
        classifications: classificationCount || 0,
        pickups: pickupCount || 0,
        pending: pendingCount || 0,
      })
    } catch (error) {
      console.error("Error loading user stats:", error)
    }
  }

  return (
    <div className="flex flex-col min-h-screen bg-gradient-to-br from-emerald-50 via-teal-50 to-cyan-50 dark:from-gray-950 dark:via-gray-900 dark:to-gray-950">
      <main className="flex-1">
        <section className="w-full py-20 md:py-32 lg:py-40 bg-white/30 dark:bg-gray-900/30">
          <div className="container px-6 md:px-8 mx-auto">
            <div className="grid gap-12 lg:grid-cols-2 lg:gap-16 items-center">
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8 }}
                className="flex flex-col justify-center space-y-8"
              >
                <div className="space-y-6">
                  <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.6, delay: 0.2 }}
                    className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-100 dark:bg-emerald-900 text-emerald-700 dark:text-emerald-300 rounded-full text-sm font-medium"
                  >
                    <Sparkles className="h-4 w-4" />
                    AI-Powered Waste Management
                  </motion.div>
                  <div className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm rounded-2xl p-6 shadow-lg">
                    <h1 className="text-4xl font-bold tracking-tight sm:text-6xl lg:text-7xl">
                      <span className="text-emerald-600 dark:text-emerald-400">Simplify Waste</span>
                      <br />
                      <span className="text-black dark:text-white">Collection & Recycling</span>
                    </h1>
                  </div>
                  <p className="max-w-[600px] text-gray-600 dark:text-gray-300 text-lg md:text-xl leading-relaxed">
                    {user
                      ? `Welcome back! Continue managing your waste with AI-powered classification and seamless pickup scheduling.`
                      : `Upload a picture of your waste, share your location, and we'll connect you with local waste
                      management facilities for scheduled pickups. Make recycling effortless with AI.`}
                  </p>
                </div>

                {user ? (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: 0.4 }}
                    className="space-y-6"
                  >
                    <div className="flex flex-wrap gap-4">
                      <Link href="/classify">
                        <Button
                          size="lg"
                          className="bg-emerald-600 hover:bg-emerald-700 text-white shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:scale-105 border-0"
                        >
                          <Sparkles className="mr-2 h-5 w-5" />
                          Classify Waste
                          <ArrowRight className="ml-2 h-5 w-5" />
                        </Button>
                      </Link>
                      <Link href="/schedule-pickup">
                        <Button
                          variant="outline"
                          size="lg"
                          className="border-2 border-emerald-200 dark:border-emerald-800 text-emerald-700 dark:text-emerald-300 hover:bg-emerald-50 dark:hover:bg-emerald-900 bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm shadow-lg hover:shadow-xl transition-all duration-300"
                        >
                          <Calendar className="mr-2 h-5 w-5" />
                          Schedule Pickup
                          <ArrowRight className="ml-2 h-5 w-5" />
                        </Button>
                      </Link>
                      <Link href="/dashboard">
                        <Button
                          variant="outline"
                          size="lg"
                          className="border-2 border-teal-200 dark:border-teal-800 text-teal-700 dark:text-teal-300 hover:bg-teal-50 dark:hover:bg-teal-900 bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm shadow-lg hover:shadow-xl transition-all duration-300"
                        >
                          Dashboard
                          <ArrowRight className="ml-2 h-5 w-5" />
                        </Button>
                      </Link>
                    </div>

                    {/* Personal Stats */}
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.6, delay: 0.6 }}
                      className="grid grid-cols-3 gap-4 pt-6"
                    >
                      <div className="text-center bg-white/60 dark:bg-gray-900/60 backdrop-blur-sm rounded-xl p-4 shadow-lg">
                        <div className="flex items-center justify-center w-10 h-10 mx-auto mb-2 bg-blue-100 dark:bg-blue-900 rounded-lg">
                          <BarChart3 className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                        </div>
                        <div className="text-xl font-bold text-black dark:text-white">{userStats.classifications}</div>
                        <div className="text-xs text-gray-600 dark:text-gray-400">Classifications</div>
                      </div>
                      <div className="text-center bg-white/60 dark:bg-gray-900/60 backdrop-blur-sm rounded-xl p-4 shadow-lg">
                        <div className="flex items-center justify-center w-10 h-10 mx-auto mb-2 bg-green-100 dark:bg-green-900 rounded-lg">
                          <CheckCircle className="h-5 w-5 text-green-600 dark:text-green-400" />
                        </div>
                        <div className="text-xl font-bold text-black dark:text-white">{userStats.pickups}</div>
                        <div className="text-xs text-gray-600 dark:text-gray-400">Total Pickups</div>
                      </div>
                      <div className="text-center bg-white/60 dark:bg-gray-900/60 backdrop-blur-sm rounded-xl p-4 shadow-lg">
                        <div className="flex items-center justify-center w-10 h-10 mx-auto mb-2 bg-yellow-100 dark:bg-yellow-900 rounded-lg">
                          <Clock className="h-5 w-5 text-yellow-600 dark:text-yellow-400" />
                        </div>
                        <div className="text-xl font-bold text-black dark:text-white">{userStats.pending}</div>
                        <div className="text-xs text-gray-600 dark:text-gray-400">Pending</div>
                      </div>
                    </motion.div>
                  </motion.div>
                ) : (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: 0.4 }}
                    className="flex flex-col gap-4 sm:flex-row"
                  >
                    <Link href="/classify">
                      <Button
                        size="lg"
                        className="bg-emerald-600 hover:bg-emerald-700 text-white shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:scale-105 border-0"
                      >
                        <Sparkles className="mr-2 h-5 w-5" />
                        AI Waste Classifier
                        <ArrowRight className="ml-2 h-5 w-5" />
                      </Button>
                    </Link>
                    <Link href="/upload">
                      <Button
                        variant="outline"
                        size="lg"
                        className="border-2 border-emerald-200 dark:border-emerald-800 text-emerald-700 dark:text-emerald-300 hover:bg-emerald-50 dark:hover:bg-emerald-900 bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm shadow-lg hover:shadow-xl transition-all duration-300"
                      >
                        Report Waste
                        <ArrowRight className="ml-2 h-5 w-5" />
                      </Button>
                    </Link>
                  </motion.div>
                )}

                {!user && (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: 0.6 }}
                    className="grid grid-cols-2 md:grid-cols-4 gap-6 pt-8"
                  >
                    {stats.map((stat, index) => (
                      <motion.div
                        key={stat.label}
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 0.4, delay: 0.8 + index * 0.1 }}
                        className="text-center"
                      >
                        <div className="flex items-center justify-center w-12 h-12 mx-auto mb-2 bg-emerald-100 dark:bg-emerald-900 rounded-xl">
                          <stat.icon className="h-6 w-6 text-emerald-600" />
                        </div>
                        <div className="text-2xl font-bold text-black dark:text-white">{stat.value}</div>
                        <div className="text-sm text-gray-600 dark:text-gray-400">{stat.label}</div>
                      </motion.div>
                    ))}
                  </motion.div>
                )}
              </motion.div>

              <motion.div
                initial={{ opacity: 0, x: 30 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.8, delay: 0.3 }}
                className="mx-auto w-full max-w-[600px] lg:max-w-none"
              >
                <div className="relative">
                  <div className="absolute inset-0 bg-gradient-to-r from-emerald-400 to-teal-400 rounded-3xl blur-3xl opacity-20 animate-pulse"></div>
                  <Card className="relative overflow-hidden border-0 shadow-2xl bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm">
                    <CardContent className="p-0">
                      <img
                        src="/modern-waste-management-ai-interface-dashboard.jpg"
                        alt="AI Waste Management Dashboard"
                        className="object-cover w-full h-[400px] lg:h-[500px]"
                      />
                    </CardContent>
                  </Card>
                </div>
              </motion.div>
            </div>
          </div>
        </section>

        <section className="w-full py-20 md:py-32 bg-white/50 dark:bg-gray-900/50 backdrop-blur-sm">
          <div className="container px-6 md:px-8 mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              viewport={{ once: true }}
              className="flex flex-col items-center justify-center space-y-6 text-center mb-16"
            >
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-teal-100 dark:bg-teal-900 text-teal-700 dark:text-teal-300 rounded-full text-sm font-medium">
                <Recycle className="h-4 w-4" />
                Simple Process
              </div>
              <h2 className="text-4xl font-bold tracking-tight sm:text-5xl">
                <span className="text-teal-700 dark:text-teal-400">How It Works</span>
              </h2>
              <p className="max-w-[800px] text-gray-600 dark:text-gray-300 text-lg md:text-xl leading-relaxed">
                Our platform connects waste generators with waste management facilities for efficient collection and
                recycling. Get started in three simple steps.
              </p>
            </motion.div>

            <div className="grid max-w-6xl mx-auto gap-8 lg:grid-cols-3">
              {features.map((feature, index) => (
                <motion.div
                  key={feature.id}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: index * 0.2 }}
                  viewport={{ once: true }}
                  whileHover={{ y: -8 }}
                  className="group"
                >
                  <Card className="h-full border-0 shadow-xl bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm overflow-hidden transition-all duration-300 hover:shadow-2xl">
                    <CardContent className="p-8">
                      <div className="space-y-6">
                        <div
                          className={`flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br ${feature.color} shadow-lg`}
                        >
                          <feature.icon className="h-8 w-8 text-white" />
                        </div>
                        <div className="space-y-3">
                          <h3 className="text-2xl font-bold text-gray-900 dark:text-white">{feature.title}</h3>
                          <p className="text-gray-600 dark:text-gray-300 leading-relaxed">{feature.description}</p>
                        </div>
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          whileHover={{ height: "auto", opacity: 1 }}
                          transition={{ duration: 0.3 }}
                          className="overflow-hidden"
                        >
                          <div className="pt-4 border-t border-gray-100 dark:border-gray-800">
                            <p className="text-sm text-gray-500 dark:text-gray-400 leading-relaxed">{feature.details}</p>
                          </div>
                        </motion.div>
                        <div className="flex items-center text-sm font-medium text-emerald-600 group-hover:text-emerald-700 transition-colors">
                          Learn more
                          <ArrowRight className="ml-1 h-4 w-4 transition-transform group-hover:translate-x-1" />
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>

            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.6 }}
              viewport={{ once: true }}
              className="text-center mt-16"
            >
              <Link href="/facilities">
                <Button
                  size="lg"
                  variant="outline"
                  className="border-2 border-teal-200 dark:border-teal-800 text-teal-700 dark:text-teal-300 hover:bg-teal-50 dark:hover:bg-teal-900 bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm shadow-lg hover:shadow-xl transition-all duration-300"
                >
                  For Waste Facilities
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </Link>
            </motion.div>
          </div>
        </section>
      </main>

      <footer className="border-t bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm">
        <div className="container px-6 md:px-8 py-8 mx-auto">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
            <p className="text-sm text-gray-600 dark:text-gray-400">© {new Date().getFullYear()} EcoGenAI. All rights reserved.</p>
            <nav className="sm:ml-auto flex gap-6">
              <Link href="/terms" className="text-sm hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors text-gray-600 dark:text-gray-400">
                Terms of Service
              </Link>
              <Link href="/privacy" className="text-sm hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors text-gray-600 dark:text-gray-400">
                Privacy Policy
              </Link>
            </nav>
          </div>
        </div>
      </footer>
    </div>
  )
}
