import { useAuthStore } from "@/store/auth.store"
import { authService, LoginCredentials } from "@/services/auth.service"
import { useRouter } from "next/navigation"
import { useState } from "react"

export function useAuth() {
  const store = useAuthStore()
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const fetchCsrfToken = async () => {
    try {
      const { csrfToken } = await authService.getCsrfToken()
      store.setCsrfToken(csrfToken)
      return csrfToken
    } catch (err) {
      console.error("Failed to fetch CSRF token", err)
      return null
    }
  }

  const login = async (credentials: LoginCredentials) => {
    setIsLoading(true)
    setError(null)
    try {
      const data = await authService.login(credentials)
      store.setAuth(data.user, data.accessToken)
      if (data.user.role === 'SUPER_ADMIN') {
        router.push("/platform/dashboard")
      } else {
        router.push("/dashboard")
      }
    } catch (err: any) {
      const message = err.response?.data?.message
      if (Array.isArray(message)) {
        setError(message[0])
      } else {
        setError(message || "Login failed")
      }
      throw err
    } finally {
      setIsLoading(false)
    }
  }

  const logout = async () => {
    await authService.logout()
    store.logout()
    router.push("/login")
  }

  return {
    user: store.user,
    isAuthenticated: store.isAuthenticated,
    csrfToken: store.csrfToken,
    fetchCsrfToken,
    login,
    logout,
    isLoading,
    error,
  }
}
