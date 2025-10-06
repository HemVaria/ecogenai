"use client"

import type React from "react"

import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useState } from "react"
import { motion } from "framer-motion"
import { useForm } from "react-hook-form"
import { z } from "zod"
import { zodResolver } from "@hookform/resolvers/zod"
import { Eye, EyeOff, Lock, Mail } from "lucide-react"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"

export default function LoginPage() {
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [showPw, setShowPw] = useState(false)
  const router = useRouter()

  const formSchema = z.object({
    email: z.string().email("Enter a valid email"),
    password: z.string().min(1, "Password is required"),
  })

  type FormValues = z.infer<typeof formSchema>

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    mode: "onChange",
    defaultValues: { email: "", password: "" },
  })

  const onSubmit = async (values: FormValues) => {
    const supabase = createClient()
    setIsLoading(true)
    setError(null)

    try {
      const { error } = await supabase.auth.signInWithPassword({
        email: values.email,
        password: values.password,
      })
      if (error) throw error
      router.push("/dashboard")
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "An error occurred")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-6 bg-gradient-to-br from-emerald-100 via-teal-100 to-cyan-100 dark:from-emerald-950 dark:via-teal-950 dark:to-cyan-950">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md"
      >
        <Card className="backdrop-blur-sm bg-background/80 border border-border/50 shadow-xl">
          <CardHeader className="text-center pb-2">
            <motion.div initial={{ scale: 0.8 }} animate={{ scale: 1 }} transition={{ delay: 0.2, duration: 0.3 }}>
              <CardTitle className="text-3xl font-bold tracking-tight">
                <span className="bg-gradient-to-r from-emerald-600 via-teal-600 to-cyan-600 dark:from-emerald-400 dark:via-teal-400 dark:to-cyan-400 bg-clip-text text-transparent">
                  Welcome back
                </span>
              </CardTitle>
              <CardDescription className="mt-2 text-muted-foreground">Sign in to your waste management account</CardDescription>
            </motion.div>
          </CardHeader>
          <CardContent className="pt-6">
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6" noValidate>
                <motion.div initial={{ opacity: 0, x: -12 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.2 }}>
                  <FormField
                    control={form.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <div className="relative">
                          <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                          <FormControl>
                            <Input
                              {...field}
                              type="email"
                              placeholder=" "
                              autoComplete="email"
                              className="peer h-12 rounded-xl pl-10 placeholder-transparent transition-colors border-border/60 bg-background/60 hover:bg-background/80 focus:bg-background"
                            />
                          </FormControl>
                          <FormLabel className="pointer-events-none absolute left-10 top-1/2 -translate-y-1/2 text-muted-foreground transition-all peer-placeholder-shown:top-1/2 peer-placeholder-shown:text-base peer-[:not(:placeholder-shown)]:-top-2 peer-[:not(:placeholder-shown)]:text-xs peer-focus:-top-2 peer-focus:text-xs peer-focus:text-emerald-600">
                            Email address
                          </FormLabel>
                        </div>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </motion.div>

                <motion.div initial={{ opacity: 0, x: -12 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.3 }}>
                  <FormField
                    control={form.control}
                    name="password"
                    render={({ field }) => (
                      <FormItem>
                        <div className="relative">
                          <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                          <FormControl>
                            <Input
                              {...field}
                              type={showPw ? "text" : "password"}
                              placeholder=" "
                              autoComplete="current-password"
                              className="peer h-12 rounded-xl pl-10 pr-10 placeholder-transparent transition-colors border-border/60 bg-background/60 hover:bg-background/80 focus:bg-background"
                            />
                          </FormControl>
                          <button
                            type="button"
                            onClick={() => setShowPw((s) => !s)}
                            aria-label={showPw ? "Hide password" : "Show password"}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                          >
                            {showPw ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                          </button>
                          <FormLabel className="pointer-events-none absolute left-10 top-1/2 -translate-y-1/2 text-muted-foreground transition-all peer-placeholder-shown:top-1/2 peer-placeholder-shown:text-base peer-[:not(:placeholder-shown)]:-top-2 peer-[:not(:placeholder-shown)]:text-xs peer-focus:-top-2 peer-focus:text-xs peer-focus:text-emerald-600">
                            Password
                          </FormLabel>
                        </div>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </motion.div>

              {error && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="p-3 rounded-lg border border-destructive/30 bg-destructive/10"
                >
                  <p className="text-sm text-destructive">{error}</p>
                </motion.div>
              )}

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5, duration: 0.3 }}
              >
                <Button
                  type="submit"
                  className="w-full h-12 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-medium transition-all duration-200 transform hover:scale-[1.01] focus-visible:ring-emerald-500"
                  disabled={isLoading || !form.formState.isValid}
                >
                  {isLoading ? "Signing in..." : "Sign In"}
                </Button>
              </motion.div>

              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.6, duration: 0.3 }}
                className="text-center"
              >
                <p className="text-sm text-muted-foreground">
                  Don't have an account?{" "}
                  <Link
                    href="/auth/signup"
                    className="text-emerald-600 hover:text-emerald-700 font-medium underline underline-offset-4"
                  >
                    Sign up
                  </Link>
                </p>
              </motion.div>
              </form>
            </Form>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  )
}
