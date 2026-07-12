"use client"

import { AdminProtected } from "@/components/auth/admin-protected"
import { AdminNav } from "@/components/admin/admin-nav"

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <AdminProtected>
      <div className="flex justify-center px-3 py-8">
        <div className="flex w-full max-w-6xl flex-col gap-6 lg:flex-row">
          <aside className="lg:w-52 lg:shrink-0">
            <div className="lg:sticky lg:top-20">
              <p className="mb-3 hidden px-3 text-xs font-medium text-muted-foreground lg:block">
                จัดการหลังบ้าน
              </p>
              <AdminNav />
            </div>
          </aside>
          <main className="min-w-0 flex-1">{children}</main>
        </div>
      </div>
    </AdminProtected>
  )
}
