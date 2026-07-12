"use client"

import * as React from "react"
import { ImageOff, Save } from "lucide-react"

import type { ApiResponse, PublicUser } from "@/types"
import api, { getApiErrorMessage } from "@/lib/axios"
import { useAuth } from "@/context/auth-context"
import { useToast } from "@/components/admin/toast"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Spinner } from "@/components/kibo-ui/spinner"

export function ProfileDialog({
  open,
  onOpenChange,
}: {
  open: boolean
  onOpenChange: (o: boolean) => void
}) {
  const { user, refresh } = useAuth()
  const toast = useToast()

  const [profileImage, setProfileImage] = React.useState("")
  const [badge, setBadge] = React.useState("")
  const [saving, setSaving] = React.useState(false)

  React.useEffect(() => {
    if (open) {
      setProfileImage(user?.profileImage ?? "")
      setBadge(user?.badge ?? "")
    }
  }, [open, user])

  const dirty =
    profileImage !== (user?.profileImage ?? "") ||
    badge !== (user?.badge ?? "")

  async function handleSave(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true)
    try {
      const { data } = await api.patch<ApiResponse<PublicUser>>("/profile", {
        profileImage: profileImage.trim() === "" ? null : profileImage.trim(),
        badge: badge.trim() === "" ? null : badge.trim(),
      })
      if (data.data) {
        await refresh()
        toast.success("อัปเดตโปรไฟล์สำเร็จ")
        onOpenChange(false)
      }
    } catch (err) {
      toast.error(getApiErrorMessage(err))
    } finally {
      setSaving(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>แก้ไขโปรไฟล์</DialogTitle>
          <DialogDescription>
            ปรับแต่งรูปโปรไฟล์และป้ายชื่อของคุณ
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSave} className="flex flex-col gap-4">
          <div className="flex items-center gap-4">
            <div className="flex size-16 shrink-0 items-center justify-center overflow-hidden rounded-full border bg-muted">
              {profileImage.trim() ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={profileImage.trim()}
                  alt={user?.username ?? ""}
                  className="size-full object-cover"
                />
              ) : (
                <ImageOff className="size-5 text-muted-foreground" />
              )}
            </div>
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-medium">{user?.username}</p>
              <p className="truncate text-xs text-muted-foreground">
                {user?.email}
              </p>
            </div>
          </div>

          <div className="flex flex-col gap-1.5">
            <Label htmlFor="profileImage">ลิงก์รูปโปรไฟล์</Label>
            <Input
              id="profileImage"
              type="url"
              inputMode="url"
              value={profileImage}
              onChange={(e) => setProfileImage(e.target.value)}
              placeholder="https://..."
              autoComplete="off"
              disabled={saving}
            />
            <p className="text-xs text-muted-foreground">
              เว้นว่างไว้เพื่อลบรูปโปรไฟล์
            </p>
          </div>

          <div className="flex flex-col gap-1.5">
            <Label htmlFor="badge">ป้ายชื่อ (badge)</Label>
            <Input
              id="badge"
              value={badge}
              onChange={(e) => setBadge(e.target.value)}
              placeholder="เช่น VIP"
              maxLength={30}
              autoComplete="off"
              disabled={saving}
            />
          </div>

          <DialogFooter>
            <Button type="submit" disabled={saving || !dirty}>
              {saving ? (
                <Spinner variant="ring" className="size-4" />
              ) : (
                <Save />
              )}
              บันทึก
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
