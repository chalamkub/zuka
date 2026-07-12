"use client"

import * as React from "react"
import Link from "next/link"
import { ArrowRight } from "lucide-react"

import type { ApiResponse, Announcement } from "@/types"
import api from "@/lib/axios"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"

const STORAGE_KEY = "zuka_announcement_hidden"

function today() {
  return new Date().toISOString().slice(0, 10)
}

export function AnnouncementPopup() {
  const [announcement, setAnnouncement] = React.useState<Announcement | null>(
    null
  )
  const [open, setOpen] = React.useState(false)
  const [dontShow, setDontShow] = React.useState(false)

  React.useEffect(() => {
    let active = true
    api
      .get<ApiResponse<Announcement[]>>("/announcements")
      .then(({ data }) => {
        if (!active) return
        const latest = (data.data ?? [])[0]
        if (!latest) return

        let hidden: string | null = null
        try {
          hidden = window.localStorage.getItem(STORAGE_KEY)
        } catch {
          hidden = null
        }
        if (hidden === `${latest.id}|${today()}`) return

        setAnnouncement(latest)
        setOpen(true)
      })
      .catch(() => {
        /* เงียบไว้ ถ้าโหลดไม่ได้ไม่ต้องแสดง popup */
      })
    return () => {
      active = false
    }
  }, [])

  function handleOpenChange(next: boolean) {
    setOpen(next)
    if (!next && announcement && dontShow) {
      try {
        window.localStorage.setItem(
          STORAGE_KEY,
          `${announcement.id}|${today()}`
        )
      } catch {
        /* ignore */
      }
    }
  }

  if (!announcement) return null

  const hasText = announcement.title || announcement.description

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="gap-0 overflow-hidden p-0 sm:max-w-md">
        <div className="w-full bg-muted">
          {announcement.link ? (
            <Link
              href={announcement.link}
              target={
                announcement.link.startsWith("http") ? "_blank" : undefined
              }
              rel={
                announcement.link.startsWith("http")
                  ? "noopener noreferrer"
                  : undefined
              }
              onClick={() => handleOpenChange(false)}
              className="block"
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={announcement.imageUrl}
                alt={announcement.title || "ประกาศ"}
                className="max-h-[60vh] w-full object-contain"
              />
            </Link>
          ) : (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={announcement.imageUrl}
              alt={announcement.title || "ประกาศ"}
              className="w-full object-contain"
            />
          )}
        </div>

        {hasText && (
          <DialogHeader className="px-5 pt-4">
            {announcement.title && (
              <DialogTitle>{announcement.title}</DialogTitle>
            )}
            {announcement.description && (
              <DialogDescription className="whitespace-pre-line">
                {announcement.description}
              </DialogDescription>
            )}
          </DialogHeader>
        )}

        <DialogFooter className="flex-col gap-3 p-5 pt-4 sm:flex-row sm:items-center sm:justify-between">
          <label className="flex cursor-pointer items-center gap-2 text-sm text-muted-foreground select-none">
            <input
              type="checkbox"
              checked={dontShow}
              onChange={(e) => setDontShow(e.target.checked)}
              className="size-4 rounded border-border accent-primary"
            />
            ไม่แสดงอีกในวันนี้
          </label>

          <div className="flex gap-2">
            {announcement.link && (
              <Button
                render={
                  <Link
                    href={announcement.link}
                    target={
                      announcement.link.startsWith("http")
                        ? "_blank"
                        : undefined
                    }
                    rel={
                      announcement.link.startsWith("http")
                        ? "noopener noreferrer"
                        : undefined
                    }
                  />
                }
                onClick={() => handleOpenChange(false)}
              >
                ดูรายละเอียด
                <ArrowRight data-icon="inline-end" />
              </Button>
            )}
            <Button
              variant={announcement.link ? "outline" : "default"}
              onClick={() => handleOpenChange(false)}
            >
              ปิด
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
