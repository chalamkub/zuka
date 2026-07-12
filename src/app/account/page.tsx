"use client"

import * as React from "react"
import Link from "next/link"
import {
  History,
  LogOut,
  Package,
  Pencil,
  ShieldCheck,
  ShieldOff,
  User,
  Wallet,
} from "lucide-react"

import { useAuth } from "@/context/auth-context"
import { Protected } from "@/components/auth/protected"
import { formatTHB } from "@/lib/format"
import { ProfileDialog } from "@/components/account/profile-dialog"
import { TwoFactorDialog } from "@/components/account/two-factor-dialog"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"

interface MenuItem {
  icon: React.ElementType
  title: string
  description: string
  href?: string
  onClick?: () => void
  destructive?: boolean
}

function MenuTile({ item }: { item: MenuItem }) {
  const Icon = item.icon
  const inner = (
    <>
      <span
        className={
          "flex size-9 items-center justify-center rounded-xl " +
          (item.destructive
            ? "bg-destructive/10 text-destructive"
            : "bg-muted text-foreground")
        }
      >
        <Icon className="size-4.5" />
      </span>
      <span className="mt-3 block text-sm font-medium">{item.title}</span>
      <span className="mt-0.5 block text-xs text-muted-foreground">
        {item.description}
      </span>
    </>
  )

  const className =
    "group flex flex-col rounded-2xl border p-4 text-left transition-colors hover:border-foreground/20 hover:bg-muted/40"

  if (item.href) {
    return (
      <Link href={item.href} className={className}>
        {inner}
      </Link>
    )
  }
  return (
    <button type="button" onClick={item.onClick} className={className}>
      {inner}
    </button>
  )
}

function AccountView() {
  const { user, isAdmin, signOut } = useAuth()
  const [profileOpen, setProfileOpen] = React.useState(false)
  const [twoFactorOpen, setTwoFactorOpen] = React.useState(false)

  if (!user) return null

  const rows = [
    { label: "ชื่อผู้ใช้", value: user.username },
    { label: "อีเมล", value: user.email },
    { label: "เครดิตคงเหลือ", value: formatTHB(user.balance) },
    { label: "สิทธิ์การใช้งาน", value: isAdmin ? "ผู้ดูแลระบบ" : "สมาชิก" },
  ]

  const menu: MenuItem[] = [
    {
      icon: Wallet,
      title: "เติมเงิน",
      description: "เติมเครดิตด้วยโค้ด",
      href: "/topup",
    },
    {
      icon: Package,
      title: "ประวัติการสั่งซื้อ",
      description: "ดูสินค้าที่เคยซื้อ",
      href: "/account/orders",
    },
    {
      icon: History,
      title: "ประวัติการเติมเงิน",
      description: "รายการเติมเครดิต",
      href: "/account/topups",
    },
    ...(isAdmin
      ? [
          {
            icon: ShieldCheck,
            title: "แผงผู้ดูแล",
            description: "จัดการระบบหลังบ้าน",
            href: "/admin",
          },
        ]
      : []),
    {
      icon: LogOut,
      title: "ออกจากระบบ",
      description: "ออกจากบัญชีนี้",
      onClick: signOut,
      destructive: true,
    },
  ]

  return (
    <main className="min-h-screen">
      <section className="flex justify-center px-3 py-10">
        <div className="w-full max-w-2xl">
          <div className="mb-6">
            <h1 className="text-2xl font-semibold tracking-tight">บัญชีของฉัน</h1>
            <p className="mt-1 text-sm text-muted-foreground">
              ข้อมูลบัญชีและการตั้งค่า
            </p>
          </div>

          {/* Distinctive profile hero */}
          <div className="relative overflow-hidden rounded-3xl border p-5">
            <div className="flex flex-wrap items-center gap-4">
              <div className="flex size-16 shrink-0 items-center justify-center overflow-hidden rounded-2xl border bg-background shadow-sm">
                {user.profileImage ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={user.profileImage}
                    alt={user.username}
                    className="size-full object-cover"
                  />
                ) : (
                  <User className="size-7 text-muted-foreground" />
                )}
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <p className="text-lg font-semibold">{user.username}</p>
                  {user.badge && (
                    <Badge variant="secondary">{user.badge}</Badge>
                  )}
                  {isAdmin && (
                    <Badge variant="secondary" className="gap-1">
                      แอดมิน
                    </Badge>
                  )}
                </div>
                <p className="truncate text-sm text-muted-foreground">
                  {user.email}
                </p>
              </div>
              <div className="rounded-2xl border bg-background/70 px-4 py-2 text-right backdrop-blur">
                <p className="text-xs text-muted-foreground">เครดิตคงเหลือ</p>
                <p className="text-lg font-semibold">
                  {formatTHB(user.balance)}
                </p>
              </div>
            </div>

            <div className="mt-4 flex flex-wrap gap-2">
              <Button size="sm" onClick={() => setProfileOpen(true)}>
                <Pencil />
                แก้ไขโปรไฟล์
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={() => setTwoFactorOpen(true)}
              >
                {/* {user.twoFactorEnabled ? <ShieldCheck /> : <ShieldOff />} */}
                2FA {user.twoFactorEnabled ? "เปิดอยู่" : "ปิดอยู่"}
              </Button>
            </div>
          </div>

          {/* Normal info display */}
          <div className="mt-4 rounded-2xl border">
            <div className="flex flex-col divide-y px-4">
              {rows.map((row) => (
                <div
                  key={row.label}
                  className="flex items-center justify-between py-2.5 text-sm"
                >
                  <span className="text-muted-foreground">{row.label}</span>
                  <span className="font-medium">{row.value}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Grid menu */}
          <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-3">
            {menu.map((item) => (
              <MenuTile key={item.title} item={item} />
            ))}
          </div>
        </div>
      </section>

      <ProfileDialog open={profileOpen} onOpenChange={setProfileOpen} />
      <TwoFactorDialog open={twoFactorOpen} onOpenChange={setTwoFactorOpen} />
    </main>
  )
}

export default function AccountPage() {
  return (
    <Protected>
      <AccountView />
    </Protected>
  )
}
