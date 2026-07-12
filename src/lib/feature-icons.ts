import {
  BadgeCheck,
  Clock,
  CreditCard,
  Gift,
  Headphones,
  Heart,
  Lock,
  RefreshCw,
  Rocket,
  ShieldCheck,
  Sparkles,
  Star,
  ThumbsUp,
  Truck,
  Wallet,
  Zap,
  type LucideIcon,
} from "lucide-react"

/** ชุดไอคอนที่แอดมินเลือกได้สำหรับจุดเด่นหน้าแรก */
export const FEATURE_ICONS: Record<string, LucideIcon> = {
  Zap,
  ShieldCheck,
  Wallet,
  Star,
  Truck,
  Clock,
  Gift,
  BadgeCheck,
  Headphones,
  Sparkles,
  ThumbsUp,
  Lock,
  Rocket,
  Heart,
  CreditCard,
  RefreshCw,
}

export const FEATURE_ICON_NAMES = Object.keys(FEATURE_ICONS)

export function getFeatureIcon(name: string): LucideIcon {
  return FEATURE_ICONS[name] ?? Sparkles
}
