import { type NextRequest, NextResponse } from "next/server"
import { chatWithAssistant } from "@/lib/ai/chatbot"

export async function POST(request: NextRequest) {
  try {
    const { message, history } = await request.json()

    if (!message) {
      return NextResponse.json({ error: "Message is required" }, { status: 400 })
    }

    // Check if API key is configured
    if (!process.env.GEMINI_API_KEY) {
      console.error("[v0] GEMINI_API_KEY is not configured")
      return NextResponse.json(
        { error: "Chatbot is not configured. Please contact the administrator." },
        { status: 500 }
      )
    }

    const response = await chatWithAssistant(message, history || [])

    return NextResponse.json({ response })
  } catch (error) {
    console.error("[v0] Chatbot API error:", error)
    const errorMessage = error instanceof Error ? error.message : "Unknown error"
    return NextResponse.json(
      { error: `Failed to get response from assistant: ${errorMessage}` },
      { status: 500 }
    )
  }
}
