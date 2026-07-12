"use client"

import * as React from "react"
import { Plus, Trash2, Ban, CheckCircle2 } from "lucide-react"

import type { ApiResponse, TopupCode, TopupListResponse } from "@/types"
import api, { getApiErrorMessage } from "@/lib/axios"
import { formatDateTime, formatTHB } from "@/lib/format"
import { AdminHeader } from "@/components/admin/admin-header"
import { useToast } from "@/components/admin/toast"
import { ConfirmDialog } from "@/components/admin/confirm-dialog"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Spinner } from "@/components/kibo-ui/spinner"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
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
import {
  Empty,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty"
import { Ticket } from "lucide-react"

const STATUS: Record<TopupCode["status"], { label: string; variant: "secondary" | "outline" | "default" }> = {
  active: { label: "ใช้งานได้", variant: "secondary" },
  redeemed: { label: "ถูกใช้แล้ว", variant: "outline" },
  disabled: { label: "ปิดใช้งาน", variant: "outline" },
}

function CreateDialog({ onCreated }: { onCreated: () => void }) {
  const { success, error } = useToast()
  const [open, setOpen] = React.useState(false)
  const [amount, setAmount] = React.useState("")
  const [quantity, setQuantity] = React.useState("1")
  const [code, setCode] = React.useState("")
  const [loading, setLoading] = React.useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    try {
      const payload: Record<string, unknown> = { amount: Number(amount) }
      if (code.trim()) payload.code = code.trim().toUpperCase()
      else payload.quantity = Number(quantity)
      const { data } = await api.post<ApiResponse<TopupCode[]>>(
        "/admin/topup-codes",
        payload
      )
      success(data.message)
      setOpen(false)
      setAmount("")
      setQuantity("1")
      setCode("")
      onCreated()
    } catch (err) {
      error(getApiErrorMessage(err))
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <Button onClick={() => setOpen(true)}>
        <Plus />
        สร้างโค้ด
      </Button>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>สร้างโค้ดเติมเงิน</DialogTitle>
          <DialogDescription>
            กำหนดจำนวนเงินและจำนวนโค้ด หรือระบุโค้ดเองก็ได้
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="amount">จำนวนเงินต่อโค้ด (บาท)</Label>
            <Input
              id="amount"
              type="number"
              min={1}
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              required
              disabled={loading}
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="code">โค้ดกำหนดเอง (ไม่บังคับ)</Label>
            <Input
              id="code"
              value={code}
              onChange={(e) => setCode(e.target.value.toUpperCase())}
              placeholder="เว้นว่างเพื่อสุ่มโค้ด"
              className="uppercase"
              disabled={loading}
            />
          </div>
          {!code.trim() && (
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="quantity">จำนวนโค้ด</Label>
              <Input
                id="quantity"
                type="number"
                min={1}
                max={1000}
                value={quantity}
                onChange={(e) => setQuantity(e.target.value)}
                disabled={loading}
              />
            </div>
          )}
          <DialogFooter>
            <Button type="submit" disabled={loading}>
              {loading && <Spinner variant="ring" className="size-4" />}
              สร้าง
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}

export default function AdminTopupPage() {
  const { success, error } = useToast()
  const [list, setList] = React.useState<TopupListResponse | null>(null)
  const [loading, setLoading] = React.useState(true)
  const [deleteId, setDeleteId] = React.useState<number | null>(null)

  const load = React.useCallback(async () => {
    try {
      const { data } = await api.get<ApiResponse<TopupListResponse>>(
        "/admin/topup-codes"
      )
      setList(data.data ?? null)
    } catch (err) {
      error(getApiErrorMessage(err))
    } finally {
      setLoading(false)
    }
  }, [error])

  React.useEffect(() => {
    load()
  }, [load])

  async function toggle(item: TopupCode) {
    const action = item.status === "disabled" ? "enable" : "disable"
    try {
      const { data } = await api.patch<ApiResponse>(
        `/admin/topup-codes/${item.id}`,
        { action }
      )
      success(data.message)
      load()
    } catch (err) {
      error(getApiErrorMessage(err))
    }
  }

  async function remove(id: number) {
    try {
      const { data } = await api.delete<ApiResponse>(`/admin/topup-codes/${id}`)
      success(data.message)
      load()
    } catch (err) {
      error(getApiErrorMessage(err))
      throw err
    }
  }

  return (
    <div>
      <AdminHeader
        title="โค้ดเติมเงิน"
        description="สร้างและจัดการโค้ดเติมเงิน"
        action={<CreateDialog onCreated={load} />}
      />

      {list && (
        <div className="mb-4 grid grid-cols-3 gap-3">
          <div className="rounded-2xl border p-3">
            <p className="text-xs text-muted-foreground">โค้ดทั้งหมด</p>
            <p className="text-lg font-semibold">{list.summary.total}</p>
          </div>
          <div className="rounded-2xl border p-3">
            <p className="text-xs text-muted-foreground">มูลค่ารวม</p>
            <p className="text-lg font-semibold">{formatTHB(list.summary.totalAmount)}</p>
          </div>
          <div className="rounded-2xl border p-3">
            <p className="text-xs text-muted-foreground">ใช้ไปแล้ว</p>
            <p className="text-lg font-semibold">{formatTHB(list.summary.redeemedAmount)}</p>
          </div>
        </div>
      )}

      {loading ? (
        <div className="flex justify-center py-16">
          <Spinner variant="ring" className="size-7 text-muted-foreground" />
        </div>
      ) : !list || list.codes.length === 0 ? (
        <Empty className="border">
          <EmptyHeader>
            <EmptyMedia variant="icon">
              <Ticket />
            </EmptyMedia>
            <EmptyTitle>ยังไม่มีโค้ดเติมเงิน</EmptyTitle>
          </EmptyHeader>
        </Empty>
      ) : (
        <div className="overflow-x-auto rounded-2xl border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>โค้ด</TableHead>
                <TableHead>จำนวนเงิน</TableHead>
                <TableHead>สถานะ</TableHead>
                <TableHead>สร้างเมื่อ</TableHead>
                <TableHead className="text-right">จัดการ</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {list.codes.map((item) => (
                <TableRow key={item.id}>
                  <TableCell className="font-mono">{item.code}</TableCell>
                  <TableCell>{formatTHB(item.amount)}</TableCell>
                  <TableCell>
                    <Badge variant={STATUS[item.status].variant}>
                      {STATUS[item.status].label}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    {formatDateTime(item.createdAt)}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-1">
                      {item.status !== "redeemed" && (
                        <Button
                          variant="ghost"
                          size="icon-sm"
                          aria-label={item.status === "disabled" ? "เปิดใช้งาน" : "ปิดใช้งาน"}
                          onClick={() => toggle(item)}
                        >
                          {item.status === "disabled" ? (
                            <CheckCircle2 />
                          ) : (
                            <Ban />
                          )}
                        </Button>
                      )}
                      {item.status !== "redeemed" && (
                        <Button
                          variant="ghost"
                          size="icon-sm"
                          aria-label="ลบ"
                          onClick={() => setDeleteId(item.id)}
                        >
                          <Trash2 />
                        </Button>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}

      <ConfirmDialog
        open={deleteId !== null}
        onOpenChange={(o) => !o && setDeleteId(null)}
        title="ลบโค้ดเติมเงิน"
        description="ยืนยันการลบโค้ดนี้ การกระทำนี้ไม่สามารถย้อนกลับได้"
        confirmLabel="ลบ"
        destructive
        onConfirm={async () => {
          if (deleteId !== null) await remove(deleteId)
        }}
      />
    </div>
  )
}
