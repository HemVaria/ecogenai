import { NextRequest, NextResponse } from "next/server"
import { env } from "@/lib/env"
import { GoogleGenerativeAI } from "@google/generative-ai"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json().catch(() => ({}))
    const apiKey = body?.apiKey || env.GEMINI_API_KEY
    if (!apiKey) {
      return NextResponse.json(
        { ok: false, message: "GEMINI_API_KEY not set (or GOOGLE_GEMINI_API_KEY)." },
        { status: 500 },
      )
    }

    // Lightweight check: create client and query model info without sending user data
  const genAI = new GoogleGenerativeAI(apiKey)
  const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" })
    // model info call; if unauthorized it will throw
    await model.generateContent("ping")
    return NextResponse.json({ ok: true, message: "Gemini is reachable and the API key looks valid." })
  } catch (error: any) {
    const message = error?.message || "Unknown error"
    return NextResponse.json(
      { ok: false, message: `Gemini check failed: ${message}` },
      { status: 500 },
    )
  }
}
