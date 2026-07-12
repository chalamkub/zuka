"use client"

import * as React from "react"
import { AxiosError } from "axios"

import type { ApiResponse, AuthResult, PublicUser } from "@/types"
import api, { getApiErrorMessage } from "@/lib/axios"
import { clearToken, getToken, setToken } from "@/lib/auth-storage"

export class AuthError extends Error {
  twoFactorRequired: boolean
  constructor(message: string, twoFactorRequired = false) {
    super(message)
    this.name = "AuthError"
    this.twoFactorRequired = twoFactorRequired
  }
}

type AuthStatus = "loading" | "authenticated" | "unauthenticated"

interface SignInInput {
  identifier: string
  password: string
  code?: string
}

interface SignUpInput {
  username: string
  email: string
  password: string
}

interface AuthContextValue {
  user: PublicUser | null
  status: AuthStatus
  isAuthenticated: boolean
  isAdmin: boolean
  signIn: (input: SignInInput) => Promise<void>
  signUp: (input: SignUpInput) => Promise<void>
  signOut: () => void
  refresh: () => Promise<void>
}

const AuthContext = React.createContext<AuthContextValue | null>(null)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = React.useState<PublicUser | null>(null)
  const [status, setStatus] = React.useState<AuthStatus>("loading")

  const loadMe = React.useCallback(async () => {
    if (!getToken()) {
      setUser(null)
      setStatus("unauthenticated")
      return
    }
    try {
      const { data } = await api.get<ApiResponse<PublicUser>>("/auth/me")
      setUser(data.data ?? null)
      setStatus(data.data ? "authenticated" : "unauthenticated")
      if (!data.data) clearToken()
    } catch {
      clearToken()
      setUser(null)
      setStatus("unauthenticated")
    }
  }, [])

  React.useEffect(() => {
    loadMe()
  }, [loadMe])

  const signIn = React.useCallback(async (input: SignInInput) => {
    try {
      const { data } = await api.post<ApiResponse<AuthResult>>("/auth/login", {
        identifier: input.identifier,
        password: input.password,
        ...(input.code ? { code: input.code } : {}),
      })
      if (!data.data) throw new AuthError(data.message)
      setToken(data.data.token)
      setUser(data.data.user)
      setStatus("authenticated")
    } catch (error) {
      if (error instanceof AxiosError) {
        const body = error.response?.data as
          | ApiResponse<{ twoFactorRequired?: boolean }>
          | undefined
        throw new AuthError(
          getApiErrorMessage(error),
          Boolean(body?.data?.twoFactorRequired)
        )
      }
      throw error
    }
  }, [])

  const signUp = React.useCallback(async (input: SignUpInput) => {
    try {
      const { data } = await api.post<ApiResponse<AuthResult>>(
        "/auth/register",
        input
      )
      if (!data.data) throw new AuthError(data.message)
      setToken(data.data.token)
      setUser(data.data.user)
      setStatus("authenticated")
    } catch (error) {
      if (error instanceof AxiosError) {
        throw new AuthError(getApiErrorMessage(error))
      }
      throw error
    }
  }, [])

  const signOut = React.useCallback(() => {
    clearToken()
    setUser(null)
    setStatus("unauthenticated")
  }, [])

  const value = React.useMemo<AuthContextValue>(
    () => ({
      user,
      status,
      isAuthenticated: status === "authenticated",
      isAdmin: user?.role === "admin",
      signIn,
      signUp,
      signOut,
      refresh: loadMe,
    }),
    [user, status, signIn, signUp, signOut, loadMe]
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth(): AuthContextValue {
  const ctx = React.useContext(AuthContext)
  if (!ctx) {
    throw new Error("useAuth ต้องใช้ภายใน <AuthProvider>")
  }
  return ctx
}
