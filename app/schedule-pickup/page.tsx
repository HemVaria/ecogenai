"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Checkbox } from "@/components/ui/checkbox"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { Slider } from "@/components/ui/slider"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { 
  CalendarIcon, Clock, MapPin, Recycle, Trash2, CheckCircle, AlertCircle,
  Camera, Upload, X, Navigation, DollarSign, Weight, Leaf, Zap, Bell,
  Map as MapIcon, Repeat, Star, MessageSquare, TrendingUp
} from "lucide-react"
import { createClient } from "@/lib/supabase/client"
import { motion, AnimatePresence } from "framer-motion"
import { format } from "date-fns"
import { cn } from "@/lib/utils"

const wasteTypes = [
  { id: "general", label: "General Waste", icon: Trash2, pricePerKg: 0.5, co2SavedPerKg: 0.1 },
  { id: "recyclable", label: "Recyclable Materials", icon: Recycle, pricePerKg: 0.3, co2SavedPerKg: 0.8 },
  { id: "organic", label: "Organic/Food Waste", icon: "🥬", pricePerKg: 0.4, co2SavedPerKg: 0.5 },
  { id: "electronic", label: "Electronic Waste", icon: "📱", pricePerKg: 1.5, co2SavedPerKg: 2.5 },
  { id: "hazardous", label: "Hazardous Materials", icon: "⚠️", pricePerKg: 2.0, co2SavedPerKg: 1.2 },
  { id: "bulky", label: "Bulky Items", icon: "🛋️", pricePerKg: 0.8, co2SavedPerKg: 0.6 },
]

const timeSlots = [
  "8:00 AM - 10:00 AM",
  "10:00 AM - 12:00 PM",
  "12:00 PM - 2:00 PM",
  "2:00 PM - 4:00 PM",
  "4:00 PM - 6:00 PM",
]

const recurringOptions = [
  { value: "none", label: "One-time pickup" },
  { value: "weekly", label: "Weekly", discount: 10 },
  { value: "biweekly", label: "Bi-weekly", discount: 8 },
  { value: "monthly", label: "Monthly", discount: 5 },
]

