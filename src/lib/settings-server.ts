import type { ApiResponse, PublicSettings } from "@/types"

const API_URL =
  process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:5000/api/v1"

/**
 * ดึงการตั้งค่าเว็บไซต์ฝั่งเซิร์ฟเวอร์ (สำหรับ metadata)
 * ใช้ fetch ตรง ๆ เพราะ axios client อ่าน token จาก localStorage ซึ่งไม่มีบน server
 * ผลลัพธ์ถูก cache ด้วย ISR (revalidate) และ dedupe ภายในคำขอเดียวกันโดย Next
 */
export async function getServerSettings(): Promise<PublicSettings | null> {
  try {
    const res = await fetch(`${API_URL}/settings`, {
      next: { revalidate: 300 },
    })
    if (!res.ok) return null
    const json = (await res.json()) as ApiResponse<PublicSettings>
    return json.data ?? null
  } catch {
    return null
  }
}
