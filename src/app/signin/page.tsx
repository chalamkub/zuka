"use client"

import * as React from "react"
import Link from "next/link"
import { useRouter, useSearchParams } from "next/navigation"

import { AuthError, useAuth } from "@/context/auth-context"
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

function SignInForm() {
  const { signIn } = useAuth()
  const router = useRouter()
  const searchParams = useSearchParams()
  const next = searchParams.get("next") || "/"

  const [identifier, setIdentifier] = React.useState("")
  const [password, setPassword] = React.useState("")
  const [code, setCode] = React.useState("")
  const [twoFactor, setTwoFactor] = React.useState(false)
  const [error, setError] = React.useState<string | null>(null)
  const [loading, setLoading] = React.useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    setLoading(true)
    try {
      await signIn({
        identifier,
        password,
        code: twoFactor ? code : undefined,
      })
      router.replace(next)
    } catch (err) {
      if (err instanceof AuthError && err.twoFactorRequired) {
        setTwoFactor(true)
        setError(err.message)
      } else {
        setError(err instanceof Error ? err.message : "เข้าสู่ระบบไม่สำเร็จ")
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <Card>
      <CardHeader className="text-center">
        <CardTitle className="text-lg">เข้าสู่ระบบ</CardTitle>
        <CardDescription>ยินดีต้อนรับกลับสู่ Zuka</CardDescription>
      </CardHeader>

      <form onSubmit={handleSubmit} className="flex flex-col gap-4 px-(--card-spacing)">
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="identifier">ชื่อผู้ใช้ หรือ อีเมล</Label>
          <Input
            id="identifier"
            value={identifier}
            onChange={(e) => setIdentifier(e.target.value)}
            placeholder="ชื่อผู้ใช้ หรือ you@example.com"
            autoComplete="username"
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
            placeholder="กรอกรหัสผ่านของคุณ"
            autoComplete="current-password"
            required
            disabled={loading}
          />
        </div>

        {twoFactor && (
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="code">รหัส 2FA</Label>
            <Input
              id="code"
              inputMode="numeric"
              value={code}
              onChange={(e) => setCode(e.target.value)}
              placeholder="รหัส 6 หลัก"
              required
              disabled={loading}
            />
          </div>
        )}

        {error && <p className="text-sm text-destructive">{error}</p>}

        <Button type="submit" className="w-full" disabled={loading}>
          {loading && <Spinner variant="ring" className="size-4" />}
          เข้าสู่ระบบ
        </Button>
      </form>

      <p className="px-(--card-spacing) text-center text-sm text-muted-foreground">
        ยังไม่มีบัญชี?{" "}
        <Link href="/signup" className="text-foreground hover:underline">
          สมัครสมาชิก
        </Link>
      </p>
    </Card>
  )
}

export default function SignInPage() {
  return (
    <PublicProtected>
      <main className="flex min-h-[calc(100vh-3.5rem)] items-center justify-center px-3 py-10">
        <div className="w-full max-w-sm">
          <React.Suspense
            fallback={
              <div className="flex justify-center py-10">
                <Spinner variant="ring" className="size-6 text-muted-foreground" />
              </div>
            }
          >
            <SignInForm />
          </React.Suspense>
        </div>
      </main>
    </PublicProtected>
  )
}
