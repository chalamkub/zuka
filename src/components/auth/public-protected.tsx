"use client"

import * as React from "react"
import { useRouter } from "next/navigation"

import { useAuth } from "@/context/auth-context"
import { RouteLoading } from "./route-loading"

/**
 * เส้นทางสำหรับผู้ที่ยังไม่ล็อกอิน (เช่น signin / signup)
 * ถ้าล็อกอินอยู่แล้วจะพากลับไปหน้าที่กำหนด (ค่าเริ่มต้น: หน้าแรก)
 */
export function PublicProtected({
  children,
  redirectTo = "/",
}: {
  children: React.ReactNode
  redirectTo?: string
}) {
  const { status } = useAuth()
  const router = useRouter()

  React.useEffect(() => {
    if (status === "authenticated") {
      router.replace(redirectTo)
    }
  }, [status, redirectTo, router])

  if (status !== "unauthenticated") {
    return <RouteLoading />
  }

  return <>{children}</>
}
