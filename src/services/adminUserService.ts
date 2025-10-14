import makeRequest from './makeRequest'
import type IRequestParams from '../models/models'

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000'

export interface AdminUserRole {
  id?: number
  role_name: string
  get_role_display: string
}

export interface AdminUser {
  id: number
  email: string
  first_name: string
  last_name: string
  is_active: boolean
  is_verified: boolean
  is_staff: boolean
  is_superuser: boolean
  user_role: AdminUserRole | null
  permissions: string[]
  contact?: any
  address?: any
  date_of_birth?: string
  date_joined: string
}

export interface AdminUsersResponse {
  count: number
  next: string | null
  previous: string | null
  results: AdminUser[]
}

export interface AdminUserStats {
  total_users: number
  active_users: number
  inactive_users: number
  verified_users: number
  unverified_users: number
  staff_users: number
  superusers: number
  users_without_role: number
  by_role: Record<string, number>
}

export interface AssignRoleRequest {
  role_name: string
}

export interface AssignPermissionsRequest {
  user_id: number
  permission_codenames: string[]
}

export interface Permission {
  id: number
  name: string
  codename: string
  content_type?: string
  content_type__app_label?: string
  content_type__model?: string
}

export interface UserPermissionsResponse {
  user_id: number
  email: string
  is_superuser: boolean
  is_staff: boolean
  role: string | null
  role_permissions: Permission[]
  direct_permissions: Permission[]
  total_permissions: number
}

export interface AvailablePermissionsResponse {
  [key: string]: Permission[]
}

export const adminUserService = {
  // User Management APIs
  async getAllUsers(params?: {
    role?: string
    is_active?: boolean
    is_verified?: boolean
    is_staff?: boolean
    search?: string
    page?: number
    page_size?: number
  }): Promise<AdminUsersResponse> {
    const queryParams = new URLSearchParams()
    if (params?.role) queryParams.append('role', params.role)
    if (params?.is_active !== undefined) queryParams.append('is_active', params.is_active.toString())
    if (params?.is_verified !== undefined) queryParams.append('is_verified', params.is_verified.toString())
    if (params?.is_staff !== undefined) queryParams.append('is_staff', params.is_staff.toString())
    if (params?.search) queryParams.append('search', params.search)
    if (params?.page) queryParams.append('page', params.page.toString())
    if (params?.page_size) queryParams.append('page_size', params.page_size.toString())

    const queryString = queryParams.toString()
    const url = `${API_BASE_URL}/admin/users/${queryString ? `?${queryString}` : ''}`

    const requestParams: IRequestParams = {
      url,
      method: 'GET',
    }

    const response = await makeRequest(requestParams)
    return response.data
  },

  async getUserById(id: number): Promise<AdminUser> {
    const requestParams: IRequestParams = {
      url: `${API_BASE_URL}/admin/users/${id}/`,
      method: 'GET',
    }

    const response = await makeRequest(requestParams)
    return response.data
  },

  async createUser(data: {
    email: string
    password: string
    first_name: string
    last_name: string
    user_role?: string
    date_of_birth?: string
    is_staff?: boolean
  }): Promise<AdminUser> {
    const requestParams: IRequestParams = {
      url: `${API_BASE_URL}/admin/users/`,
      method: 'POST',
      data,
    }

    const response = await makeRequest(requestParams)
    return response.data
  },

  async updateUser(id: number, data: Partial<AdminUser>): Promise<AdminUser> {
    const requestParams: IRequestParams = {
      url: `${API_BASE_URL}/admin/users/${id}/`,
      method: 'PUT',
      data,
    }

    const response = await makeRequest(requestParams)
    return response.data
  },

  async partialUpdateUser(id: number, data: Partial<AdminUser>): Promise<AdminUser> {
    const requestParams: IRequestParams = {
      url: `${API_BASE_URL}/admin/users/${id}/`,
      method: 'PATCH',
      data,
    }

    const response = await makeRequest(requestParams)
    return response.data
  },

  async deleteUser(id: number): Promise<void> {
    const requestParams: IRequestParams = {
      url: `${API_BASE_URL}/admin/users/${id}/`,
      method: 'DELETE',
    }

    await makeRequest(requestParams)
  },

  async assignRole(userId: number, roleName: string): Promise<{ message: string; user: AdminUser }> {
    const requestParams: IRequestParams = {
      url: `${API_BASE_URL}/admin/users/${userId}/assign_role/`,
      method: 'POST',
      data: { role_name: roleName },
    }

    const response = await makeRequest(requestParams)
    return response.data
  },

  async toggleActive(userId: number): Promise<{ message: string; is_active: boolean; user: AdminUser }> {
    const requestParams: IRequestParams = {
      url: `${API_BASE_URL}/admin/users/${userId}/toggle_active/`,
      method: 'POST',
    }

    const response = await makeRequest(requestParams)
    return response.data
  },

  async makeStaff(userId: number): Promise<{ message: string; user: AdminUser }> {
    const requestParams: IRequestParams = {
      url: `${API_BASE_URL}/admin/users/${userId}/make_staff/`,
      method: 'POST',
    }

    const response = await makeRequest(requestParams)
    return response.data
  },

  async removeStaff(userId: number): Promise<{ message: string; user: AdminUser }> {
    const requestParams: IRequestParams = {
      url: `${API_BASE_URL}/admin/users/${userId}/remove_staff/`,
      method: 'POST',
    }

    const response = await makeRequest(requestParams)
    return response.data
  },

  async getUserStats(): Promise<AdminUserStats> {
    const requestParams: IRequestParams = {
      url: `${API_BASE_URL}/admin/users/stats/`,
      method: 'GET',
    }

    const response = await makeRequest(requestParams)
    return response.data
  },

  // Permission Management APIs
  async getAllPermissions(params?: { app_label?: string; model?: string }): Promise<Permission[]> {
    const queryParams = new URLSearchParams()
    if (params?.app_label) queryParams.append('app_label', params.app_label)
    if (params?.model) queryParams.append('model', params.model)

    const queryString = queryParams.toString()
    const url = `${API_BASE_URL}/admin/permissions/${queryString ? `?${queryString}` : ''}`

    const requestParams: IRequestParams = {
      url,
      method: 'GET',
    }

    const response = await makeRequest(requestParams)
    return response.data
  },

  async getUserPermissions(userId: number): Promise<UserPermissionsResponse> {
    const requestParams: IRequestParams = {
      url: `${API_BASE_URL}/admin/permissions/user/${userId}/`,
      method: 'GET',
    }

    const response = await makeRequest(requestParams)
    return response.data
  },

  async assignPermissions(data: AssignPermissionsRequest): Promise<{
    message: string
    assigned: string[]
    not_found: string[]
    user: AdminUser
  }> {
    const requestParams: IRequestParams = {
      url: `${API_BASE_URL}/admin/permissions/assign/`,
      method: 'POST',
      data,
    }

    const response = await makeRequest(requestParams)
    return response.data
  },

  async revokePermissions(data: AssignPermissionsRequest): Promise<{
    message: string
    revoked: string[]
    not_found: string[]
    user: AdminUser
  }> {
    const requestParams: IRequestParams = {
      url: `${API_BASE_URL}/admin/permissions/revoke/`,
      method: 'POST',
      data,
    }

    const response = await makeRequest(requestParams)
    return response.data
  },

  async getAvailablePermissions(): Promise<AvailablePermissionsResponse> {
    const requestParams: IRequestParams = {
      url: `${API_BASE_URL}/admin/permissions/available/`,
      method: 'GET',
    }

    const response = await makeRequest(requestParams)
    return response.data
  },
}
