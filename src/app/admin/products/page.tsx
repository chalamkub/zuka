"use client"

import * as React from "react"
import { Boxes, Package, Pencil, Plus, Trash2, X } from "lucide-react"

import type {
  ApiResponse,
  Category,
  Product,
  StockListResponse,
} from "@/types"
import api, { getApiErrorMessage } from "@/lib/axios"
import { formatTHB } from "@/lib/format"
import { AdminHeader } from "@/components/admin/admin-header"
import { useToast } from "@/components/admin/toast"
import { ConfirmDialog } from "@/components/admin/confirm-dialog"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Empty, EmptyHeader, EmptyMedia, EmptyTitle } from "@/components/ui/empty"

interface ProductForm {
  name: string
  description: string
  price: string
  categoryId: string
  images: string
  tags: string[]
  faqs: { question: string; answer: string }[]
  active: boolean
}

function TagsField({
  value,
  onChange,
  disabled,
}: {
  value: string[]
  onChange: (tags: string[]) => void
  disabled?: boolean
}) {
  const [draft, setDraft] = React.useState("")

  function addFromDraft() {
    const parts = draft
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean)
    if (parts.length === 0) return
    const next = [...value]
    for (const p of parts) {
      if (!next.some((t) => t.toLowerCase() === p.toLowerCase())) next.push(p)
    }
    onChange(next)
    setDraft("")
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Enter" || e.key === ",") {
      e.preventDefault()
      addFromDraft()
    } else if (e.key === "Backspace" && draft === "" && value.length > 0) {
      onChange(value.slice(0, -1))
    }
  }

  return (
    <div
      className="flex flex-wrap items-center gap-1.5 rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-xs focus-within:border-ring focus-within:ring-[3px] focus-within:ring-ring/50 aria-disabled:opacity-50"
      aria-disabled={disabled}
    >
      {value.map((tag) => (
        <Badge key={tag} variant="secondary" className="gap-1 pr-1">
          {tag}
          <button
            type="button"
            aria-label={`ลบแท็ก ${tag}`}
            disabled={disabled}
            className="rounded-full p-0.5 hover:bg-muted-foreground/20 disabled:pointer-events-none"
            onClick={() => onChange(value.filter((t) => t !== tag))}
          >
            <X className="size-3" />
          </button>
        </Badge>
      ))}
      <input
        value={draft}
        onChange={(e) => setDraft(e.target.value)}
        onKeyDown={handleKeyDown}
        onBlur={addFromDraft}
        disabled={disabled}
        placeholder={value.length === 0 ? "เช่น เกม, โปรโมชั่น, ใหม่" : "เพิ่มแท็ก…"}
        className="flex-1 min-w-24 bg-transparent outline-none placeholder:text-muted-foreground disabled:pointer-events-none"
      />
    </div>
  )
}

