export type Role = "user" | "admin"

export interface PublicUser {
  id: number
  username: string
  email: string
  role: Role
  balance: number
  status: "active" | "banned"
  profileImage: string | null
  badge: string | null
  twoFactorEnabled: boolean
  createdAt: string
  updatedAt: string
}

export interface ApiResponse<T = unknown> {
  success: boolean
  message: string
  data?: T
}

export interface AuthResult {
  token: string
  user: PublicUser
}

export interface Category {
  id: number
  name: string
  slug: string
  description: string
  imageUrl: string | null
  parentId: number | null
  order: number
  status: "active" | "hidden"
  children?: Category[]
}

export interface ProductFaq {
  question: string
  answer: string
}

export interface Product {
  id: number
  name: string
  slug: string
  description: string
  images: string[]
  categoryId: number
  price: number
  stock: number
  tags: string[]
  faqs: ProductFaq[]
  status: "active" | "hidden"
  createdAt: string
  updatedAt: string
}

export type TransactionType = "topup" | "purchase" | "adjust"

export interface Transaction {
  id: number
  userId: number
  type: TransactionType
  amount: number
  balanceBefore: number
  balanceAfter: number
  reference: string
  createdAt: string
}

export interface RedeemResult {
  amount: number
  balance: number
  transaction: Transaction
}

export interface Order {
  id: number
  userId: number
  productId: number
  productName: string
  quantity: number
  unitPrice: number
  totalPrice: number
  items: string[]
  stockItemIds: number[]
  status: "completed"
  createdAt: string
}

export interface StockItem {
  id: number
  productId: number
  data: string
  status: "available" | "sold"
  soldTo: number | null
  orderId: number | null
  soldAt: string | null
  createdAt: string
  updatedAt: string
}

export interface TopupCode {
  id: number
  code: string
  amount: number
  status: "active" | "redeemed" | "disabled"
  redeemedBy: number | null
  redeemedAt: string | null
  createdBy: number
  createdAt: string
  updatedAt: string
}

export interface Settings {
  id: number
  site: {
    name: string
    description: string
    logoUrl: string | null
    faviconUrl: string | null
    maintenance: boolean
  }
  contact: {
    email: string
    phone: string
    facebook: string
    line: string
    discord: string
  }
  meta: {
    title: string
    description: string
    keywords: string[]
    ogImage: string | null
    themeColor: string
  }
  payment: {
    truemoneyEnabled: boolean
    truemoneyPhone: string
  }
  updatedAt: string
}

export interface TrueMoneyRedeemResult {
  amount: number
  balance: number
}

export interface TrueMoneyVoucher {
  id: number
  hash: string
  userId: number
  amount: number
  phone: string
  ownerProfile: string
  createdAt: string
}

export interface TrueMoneyHistory {
  summary: {
    total: number
    totalAmount: number
  }
  vouchers: TrueMoneyVoucher[]
}

export interface HomeFeature {
  id: number
  icon: string
  title: string
  description: string
  order: number
  status: "active" | "hidden"
  createdAt: string
  updatedAt: string
}

export interface Announcement {
  id: number
  imageUrl: string
  title: string
  description: string
  link: string | null
  status: "active" | "hidden"
  createdAt: string
  updatedAt: string
}

export interface ImageSlide {
  id: number
  imageUrl: string
  title: string
  subtitle: string
  link: string | null
  order: number
  status: "active" | "hidden"
  createdAt: string
  updatedAt: string
}

export type PublicSettings = Pick<Settings, "site" | "contact" | "meta"> & {
  payment: {
    truemoneyEnabled: boolean
  }
}

export interface TwoFactorSetup {
  secret: string
  otpauthUrl: string
}

export interface DashboardStats {
  users: {
    total: number
    active: number
    banned: number
    admins: number
    totalBalance: number
  }
  catalog: {
    categories: number
    products: number
    stockAvailable: number
    stockSold: number
  }
  sales: { orders: number; revenue: number; itemsSold: number }
  topup: { totalCodes: number; redeemedCodes: number; redeemedAmount: number }
}

export interface Paginated<T> {
  total: number
  page: number
  limit: number
}

export interface UserListResponse extends Paginated<PublicUser> {
  users: PublicUser[]
}

export interface OrderListResponse {
  total: number
  totalRevenue: number
  page: number
  limit: number
  orders: Order[]
}

export interface StockListResponse {
  summary: { total: number; available: number; sold: number }
  stocks: StockItem[]
}

export interface TopupListResponse {
  summary: { total: number; totalAmount: number; redeemedAmount: number }
  codes: TopupCode[]
}
