"use client"

import * as React from "react"
import { Check, Copy, Eye, Package, ShoppingBag } from "lucide-react"

import type { ApiResponse, Order } from "@/types"
import api from "@/lib/axios"
import { formatDateTime, formatTHB } from "@/lib/format"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty"
import { Spinner } from "@/components/kibo-ui/spinner"

function CopyButton({ value }: { value: string }) {
  const [copied, setCopied] = React.useState(false)
  async function copy() {
    try {
      await navigator.clipboard.writeText(value)
      setCopied(true)
      setTimeout(() => setCopied(false), 1500)
    } catch {
      setCopied(false)
    }
  }
  return (
    <Button
      type="button"
      variant="ghost"
      size="icon-sm"
      aria-label="คัดลอก"
      onClick={copy}
    >
      {copied ? <Check className="text-primary" /> : <Copy />}
    </Button>
  )
}

function OrderItemsDialog({
  order,
  onClose,
}: {
  order: Order | null
  onClose: () => void
}) {
  const items = order?.items ?? []
  async function copyAll() {
    try {
      await navigator.clipboard.writeText(items.join("\n"))
    } catch {
      /* ignore */
    }
  }
  return (
    <Dialog open={order !== null} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>สินค้าที่ได้รับ</DialogTitle>
          <DialogDescription>
            {order
              ? `${order.productName} · ${order.quantity} ชิ้น · ${formatDateTime(
                  order.createdAt
                )}`
              : null}
          </DialogDescription>
        </DialogHeader>

        <div className="flex flex-col gap-2">
          {items.length > 1 && (
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="self-end"
              onClick={copyAll}
            >
              <Copy />
              คัดลอกทั้งหมด
            </Button>
          )}
          <div className="flex max-h-64 flex-col gap-1.5 overflow-y-auto">
            {items.map((item, i) => (
              <div
                key={i}
                className="flex items-center gap-2 rounded-xl border bg-muted/40 py-1 pr-1 pl-3"
              >
                <code className="min-w-0 flex-1 truncate font-mono text-sm">
                  {item}
                </code>
                <CopyButton value={item} />
              </div>
            ))}
          </div>
        </div>

        <DialogFooter>
          <Button onClick={onClose}>ปิด</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

export function OrderHistory() {
  const [orders, setOrders] = React.useState<Order[]>([])
  const [loading, setLoading] = React.useState(true)
  const [active, setActive] = React.useState<Order | null>(null)

  React.useEffect(() => {
    let mounted = true
    api
      .get<ApiResponse<Order[]>>("/orders")
      .then(({ data }) => {
        if (mounted) setOrders(data.data ?? [])
      })
      .catch(() => {
        if (mounted) setOrders([])
      })
      .finally(() => {
        if (mounted) setLoading(false)
      })
    return () => {
      mounted = false
    }
  }, [])

  return (
    <Card>
      <CardHeader>
        <CardTitle>ประวัติการสั่งซื้อ</CardTitle>
        <CardDescription>คำสั่งซื้อและสินค้าที่คุณได้รับ</CardDescription>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="flex justify-center py-12">
            <Spinner variant="ring" className="size-6 text-muted-foreground" />
          </div>
        ) : orders.length === 0 ? (
          <Empty>
            <EmptyHeader>
              <EmptyMedia variant="icon">
                <ShoppingBag />
              </EmptyMedia>
              <EmptyTitle>ยังไม่มีคำสั่งซื้อ</EmptyTitle>
              <EmptyDescription>
                เมื่อคุณซื้อสินค้า รายการจะแสดงที่นี่
              </EmptyDescription>
            </EmptyHeader>
          </Empty>
        ) : (
          <div className="flex flex-col divide-y">
            {orders.map((order) => (
              <div
                key={order.id}
                className="flex items-center justify-between gap-3 py-3"
              >
                <div className="flex min-w-0 items-center gap-3">
                  <div className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-muted">
                    <Package className="size-4.5" />
                  </div>
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium">
                      {order.productName}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {formatDateTime(order.createdAt)} · ORDER#{order.id}
                    </p>
                  </div>
                </div>
                <div className="flex shrink-0 items-center gap-2">
                  <div className="text-right">
                    <p className="text-sm font-semibold">
                      {formatTHB(order.totalPrice)}
                    </p>
                    <Badge variant="secondary" className="mt-0.5">
                      {order.quantity} ชิ้น
                    </Badge>
                  </div>
                  <Button
                    variant="outline"
                    size="icon-sm"
                    aria-label="ดูสินค้าที่ได้รับ"
                    onClick={() => setActive(order)}
                  >
                    <Eye />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>

      <OrderItemsDialog order={active} onClose={() => setActive(null)} />
    </Card>
  )
}
