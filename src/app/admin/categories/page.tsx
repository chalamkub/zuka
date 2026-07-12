"use client"

import * as React from "react"
import { FolderTree, Pencil, Plus, Trash2 } from "lucide-react"

import type { ApiResponse, Category } from "@/types"
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

interface FormState {
  name: string
  description: string
  order: string
  parentId: string
  imageUrl: string
  active: boolean
}

function emptyForm(): FormState {
  return { name: "", description: "", order: "0", parentId: "none", imageUrl: "", active: true }
}

function CategoryDialog({
  open,
  onOpenChange,
  editing,
  categories,
  onSaved,
}: {
  open: boolean
  onOpenChange: (o: boolean) => void
  editing: Category | null
  categories: Category[]
  onSaved: () => void
}) {
  const { success, error } = useToast()
  const [form, setForm] = React.useState<FormState>(emptyForm())
  const [loading, setLoading] = React.useState(false)

  React.useEffect(() => {
    if (open) {
      setForm(
        editing
          ? {
              name: editing.name,
              description: editing.description,
              order: String(editing.order),
              parentId: editing.parentId === null ? "none" : String(editing.parentId),
              imageUrl: editing.imageUrl ?? "",
              active: editing.status === "active",
            }
          : emptyForm()
      )
    }
  }, [open, editing])

  const parentOptions = categories.filter((c) => !editing || c.id !== editing.id)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    try {
      const payload = {
        name: form.name.trim(),
        description: form.description.trim(),
        order: Number(form.order) || 0,
        parentId: form.parentId === "none" ? null : Number(form.parentId),
        imageUrl: form.imageUrl.trim() || null,
        status: form.active ? "active" : "hidden",
      }
      const { data } = editing
        ? await api.patch<ApiResponse>(`/admin/categories/${editing.id}`, payload)
        : await api.post<ApiResponse>("/admin/categories", payload)
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
          <DialogTitle>{editing ? "แก้ไขหมวดหมู่" : "เพิ่มหมวดหมู่"}</DialogTitle>
          <DialogDescription>กรอกรายละเอียดหมวดหมู่สินค้า</DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="c-name">ชื่อหมวดหมู่</Label>
            <Input
              id="c-name"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              required
              disabled={loading}
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="c-desc">คำอธิบาย</Label>
            <Textarea
              id="c-desc"
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              disabled={loading}
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="c-order">ลำดับ</Label>
              <Input
                id="c-order"
                type="number"
                value={form.order}
                onChange={(e) => setForm({ ...form, order: e.target.value })}
                disabled={loading}
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label>หมวดหมู่แม่</Label>
              <Select
                items={{
                  none: "ไม่มี (หมวดหลัก)",
                  ...Object.fromEntries(parentOptions.map((c) => [String(c.id), c.name])),
                }}
                value={form.parentId}
                onValueChange={(v) => setForm({ ...form, parentId: (v as string) ?? "none" })}
              >
                <SelectTrigger className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">ไม่มี (หมวดหลัก)</SelectItem>
                  {parentOptions.map((c) => (
                    <SelectItem key={c.id} value={String(c.id)}>
                      {c.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="c-image">ลิงก์รูปภาพ (ไม่บังคับ)</Label>
            <Input
              id="c-image"
              value={form.imageUrl}
              onChange={(e) => setForm({ ...form, imageUrl: e.target.value })}
              placeholder="https://..."
              disabled={loading}
            />
          </div>
          <div className="flex items-center justify-between">
            <Label htmlFor="c-active">แสดงหมวดหมู่</Label>
            <Switch
              id="c-active"
              checked={form.active}
              onCheckedChange={(v) => setForm({ ...form, active: v })}
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

export default function AdminCategoriesPage() {
  const { success, error } = useToast()
  const [categories, setCategories] = React.useState<Category[]>([])
  const [loading, setLoading] = React.useState(true)
  const [dialogOpen, setDialogOpen] = React.useState(false)
  const [editing, setEditing] = React.useState<Category | null>(null)
  const [deleteId, setDeleteId] = React.useState<number | null>(null)

  const load = React.useCallback(async () => {
    try {
      const { data } = await api.get<ApiResponse<Category[]>>("/admin/categories")
      setCategories(data.data ?? [])
    } catch (err) {
      error(getApiErrorMessage(err))
    } finally {
      setLoading(false)
    }
  }, [error])

  React.useEffect(() => {
    load()
  }, [load])

  const nameById = React.useMemo(
    () => new Map(categories.map((c) => [c.id, c.name])),
    [categories]
  )

  async function remove(id: number) {
    try {
      const { data } = await api.delete<ApiResponse>(`/admin/categories/${id}`)
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
        title="หมวดหมู่"
        description="จัดการหมวดหมู่สินค้า"
        action={
          <Button
            onClick={() => {
              setEditing(null)
              setDialogOpen(true)
            }}
          >
            <Plus />
            เพิ่มหมวดหมู่
          </Button>
        }
      />

      {loading ? (
        <div className="flex justify-center py-16">
          <Spinner variant="ring" className="size-7 text-muted-foreground" />
        </div>
      ) : categories.length === 0 ? (
        <Empty className="border">
          <EmptyHeader>
            <EmptyMedia variant="icon">
              <FolderTree />
            </EmptyMedia>
            <EmptyTitle>ยังไม่มีหมวดหมู่</EmptyTitle>
          </EmptyHeader>
        </Empty>
      ) : (
        <div className="overflow-x-auto rounded-2xl border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>ชื่อ</TableHead>
                <TableHead>หมวดหมู่แม่</TableHead>
                <TableHead>ลำดับ</TableHead>
                <TableHead>สถานะ</TableHead>
                <TableHead className="text-right">จัดการ</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {categories.map((c) => (
                <TableRow key={c.id}>
                  <TableCell className="font-medium">{c.name}</TableCell>
                  <TableCell className="text-muted-foreground">
                    {c.parentId === null ? "—" : nameById.get(c.parentId) ?? "—"}
                  </TableCell>
                  <TableCell>{c.order}</TableCell>
                  <TableCell>
                    <Badge variant={c.status === "active" ? "secondary" : "outline"}>
                      {c.status === "active" ? "แสดง" : "ซ่อน"}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-1">
                      <Button
                        variant="ghost"
                        size="icon-sm"
                        aria-label="แก้ไข"
                        onClick={() => {
                          setEditing(c)
                          setDialogOpen(true)
                        }}
                      >
                        <Pencil />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon-sm"
                        aria-label="ลบ"
                        onClick={() => setDeleteId(c.id)}
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

      <CategoryDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        editing={editing}
        categories={categories}
        onSaved={load}
      />

      <ConfirmDialog
        open={deleteId !== null}
        onOpenChange={(o) => !o && setDeleteId(null)}
        title="ลบหมวดหมู่"
        description="ยืนยันการลบหมวดหมู่นี้"
        confirmLabel="ลบ"
        destructive
        onConfirm={async () => {
          if (deleteId !== null) await remove(deleteId)
        }}
      />
    </div>
  )
}
