"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { CheckCircle2, AlertTriangle, Loader2 } from "lucide-react"

export default function SettingsPage() {
  const [checking, setChecking] = useState(false)
  const [status, setStatus] = useState<null | { ok: boolean; message: string }>(null)
  const [apiKey, setApiKey] = useState("")

  useEffect(() => {
    // Load saved key from localStorage
    try {
      const saved = localStorage.getItem("gemini_api_key")
      if (saved) setApiKey(saved)
    } catch {}
  }, [])

  const checkGemini = async () => {
    setChecking(true)
    setStatus(null)
    try {
      const res = await fetch("/api/settings/check-gemini", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ apiKey }),
      })
      const data = await res.json()
      setStatus({ ok: res.ok, message: data.message || (res.ok ? "Gemini is configured" : "Check failed") })
    } catch (e) {
      setStatus({ ok: false, message: "Request failed. See console." })
    } finally {
      setChecking(false)
    }
  }

  const saveKey = () => {
    try {
      localStorage.setItem("gemini_api_key", apiKey)
      setStatus({ ok: true, message: "API key saved in this browser." })
    } catch {
      setStatus({ ok: false, message: "Failed to save key in local storage." })
    }
  }

  return (
    <div className="container mx-auto px-6 py-8">
      <Card>
        <CardHeader>
          <CardTitle>Settings</CardTitle>
          <CardDescription>Manage app integrations and configuration</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">Gemini API Key</label>
            <input
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
              type="password"
              placeholder="Paste your Gemini API Key"
              className="w-full rounded-md border px-3 py-2 bg-background"
            />
            <div className="flex gap-2">
              <Button variant="outline" type="button" onClick={saveKey}>Save Key</Button>
              <Button variant="secondary" type="button" onClick={() => setApiKey("")}>Clear</Button>
              <a
                href="https://aistudio.google.com/api-keys"
                target="_blank"
                rel="noreferrer noopener"
                className="inline-flex items-center rounded-md border px-3 py-2 text-sm hover:bg-accent"
                title="Open Google AI Studio to create an API key"
              >
                Get API key
              </a>
            </div>
            <p className="text-xs text-muted-foreground">Stored locally in this browser. For server-side, set GEMINI_API_KEY in .env.local.</p>
          </div>
          <div className="flex items-center justify-between gap-4">
            <div>
              <div className="font-medium">Gemini API</div>
              <div className="text-sm text-muted-foreground">Verify GEMINI_API_KEY is set and usable</div>
            </div>
            <Button onClick={checkGemini} disabled={checking} className="min-w-40">
              {checking ? (
                <span className="inline-flex items-center gap-2">
                  <Loader2 className="h-4 w-4 animate-spin" /> Checking...
                </span>
              ) : (
                "Check configuration"
              )}
            </Button>
          </div>

          {status && (
            <div
              className={`flex items-center gap-2 rounded-md border p-3 text-sm ${
                status.ok
                  ? "border-emerald-300/50 bg-emerald-50 text-emerald-700 dark:bg-emerald-900/20 dark:text-emerald-300"
                  : "border-red-300/50 bg-red-50 text-red-700 dark:bg-red-900/20 dark:text-red-300"
              }`}
            >
              {status.ok ? (
                <CheckCircle2 className="h-4 w-4" />
              ) : (
                <AlertTriangle className="h-4 w-4" />
              )}
              <span>{status.message}</span>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
