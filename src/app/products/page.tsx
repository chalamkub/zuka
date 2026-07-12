import * as React from "react"
import type { Metadata } from "next"

import { ProductsBrowser } from "@/components/shop/products-browser"
import { Spinner } from "@/components/kibo-ui/spinner"

export const metadata: Metadata = {
  title: "สินค้าทั้งหมด",
}

export default function ProductsPage() {
  return (
    <main className="min-h-screen">
      <section className="flex justify-center px-3 py-10">
        <div className="w-full max-w-5xl">
          <div className="mb-6">
            <h1 className="text-2xl font-semibold tracking-tight">สินค้าทั้งหมด</h1>
            <p className="mt-1 text-sm text-muted-foreground">
              เลือกซื้อสินค้าดิจิทัลที่คุณต้องการจากร้าน Zuka
            </p>
          </div>
          <React.Suspense
            fallback={
              <div className="flex justify-center py-16">
                <Spinner
                  variant="ring"
                  className="size-7 text-muted-foreground"
                />
              </div>
            }
          >
            <ProductsBrowser />
          </React.Suspense>
        </div>
      </section>
    </main>
  )
}
