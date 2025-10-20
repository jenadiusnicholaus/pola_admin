import { defineStore } from 'pinia'

export const useGlobalStore = defineStore('global', {
  state: () => {
    return {
      isSidebarMinimized: false,
      isLoading: false,
      activeRequests: 0,
    }
  },

  actions: {
    toggleSidebar() {
      this.isSidebarMinimized = !this.isSidebarMinimized
    },

    startLoading() {
      this.activeRequests++
      this.isLoading = true
    },

    stopLoading() {
      this.activeRequests--
      if (this.activeRequests <= 0) {
        this.activeRequests = 0
        this.isLoading = false
      }
    },

    resetLoading() {
      this.activeRequests = 0
      this.isLoading = false
    },
  },
})
