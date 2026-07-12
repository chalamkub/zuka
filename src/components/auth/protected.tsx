"use client"

import * as React from "react"
import { usePathname, useRouter } from "next/navigation"

import { useAuth } from "@/context/auth-context"
import { RouteLoading } from "./route-loading"

/**
 * เส้นทางที่ต้องล็อกอินก่อน
 * ถ้ายังไม่ล็อกอินจะพาไปหน้า signin พร้อมจำหน้าเดิมไว้ใน ?next=
 */
export function Protected({ children }: { children: React.ReactNode }) {
  const { status } = useAuth()
  const router = useRouter()
  const pathname = usePathname()

  React.useEffect(() => {
    if (status === "unauthenticated") {
      const next = encodeURIComponent(pathname)
      router.replace(`/signin?next=${next}`)
    }
  }, [status, pathname, router])

  if (status !== "authenticated") {
    return <RouteLoading />
  }

  return <>{children}</>
}
