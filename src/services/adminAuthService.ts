import makeRequest from './makeRequest'
import IRequestParams from '../models/models'

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL
const ADMIN_LOGIN_ENDPOINT = import.meta.env.VITE_AUTH_ADMIN_LOGIN
const REFRESH_ENDPOINT = import.meta.env.VITE_AUTH_REFRESH

export interface AdminLoginRequest {
  email: string
  password: string
}

export interface AdminLoginResponse {
  access: string
  refresh: string
  user: {
    id: number
    email: string
    first_name: string
    last_name: string
    is_admin: boolean
  }
}

export interface AdminUser {
  id: number
  email: string
  first_name: string
  last_name: string
  is_admin: boolean
}

export const adminAuthService = {
  async login(email: string, password: string): Promise<AdminLoginResponse> {
    const params: IRequestParams = {
      url: `${API_BASE_URL}${ADMIN_LOGIN_ENDPOINT}`,
      method: 'POST',
      data: { email, password },
    }

    try {
      console.log('Attempting admin login to:', params.url)
      const response = await makeRequest(params)

      if (!response.data?.access || !response.data?.refresh) {
        throw new Error('Invalid login response format')
      }

      // Store tokens in localStorage
      localStorage.setItem('access', JSON.stringify(response.data.access))
      localStorage.setItem('refresh', JSON.stringify(response.data.refresh))
      console.log('Tokens stored successfully')

      // Only store user if it exists in the response
      if (response.data.user) {
        localStorage.setItem('user', JSON.stringify(response.data.user))
      }

      return response.data
    } catch (error: any) {
      console.error('Admin login error:', {
        url: params.url,
        error: error.response?.data || error.message,
        stack: error.stack,
      })
      throw new Error(error.response?.data?.detail || 'Admin login failed. Check console for details.')
    }
  },

  logout(): void {
    localStorage.removeItem('access')
    localStorage.removeItem('refresh')
    localStorage.removeItem('user')
  },

  getToken(): string | null {
    const tokenStr = localStorage.getItem('access')
    if (tokenStr) {
      try {
        return JSON.parse(tokenStr)
      } catch {
        return null
      }
    }
    return null
  },

  getRefreshToken(): string | null {
    const tokenStr = localStorage.getItem('refresh')
    if (tokenStr) {
      try {
        return JSON.parse(tokenStr)
      } catch {
        return null
      }
    }
    return null
  },

  getCurrentUser(): AdminUser | null {
    const userStr = localStorage.getItem('user')
    if (userStr) {
      try {
        return JSON.parse(userStr)
      } catch {
        return null
      }
    }
    return null
  },

  isAuthenticated(): boolean {
    return !!this.getToken()
  },

  async refreshToken(): Promise<string> {
    const refreshToken = this.getRefreshToken()

    if (!refreshToken) {
      throw new Error('No refresh token available')
    }

    const params: IRequestParams = {
      url: `${API_BASE_URL}${REFRESH_ENDPOINT}`,
      method: 'POST',
      data: { refresh: refreshToken },
    }

    try {
      const response = await makeRequest(params)
      const newAccessToken = response.data.access

      localStorage.setItem('access', JSON.stringify(newAccessToken))
      return newAccessToken
    } catch (error: any) {
      this.logout()
      throw new Error('Token refresh failed')
    }
  },
}
