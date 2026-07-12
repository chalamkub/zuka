import axios, { AxiosError } from "axios"

import type { ApiResponse } from "@/types"
import { getToken } from "./auth-storage"

export const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:5000/api/v1",
  headers: { "Content-Type": "application/json" },
})

api.interceptors.request.use((config) => {
  const token = getToken()
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

export function getApiErrorMessage(
  error: unknown,
  fallback = "เกิดข้อผิดพลาด กรุณาลองใหม่อีกครั้ง"
): string {
  if (error instanceof AxiosError) {
    const data = error.response?.data as ApiResponse | undefined
    if (data?.message) return data.message
    if (error.code === "ERR_NETWORK") return "เชื่อมต่อเซิร์ฟเวอร์ไม่สำเร็จ"
  }
  return fallback
}

export default api
