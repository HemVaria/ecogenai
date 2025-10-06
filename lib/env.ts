// Centralized environment variable helper for server-side code
// Do NOT import this from client components. Server-only.

const GEMINI_API_KEY = process.env.GEMINI_API_KEY || process.env.GOOGLE_GEMINI_API_KEY || ""

export const env = {
  GEMINI_API_KEY,
}

export function requireEnv(name: keyof typeof env) {
  const value = env[name]
  if (!value) {
    throw new Error(`Missing required env var: ${name}`)
  }
  return value
}
