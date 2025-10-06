"use client"

import { useState, useCallback, useEffect } from "react"
import { useDropzone } from "react-dropzone"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Upload, Camera, Recycle, History, CheckCircle, AlertCircle, LogIn } from "lucide-react"
import Link from "next/link"
import { motion, AnimatePresence } from "framer-motion"
import { createClient } from "@/lib/supabase/client"
import { useRouter } from "next/navigation"

interface ClassificationResult {
  category: string
  confidence: number
  explanation: string
  recyclingTips: string[]
  disposalMethod: string
  environmentalImpact: string
}

interface HistoryItem {
  id: string
  image_url: string
  classification_result: ClassificationResult
  confidence_score: number
  created_at: string
}

const wasteCategories = [
  { name: "Plastic", color: "bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 border-blue-200 dark:border-blue-800", icon: "🔵" },
  { name: "Glass", color: "bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200 border-green-200 dark:border-green-800", icon: "🟢" },
  { name: "Metal", color: "bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-200 border-gray-200 dark:border-gray-700", icon: "⚪" },
  { name: "Paper", color: "bg-yellow-100 dark:bg-yellow-900 text-yellow-800 dark:text-yellow-200 border-yellow-200 dark:border-yellow-800", icon: "🟡" },
  { name: "Organic", color: "bg-emerald-100 dark:bg-emerald-900 text-emerald-800 dark:text-emerald-200 border-emerald-200 dark:border-emerald-800", icon: "🟢" },
  { name: "E-waste", color: "bg-purple-100 dark:bg-purple-900 text-purple-800 dark:text-purple-200 border-purple-200 dark:border-purple-800", icon: "🟣" },
  { name: "Biomedical", color: "bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-200 border-red-200 dark:border-red-800", icon: "🔴" },
]

