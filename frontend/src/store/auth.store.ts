import { create } from "zustand"
import { persist } from "zustand/middleware"

interface User {
  id: string
  email: string
  role: string
  tenantId: string
}

interface AuthState {
  user: User | null
  accessToken: string | null
  isAuthenticated: boolean
  csrfToken: string | null
  setAuth: (user: User, accessToken: string) => void
  setAccessToken: (accessToken: string) => void
  setCsrfToken: (csrfToken: string) => void
  logout: () => void
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      accessToken: null,
      isAuthenticated: false,
      csrfToken: null,

      setAuth: (user, accessToken) =>
        set({ user, accessToken, isAuthenticated: true }),

      setAccessToken: (accessToken) =>
        set({ accessToken }),

      setCsrfToken: (csrfToken) =>
        set({ csrfToken }),

      logout: () =>
        set({ user: null, accessToken: null, isAuthenticated: false, csrfToken: null }),
    }),
    {
      name: "gymos-auth",
      partialize: (state) => ({
        user: state.user,
        accessToken: state.accessToken,
        isAuthenticated: state.isAuthenticated,
        csrfToken: state.csrfToken,
      }),
    }
  )
)
