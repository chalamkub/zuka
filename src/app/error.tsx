"use client"

import * as React from "react"
import Link from "next/link"
import { Home, RotateCw, TriangleAlert } from "lucide-react"

import { Button } from "@/components/ui/button"

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  React.useEffect(() => {
    console.error(error)
  }, [error])

  return (
    <main className="flex min-h-[calc(100vh-3.5rem)] items-center justify-center px-3 py-16">
      <div className="flex max-w-md flex-col items-center text-center">
        <div className="flex size-14 items-center justify-center rounded-2xl bg-muted">
          <TriangleAlert className="size-7 text-muted-foreground" />
        </div>
        <h1 className="mt-6 text-lg font-medium">เกิดข้อผิดพลาดบางอย่าง</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          ขออภัย ระบบทำงานผิดพลาด กรุณาลองใหม่อีกครั้ง
        </p>
        {error.digest && (
          <p className="mt-2 font-mono text-xs text-muted-foreground">
            รหัสอ้างอิง: {error.digest}
          </p>
        )}
        <div className="mt-7 flex flex-wrap items-center justify-center gap-2">
          <Button onClick={reset}>
            ลองใหม่
          </Button>
          <Button variant="outline" render={<Link href="/" />}>
            <Home />
            กลับหน้าแรก
          </Button>
        </div>
      </div>
    </main>
  )
}
