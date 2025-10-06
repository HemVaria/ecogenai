"use client"

import { useCallback, useEffect, useMemo, useRef, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import {
  QrCode,
  Upload,
  CheckCircle2,
  XCircle,
  Trophy,
  Award,
  History as HistoryIcon,
  Sparkles,
  Camera
} from "lucide-react"

type ScanResultType = "success" | "error"

type HistoryItem = {
  id: string
  label: string
  result: ScanResultType
  points: number
  timestamp: number
  message: string
}

type SampleQR = { id: string; label: string; bin: string }

const SAMPLE_QRS: SampleQR[] = [
  { id: "QR-PLASTIC-001", label: "Recycle Bin (Plastic)", bin: "Recycle • Plastic" },
  { id: "QR-PAPER-002", label: "Recycle Bin (Paper)", bin: "Recycle • Paper" },
  { id: "QR-ORGANIC-003", label: "Organic Waste", bin: "Organic" },
]

const formatTime = (t: number) => new Date(t).toLocaleString()

export default function QRScanDemoPage() {
  const [points, setPoints] = useState<number>(0)
  const [history, setHistory] = useState<HistoryItem[]>([])
  const [lastResult, setLastResult] = useState<HistoryItem | null>(null)
  const [scanning, setScanning] = useState<boolean>(false)
  const [showConfetti, setShowConfetti] = useState<boolean>(false)
  const [earnedBadge, setEarnedBadge] = useState<string | null>(null)

  // Load/save basic demo state to localStorage for fun persistence
  useEffect(() => {
    try {
      const saved = localStorage.getItem("qr-demo-state")
      if (saved) {
        const parsed = JSON.parse(saved)
        setPoints(parsed.points || 0)
        setHistory(parsed.history || [])
      }
    } catch {}
  }, [])

  useEffect(() => {
    try {
      localStorage.setItem("qr-demo-state", JSON.stringify({ points, history }))
    } catch {}
  }, [points, history])

  const totalScans = history.length
  const correctScans = history.filter(h => h.result === "success").length

  const leaderboard = useMemo(() => {
    const others = [
      { name: "EcoNinja", pts: 120 },
      { name: "GreenGuru", pts: 95 },
      { name: "RecycleRanger", pts: 80 },
      { name: "CompostChamp", pts: 60 },
    ]
    return [
      { name: "You", pts: points },
      ...others,
    ].sort((a, b) => b.pts - a.pts)
  }, [points])

  const awardBadgesIfAny = useCallback((newHistory: HistoryItem[]) => {
    const total = newHistory.length
    const correct = newHistory.filter(h => h.result === "success").length
    if (total === 1) {
      setEarnedBadge("First Scan ✅")
      return
    }
    if (correct === 3) {
      setEarnedBadge("3 Correct Scans 🥉")
      return
    }
    if (correct === 5) {
      setEarnedBadge("5 Correct Scans 🥈")
      return
    }
  }, [])

  const simulateScan = useCallback((sample?: SampleQR) => {
    const chosen = sample ?? SAMPLE_QRS[Math.floor(Math.random() * SAMPLE_QRS.length)]
    setScanning(true)
    // Small delay to simulate work
    setTimeout(() => {
      const success = Math.random() < 0.7 // 70% success
      const earned = success ? Math.floor(8 + Math.random() * 8) : 0
      const message = success
        ? `You scanned: ${chosen.label} – Correct!`
        : `Oops! This bin is for ${chosen.label.includes("Recycle") ? "recyclables" : chosen.label}.`
      const item: HistoryItem = {
        id: `${chosen.id}-${Date.now()}`,
        label: chosen.label,
        result: success ? "success" : "error",
        points: earned,
        timestamp: Date.now(),
        message,
      }
      setLastResult(item)
      setHistory(prev => {
        const upd = [item, ...prev].slice(0, 20)
        awardBadgesIfAny(upd)
        return upd
      })
      if (earned > 0) {
        setPoints(p => p + earned)
        setShowConfetti(true)
        setTimeout(() => setShowConfetti(false), 1600)
      }
      setScanning(false)
    }, 700)
  }, [awardBadgesIfAny])

  const fileInputRef = useRef<HTMLInputElement | null>(null)
  const handleUploadClick = () => fileInputRef.current?.click()
  const handleFileChosen = () => simulateScan()

  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      {/* Header */}
      <div className="mb-6 rounded-xl p-6" style={{
        background: "linear-gradient(135deg, #F8FFE4 0%, #AEEA00 50%, #FFD600 100%)",
      }}>
        <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight" style={{ color: "#10271A" }}>
          QR Bin Scanner (Demo)
        </h1>
        <p className="mt-2 text-sm md:text-base" style={{ color: "#183018" }}>
          Choose "Upload sample QR code" or click the on-screen QR to simulate a scan. Press "Start Demo Scan" for a random scan.
        </p>
        <div className="mt-4">
          <Alert>
            <AlertTitle>Demo feature</AlertTitle>
            <AlertDescription>
              This QR Bin Scanner is a prototype for future development. No real camera or backend is used here—results are simulated for demonstration.
            </AlertDescription>
          </Alert>
        </div>
        <div className="mt-4 flex flex-wrap gap-3">
          <Button onClick={() => simulateScan()} className="font-semibold" style={{ backgroundColor: "#26A65B", color: "white" }}>
            <Sparkles className="h-4 w-4 mr-2" /> Start Demo Scan
          </Button>
          <Button variant="outline" onClick={handleUploadClick}>
            <Upload className="h-4 w-4 mr-2" /> Upload sample QR code
          </Button>
          <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handleFileChosen} />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left: Demo scanner + last result */}
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <QrCode className="h-5 w-5" /> DemoScanner
              </CardTitle>
              <CardDescription>Click a sample QR or the big one to simulate scanning.</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {SAMPLE_QRS.map(q => (
                  <button
                    key={q.id}
                    onClick={() => simulateScan(q)}
                    className="group rounded-lg border p-4 text-left hover:shadow-sm transition"
                  >
                    <div className="aspect-square w-full rounded bg-muted flex items-center justify-center">
                      <div className="text-xs text-muted-foreground">{q.id}</div>
                    </div>
                    <div className="mt-3 font-medium">{q.label}</div>
                    <div className="text-xs text-muted-foreground">{q.bin}</div>
                  </button>
                ))}
                <button
                  onClick={() => simulateScan()}
                  className="md:col-span-3 rounded-lg border p-4 hover:shadow-sm transition"
                >
                  <div className="w-full aspect-video rounded-lg flex items-center justify-center" style={{ background: "repeating-linear-gradient(45deg, #10271A11, #10271A11 10px, #26A65B11 10px, #26A65B11 20px)" }}>
                    <div className="flex items-center gap-2 text-sm">
                      <Camera className="h-4 w-4" /> Click to demo scan
                    </div>
                  </div>
                </button>
              </div>

              {/* Last scan result */}
              {lastResult && (
                <div className="mt-6">
                  <ScanResult item={lastResult} />
                </div>
              )}
            </CardContent>
          </Card>

          {/* History log */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2"><HistoryIcon className="h-5 w-5" /> History / Activity Log</CardTitle>
              <CardDescription>Recent demo scans with result, points, and timestamp.</CardDescription>
            </CardHeader>
            <CardContent>
              <HistoryLog items={history} />
            </CardContent>
          </Card>
        </div>

        {/* Right: Points, Leaderboard, Badges */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2"><Trophy className="h-5 w-5" /> Points</CardTitle>
              <CardDescription>Total points from successful demo scans.</CardDescription>
            </CardHeader>
            <CardContent>
              <PointsDisplay value={points} />
              <div className="mt-3 text-sm text-muted-foreground">Scans: {totalScans} • Correct: {correctScans}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2"><Award className="h-5 w-5" /> Leaderboard</CardTitle>
              <CardDescription>Fake top demo users (mock data).</CardDescription>
            </CardHeader>
            <CardContent>
              <Leaderboard data={leaderboard} />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Achievements</CardTitle>
              <CardDescription>Earn badges for hitting milestones.</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2">
                <Badge variant="secondary">1st Scan</Badge>
                <Badge variant="secondary">3 Correct</Badge>
                <Badge variant="secondary">5 Correct</Badge>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Confetti overlay */}
      {showConfetti && <ConfettiOverlay />}
      {/* Badge popup */}
      {earnedBadge && <BadgePopup label={earnedBadge} onClose={() => setEarnedBadge(null)} />}
    </div>
  )
}

