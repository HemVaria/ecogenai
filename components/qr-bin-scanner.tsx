"use client"

import { useState, useEffect } from "react"
import { Html5QrcodeScanner } from "html5-qrcode"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { QrCode, CheckCircle, AlertCircle } from "lucide-react"

interface QRScannerProps {
  onScanSuccess?: (binType: string) => void
}

export default function QRBinScanner({ onScanSuccess }: QRScannerProps) {
  const [scanning, setScanning] = useState(false)
  const [result, setResult] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let scanner: Html5QrcodeScanner | null = null

    if (scanning) {
      scanner = new Html5QrcodeScanner(
        "qr-reader",
        {
          fps: 10,
          qrbox: { width: 250, height: 250 },
        },
        false
      )

      scanner.render(
        (decodedText) => {
          setResult(decodedText)
          setScanning(false)
          scanner?.clear()
          
          // Parse bin type from QR code
          try {
            const data = JSON.parse(decodedText)
            if (data.binType) {
              onScanSuccess?.(data.binType)
            }
          } catch {
            // If not JSON, treat as plain text bin type
            onScanSuccess?.(decodedText)
          }
        },
        (errorMessage) => {
          // Ignore common scanning errors
          if (!errorMessage.includes("NotFoundException")) {
            setError(errorMessage)
          }
        }
      )
    }

    return () => {
      scanner?.clear()
    }
  }, [scanning, onScanSuccess])

  const startScanning = () => {
    setResult(null)
    setError(null)
    setScanning(true)
  }

  const stopScanning = () => {
    setScanning(false)
  }

  const getBinTypeInfo = (binType: string) => {
    const types: Record<string, { name: string; color: string; icon: string }> = {
      recyclable: { name: "Recyclable Bin", color: "text-blue-500", icon: "♻️" },
      organic: { name: "Organic Waste Bin", color: "text-green-500", icon: "🍃" },
      hazardous: { name: "Hazardous Waste Bin", color: "text-red-500", icon: "⚠️" },
      general: { name: "General Waste Bin", color: "text-gray-500", icon: "🗑️" },
    }
    return types[binType] || { name: binType, color: "text-gray-500", icon: "📦" }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <QrCode className="h-5 w-5" />
          QR Bin Scanner
        </CardTitle>
        <CardDescription>
          Scan the QR code on your waste bin to confirm correct disposal
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {!scanning && !result && (
          <Button onClick={startScanning} className="w-full">
            <QrCode className="mr-2 h-4 w-4" />
            Start Scanning
          </Button>
        )}

        {scanning && (
          <div className="space-y-4">
            <div id="qr-reader" className="w-full"></div>
            <Button onClick={stopScanning} variant="outline" className="w-full">
              Stop Scanning
            </Button>
          </div>
        )}

        {result && (
          <div className="space-y-4">
            <div className="flex items-center gap-2 p-4 rounded-lg bg-green-50 dark:bg-green-950 border border-green-200 dark:border-green-800">
              <CheckCircle className="h-5 w-5 text-green-500" />
              <div>
                <p className="font-semibold text-green-700 dark:text-green-300">Scan Successful!</p>
                <p className="text-sm text-green-600 dark:text-green-400">
                  {(() => {
                    const info = getBinTypeInfo(result.toLowerCase())
                    return (
                      <>
                        <span className="text-2xl mr-2">{info.icon}</span>
                        <span className={info.color}>{info.name}</span>
                      </>
                    )
                  })()}
                </p>
              </div>
            </div>
            <Button onClick={startScanning} variant="outline" className="w-full">
              Scan Another Bin
            </Button>
          </div>
        )}

        {error && (
          <div className="flex items-center gap-2 p-4 rounded-lg bg-red-50 dark:bg-red-950 border border-red-200 dark:border-red-800">
            <AlertCircle className="h-5 w-5 text-red-500" />
            <div>
              <p className="font-semibold text-red-700 dark:text-red-300">Scanning Error</p>
              <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
            </div>
          </div>
        )}

        <div className="text-xs text-muted-foreground space-y-1">
          <p>💡 <strong>Tip:</strong> Position the QR code within the frame</p>
          <p>📱 Make sure your camera has permission to access</p>
          <p>🔦 Ensure good lighting for best results</p>
        </div>
      </CardContent>
    </Card>
  )
}