export default function WasteClassifier() {
  const [uploadedImage, setUploadedImage] = useState<string | null>(null)
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [result, setResult] = useState<ClassificationResult | null>(null)
  const [errorMsg, setErrorMsg] = useState<string | null>(null)
  const [history, setHistory] = useState<HistoryItem[]>([])
  const [user, setUser] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)
  const router = useRouter()
  const supabase = createClient()

  useEffect(() => {
    const checkAuth = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser()
      setUser(user)
      setIsLoading(false)

      if (user) {
        loadHistory()
      }
    }

    checkAuth()

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null)
      if (session?.user) {
        loadHistory()
      } else {
        setHistory([])
      }
    })

    return () => subscription.unsubscribe()
  }, [])

  const loadHistory = async () => {
    try {
      const { data, error } = await supabase
        .from("waste_classifications")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(10)

      if (error) throw error
      setHistory(data || [])
    } catch (error) {
      console.error("Error loading history:", error)
    }
  }

  const saveClassification = async (imageUrl: string, classificationResult: ClassificationResult) => {
    if (!user) return

    try {
      const { error } = await supabase.from("waste_classifications").insert({
        user_id: user.id,
        image_url: imageUrl,
        classification_result: classificationResult,
        confidence_score: classificationResult.confidence / 100,
      })

      if (error) throw error
      loadHistory() // Refresh history
    } catch (error) {
      console.error("Error saving classification:", error)
    }
  }

  const onDrop = useCallback((acceptedFiles: File[]) => {
    const file = acceptedFiles[0]
    if (file) {
      const reader = new FileReader()
      reader.onload = () => {
        setUploadedImage(reader.result as string)
        analyzeWaste(reader.result as string)
      }
      reader.readAsDataURL(file)
    }
  }, [])

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      "image/*": [".jpeg", ".jpg", ".png", ".webp"],
    },
    multiple: false,
  })

  const analyzeWaste = async (imageData: string) => {
    setIsAnalyzing(true)
    setResult(null)
    setErrorMsg(null)

    try {
      // Read API key from local storage (if user saved it in Settings)
      let apiKey: string | undefined
      try {
        apiKey = localStorage.getItem("gemini_api_key") || undefined
      } catch {}

      const response = await fetch("/api/classify-waste", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ image: imageData, apiKey }),
      })

      const classificationResult = await response.json()
      if (!response.ok) {
        throw new Error(
          classificationResult?.error ||
            "Classification failed. Please verify Gemini configuration in Settings and try a clearer image.",
        )
      }
      setResult(classificationResult)

      if (user) {
        await saveClassification(imageData, classificationResult)
      }
    } catch (error: any) {
      console.error("Classification error:", error)
      setErrorMsg(error?.message || "Classification failed. Please try again.")
    } finally {
      setIsAnalyzing(false)
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-teal-50 to-cyan-50 flex items-center justify-center">
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-teal-50 to-cyan-50 dark:from-gray-950 dark:via-gray-900 dark:to-gray-950">
      <div className="container mx-auto px-6 py-8">
        {!user && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8 p-6 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-xl"
          >
            <div className="flex items-center gap-4">
              <div className="p-3 bg-blue-100 dark:bg-blue-900 rounded-lg">
                <LogIn className="h-6 w-6 text-blue-600 dark:text-blue-400" />
              </div>
              <div>
                <h3 className="font-semibold text-blue-900 dark:text-blue-100">Sign in to save your classifications</h3>
                <p className="text-blue-700 dark:text-blue-300 text-sm mt-1">
                  Create an account to track your waste classification history and access personalized features.
                </p>
              </div>
              <Link href="/auth/signup">
                <Button className="bg-blue-600 hover:bg-blue-700 text-white">Get Started</Button>
              </Link>
            </div>
          </motion.div>
        )}

        <div className="grid lg:grid-cols-4 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-3 space-y-8">
            {errorMsg && (
              <div className="p-4 rounded-lg border border-red-200 bg-red-50 text-red-700 dark:border-red-800 dark:bg-red-900/20 dark:text-red-300">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-medium">{errorMsg}</p>
                  <Link href="/settings" className="underline text-red-700 dark:text-red-300">
                    Open Settings
                  </Link>
                </div>
              </div>
            )}
            {/* Upload Area */}
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
              <Card className="border-0 shadow-xl overflow-hidden">
                <CardHeader className="bg-gradient-to-r from-emerald-500 to-teal-500 text-white">
                  <CardTitle className="flex items-center gap-3 text-white">
                    <Camera className="h-6 w-6" />
                    Upload Waste Image
                  </CardTitle>
                  <CardDescription className="text-white/90">
                    Take a photo or upload an image of waste for AI-powered classification
                  </CardDescription>
                </CardHeader>
                <CardContent className="p-8 bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm">
                  <div
                    {...getRootProps()}
                    className={`border-2 border-dashed rounded-2xl p-12 text-center cursor-pointer transition-all duration-300 ${
                      isDragActive
                        ? "border-emerald-400 bg-emerald-50 dark:bg-emerald-900/20 scale-[1.02] shadow-lg"
                        : "border-gray-300 dark:border-gray-700 hover:border-emerald-400 hover:bg-emerald-50/50 dark:hover:bg-emerald-900/10 hover:shadow-md"
                    }`}
                  >
                    <input {...getInputProps()} />
                    <motion.div animate={isDragActive ? { scale: 1.1 } : { scale: 1 }} transition={{ duration: 0.2 }}>
                      <Upload className="h-16 w-16 mx-auto mb-6 text-gray-400 dark:text-gray-600" />
                    </motion.div>
                    {isDragActive ? (
                      <p className="text-xl font-semibold text-emerald-600 dark:text-emerald-400">Drop the image here...</p>
                    ) : (
                      <div>
                        <p className="text-xl font-semibold mb-3 text-gray-700 dark:text-gray-300">
                          Drag & drop an image here, or click to select
                        </p>
                        <p className="text-gray-500 dark:text-gray-400">Supports JPG, PNG, WebP formats</p>
                      </div>
                    )}
                  </div>

                  <AnimatePresence>
                    {uploadedImage && (
                      <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.9 }}
                        transition={{ duration: 0.3 }}
                        className="mt-8"
                      >
                        <div className="relative w-full max-w-lg mx-auto">
                          <img
                            src={uploadedImage || "/placeholder.svg"}
                            alt="Uploaded waste"
                            className="w-full h-80 object-cover rounded-2xl border shadow-lg"
                          />
                          {isAnalyzing && (
                            <motion.div
                              initial={{ opacity: 0 }}
                              animate={{ opacity: 1 }}
                              className="absolute inset-0 bg-black/60 rounded-2xl flex items-center justify-center backdrop-blur-sm"
                            >
                              <div className="text-white text-center flex flex-col items-center">
                                <FancyLoader />
                                <p className="font-semibold text-lg mt-4">Analyzing image...</p>
                                <p className="text-sm text-gray-200 mt-1">Using AI to classify waste type</p>
                              </div>
                            </motion.div>
                          )}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </CardContent>
              </Card>
            </motion.div>

            {/* Classification Result */}
            <AnimatePresence>
              {result && (
                <motion.div
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -30 }}
                  transition={{ duration: 0.5 }}
                >
                  <Card className="border-0 shadow-xl overflow-hidden">
                    <CardHeader className="bg-gradient-to-r from-teal-500 to-cyan-500 text-white">
                      <CardTitle className="flex items-center gap-3 text-white">
                        <CheckCircle className="h-6 w-6" />
                        Classification Result
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="p-8 bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm">
                      <div className="grid md:grid-cols-2 gap-8">
                        <div className="space-y-6">
                          <div>
                            <div className="flex items-center gap-3 mb-4">
                              <Badge className="text-lg px-4 py-2 bg-emerald-100 dark:bg-emerald-900 text-emerald-800 dark:text-emerald-200 border-emerald-200 dark:border-emerald-800">
                                {result.category}
                              </Badge>
                              <div className="flex items-center gap-2">
                                <div className="w-32 bg-gray-200 dark:bg-gray-700 rounded-full h-3">
                                  <motion.div
                                    initial={{ width: 0 }}
                                    animate={{ width: `${result.confidence}%` }}
                                    transition={{ duration: 1, delay: 0.3 }}
                                    className="bg-gradient-to-r from-emerald-500 to-teal-500 h-3 rounded-full"
                                  />
                                </div>
                                <span className="font-semibold text-gray-700 dark:text-gray-300">{result.confidence}%</span>
                              </div>
                            </div>
                            <p className="text-gray-600 dark:text-gray-300 leading-relaxed">{result.explanation}</p>
                          </div>

                          <div>
                            <h4 className="font-semibold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
                              <Recycle className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
                              Disposal Method
                            </h4>
                            <p className="text-gray-600 dark:text-gray-300 bg-emerald-50 dark:bg-emerald-900/20 p-4 rounded-lg border border-emerald-200 dark:border-emerald-800">
                              {result.disposalMethod}
                            </p>
                          </div>
                        </div>

                        <div className="space-y-6">
                          <div>
                            <h4 className="font-semibold text-gray-900 dark:text-white mb-4">Recycling Tips</h4>
                            <ul className="space-y-3">
                              {result.recyclingTips.map((tip, index) => (
                                <motion.li
                                  key={index}
                                  initial={{ opacity: 0, x: -20 }}
                                  animate={{ opacity: 1, x: 0 }}
                                  transition={{ duration: 0.3, delay: index * 0.1 }}
                                  className="flex items-start gap-3 text-gray-600 dark:text-gray-300"
                                >
                                  <div className="w-6 h-6 bg-emerald-100 dark:bg-emerald-900 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                                    <span className="text-emerald-600 dark:text-emerald-400 font-semibold text-sm">{index + 1}</span>
                                  </div>
                                  {tip}
                                </motion.li>
                              ))}
                            </ul>
                          </div>

                          <div>
                            <h4 className="font-semibold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
                              <AlertCircle className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                              Environmental Impact
                            </h4>
                            <p className="text-gray-600 dark:text-gray-300 bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg border border-blue-200 dark:border-blue-800">
                              {result.environmentalImpact}
                            </p>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Waste Categories */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
            >
              <Card className="border-0 shadow-xl bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm">
                <CardHeader>
                  <CardTitle className="text-lg text-gray-900 dark:text-white">Waste Categories</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {wasteCategories.map((category, index) => (
                      <motion.div
                        key={category.name}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.3, delay: index * 0.05 }}
                      >
                        <Badge
                          variant="outline"
                          className={`w-full justify-start p-4 transition-all hover:scale-105 cursor-pointer ${category.color}`}
                        >
                          <span className="mr-3 text-lg">{category.icon}</span>
                          <span className="font-medium">{category.name}</span>
                        </Badge>
                      </motion.div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            {/* Recent Classifications */}
            {user && history.length > 0 && (
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5, delay: 0.4 }}
              >
                <Card className="border-0 shadow-xl bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-lg text-gray-900 dark:text-white">
                      <History className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
                      Recent Classifications
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {history.slice(0, 3).map((item, index) => (
                        <motion.div
                          key={item.id}
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ duration: 0.3, delay: index * 0.1 }}
                          className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors cursor-pointer"
                        >
                          <img
                            src={item.image_url || "/placeholder.svg"}
                            alt="Classification"
                            className="w-12 h-12 object-cover rounded-lg"
                          />
                          <div className="flex-1 min-w-0">
                            <p className="font-medium text-sm text-gray-900 dark:text-white truncate">
                              {item.classification_result.category}
                            </p>
                            <p className="text-xs text-gray-500 dark:text-gray-400">
                              {Math.round(item.confidence_score * 100)}% confidence
                            </p>
                          </div>
                        </motion.div>
                      ))}
                    </div>
                    {history.length > 3 && (
                      <div className="mt-4 pt-3 border-t border-gray-200 dark:border-gray-700">
                        <Link href="/dashboard">
                          <Button
                            variant="outline"
                            size="sm"
                            className="w-full text-emerald-600 dark:text-emerald-400 border-emerald-600 dark:border-emerald-400 bg-transparent hover:bg-emerald-50 dark:hover:bg-emerald-900/20"
                          >
                            View All History
                          </Button>
                        </Link>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </motion.div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

function FancyLoader() {
  return (
    <div className="loaderWrap">
      <div className="loader" />
      <style jsx>{`
        .loader {
          width: 120px;
          height: 150px;
          background-color: #fff;
          background-repeat: no-repeat;
          background-image:
            linear-gradient(#ddd 50%, #bbb 51%),
            linear-gradient(#ddd, #ddd),
            linear-gradient(#ddd, #ddd),
            radial-gradient(ellipse at center, #aaa 25%, #eee 26%, #eee 50%, #0000 55%),
            radial-gradient(ellipse at center, #aaa 25%, #eee 26%, #eee 50%, #0000 55%),
            radial-gradient(ellipse at center, #aaa 25%, #eee 26%, #eee 50%, #0000 55%);
          background-position: 0 20px, 45px 0, 8px 6px, 55px 3px, 75px 3px, 95px 3px;
          background-size: 100% 4px, 1px 23px, 30px 8px, 15px 15px, 15px 15px, 15px 15px;
          position: relative;
          border-radius: 6%;
          animation: shake 3s ease-in-out infinite;
          transform-origin: 60px 180px;
        }
        .loader:before {
          content: "";
          position: absolute;
          left: 5px;
          top: 100%;
          width: 7px;
          height: 5px;
          background: #aaa;
          border-radius: 0 0 4px 4px;
          box-shadow: 102px 0 #aaa;
        }
        .loader:after {
          content: "";
          position: absolute;
          width: 95px;
          height: 95px;
          left: 0;
          right: 0;
          margin: auto;
          bottom: 20px;
          background-color: #bbdefb;
          background-image:
            linear-gradient(to right, #0004 0%, #0004 49%, #0000 50%, #0000 100%),
            linear-gradient(135deg, #64b5f6 50%, #607d8b 51%);
          background-size: 30px 100%, 90px 80px;
          border-radius: 50%;
          background-repeat: repeat, no-repeat;
          background-position: 0 0;
          box-sizing: border-box;
          border: 10px solid #DDD;
          box-shadow: 0 0 0 4px #999 inset, 0 0 6px 6px #0004 inset;
          animation: spin 3s ease-in-out infinite;
        }
        @keyframes spin {
          0% { transform: rotate(0deg); }
          50% { transform: rotate(360deg); }
          75% { transform: rotate(750deg); }
          100% { transform: rotate(1800deg); }
        }
        @keyframes shake {
          65%, 80%, 88%, 96% { transform: rotate(0.5deg); }
          50%, 75%, 84%, 92% { transform: rotate(-0.5deg); }
          0%, 50%, 100% { transform: rotate(0); }
        }
      `}</style>
    </div>
  )
}
