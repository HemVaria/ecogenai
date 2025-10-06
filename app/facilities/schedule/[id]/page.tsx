"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Recycle, ArrowLeft, Calendar, Clock, Loader2, Truck } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

export default function FacilitySchedulePickupPage({ params }: { params: { id: string } }) {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [date, setDate] = useState("")
  const [timeFrom, setTimeFrom] = useState("")
  const [timeTo, setTimeTo] = useState("")
  const [vehicleType, setVehicleType] = useState("")
  const [notes, setNotes] = useState("")

  // In a real implementation, you would fetch the report details from your database
  const report = {
    id: params.id,
    imageUrl: "/placeholder.svg?height=300&width=500",
    location: "Alkapuri, Vadodara, Gujarat 390007",
    coordinates: "40.7128, -74.0060",
    description: "Plastic waste and cardboard boxes",
    category: "General Waste",
    status: "pending",
    user: "john.doe@example.com",
    submittedAt: "2024-04-28",
    distance: "1.2 miles",
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!date || !timeFrom || !timeTo || !vehicleType) {
      alert("Please fill in all required fields")
      return
    }

    setIsLoading(true)

    try {
      // In a real implementation, you would update the report in your database
      // and send a notification to the user
      await new Promise((resolve) => setTimeout(resolve, 1000)) // Simulate API call

      router.push("/facilities/scheduled")
    } catch (error) {
      console.error("Error scheduling pickup:", error)
      alert("Failed to schedule pickup. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="flex flex-col min-h-screen bg-gradient-to-br from-emerald-50 via-teal-50 to-cyan-50 dark:from-gray-950 dark:via-gray-900 dark:to-gray-950">
      <div className="container mx-auto px-6 py-8">
        <div className="max-w-4xl mx-auto">
          <div className="mb-6">
            <Link href="/facilities">
              <Button variant="ghost" className="pl-0">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to Available Pickups
              </Button>
            </Link>
          </div>

          <div className="grid gap-6 md:grid-cols-2">
            <Card className="dark:bg-gray-900 dark:border-gray-800">
              <CardHeader>
                <CardTitle className="dark:text-white">Report #{report.id}</CardTitle>
                <CardDescription className="dark:text-gray-400">View waste report details</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="aspect-video w-full overflow-hidden rounded-md border dark:border-gray-800">
                  <img
                    src={report.imageUrl || "/placeholder.svg"}
                    alt={`Waste report ${report.id}`}
                    className="h-full w-full object-cover"
                  />
                </div>
                <div>
                  <h3 className="font-medium dark:text-white">Category</h3>
                  <Badge className="mt-1 bg-green-100 text-green-800 dark:bg-gray-800 dark:text-gray-300">{report.category}</Badge>
                </div>
                <div>
                  <h3 className="font-medium dark:text-white">Location</h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400">{report.location}</p>
                </div>
                <div>
                  <h3 className="font-medium dark:text-white">Description</h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400">{report.description}</p>
                </div>
                <div>
                  <h3 className="font-medium dark:text-white">Distance</h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400">{report.distance} from your facility</p>
                </div>
                <div>
                  <h3 className="font-medium dark:text-white">Reported</h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400">{report.submittedAt}</p>
                </div>
              </CardContent>
            </Card>

            <Card className="dark:bg-gray-900 dark:border-gray-800">
              <CardHeader>
                <CardTitle className="dark:text-white">Schedule Pickup</CardTitle>
                <CardDescription className="dark:text-gray-400">Set date and time for waste collection</CardDescription>
              </CardHeader>
              <form onSubmit={handleSubmit}>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="date" className="flex items-center gap-2 dark:text-white">
                      <Calendar className="h-4 w-4" />
                      Pickup Date
                    </Label>
                    <Input id="date" type="date" value={date} onChange={(e) => setDate(e.target.value)} required className="dark:bg-gray-800 dark:border-gray-700 dark:text-white" />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="timeFrom" className="flex items-center gap-2 dark:text-white">
                        <Clock className="h-4 w-4" />
                        From
                      </Label>
                      <Input
                        id="timeFrom"
                        type="time"
                        value={timeFrom}
                        onChange={(e) => setTimeFrom(e.target.value)}
                        required
                        className="dark:bg-gray-800 dark:border-gray-700 dark:text-white"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="timeTo" className="dark:text-white">To</Label>
                      <Input
                        id="timeTo"
                        type="time"
                        value={timeTo}
                        onChange={(e) => setTimeTo(e.target.value)}
                        required
                        className="dark:bg-gray-800 dark:border-gray-700 dark:text-white"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="vehicleType" className="flex items-center gap-2 dark:text-white">
                      <Truck className="h-4 w-4" />
                      Vehicle Type
                    </Label>
                    <Select value={vehicleType} onValueChange={setVehicleType} required>
                      <SelectTrigger id="vehicleType" className="dark:bg-gray-800 dark:border-gray-700 dark:text-white">
                        <SelectValue placeholder="Select vehicle type" />
                      </SelectTrigger>
                      <SelectContent className="dark:bg-gray-800 dark:border-gray-700">
                        <SelectItem value="small-truck" className="dark:text-white">Small Truck</SelectItem>
                        <SelectItem value="large-truck" className="dark:text-white">Large Truck</SelectItem>
                        <SelectItem value="specialized" className="dark:text-white">Specialized Vehicle (E-Waste)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="notes" className="dark:text-white">Notes (Optional)</Label>
                    <Textarea
                      id="notes"
                      placeholder="Any special instructions for pickup"
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                      className="dark:bg-gray-800 dark:border-gray-700 dark:text-white dark:placeholder-gray-500"
                    />
                  </div>
                </CardContent>
                <CardFooter>
                  <Button className="w-full bg-green-600 hover:bg-green-700" disabled={isLoading}>
                    {isLoading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Scheduling...
                      </>
                    ) : (
                      "Schedule Pickup"
                    )}
                  </Button>
                </CardFooter>
              </form>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
