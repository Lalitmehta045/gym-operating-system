import api from "@/lib/axios"

export interface LoginCredentials {
  email: string
  password: string
}

export interface RegisterOwnerData {
  gymName: string;
  gymEmail: string;
  gymPhone?: string;
  gymAddress?: string;
  firstName: string;
  lastName: string;
  email: string;
  password: string;
}

export interface AuthResponse {
  accessToken: string
  refreshToken?: string
  user: {
    id: string
    email: string
    role: string
    tenantId: string
  }
}

export interface CsrfResponse {
  csrfToken: string
}

export const authService = {
  getCsrfToken: async (): Promise<CsrfResponse> => {
    const { data } = await api.get<CsrfResponse>("/auth/csrf-token", {
      withCredentials: true,
    })
    return data
  },

  login: async (credentials: LoginCredentials): Promise<AuthResponse> => {
    const { data } = await api.post<AuthResponse>("/auth/login", credentials, {
      withCredentials: true,
    })
    return data
  },

  register: async (credentials: RegisterOwnerData): Promise<{ message: string }> => {
    const { data } = await api.post<{ message: string }>("/auth/register", credentials, {
      withCredentials: true,
    })
    return data
  },

  logout: async (): Promise<void> => {
    try {
      await api.post("/auth/logout", {}, { withCredentials: true })
    } catch (error) {
      console.error("Logout error", error)
    }
  },

  getMe: async () => {
    const { data } = await api.get("/auth/me", { withCredentials: true })
    return data
  },

  refreshToken: async (): Promise<AuthResponse> => {
    const { data } = await api.post<AuthResponse>("/auth/refresh", {}, {
      withCredentials: true,
    })
    return data
  },
}
