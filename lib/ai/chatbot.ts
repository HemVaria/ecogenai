import { GoogleGenerativeAI } from "@google/generative-ai"
import { env } from "@/lib/env"

const genAI = new GoogleGenerativeAI(env.GEMINI_API_KEY || "")
export interface ChatMessage {
  role: "user" | "assistant"
  content: string
}

export async function chatWithAssistant(
  message: string,
  history: ChatMessage[] = [],
): Promise<string> {
  try {
  const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" })

    // Create system prompt
    const systemPrompt = `You are an eco-friendly waste management assistant. Help users with:
- Where to dispose of specific items
- How to properly recycle or dispose of waste
- Environmental impact of different disposal methods
- Tips for reducing waste
- Local recycling guidelines
- Hazardous waste handling

Be friendly, concise, and actionable. Always prioritize environmental safety.`

    // Format conversation history for Gemini
    const chat = model.startChat({
      history: [
        {
          role: "user",
          parts: [{ text: systemPrompt }],
        },
        {
          role: "model",
          parts: [{ text: "I understand. I'm ready to help with waste management questions!" }],
        },
        ...history.map((msg) => ({
          role: msg.role === "user" ? "user" : "model",
          parts: [{ text: msg.content }],
        })),
      ],
    })

    const result = await chat.sendMessage(message)
    return result.response.text()
  } catch (error) {
    console.error("[v0] Chatbot error:", error)
    throw error
  }
}
