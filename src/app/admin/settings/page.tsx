"use client"

import * as React from "react"

import type { ApiResponse, Settings, TrueMoneyHistory } from "@/types"
import api, { getApiErrorMessage } from "@/lib/axios"
import { formatTHB } from "@/lib/format"
import { AdminHeader } from "@/components/admin/admin-header"
import { useToast } from "@/components/admin/toast"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import { Spinner } from "@/components/kibo-ui/spinner"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"

export default function AdminSettingsPage() {
  const { success, error } = useToast()
  const [settings, setSettings] = React.useState<Settings | null>(null)
  const [keywords, setKeywords] = React.useState("")
  const [loading, setLoading] = React.useState(true)
  const [saving, setSaving] = React.useState(false)
  const [tmHistory, setTmHistory] = React.useState<TrueMoneyHistory | null>(null)

  React.useEffect(() => {
    let active = true
    api
      .get<ApiResponse<Settings>>("/admin/settings")
      .then(({ data }) => {
        if (!active) return
        setSettings(data.data ?? null)
        setKeywords((data.data?.meta.keywords ?? []).join(", "))
      })
      .catch((err) => error(getApiErrorMessage(err)))
      .finally(() => active && setLoading(false))
    api
      .get<ApiResponse<TrueMoneyHistory>>("/admin/settings/truemoney/history")
      .then(({ data }) => {
        if (active) setTmHistory(data.data ?? null)
      })
      .catch(() => {})
    return () => {
      active = false
    }
  }, [error])

  function update<K extends keyof Settings>(key: K, value: Settings[K]) {
    setSettings((prev) => (prev ? { ...prev, [key]: value } : prev))
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault()
    if (!settings) return
    setSaving(true)
    try {
      const payload = {
        site: settings.site,
        contact: settings.contact,
        meta: {
          ...settings.meta,
          keywords: keywords
            .split(",")
            .map((k) => k.trim())
            .filter(Boolean),
        },
        payment: settings.payment,
      }
      const { data } = await api.patch<ApiResponse<Settings>>(
        "/admin/settings",
        payload
      )
      success(data.message)
      if (data.data) {
        setSettings(data.data)
        setKeywords(data.data.meta.keywords.join(", "))
      }
    } catch (err) {
      error(getApiErrorMessage(err))
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div>
        <AdminHeader title="ตั้งค่า" description="ตั้งค่าเว็บไซต์" />
        <div className="flex justify-center py-16">
          <Spinner variant="ring" className="size-7 text-muted-foreground" />
        </div>
      </div>
    )
  }

  if (!settings) {
    return (
      <div>
        <AdminHeader title="ตั้งค่า" description="ตั้งค่าเว็บไซต์" />
        <p className="text-sm text-destructive">โหลดการตั้งค่าไม่สำเร็จ</p>
      </div>
    )
  }

  return (
    <form onSubmit={handleSave}>
      <AdminHeader
        title="ตั้งค่า"
        description="ตั้งค่าเว็บไซต์ ข้อมูลติดต่อ และ SEO"
        action={
          <Button type="submit" disabled={saving}>
            {saving && <Spinner variant="ring" className="size-4" />}
            บันทึก
          </Button>
        }
      />

      <div className="flex flex-col gap-4">
        <Card>
          <CardHeader>
            <CardTitle>ข้อมูลเว็บไซต์</CardTitle>
            <CardDescription>ชื่อร้านและการตั้งค่าทั่วไป</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col gap-4">
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="s-name">ชื่อเว็บไซต์</Label>
              <Input
                id="s-name"
                value={settings.site.name}
                onChange={(e) => update("site", { ...settings.site, name: e.target.value })}
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="s-desc">คำอธิบาย</Label>
              <Textarea
                id="s-desc"
                value={settings.site.description}
                onChange={(e) => update("site", { ...settings.site, description: e.target.value })}
              />
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="s-logo">ลิงก์โลโก้</Label>
                <Input
                  id="s-logo"
                  value={settings.site.logoUrl ?? ""}
                  onChange={(e) => update("site", { ...settings.site, logoUrl: e.target.value || null })}
                  placeholder="https://..."
                />
              </div>
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="s-fav">ลิงก์ favicon</Label>
                <Input
                  id="s-fav"
                  value={settings.site.faviconUrl ?? ""}
                  onChange={(e) => update("site", { ...settings.site, faviconUrl: e.target.value || null })}
                  placeholder="https://..."
                />
              </div>
            </div>
            <div className="flex items-center justify-between rounded-2xl border p-3">
              <div>
                <p className="text-sm font-medium">โหมดปิดปรับปรุง</p>
                <p className="text-xs text-muted-foreground">ปิดร้านชั่วคราวเพื่อบำรุงรักษา</p>
              </div>
              <Switch
                checked={settings.site.maintenance}
                onCheckedChange={(v) => update("site", { ...settings.site, maintenance: v })}
              />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>ข้อมูลติดต่อ</CardTitle>
            <CardDescription>ช่องทางติดต่อร้าน</CardDescription>
          </CardHeader>
          <CardContent className="grid gap-4 sm:grid-cols-2">
            {([
              ["email", "อีเมล"],
              ["phone", "เบอร์โทร"],
              ["facebook", "Facebook"],
              ["line", "LINE"],
              ["discord", "Discord"],
            ] as const).map(([key, label]) => (
              <div key={key} className="flex flex-col gap-1.5">
                <Label htmlFor={`ct-${key}`}>{label}</Label>
                <Input
                  id={`ct-${key}`}
                  value={settings.contact[key]}
                  onChange={(e) => update("contact", { ...settings.contact, [key]: e.target.value })}
                />
              </div>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>SEO / Meta</CardTitle>
            <CardDescription>ข้อมูลสำหรับการค้นหาและแชร์</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col gap-4">
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="m-title">Meta title</Label>
              <Input
                id="m-title"
                value={settings.meta.title}
                onChange={(e) => update("meta", { ...settings.meta, title: e.target.value })}
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="m-desc">Meta description</Label>
              <Textarea
                id="m-desc"
                value={settings.meta.description}
                onChange={(e) => update("meta", { ...settings.meta, description: e.target.value })}
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="m-keywords">Keywords (คั่นด้วยจุลภาค)</Label>
              <Input
                id="m-keywords"
                value={keywords}
                onChange={(e) => setKeywords(e.target.value)}
                placeholder="เกม, ไอดี, เติมเงิน"
              />
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="m-og">og:image</Label>
                <Input
                  id="m-og"
                  value={settings.meta.ogImage ?? ""}
                  onChange={(e) => update("meta", { ...settings.meta, ogImage: e.target.value || null })}
                  placeholder="https://..."
                />
              </div>
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="m-color">Theme color (hex)</Label>
                <div className="flex items-center gap-2">
                  <Input
                    id="m-color"
                    value={settings.meta.themeColor}
                    onChange={(e) => update("meta", { ...settings.meta, themeColor: e.target.value })}
                    placeholder="#111827"
                  />
                  <span
                    className="size-8 shrink-0 rounded-lg border"
                    style={{ backgroundColor: settings.meta.themeColor }}
                  />
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>เติมเงินด้วยอั่งเปาทรูมันนี่</CardTitle>
            <CardDescription>
              รับซองอั่งเปาเข้าเบอร์ร้าน แล้วเติมเครดิตให้ลูกค้าอัตโนมัติ
            </CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col gap-4">
            <div className="flex items-center justify-between rounded-2xl border p-3">
              <div>
                <p className="text-sm font-medium">เปิดใช้งาน</p>
                <p className="text-xs text-muted-foreground">
                  แสดงช่องเติมเงินด้วยซองอั่งเปาในหน้าเติมเงิน
                </p>
              </div>
              <Switch
                checked={settings.payment?.truemoneyEnabled ?? false}
                onCheckedChange={(v) =>
                  update("payment", {
                    ...settings.payment,
                    truemoneyEnabled: v,
                  })
                }
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="tm-phone">เบอร์รับซองอั่งเปา</Label>
              <Input
                id="tm-phone"
                value={settings.payment?.truemoneyPhone ?? ""}
                onChange={(e) =>
                  update("payment", {
                    ...settings.payment,
                    truemoneyPhone: e.target.value.replace(/[^0-9]/g, "").slice(0, 10),
                  })
                }
                placeholder="0812345678"
                inputMode="numeric"
                maxLength={10}
              />
              <p className="text-xs text-muted-foreground">
                เบอร์ TrueMoney Wallet ของร้าน (10 หลัก ขึ้นต้นด้วย 0) ที่จะใช้รับซอง
              </p>
            </div>

            {tmHistory && tmHistory.vouchers.length > 0 && (
              <div className="flex flex-col gap-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="font-medium">ประวัติการรับซองล่าสุด</span>
                  <span className="text-muted-foreground">
                    {tmHistory.summary.total} ครั้ง · รวม{" "}
                    {formatTHB(tmHistory.summary.totalAmount)}
                  </span>
                </div>
                <div className="max-h-56 overflow-y-auto rounded-2xl border divide-y">
                  {tmHistory.vouchers.slice(0, 20).map((v) => (
                    <div
                      key={v.id}
                      className="flex items-center justify-between gap-3 px-3 py-2 text-sm"
                    >
                      <span className="truncate text-muted-foreground">
                        {v.ownerProfile || v.hash}
                      </span>
                      <span className="shrink-0 font-medium">
                        +{formatTHB(v.amount)}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </form>
  )
}
