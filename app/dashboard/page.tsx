"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import {
  Recycle,
  Plus,
  Clock,
  CheckCircle,
  X,
  Calendar,
  MapPin,
  Truck,
  BarChart3,
  History,
  User,
  LogOut,
} from "lucide-react"
import { createClient } from "@/lib/supabase/client"
import { useRouter } from "next/navigation"
import { motion } from "framer-motion"

interface PickupRequest {
  id: string
  address: string
  waste_types: string[]
  preferred_date: string
  preferred_time_slot: string
  special_instructions: string | null
  status: "pending" | "confirmed" | "in_progress" | "completed" | "cancelled"
  created_at: string
  updated_at: string
}

interface ClassificationHistory {
  id: string
  image_url: string
  classification_result: {
    category: string
    confidence: number
  }
  created_at: string
}

export default function DashboardPage() {
  const [user, setUser] = useState<any>(null)
  const [pickupRequests, setPickupRequests] = useState<PickupRequest[]>([])
  const [classificationHistory, setClassificationHistory] = useState<ClassificationHistory[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [activeTab, setActiveTab] = useState("overview")
  const router = useRouter()
  const supabase = createClient()

  useEffect(() => {
    const checkAuth = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser()

      if (!user) {
        router.push("/auth/login")
        return
      }

      setUser(user)
      await loadDashboardData()
      setIsLoading(false)
    }

    checkAuth()

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!session?.user) {
        router.push("/auth/login")
      }
    })

    return () => subscription.unsubscribe()
  }, [])

  const loadDashboardData = async () => {
    try {
      // Load pickup requests
      const { data: pickups, error: pickupError } = await supabase
        .from("pickup_requests")
        .select("*")
        .order("created_at", { ascending: false })

      if (pickupError) throw pickupError
      setPickupRequests(pickups || [])

      // Load classification history
      const { data: classifications, error: classificationError } = await supabase
        .from("waste_classifications")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(5)

      if (classificationError) throw classificationError
      setClassificationHistory(classifications || [])
    } catch (error) {
      console.error("Error loading dashboard data:", error)
    }
  }

  const handleSignOut = async () => {
    await supabase.auth.signOut()
    router.push("/")
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "pending":
        return (
          <Badge variant="outline" className="flex items-center gap-1 text-yellow-700 border-yellow-300 bg-yellow-50">
            <Clock className="h-3 w-3" /> Pending
          </Badge>
        )
      case "confirmed":
        return (
          <Badge className="bg-blue-500 hover:bg-blue-600 flex items-center gap-1">
            <Calendar className="h-3 w-3" /> Confirmed
          </Badge>
        )
      case "in_progress":
        return (
          <Badge className="bg-orange-500 hover:bg-orange-600 flex items-center gap-1">
            <Truck className="h-3 w-3" /> In Progress
          </Badge>
        )
      case "completed":
        return (
          <Badge className="bg-green-500 hover:bg-green-600 flex items-center gap-1">
            <CheckCircle className="h-3 w-3" /> Completed
          </Badge>
        )
      case "cancelled":
        return (
          <Badge variant="destructive" className="flex items-center gap-1">
            <X className="h-3 w-3" /> Cancelled
          </Badge>
        )
      default:
        return <Badge variant="outline">{status}</Badge>
    }
  }

  const getStats = () => {
    const total = pickupRequests.length
    const pending = pickupRequests.filter((r) => r.status === "pending").length
    const completed = pickupRequests.filter((r) => r.status === "completed").length
    const classifications = classificationHistory.length

    return { total, pending, completed, classifications }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-teal-50 to-cyan-50 dark:from-gray-950 dark:via-gray-900 dark:to-gray-950 flex items-center justify-center">
        <div className="text-center">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Number.POSITIVE_INFINITY, ease: "linear" }}
            className="w-12 h-12 border-4 border-emerald-600 border-t-transparent rounded-full mx-auto mb-4"
          />
          <p className="text-gray-600 dark:text-gray-400">Loading dashboard...</p>
        </div>
      </div>
    )
  }

  const stats = getStats()

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-teal-50 to-cyan-50 dark:from-gray-950 dark:via-gray-900 dark:to-gray-950">
      <div className="container mx-auto px-6 py-8">
        <div className="space-y-8">
          {/* Stats Overview */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
          >
            <Card className="border-0 shadow-xl bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Pickups</p>
                    <p className="text-3xl font-bold text-gray-900 dark:text-white">{stats.total}</p>
                  </div>
                  <div className="p-3 bg-emerald-100 dark:bg-emerald-900 rounded-lg">
                    <Truck className="h-6 w-6 text-emerald-600 dark:text-emerald-400" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-xl bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Pending</p>
                    <p className="text-3xl font-bold text-yellow-600 dark:text-yellow-400">{stats.pending}</p>
                  </div>
                  <div className="p-3 bg-yellow-100 dark:bg-yellow-900 rounded-lg">
                    <Clock className="h-6 w-6 text-yellow-600 dark:text-yellow-400" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-xl bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Completed</p>
                    <p className="text-3xl font-bold text-green-600 dark:text-green-400">{stats.completed}</p>
                  </div>
                  <div className="p-3 bg-green-100 dark:bg-green-900 rounded-lg">
                    <CheckCircle className="h-6 w-6 text-green-600 dark:text-green-400" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-xl bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Classifications</p>
                    <p className="text-3xl font-bold text-blue-600 dark:text-blue-400">{stats.classifications}</p>
                  </div>
                  <div className="p-3 bg-blue-100 dark:bg-blue-900 rounded-lg">
                    <BarChart3 className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Quick Actions */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="flex flex-wrap gap-4"
          >
            <Link href="/schedule-pickup">
              <Button className="bg-emerald-600 hover:bg-emerald-700 text-white">
                <Plus className="mr-2 h-4 w-4" />
                Schedule Pickup
              </Button>
            </Link>
            <Link href="/classify">
              <Button
                variant="outline"
                className="border-emerald-600 dark:border-emerald-400 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-900/20 bg-transparent"
              >
                <Recycle className="mr-2 h-4 w-4" />
                Classify Waste
              </Button>
            </Link>
          </motion.div>

          {/* Main Content Tabs */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
              <TabsList className="grid w-full grid-cols-3 bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm">
                <TabsTrigger value="overview">Pickup Requests</TabsTrigger>
                <TabsTrigger value="history">Classification History</TabsTrigger>
                <TabsTrigger value="profile">Profile</TabsTrigger>
              </TabsList>

              <TabsContent value="overview" className="mt-6">
                <Card className="border-0 shadow-xl bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-gray-900 dark:text-white">
                      <Truck className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
                      Pickup Requests
                    </CardTitle>
                    <CardDescription className="dark:text-gray-400">Manage your waste collection requests</CardDescription>
                  </CardHeader>
                  <CardContent>
                    {pickupRequests.length === 0 ? (
                      <div className="text-center py-12">
                        <Truck className="h-16 w-16 mx-auto text-gray-300 dark:text-gray-700 mb-4" />
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">No pickup requests yet</h3>
                        <p className="text-gray-600 dark:text-gray-400 mb-6">Schedule your first waste pickup to get started</p>
                        <Link href="/schedule-pickup">
                          <Button className="bg-emerald-600 hover:bg-emerald-700">
                            <Plus className="mr-2 h-4 w-4" />
                            Schedule Pickup
                          </Button>
                        </Link>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        {pickupRequests.map((request, index) => (
                          <motion.div
                            key={request.id}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.3, delay: index * 0.1 }}
                          >
                            <Card className="border border-gray-200 dark:border-gray-700 hover:shadow-md transition-shadow">
                              <CardContent className="p-6">
                                <div className="flex items-start justify-between mb-4">
                                  <div className="flex-1">
                                    <div className="flex items-center gap-3 mb-2">
                                      <h3 className="font-semibold text-gray-900 dark:text-white">Pickup Request</h3>
                                      {getStatusBadge(request.status)}
                                    </div>
                                    <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400 mb-2">
                                      <MapPin className="h-4 w-4" />
                                      <span className="text-sm">{request.address}</span>
                                    </div>
                                    <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400 mb-3">
                                      <Calendar className="h-4 w-4" />
                                      <span className="text-sm">
                                        {new Date(request.preferred_date).toLocaleDateString()} at{" "}
                                        {request.preferred_time_slot}
                                      </span>
                                    </div>
                                    <div className="flex flex-wrap gap-2 mb-3">
                                      {request.waste_types.map((type, idx) => (
                                        <Badge key={idx} variant="outline" className="text-xs">
                                          {type}
                                        </Badge>
                                      ))}
                                    </div>
                                    {request.special_instructions && (
                                      <p className="text-sm text-gray-600 dark:text-gray-300 bg-gray-50 dark:bg-gray-800 p-3 rounded-lg">
                                        <strong>Instructions:</strong> {request.special_instructions}
                                      </p>
                                    )}
                                  </div>
                                </div>
                                <div className="flex justify-between items-center text-xs text-gray-500 dark:text-gray-400">
                                  <span>Created: {new Date(request.created_at).toLocaleDateString()}</span>
                                  <span>Updated: {new Date(request.updated_at).toLocaleDateString()}</span>
                                </div>
                              </CardContent>
                            </Card>
                          </motion.div>
                        ))}
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="history" className="mt-6">
                <Card className="border-0 shadow-xl bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-gray-900 dark:text-white">
                      <History className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
                      Classification History
                    </CardTitle>
                    <CardDescription className="dark:text-gray-400">Your recent waste classifications</CardDescription>
                  </CardHeader>
                  <CardContent>
                    {classificationHistory.length === 0 ? (
                      <div className="text-center py-12">
                        <BarChart3 className="h-16 w-16 mx-auto text-gray-300 dark:text-gray-700 mb-4" />
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">No classifications yet</h3>
                        <p className="text-gray-600 dark:text-gray-400 mb-6">Start classifying waste to see your history here</p>
                        <Link href="/classify">
                          <Button className="bg-emerald-600 hover:bg-emerald-700">
                            <Recycle className="mr-2 h-4 w-4" />
                            Classify Waste
                          </Button>
                        </Link>
                      </div>
                    ) : (
                      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                        {classificationHistory.map((item, index) => (
                          <motion.div
                            key={item.id}
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ duration: 0.3, delay: index * 0.1 }}
                          >
                            <Card className="border border-gray-200 dark:border-gray-700 hover:shadow-md transition-shadow">
                              <div className="aspect-video w-full overflow-hidden rounded-t-lg">
                                <img
                                  src={item.image_url || "/placeholder.svg"}
                                  alt="Classified waste"
                                  className="h-full w-full object-cover"
                                />
                              </div>
                              <CardContent className="p-4">
                                <div className="flex items-center justify-between mb-2">
                                  <Badge className="bg-emerald-100 dark:bg-emerald-900 text-emerald-800 dark:text-emerald-200">
                                    {item.classification_result.category}
                                  </Badge>
                                  <span className="text-sm text-gray-600 dark:text-gray-400">
                                    {Math.round(item.classification_result.confidence)}%
                                  </span>
                                </div>
                                <p className="text-xs text-gray-500 dark:text-gray-400">
                                  {new Date(item.created_at).toLocaleDateString()}
                                </p>
                              </CardContent>
                            </Card>
                          </motion.div>
                        ))}
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="profile" className="mt-6">
                <Card className="border-0 shadow-xl bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-gray-900 dark:text-white">
                      <User className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
                      Profile Information
                    </CardTitle>
                    <CardDescription className="dark:text-gray-400">Manage your account settings</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="grid gap-4">
                      <div>
                        <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Email</label>
                        <p className="text-gray-900 dark:text-white bg-gray-50 dark:bg-gray-800 p-3 rounded-lg">{user?.email}</p>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Member Since</label>
                        <p className="text-gray-900 dark:text-white bg-gray-50 dark:bg-gray-800 p-3 rounded-lg">
                          {new Date(user?.created_at).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                    <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
                      <Button
                        variant="outline"
                        onClick={handleSignOut}
                        className="text-red-600 dark:text-red-400 border-red-600 dark:border-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 bg-transparent"
                      >
                        <LogOut className="mr-2 h-4 w-4" />
                        Sign Out
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </motion.div>
        </div>
      </div>
    </div>
  )
}
