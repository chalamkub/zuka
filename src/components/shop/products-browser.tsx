"use client"

import * as React from "react"
import { useRouter, useSearchParams } from "next/navigation"

import type { ApiResponse, Category } from "@/types"
import api from "@/lib/axios"
import { flattenCategories } from "@/lib/categories"
import { cn } from "@/lib/utils"
import { ProductList } from "@/components/shop/product-list"

export function ProductsBrowser() {
  const router = useRouter()
  const searchParams = useSearchParams()

  const [categories, setCategories] = React.useState<Category[]>([])

  React.useEffect(() => {
    let active = true
    api
      .get<ApiResponse<Category[]>>("/categories")
      .then(({ data }) => {
        if (active) setCategories(flattenCategories(data.data ?? []))
      })
      .catch(() => {
        if (active) setCategories([])
      })
    return () => {
      active = false
    }
  }, [])

  const raw = searchParams.get("category")
  const selectedId = raw !== null && /^\d+$/.test(raw) ? Number(raw) : undefined

  function select(id?: number) {
    router.push(id === undefined ? "/products" : `/products?category=${id}`, {
      scroll: false,
    })
  }

  const chip = (active: boolean) =>
    cn(
      "shrink-0 rounded-full border px-3 py-1.5 text-sm font-medium transition-colors",
      active
        ? "border-foreground bg-foreground text-background"
        : "text-muted-foreground hover:border-foreground/30 hover:text-foreground"
    )

  return (
    <div className="flex flex-col gap-6">
      {categories.length > 0 && (
        <div className="-mx-1 flex gap-2 overflow-x-auto px-1 pb-1">
          <button
            type="button"
            onClick={() => select(undefined)}
            className={chip(selectedId === undefined)}
          >
            ทั้งหมด
          </button>
          {categories.map((c) => (
            <button
              key={c.id}
              type="button"
              onClick={() => select(c.id)}
              className={chip(selectedId === c.id)}
            >
              {c.name}
            </button>
          ))}
        </div>
      )}

      <ProductList categoryId={selectedId} />
    </div>
  )
}
