"use client"

import * as React from "react"
import { usePathname, useRouter } from "next/navigation"

import { useAuth } from "@/context/auth-context"
import { RouteLoading } from "./route-loading"

/**
 * เส้นทางเฉพาะผู้ดูแลระบบ (role = admin)
 * ยังไม่ล็อกอิน -> ไป signin, ล็อกอินแต่ไม่ใช่แอดมิน -> กลับหน้าแรก
 */
export function AdminProtected({ children }: { children: React.ReactNode }) {
  const { status, isAdmin } = useAuth()
  const router = useRouter()
  const pathname = usePathname()

  React.useEffect(() => {
    if (status === "unauthenticated") {
      const next = encodeURIComponent(pathname)
      router.replace(`/signin?next=${next}`)
    } else if (status === "authenticated" && !isAdmin) {
      router.replace("/")
    }
  }, [status, isAdmin, pathname, router])

  if (status !== "authenticated" || !isAdmin) {
    return <RouteLoading />
  }

  return <>{children}</>
}
