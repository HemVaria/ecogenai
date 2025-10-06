"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { useRouter, usePathname } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Recycle, LogOut, User, LayoutDashboard, Calendar, Camera, LogIn, UserPlus, Menu, X, Trophy, QrCode, Settings } from "lucide-react"
import { createClient } from "@/lib/supabase/client"
import { motion, AnimatePresence } from "framer-motion"
import { ThemeToggle } from "@/components/theme-toggle"

export default function Navigation() {
  const [user, setUser] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const router = useRouter()
  const pathname = usePathname()
  const supabase = createClient()

  useEffect(() => {
    const checkAuth = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser()
      setUser(user)
      setIsLoading(false)
    }

    checkAuth()

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null)
    })

    return () => subscription.unsubscribe()
  }, [])

  const handleSignOut = async () => {
    await supabase.auth.signOut()
    router.push("/")
    setIsMobileMenuOpen(false)
  }

  const isActive = (path: string) => pathname === path

  const navigationItems = user
    ? [
        { href: "/classify", label: "Classify Waste", icon: Camera },
        { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
        { href: "/gamification", label: "Progress", icon: Trophy },
        { href: "/qr-scan", label: "QR Scan", icon: QrCode },
        { href: "/schedule-pickup", label: "Schedule Pickup", icon: Calendar },
        { href: "/settings", label: "Settings", icon: Settings },
      ]
    : [
        { href: "/classify", label: "Classify Waste", icon: Camera },
        { href: "/gamification", label: "Progress", icon: Trophy },
        { href: "/qr-scan", label: "QR Scan", icon: QrCode },
        { href: "/settings", label: "Settings", icon: Settings },
      ]

  return (
    <nav className="border-b bg-white/90 dark:bg-gray-950/90 backdrop-blur-md shadow-sm sticky top-0 z-50">
      <div className="container mx-auto px-6">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-3 hover:opacity-80 transition-opacity">
            <div className="p-2 bg-emerald-100 dark:bg-emerald-900/30 rounded-lg">
              <Recycle className="h-6 w-6 text-emerald-600 dark:text-emerald-400" />
            </div>
            <span className="text-xl font-bold bg-gradient-to-r from-emerald-600 to-teal-600 dark:from-emerald-400 dark:to-teal-400 bg-clip-text text-transparent">
              EcoGenAI
            </span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-6">
            {navigationItems.map((item) => {
              const Icon = item.icon
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                    isActive(item.href)
                      ? "bg-emerald-100 text-emerald-700"
                      : "text-gray-600 hover:text-gray-900 hover:bg-gray-100"
                  }`}
                >
                  <Icon className="h-4 w-4" />
                  {item.label}
                </Link>
              )
            })}
          </div>

          {/* Desktop Auth Section */}
          <div className="hidden md:flex items-center gap-3">
            <ThemeToggle />
            {isLoading ? (
              <div className="w-8 h-8 border-2 border-emerald-600 border-t-transparent rounded-full animate-spin" />
            ) : user ? (
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-300">
                  <User className="h-4 w-4" />
                  <span className="max-w-32 truncate">{user.email}</span>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleSignOut}
                  className="text-gray-600 hover:text-gray-900 dark:text-gray-300 dark:hover:text-white bg-transparent"
                >
                  <LogOut className="h-4 w-4 mr-2" />
                  Sign Out
                </Button>
              </div>
            ) : (
              <div className="flex items-center gap-3">
                <Link href="/auth/login">
                  <Button
                    variant="outline"
                    size="sm"
                    className="text-emerald-600 border-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-950 bg-transparent"
                  >
                    <LogIn className="h-4 w-4 mr-2" />
                    Sign In
                  </Button>
                </Link>
                <Link href="/auth/signup">
                  <Button size="sm" className="bg-emerald-600 hover:bg-emerald-700 text-white">
                    <UserPlus className="h-4 w-4 mr-2" />
                    Sign Up
                  </Button>
                </Link>
              </div>
            )}
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden flex items-center gap-2">
            <ThemeToggle />
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            >
              {isMobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </Button>
          </div>
        </div>

        {/* Mobile Menu */}
        <AnimatePresence>
          {isMobileMenuOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.2 }}
              className="md:hidden border-t bg-white/95 backdrop-blur-sm"
            >
              <div className="py-4 space-y-2">
                {navigationItems.map((item) => {
                  const Icon = item.icon
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      onClick={() => setIsMobileMenuOpen(false)}
                      className={`flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors ${
                        isActive(item.href)
                          ? "bg-emerald-100 text-emerald-700"
                          : "text-gray-600 hover:text-gray-900 hover:bg-gray-100"
                      }`}
                    >
                      <Icon className="h-4 w-4" />
                      {item.label}
                    </Link>
                  )
                })}

                <div className="border-t pt-4 mt-4">
                  {isLoading ? (
                    <div className="flex justify-center py-2">
                      <div className="w-6 h-6 border-2 border-emerald-600 border-t-transparent rounded-full animate-spin" />
                    </div>
                  ) : user ? (
                    <div className="space-y-3">
                      <div className="flex items-center gap-2 px-4 py-2 text-sm text-gray-600">
                        <User className="h-4 w-4" />
                        <span className="truncate">{user.email}</span>
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={handleSignOut}
                        className="w-full mx-4 text-gray-600 hover:text-gray-900 bg-transparent"
                      >
                        <LogOut className="h-4 w-4 mr-2" />
                        Sign Out
                      </Button>
                    </div>
                  ) : (
                    <div className="space-y-2 px-4">
                      <Link href="/auth/login" onClick={() => setIsMobileMenuOpen(false)}>
                        <Button
                          variant="outline"
                          size="sm"
                          className="w-full text-emerald-600 border-emerald-600 hover:bg-emerald-50 bg-transparent"
                        >
                          <LogIn className="h-4 w-4 mr-2" />
                          Sign In
                        </Button>
                      </Link>
                      <Link href="/auth/signup" onClick={() => setIsMobileMenuOpen(false)}>
                        <Button size="sm" className="w-full bg-emerald-600 hover:bg-emerald-700 text-white">
                          <UserPlus className="h-4 w-4 mr-2" />
                          Sign Up
                        </Button>
                      </Link>
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </nav>
  )
}
