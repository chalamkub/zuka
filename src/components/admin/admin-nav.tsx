"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import {
  Boxes,
  FolderTree,
  Images,
  LayoutDashboard,
  Megaphone,
  Package,
  Receipt,
  Settings,
  Sparkles,
  Ticket,
  Users,
} from "lucide-react"

import { cn } from "@/lib/utils"

export const adminNav = [
  { href: "/admin", label: "ภาพรวม", icon: LayoutDashboard, exact: true },
  { href: "/admin/users", label: "ผู้ใช้", icon: Users },
  { href: "/admin/categories", label: "หมวดหมู่", icon: FolderTree },
  { href: "/admin/products", label: "สินค้า", icon: Package },
  { href: "/admin/stock", label: "สต็อก", icon: Boxes },
  { href: "/admin/slides", label: "สไลด์", icon: Images },
  { href: "/admin/announcements", label: "ประกาศ", icon: Megaphone },
  { href: "/admin/features", label: "จุดเด่น", icon: Sparkles },
  { href: "/admin/orders", label: "คำสั่งซื้อ", icon: Receipt },
  { href: "/admin/topup", label: "โค้ดเติมเงิน", icon: Ticket },
  { href: "/admin/settings", label: "ตั้งค่า", icon: Settings },
]

function isActive(pathname: string, href: string, exact?: boolean) {
  if (exact) return pathname === href
  return pathname === href || pathname.startsWith(`${href}/`)
}

export function AdminNav() {
  const pathname = usePathname()

  return (
    <nav className="flex gap-1 overflow-x-auto lg:flex-col lg:overflow-visible">
      {adminNav.map((item) => {
        const active = isActive(pathname, item.href, item.exact)
        return (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              "flex shrink-0 items-center gap-2 rounded-2xl px-3 py-2 text-sm font-medium transition-colors",
              active
                ? "bg-muted text-foreground"
                : "text-muted-foreground hover:bg-muted/60 hover:text-foreground"
            )}
          >
            <item.icon className="size-4" />
            {item.label}
          </Link>
        )
      })}
    </nav>
  )
}
