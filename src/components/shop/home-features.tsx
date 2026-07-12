"use client"

import * as React from "react"

import type { ApiResponse, HomeFeature } from "@/types"
import api from "@/lib/axios"
import { getFeatureIcon } from "@/lib/feature-icons"
import { BlurFade } from "@/components/ui/blur-fade"

type FeatureItem = Pick<HomeFeature, "id" | "icon" | "title" | "description">

const DEFAULT_FEATURES: FeatureItem[] = [
  {
    id: -1,
    icon: "Zap",
    title: "รับสินค้าทันที",
    description: "ระบบส่งมอบอัตโนมัติหลังชำระเงิน",
  },
  {
    id: -2,
    icon: "ShieldCheck",
    title: "ปลอดภัย",
    description: "ยืนยันตัวตนและเข้ารหัสข้อมูลทุกขั้นตอน",
  },
  {
    id: -3,
    icon: "Wallet",
    title: "เติมเงินง่าย",
    description: "เติมเครดิตแล้วซื้อได้ทุกเมื่อ",
  },
]

export function HomeFeatures() {
  const [features, setFeatures] = React.useState<HomeFeature[] | null>(null)

  React.useEffect(() => {
    let active = true
    api
      .get<ApiResponse<HomeFeature[]>>("/features")
      .then(({ data }) => {
        if (active) setFeatures(data.data ?? [])
      })
      .catch(() => {
        if (active) setFeatures([])
      })
    return () => {
      active = false
    }
  }, [])

  const items: FeatureItem[] =
    features && features.length > 0 ? features : DEFAULT_FEATURES

  return (
    <section className="flex justify-center px-3 pt-5">
      <div className="w-full max-w-5xl">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          {items.map((feature, i) => {
            const Icon = getFeatureIcon(feature.icon)
            return (
              <BlurFade key={feature.id} delay={0.1 + i * 0.05} inView>
                <div className="flex items-start gap-3 rounded-2xl border p-4">
                  <div className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-muted">
                    <Icon className="size-4.5" />
                  </div>
                  <div>
                    <p className="text-sm font-medium">{feature.title}</p>
                    <p className="text-sm text-muted-foreground">
                      {feature.description}
                    </p>
                  </div>
                </div>
              </BlurFade>
            )
          })}
        </div>
      </div>
    </section>
  )
}
