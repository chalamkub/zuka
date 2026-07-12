"use client"

import * as React from "react"
import { ArrowDownLeft, Receipt } from "lucide-react"

import type { ApiResponse, Transaction } from "@/types"
import api from "@/lib/axios"
import { formatDateTime, formatTHB } from "@/lib/format"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty"
import { Spinner } from "@/components/kibo-ui/spinner"

function TopupRow({ tx }: { tx: Transaction }) {
  return (
    <div className="flex items-center justify-between gap-3 py-3">
      <div className="flex items-center gap-3">
        <div className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-muted">
          <ArrowDownLeft className="size-4.5" />
        </div>
        <div className="min-w-0">
          <p className="truncate text-sm font-medium">
            เติมเงิน
            {tx.reference ? (
              <span className="text-muted-foreground"> · {tx.reference}</span>
            ) : null}
          </p>
          <p className="text-xs text-muted-foreground">
            {formatDateTime(tx.createdAt)}
          </p>
        </div>
      </div>
      <span className="text-sm font-semibold text-primary">
        +{formatTHB(tx.amount)}
      </span>
    </div>
  )
}

export function TopupHistory({
  reloadSignal = 0,
  title = "ประวัติการเติมเงิน",
  description = "รายการเติมเงินล่าสุดของคุณ",
}: {
  reloadSignal?: number
  title?: string
  description?: string
}) {
  const [items, setItems] = React.useState<Transaction[]>([])
  const [loading, setLoading] = React.useState(true)

  React.useEffect(() => {
    let active = true
    api
      .get<ApiResponse<Transaction[]>>("/topup/history")
      .then(({ data }) => {
        if (active) {
          setItems((data.data ?? []).filter((t) => t.type === "topup"))
        }
      })
      .catch(() => {
        if (active) setItems([])
      })
      .finally(() => {
        if (active) setLoading(false)
      })
    return () => {
      active = false
    }
  }, [reloadSignal])

  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="flex justify-center py-12">
            <Spinner variant="ring" className="size-6 text-muted-foreground" />
          </div>
        ) : items.length === 0 ? (
          <Empty>
            <EmptyHeader>
              <EmptyMedia variant="icon">
                <Receipt />
              </EmptyMedia>
              <EmptyTitle>ยังไม่มีการเติมเงิน</EmptyTitle>
              <EmptyDescription>
                เมื่อคุณเติมเงินด้วยโค้ด รายการจะแสดงที่นี่
              </EmptyDescription>
            </EmptyHeader>
          </Empty>
        ) : (
          <div className="flex flex-col divide-y">
            {items.map((tx) => (
              <TopupRow key={tx.id} tx={tx} />
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
