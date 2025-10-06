import Link from "next/link"
import { Button } from "@/components/ui/button"
import { CheckCircle, ArrowLeft, Recycle } from "lucide-react"

export default function SuccessPage() {
  return (
    <div className="flex flex-col min-h-screen">
      <header className="px-4 lg:px-6 h-16 flex items-center border-b">
        <Link href="/" className="flex items-center gap-2 font-semibold">
          <Recycle className="h-6 w-6 text-green-600" />
          <span className="text-lg">WasteConnect</span>
        </Link>
      </header>
      <main className="flex-1 flex items-center justify-center p-4">
        <div className="max-w-md w-full text-center space-y-6">
          <div className="flex justify-center">
            <CheckCircle className="h-16 w-16 text-green-600" />
          </div>
          <h1 className="text-2xl font-bold">Report Submitted Successfully!</h1>
          <p className="text-gray-500">
            Your waste report has been submitted. Waste management facilities in your area will review your request and
            schedule a pickup time.
          </p>
          <p className="text-gray-500">You will receive a notification when a facility schedules your pickup.</p>
          <div className="pt-4 space-y-2">
            <Link href="/dashboard">
              <Button className="w-full">View My Reports</Button>
            </Link>
            <Link href="/">
              <Button variant="outline" className="w-full">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to Home
              </Button>
            </Link>
          </div>
        </div>
      </main>
    </div>
  )
}
