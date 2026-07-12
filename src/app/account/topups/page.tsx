"use client"

import Link from "next/link"
import { ArrowLeft } from "lucide-react"

import { Protected } from "@/components/auth/protected"
import { TopupHistory } from "@/components/account/topup-history"
import { Button } from "@/components/ui/button"

function TopupsView() {
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
              ประวัติการเติมเงิน
            </h1>
            <p className="mt-1 text-sm text-muted-foreground">
              รายการเติมเงินทั้งหมดในบัญชีของคุณ
            </p>
          </div>

          <TopupHistory description="รายการเติมเงินทั้งหมด" />
        </div>
      </section>
    </main>
  )
}

export default function TopupsPage() {
  return (
    <Protected>
      <TopupsView />
    </Protected>
  )
}
