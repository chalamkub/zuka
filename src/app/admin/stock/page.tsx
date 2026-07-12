"use client"

import * as React from "react"
import { Boxes, Package, Plus, Search, Trash2 } from "lucide-react"

import type { ApiResponse, Product, StockListResponse } from "@/types"
import api, { getApiErrorMessage } from "@/lib/axios"
import { AdminHeader } from "@/components/admin/admin-header"
import { useToast } from "@/components/admin/toast"
import { ConfirmDialog } from "@/components/admin/confirm-dialog"
import { cn } from "@/lib/utils"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Spinner } from "@/components/kibo-ui/spinner"
import {
  Table,
  TableBody,
  TableCell,
  TableRow,
} from "@/components/ui/table"
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty"

type StatusFilter = "all" | "available" | "sold"

const STATUS_TABS: { value: StatusFilter; label: string }[] = [
  { value: "all", label: "ทั้งหมด" },
  { value: "available", label: "พร้อมขาย" },
  { value: "sold", label: "ขายแล้ว" },
]

function StockPanel({
  product,
  onStockChanged,
}: {
  product: Product
  onStockChanged: () => void
}) {
  const { success, error } = useToast()
  const [data, setData] = React.useState<StockListResponse | null>(null)
  const [loading, setLoading] = React.useState(true)
  const [filter, setFilter] = React.useState<StatusFilter>("all")
  const [items, setItems] = React.useState("")
  const [adding, setAdding] = React.useState(false)
  const [deleteId, setDeleteId] = React.useState<number | null>(null)

  const load = React.useCallback(async () => {
    setLoading(true)
    try {
      const query = filter === "all" ? "" : `?status=${filter}`
      const { data } = await api.get<ApiResponse<StockListResponse>>(
        `/admin/products/${product.id}/stocks${query}`
      )
      setData(data.data ?? null)
    } catch (err) {
      error(getApiErrorMessage(err))
    } finally {
      setLoading(false)
    }
  }, [product.id, filter, error])

  React.useEffect(() => {
    load()
  }, [load])

  async function add(e: React.FormEvent) {
    e.preventDefault()
    const cleaned = items
      .split("\n")
      .map((s) => s.trim())
      .filter(Boolean)
    if (cleaned.length === 0) return
    setAdding(true)
    try {
      const { data } = await api.post<ApiResponse>(
        `/admin/products/${product.id}/stocks`,
        { items: cleaned }
      )
      success(data.message)
      setItems("")
      await load()
      onStockChanged()
    } catch (err) {
      error(getApiErrorMessage(err))
    } finally {
      setAdding(false)
    }
  }

  async function removeStock(stockId: number) {
    try {
      const { data } = await api.delete<ApiResponse>(
        `/admin/products/${product.id}/stocks/${stockId}`
      )
      success(data.message)
      await load()
      onStockChanged()
    } catch (err) {
      error(getApiErrorMessage(err))
      throw err
    }
  }

  const summary = data?.summary

  return (
    <div className="flex flex-col gap-4">
      <div>
        <h2 className="text-lg font-semibold">{product.name}</h2>
        <p className="text-sm text-muted-foreground">
          รหัสสินค้า #{product.id}
        </p>
      </div>

      <div className="grid grid-cols-3 gap-2">
        <div className="rounded-2xl border p-3">
          <p className="text-xs text-muted-foreground">ทั้งหมด</p>
          <p className="text-xl font-semibold">{summary?.total ?? "—"}</p>
        </div>
        <div className="rounded-2xl border p-3">
          <p className="text-xs text-muted-foreground">พร้อมขาย</p>
          <p className="text-xl font-semibold text-primary">
            {summary?.available ?? "—"}
          </p>
        </div>
        <div className="rounded-2xl border p-3">
          <p className="text-xs text-muted-foreground">ขายแล้ว</p>
          <p className="text-xl font-semibold text-muted-foreground">
            {summary?.sold ?? "—"}
          </p>
        </div>
      </div>

      <form onSubmit={add} className="flex flex-col gap-2">
        <Label htmlFor="stock-items">เพิ่มสต็อก (บรรทัดละ 1 รายการ)</Label>
        <Textarea
          id="stock-items"
          value={items}
          onChange={(e) => setItems(e.target.value)}
          placeholder={"user1:pass1\nuser2:pass2"}
          className="min-h-24"
          disabled={adding}
        />
        <div className="flex justify-end">
          <Button
            type="submit"
            size="sm"
            disabled={adding || items.trim().length === 0}
          >
            {adding && <Spinner variant="ring" className="size-4" />}
            <Plus />
            เพิ่มสต็อก
          </Button>
        </div>
      </form>

      <div className="flex items-center gap-1">
        {STATUS_TABS.map((tab) => (
          <Button
            key={tab.value}
            variant={filter === tab.value ? "secondary" : "ghost"}
            size="sm"
            onClick={() => setFilter(tab.value)}
          >
            {tab.label}
          </Button>
        ))}
      </div>

      <div className="overflow-hidden rounded-2xl border">
        {loading ? (
          <div className="flex justify-center py-10">
            <Spinner variant="ring" className="size-6 text-muted-foreground" />
          </div>
        ) : !data || data.stocks.length === 0 ? (
          <p className="py-10 text-center text-sm text-muted-foreground">
            ไม่มีรายการสต็อก
          </p>
        ) : (
          <div className="max-h-[28rem] overflow-y-auto">
            <Table>
              <TableBody>
                {data.stocks.map((s) => (
                  <TableRow key={s.id}>
                    <TableCell className="text-muted-foreground w-12 text-xs">
                      #{s.id}
                    </TableCell>
                    <TableCell className="font-mono text-xs break-all">
                      {s.data}
                    </TableCell>
                    <TableCell className="w-24">
                      <Badge
                        variant={
                          s.status === "available" ? "secondary" : "outline"
                        }
                      >
                        {s.status === "available" ? "พร้อมขาย" : "ขายแล้ว"}
                      </Badge>
                    </TableCell>
                    <TableCell className="w-10 text-right">
                      {s.status === "available" && (
                        <Button
                          variant="ghost"
                          size="icon-sm"
                          aria-label="ลบ"
                          onClick={() => setDeleteId(s.id)}
                        >
                          <Trash2 />
                        </Button>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </div>

      <ConfirmDialog
        open={deleteId !== null}
        onOpenChange={(o) => !o && setDeleteId(null)}
        title="ลบสต็อก"
        description="ยืนยันการลบรายการสต็อกนี้"
        confirmLabel="ลบ"
        destructive
        onConfirm={async () => {
          if (deleteId !== null) await removeStock(deleteId)
        }}
      />
    </div>
  )
}

export default function AdminStockPage() {
  const { error } = useToast()
  const [products, setProducts] = React.useState<Product[]>([])
  const [loading, setLoading] = React.useState(true)
  const [selectedId, setSelectedId] = React.useState<number | null>(null)
  const [query, setQuery] = React.useState("")

  const load = React.useCallback(async () => {
    try {
      const { data } = await api.get<ApiResponse<Product[]>>("/admin/products")
      const list = data.data ?? []
      setProducts(list)
      setSelectedId((prev) => prev ?? list[0]?.id ?? null)
    } catch (err) {
      error(getApiErrorMessage(err))
    } finally {
      setLoading(false)
    }
  }, [error])

  React.useEffect(() => {
    load()
  }, [load])

  const filtered = React.useMemo(() => {
    const q = query.trim().toLowerCase()
    if (!q) return products
    return products.filter((p) => p.name.toLowerCase().includes(q))
  }, [products, query])

  const selected = products.find((p) => p.id === selectedId) ?? null

  return (
    <div>
      <AdminHeader
        title="จัดการสต็อก"
        description="ดูและจัดการสต็อกสินค้าแต่ละรายการโดยละเอียด"
      />

      {loading ? (
        <div className="flex justify-center py-16">
          <Spinner variant="ring" className="size-7 text-muted-foreground" />
        </div>
      ) : products.length === 0 ? (
        <Empty className="border">
          <EmptyHeader>
            <EmptyMedia variant="icon">
              <Package />
            </EmptyMedia>
            <EmptyTitle>ยังไม่มีสินค้า</EmptyTitle>
            <EmptyDescription>
              กรุณาเพิ่มสินค้าในหน้า “สินค้า” ก่อนจัดการสต็อก
            </EmptyDescription>
          </EmptyHeader>
        </Empty>
      ) : (
        <div className="grid gap-6 lg:grid-cols-[18rem_1fr]">
          <div className="flex flex-col gap-3">
            <div className="relative">
              <Search className="absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="ค้นหาสินค้า"
                className="pl-9"
              />
            </div>
            <div className="flex max-h-[32rem] flex-col gap-1 overflow-y-auto rounded-2xl border p-1">
              {filtered.length === 0 ? (
                <p className="py-6 text-center text-sm text-muted-foreground">
                  ไม่พบสินค้า
                </p>
              ) : (
                filtered.map((p) => (
                  <button
                    key={p.id}
                    type="button"
                    onClick={() => setSelectedId(p.id)}
                    className={cn(
                      "flex items-center justify-between gap-2 rounded-xl px-3 py-2 text-left text-sm transition-colors",
                      p.id === selectedId
                        ? "bg-muted text-foreground"
                        : "text-muted-foreground hover:bg-muted/60 hover:text-foreground"
                    )}
                  >
                    <span className="min-w-0 flex-1 truncate font-medium">
                      {p.name}
                    </span>
                    <Badge variant="outline" className="gap-1">
                      <Boxes className="size-3" />
                      {p.stock}
                    </Badge>
                  </button>
                ))
              )}
            </div>
          </div>

          <div className="min-w-0">
            {selected ? (
              <StockPanel
                key={selected.id}
                product={selected}
                onStockChanged={load}
              />
            ) : (
              <p className="py-16 text-center text-sm text-muted-foreground">
                เลือกสินค้าเพื่อจัดการสต็อก
              </p>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
