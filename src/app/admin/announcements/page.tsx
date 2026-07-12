"use client"

import * as React from "react"
import { ExternalLink, Megaphone, ImageOff, Pencil, Plus, Trash2 } from "lucide-react"

import type { ApiResponse, Announcement } from "@/types"
import api, { getApiErrorMessage } from "@/lib/axios"
import { AdminHeader } from "@/components/admin/admin-header"
import { useToast } from "@/components/admin/toast"
import { ConfirmDialog } from "@/components/admin/confirm-dialog"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
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
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty"

interface AnnouncementForm {
  imageUrl: string
  title: string
  description: string
  link: string
  active: boolean
}

const emptyForm: AnnouncementForm = {
  imageUrl: "",
  title: "",
  description: "",
  link: "",
  active: true,
}

function AnnouncementDialog({
  open,
  onOpenChange,
  editing,
  onSaved,
}: {
  open: boolean
  onOpenChange: (o: boolean) => void
  editing: Announcement | null
  onSaved: () => void
}) {
  const { success, error } = useToast()
  const [form, setForm] = React.useState<AnnouncementForm>(emptyForm)
  const [loading, setLoading] = React.useState(false)

  React.useEffect(() => {
    if (open) {
      setForm(
        editing
          ? {
              imageUrl: editing.imageUrl,
              title: editing.title,
              description: editing.description,
              link: editing.link ?? "",
              active: editing.status === "active",
            }
          : emptyForm
      )
    }
  }, [open, editing])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    try {
      const payload = {
        imageUrl: form.imageUrl.trim(),
        title: form.title.trim(),
        description: form.description.trim(),
        link: form.link.trim() === "" ? null : form.link.trim(),
        status: form.active ? "active" : "hidden",
      }
      const { data } = editing
        ? await api.patch<ApiResponse>(
            `/admin/announcements/${editing.id}`,
            payload
          )
        : await api.post<ApiResponse>("/admin/announcements", payload)
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
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{editing ? "แก้ไขประกาศ" : "เพิ่มประกาศ"}</DialogTitle>
          <DialogDescription>
            รูปประกาศจะเด้งขึ้นให้ผู้ใช้เห็นตอนเปิดเว็บ
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="a-image">ลิงก์รูปภาพ</Label>
            <Input
              id="a-image"
              type="url"
              value={form.imageUrl}
              onChange={(e) => setForm({ ...form, imageUrl: e.target.value })}
              placeholder="https://..."
              required
              disabled={loading}
            />
          </div>

          {form.imageUrl.trim() && (
            <div className="max-h-56 overflow-hidden rounded-xl border bg-muted">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={form.imageUrl.trim()}
                alt="preview"
                className="max-h-56 w-full object-contain"
              />
            </div>
          )}

          <div className="flex flex-col gap-1.5">
            <Label htmlFor="a-title">หัวข้อ (ไม่บังคับ)</Label>
            <Input
              id="a-title"
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
              disabled={loading}
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="a-desc">คำอธิบาย (ไม่บังคับ)</Label>
            <Textarea
              id="a-desc"
              value={form.description}
              onChange={(e) =>
                setForm({ ...form, description: e.target.value })
              }
              disabled={loading}
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="a-link">ลิงก์ปลายทาง (ไม่บังคับ)</Label>
            <Input
              id="a-link"
              type="url"
              value={form.link}
              onChange={(e) => setForm({ ...form, link: e.target.value })}
              placeholder="https://..."
              disabled={loading}
            />
          </div>
          <div className="flex items-center justify-between">
            <Label htmlFor="a-active">เปิดใช้งาน</Label>
            <Switch
              id="a-active"
              checked={form.active}
              onCheckedChange={(v) => setForm({ ...form, active: v })}
              disabled={loading}
            />
          </div>
          <DialogFooter>
            <Button
              type="submit"
              disabled={loading || form.imageUrl.trim() === ""}
            >
              {loading && <Spinner variant="ring" className="size-4" />}
              บันทึก
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}

export default function AdminAnnouncementsPage() {
  const { success, error } = useToast()
  const [items, setItems] = React.useState<Announcement[]>([])
  const [loading, setLoading] = React.useState(true)
  const [dialogOpen, setDialogOpen] = React.useState(false)
  const [editing, setEditing] = React.useState<Announcement | null>(null)
  const [deleteId, setDeleteId] = React.useState<number | null>(null)

  const load = React.useCallback(async () => {
    try {
      const { data } = await api.get<ApiResponse<Announcement[]>>(
        "/admin/announcements"
      )
      setItems(data.data ?? [])
    } catch (err) {
      error(getApiErrorMessage(err))
    } finally {
      setLoading(false)
    }
  }, [error])

  React.useEffect(() => {
    load()
  }, [load])

  async function remove(id: number) {
    try {
      const { data } = await api.delete<ApiResponse>(
        `/admin/announcements/${id}`
      )
      success(data.message)
      load()
    } catch (err) {
      error(getApiErrorMessage(err))
      throw err
    }
  }

  const activeCount = items.filter((a) => a.status === "active").length

  return (
    <div>
      <AdminHeader
        title="ประกาศ"
        description="จัดการรูปประกาศที่เด้งขึ้นตอนผู้ใช้เปิดเว็บ"
        action={
          <Button
            onClick={() => {
              setEditing(null)
              setDialogOpen(true)
            }}
          >
            <Plus />
            เพิ่มประกาศ
          </Button>
        }
      />

      {activeCount > 1 && (
        <p className="mb-4 text-sm text-muted-foreground">
          มีประกาศที่เปิดใช้งาน {activeCount} รายการ — ระบบจะแสดงรายการล่าสุดเพียงอันเดียว
        </p>
      )}

      {loading ? (
        <div className="flex justify-center py-16">
          <Spinner variant="ring" className="size-7 text-muted-foreground" />
        </div>
      ) : items.length === 0 ? (
        <Empty className="border">
          <EmptyHeader>
            <EmptyMedia variant="icon">
              <Megaphone />
            </EmptyMedia>
            <EmptyTitle>ยังไม่มีประกาศ</EmptyTitle>
            <EmptyDescription>
              เพิ่มรูปประกาศเพื่อแสดงเป็น popup ตอนผู้ใช้เปิดเว็บ
            </EmptyDescription>
          </EmptyHeader>
        </Empty>
      ) : (
        <div className="overflow-x-auto rounded-2xl border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-24">รูป</TableHead>
                <TableHead>หัวข้อ</TableHead>
                <TableHead>สถานะ</TableHead>
                <TableHead className="text-right">จัดการ</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {items.map((a) => (
                <TableRow key={a.id}>
                  <TableCell>
                    <div className="h-10 w-16 overflow-hidden rounded-md border bg-muted">
                      {a.imageUrl ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={a.imageUrl}
                          alt={a.title || "ประกาศ"}
                          className="size-full object-cover"
                        />
                      ) : (
                        <div className="flex size-full items-center justify-center">
                          <ImageOff className="size-4 text-muted-foreground" />
                        </div>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-col">
                      <span className="font-medium">{a.title || "—"}</span>
                      {a.link && (
                        <span className="flex items-center gap-1 text-xs text-muted-foreground">
                          <ExternalLink className="size-3" />
                          ลิงก์
                        </span>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant={a.status === "active" ? "secondary" : "outline"}
                    >
                      {a.status === "active" ? "เปิด" : "ปิด"}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-1">
                      <Button
                        variant="ghost"
                        size="icon-sm"
                        aria-label="แก้ไข"
                        onClick={() => {
                          setEditing(a)
                          setDialogOpen(true)
                        }}
                      >
                        <Pencil />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon-sm"
                        aria-label="ลบ"
                        onClick={() => setDeleteId(a.id)}
                      >
                        <Trash2 />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}

      <AnnouncementDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        editing={editing}
        onSaved={load}
      />

      <ConfirmDialog
        open={deleteId !== null}
        onOpenChange={(o) => !o && setDeleteId(null)}
        title="ลบประกาศ"
        description="ยืนยันการลบประกาศนี้"
        confirmLabel="ลบ"
        destructive
        onConfirm={async () => {
          if (deleteId !== null) await remove(deleteId)
        }}
      />
    </div>
  )
}
