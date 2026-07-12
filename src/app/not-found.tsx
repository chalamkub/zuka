import Link from "next/link"
import { Home, SearchX } from "lucide-react"

import { Button } from "@/components/ui/button"

export default function NotFound() {
  return (
    <main className="flex min-h-[calc(100vh-3.5rem)] items-center justify-center px-3 py-16">
      <div className="flex max-w-md flex-col items-center text-center">
        <div className="flex size-14 items-center justify-center rounded-2xl bg-muted">
          <SearchX className="size-7 text-muted-foreground" />
        </div>
        <p className="mt-6 text-5xl font-semibold tracking-tight">404</p>
        <h1 className="mt-3 text-lg font-medium">ไม่พบหน้าที่คุณต้องการ</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          หน้านี้อาจถูกย้าย ลบไปแล้ว หรือลิงก์ไม่ถูกต้อง
        </p>
        <div className="mt-7 flex flex-wrap items-center justify-center gap-2">
          <Button render={<Link href="/" />}>
            <Home />
            กลับหน้าแรก
          </Button>
          <Button variant="outline" render={<Link href="/products" />}>
            ดูสินค้า
          </Button>
        </div>
      </div>
    </main>
  )
}
