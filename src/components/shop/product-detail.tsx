"use client"

import * as React from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import {
  ArrowLeft,
  Check,
  ChevronDown,
  Copy,
  HelpCircle,
  ImageOff,
  Info,
  Minus,
  PackageOpen,
  Plus,
  ShieldCheck,
  ShoppingCart,
  Tag,
  Wallet,
  Zap,
} from "lucide-react"

import type { ApiResponse, Category, Order, Product } from "@/types"
import api, { getApiErrorMessage } from "@/lib/axios"
import { flattenCategories } from "@/lib/categories"
import { formatTHB } from "@/lib/format"
import { cn } from "@/lib/utils"
import { useAuth } from "@/context/auth-context"
import { useToast } from "@/components/admin/toast"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
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

const PERKS = [
  { icon: Zap, label: "รับสินค้าทันที" },
  { icon: ShieldCheck, label: "ปลอดภัย" },
  { icon: Wallet, label: "จ่ายด้วยเครดิต" },
]

const MAX_QTY = 50

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

function PurchaseDialog({
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
          <DialogTitle>สั่งซื้อสำเร็จ</DialogTitle>
          <DialogDescription>
            {order
              ? `${order.productName} · ${order.quantity} ชิ้น · ${formatTHB(
                  order.totalPrice
                )}`
              : null}
          </DialogDescription>
        </DialogHeader>

        <div className="flex flex-col gap-2">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">สินค้าที่ได้รับ</span>
            {items.length > 1 && (
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={copyAll}
              >
                <Copy />
                คัดลอกทั้งหมด
              </Button>
            )}
          </div>
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
          <Button variant="outline" render={<Link href="/topup" />}>
            ดูประวัติ
          </Button>
          <Button onClick={onClose}>เสร็จสิ้น</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

export function ProductDetail({ id }: { id: string }) {
  const router = useRouter()
  const { isAuthenticated, refresh } = useAuth()
  const toast = useToast()

  const [product, setProduct] = React.useState<Product | null>(null)
  const [categoryMap, setCategoryMap] = React.useState<Map<number, string>>(
    new Map()
  )
  const [loading, setLoading] = React.useState(true)
  const [error, setError] = React.useState<string | null>(null)

  const [activeImage, setActiveImage] = React.useState(0)
  const [quantity, setQuantity] = React.useState(1)
  const [buying, setBuying] = React.useState(false)
  const [order, setOrder] = React.useState<Order | null>(null)

  const loadProduct = React.useCallback(async () => {
    try {
      const { data } = await api.get<ApiResponse<Product>>(`/products/${id}`)
      setProduct(data.data ?? null)
      setError(data.data ? null : "ไม่พบสินค้านี้")
    } catch (err) {
      setError(getApiErrorMessage(err))
    } finally {
      setLoading(false)
    }
  }, [id])

  React.useEffect(() => {
    loadProduct()
  }, [loadProduct])

  React.useEffect(() => {
    let active = true
    api
      .get<ApiResponse<Category[]>>("/categories")
      .then(({ data }) => {
        if (!active) return
        const flat = flattenCategories(data.data ?? [])
        setCategoryMap(new Map(flat.map((c) => [c.id, c.name])))
      })
      .catch(() => {
        if (active) setCategoryMap(new Map())
      })
    return () => {
      active = false
    }
  }, [])

  const maxQty = product ? Math.min(product.stock, MAX_QTY) : 1

  React.useEffect(() => {
    setQuantity((q) => Math.min(Math.max(1, q), Math.max(1, maxQty)))
  }, [maxQty])

  async function handleBuy() {
    if (!product) return
    if (!isAuthenticated) {
      router.push(`/signin?next=${encodeURIComponent(`/products/${id}`)}`)
      return
    }
    setBuying(true)
    try {
      const { data } = await api.post<ApiResponse<Order>>("/orders", {
        productId: product.id,
        quantity,
      })
      if (data.data) {
        setOrder(data.data)
        toast.success("สั่งซื้อสำเร็จ")
        await Promise.all([refresh(), loadProduct()])
        setQuantity(1)
      }
    } catch (err) {
      toast.error(getApiErrorMessage(err))
    } finally {
      setBuying(false)
    }
  }

  if (loading) {
    return (
      <main className="flex min-h-screen justify-center px-3 py-16">
        <Spinner variant="ring" className="size-7 text-muted-foreground" />
      </main>
    )
  }

  if (error || !product) {
    return (
      <main className="min-h-screen">
        <section className="flex justify-center px-3 py-16">
          <div className="w-full max-w-md">
            <Empty className="border">
              <EmptyHeader>
                <EmptyMedia variant="icon">
                  <PackageOpen />
                </EmptyMedia>
                <EmptyTitle>ไม่พบสินค้า</EmptyTitle>
                <EmptyDescription>
                  {error ?? "สินค้านี้อาจถูกลบหรือปิดการขายแล้ว"}
                </EmptyDescription>
              </EmptyHeader>
              <Button variant="outline" render={<Link href="/products" />}>
                <ArrowLeft />
                กลับไปหน้าสินค้า
              </Button>
            </Empty>
          </div>
        </section>
      </main>
    )
  }

  const inStock = product.stock > 0
  const categoryName = categoryMap.get(product.categoryId)
  const images = product.images.length > 0 ? product.images : [null]
  const mainImage = images[Math.min(activeImage, images.length - 1)]
  const total = product.price * quantity
  const tags = product.tags ?? []
  const faqs = product.faqs ?? []

  return (
    <main className="min-h-screen">
      <section className="flex justify-center px-3 py-10">
        <div className="w-full max-w-5xl">
          <Button
            variant="ghost"
            size="sm"
            className="mb-4 -ml-2"
            render={<Link href="/products" />}
          >
            <ArrowLeft />
            สินค้าทั้งหมด
          </Button>

          <div className="grid gap-8 lg:grid-cols-2">
            {/* แกลเลอรีรูป (sticky บนจอใหญ่) */}
            <div className="flex flex-col gap-3 lg:sticky lg:top-20 lg:self-start">
              <div className="relative flex items-center justify-center overflow-hidden rounded-3xl bg-muted">
                {mainImage ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={mainImage}
                    alt={product.name}
                    className="size-full object-cover"
                  />
                ) : (
                  <ImageOff className="size-10 text-muted-foreground" />
                )}
                <div className="absolute top-3 left-3">
                  {inStock ? (
                    <span className="inline-flex items-center gap-1.5 rounded-full bg-background/85 px-2.5 py-1 text-xs font-medium shadow-sm ring-1 ring-foreground/5 backdrop-blur">
                      <span className="size-1.5 rounded-full bg-emerald-500" />
                      พร้อมส่ง
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1.5 rounded-full bg-background/85 px-2.5 py-1 text-xs font-medium text-muted-foreground shadow-sm ring-1 ring-foreground/5 backdrop-blur">
                      สินค้าหมด
                    </span>
                  )}
                </div>
              </div>
              {images.length > 1 && (
                <div className="flex flex-wrap gap-2">
                  {images.map((img, i) => (
                    <button
                      key={i}
                      type="button"
                      onClick={() => setActiveImage(i)}
                      className={cn(
                        "flex size-16 items-center justify-center overflow-hidden rounded-xl border bg-muted transition-colors",
                        i === activeImage
                          ? "ring-2 ring-ring"
                          : "hover:border-foreground/30"
                      )}
                    >
                      {img ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={img}
                          alt={`${product.name} ${i + 1}`}
                          className="size-full object-cover"
                        />
                      ) : (
                        <ImageOff className="size-4 text-muted-foreground" />
                      )}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* ข้อมูล + กล่องซื้อ */}
            <div className="flex flex-col gap-4">
              <div className="flex flex-col gap-2">
                <div className="flex flex-wrap items-center gap-2">
                  {categoryName && (
                    <Link
                      href={`/products?category=${product.categoryId}`}
                      className="inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-xs font-medium text-muted-foreground transition-colors hover:border-foreground/30 hover:text-foreground"
                    >
                      <Tag className="size-3" />
                      {categoryName}
                    </Link>
                  )}
                  {inStock ? (
                    <span className="inline-flex items-center gap-1.5 text-xs font-medium text-emerald-600 dark:text-emerald-400">
                      <span className="size-1.5 rounded-full bg-emerald-500" />
                      เหลือ {product.stock} ชิ้น
                    </span>
                  ) : (
                    <Badge variant="outline">สินค้าหมด</Badge>
                  )}
                </div>

                <h1 className="text-lg font-semibold tracking-tight sm:text-xl">
                  {product.name}
                </h1>

                {tags.length > 0 && (
                  <div className="flex flex-wrap gap-1.5">
                    {tags.map((tag) => (
                      <span
                        key={tag}
                        className="rounded-full bg-muted px-2 py-0.5 text-xs font-medium text-muted-foreground"
                      >
                        #{tag}
                      </span>
                    ))}
                  </div>
                )}
              </div>

              {/* กล่องซื้อ */}
              <div className="rounded-2xl border p-4">
                <div className="flex items-baseline justify-between">
                  <span className="text-xs text-muted-foreground">
                    ราคาต่อชิ้น
                  </span>
                  <span className="text-xl font-bold tracking-tight">
                    {formatTHB(product.price)}
                  </span>
                </div>

                {inStock ? (
                  <div className="mt-4 flex flex-col gap-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">จำนวน</span>
                      <div className="flex items-center gap-1 rounded-lg border bg-background p-0.5">
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon-sm"
                          aria-label="ลดจำนวน"
                          disabled={quantity <= 1 || buying}
                          onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                        >
                          <Minus />
                        </Button>
                        <span className="w-9 text-center text-sm font-semibold tabular-nums">
                          {quantity}
                        </span>
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon-sm"
                          aria-label="เพิ่มจำนวน"
                          disabled={quantity >= maxQty || buying}
                          onClick={() =>
                            setQuantity((q) => Math.min(maxQty, q + 1))
                          }
                        >
                          <Plus />
                        </Button>
                      </div>
                    </div>

                    <div className="flex items-center justify-between border-t pt-3">
                      <span className="text-sm text-muted-foreground">
                        ยอดชำระรวม
                      </span>
                      <span className="text-lg font-bold">
                        {formatTHB(total)}
                      </span>
                    </div>

                    <Button
                      className="w-full"
                      disabled={buying}
                      onClick={handleBuy}
                    >
                      {buying ? (
                        <Spinner variant="ring" className="size-4" />
                      ) : (
                        <ShoppingCart />
                      )}
                      {isAuthenticated ? "ซื้อเลย" : "เข้าสู่ระบบเพื่อซื้อ"}
                    </Button>
                    <p className="text-center text-xs text-muted-foreground">
                      รับสินค้าทันทีหลังชำระเงินด้วยเครดิตในบัญชี
                    </p>
                  </div>
                ) : (
                  <div className="mt-3 flex items-center gap-2 rounded-xl bg-muted/50 p-3 text-sm text-muted-foreground">
                    <PackageOpen className="size-4 shrink-0" />
                    สินค้าหมดชั่วคราว โปรดกลับมาใหม่ภายหลัง
                  </div>
                )}
              </div>

              {/* จุดเด่น */}
              <div className="grid grid-cols-3 gap-2">
                {PERKS.map((perk) => (
                  <div
                    key={perk.label}
                    className="flex flex-col items-center gap-1 rounded-xl border p-2.5 text-center"
                  >
                    <perk.icon className="size-4 text-muted-foreground" />
                    <span className="text-xs font-medium">{perk.label}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* ข้อมูลสินค้า + ถาม-ตอบ */}
          <div className="mt-10 flex flex-col gap-6">
            <div className="rounded-2xl border p-5 sm:p-6">
              <div className="mb-3 flex items-center gap-2">
                <Info className="size-4 text-muted-foreground" />
                <h2 className="text-sm font-semibold">ข้อมูลสินค้า</h2>
              </div>

              <dl className="mb-4 grid gap-x-6 gap-y-2 sm:grid-cols-2">
                <div className="flex items-center justify-between gap-3 border-b py-2 text-sm">
                  <dt className="text-muted-foreground">หมวดหมู่</dt>
                  <dd className="font-medium">{categoryName ?? "—"}</dd>
                </div>
                <div className="flex items-center justify-between gap-3 border-b py-2 text-sm">
                  <dt className="text-muted-foreground">คงเหลือ</dt>
                  <dd className="font-medium">
                    {inStock ? `${product.stock} ชิ้น` : "สินค้าหมด"}
                  </dd>
                </div>
              </dl>

              <p className="text-sm leading-relaxed whitespace-pre-line text-muted-foreground">
                {product.description || "ไม่มีคำอธิบายสำหรับสินค้านี้"}
              </p>
            </div>

            {faqs.length > 0 && (
              <div className="rounded-2xl border p-5 sm:p-6">
                <div className="mb-3 flex items-center gap-2">
                  <HelpCircle className="size-4 text-muted-foreground" />
                  <h2 className="text-sm font-semibold">คำถามที่พบบ่อย</h2>
                </div>
                <div className="flex flex-col gap-2">
                  {faqs.map((faq, i) => (
                    <details
                      key={i}
                      className="group rounded-xl border px-4 py-3 transition-colors hover:border-foreground/20"
                    >
                      <summary className="flex cursor-pointer list-none items-center justify-between gap-3 text-sm font-medium [&::-webkit-details-marker]:hidden">
                        {faq.question}
                        <ChevronDown className="size-4 shrink-0 text-muted-foreground transition-transform group-open:rotate-180" />
                      </summary>
                      <p className="mt-2.5 text-sm leading-relaxed whitespace-pre-line text-muted-foreground">
                        {faq.answer}
                      </p>
                    </details>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </section>

      <PurchaseDialog order={order} onClose={() => setOrder(null)} />
    </main>
  )
}
