import { type NextRequest, NextResponse } from "next/server"
import { env } from "@/lib/env"
import { GoogleGenerativeAI } from "@google/generative-ai"
import { createClient as createSupabaseServerClient } from "@/lib/supabase/server"

// Define the waste classification categories
const WASTE_CATEGORIES = ["Plastic", "Glass", "Metal", "Paper", "Organic", "E-waste", "Biomedical"]

// Recycling tips for each category
const RECYCLING_TIPS = {
  Plastic: [
    "Remove caps and labels before recycling",
    "Rinse containers to remove food residue",
    "Check the recycling number on the bottom",
    "Avoid putting plastic bags in regular recycling bins",
  ],
  Glass: [
    "Remove metal caps and lids",
    "Rinse containers clean",
    "Separate by color if required locally",
    "Never mix with other glass types like windows or mirrors",
  ],
  Metal: [
    "Remove any plastic or paper labels",
    "Rinse food containers clean",
    "Crush aluminum cans to save space",
    "Separate ferrous and non-ferrous metals if required",
  ],
  Paper: [
    "Remove any plastic coating or tape",
    "Keep paper dry and clean",
    "Separate different paper types",
    "Avoid recycling paper with food contamination",
  ],
  Organic: [
    "Compost in your backyard or community program",
    "Remove any non-organic materials",
    "Keep separate from other waste types",
    "Consider vermicomposting for apartment living",
  ],
  "E-waste": [
    "Take to certified e-waste recycling centers",
    "Remove personal data from devices",
    "Keep batteries separate",
    "Never put in regular trash due to toxic materials",
  ],
  Biomedical: [
    "Use designated medical waste disposal services",
    "Never put in regular trash or recycling",
    "Follow local healthcare facility guidelines",
    "Ensure proper containment to prevent contamination",
  ],
}

// Environmental impact information
const ENVIRONMENTAL_IMPACT = {
  Plastic:
    "Recycling plastic reduces oil consumption and prevents ocean pollution. One recycled plastic bottle can save enough energy to power a light bulb for 3 hours.",
  Glass:
    "Glass can be recycled indefinitely without losing quality. Recycling glass reduces energy consumption by 30% compared to making new glass.",
  Metal:
    "Recycling aluminum cans uses 95% less energy than producing new ones. Steel recycling saves 74% of energy needed for new steel production.",
  Paper:
    "Recycling paper saves trees, water, and energy. One ton of recycled paper saves 17 trees and 7,000 gallons of water.",
  Organic:
    "Composting organic waste reduces methane emissions from landfills and creates nutrient-rich soil amendment for plants.",
  "E-waste":
    "Proper e-waste recycling recovers valuable metals and prevents toxic materials from contaminating soil and water.",
  Biomedical:
    "Proper disposal prevents disease transmission and environmental contamination from pharmaceutical and biological materials.",
}

// Disposal methods for each category
const DISPOSAL_METHODS = {
  Plastic: "Place in recycling bin with plastic containers (check local guidelines for accepted types)",
  Glass: "Place in glass recycling bin or take to recycling center",
  Metal: "Place in metal recycling bin or scrap metal collection",
  Paper: "Place in paper recycling bin (ensure it's clean and dry)",
  Organic: "Compost bin, organic waste collection, or backyard composting",
  "E-waste": "Take to certified e-waste recycling center or electronics retailer",
  Biomedical: "Use medical waste disposal service or return to healthcare facility",
}

// Gemini AI prompt for waste classification
function createGeminiPrompt(imageBase64: string) {
  return {
    contents: [
      {
        parts: [
          {
            text: `You are an expert waste classification AI. Analyze this image and classify the waste into one of these 7 categories: ${WASTE_CATEGORIES.join(", ")}.

Please provide:
1. The most likely category from the 7 options
2. Confidence percentage (0-100)
3. Detailed explanation of your analysis
4. Consider material composition, shape, and visible recycling symbols
5. Handle unclear images by providing your best assessment

Respond in this exact JSON format:
{
  "category": "category_name",
  "confidence": confidence_percentage,
  "explanation": "detailed_explanation_of_analysis"
}

Focus on accuracy and provide educational explanations about why you classified the item as you did.`,
          },
          {
            inline_data: {
              mime_type: "image/jpeg",
              data: imageBase64.split(",")[1], // Remove data:image/jpeg;base64, prefix
            },
          },
        ],
      },
    ],
  }
}