export default function SchedulePickupPage() {
  const [user, setUser] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [showSuccess, setShowSuccess] = useState(false)
  const [date, setDate] = useState<Date>()
  const [selectedWasteTypes, setSelectedWasteTypes] = useState<string[]>([])
  const [formData, setFormData] = useState({
    address: "",
    timeSlot: "",
    specialInstructions: "",
    driverNotes: "",
    estimatedWeight: 10, // kg
    recurring: "none",
    priority: false,
    notifications: {
      email: true,
      sms: false,
    },
  })
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [photos, setPhotos] = useState<File[]>([])
  const [photoPreview, setPhotoPreview] = useState<string[]>([])
  const [coordinates, setCoordinates] = useState<{ lat: number; lng: number } | null>(null)
  const [isLoadingLocation, setIsLoadingLocation] = useState(false)
  const [showMap, setShowMap] = useState(false)

  const router = useRouter()
  const supabase = createClient()

  // Calculate price estimation
  const calculatePrice = () => {
    let total = 0
    selectedWasteTypes.forEach((typeId) => {
      const wasteType = wasteTypes.find((t) => t.id === typeId)
      if (wasteType) {
        total += wasteType.pricePerKg * formData.estimatedWeight
      }
    })
    
    // Apply priority fee
    if (formData.priority) {
      total += 15 // Express pickup fee
    }
    
    // Apply recurring discount
    const recurringOption = recurringOptions.find((opt) => opt.value === formData.recurring)
    if (recurringOption?.discount) {
      total = total * (1 - recurringOption.discount / 100)
    }
    
    return total.toFixed(2)
  }

  // Calculate CO2 saved
  const calculateCO2Saved = () => {
    let total = 0
    selectedWasteTypes.forEach((typeId) => {
      const wasteType = wasteTypes.find((t) => t.id === typeId)
      if (wasteType) {
        total += wasteType.co2SavedPerKg * formData.estimatedWeight
      }
    })
    return total.toFixed(2)
  }

  // Get user location
  const getUserLocation = async () => {
    setIsLoadingLocation(true)
    setErrors({ ...errors, location: "" })
    
    if (!navigator.geolocation) {
      setErrors({ ...errors, location: "Geolocation is not supported by your browser" })
      setIsLoadingLocation(false)
      return
    }

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords
        setCoordinates({ lat: latitude, lng: longitude })
        
        // Reverse geocoding (you can use a real API like Google Maps)
        try {
          const mapboxToken = process.env.NEXT_PUBLIC_MAPBOX_TOKEN
          const response = await fetch(
            `https://api.mapbox.com/geocoding/v5/mapbox.places/${longitude},${latitude}.json?access_token=${mapboxToken}`
          )
          const data = await response.json()
          const address = data.features?.[0]?.place_name || `${latitude}, ${longitude}`
          setFormData({ ...formData, address })
          setShowMap(true)
        } catch (error) {
          console.error("Error getting address:", error)
        }
        
        setIsLoadingLocation(false)
      },
      (error) => {
        setErrors({ ...errors, location: "Unable to get your location. Please enter manually." })
        setIsLoadingLocation(false)
      }
    )
  }

  // Handle photo upload
  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || [])
    if (photos.length + files.length > 5) {
      setErrors({ ...errors, photos: "Maximum 5 photos allowed" })
      return
    }
    
    setPhotos([...photos, ...files])
    
    // Create previews
    files.forEach((file) => {
      const reader = new FileReader()
      reader.onloadend = () => {
        setPhotoPreview((prev) => [...prev, reader.result as string])
      }
      reader.readAsDataURL(file)
    })
    
    setErrors({ ...errors, photos: "" })
  }

  // Remove photo
  const removePhoto = (index: number) => {
    setPhotos(photos.filter((_, i) => i !== index))
    setPhotoPreview(photoPreview.filter((_, i) => i !== index))
  }

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
      setIsLoading(false)
    }

    checkAuth()
  }, [])

  const handleWasteTypeChange = (wasteTypeId: string, checked: boolean) => {
    if (checked) {
      setSelectedWasteTypes([...selectedWasteTypes, wasteTypeId])
    } else {
      setSelectedWasteTypes(selectedWasteTypes.filter((id) => id !== wasteTypeId))
    }
    // Clear waste type error if any types are selected
    if (errors.wasteTypes && selectedWasteTypes.length > 0) {
      setErrors({ ...errors, wasteTypes: "" })
    }
  }

  const validateForm = () => {
    const newErrors: Record<string, string> = {}

    if (!formData.address.trim()) {
      newErrors.address = "Address is required"
    }

    if (!date) {
      newErrors.date = "Pickup date is required"
    } else if (date < new Date()) {
      newErrors.date = "Pickup date must be in the future"
    }

    if (!formData.timeSlot) {
      newErrors.timeSlot = "Time slot is required"
    }

    if (selectedWasteTypes.length === 0) {
      newErrors.wasteTypes = "Please select at least one waste type"
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!validateForm()) {
      return
    }

    setIsSubmitting(true)

    try {
      // Upload photos first if any
      let photoUrls: string[] = []
      if (photos.length > 0) {
        for (const photo of photos) {
          const fileExt = photo.name.split(".").pop()
          const fileName = `${user.id}-${Date.now()}.${fileExt}`
          const { data, error: uploadError } = await supabase.storage
            .from("waste-photos")
            .upload(fileName, photo)

          if (uploadError) {
            console.error("Photo upload error:", uploadError)
          } else {
            const { data: urlData } = supabase.storage.from("waste-photos").getPublicUrl(fileName)
            photoUrls.push(urlData.publicUrl)
          }
        }
      }

      const { error } = await supabase.from("pickup_requests").insert({
        user_id: user.id,
        address: formData.address.trim(),
        waste_types: selectedWasteTypes,
        preferred_date: format(date!, "yyyy-MM-dd"),
        preferred_time_slot: formData.timeSlot,
        special_instructions: formData.specialInstructions.trim() || null,
        driver_notes: formData.driverNotes.trim() || null,
        estimated_weight: formData.estimatedWeight,
        recurring_schedule: formData.recurring,
        is_priority: formData.priority,
        notification_email: formData.notifications.email,
        notification_sms: formData.notifications.sms,
        estimated_price: parseFloat(calculatePrice()),
        estimated_co2_saved: parseFloat(calculateCO2Saved()),
        photos: photoUrls,
        coordinates: coordinates,
        status: "pending",
      })

      if (error) throw error

      setShowSuccess(true)
      setTimeout(() => {
        router.push("/dashboard")
      }, 2000)
    } catch (error) {
      console.error("Error scheduling pickup:", error)
      setErrors({ submit: "Failed to schedule pickup. Please try again." })
    } finally {
      setIsSubmitting(false)
    }
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
          <p className="text-gray-600 dark:text-gray-400">Loading...</p>
        </div>
      </div>
    )
  }

  if (showSuccess) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-teal-50 to-cyan-50 dark:from-gray-950 dark:via-gray-900 dark:to-gray-950 flex items-center justify-center">
        <motion.div initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="text-center">
          <div className="w-20 h-20 bg-green-100 dark:bg-green-900 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle className="h-10 w-10 text-green-600 dark:text-green-400" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Pickup Scheduled!</h2>
          <p className="text-gray-600 dark:text-gray-400 mb-4">Your waste pickup request has been submitted successfully.</p>
          <p className="text-sm text-gray-500 dark:text-gray-500">Redirecting to dashboard...</p>
        </motion.div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-teal-50 to-cyan-50 dark:from-gray-950 dark:via-gray-900 dark:to-gray-950">
      <div className="container mx-auto px-6 py-8">
        <div className="max-w-4xl mx-auto">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
            {/* Header with Stats */}
            <div className="mb-6 text-center">
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
                Schedule Your Waste Pickup
              </h1>
              <p className="text-gray-600 dark:text-gray-400">
                Smart scheduling with real-time pricing and environmental impact
              </p>
              
              {/* Price & Impact Preview */}
              {(selectedWasteTypes.length > 0 || formData.priority) && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="mt-4 flex flex-wrap gap-4 justify-center"
                >
                  <Badge className="px-4 py-2 bg-emerald-100 dark:bg-emerald-900 text-emerald-800 dark:text-emerald-200 text-lg">
                    <DollarSign className="h-4 w-4 mr-1" />
                    ${calculatePrice()}
                  </Badge>
                  <Badge className="px-4 py-2 bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200 text-lg">
                    <Leaf className="h-4 w-4 mr-1" />
                    {calculateCO2Saved()} kg CO₂ saved
                  </Badge>
                  {formData.recurring !== "none" && (
                    <Badge className="px-4 py-2 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200">
                      <Repeat className="h-4 w-4 mr-1" />
                      {recurringOptions.find((opt) => opt.value === formData.recurring)?.discount}% discount
                    </Badge>
                  )}
                </motion.div>
              )}
            </div>

            <Tabs defaultValue="details" className="w-full">
              <TabsList className="grid w-full grid-cols-3 mb-6">
                <TabsTrigger value="details">📋 Details</TabsTrigger>
                <TabsTrigger value="photos">📸 Photos</TabsTrigger>
                <TabsTrigger value="options">⚙️ Options</TabsTrigger>
              </TabsList>

              <Card className="border-0 shadow-xl bg-white/90 dark:bg-gray-900/90 backdrop-blur-sm">
                <CardContent className="space-y-6 pt-6">
                  <form onSubmit={handleSubmit} className="space-y-6">
                    
                    <TabsContent value="details" className="space-y-6 mt-0">
                      {/* Address with Auto-detect */}
                      <div className="space-y-2">
                        <Label htmlFor="address" className="flex items-center gap-2 text-gray-900 dark:text-white">
                          <MapPin className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                          Pickup Address
                        </Label>
                        <div className="flex gap-2">
                          <Input
                            id="address"
                            placeholder="Enter your full address"
                            value={formData.address}
                            onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                            className={cn(
                              "flex-1 dark:bg-gray-800 dark:border-gray-700 dark:text-white",
                              errors.address && "border-red-500"
                            )}
                          />
                          <Button
                            type="button"
                            variant="outline"
                            onClick={getUserLocation}
                            disabled={isLoadingLocation}
                            className="dark:border-gray-700 dark:hover:bg-gray-800"
                          >
                            {isLoadingLocation ? (
                              <motion.div
                                animate={{ rotate: 360 }}
                                transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                                className="w-4 h-4 border-2 border-emerald-600 border-t-transparent rounded-full"
                              />
                            ) : (
                              <Navigation className="h-4 w-4" />
                            )}
                          </Button>
                        </div>
                        {errors.address && (
                          <p className="text-sm text-red-600 dark:text-red-400 flex items-center gap-1">
                            <AlertCircle className="h-3 w-3" />
                            {errors.address}
                          </p>
                        )}
                        {errors.location && (
                          <p className="text-sm text-amber-600 dark:text-amber-400 flex items-center gap-1">
                            <AlertCircle className="h-3 w-3" />
                            {errors.location}
                          </p>
                        )}
                        
                        {/* Map Preview */}
                        {showMap && coordinates && (
                          <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: "auto" }}
                            className="mt-2"
                          >
                            <div className="relative h-48 bg-gray-200 dark:bg-gray-800 rounded-lg overflow-hidden">
                              <iframe
                                src={`https://api.mapbox.com/styles/v1/mapbox/streets-v12.html?access_token=${process.env.NEXT_PUBLIC_MAPBOX_TOKEN}#15/${coordinates.lat}/${coordinates.lng}`}
                                className="w-full h-full"
                                style={{ border: 0 }}
                                allowFullScreen
                                loading="lazy"
                              />
                              <Button
                                type="button"
                                size="sm"
                                variant="secondary"
                                className="absolute top-2 right-2 z-10"
                                onClick={() => setShowMap(false)}
                              >
                                <X className="h-3 w-3" />
                              </Button>
                            </div>
                          </motion.div>
                        )}
                      </div>

                      {/* Date & Time Row */}
                      <div className="grid md:grid-cols-2 gap-4">
                        {/* Date Selection */}
                        <div className="space-y-2">
                          <Label className="flex items-center gap-2 text-gray-900 dark:text-white">
                            <CalendarIcon className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                            Preferred Date
                          </Label>
                          <Popover>
                            <PopoverTrigger asChild>
                              <Button
                                variant="outline"
                                className={cn(
                                  "w-full justify-start text-left font-normal dark:bg-gray-800 dark:border-gray-700 dark:text-white",
                                  !date && "text-muted-foreground",
                                  errors.date && "border-red-500"
                                )}
                              >
                                <CalendarIcon className="mr-2 h-4 w-4" />
                                {date ? format(date, "PPP") : "Pick a date"}
                              </Button>
                            </PopoverTrigger>
                            <PopoverContent className="w-auto p-0 dark:bg-gray-800 dark:border-gray-700" align="start">
                              <Calendar
                                mode="single"
                                selected={date}
                                onSelect={setDate}
                                disabled={(date) => date < new Date()}
                                initialFocus
                                className="dark:bg-gray-800"
                              />
                            </PopoverContent>
                          </Popover>
                          {errors.date && (
                            <p className="text-sm text-red-600 dark:text-red-400 flex items-center gap-1">
                              <AlertCircle className="h-3 w-3" />
                              {errors.date}
                            </p>
                          )}
                        </div>

                        {/* Time Slot */}
                        <div className="space-y-2">
                          <Label className="flex items-center gap-2 text-gray-900 dark:text-white">
                            <Clock className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                            Time Slot
                          </Label>
                          <Select
                            value={formData.timeSlot}
                            onValueChange={(value) => setFormData({ ...formData, timeSlot: value })}
                          >
                            <SelectTrigger
                              className={cn(
                                "dark:bg-gray-800 dark:border-gray-700 dark:text-white",
                                errors.timeSlot && "border-red-500"
                              )}
                            >
                              <SelectValue placeholder="Select time" />
                            </SelectTrigger>
                            <SelectContent className="dark:bg-gray-800 dark:border-gray-700">
                              {timeSlots.map((slot) => (
                                <SelectItem key={slot} value={slot} className="dark:text-white">
                                  {slot}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          {errors.timeSlot && (
                            <p className="text-sm text-red-600 dark:text-red-400 flex items-center gap-1">
                              <AlertCircle className="h-3 w-3" />
                              {errors.timeSlot}
                            </p>
                          )}
                        </div>
                      </div>

                      {/* Waste Types with enhanced display */}
                      <div className="space-y-3">
                        <Label className="flex items-center gap-2 text-gray-900 dark:text-white">
                          <Recycle className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                          Waste Types (Select all that apply)
                        </Label>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                          {wasteTypes.map((type) => (
                            <div
                              key={type.id}
                              className={cn(
                                "relative flex items-center space-x-3 p-4 rounded-lg border transition-all hover:shadow-md",
                                selectedWasteTypes.includes(type.id)
                                  ? "border-emerald-500 dark:border-emerald-400 bg-emerald-50 dark:bg-emerald-900/20 shadow-sm"
                                  : "border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600"
                              )}
                            >
                              <Checkbox
                                id={type.id}
                                checked={selectedWasteTypes.includes(type.id)}
                                onCheckedChange={(checked) => handleWasteTypeChange(type.id, checked as boolean)}
                                className="border-emerald-500 data-[state=checked]:bg-emerald-600"
                              />
                              <Label htmlFor={type.id} className="flex-1 cursor-pointer">
                                <div className="flex items-center gap-2">
                                  {typeof type.icon === "string" ? (
                                    <span className="text-xl">{type.icon}</span>
                                  ) : (
                                    <type.icon className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
                                  )}
                                  <div>
                                    <div className="font-medium text-gray-900 dark:text-white">{type.label}</div>
                                    <div className="text-xs text-gray-500 dark:text-gray-400">
                                      ${type.pricePerKg}/kg · {type.co2SavedPerKg}kg CO₂/kg
                                    </div>
                                  </div>
                                </div>
                              </Label>
                            </div>
                          ))}
                        </div>
                        {errors.wasteTypes && (
                          <p className="text-sm text-red-600 dark:text-red-400 flex items-center gap-1">
                            <AlertCircle className="h-3 w-3" />
                            {errors.wasteTypes}
                          </p>
                        )}
                      </div>

                      {/* Weight Estimation */}
                      <div className="space-y-3">
                        <Label className="flex items-center gap-2 text-gray-900 dark:text-white">
                          <Weight className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                          Estimated Weight: {formData.estimatedWeight} kg
                        </Label>
                        <Slider
                          value={[formData.estimatedWeight]}
                          onValueChange={(value) => setFormData({ ...formData, estimatedWeight: value[0] })}
                          min={1}
                          max={100}
                          step={1}
                          className="w-full"
                        />
                        <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400">
                          <span>1 kg</span>
                          <span>50 kg</span>
                          <span>100 kg</span>
                        </div>
                      </div>

                      {/* Driver Notes */}
                      <div className="space-y-2">
                        <Label htmlFor="driverNotes" className="flex items-center gap-2 text-gray-900 dark:text-white">
                          <MessageSquare className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                          Driver/Access Notes
                        </Label>
                        <Textarea
                          id="driverNotes"
                          placeholder="e.g., 'Gate code: 1234', 'Use side entrance', 'Call on arrival'"
                          value={formData.driverNotes}
                          onChange={(e) => setFormData({ ...formData, driverNotes: e.target.value })}
                          className="dark:bg-gray-800 dark:border-gray-700 dark:text-white dark:placeholder-gray-500 min-h-[80px]"
                        />
                      </div>

                      {/* Special Instructions */}
                      <div className="space-y-2">
                        <Label htmlFor="instructions" className="text-gray-900 dark:text-white">
                          Special Instructions (Optional)
                        </Label>
                        <Textarea
                          id="instructions"
                          placeholder="Any special handling or additional information..."
                          value={formData.specialInstructions}
                          onChange={(e) => setFormData({ ...formData, specialInstructions: e.target.value })}
                          className="dark:bg-gray-800 dark:border-gray-700 dark:text-white dark:placeholder-gray-500 min-h-[80px]"
                        />
                      </div>
                    </TabsContent>

                    <TabsContent value="photos" className="space-y-4 mt-0">
                      <div className="text-center py-8">
                        <Label className="flex items-center justify-center gap-2 text-gray-900 dark:text-white mb-4">
                          <Camera className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
                          Waste Photos (Up to 5)
                        </Label>
                        <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">
                          Help us prepare by showing what needs to be collected
                        </p>

                        {/* Photo Grid */}
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-6">
                          {photoPreview.map((preview, index) => (
                            <motion.div
                              key={index}
                              initial={{ opacity: 0, scale: 0.8 }}
                              animate={{ opacity: 1, scale: 1 }}
                              className="relative group"
                            >
                              <img
                                src={preview}
                                alt={`Waste photo ${index + 1}`}
                                className="w-full h-32 object-cover rounded-lg border-2 border-gray-200 dark:border-gray-700"
                              />
                              <Button
                                type="button"
                                variant="destructive"
                                size="icon"
                                className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity"
                                onClick={() => removePhoto(index)}
                              >
                                <X className="h-4 w-4" />
                              </Button>
                            </motion.div>
                          ))}
                        </div>

                        {/* Upload Button */}
                        {photos.length < 5 && (
                          <div>
                            <Input
                              type="file"
                              accept="image/*"
                              multiple
                              onChange={handlePhotoUpload}
                              className="hidden"
                              id="photo-upload"
                            />
                            <Label
                              htmlFor="photo-upload"
                              className="inline-flex items-center gap-2 px-6 py-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg cursor-pointer transition-colors"
                            >
                              <Upload className="h-4 w-4" />
                              Upload Photos
                            </Label>
                          </div>
                        )}

                        {errors.photos && (
                          <p className="text-sm text-red-600 dark:text-red-400 flex items-center justify-center gap-1 mt-4">
                            <AlertCircle className="h-3 w-3" />
                            {errors.photos}
                          </p>
                        )}
                      </div>
                    </TabsContent>

                    <TabsContent value="options" className="space-y-6 mt-0">
                      {/* Priority/Express Pickup */}
                      <div className="flex items-center justify-between p-4 bg-amber-50 dark:bg-amber-900/20 rounded-lg border border-amber-200 dark:border-amber-800">
                        <div className="flex items-center gap-3">
                          <Zap className="h-5 w-5 text-amber-600 dark:text-amber-400" />
                          <div>
                            <Label className="text-gray-900 dark:text-white font-medium">Express Pickup</Label>
                            <p className="text-sm text-gray-600 dark:text-gray-400">
                              Same-day or next-day priority (+$15)
                            </p>
                          </div>
                        </div>
                        <Switch
                          checked={formData.priority}
                          onCheckedChange={(checked) => setFormData({ ...formData, priority: checked })}
                        />
                      </div>

                      {/* Recurring Schedule */}
                      <div className="space-y-3">
                        <Label className="flex items-center gap-2 text-gray-900 dark:text-white">
                          <Repeat className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                          Recurring Schedule
                        </Label>
                        <Select
                          value={formData.recurring}
                          onValueChange={(value) => setFormData({ ...formData, recurring: value })}
                        >
                          <SelectTrigger className="dark:bg-gray-800 dark:border-gray-700 dark:text-white">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent className="dark:bg-gray-800 dark:border-gray-700">
                            {recurringOptions.map((option) => (
                              <SelectItem key={option.value} value={option.value} className="dark:text-white">
                                {option.label}
                                {option.discount && (
                                  <span className="ml-2 text-green-600 dark:text-green-400">
                                    (Save {option.discount}%)
                                  </span>
                                )}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>

                      {/* Notifications */}
                      <div className="space-y-4">
                        <Label className="flex items-center gap-2 text-gray-900 dark:text-white">
                          <Bell className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                          Pickup Reminders
                        </Label>
                        
                        <div className="space-y-3">
                          <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800/50 rounded-lg">
                            <div className="flex items-center gap-2">
                              <span className="text-gray-900 dark:text-white">Email Notifications</span>
                            </div>
                            <Switch
                              checked={formData.notifications.email}
                              onCheckedChange={(checked) =>
                                setFormData({
                                  ...formData,
                                  notifications: { ...formData.notifications, email: checked },
                                })
                              }
                            />
                          </div>

                          <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800/50 rounded-lg">
                            <div className="flex items-center gap-2">
                              <span className="text-gray-900 dark:text-white">SMS Notifications</span>
                              <Badge variant="outline" className="text-xs">Premium</Badge>
                            </div>
                            <Switch
                              checked={formData.notifications.sms}
                              onCheckedChange={(checked) =>
                                setFormData({
                                  ...formData,
                                  notifications: { ...formData.notifications, sms: checked },
                                })
                              }
                            />
                          </div>
                        </div>
                      </div>

                      {/* Environmental Impact Summary */}
                      <div className="p-6 bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 rounded-lg border border-green-200 dark:border-green-800">
                        <h3 className="font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                          <TrendingUp className="h-5 w-5 text-green-600 dark:text-green-400" />
                          Your Environmental Impact
                        </h3>
                        <div className="grid grid-cols-2 gap-4">
                          <div className="text-center">
                            <div className="text-2xl font-bold text-green-600 dark:text-green-400">
                              {calculateCO2Saved()} kg
                            </div>
                            <div className="text-sm text-gray-600 dark:text-gray-400">CO₂ Emissions Saved</div>
                          </div>
                          <div className="text-center">
                            <div className="text-2xl font-bold text-green-600 dark:text-green-400">
                              {formData.estimatedWeight} kg
                            </div>
                            <div className="text-sm text-gray-600 dark:text-gray-400">Waste Diverted</div>
                          </div>
                        </div>
                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-4 text-center">
                          Equivalent to planting {(parseFloat(calculateCO2Saved()) / 20).toFixed(1)} trees! 🌱
                        </p>
                      </div>
                    </TabsContent>

                    {/* Submit Error */}
                    {errors.submit && (
                      <div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
                        <p className="text-sm text-red-600 dark:text-red-400 flex items-center gap-2">
                          <AlertCircle className="h-4 w-4" />
                          {errors.submit}
                        </p>
                      </div>
                    )}

                    {/* Submit Button */}
                    <Button
                      type="submit"
                      disabled={isSubmitting}
                      className="w-full bg-emerald-600 hover:bg-emerald-700 text-white py-6 text-lg"
                    >
                      {isSubmitting ? (
                        <div className="flex items-center gap-2">
                          <motion.div
                            animate={{ rotate: 360 }}
                            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                            className="w-5 h-5 border-2 border-white border-t-transparent rounded-full"
                          />
                          Scheduling Pickup...
                        </div>
                      ) : (
                        <div className="flex items-center gap-2">
                          <CheckCircle className="h-5 w-5" />
                          Schedule Pickup · ${calculatePrice()}
                        </div>
                      )}
                    </Button>
                  </form>
                </CardContent>
              </Card>
            </Tabs>
          </motion.div>
        </div>
      </div>
    </div>
  )
}
