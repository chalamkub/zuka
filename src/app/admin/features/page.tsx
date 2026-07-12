"use client"

import * as React from "react"
import { Pencil, Plus, Sparkles, Trash2 } from "lucide-react"

import type { ApiResponse, HomeFeature } from "@/types"
import api, { getApiErrorMessage } from "@/lib/axios"
import {
  FEATURE_ICON_NAMES,
  getFeatureIcon,
} from "@/lib/feature-icons"
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
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty"

interface FeatureForm {
  icon: string
  title: string
  description: string
  order: string
  active: boolean
}

const emptyForm: FeatureForm = {
  icon: FEATURE_ICON_NAMES[0],
  title: "",
  description: "",
  order: "0",
  active: true,
}

const ICON_ITEMS = Object.fromEntries(
  FEATURE_ICON_NAMES.map((name) => [name, name])
)

function FeatureDialog({
  open,
  onOpenChange,
  editing,
  onSaved,
}: {
  open: boolean
  onOpenChange: (o: boolean) => void
  editing: HomeFeature | null
  onSaved: () => void
}) {
  const { success, error } = useToast()
  const [form, setForm] = React.useState<FeatureForm>(emptyForm)
  const [loading, setLoading] = React.useState(false)

  React.useEffect(() => {
    if (open) {
      setForm(
        editing
          ? {
              icon: editing.icon || FEATURE_ICON_NAMES[0],
              title: editing.title,
              description: editing.description,
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
        icon: form.icon,
        title: form.title.trim(),
        description: form.description.trim(),
        order: Number(form.order) || 0,
        status: form.active ? "active" : "hidden",
      }
      const { data } = editing
        ? await api.patch<ApiResponse>(`/admin/features/${editing.id}`, payload)
        : await api.post<ApiResponse>("/admin/features", payload)
      success(data.message)
      onOpenChange(false)
      onSaved()
    } catch (err) {
      error(getApiErrorMessage(err))
    } finally {
      setLoading(false)
    }
  }

  const PreviewIcon = getFeatureIcon(form.icon)

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{editing ? "แก้ไขจุดเด่น" : "เพิ่มจุดเด่น"}</DialogTitle>
          <DialogDescription>
            จุดเด่นจะแสดงเป็นแถวการ์ดที่หน้าแรก
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div className="flex items-end gap-3">
            <div className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-muted">
              <PreviewIcon className="size-5" />
            </div>
            <div className="flex flex-1 flex-col gap-1.5">
              <Label>ไอคอน</Label>
              <Select
                items={ICON_ITEMS}
                value={form.icon}
                onValueChange={(v) =>
                  setForm({ ...form, icon: (v as string) ?? form.icon })
                }
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="เลือกไอคอน" />
                </SelectTrigger>
                <SelectContent>
                  {FEATURE_ICON_NAMES.map((name) => {
                    const Icon = getFeatureIcon(name)
                    return (
                      <SelectItem key={name} value={name}>
                        <Icon className="size-4" />
                        {name}
                      </SelectItem>
                    )
                  })}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="flex flex-col gap-1.5">
            <Label htmlFor="f-title">หัวข้อ</Label>
            <Input
              id="f-title"
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
              placeholder="เช่น รับสินค้าทันที"
              required
              disabled={loading}
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="f-desc">คำอธิบาย</Label>
            <Textarea
              id="f-desc"
              value={form.description}
              onChange={(e) =>
                setForm({ ...form, description: e.target.value })
              }
              placeholder="เช่น ระบบส่งมอบอัตโนมัติหลังชำระเงิน"
              disabled={loading}
            />
          </div>
          <div className="grid grid-cols-2 items-center gap-3">
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="f-order">ลำดับ</Label>
              <Input
                id="f-order"
                type="number"
                value={form.order}
                onChange={(e) => setForm({ ...form, order: e.target.value })}
                disabled={loading}
              />
            </div>
            <div className="flex items-center justify-between pt-6">
              <Label htmlFor="f-active">แสดง</Label>
              <Switch
                id="f-active"
                checked={form.active}
                onCheckedChange={(v) => setForm({ ...form, active: v })}
                disabled={loading}
              />
            </div>
          </div>
          <DialogFooter>
            <Button type="submit" disabled={loading || form.title.trim() === ""}>
              {loading && <Spinner variant="ring" className="size-4" />}
              บันทึก
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}

export default function AdminFeaturesPage() {
  const { success, error } = useToast()
  const [items, setItems] = React.useState<HomeFeature[]>([])
  const [loading, setLoading] = React.useState(true)
  const [dialogOpen, setDialogOpen] = React.useState(false)
  const [editing, setEditing] = React.useState<HomeFeature | null>(null)
  const [deleteId, setDeleteId] = React.useState<number | null>(null)

  const load = React.useCallback(async () => {
    try {
      const { data } = await api.get<ApiResponse<HomeFeature[]>>(
        "/admin/features"
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
      const { data } = await api.delete<ApiResponse>(`/admin/features/${id}`)
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
        title="จุดเด่น"
        description="จัดการการ์ดจุดเด่นที่แสดงบนหน้าแรก"
        action={
          <Button
            onClick={() => {
              setEditing(null)
              setDialogOpen(true)
            }}
          >
            <Plus />
            เพิ่มจุดเด่น
          </Button>
        }
      />

      {loading ? (
        <div className="flex justify-center py-16">
          <Spinner variant="ring" className="size-7 text-muted-foreground" />
        </div>
      ) : items.length === 0 ? (
        <Empty className="border">
          <EmptyHeader>
            <EmptyMedia variant="icon">
              <Sparkles />
            </EmptyMedia>
            <EmptyTitle>ยังไม่มีจุดเด่น</EmptyTitle>
            <EmptyDescription>
              หากไม่มีจุดเด่น หน้าแรกจะแสดงชุดค่าเริ่มต้น
            </EmptyDescription>
          </EmptyHeader>
        </Empty>
      ) : (
        <div className="overflow-x-auto rounded-2xl border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-14">ไอคอน</TableHead>
                <TableHead>หัวข้อ</TableHead>
                <TableHead>ลำดับ</TableHead>
                <TableHead>สถานะ</TableHead>
                <TableHead className="text-right">จัดการ</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {items.map((f) => {
                const Icon = getFeatureIcon(f.icon)
                return (
                  <TableRow key={f.id}>
                    <TableCell>
                      <div className="flex size-9 items-center justify-center rounded-xl bg-muted">
                        <Icon className="size-4.5" />
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-col">
                        <span className="font-medium">{f.title}</span>
                        {f.description && (
                          <span className="line-clamp-1 text-xs text-muted-foreground">
                            {f.description}
                          </span>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>{f.order}</TableCell>
                    <TableCell>
                      <Badge
                        variant={f.status === "active" ? "secondary" : "outline"}
                      >
                        {f.status === "active" ? "แสดง" : "ซ่อน"}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-1">
                        <Button
                          variant="ghost"
                          size="icon-sm"
                          aria-label="แก้ไข"
                          onClick={() => {
                            setEditing(f)
                            setDialogOpen(true)
                          }}
                        >
                          <Pencil />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon-sm"
                          aria-label="ลบ"
                          onClick={() => setDeleteId(f.id)}
                        >
                          <Trash2 />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                )
              })}
            </TableBody>
          </Table>
        </div>
      )}

      <FeatureDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        editing={editing}
        onSaved={load}
      />

      <ConfirmDialog
        open={deleteId !== null}
        onOpenChange={(o) => !o && setDeleteId(null)}
        title="ลบจุดเด่น"
        description="ยืนยันการลบจุดเด่นนี้"
        confirmLabel="ลบ"
        destructive
        onConfirm={async () => {
          if (deleteId !== null) await remove(deleteId)
        }}
      />
    </div>
  )
}
