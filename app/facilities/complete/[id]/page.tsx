"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Recycle, ArrowLeft, Calendar, Clock, Loader2, CheckCircle, Upload } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"

export default function CompletePickupPage({ params }: { params: { id: string } }) {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [notes, setNotes] = useState("")
  const [imagePreview, setImagePreview] = useState<string | null>(null)
  const [selectedFile, setSelectedFile] = useState<File | null>(null)

  // In a real implementation, you would fetch the pickup details from your database
  const pickup = {
    id: params.id,
    imageUrl: "/placeholder.svg?height=300&width=500",
    location: "Fatehgunj, Vadodara, Gujarat 390002",
    coordinates: "40.7128, -74.0060",
    description: "Plastic waste and cardboard boxes",
    category: "General Waste",
    status: "scheduled",
    date: "2024-05-05",
    time: "10:00 AM - 12:00 PM",
    vehicleType: "Small Truck",
    user: "john.doe@example.com",
    distance: "1.2 miles",
  }

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setSelectedFile(file)
      const reader = new FileReader()
      reader.onloadend = () => {
        setImagePreview(reader.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    setIsLoading(true)

    try {
      // In a real implementation, you would update the pickup status in your database
      // and upload the completion photo
      await new Promise((resolve) => setTimeout(resolve, 1000)) // Simulate API call

      router.push("/facilities/scheduled")
    } catch (error) {
      console.error("Error completing pickup:", error)
      alert("Failed to mark pickup as complete. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="flex flex-col min-h-screen bg-gradient-to-br from-emerald-50 via-teal-50 to-cyan-50 dark:from-gray-950 dark:via-gray-900 dark:to-gray-950">
      <div className="container mx-auto px-6 py-8">
        <div className="max-w-4xl mx-auto">
          <div className="mb-6">
            <Link href="/facilities/scheduled">
              <Button variant="ghost" className="pl-0">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to Scheduled Pickups
              </Button>
            </Link>
          </div>

          <div className="grid gap-6 md:grid-cols-2">
            <Card className="dark:bg-gray-900 dark:border-gray-800">
              <CardHeader>
                <CardTitle className="dark:text-white">Pickup #{pickup.id}</CardTitle>
                <CardDescription className="dark:text-gray-400">View scheduled pickup details</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="aspect-video w-full overflow-hidden rounded-md border dark:border-gray-800">
                  <img
                    src={pickup.imageUrl || "/placeholder.svg"}
                    alt={`Waste pickup ${pickup.id}`}
                    className="h-full w-full object-cover"
                  />
                </div>
                <div>
                  <h3 className="font-medium dark:text-white">Category</h3>
                  <Badge className="mt-1 bg-green-100 text-green-800 dark:bg-gray-800 dark:text-gray-300">{pickup.category}</Badge>
                </div>
                <div>
                  <h3 className="font-medium dark:text-white">Location</h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400">{pickup.location}</p>
                </div>
                <div>
                  <h3 className="font-medium dark:text-white">Description</h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400">{pickup.description}</p>
                </div>
                <div className="p-3 bg-blue-50 rounded-md text-sm">
                  <div className="flex items-center gap-1 font-medium">
                    <Calendar className="h-4 w-4" />
                    <span>{pickup.date}</span>
                  </div>
                  <div className="flex items-center gap-1 mt-1">
                    <Clock className="h-4 w-4" />
                    <span>{pickup.time}</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="dark:bg-gray-900 dark:border-gray-800">
              <CardHeader>
                <CardTitle className="dark:text-white">Complete Pickup</CardTitle>
                <CardDescription className="dark:text-gray-400">Mark this pickup as completed</CardDescription>
              </CardHeader>
              <form onSubmit={handleSubmit}>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="image" className="dark:text-white">Completion Photo (Optional)</Label>
                    <div className="flex flex-col items-center justify-center gap-4">
                      {imagePreview ? (
                        <div className="relative w-full aspect-video rounded-lg overflow-hidden border">
                          <img
                            src={imagePreview || "/placeholder.svg"}
                            alt="Completion photo"
                            className="object-cover w-full h-full"
                          />
                          <Button
                            type="button"
                            variant="secondary"
                            size="sm"
                            className="absolute bottom-2 right-2"
                            onClick={() => {
                              setImagePreview(null)
                              setSelectedFile(null)
                            }}
                          >
                            Change
                          </Button>
                        </div>
                      ) : (
                        <div className="border border-dashed rounded-lg p-8 w-full flex flex-col items-center gap-4">
                          <Upload className="h-8 w-8 text-gray-400" />
                          <div className="text-center">
                            <p className="text-sm text-gray-500">Upload a photo of the completed pickup</p>
                            <p className="text-xs text-gray-400">PNG, JPG or JPEG (max. 10MB)</p>
                          </div>
                          <Input
                            id="image"
                            type="file"
                            accept="image/*"
                            className="hidden"
                            onChange={handleImageChange}
                          />
                          <Button
                            type="button"
                            variant="secondary"
                            onClick={() => document.getElementById("image")?.click()}
                          >
                            Select Image
                          </Button>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="notes" className="dark:text-white">Completion Notes (Optional)</Label>
                    <Textarea
                      id="notes"
                      placeholder="Add any notes about the pickup"
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                      rows={3}
                      className="dark:bg-gray-800 dark:border-gray-700 dark:text-white dark:placeholder-gray-500"
                    />
                  </div>
                </CardContent>
                <CardFooter>
                  <Button className="w-full bg-green-600 hover:bg-green-700" disabled={isLoading}>
                    {isLoading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Processing...
                      </>
                    ) : (
                      <>
                        <CheckCircle className="mr-2 h-4 w-4" />
                        Mark as Completed
                      </>
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
