"use client"

import * as React from "react"
import { KeyRound, Pencil, Search, Trash2, Users, Wallet } from "lucide-react"

import type { ApiResponse, PublicUser, UserListResponse } from "@/types"
import api, { getApiErrorMessage } from "@/lib/axios"
import { useAuth } from "@/context/auth-context"
import { formatTHB } from "@/lib/format"
import { AdminHeader } from "@/components/admin/admin-header"
import { useToast } from "@/components/admin/toast"
import { ConfirmDialog } from "@/components/admin/confirm-dialog"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Spinner } from "@/components/kibo-ui/spinner"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Empty, EmptyHeader, EmptyMedia, EmptyTitle } from "@/components/ui/empty"

function EditDialog({
  user,
  onOpenChange,
  onSaved,
}: {
  user: PublicUser | null
  onOpenChange: (o: boolean) => void
  onSaved: () => void
}) {
  const { success, error } = useToast()
  const [role, setRole] = React.useState<"user" | "admin">("user")
  const [status, setStatus] = React.useState<"active" | "banned">("active")
  const [badge, setBadge] = React.useState("")
  const [loading, setLoading] = React.useState(false)

  React.useEffect(() => {
    if (user) {
      setRole(user.role)
      setStatus(user.status)
      setBadge(user.badge ?? "")
    }
  }, [user])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!user) return
    setLoading(true)
    try {
      const { data } = await api.patch<ApiResponse>(`/admin/users/${user.id}`, {
        role,
        status,
        badge: badge.trim() || null,
      })
      success(data.message)
      onOpenChange(false)
      onSaved()
    } catch (err) {
      error(getApiErrorMessage(err))
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={user !== null} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>แก้ไขผู้ใช้ {user?.username}</DialogTitle>
          <DialogDescription>ปรับสิทธิ์ สถานะ และป้ายของผู้ใช้</DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div className="grid grid-cols-2 gap-3">
            <div className="flex flex-col gap-1.5">
              <Label>สิทธิ์</Label>
              <Select
                items={{ user: "สมาชิก", admin: "ผู้ดูแลระบบ" }}
                value={role}
                onValueChange={(v) => setRole(v as "user" | "admin")}
              >
                <SelectTrigger className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="user">สมาชิก</SelectItem>
                  <SelectItem value="admin">ผู้ดูแลระบบ</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex flex-col gap-1.5">
              <Label>สถานะ</Label>
              <Select
                items={{ active: "ใช้งานได้", banned: "ระงับ" }}
                value={status}
                onValueChange={(v) => setStatus(v as "active" | "banned")}
              >
                <SelectTrigger className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="active">ใช้งานได้</SelectItem>
                  <SelectItem value="banned">ระงับ</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="u-badge">ป้าย (badge)</Label>
            <Input
              id="u-badge"
              value={badge}
              onChange={(e) => setBadge(e.target.value)}
              placeholder="เว้นว่างเพื่อไม่มีป้าย"
              disabled={loading}
            />
          </div>
          <DialogFooter>
            <Button type="submit" disabled={loading}>
              {loading && <Spinner variant="ring" className="size-4" />}
              บันทึก
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}

function BalanceDialog({
  user,
  onOpenChange,
  onSaved,
}: {
  user: PublicUser | null
  onOpenChange: (o: boolean) => void
  onSaved: () => void
}) {
  const { success, error } = useToast()
  const [amount, setAmount] = React.useState("")
  const [note, setNote] = React.useState("")
  const [loading, setLoading] = React.useState(false)

  React.useEffect(() => {
    if (user) {
      setAmount("")
      setNote("")
    }
  }, [user])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!user) return
    setLoading(true)
    try {
      const { data } = await api.post<ApiResponse>(`/admin/users/${user.id}/balance`, {
        amount: Number(amount),
        note: note.trim() || undefined,
      })
      success(data.message)
      onOpenChange(false)
      onSaved()
    } catch (err) {
      error(getApiErrorMessage(err))
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={user !== null} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>ปรับยอดเงิน {user?.username}</DialogTitle>
          <DialogDescription>
            ยอดปัจจุบัน {formatTHB(user?.balance ?? 0)} · ใส่ค่าลบเพื่อหักเงิน
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="b-amount">จำนวนเงิน (+ เพิ่ม / - หัก)</Label>
            <Input
              id="b-amount"
              type="number"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              required
              disabled={loading}
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="b-note">หมายเหตุ (ไม่บังคับ)</Label>
            <Input
              id="b-note"
              value={note}
              onChange={(e) => setNote(e.target.value)}
              disabled={loading}
            />
          </div>
          <DialogFooter>
            <Button type="submit" disabled={loading || amount === "" || Number(amount) === 0}>
              {loading && <Spinner variant="ring" className="size-4" />}
              ปรับยอด
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}

