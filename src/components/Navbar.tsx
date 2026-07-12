"use client";

import * as React from "react";
import Link from "next/link";
import { useTheme } from "next-themes";
import {
  ChevronDown,
  History,
  LogOut,
  Moon,
  Package,
  ShieldCheck,
  Sun,
  User,
  Wallet,
} from "lucide-react";

import { useAuth } from "@/context/auth-context";
import { useSettings } from "@/context/settings-context";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Spinner } from "@/components/kibo-ui/spinner";

function ModeToggle() {
  const { setTheme, resolvedTheme } = useTheme();
  const [mounted, setMounted] = React.useState(false);

  React.useEffect(() => setMounted(true), []);

  const isDark = resolvedTheme === "dark";

  return (
    <Button
      variant="ghost"
      size="icon-sm"
      aria-label="สลับธีม"
      onClick={() => setTheme(isDark ? "light" : "dark")}
    >
      {mounted && isDark ? <Sun /> : <Moon />}
    </Button>
  );
}

const links = [
  { href: "/", label: "หน้าแรก" },
  { href: "/products", label: "สินค้า" },
  { href: "/topup", label: "เติมเงิน" },
];

function formatTHB(amount: number) {
  return new Intl.NumberFormat("th-TH", {
    style: "currency",
    currency: "THB",
    maximumFractionDigits: 2,
  }).format(amount);
}

function AuthArea() {
  const { status, user, isAdmin, signOut } = useAuth();

  if (status === "loading") {
    return <Spinner variant="ring" className="size-4 text-muted-foreground" />;
  }

  if (status === "unauthenticated" || !user) {
    return (
      <div className="flex items-center gap-1">
        <Button variant="ghost" size="sm" render={<Link href="/signin" />}>
          เข้าสู่ระบบ
        </Button>
        <Button size="sm" render={<Link href="/signup" />}>
          สมัครสมาชิก
        </Button>
      </div>
    );
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        render={<Button variant="ghost" size="sm" className="gap-1.5 pl-1.5" />}
      >
        <span className="flex size-6 items-center justify-center overflow-hidden rounded-full bg-muted">
          {user.profileImage ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={user.profileImage}
              alt={user.username}
              className="size-full object-cover"
            />
          ) : (
            <User className="size-3.5" />
          )}
        </span>
        <span className="max-w-28 truncate">{user.username}</span>
        <ChevronDown className="size-3.5 text-muted-foreground" />
      </DropdownMenuTrigger>

      <DropdownMenuContent>
        <DropdownMenuLabel>
          <span className="block truncate font-medium text-foreground">
            {user.username}
          </span>
          <span className="block truncate">{user.email}</span>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />

        <DropdownMenuItem render={<Link href="/topup" />}>
          <Wallet />
          <span className="flex-1">เติมเงิน</span>
          <span className="text-xs font-medium text-muted-foreground">
            {formatTHB(user.balance)}
          </span>
        </DropdownMenuItem>
        <DropdownMenuItem render={<Link href="/account" />}>
          <User />
          บัญชีของฉัน
        </DropdownMenuItem>
        <DropdownMenuItem render={<Link href="/account/orders" />}>
          <Package />
          ประวัติการสั่งซื้อ
        </DropdownMenuItem>
        <DropdownMenuItem render={<Link href="/account/topups" />}>
          <History />
          ประวัติการเติมเงิน
        </DropdownMenuItem>

        {isAdmin && (
          <>
            <DropdownMenuSeparator />
            <DropdownMenuItem render={<Link href="/admin" />}>
              <ShieldCheck />
              แผงผู้ดูแล
            </DropdownMenuItem>
          </>
        )}

        <DropdownMenuSeparator />
        <DropdownMenuItem variant="destructive" onClick={signOut}>
          <LogOut />
          ออกจากระบบ
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

export default function Navbar() {
  const { settings } = useSettings();
  const siteName = settings?.site.name ?? "Zuka";

  return (
    <header className="sticky top-0 z-50 border-b bg-background/80 backdrop-blur">
      <div className="mx-auto flex h-14 w-full max-w-5xl items-center justify-between gap-4 px-3">
        <div className="flex items-center gap-1">
          {settings?.site.logoUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={settings.site.logoUrl}
              alt={siteName}
              className="size-8 object-contain"
            />
          ) : (
            <Package className="size-8 text-primary" />
          )}
          <Link href="/" className="mr-2 text-lg font-semibold tracking-tight">
            {siteName}
          </Link>
          <nav className="hidden items-center gap-1 sm:flex">
            {links.map((link) => (
              <Button
                key={link.href}
                variant="ghost"
                size="sm"
                render={<Link href={link.href} />}
              >
                {link.label}
              </Button>
            ))}
          </nav>
        </div>

        <div className="flex items-center gap-2">
          <ModeToggle />
          <AuthArea />
        </div>
      </div>
    </header>
  );
}
