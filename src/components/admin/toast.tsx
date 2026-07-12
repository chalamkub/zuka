"use client"

import * as React from "react"
import { CheckCircle2, XCircle } from "lucide-react"

import { cn } from "@/lib/utils"

type ToastVariant = "success" | "error"

interface ToastItem {
  id: number
  message: string
  variant: ToastVariant
}

interface ToastContextValue {
  toast: (message: string, variant?: ToastVariant) => void
  success: (message: string) => void
  error: (message: string) => void
}

const ToastContext = React.createContext<ToastContextValue | null>(null)

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = React.useState<ToastItem[]>([])

  const remove = React.useCallback((id: number) => {
    setItems((prev) => prev.filter((t) => t.id !== id))
  }, [])

  const toast = React.useCallback(
    (message: string, variant: ToastVariant = "success") => {
      const id = Date.now() + Math.random()
      setItems((prev) => [...prev, { id, message, variant }])
      setTimeout(() => remove(id), 4000)
    },
    [remove]
  )

  const value = React.useMemo<ToastContextValue>(
    () => ({
      toast,
      success: (m) => toast(m, "success"),
      error: (m) => toast(m, "error"),
    }),
    [toast]
  )

  return (
    <ToastContext.Provider value={value}>
      {children}
      <div className="pointer-events-none fixed right-3 bottom-3 z-[100] flex w-full max-w-xs flex-col gap-2">
        {items.map((item) => (
          <button
            key={item.id}
            type="button"
            onClick={() => remove(item.id)}
            className={cn(
              "pointer-events-auto flex items-start gap-2 rounded-2xl border bg-popover px-3 py-2.5 text-left text-sm shadow-lg ring-1 ring-foreground/5 duration-150 animate-in slide-in-from-bottom-2 fade-in",
              item.variant === "error" && "text-destructive"
            )}
          >
            {item.variant === "success" ? (
              <CheckCircle2 className="mt-0.5 size-4 shrink-0" />
            ) : (
              <XCircle className="mt-0.5 size-4 shrink-0" />
            )}
            <span className="text-foreground">{item.message}</span>
          </button>
        ))}
      </div>
    </ToastContext.Provider>
  )
}

export function useToast(): ToastContextValue {
  const ctx = React.useContext(ToastContext)
  if (!ctx) throw new Error("useToast ต้องใช้ภายใน <ToastProvider>")
  return ctx
}