function ProductDialog({
  open,
  onOpenChange,
  editing,
  categories,
  onSaved,
}: {
  open: boolean
  onOpenChange: (o: boolean) => void
  editing: Product | null
  categories: Category[]
  onSaved: () => void
}) {
  const { success, error } = useToast()
  const [form, setForm] = React.useState<ProductForm>({
    name: "",
    description: "",
    price: "",
    categoryId: "",
    images: "",
    tags: [],
    faqs: [],
    active: true,
  })
  const [loading, setLoading] = React.useState(false)

  React.useEffect(() => {
    if (open) {
      setForm(
        editing
          ? {
              name: editing.name,
              description: editing.description,
              price: String(editing.price),
              categoryId: String(editing.categoryId),
              images: editing.images.join("\n"),
              tags: editing.tags ?? [],
              faqs: (editing.faqs ?? []).map((f) => ({ ...f })),
              active: editing.status === "active",
            }
          : {
              name: "",
              description: "",
              price: "",
              categoryId: categories[0] ? String(categories[0].id) : "",
              images: "",
              tags: [],
              faqs: [],
              active: true,
            }
      )
    }
  }, [open, editing, categories])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    try {
      const images = form.images
        .split("\n")
        .map((s) => s.trim())
        .filter(Boolean)
      const tags = form.tags.map((s) => s.trim()).filter(Boolean)
      const faqs = form.faqs
        .map((f) => ({ question: f.question.trim(), answer: f.answer.trim() }))
        .filter((f) => f.question && f.answer)
      const payload = {
        name: form.name.trim(),
        description: form.description.trim(),
        price: Number(form.price),
        categoryId: Number(form.categoryId),
        images,
        tags,
        faqs,
        status: form.active ? "active" : "hidden",
      }
      const { data } = editing
        ? await api.patch<ApiResponse>(`/admin/products/${editing.id}`, payload)
        : await api.post<ApiResponse>("/admin/products", payload)
      success(data.message)
      onOpenChange(false)
      onSaved()
    } catch (err) {
      error(getApiErrorMessage(err))
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[88vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{editing ? "แก้ไขสินค้า" : "เพิ่มสินค้า"}</DialogTitle>
          <DialogDescription>กรอกรายละเอียดสินค้า</DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="p-name">ชื่อสินค้า</Label>
            <Input
              id="p-name"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              required
              disabled={loading}
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="p-price">ราคา (บาท)</Label>
              <Input
                id="p-price"
                type="number"
                min={0}
                step="0.01"
                value={form.price}
                onChange={(e) => setForm({ ...form, price: e.target.value })}
                required
                disabled={loading}
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label>หมวดหมู่</Label>
              <Select
                items={Object.fromEntries(categories.map((c) => [String(c.id), c.name]))}
                value={form.categoryId}
                onValueChange={(v) => setForm({ ...form, categoryId: (v as string) ?? "" })}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="เลือกหมวดหมู่" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((c) => (
                    <SelectItem key={c.id} value={String(c.id)}>
                      {c.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="p-desc">คำอธิบาย</Label>
            <Textarea
              id="p-desc"
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              disabled={loading}
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="p-images">ลิงก์รูปภาพ (บรรทัดละ 1 ลิงก์)</Label>
            <Textarea
              id="p-images"
              value={form.images}
              onChange={(e) => setForm({ ...form, images: e.target.value })}
              placeholder="https://..."
              disabled={loading}
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <Label htmlFor="p-tags">แท็ก</Label>
            <TagsField
              value={form.tags}
              onChange={(tags) => setForm({ ...form, tags })}
              disabled={loading}
            />
            <p className="text-xs text-muted-foreground">
              พิมพ์แล้วกด Enter หรือจุลภาคเพื่อเพิ่มทีละแท็ก
            </p>
          </div>

          <div className="flex flex-col gap-2">
            <div className="flex items-center justify-between">
              <Label>คำถาม-คำตอบ (FAQ)</Label>
              <Button
                type="button"
                variant="outline"
                size="sm"
                disabled={loading}
                onClick={() =>
                  setForm({
                    ...form,
                    faqs: [...form.faqs, { question: "", answer: "" }],
                  })
                }
              >
                <Plus />
                เพิ่มคำถาม
              </Button>
            </div>
            {form.faqs.length === 0 ? (
              <p className="text-xs text-muted-foreground">
                ยังไม่มีคำถาม-คำตอบ (ไม่บังคับ)
              </p>
            ) : (
              form.faqs.map((faq, i) => (
                <div
                  key={i}
                  className="flex flex-col gap-2 rounded-xl border p-3"
                >
                  <div className="flex items-center gap-2">
                    <Input
                      value={faq.question}
                      placeholder="คำถาม"
                      onChange={(e) => {
                        const faqs = [...form.faqs]
                        faqs[i] = { ...faqs[i], question: e.target.value }
                        setForm({ ...form, faqs })
                      }}
                      disabled={loading}
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon-sm"
                      aria-label="ลบคำถาม"
                      disabled={loading}
                      onClick={() =>
                        setForm({
                          ...form,
                          faqs: form.faqs.filter((_, j) => j !== i),
                        })
                      }
                    >
                      <Trash2 />
                    </Button>
                  </div>
                  <Textarea
                    value={faq.answer}
                    placeholder="คำตอบ"
                    onChange={(e) => {
                      const faqs = [...form.faqs]
                      faqs[i] = { ...faqs[i], answer: e.target.value }
                      setForm({ ...form, faqs })
                    }}
                    disabled={loading}
                  />
                </div>
              ))
            )}
          </div>

          <div className="flex items-center justify-between">
            <Label htmlFor="p-active">แสดงสินค้า</Label>
            <Switch
              id="p-active"
              checked={form.active}
              onCheckedChange={(v) => setForm({ ...form, active: v })}
              disabled={loading}
            />
          </div>
          <DialogFooter>
            <Button type="submit" disabled={loading || !form.categoryId}>
              {loading && <Spinner variant="ring" className="size-4" />}
              บันทึก
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}

function StockDialog({
  product,
  onOpenChange,
  onChanged,
}: {
  product: Product | null
  onOpenChange: (o: boolean) => void
  onChanged: () => void
}) {
  const { success, error } = useToast()
  const [data, setData] = React.useState<StockListResponse | null>(null)
  const [loading, setLoading] = React.useState(false)
  const [items, setItems] = React.useState("")
  const [adding, setAdding] = React.useState(false)

  const load = React.useCallback(async () => {
    if (!product) return
    setLoading(true)
    try {
      const { data } = await api.get<ApiResponse<StockListResponse>>(
        `/admin/products/${product.id}/stocks`
      )
      setData(data.data ?? null)
    } catch (err) {
      error(getApiErrorMessage(err))
    } finally {
      setLoading(false)
    }
  }, [product, error])

  React.useEffect(() => {
    if (product) {
      setItems("")
      load()
    }
  }, [product, load])

  async function add(e: React.FormEvent) {
    e.preventDefault()
    if (!product) return
    const cleaned = items.split("\n").map((s) => s.trim()).filter(Boolean)
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
      onChanged()
    } catch (err) {
      error(getApiErrorMessage(err))
    } finally {
      setAdding(false)
    }
  }

  async function removeStock(stockId: number) {
    if (!product) return
    try {
      const { data } = await api.delete<ApiResponse>(
        `/admin/products/${product.id}/stocks/${stockId}`
      )
      success(data.message)
      await load()
      onChanged()
    } catch (err) {
      error(getApiErrorMessage(err))
    }
  }

  return (
    <Dialog open={product !== null} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>จัดการสต็อก · {product?.name}</DialogTitle>
          <DialogDescription>
            {data
              ? `ทั้งหมด ${data.summary.total} · พร้อมขาย ${data.summary.available} · ขายแล้ว ${data.summary.sold}`
              : "เพิ่มและจัดการข้อมูลสต็อกสินค้า"}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={add} className="flex flex-col gap-2">
          <Label htmlFor="stock-items">เพิ่มสต็อก (บรรทัดละ 1 รายการ)</Label>
          <Textarea
            id="stock-items"
            value={items}
            onChange={(e) => setItems(e.target.value)}
            placeholder={"user1:pass1\nuser2:pass2"}
            disabled={adding}
          />
          <div className="flex justify-end">
            <Button type="submit" size="sm" disabled={adding || items.trim().length === 0}>
              {adding && <Spinner variant="ring" className="size-4" />}
              <Plus />
              เพิ่มสต็อก
            </Button>
          </div>
        </form>

        <div className="max-h-64 overflow-y-auto rounded-2xl border">
          {loading ? (
            <div className="flex justify-center py-8">
              <Spinner variant="ring" className="size-6 text-muted-foreground" />
            </div>
          ) : !data || data.stocks.length === 0 ? (
            <p className="py-8 text-center text-sm text-muted-foreground">ยังไม่มีสต็อก</p>
          ) : (
            <Table>
              <TableBody>
                {data.stocks.map((s) => (
                  <TableRow key={s.id}>
                    <TableCell className="font-mono text-xs break-all">{s.data}</TableCell>
                    <TableCell className="w-20">
                      <Badge variant={s.status === "available" ? "secondary" : "outline"}>
                        {s.status === "available" ? "พร้อมขาย" : "ขายแล้ว"}
                      </Badge>
                    </TableCell>
                    <TableCell className="w-10 text-right">
                      {s.status === "available" && (
                        <Button
                          variant="ghost"
                          size="icon-sm"
                          aria-label="ลบ"
                          onClick={() => removeStock(s.id)}
                        >
                          <Trash2 />
                        </Button>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}

export default function AdminProductsPage() {
  const { success, error } = useToast()
  const [products, setProducts] = React.useState<Product[]>([])
  const [categories, setCategories] = React.useState<Category[]>([])
  const [loading, setLoading] = React.useState(true)
  const [dialogOpen, setDialogOpen] = React.useState(false)
  const [editing, setEditing] = React.useState<Product | null>(null)
  const [stockProduct, setStockProduct] = React.useState<Product | null>(null)
  const [deleteId, setDeleteId] = React.useState<number | null>(null)

  const load = React.useCallback(async () => {
    try {
      const [prodRes, catRes] = await Promise.all([
        api.get<ApiResponse<Product[]>>("/admin/products"),
        api.get<ApiResponse<Category[]>>("/admin/categories"),
      ])
      setProducts(prodRes.data.data ?? [])
      setCategories(catRes.data.data ?? [])
    } catch (err) {
      error(getApiErrorMessage(err))
    } finally {
      setLoading(false)
    }
  }, [error])

  React.useEffect(() => {
    load()
  }, [load])

  const catById = React.useMemo(
    () => new Map(categories.map((c) => [c.id, c.name])),
    [categories]
  )

  async function remove(id: number) {
    try {
      const { data } = await api.delete<ApiResponse>(`/admin/products/${id}`)
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
        title="สินค้า"
        description="จัดการสินค้าและสต็อก"
        action={
          <Button
            disabled={categories.length === 0}
            onClick={() => {
              setEditing(null)
              setDialogOpen(true)
            }}
          >
            <Plus />
            เพิ่มสินค้า
          </Button>
        }
      />

      {categories.length === 0 && !loading && (
        <p className="mb-4 text-sm text-muted-foreground">
          กรุณาสร้างหมวดหมู่ก่อนจึงจะเพิ่มสินค้าได้
        </p>
      )}

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
          </EmptyHeader>
        </Empty>
      ) : (
        <div className="overflow-x-auto rounded-2xl border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>ชื่อสินค้า</TableHead>
                <TableHead>หมวดหมู่</TableHead>
                <TableHead>ราคา</TableHead>
                <TableHead>สต็อก</TableHead>
                <TableHead>สถานะ</TableHead>
                <TableHead className="text-right">จัดการ</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {products.map((p) => (
                <TableRow key={p.id}>
                  <TableCell className="font-medium">{p.name}</TableCell>
                  <TableCell className="text-muted-foreground">
                    {catById.get(p.categoryId) ?? "—"}
                  </TableCell>
                  <TableCell>{formatTHB(p.price)}</TableCell>
                  <TableCell>{p.stock}</TableCell>
                  <TableCell>
                    <Badge variant={p.status === "active" ? "secondary" : "outline"}>
                      {p.status === "active" ? "แสดง" : "ซ่อน"}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-1">
                      <Button variant="ghost" size="icon-sm" aria-label="สต็อก" onClick={() => setStockProduct(p)}>
                        <Boxes />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon-sm"
                        aria-label="แก้ไข"
                        onClick={() => {
                          setEditing(p)
                          setDialogOpen(true)
                        }}
                      >
                        <Pencil />
                      </Button>
                      <Button variant="ghost" size="icon-sm" aria-label="ลบ" onClick={() => setDeleteId(p.id)}>
                        <Trash2 />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}

      <ProductDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        editing={editing}
        categories={categories}
        onSaved={load}
      />

      <StockDialog
        product={stockProduct}
        onOpenChange={(o) => !o && setStockProduct(null)}
        onChanged={load}
      />

      <ConfirmDialog
        open={deleteId !== null}
        onOpenChange={(o) => !o && setDeleteId(null)}
        title="ลบสินค้า"
        description="ยืนยันการลบสินค้านี้ สต็อกที่ยังไม่ขายจะถูกลบด้วย"
        confirmLabel="ลบ"
        destructive
        onConfirm={async () => {
          if (deleteId !== null) await remove(deleteId)
        }}
      />
    </div>
  )
}
