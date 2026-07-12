"use client"

import Link from "next/link"
import { ArrowRight, Wallet } from "lucide-react"

import { useAuth } from "@/context/auth-context"
import { useSettings } from "@/context/settings-context"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { BlurFade } from "@/components/ui/blur-fade"
import { HeroCarousel } from "@/components/shop/hero-carousel"
import { HomeFeatures } from "@/components/shop/home-features"
import { ProductList } from "@/components/shop/product-list"

function Hero() {
  const { status, user } = useAuth()
  const { settings } = useSettings()
  const siteName = settings?.site.name ?? "Zuka"
  const siteDescription =
    settings?.site.description?.trim() ||
    "เลือกซื้อสินค้าที่คุณต้องการ ชำระเงินด้วยเครดิตในบัญชี และรับสินค้าได้ทันทีอย่างปลอดภัย"

  return (
    <section className="flex justify-center px-3 py-14 sm:py-20">
      <div className="w-full max-w-5xl">
        <div className="flex flex-col items-center text-center">
          <BlurFade delay={0.05} inView>
            <Badge variant="secondary">ร้านค้าออนไลน์สินค้าดิจิทัล</Badge>
          </BlurFade>

          <BlurFade delay={0.15} inView>
            <h1 className="mt-5 max-w-2xl text-3xl font-semibold tracking-tight sm:text-4xl">
              {status === "authenticated" && user
                ? `สวัสดี ${user.username} ยินดีต้อนรับสู่ ${siteName}`
                : `ช้อปสินค้าดิจิทัล ง่าย รวดเร็ว กับ ${siteName}`}
            </h1>
          </BlurFade>

          <BlurFade delay={0.25} inView>
            <p className="mt-4 max-w-xl text-xs text-muted-foreground sm:text-sm">
              {siteDescription}
            </p>
          </BlurFade>

          <BlurFade delay={0.35} inView>
            <div className="mt-7 flex flex-wrap items-center justify-center gap-2">
              <Button size="lg" render={<Link href="/products" />}>
                เลือกซื้อสินค้า
                <ArrowRight data-icon="inline-end" />
              </Button>
              {status === "authenticated" && user ? (
                <Button size="lg" variant="outline" render={<Link href="/topup" />}>
                  <Wallet />
                  เติมเงิน
                  {/* {formatTHB(user.balance)} */}
                </Button>
              ) : (
                <Button size="lg" variant="outline" render={<Link href="/signup" />}>
                  สมัครสมาชิกฟรี
                </Button>
              )}
            </div>
          </BlurFade>
        </div>
      </div>
    </section>
  )
}

export default function Page() {
  return (
    <main className="min-h-screen">
      <Hero />

      <section className="flex justify-center px-3">
        <div className="w-full max-w-5xl">
          <HeroCarousel />
        </div>
      </section>

      <HomeFeatures />

      <section className="flex justify-center px-3 py-5">
        <div className="w-full max-w-5xl">
          <div className="mb-6 flex items-end justify-between gap-4">
            <div>
              <h2 className="text-base font-semibold tracking-tight">สินค้าแนะนำ</h2>
              <p className="text-xs text-muted-foreground">
                สินค้าล่าสุดจากร้าน Zuka
              </p>
            </div>
            <Button variant="outline" size="sm" render={<Link href="/products" />}>
              ดูทั้งหมด
              <ArrowRight data-icon="inline-end" />
            </Button>
          </div>

          <ProductList />
        </div>
      </section>
    </main>
  )
}
