"use client"

import * as React from "react"
import {
  Boxes,
  CreditCard,
  Package,
  Receipt,
  Users,
  Wallet,
} from "lucide-react"

import type { ApiResponse, DashboardStats } from "@/types"
import api, { getApiErrorMessage } from "@/lib/axios"
import { formatTHB } from "@/lib/format"
import { Card } from "@/components/ui/card"
import { Spinner } from "@/components/kibo-ui/spinner"
import { AdminHeader } from "@/components/admin/admin-header"

export default function AdminDashboardPage() {
  const [data, setData] = React.useState<DashboardStats | null>(null)
  const [loading, setLoading] = React.useState(true)
  const [error, setError] = React.useState<string | null>(null)

  React.useEffect(() => {
    let active = true
    api
      .get<ApiResponse<DashboardStats>>("/admin/dashboard")
      .then(({ data }) => {
        if (active) setData(data.data ?? null)
      })
      .catch((err) => {
        if (active) setError(getApiErrorMessage(err))
      })
      .finally(() => {
        if (active) setLoading(false)
      })
    return () => {
      active = false
    }
  }, [])

  const stats = data
    ? [
        { icon: Users, label: "ผู้ใช้ทั้งหมด", value: data.users.total.toLocaleString("th-TH") },
        { icon: Wallet, label: "ยอดเงินในระบบ", value: formatTHB(data.users.totalBalance) },
        { icon: Package, label: "สินค้า", value: data.catalog.products.toLocaleString("th-TH") },
        { icon: Boxes, label: "สต็อกพร้อมขาย", value: data.catalog.stockAvailable.toLocaleString("th-TH") },
        { icon: Receipt, label: "คำสั่งซื้อ", value: data.sales.orders.toLocaleString("th-TH") },
        { icon: Receipt, label: "ยอดขายรวม", value: formatTHB(data.sales.revenue) },
        { icon: CreditCard, label: "โค้ดเติมเงิน", value: data.topup.totalCodes.toLocaleString("th-TH") },
        { icon: CreditCard, label: "เติมเงินสะสม", value: formatTHB(data.topup.redeemedAmount) },
      ]
    : []

  return (
    <div>
      <AdminHeader title="ภาพรวม" description="สรุปข้อมูลร้าน Zuka" />

      {loading ? (
        <div className="flex justify-center py-16">
          <Spinner variant="ring" className="size-7 text-muted-foreground" />
        </div>
      ) : error ? (
        <p className="text-sm text-destructive">{error}</p>
      ) : (
        <Card className="gap-0 overflow-hidden p-0">
          <div className="grid grid-cols-2 gap-px bg-border lg:grid-cols-4">
            {stats.map((stat, i) => (
              <div
                key={`${stat.label}-${i}`}
                className="flex flex-col bg-card p-5"
              >
                <div className="flex size-9 items-center justify-center rounded-xl bg-muted">
                  <stat.icon className="size-4.5" />
                </div>
                <p className="mt-3 text-xl font-semibold">{stat.value}</p>
                <p className="text-sm text-muted-foreground">{stat.label}</p>
              </div>
            ))}
          </div>
        </Card>
      )}
    </div>
  )
}
