"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Recycle, ArrowLeft, MapPin, Navigation } from "lucide-react"

export default function ViewMapPage({ params }: { params: { id: string } }) {
  const [isMapLoaded, setIsMapLoaded] = useState(false)
  const mapboxToken = process.env.NEXT_PUBLIC_MAPBOX_TOKEN

  // In a real implementation, you would fetch the report details from your database
  const report = {
    id: params.id,
    imageUrl: "/placeholder.svg?height=300&width=500",
    location: "Alkapuri, Vadodara, Gujarat 390007",
    coordinates: "22.3072, 73.1812", // Vadodara, Gujarat
    lat: 22.3072,
    lng: 73.1812,
    description: "Plastic waste and cardboard boxes",
    category: "General Waste",
    status: "pending",
    user: "john.doe@example.com",
    submittedAt: "2024-04-28",
    distance: "1.2 miles",
  }

  // Simulate map loading
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsMapLoaded(true)
    }, 1000)

    return () => clearTimeout(timer)
  }, [])

  return (
    <div className="flex flex-col min-h-screen bg-gradient-to-br from-emerald-50 via-teal-50 to-cyan-50 dark:from-gray-950 dark:via-gray-900 dark:to-gray-950">
      <div className="container mx-auto px-6 py-8">
        <div className="max-w-6xl mx-auto">
          <div className="mb-6">
            <Link href="/facilities">
              <Button variant="ghost" className="pl-0">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to Available Pickups
              </Button>
            </Link>
          </div>

          <div className="grid gap-6 md:grid-cols-[1fr_2fr]">
            <Card>
              <CardHeader>
                <CardTitle>Report #{report.id}</CardTitle>
                <CardDescription>Waste details and location</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="aspect-video w-full overflow-hidden rounded-md border">
                  <img
                    src={report.imageUrl || "/placeholder.svg"}
                    alt={`Waste report ${report.id}`}
                    className="h-full w-full object-cover"
                  />
                </div>
                <div>
                  <h3 className="font-medium">Category</h3>
                  <Badge className="mt-1 bg-green-100 text-green-800">{report.category}</Badge>
                </div>
                <div>
                  <h3 className="font-medium">Location</h3>
                  <p className="text-sm text-gray-500">{report.location}</p>
                </div>
                <div>
                  <h3 className="font-medium">Coordinates</h3>
                  <p className="text-sm text-gray-500">{report.coordinates}</p>
                </div>
                <div>
                  <h3 className="font-medium">Description</h3>
                  <p className="text-sm text-gray-500">{report.description}</p>
                </div>
                <div>
                  <h3 className="font-medium">Reported</h3>
                  <p className="text-sm text-gray-500">{report.submittedAt}</p>
                </div>
              </CardContent>
              <CardFooter>
                <Link href={`/facilities/schedule/${report.id}`} className="w-full">
                  <Button className="w-full bg-green-600 hover:bg-green-700">Schedule Pickup</Button>
                </Link>
              </CardFooter>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Location Map</CardTitle>
                <CardDescription>Waste location and directions</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="aspect-[4/3] w-full overflow-hidden rounded-md border bg-gray-100 relative">
                  {!isMapLoaded ? (
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
                    </div>
                  ) : (
                    <>
                      <iframe
                        src={`https://api.mapbox.com/styles/v1/mapbox/streets-v12.html?access_token=${mapboxToken}#15/${report.lat}/${report.lng}`}
                        className="w-full h-full border-0"
                        style={{ border: 0 }}
                        allowFullScreen
                        loading="lazy"
                      />
                      <div className="absolute bottom-4 left-4 bg-white dark:bg-gray-800 p-3 rounded-md shadow-lg border dark:border-gray-700">
                        <p className="text-sm font-medium text-gray-900 dark:text-white">{report.location}</p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">{report.coordinates}</p>
                        <a 
                          href={`https://www.google.com/maps/dir/?api=1&destination=${report.lat},${report.lng}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="mt-2 inline-flex items-center gap-1 text-xs text-emerald-600 dark:text-emerald-400 hover:underline"
                        >
                          <Navigation className="h-3 w-3" />
                          Get Directions
                        </a>
                      </div>
                    </>
                  )}
                </div>
                <div className="mt-4 p-4 bg-gray-50 rounded-md">
                  <h3 className="font-medium mb-2">Directions</h3>
                  <ol className="space-y-2 text-sm text-gray-600 dark:text-gray-400 list-decimal list-inside">
                    <li>Head south on RC Dutt Road toward Alkapuri</li>
                    <li>Turn right onto Sayajigunj Road</li>
                    <li>Continue straight for 1.2 km</li>
                    <li>Turn left onto Alkapuri Main Road</li>
                    <li>Destination will be on your left</li>
                  </ol>
                  <p className="mt-4 text-sm text-gray-500 dark:text-gray-400">Estimated travel time: 12 minutes ({report.distance})</p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
