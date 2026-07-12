"use client"

import * as React from "react"

import type { ApiResponse, PublicSettings } from "@/types"
import api from "@/lib/axios"

interface SettingsContextValue {
  settings: PublicSettings | null
  loading: boolean
  refresh: () => Promise<void>
}

const SettingsContext = React.createContext<SettingsContextValue | null>(null)

export function SettingsProvider({ children }: { children: React.ReactNode }) {
  const [settings, setSettings] = React.useState<PublicSettings | null>(null)
  const [loading, setLoading] = React.useState(true)

  const load = React.useCallback(async () => {
    try {
      const { data } = await api.get<ApiResponse<PublicSettings>>("/settings")
      setSettings(data.data ?? null)
    } catch {
      setSettings(null)
    } finally {
      setLoading(false)
    }
  }, [])

  React.useEffect(() => {
    load()
  }, [load])

  const value = React.useMemo<SettingsContextValue>(
    () => ({ settings, loading, refresh: load }),
    [settings, loading, load]
  )

  return (
    <SettingsContext.Provider value={value}>
      {children}
    </SettingsContext.Provider>
  )
}

export function useSettings(): SettingsContextValue {
  const ctx = React.useContext(SettingsContext)
  if (!ctx) throw new Error("useSettings ต้องใช้ภายใน <SettingsProvider>")
  return ctx
}
