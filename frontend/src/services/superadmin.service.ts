import api from "@/lib/axios"

export interface PendingTenant {
  id: string;
  name: string;
  email: string;
  phone?: string;
  createdAt: string;
  users: Array<{
    firstName: string;
    lastName: string;
    email: string;
  }>;
}

export const superadminService = {
  getPendingTenants: async (): Promise<PendingTenant[]> => {
    const { data } = await api.get<PendingTenant[]>("/superadmin/tenants/pending", {
      withCredentials: true,
    })
    return data
  },

  approveTenant: async (id: string): Promise<void> => {
    await api.patch(`/superadmin/tenants/${id}/approve`, {}, {
      withCredentials: true,
    })
  },

  rejectTenant: async (id: string): Promise<void> => {
    await api.patch(`/superadmin/tenants/${id}/reject`, {}, {
      withCredentials: true,
    })
  },
}
