"use client"

import * as React from "react"
import { Eye, Receipt } from "lucide-react"

import type { ApiResponse, Order, OrderListResponse } from "@/types"
import api, { getApiErrorMessage } from "@/lib/axios"
import { formatDateTime, formatTHB } from "@/lib/format"
import { AdminHeader } from "@/components/admin/admin-header"
import { useToast } from "@/components/admin/toast"
import { Button } from "@/components/ui/button"
import { Spinner } from "@/components/kibo-ui/spinner"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Empty, EmptyHeader, EmptyMedia, EmptyTitle } from "@/components/ui/empty"

export default function AdminOrdersPage() {
  const { error } = useToast()
  const [data, setData] = React.useState<OrderListResponse | null>(null)
  const [loading, setLoading] = React.useState(true)
  const [page, setPage] = React.useState(1)
  const [detail, setDetail] = React.useState<Order | null>(null)

  const load = React.useCallback(async () => {
    setLoading(true)
    try {
      const { data } = await api.get<ApiResponse<OrderListResponse>>(
        `/admin/orders?page=${page}`
      )
      setData(data.data ?? null)
    } catch (err) {
      error(getApiErrorMessage(err))
    } finally {
      setLoading(false)
    }
  }, [page, error])

  React.useEffect(() => {
    load()
  }, [load])

  const totalPages = data ? Math.max(1, Math.ceil(data.total / data.limit)) : 1

  return (
    <div>
      <AdminHeader title="คำสั่งซื้อ" description="ประวัติคำสั่งซื้อทั้งหมด" />

      {data && (
        <div className="mb-4 grid grid-cols-2 gap-3 sm:max-w-md">
          <div className="rounded-2xl border p-3">
            <p className="text-xs text-muted-foreground">คำสั่งซื้อทั้งหมด</p>
            <p className="text-lg font-semibold">{data.total}</p>
          </div>
          <div className="rounded-2xl border p-3">
            <p className="text-xs text-muted-foreground">ยอดขายรวม</p>
            <p className="text-lg font-semibold">{formatTHB(data.totalRevenue)}</p>
          </div>
        </div>
      )}

      {loading ? (
        <div className="flex justify-center py-16">
          <Spinner variant="ring" className="size-7 text-muted-foreground" />
        </div>
      ) : !data || data.orders.length === 0 ? (
        <Empty className="border">
          <EmptyHeader>
            <EmptyMedia variant="icon">
              <Receipt />
            </EmptyMedia>
            <EmptyTitle>ยังไม่มีคำสั่งซื้อ</EmptyTitle>
          </EmptyHeader>
        </Empty>
      ) : (
        <>
          <div className="overflow-x-auto rounded-2xl border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>#</TableHead>
                  <TableHead>สินค้า</TableHead>
                  <TableHead>จำนวน</TableHead>
                  <TableHead>ยอดรวม</TableHead>
                  <TableHead>วันที่</TableHead>
                  <TableHead className="text-right">รายละเอียด</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {data.orders.map((o) => (
                  <TableRow key={o.id}>
                    <TableCell className="text-muted-foreground">{o.id}</TableCell>
                    <TableCell className="font-medium">{o.productName}</TableCell>
                    <TableCell>{o.quantity}</TableCell>
                    <TableCell>{formatTHB(o.totalPrice)}</TableCell>
                    <TableCell className="text-muted-foreground">
                      {formatDateTime(o.createdAt)}
                    </TableCell>
                    <TableCell className="text-right">
                      <Button
                        variant="ghost"
                        size="icon-sm"
                        aria-label="ดูรายละเอียด"
                        onClick={() => setDetail(o)}
                      >
                        <Eye />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          <div className="mt-4 flex items-center justify-between text-sm text-muted-foreground">
            <span>ทั้งหมด {data.total} รายการ</span>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" disabled={page <= 1} onClick={() => setPage((p) => Math.max(1, p - 1))}>
                ก่อนหน้า
              </Button>
              <span>{page} / {totalPages}</span>
              <Button variant="outline" size="sm" disabled={page >= totalPages} onClick={() => setPage((p) => p + 1)}>
                ถัดไป
              </Button>
            </div>
          </div>
        </>
      )}

      <Dialog open={detail !== null} onOpenChange={(o) => !o && setDetail(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>คำสั่งซื้อ #{detail?.id}</DialogTitle>
            <DialogDescription>
              {detail?.productName} · {detail?.quantity} ชิ้น ·{" "}
              {formatTHB(detail?.totalPrice ?? 0)}
            </DialogDescription>
          </DialogHeader>
          <div className="flex flex-col gap-2">
            <p className="text-sm font-medium">ข้อมูลที่จัดส่ง</p>
            <div className="max-h-64 overflow-y-auto rounded-2xl border bg-muted/30 p-3">
              {detail?.items.length ? (
                <ul className="flex flex-col gap-1 font-mono text-xs">
                  {detail.items.map((item, i) => (
                    <li key={i} className="break-all">{item}</li>
                  ))}
                </ul>
              ) : (
                <p className="text-sm text-muted-foreground">ไม่มีข้อมูล</p>
              )}
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
