"use client"

import * as React from "react"
import Link from "next/link"
import { PackageOpen, ImageOff, Tag } from "lucide-react"

import type { ApiResponse, Category, Product } from "@/types"
import api, { getApiErrorMessage } from "@/lib/axios"
import { flattenCategories } from "@/lib/categories"
import { formatTHB } from "@/lib/format"
import { cn } from "@/lib/utils"
import { Card } from "@/components/ui/card"
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty"
import { Badge } from "@/components/ui/badge"
import { Spinner } from "@/components/kibo-ui/spinner"

function ProductCard({
  product,
  categoryName,
}: {
  product: Product
  categoryName?: string
}) {
  const image = product.images[0]
  const soldOut = product.stock <= 0

  return (
    <Link href={`/products/${product.id}`} className="group block h-full">
      <Card className="h-full gap-0 overflow-hidden p-0 transition-all duration-200 group-hover:-translate-y-0.5 group-hover:border-foreground/15 group-hover:shadow-md">
        <div className="relative aspect-4/3 overflow-hidden bg-muted">
          {image ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={image}
              alt={product.name}
              className={cn(
                "size-full object-cover transition-transform duration-300 group-hover:scale-105",
                soldOut && "opacity-60"
              )}
            />
          ) : (
            <div className="flex size-full items-center justify-center">
              <ImageOff className="size-7 text-muted-foreground" />
            </div>
          )}

          {categoryName && (
            <span className="absolute top-2 left-2 inline-flex items-center gap-1 rounded-full bg-background/85 px-2 py-0.5 text-xs font-medium shadow-sm ring-1 ring-foreground/5 backdrop-blur">
              <Tag className="size-3" />
              {categoryName}
            </span>
          )}
          {soldOut && (
            <span className="absolute top-2 right-2 rounded-full bg-background/85 px-2 py-0.5 text-xs font-medium text-muted-foreground shadow-sm ring-1 ring-foreground/5 backdrop-blur">
              สินค้าหมด
            </span>
          )}
        </div>

        <div className="flex flex-1 flex-col p-4">
          <h3 className="line-clamp-1 font-medium">{product.name}</h3>
          <p className="mt-1 line-clamp-2 text-sm text-muted-foreground">
            {product.description || "ไม่มีคำอธิบาย"}
          </p>
          <div className="mt-auto flex items-center justify-between pt-3">
            <span className="text-base font-semibold">
              {formatTHB(product.price)}
            </span>
            {soldOut ? (
              <Badge variant="outline">หมด</Badge>
            ) : (
              <span className="inline-flex items-center gap-1.5 text-xs font-medium text-emerald-600 dark:text-emerald-400">
                <span className="size-1.5 rounded-full bg-emerald-500" />
                พร้อมส่ง
              </span>
            )}
          </div>
        </div>
      </Card>
    </Link>
  )
}

export function ProductList({ categoryId }: { categoryId?: number }) {
  const [products, setProducts] = React.useState<Product[]>([])
  const [categoryMap, setCategoryMap] = React.useState<Map<number, string>>(
    new Map()
  )
  const [loading, setLoading] = React.useState(true)
  const [error, setError] = React.useState<string | null>(null)

  React.useEffect(() => {
    let active = true
    setLoading(true)
    setError(null)

    const path =
      categoryId !== undefined ? `/products?categoryId=${categoryId}` : "/products"

    Promise.all([
      api.get<ApiResponse<Product[]>>(path),
      api.get<ApiResponse<Category[]>>("/categories"),
    ])
      .then(([prodRes, catRes]) => {
        if (!active) return
        setProducts(prodRes.data.data ?? [])
        const flat = flattenCategories(catRes.data.data ?? [])
        setCategoryMap(new Map(flat.map((c) => [c.id, c.name])))
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
  }, [categoryId])

  if (loading) {
    return (
      <div className="flex justify-center py-16">
        <Spinner variant="ring" className="size-7 text-muted-foreground" />
      </div>
    )
  }

  if (error) {
    return (
      <Empty className="border">
        <EmptyHeader>
          <EmptyMedia variant="icon">
            <PackageOpen />
          </EmptyMedia>
          <EmptyTitle>โหลดสินค้าไม่สำเร็จ</EmptyTitle>
          <EmptyDescription>{error}</EmptyDescription>
        </EmptyHeader>
      </Empty>
    )
  }

  if (products.length === 0) {
    return (
      <Empty className="border">
        <EmptyHeader>
          <EmptyMedia variant="icon">
            <PackageOpen />
          </EmptyMedia>
          <EmptyTitle>ยังไม่มีสินค้า</EmptyTitle>
          <EmptyDescription>
            ขณะนี้ยังไม่มีสินค้าในหมวดนี้ โปรดกลับมาใหม่อีกครั้ง
          </EmptyDescription>
        </EmptyHeader>
      </Empty>
    )
  }

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {products.map((product) => (
        <ProductCard
          key={product.id}
          product={product}
          categoryName={categoryMap.get(product.categoryId)}
        />
      ))}
    </div>
  )
}
