"use client"

import * as React from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"

import { useAuth } from "@/context/auth-context"
import { PublicProtected } from "@/components/auth/public-protected"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Spinner } from "@/components/kibo-ui/spinner"

const USERNAME_RE = /^[a-zA-Z0-9_]{3,20}$/
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

function validate(username: string, email: string, password: string) {
  if (!USERNAME_RE.test(username))
    return "ชื่อผู้ใช้ต้องมี 3-20 ตัวอักษร (a-z, A-Z, 0-9, _)"
  if (!EMAIL_RE.test(email)) return "รูปแบบอีเมลไม่ถูกต้อง"
  if (password.length < 8) return "รหัสผ่านต้องมีอย่างน้อย 8 ตัวอักษร"
  if (password.length > 72) return "รหัสผ่านต้องไม่เกิน 72 ตัวอักษร"
  return null
}

function SignUpForm() {
  const { signUp } = useAuth()
  const router = useRouter()

  const [username, setUsername] = React.useState("")
  const [email, setEmail] = React.useState("")
  const [password, setPassword] = React.useState("")
  const [error, setError] = React.useState<string | null>(null)
  const [loading, setLoading] = React.useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    const validationError = validate(username, email, password)
    if (validationError) {
      setError(validationError)
      return
    }
    setError(null)
    setLoading(true)
    try {
      await signUp({ username, email, password })
      router.replace("/")
    } catch (err) {
      setError(err instanceof Error ? err.message : "สมัครสมาชิกไม่สำเร็จ")
    } finally {
      setLoading(false)
    }
  }

  return (
    <Card>
      <CardHeader className="text-center">
        <CardTitle className="text-lg">สมัครสมาชิก</CardTitle>
        <CardDescription>สร้างบัญชีใหม่เพื่อเริ่มช้อปกับ Zuka</CardDescription>
      </CardHeader>

      <form onSubmit={handleSubmit} className="flex flex-col gap-4 px-(--card-spacing)">
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="username">ชื่อผู้ใช้</Label>
          <Input
            id="username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            placeholder="3-20 ตัวอักษร (a-z, 0-9, _)"
            autoComplete="username"
            required
            disabled={loading}
          />
        </div>

        <div className="flex flex-col gap-1.5">
          <Label htmlFor="email">อีเมล</Label>
          <Input
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@example.com"
            autoComplete="email"
            required
            disabled={loading}
          />
        </div>

        <div className="flex flex-col gap-1.5">
          <Label htmlFor="password">รหัสผ่าน</Label>
          <Input
            id="password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            autoComplete="new-password"
            required
            disabled={loading}
          />
        </div>

        {error && <p className="text-sm text-destructive">{error}</p>}

        <Button type="submit" className="w-full" disabled={loading}>
          {loading && <Spinner variant="ring" className="size-4" />}
          สมัครสมาชิก
        </Button>
      </form>

      <p className="px-(--card-spacing) text-center text-sm text-muted-foreground">
        มีบัญชีอยู่แล้ว?{" "}
        <Link href="/signin" className="text-foreground hover:underline">
          เข้าสู่ระบบ
        </Link>
      </p>
    </Card>
  )
}

export default function SignUpPage() {
  return (
    <PublicProtected>
      <main className="flex min-h-[calc(100vh-3.5rem)] items-center justify-center px-3 py-10">
        <div className="w-full max-w-sm">
          <SignUpForm />
        </div>
      </main>
    </PublicProtected>
  )
}