export default function AdminUsersPage() {
  const { user: me } = useAuth()
  const { success, error } = useToast()

  const [data, setData] = React.useState<UserListResponse | null>(null)
  const [loading, setLoading] = React.useState(true)
  const [q, setQ] = React.useState("")
  const [role, setRole] = React.useState("all")
  const [status, setStatus] = React.useState("all")
  const [page, setPage] = React.useState(1)

  const [editUser, setEditUser] = React.useState<PublicUser | null>(null)
  const [balanceUser, setBalanceUser] = React.useState<PublicUser | null>(null)
  const [reset2faId, setReset2faId] = React.useState<number | null>(null)
  const [deleteId, setDeleteId] = React.useState<number | null>(null)

  const load = React.useCallback(async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams()
      if (q.trim()) params.set("q", q.trim())
      if (role !== "all") params.set("role", role)
      if (status !== "all") params.set("status", status)
      params.set("page", String(page))
      const { data } = await api.get<ApiResponse<UserListResponse>>(
        `/admin/users?${params.toString()}`
      )
      setData(data.data ?? null)
    } catch (err) {
      error(getApiErrorMessage(err))
    } finally {
      setLoading(false)
    }
  }, [q, role, status, page, error])

  React.useEffect(() => {
    load()
  }, [load])

  async function reset2fa(id: number) {
    try {
      const { data } = await api.post<ApiResponse>(`/admin/users/${id}/reset-2fa`, {})
      success(data.message)
      load()
    } catch (err) {
      error(getApiErrorMessage(err))
      throw err
    }
  }

  async function remove(id: number) {
    try {
      const { data } = await api.delete<ApiResponse>(`/admin/users/${id}`)
      success(data.message)
      load()
    } catch (err) {
      error(getApiErrorMessage(err))
      throw err
    }
  }

  const totalPages = data ? Math.max(1, Math.ceil(data.total / data.limit)) : 1

  return (
    <div>
      <AdminHeader title="ผู้ใช้" description="จัดการบัญชีผู้ใช้ในระบบ" />

      <form
        onSubmit={(e) => {
          e.preventDefault()
          setPage(1)
          load()
        }}
        className="mb-4 flex flex-wrap gap-2"
      >
        <div className="relative flex-1 min-w-40">
          <Search className="absolute top-1/2 left-2.5 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="ค้นหาชื่อผู้ใช้หรืออีเมล"
            className="pl-8"
          />
        </div>
        <Select
          items={{ all: "ทุกสิทธิ์", user: "สมาชิก", admin: "ผู้ดูแล" }}
          value={role}
          onValueChange={(v) => { setRole(v as string); setPage(1) }}
        >
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">ทุกสิทธิ์</SelectItem>
            <SelectItem value="user">สมาชิก</SelectItem>
            <SelectItem value="admin">ผู้ดูแล</SelectItem>
          </SelectContent>
        </Select>
        <Select
          items={{ all: "ทุกสถานะ", active: "ใช้งานได้", banned: "ระงับ" }}
          value={status}
          onValueChange={(v) => { setStatus(v as string); setPage(1) }}
        >
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">ทุกสถานะ</SelectItem>
            <SelectItem value="active">ใช้งานได้</SelectItem>
            <SelectItem value="banned">ระงับ</SelectItem>
          </SelectContent>
        </Select>
        <Button type="submit" variant="outline">ค้นหา</Button>
      </form>

      {loading ? (
        <div className="flex justify-center py-16">
          <Spinner variant="ring" className="size-7 text-muted-foreground" />
        </div>
      ) : !data || data.users.length === 0 ? (
        <Empty className="border">
          <EmptyHeader>
            <EmptyMedia variant="icon">
              <Users />
            </EmptyMedia>
            <EmptyTitle>ไม่พบผู้ใช้</EmptyTitle>
          </EmptyHeader>
        </Empty>
      ) : (
        <>
          <div className="overflow-x-auto rounded-2xl border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>ผู้ใช้</TableHead>
                  <TableHead>สิทธิ์</TableHead>
                  <TableHead>สถานะ</TableHead>
                  <TableHead>ยอดเงิน</TableHead>
                  <TableHead className="text-right">จัดการ</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {data.users.map((u) => (
                  <TableRow key={u.id}>
                    <TableCell>
                      <div className="font-medium">{u.username}</div>
                      <div className="text-xs text-muted-foreground">{u.email}</div>
                    </TableCell>
                    <TableCell>
                      <Badge variant={u.role === "admin" ? "default" : "outline"}>
                        {u.role === "admin" ? "ผู้ดูแล" : "สมาชิก"}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge variant={u.status === "active" ? "secondary" : "destructive"}>
                        {u.status === "active" ? "ใช้งานได้" : "ระงับ"}
                      </Badge>
                    </TableCell>
                    <TableCell>{formatTHB(u.balance)}</TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-1">
                        <Button variant="ghost" size="icon-sm" aria-label="ปรับยอดเงิน" onClick={() => setBalanceUser(u)}>
                          <Wallet />
                        </Button>
                        <Button variant="ghost" size="icon-sm" aria-label="แก้ไข" onClick={() => setEditUser(u)}>
                          <Pencil />
                        </Button>
                        <Button variant="ghost" size="icon-sm" aria-label="รีเซ็ต 2FA" onClick={() => setReset2faId(u.id)}>
                          <KeyRound />
                        </Button>
                        {u.id !== me?.id && (
                          <Button variant="ghost" size="icon-sm" aria-label="ลบ" onClick={() => setDeleteId(u.id)}>
                            <Trash2 />
                          </Button>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          <div className="mt-4 flex items-center justify-between text-sm text-muted-foreground">
            <span>ทั้งหมด {data.total} รายการ</span>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                disabled={page <= 1}
                onClick={() => setPage((p) => Math.max(1, p - 1))}
              >
                ก่อนหน้า
              </Button>
              <span>
                {page} / {totalPages}
              </span>
              <Button
                variant="outline"
                size="sm"
                disabled={page >= totalPages}
                onClick={() => setPage((p) => p + 1)}
              >
                ถัดไป
              </Button>
            </div>
          </div>
        </>
      )}

      <EditDialog user={editUser} onOpenChange={(o) => !o && setEditUser(null)} onSaved={load} />
      <BalanceDialog user={balanceUser} onOpenChange={(o) => !o && setBalanceUser(null)} onSaved={load} />

      <ConfirmDialog
        open={reset2faId !== null}
        onOpenChange={(o) => !o && setReset2faId(null)}
        title="รีเซ็ต 2FA"
        description="ยืนยันการปิดการยืนยันตัวตน 2 ชั้นของผู้ใช้นี้"
        confirmLabel="รีเซ็ต"
        onConfirm={async () => {
          if (reset2faId !== null) await reset2fa(reset2faId)
        }}
      />
      <ConfirmDialog
        open={deleteId !== null}
        onOpenChange={(o) => !o && setDeleteId(null)}
        title="ลบผู้ใช้"
        description="ยืนยันการลบบัญชีผู้ใช้นี้ การกระทำนี้ไม่สามารถย้อนกลับได้"
        confirmLabel="ลบ"
        destructive
        onConfirm={async () => {
          if (deleteId !== null) await remove(deleteId)
        }}
      />
    </div>
  )
}
