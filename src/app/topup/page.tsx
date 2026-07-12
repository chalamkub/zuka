"use client"

import * as React from "react"
import Link from "next/link"
import { CheckCircle2, Gift, History, Wallet } from "lucide-react"

import type { ApiResponse, RedeemResult, TrueMoneyRedeemResult } from "@/types"
import api, { getApiErrorMessage } from "@/lib/axios"
import { useAuth } from "@/context/auth-context"
import { useSettings } from "@/context/settings-context"
import { Protected } from "@/components/auth/protected"
import { formatTHB } from "@/lib/format"
import { TopupHistory } from "@/components/account/topup-history"
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

function TopupView() {
  const { user, refresh } = useAuth()
  const { settings } = useSettings()
  const truemoneyEnabled = settings?.payment?.truemoneyEnabled ?? false

  const [code, setCode] = React.useState("")
  const [loading, setLoading] = React.useState(false)
  const [error, setError] = React.useState<string | null>(null)
  const [success, setSuccess] = React.useState<string | null>(null)
  const [reloadSignal, setReloadSignal] = React.useState(0)

  const [giftLink, setGiftLink] = React.useState("")
  const [tmLoading, setTmLoading] = React.useState(false)
  const [tmError, setTmError] = React.useState<string | null>(null)
  const [tmSuccess, setTmSuccess] = React.useState<string | null>(null)

  async function handleRedeem(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    setSuccess(null)
    setLoading(true)
    try {
      const { data } = await api.post<ApiResponse<RedeemResult>>(
        "/topup/redeem",
        { code }
      )
      setSuccess(
        `เติมเงินสำเร็จ +${formatTHB(data.data?.amount ?? 0)} · ยอดคงเหลือ ${formatTHB(
          data.data?.balance ?? 0
        )}`
      )
      setCode("")
      await refresh()
      setReloadSignal((n) => n + 1)
    } catch (err) {
      setError(getApiErrorMessage(err))
    } finally {
      setLoading(false)
    }
  }

  async function handleTrueMoney(e: React.FormEvent) {
    e.preventDefault()
    setTmError(null)
    setTmSuccess(null)
    setTmLoading(true)
    try {
      const { data } = await api.post<ApiResponse<TrueMoneyRedeemResult>>(
        "/topup/truemoney",
        { giftLink }
      )
      setTmSuccess(
        `เติมเงินสำเร็จ +${formatTHB(data.data?.amount ?? 0)} · ยอดคงเหลือ ${formatTHB(
          data.data?.balance ?? 0
        )}`
      )
      setGiftLink("")
      await refresh()
      setReloadSignal((n) => n + 1)
    } catch (err) {
      setTmError(getApiErrorMessage(err))
    } finally {
      setTmLoading(false)
    }
  }

  return (
    <main className="min-h-screen">
      <section className="flex justify-center px-3 py-10">
        <div className="grid w-full max-w-5xl gap-6 lg:grid-cols-[1fr_1.2fr]">
          <div className="flex flex-col gap-4">
            <div>
              <h1 className="text-2xl font-semibold tracking-tight">เติมเงิน</h1>
              <p className="mt-1 text-sm text-muted-foreground">
                กรอกโค้ดเติมเงินเพื่อเพิ่มเครดิตในบัญชีของคุณ
              </p>
            </div>

            <Card className="relative">
              <CardHeader>
                <div className="flex size-9 absolute top-4 right-4 items-center justify-center rounded-xl bg-muted">
                  <Wallet className="size-4.5" />
                </div>
                <CardDescription>เครดิตคงเหลือ</CardDescription>
                <CardTitle className="text-2xl">
                  {formatTHB(user?.balance ?? 0)}
                </CardTitle>
              </CardHeader>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>กรอกโค้ดเติมเงิน</CardTitle>
                <CardDescription>
                  โค้ดจะถูกใช้งานได้เพียงครั้งเดียว
                </CardDescription>
              </CardHeader>
              <form
                onSubmit={handleRedeem}
                className="flex flex-col gap-3 px-(--card-spacing)"
              >
                <div className="flex flex-col gap-1.5">
                  <Label htmlFor="code">โค้ดเติมเงิน</Label>
                  <Input
                    id="code"
                    value={code}
                    onChange={(e) => setCode(e.target.value.toUpperCase())}
                    placeholder="เช่น ZUKA-XXXXXX"
                    autoComplete="off"
                    className="uppercase"
                    required
                    disabled={loading}
                  />
                </div>

                {error && <p className="text-sm text-destructive">{error}</p>}
                {success && (
                  <p className="flex items-center gap-1.5 text-sm text-foreground">
                    <CheckCircle2 className="size-4" />
                    {success}
                  </p>
                )}

                <Button
                  type="submit"
                  className="w-full"
                  disabled={loading || code.trim().length === 0}
                >
                  {loading && <Spinner variant="ring" className="size-4" />}
                  เติมเงิน
                </Button>
              </form>
            </Card>

            {truemoneyEnabled && (
              <Card className="relative">
                <CardHeader>
                  <div className="flex size-9 absolute top-4 right-4 items-center justify-center rounded-xl bg-muted">
                    <Gift className="size-4.5" />
                  </div>
                  <CardTitle>เติมเงินด้วยซองอั่งเปา</CardTitle>
                  <CardDescription>
                    วางลิงก์ซองอั่งเปาทรูมันนี่ ระบบจะรับซองและเติมเครดิตให้อัตโนมัติ
                  </CardDescription>
                </CardHeader>
                <form
                  onSubmit={handleTrueMoney}
                  className="flex flex-col gap-3 px-(--card-spacing)"
                >
                  <div className="flex flex-col gap-1.5">
                    <Label htmlFor="gift-link">ลิงก์ซองอั่งเปา</Label>
                    <Input
                      id="gift-link"
                      value={giftLink}
                      onChange={(e) => setGiftLink(e.target.value)}
                      placeholder="https://gift.truemoney.com/campaign/?v=..."
                      autoComplete="off"
                      inputMode="url"
                      disabled={tmLoading}
                    />
                  </div>

                  {tmError && <p className="text-sm text-destructive">{tmError}</p>}
                  {tmSuccess && (
                    <p className="flex items-center gap-1.5 text-sm text-foreground">
                      <CheckCircle2 className="size-4" />
                      {tmSuccess}
                    </p>
                  )}

                  <Button
                    type="submit"
                    className="w-full"
                    disabled={tmLoading || giftLink.trim().length === 0}
                  >
                    {tmLoading && <Spinner variant="ring" className="size-4" />}
                    รับซองอั่งเปา
                  </Button>
                </form>
              </Card>
            )}

            <Button
              variant="outline"
              className="justify-start"
              render={<Link href="/account/orders" />}
            >
              <History />
              ดูประวัติการสั่งซื้อ
            </Button>
          </div>

          <TopupHistory reloadSignal={reloadSignal} />
        </div>
      </section>
    </main>
  )
}

export default function TopupPage() {
  return (
    <Protected>
      <TopupView />
    </Protected>
  )
}
