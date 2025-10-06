import { type NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { enhancedClassifyWaste, saveEnhancedClassification } from "@/lib/ai/enhanced-classifier"

export async function POST(request: NextRequest) {
  try {
    const { imageUrl, enableOCR, enableExplanation, userLocation } = await request.json()

    if (!imageUrl) {
      return NextResponse.json({ error: "Image URL is required" }, { status: 400 })
    }

    // Get user if authenticated
    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    // Perform enhanced classification
    const result = await enhancedClassifyWaste(imageUrl, {
      enableOCR: enableOCR !== false,
      enableExplanation: enableExplanation !== false,
      userLocation,
    })

    // Save to database if user is authenticated
    if (user) {
      await saveEnhancedClassification(user.id, imageUrl, result)
    }

    return NextResponse.json(result)
  } catch (error) {
    console.error("[v0] Classification API error:", error)
    return NextResponse.json({ error: "Failed to classify waste" }, { status: 500 })
  }
}
