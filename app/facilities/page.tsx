"use client"

import { useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Recycle, Search, MapPin, Clock, Filter } from "lucide-react"

export default function FacilitiesPage() {
  const [filterCategory, setFilterCategory] = useState<string>("all")
  const [searchQuery, setSearchQuery] = useState<string>("")

  // In a real implementation, this data would come from your database
  const reports = [
    {
      id: "1",
      imageUrl: "/placeholder.svg?height=200&width=300",
      location: "Alkapuri, Vadodara, Gujarat",
      coordinates: "22.3072, 73.1812",
      description: "Plastic waste and cardboard boxes",
      category: "General Waste",
      status: "pending",
      user: "john.doe@example.com",
      submittedAt: "2024-04-28",
      distance: "1.2 miles",
    },
    {
      id: "2",
      imageUrl: "/placeholder.svg?height=200&width=300",
      location: "Sayajigunj, Vadodara, Gujarat",
      coordinates: "22.3039, 73.1812",
      description: "Old computers and electronic devices",
      category: "E-Waste",
      status: "pending",
      user: "jane.smith@example.com",
      submittedAt: "2024-04-30",
      distance: "2.5 miles",
    },
    {
      id: "3",
      imageUrl: "/placeholder.svg?height=200&width=300",
      location: "Fatehgunj, Vadodara, Gujarat",
      coordinates: "22.3154, 73.1969",
      description: "Garden waste and old furniture",
      category: "General Waste",
      status: "pending",
      user: "bob.johnson@example.com",
      submittedAt: "2024-04-15",
      distance: "0.8 miles",
    },
    {
      id: "4",
      imageUrl: "/placeholder.svg?height=200&width=300",
      location: "Race Course Circle, Vadodara, Gujarat",
      coordinates: "22.2991, 73.1897",
      description: "Broken laptops and old phones",
      category: "E-Waste",
      status: "pending",
      user: "alice.williams@example.com",
      submittedAt: "2024-05-01",
      distance: "3.1 miles",
    },
  ]

  // Filter reports based on category and search query
  const filteredReports = reports.filter((report) => {
    const matchesCategory = filterCategory === "all" || report.category === filterCategory
    const matchesSearch =
      searchQuery === "" ||
      report.location.toLowerCase().includes(searchQuery.toLowerCase()) ||
      report.description.toLowerCase().includes(searchQuery.toLowerCase())

    return matchesCategory && matchesSearch
  })

  return (
    <div className="flex flex-col min-h-screen bg-gradient-to-br from-emerald-50 via-teal-50 to-cyan-50 dark:from-gray-950 dark:via-gray-900 dark:to-gray-950">
      <div className="container mx-auto px-6 py-8">
        <div className="max-w-6xl mx-auto space-y-8">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-white">Available Waste Pickups</h1>
              <p className="text-gray-500 dark:text-gray-400">Browse and schedule waste pickups in your area</p>
            </div>
          </div>

          <div className="flex flex-col md:flex-row gap-4 items-start md:items-center">
            <div className="relative flex-1">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
              <Input
                type="search"
                placeholder="Search by location or description..."
                className="pl-8 w-full"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <div className="flex items-center gap-2">
              <Filter className="h-4 w-4 text-gray-500" />
              <span className="text-sm font-medium">Filter:</span>
              <Select value={filterCategory} onValueChange={setFilterCategory}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Waste Category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Categories</SelectItem>
                  <SelectItem value="E-Waste">E-Waste</SelectItem>
                  <SelectItem value="General Waste">General Waste</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {filteredReports.length > 0 ? (
              filteredReports.map((report) => (
                <Card key={report.id} className="overflow-hidden">
                  <div className="aspect-video w-full overflow-hidden">
                    <img
                      src={report.imageUrl || "/placeholder.svg"}
                      alt={`Waste report ${report.id}`}
                      className="h-full w-full object-cover"
                    />
                  </div>
                  <CardHeader className="p-4">
                    <div className="flex justify-between items-start">
                      <CardTitle className="text-lg">Report #{report.id}</CardTitle>
                      <Badge className="bg-green-100 text-green-800">{report.category}</Badge>
                    </div>
                    <CardDescription>{report.location}</CardDescription>
                  </CardHeader>
                  <CardContent className="p-4 pt-0">
                    <p className="text-sm mb-4">{report.description}</p>

                    <div className="space-y-2 text-sm">
                      <div className="flex items-center text-gray-500">
                        <MapPin className="mr-1 h-4 w-4" />
                        <span>{report.distance} away</span>
                      </div>
                      <div className="flex items-center text-gray-500">
                        <Clock className="mr-1 h-4 w-4" />
                        <span>Reported on {report.submittedAt}</span>
                      </div>
                    </div>
                  </CardContent>
                  <CardFooter className="p-4 pt-0 flex gap-2">
                    <Link href={`/facilities/view-map/${report.id}`} className="flex-1">
                      <Button variant="outline" className="w-full">
                        View on Map
                      </Button>
                    </Link>
                    <Link href={`/facilities/schedule/${report.id}`} className="flex-1">
                      <Button className="w-full bg-green-600 hover:bg-green-700">Schedule Pickup</Button>
                    </Link>
                  </CardFooter>
                </Card>
              ))
            ) : (
              <div className="col-span-full text-center py-12">
                <p className="text-gray-500">No waste reports match your filters.</p>
                <Button
                  variant="link"
                  onClick={() => {
                    setFilterCategory("all")
                    setSearchQuery("")
                  }}
                >
                  Clear filters
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