function PointsDisplay({ value }: { value: number }) {
  const [display, setDisplay] = useState(value)
  const raf = useRef<number | null>(null)
  useEffect(() => {
    const start = display
    const end = value
    const duration = 600
    const startTs = performance.now()
    const tick = (ts: number) => {
      const p = Math.min(1, (ts - startTs) / duration)
      const cur = Math.round(start + (end - start) * p)
      setDisplay(cur)
      if (p < 1) raf.current = requestAnimationFrame(tick)
    }
    raf.current = requestAnimationFrame(tick)
    return () => { if (raf.current) cancelAnimationFrame(raf.current) }
  }, [value])
  return (
    <div className="text-4xl font-extrabold" style={{ color: "#26A65B" }}>{display} pts</div>
  )
}

function ScanResult({ item }: { item: HistoryItem }) {
  const ok = item.result === "success"
  return (
    <div className={`p-4 rounded-lg border ${ok ? "bg-green-50 border-green-200" : "bg-red-50 border-red-200"}`}>
      <div className="flex items-start gap-3">
        {ok ? (
          <CheckCircle2 className="h-5 w-5 text-green-600 mt-0.5" />
        ) : (
          <XCircle className="h-5 w-5 text-red-600 mt-0.5" />
        )}
        <div>
          <div className={`font-semibold ${ok ? "text-green-700" : "text-red-700"}`}>{item.message}</div>
          <div className="text-sm text-muted-foreground">{formatTime(item.timestamp)} • {item.label}</div>
          {ok && <div className="text-sm mt-1" style={{ color: "#26A65B" }}>+{item.points} points</div>}
        </div>
      </div>
    </div>
  )
}

