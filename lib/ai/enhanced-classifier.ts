import { createClient } from "@/lib/supabase/server"
import { GoogleGenerativeAI } from "@google/generative-ai"
import { env } from "@/lib/env"

export interface ClassificationItem {
  wasteType: string
  confidence: number
  disposalInstructions: string
  boundingBox?: {
    x: number
    y: number
    width: number
    height: number
  }
}

export interface EnhancedClassificationResult {
  itemsDetected: number
  items: ClassificationItem[]
  explanation: string
  ocrText?: string
  contextTips: string[]
  carbonImpact: number
}

// Initialize Gemini AI (server-side)
const genAI = new GoogleGenerativeAI(env.GEMINI_API_KEY || "")

export async function enhancedClassifyWaste(
  imageUrl: string,
  options: {
    enableOCR?: boolean
    enableExplanation?: boolean
    userLocation?: string
  } = {},
): Promise<EnhancedClassificationResult> {
  const { enableOCR = true, enableExplanation = true, userLocation } = options

  try {
    // Use Gemini Pro Vision for image analysis
  const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" })

    // Fetch image and convert to base64
    const imageResponse = await fetch(imageUrl)
    const imageBuffer = await imageResponse.arrayBuffer()
    const base64Image = Buffer.from(imageBuffer).toString("base64")

    const prompt = `Analyze this waste image and provide a detailed classification in JSON format.

Instructions:
1. Detect ALL waste items in the image (multi-item detection)
2. For each item, classify as: recyclable, organic, hazardous, or general waste
3. Provide confidence scores (0-100) for each classification
4. ${enableOCR ? "Extract any visible text from labels or packaging" : ""}
5. ${enableExplanation ? "Explain your reasoning for each classification in detail, including WHY each item belongs to its category" : ""}
6. Provide specific disposal instructions for each item
7. ${userLocation ? `Consider local regulations for ${userLocation}` : "Provide general disposal guidelines"}
8. Estimate CO2 impact if properly recycled (in kg)
9. Provide context-aware tips (e.g., 'Pizza box? If greasy → general waste. If clean → recyclable.')

Return ONLY a valid JSON object with this exact structure (no markdown, no code blocks):
{
  "itemsDetected": <number>,
  "items": [
    {
      "wasteType": "recyclable|organic|hazardous|general",
      "confidence": <number 0-100>,
      "disposalInstructions": "<detailed instructions>"
    }
  ],
  "explanation": "<detailed reasoning with WHY for each classification>",
  "ocrText": "<extracted text from labels if any>",
  "contextTips": ["<practical tip 1>", "<practical tip 2>"],
  "carbonImpact": <number in kg>
}`

    const result = await model.generateContent([
      prompt,
      {
        inlineData: {
          mimeType: "image/jpeg",
          data: base64Image,
        },
      },
    ])

    const response = result.response
    const text = response.text()

    // Parse JSON response (remove markdown code blocks if present)
    const jsonMatch = text.match(/\{[\s\S]*\}/)
    if (!jsonMatch) {
      throw new Error("Invalid JSON response from Gemini AI")
    }

    const classificationResult: EnhancedClassificationResult = JSON.parse(jsonMatch[0])

    // Ensure all required fields exist
    return {
      itemsDetected: classificationResult.itemsDetected || 1,
      items: classificationResult.items || [],
      explanation: classificationResult.explanation || "",
      ocrText: classificationResult.ocrText,
      contextTips: classificationResult.contextTips || [],
      carbonImpact: classificationResult.carbonImpact || 0,
    }
  } catch (error) {
    console.error("[v0] Enhanced classification error:", error)
    throw error
  }
}

export async function saveEnhancedClassification(
  userId: string,
  imageUrl: string,
  result: EnhancedClassificationResult,
) {
  const supabase = await createClient()

  // Save primary classification
  const { data, error } = await supabase
    .from("waste_classifications")
    .insert({
      user_id: userId,
      image_url: imageUrl,
      waste_type: result.items[0]?.wasteType || "general",
      confidence: result.items[0]?.confidence || 0,
      disposal_instructions: result.items[0]?.disposalInstructions || "",
      items_detected: result.itemsDetected,
      explanation: result.explanation,
      ocr_text: result.ocrText,
      context_tips: result.contextTips,
      multi_item_results: result.items.length > 1 ? result.items : null,
    })
    .select()
    .single()

  if (error) {
    console.error("[v0] Error saving classification:", error)
    throw error
  }

  // Update user stats
  await updateUserStats(userId, result)

  return data
}

async function updateUserStats(userId: string, result: EnhancedClassificationResult) {
  const supabase = await createClient()

  // Get or create user stats
  const { data: stats } = await supabase.from("user_stats").select("*").eq("user_id", userId).single()

  const today = new Date().toISOString().split("T")[0]
  const lastActivity = stats?.last_activity_date

  // Calculate streak
  let currentStreak = stats?.current_streak || 0
  if (lastActivity) {
    const lastDate = new Date(lastActivity)
    const todayDate = new Date(today)
    const diffDays = Math.floor((todayDate.getTime() - lastDate.getTime()) / (1000 * 60 * 60 * 24))

    if (diffDays === 1) {
      currentStreak += 1
    } else if (diffDays > 1) {
      currentStreak = 1
    }
  } else {
    currentStreak = 1
  }

  const longestStreak = Math.max(currentStreak, stats?.longest_streak || 0)

  // Calculate points (10 points per item + bonus for multi-item)
  const pointsEarned = result.itemsDetected * 10 + (result.itemsDetected > 1 ? 20 : 0)

  // Calculate level (every 100 points = 1 level)
  const totalPoints = (stats?.total_points || 0) + pointsEarned
  const level = Math.floor(totalPoints / 100) + 1

  // Update or insert stats
  const { error } = await supabase.from("user_stats").upsert({
    user_id: userId,
    total_points: totalPoints,
    level,
    current_streak: currentStreak,
    longest_streak: longestStreak,
    last_activity_date: today,
    total_co2_saved: (stats?.total_co2_saved || 0) + result.carbonImpact,
    total_items_classified: (stats?.total_items_classified || 0) + result.itemsDetected,
    total_items_recycled:
      (stats?.total_items_recycled || 0) + result.items.filter((i) => i.wasteType === "recyclable").length,
    updated_at: new Date().toISOString(),
  })

  if (error) {
    console.error("[v0] Error updating user stats:", error)
  }

  // Check for badge achievements
  await checkBadgeAchievements(userId, totalPoints, currentStreak, stats)
}

async function checkBadgeAchievements(userId: string, totalPoints: number, currentStreak: number, stats: any) {
  const supabase = await createClient()

  // Get all badges
  const { data: badges } = await supabase.from("badges").select("*")

  if (!badges) return

  // Get user's earned badges
  const { data: earnedBadges } = await supabase.from("user_badges").select("badge_id").eq("user_id", userId)

  const earnedBadgeIds = new Set(earnedBadges?.map((b) => b.badge_id) || [])

  // Check each badge
  for (const badge of badges) {
    if (earnedBadgeIds.has(badge.id)) continue

    let earned = false

    switch (badge.requirement_type) {
      case "count":
        earned = (stats?.total_items_classified || 0) >= badge.requirement_value
        break
      case "streak":
        earned = currentStreak >= badge.requirement_value
        break
      case "co2":
        earned = (stats?.total_co2_saved || 0) >= badge.requirement_value
        break
    }

    if (earned) {
      await supabase.from("user_badges").insert({
        user_id: userId,
        badge_id: badge.id,
      })
    }
  }
}
