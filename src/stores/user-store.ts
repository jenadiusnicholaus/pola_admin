import { defineStore } from 'pinia'
import { adminAuthService, AdminUser } from '../services/adminAuthService'
import { verificationService } from '../services/verificationService'
import type { ProfileData } from '../types/verification'

// Admin Authentication Store
export const useAdminAuthStore = defineStore('adminAuth', {
  state: () => ({
    user: null as AdminUser | null,
    isAuthenticated: false,
    loading: false,
    error: null as string | null,
  }),

  getters: {
    isLoggedIn: (state) => state.isAuthenticated && !!state.user,
    userFullName: (state) => (state.user ? `${state.user.first_name} ${state.user.last_name}` : ''),
    isAdmin: (state) => state.user?.is_admin || false,
  },

  actions: {
    async login(email: string, password: string) {
      this.loading = true
      this.error = null

      try {
        const response = await adminAuthService.login(email, password)
        this.user = response.user
        this.isAuthenticated = true
        return response
      } catch (error: any) {
        this.error = error.message
        throw error
      } finally {
        this.loading = false
      }
    },

    logout() {
      adminAuthService.logout()
      this.user = null
      this.isAuthenticated = false
      this.error = null
    },

    async checkAuth() {
      const token = adminAuthService.getToken()

      // Token is the minimum requirement for authentication
      // User object is optional (backend may not return it)
      if (token) {
        const user = adminAuthService.getCurrentUser()
        if (user) {
          this.user = user
        }
        this.isAuthenticated = true
        return true
      } else {
        this.logout()
        return false
      }
    },

    async refreshToken() {
      try {
        await adminAuthService.refreshToken()
        return true
      } catch (error) {
        this.logout()
        return false
      }
    },
  },
})

// User Profile Store
export const useUserStore = defineStore('user', {
  state: () => {
    return {
      userName: 'Vasili Savitski',
      email: 'vasili@gmail.com',
      memberSince: '8/12/2020',
      pfp: 'https://picsum.photos/id/22/200/300',
      is2FAEnabled: false,
      profile: null as ProfileData | null,
      isLoadingProfile: false,
      profileError: null as string | null,
    }
  },

  getters: {
    userId(): number | null {
      return this.profile?.id || null
    },
    userFullName(): string {
      if (this.profile) {
        return `${this.profile.first_name} ${this.profile.last_name}`.trim()
      }
      return this.userName
    },
    userEmail(): string {
      return this.profile?.email || this.email
    },
    isVerified(): boolean {
      return this.profile?.is_verified || false
    },
    verificationStatus(): string {
      return this.profile?.verification_status.status || 'Unknown'
    },
    verificationProgress(): number {
      return this.profile?.verification_status.progress || 0
    },
  },

  actions: {
    async fetchUserProfile() {
      this.isLoadingProfile = true
      this.profileError = null

      try {
        const profile = await verificationService.getUserProfile()
        this.profile = profile

        // Update legacy fields for backward compatibility
        if (profile.first_name && profile.last_name) {
          this.userName = `${profile.first_name} ${profile.last_name}`
        }
        if (profile.email) {
          this.email = profile.email
        }
        if (profile.profile_picture) {
          this.pfp = profile.profile_picture
        }
        if (profile.date_joined) {
          this.memberSince = new Date(profile.date_joined).toLocaleDateString()
        }

        return profile
      } catch (error: any) {
        this.profileError = error.message || 'Failed to fetch user profile'
        console.error('Error fetching user profile:', error)
        throw error
      } finally {
        this.isLoadingProfile = false
      }
    },

    toggle2FA() {
      this.is2FAEnabled = !this.is2FAEnabled
    },

    changeUserName(userName: string) {
      this.userName = userName
    },

    clearProfile() {
      this.profile = null
      this.profileError = null
    },
  },
})
