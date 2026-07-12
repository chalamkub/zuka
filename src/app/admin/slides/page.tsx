"use client"

import * as React from "react"
import { ExternalLink, Images, ImageOff, Pencil, Plus, Trash2 } from "lucide-react"

import type { ApiResponse, ImageSlide } from "@/types"
import api, { getApiErrorMessage } from "@/lib/axios"
import { AdminHeader } from "@/components/admin/admin-header"
import { useToast } from "@/components/admin/toast"
import { ConfirmDialog } from "@/components/admin/confirm-dialog"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
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

interface SlideForm {
  imageUrl: string
  title: string
  subtitle: string
  link: string
  order: string
  active: boolean
}

const emptyForm: SlideForm = {
  imageUrl: "",
  title: "",
  subtitle: "",
  link: "",
  order: "0",
  active: true,
}

function SlideDialog({
  open,
  onOpenChange,
  editing,
  onSaved,
}: {
  open: boolean
  onOpenChange: (o: boolean) => void
  editing: ImageSlide | null
  onSaved: () => void
}) {
  const { success, error } = useToast()
  const [form, setForm] = React.useState<SlideForm>(emptyForm)
  const [loading, setLoading] = React.useState(false)

  React.useEffect(() => {
    if (open) {
      setForm(
        editing
          ? {
              imageUrl: editing.imageUrl,
              title: editing.title,
              subtitle: editing.subtitle,
              link: editing.link ?? "",
              order: String(editing.order),
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
        subtitle: form.subtitle.trim(),
        link: form.link.trim() === "" ? null : form.link.trim(),
        order: Number(form.order) || 0,
        status: form.active ? "active" : "hidden",
      }
      const { data } = editing
        ? await api.patch<ApiResponse>(`/admin/slides/${editing.id}`, payload)
        : await api.post<ApiResponse>("/admin/slides", payload)
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
          <DialogTitle>{editing ? "แก้ไขสไลด์" : "เพิ่มสไลด์"}</DialogTitle>
          <DialogDescription>
            รูปภาพจะแสดงเป็นแบนเนอร์สไลด์ที่หน้าแรก
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="s-image">ลิงก์รูปภาพ</Label>
            <Input
              id="s-image"
              type="url"
              value={form.imageUrl}
              onChange={(e) => setForm({ ...form, imageUrl: e.target.value })}
              placeholder="https://..."
              required
              disabled={loading}
            />
          </div>

          {form.imageUrl.trim() && (
            <div className="aspect-[16/6] overflow-hidden rounded-xl border bg-muted">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={form.imageUrl.trim()}
                alt="preview"
                className="size-full object-cover"
              />
            </div>
          )}

          <div className="flex flex-col gap-1.5">
            <Label htmlFor="s-title">หัวข้อ (ไม่บังคับ)</Label>
            <Input
              id="s-title"
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
              disabled={loading}
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="s-subtitle">คำอธิบายย่อย (ไม่บังคับ)</Label>
            <Input
              id="s-subtitle"
              value={form.subtitle}
              onChange={(e) => setForm({ ...form, subtitle: e.target.value })}
              disabled={loading}
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="s-link">ลิงก์ปลายทาง (ไม่บังคับ)</Label>
              <Input
                id="s-link"
                type="url"
                value={form.link}
                onChange={(e) => setForm({ ...form, link: e.target.value })}
                placeholder="https://..."
                disabled={loading}
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="s-order">ลำดับ</Label>
              <Input
                id="s-order"
                type="number"
                value={form.order}
                onChange={(e) => setForm({ ...form, order: e.target.value })}
                disabled={loading}
              />
            </div>
          </div>
          <div className="flex items-center justify-between">
            <Label htmlFor="s-active">แสดงสไลด์</Label>
            <Switch
              id="s-active"
              checked={form.active}
              onCheckedChange={(v) => setForm({ ...form, active: v })}
              disabled={loading}
            />
          </div>
          <DialogFooter>
            <Button type="submit" disabled={loading || form.imageUrl.trim() === ""}>
              {loading && <Spinner variant="ring" className="size-4" />}
              บันทึก
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}

export default function AdminSlidesPage() {
  const { success, error } = useToast()
  const [slides, setSlides] = React.useState<ImageSlide[]>([])
  const [loading, setLoading] = React.useState(true)
  const [dialogOpen, setDialogOpen] = React.useState(false)
  const [editing, setEditing] = React.useState<ImageSlide | null>(null)
  const [deleteId, setDeleteId] = React.useState<number | null>(null)

  const load = React.useCallback(async () => {
    try {
      const { data } = await api.get<ApiResponse<ImageSlide[]>>("/admin/slides")
      setSlides(data.data ?? [])
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
      const { data } = await api.delete<ApiResponse>(`/admin/slides/${id}`)
      success(data.message)
      load()
    } catch (err) {
      error(getApiErrorMessage(err))
      throw err
    }
  }

  return (
    <div>
      <AdminHeader
        title="สไลด์"
        description="จัดการรูปแบนเนอร์สไลด์ที่หน้าแรก"
        action={
          <Button
            onClick={() => {
              setEditing(null)
              setDialogOpen(true)
            }}
          >
            <Plus />
            เพิ่มสไลด์
          </Button>
        }
      />

      {loading ? (
        <div className="flex justify-center py-16">
          <Spinner variant="ring" className="size-7 text-muted-foreground" />
        </div>
      ) : slides.length === 0 ? (
        <Empty className="border">
          <EmptyHeader>
            <EmptyMedia variant="icon">
              <Images />
            </EmptyMedia>
            <EmptyTitle>ยังไม่มีสไลด์</EmptyTitle>
            <EmptyDescription>
              เพิ่มรูปแบนเนอร์เพื่อแสดงเป็นสไลด์ที่หน้าแรก
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
                <TableHead>ลำดับ</TableHead>
                <TableHead>สถานะ</TableHead>
                <TableHead className="text-right">จัดการ</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {slides.map((s) => (
                <TableRow key={s.id}>
                  <TableCell>
                    <div className="h-10 w-16 overflow-hidden rounded-md border bg-muted">
                      {s.imageUrl ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={s.imageUrl}
                          alt={s.title || "slide"}
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
                      <span className="font-medium">{s.title || "—"}</span>
                      {s.link && (
                        <span className="flex items-center gap-1 text-xs text-muted-foreground">
                          <ExternalLink className="size-3" />
                          ลิงก์
                        </span>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>{s.order}</TableCell>
                  <TableCell>
                    <Badge variant={s.status === "active" ? "secondary" : "outline"}>
                      {s.status === "active" ? "แสดง" : "ซ่อน"}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-1">
                      <Button
                        variant="ghost"
                        size="icon-sm"
                        aria-label="แก้ไข"
                        onClick={() => {
                          setEditing(s)
                          setDialogOpen(true)
                        }}
                      >
                        <Pencil />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon-sm"
                        aria-label="ลบ"
                        onClick={() => setDeleteId(s.id)}
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

      <SlideDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        editing={editing}
        onSaved={load}
      />

      <ConfirmDialog
        open={deleteId !== null}
        onOpenChange={(o) => !o && setDeleteId(null)}
        title="ลบสไลด์"
        description="ยืนยันการลบสไลด์นี้"
        confirmLabel="ลบ"
        destructive
        onConfirm={async () => {
          if (deleteId !== null) await remove(deleteId)
        }}
      />
    </div>
  )
}
