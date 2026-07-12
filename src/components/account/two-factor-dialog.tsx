"use client"

import * as React from "react"
import { QRCodeSVG } from "qrcode.react"
import { Check, Copy, ShieldCheck, ShieldOff, Smartphone } from "lucide-react"

import type { ApiResponse, TwoFactorSetup } from "@/types"
import api, { getApiErrorMessage } from "@/lib/axios"
import { useAuth } from "@/context/auth-context"
import { useToast } from "@/components/admin/toast"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import { Spinner } from "@/components/kibo-ui/spinner"

type Mode = "idle" | "setup" | "disabling"

export function TwoFactorDialog({
  open,
  onOpenChange,
}: {
  open: boolean
  onOpenChange: (o: boolean) => void
}) {
  const { user, refresh } = useAuth()
  const toast = useToast()

  const [mode, setMode] = React.useState<Mode>("idle")
  const [setup, setSetup] = React.useState<TwoFactorSetup | null>(null)
  const [code, setCode] = React.useState("")
  const [password, setPassword] = React.useState("")
  const [busy, setBusy] = React.useState(false)
  const [copied, setCopied] = React.useState(false)

  const enabled = user?.twoFactorEnabled ?? false

  const reset = React.useCallback(() => {
    setMode("idle")
    setSetup(null)
    setCode("")
    setPassword("")
  }, [])

  React.useEffect(() => {
    if (open) reset()
  }, [open, reset])

  async function copySecret() {
    if (!setup) return
    try {
      await navigator.clipboard.writeText(setup.secret)
      setCopied(true)
      setTimeout(() => setCopied(false), 1500)
    } catch {
      /* ignore */
    }
  }

  async function startSetup() {
    setBusy(true)
    try {
      const { data } = await api.post<ApiResponse<TwoFactorSetup>>("/2fa/setup")
      if (data.data) {
        setSetup(data.data)
        setMode("setup")
      }
    } catch (err) {
      toast.error(getApiErrorMessage(err))
    } finally {
      setBusy(false)
    }
  }

  async function enable(e: React.FormEvent) {
    e.preventDefault()
    setBusy(true)
    try {
      await api.post<ApiResponse>("/2fa/enable", { code })
      await refresh()
      toast.success("เปิดใช้งาน 2FA สำเร็จ")
      onOpenChange(false)
    } catch (err) {
      toast.error(getApiErrorMessage(err))
    } finally {
      setBusy(false)
    }
  }

  async function disable(e: React.FormEvent) {
    e.preventDefault()
    setBusy(true)
    try {
      await api.post<ApiResponse>("/2fa/disable", { password })
      await refresh()
      toast.success("ปิดใช้งาน 2FA สำเร็จ")
      onOpenChange(false)
    } catch (err) {
      toast.error(getApiErrorMessage(err))
    } finally {
      setBusy(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <div className="flex items-center gap-2">
            <DialogTitle>ยืนยันตัวตน 2 ชั้น (2FA)</DialogTitle>
            <Badge
              variant={enabled ? "secondary" : "outline"}
              className="gap-1"
            >
              {/* {enabled ? (
                <ShieldCheck className="size-3" />
              ) : (
                <ShieldOff className="size-3" />
              )} */}
              {enabled ? "เปิดใช้งาน" : "ปิดใช้งาน"}
            </Badge>
          </div>
          <DialogDescription>
            เพิ่มความปลอดภัยด้วยรหัสจากแอป Authenticator
          </DialogDescription>
        </DialogHeader>

        <div className="flex flex-col gap-4">
          {enabled ? (
            mode === "disabling" ? (
              <form onSubmit={disable} className="flex flex-col gap-3">
                <div className="flex flex-col gap-1.5">
                  <Label htmlFor="tfa-password">
                    ยืนยันรหัสผ่านเพื่อปิดใช้งาน
                  </Label>
                  <Input
                    id="tfa-password"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="รหัสผ่านบัญชีของคุณ"
                    autoComplete="current-password"
                    required
                    disabled={busy}
                  />
                </div>
                <div className="flex gap-2">
                  <Button
                    type="submit"
                    variant="destructive"
                    disabled={busy || password.length === 0}
                  >
                    {busy && <Spinner variant="ring" className="size-4" />}
                    ปิดใช้งาน 2FA
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    disabled={busy}
                    onClick={() => setMode("idle")}
                  >
                    ยกเลิก
                  </Button>
                </div>
              </form>
            ) : (
              <>
                <p className="flex items-center gap-2 text-sm text-muted-foreground">
                  <ShieldCheck className="size-4 text-primary" />
                  บัญชีของคุณได้รับการปกป้องด้วย 2FA แล้ว
                </p>
                <Button
                  variant="outline"
                  className="self-start"
                  onClick={() => setMode("disabling")}
                >
                  {/* <ShieldOff /> */}
                  ปิดใช้งาน 2FA
                </Button>
              </>
            )
          ) : mode === "setup" && setup ? (
            <form onSubmit={enable} className="flex flex-col gap-4">
              <ol className="flex flex-col gap-1.5 text-sm text-muted-foreground">
                <li>1. เปิดแอป Authenticator (Google Authenticator, Authy ฯลฯ)</li>
                <li>2. สแกน QR โค้ด หรือกรอกคีย์ด้านล่างด้วยตนเอง</li>
                <li>3. กรอกรหัส 6 หลักที่ได้เพื่อยืนยัน</li>
              </ol>

              <div className="flex justify-center">
                <div className="rounded-2xl bg-white p-3 shadow-sm ring-1 ring-foreground/10">
                  <QRCodeSVG
                    value={setup.otpauthUrl}
                    size={172}
                    marginSize={0}
                  />
                </div>
              </div>

              <div className="flex flex-col gap-1.5">
                <Label>คีย์สำหรับตั้งค่า (กรณีสแกนไม่ได้)</Label>
                <div className="flex items-center gap-2 rounded-xl border bg-muted/40 py-1 pr-1 pl-3">
                  <code className="min-w-0 flex-1 font-mono text-sm break-all">
                    {setup.secret}
                  </code>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon-sm"
                    aria-label="คัดลอกคีย์"
                    onClick={copySecret}
                  >
                    {copied ? <Check className="text-primary" /> : <Copy />}
                  </Button>
                </div>
              </div>

              <Separator />

              <div className="flex flex-col gap-1.5">
                <Label htmlFor="tfa-code">รหัสยืนยัน 6 หลัก</Label>
                <Input
                  id="tfa-code"
                  inputMode="numeric"
                  value={code}
                  onChange={(e) =>
                    setCode(e.target.value.replace(/\D/g, "").slice(0, 6))
                  }
                  placeholder="000000"
                  autoComplete="one-time-code"
                  className="font-mono tracking-[0.3em]"
                  required
                  disabled={busy}
                />
              </div>

              <div className="flex gap-2">
                <Button type="submit" disabled={busy || code.length !== 6}>
                  {busy && <Spinner variant="ring" className="size-4" />}
                  ยืนยันเปิดใช้งาน
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  disabled={busy}
                  onClick={() => setMode("idle")}
                >
                  ยกเลิก
                </Button>
              </div>
            </form>
          ) : (
            <>
              <p className="flex items-center gap-2 text-sm text-muted-foreground">
                <Smartphone className="size-4" />
                ยังไม่ได้เปิดใช้งาน - แนะนำให้เปิดเพื่อความปลอดภัยของบัญชี
              </p>
              <Button
                className="self-start"
                disabled={busy}
                onClick={startSetup}
              >
                {/* {busy ? (
                  <Spinner variant="ring" className="size-4" />
                ) : (
                  <ShieldCheck />
                )} */}
                เปิดใช้งาน 2FA
              </Button>
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}
