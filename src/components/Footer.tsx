"use client"

import Link from "next/link"
import { Globe, Mail, MessageCircle, Phone } from "lucide-react"

import { useSettings } from "@/context/settings-context"

const navLinks = [
  { href: "/", label: "หน้าแรก" },
  { href: "/products", label: "สินค้า" },
  { href: "/account", label: "บัญชีของฉัน" },
  { href: "/privacy", label: "ความเป็นส่วนตัว" },
  { href: "/terms", label: "ข้อตกลงการใช้งาน" },
]

export default function Footer() {
  const { settings } = useSettings()
  const siteName = settings?.site.name ?? "Zuka"
  const contact = settings?.contact

  const socials = [
    contact?.line && {
      href: contact.line,
      label: "LINE",
      icon: MessageCircle,
    },
    contact?.discord && {
      href: contact.discord,
      label: "Discord",
      icon: MessageCircle,
    },
    contact?.facebook && {
      href: contact.facebook,
      label: "Facebook",
      icon: Globe,
    },
    contact?.email && {
      href: `mailto:${contact.email}`,
      label: contact.email,
      icon: Mail,
    },
    contact?.phone && {
      href: `tel:${contact.phone}`,
      label: contact.phone,
      icon: Phone,
    },
  ].filter(Boolean) as { href: string; label: string; icon: typeof Mail }[]

  return (
    <footer className="mt-auto border-t">
      <div className="mx-auto flex w-full max-w-5xl flex-col gap-4 px-3 py-6 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-2 text-sm">
          <span className="font-semibold tracking-tight">{siteName}</span>
          <span className="text-muted-foreground text-xs">
            &copy; {new Date().getFullYear()} สงวนลิขสิทธิ์
          </span>
        </div>

        <nav className="flex items-center gap-4 text-xs text-muted-foreground">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="transition-colors hover:text-foreground"
            >
              {link.label}
            </Link>
          ))}
        </nav>
      </div>

      {socials.length > 0 && (
        <div className="mx-auto w-full max-w-5xl border-t px-3 py-4">
          <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-xs text-muted-foreground">
            {socials.map((s) => {
              const Icon = s.icon
              const external = s.href.startsWith("http")
              return (
                <a
                  key={s.label}
                  href={s.href}
                  target={external ? "_blank" : undefined}
                  rel={external ? "noopener noreferrer" : undefined}
                  className="flex text-xs items-center gap-1.5 transition-colors hover:text-foreground"
                >
                  <Icon className="size-3.5" />
                  {s.label}
                </a>
              )
            })}
          </div>
        </div>
      )}
    </footer>
  )
}
