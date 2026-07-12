"use client"

import Link from "next/link"
import { ArrowLeft } from "lucide-react"

import { Protected } from "@/components/auth/protected"
import { OrderHistory } from "@/components/account/order-history"
import { Button } from "@/components/ui/button"

function OrdersView() {
  return (
    <main className="min-h-screen">
      <section className="flex justify-center px-3 py-10">
        <div className="w-full max-w-2xl">
          <Button
            variant="ghost"
            size="sm"
            className="mb-4 -ml-2"
            render={<Link href="/account" />}
          >
            <ArrowLeft />
            บัญชีของฉัน
          </Button>

          <div className="mb-6">
            <h1 className="text-2xl font-semibold tracking-tight">
              ประวัติการสั่งซื้อ
            </h1>
            <p className="mt-1 text-sm text-muted-foreground">
              คำสั่งซื้อทั้งหมดและสินค้าที่คุณได้รับ
            </p>
          </div>

          <OrderHistory />
        </div>
      </section>
    </main>
  )
}

export default function OrdersPage() {
  return (
    <Protected>
      <OrdersView />
    </Protected>
  )
}
