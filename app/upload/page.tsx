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
import { Loader2, MapPin, Upload, ArrowLeft, Recycle } from "lucide-react"
import { createWasteReport } from "@/app/actions"

export default function UploadPage() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [imagePreview, setImagePreview] = useState<string | null>(null)
  const [location, setLocation] = useState("")
  const [description, setDescription] = useState("")
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [category, setCategory] = useState<string>("")

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

  const handleGetLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords
          setLocation(`${latitude}, ${longitude}`)
        },
        (error) => {
          console.error("Error getting location:", error)
          alert("Unable to get your location. Please enter it manually.")
        },
      )
    } else {
      alert("Geolocation is not supported by your browser. Please enter your location manually.")
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!selectedFile || !location || !category) {
      alert("Please provide an image, location, and waste category")
      return
    }

    setIsLoading(true)

    try {
      // In a real implementation, you would upload the image to Blob storage
      // and save the report details to your database
      await createWasteReport({
        imageUrl: "placeholder-image-url",
        location,
        description,
        category,
        status: "pending",
      })

      router.push("/success")
    } catch (error) {
      console.error("Error submitting report:", error)
      alert("Failed to submit your report. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="flex flex-col min-h-screen">
      <header className="px-4 lg:px-6 h-16 flex items-center border-b">
        <Link href="/" className="flex items-center gap-2 font-semibold">
          <Recycle className="h-6 w-6 text-green-600" />
          <span className="text-lg">WasteConnect</span>
        </Link>
      </header>
      <main className="flex-1 flex items-center justify-center p-4 md:p-8">
        <Card className="w-full max-w-md">
          <CardHeader>
            <div className="flex items-center gap-2">
              <Link href="/">
                <Button variant="ghost" size="icon">
                  <ArrowLeft className="h-4 w-4" />
                </Button>
              </Link>
              <div>
                <CardTitle>Report Waste</CardTitle>
                <CardDescription>Upload a photo and provide your location</CardDescription>
              </div>
            </div>
          </CardHeader>
          <form onSubmit={handleSubmit}>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="image">Waste Photo</Label>
                <div className="flex flex-col items-center justify-center gap-4">
                  {imagePreview ? (
                    <div className="relative w-full aspect-video rounded-lg overflow-hidden border">
                      <img
                        src={imagePreview || "/placeholder.svg"}
                        alt="Waste preview"
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
                        <p className="text-sm text-gray-500">Click to upload or drag and drop</p>
                        <p className="text-xs text-gray-400">PNG, JPG or JPEG (max. 10MB)</p>
                      </div>
                      <Input
                        id="image"
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={handleImageChange}
                        required
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
                <div className="flex items-center justify-between">
                  <Label htmlFor="location">Location</Label>
                  <Button type="button" variant="ghost" size="sm" className="h-8 text-xs" onClick={handleGetLocation}>
                    <MapPin className="h-3 w-3 mr-1" />
                    Get Current Location
                  </Button>
                </div>
                <Input
                  id="location"
                  placeholder="Enter address or coordinates"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Description (Optional)</Label>
                <Textarea
                  id="description"
                  placeholder="Describe the type and amount of waste"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={3}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="category">Waste Category</Label>
                <div className="grid grid-cols-2 gap-2">
                  <Button
                    type="button"
                    variant={category === "E-Waste" ? "default" : "outline"}
                    className={category === "E-Waste" ? "bg-green-600 hover:bg-green-700" : ""}
                    onClick={() => setCategory("E-Waste")}
                  >
                    E-Waste
                  </Button>
                  <Button
                    type="button"
                    variant={category === "General Waste" ? "default" : "outline"}
                    className={category === "General Waste" ? "bg-green-600 hover:bg-green-700" : ""}
                    onClick={() => setCategory("General Waste")}
                  >
                    General Waste
                  </Button>
                </div>
              </div>
            </CardContent>
            <CardFooter>
              <Button className="w-full bg-green-600 hover:bg-green-700" disabled={isLoading}>
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Submitting...
                  </>
                ) : (
                  "Submit Report"
                )}
              </Button>
            </CardFooter>
          </form>
        </Card>
      </main>
    </div>
  )
}
