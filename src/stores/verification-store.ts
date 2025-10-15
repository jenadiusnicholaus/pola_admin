import { defineStore } from 'pinia'
import {
  verificationService,
  VerificationStatistics,
  VerificationUser,
  Document,
  VerificationListResponse,
  PendingDocumentsResponse,
} from '../services/verificationService'

export const useVerificationStore = defineStore('verification', {
  state: () => ({
    statistics: null as VerificationStatistics | null,
    verifications: [] as VerificationUser[],
    documents: [] as Document[],
    selectedVerification: null as VerificationUser | null,
    selectedDocument: null as Document | null,
    selectedUser: null as VerificationUser | null,
    userDocuments: [] as Document[],
    loading: {
      statistics: false,
      verifications: false,
      documents: false,
      actions: false,
    },
    error: null as string | null,
    pagination: {
      currentPage: 1,
      totalPages: 1,
      totalCount: 0,
    },
    filters: {
      status: 'all',
    },
  }),

  getters: {
    pendingVerifications: (state) => state.verifications.filter((v) => v.status === 'pending'),
    verifiedVerifications: (state) => state.verifications.filter((v) => v.status === 'verified'),
    rejectedVerifications: (state) => state.verifications.filter((v) => v.status === 'rejected'),
    pendingDocuments: (state) => state.documents.filter((d) => d.verification_status === 'pending'),
    filteredVerifications: (state) => {
      if (state.filters.status === 'all') {
        return state.verifications
      }
      return state.verifications.filter((v) => v.status === state.filters.status)
    },
  },

  actions: {
    async fetchStatistics() {
      this.loading.statistics = true
      this.error = null

      try {
        this.statistics = await verificationService.getStatistics()
      } catch (error: any) {
        this.error = error.message
        throw error
      } finally {
        this.loading.statistics = false
      }
    },

    async fetchVerifications(page: number = 1, status?: string, perPage: number = 10) {
      this.loading.verifications = true
      this.error = null

      try {
        const response: VerificationListResponse = await verificationService.getAllVerifications(page, status, perPage)
        this.verifications = response.results
        this.pagination.currentPage = page
        this.pagination.totalCount = response.count
        this.pagination.totalPages = Math.ceil(response.count / perPage)
      } catch (error: any) {
        this.error = error.message
        throw error
      } finally {
        this.loading.verifications = false
      }
    },

    async fetchPendingDocuments() {
      this.loading.documents = true
      this.error = null

      try {
        const response: PendingDocumentsResponse = await verificationService.getPendingDocuments()
        this.documents = response.documents
      } catch (error: any) {
        this.error = error.message
        throw error
      } finally {
        this.loading.documents = false
      }
    },

    async verifyStep(verificationId: number, step: string, notes: string) {
      this.loading.actions = true
      this.error = null

      try {
        await verificationService.verifyStep(verificationId, step, notes)
        // Refresh verifications after action
        await this.fetchVerifications(this.pagination.currentPage, this.filters.status)
      } catch (error: any) {
        this.error = error.message
        throw error
      } finally {
        this.loading.actions = false
      }
    },

    async approveVerification(verificationId: number, notes: string) {
      this.loading.actions = true
      this.error = null

      try {
        const response = await verificationService.approveVerification(verificationId, notes)
        // Refresh verifications after action
        await this.fetchVerifications(this.pagination.currentPage, this.filters.status)
        return { success: true, status: 200, data: response }
      } catch (error: any) {
        this.error = error.message
        throw error
      } finally {
        this.loading.actions = false
      }
    },

    async rejectVerification(verificationId: number, reason: string) {
      this.loading.actions = true
      this.error = null

      try {
        const response = await verificationService.rejectVerification(verificationId, reason)
        // Refresh verifications after action
        await this.fetchVerifications(this.pagination.currentPage, this.filters.status)
        return { success: true, status: 200, data: response }
      } catch (error: any) {
        this.error = error.message
        throw error
      } finally {
        this.loading.actions = false
      }
    },

    async rejectStep(verificationId: number, step: string, reason: string) {
      this.loading.actions = true
      this.error = null

      try {
        const response = await verificationService.rejectStep(verificationId, step, reason)
        // Refresh verifications after action
        await this.fetchVerifications(this.pagination.currentPage, this.filters.status)
        return { success: true, status: 200, data: response }
      } catch (error: any) {
        this.error = error.message
        throw error
      } finally {
        this.loading.actions = false
      }
    },

    async verifyDocument(documentId: number, notes: string) {
      this.loading.actions = true
      this.error = null

      try {
        await verificationService.verifyDocument(documentId, notes)
        // Remove document from list after verification
        this.documents = this.documents.filter((d) => d.id !== documentId)
      } catch (error: any) {
        this.error = error.message || 'Failed to verify document'
        throw error
      } finally {
        this.loading.actions = false
      }
    },

    async rejectDocument(documentId: number, reason: string) {
      this.loading.actions = true
      this.error = null

      try {
        await verificationService.rejectDocument(documentId, reason)
        // Remove document from list after rejection
        this.documents = this.documents.filter((d) => d.id !== documentId)
      } catch (error: any) {
        this.error = error.message || 'Failed to reject document'
        throw error
      } finally {
        this.loading.actions = false
      }
    },

    setSelectedVerification(verification: VerificationUser | null) {
      this.selectedVerification = verification
    },

    setSelectedDocument(document: Document | null) {
      this.selectedDocument = document
    },

    setFilterStatus(status: string) {
      this.filters.status = status
    },

    clearError() {
      this.error = null
    },

    // Methods for AdminVerificationStepper
    async fetchUserForVerification(userId: string | number) {
      this.loading.verifications = true
      this.error = null

      try {
        // Get verification details for the specific user
        const verification = await verificationService.getVerificationDetails(Number(userId))
        this.selectedUser = verification
        return verification
      } catch (error: any) {
        this.error = error.message
        throw error
      } finally {
        this.loading.verifications = false
      }
    },

    async fetchUserDocuments() {
      this.loading.documents = true
      this.error = null

      try {
        // Get all documents and filter by user
        const allDocsResponse = await verificationService.getAllDocuments()
        if (allDocsResponse.results) {
          // Filter by user email if we have the user loaded
          if (this.selectedUser) {
            this.userDocuments = allDocsResponse.results.filter(
              (doc: any) => doc.user_email === this.selectedUser?.user_email,
            )
          }
        }
        return this.userDocuments
      } catch (error: any) {
        this.error = error.message
        throw error
      } finally {
        this.loading.documents = false
      }
    },
  },
})