export async function POST(request: NextRequest) {
  try {
    console.log("[v0] Starting waste classification request")
    const { image, apiKey } = await request.json()

    if (!image) {
      console.log("[v0] No image provided in request")
      return NextResponse.json({ error: "No image provided" }, { status: 400 })
    }

    const keyToUse = env.GEMINI_API_KEY || apiKey || ""
    console.log("[v0] API key available:", Boolean(keyToUse))

    if (!keyToUse) {
      console.log("[v0] Missing Gemini API key (env or provided)")
      return NextResponse.json(
        {
          error:
            "Gemini API key is required. Save it in Settings or set GEMINI_API_KEY in .env.local.",
        },
        { status: 500 },
      )
    }

    console.log("[v0] Created Gemini prompt, making API call via SDK...")
    const genAI = new GoogleGenerativeAI(keyToUse)
    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" })

  const sdkResult = await model.generateContent([
      `You are an expert waste classification AI. Analyze this image and classify the waste into one of these 7 categories: ${WASTE_CATEGORIES.join(", ")}.\n\nPlease provide:\n1. The most likely category from the 7 options\n2. Confidence percentage (0-100)\n3. Detailed explanation of your analysis\n4. Consider material composition, shape, and visible recycling symbols\n5. Handle unclear images by providing your best assessment\n\nRespond in this exact JSON format:\n{\n  "category": "category_name",\n  "confidence": confidence_percentage,\n  "explanation": "detailed_explanation_of_analysis"\n}\n\nFocus on accuracy and provide educational explanations about why you classified the item as you did.`,
      {
        inlineData: {
          mimeType: "image/jpeg",
          data: image.split(",")[1],
        },
      },
    ])

  const generatedText = sdkResult.response.text()
    console.log("[v0] Generated text from Gemini:", generatedText)

    let classificationData
    try {
      // First try to parse directly as JSON
      classificationData = JSON.parse(generatedText)
    } catch (parseError) {
      console.log("[v0] Direct JSON parse failed, trying to extract from markdown")
      try {
        // If that fails, try to extract JSON from markdown code blocks
        const jsonMatch = generatedText.match(/```(?:json)?\s*(\{[\s\S]*?\})\s*```/)
        if (jsonMatch) {
          classificationData = JSON.parse(jsonMatch[1])
        } else {
          // Try to find JSON object without code blocks
          const jsonObjectMatch = generatedText.match(/\{[\s\S]*\}/)
          if (jsonObjectMatch) {
            classificationData = JSON.parse(jsonObjectMatch[0])
          } else {
            throw new Error("No valid JSON found in response")
          }
        }
      } catch (secondParseError) {
        console.error("[v0] Failed to parse Gemini response:", generatedText)
        throw new Error("Invalid response format from AI")
      }
    }

    console.log("[v0] Successfully parsed classification data:", classificationData)

    const finalResult = {
      ...classificationData,
      recyclingTips: RECYCLING_TIPS[classificationData.category as keyof typeof RECYCLING_TIPS],
      disposalMethod: DISPOSAL_METHODS[classificationData.category as keyof typeof DISPOSAL_METHODS],
      environmentalImpact: ENVIRONMENTAL_IMPACT[classificationData.category as keyof typeof ENVIRONMENTAL_IMPACT],
    }

    // Try to persist the classification for the signed-in user (non-blocking)
    try {
      const supabase = await createSupabaseServerClient()
      const { data: userResp } = await supabase.auth.getUser()
      const user = userResp?.user
      if (user) {
        await supabase.from("waste_classifications").insert({
          user_id: user.id,
          image_url: image,
          classification_result: finalResult,
          confidence_score: Number(finalResult?.confidence ?? 0) / 100,
        })
        console.log("[v0] Saved classification history row for user", user.id)
      } else {
        console.log("[v0] No authenticated user found; skipping history save")
      }
    } catch (persistErr) {
      console.warn("[v0] Failed to persist classification history (non-blocking)", persistErr)
    }

    console.log("[v0] Returning final result:", finalResult)
    return NextResponse.json(finalResult)
  } catch (error) {
    console.error("[v0] Classification error details:", error)
    console.error("[v0] Error message:", error instanceof Error ? error.message : String(error))
    console.error("[v0] Error stack:", error instanceof Error ? error.stack : "No stack trace")
    return NextResponse.json(
      { error: `Classification failed: ${error instanceof Error ? error.message : String(error)}` },
      { status: 500 },
    )
  }
}