function HistoryLog({ items }: { items: HistoryItem[] }) {
  if (items.length === 0) return <div className="text-sm text-muted-foreground">No scans yet. Try the demo!</div>
  return (
    <div className="space-y-3">
      {items.map(it => (
        <div key={it.id} className="flex items-center justify-between rounded-lg border p-3">
          <div className="flex items-center gap-3">
            {it.result === "success" ? (
              <CheckCircle2 className="h-4 w-4 text-green-600" />
            ) : (
              <XCircle className="h-4 w-4 text-red-600" />
            )}
            <div>
              <div className="text-sm font-medium">{it.message}</div>
              <div className="text-xs text-muted-foreground">{formatTime(it.timestamp)} • {it.label}</div>
            </div>
          </div>
          <div className={`text-sm font-semibold ${it.result === "success" ? "text-green-700" : "text-red-700"}`}>
            {it.result === "success" ? `+${it.points}` : `0`} pts
          </div>
        </div>
      ))}
    </div>
  )
}

function Leaderboard({ data }: { data: { name: string; pts: number }[] }) {
  return (
    <div className="space-y-2">
      {data.slice(0, 5).map((row, i) => (
        <div key={row.name} className="flex items-center justify-between rounded-lg border p-3">
          <div className="flex items-center gap-2">
            <div className="w-6 text-center font-semibold" style={{ color: i === 0 ? "#26A65B" : undefined }}>{i + 1}</div>
            <div className="font-medium">{row.name}</div>
          </div>
          <div className="text-sm text-muted-foreground">{row.pts} pts</div>
        </div>
      ))}
    </div>
  )
}

function BadgePopup({ label, onClose }: { label: string; onClose: () => void }) {
  useEffect(() => {
    const t = setTimeout(onClose, 1800)
    return () => clearTimeout(t)
  }, [onClose])
  return (
    <div className="fixed inset-0 pointer-events-none flex items-start justify-center">
      <div className="mt-6 rounded-full px-4 py-2 shadow-lg flex items-center gap-2" style={{ backgroundColor: "#10271A", color: "#F8FFE4" }}>
        <CrownIcon />
        <span className="font-semibold">Achievement unlocked:</span>
        <span>{label}</span>
      </div>
    </div>
  )
}

function CrownIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="#FFD600" xmlns="http://www.w3.org/2000/svg">
      <path d="M5 16l-2-9 6 4 3-6 3 6 6-4-2 9H5z" />
    </svg>
  )
}

function ConfettiOverlay() {
  const pieces = Array.from({ length: 40 })
  return (
    <div className="pointer-events-none fixed inset-0 overflow-hidden">
      <style>
        {`@keyframes fall { 0% { transform: translateY(-10vh) rotate(0deg); opacity: 1;} 100% { transform: translateY(110vh) rotate(360deg); opacity: 0; } }`}
      </style>
      {pieces.map((_, i) => {
        const left = Math.random() * 100
        const delay = Math.random() * 0.2
        const size = 6 + Math.random() * 8
        const color = ["#26A65B", "#AEEA00", "#FFD600", "#10271A"][i % 4]
        return (
          <span
            key={i}
            style={{
              position: "absolute",
              top: "-10vh",
              left: `${left}%`,
              width: size,
              height: size,
              backgroundColor: color,
              borderRadius: 2,
              animation: `fall ${0.9 + Math.random()}s linear ${delay}s 1`,
            }}
          />
        )
      })}
    </div>
  )
}
