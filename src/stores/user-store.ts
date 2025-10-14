import { defineStore } from 'pinia'
import { verificationService } from '../services/verificationService'
import type { ProfileData } from '../types/verification'

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
