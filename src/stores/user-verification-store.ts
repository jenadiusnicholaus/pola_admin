import { defineStore } from 'pinia'
import { verificationService } from '../services/verificationService'
import type { ProfileData, RoleSpecificData, DocumentUpload, UserRole, VerificationState } from '../types/verification'
import { ROLE_STEP_CONFIGS, DOCUMENT_TYPES } from '../types/verification'

export const useUserVerificationStore = defineStore('userVerification', {
  state: (): VerificationState => ({
    currentStep: 0,
    steps: [],
    verificationData: null,
    uploadedDocuments: [],
    formData: {
      profile: {},
      roleSpecific: {},
    },
    isLoading: false,
    errors: {},
  }),

  getters: {
    currentStepData: (state) => state.steps[state.currentStep],
    isFirstStep: (state) => state.currentStep === 0,
    isLastStep: (state) => state.currentStep === state.steps.length - 1,
    completedSteps: (state) => state.steps.filter((step) => step.status === 'completed'),
    progressPercentage: (state) => {
      const completed = state.steps.filter((step) => step.status === 'completed').length
      return (completed / state.steps.length) * 100
    },
    canProceedToNext: (state) => {
      const current = state.steps[state.currentStep]
      if (!current) return false

      // Admin review steps can't be manually proceeded
      if (current.isAdminReview) return false

      // Check if current step is completed or in progress
      return current.status === 'completed' || current.status === 'in_progress'
    },
    requiredDocumentsForCurrentStep: (state) => {
      const current = state.steps[state.currentStep]
      if (!current?.requiredDocuments) return []

      const userRole = state.verificationData?.user_role?.value as UserRole
      if (!userRole) return []

      return current.requiredDocuments.map((docType) => ({
        type: docType,
        label: DOCUMENT_TYPES[userRole]?.[docType as keyof (typeof DOCUMENT_TYPES)[UserRole]] || docType,
      }))
    },
    uploadedDocumentsForCurrentStep: (state) => {
      const current = state.steps[state.currentStep]
      if (!current?.requiredDocuments) return []

      return state.uploadedDocuments.filter((doc) => current.requiredDocuments?.includes(doc.document_type))
    },
  },

  actions: {
    async initializeVerification(userRole: UserRole) {
      this.isLoading = true
      this.errors = {}

      try {
        // Set up steps based on role
        this.steps = [...ROLE_STEP_CONFIGS[userRole]]

        // Fetch current verification status
        await this.fetchVerificationStatus()

        // Fetch uploaded documents
        await this.fetchUploadedDocuments()

        // Update step statuses based on backend data
        this.updateStepStatuses()

        // Set current step based on progress
        this.setCurrentStepFromBackend()
      } catch (error: any) {
        this.errors.general = [error.message || 'Failed to initialize verification']
        throw error
      } finally {
        this.isLoading = false
      }
    },

    async fetchVerificationStatus() {
      try {
        this.verificationData = await verificationService.getUserVerificationStatus()
      } catch (error: any) {
        this.errors.status = [error.message || 'Failed to fetch verification status']
        throw error
      }
    },

    async fetchUploadedDocuments() {
      try {
        this.uploadedDocuments = await verificationService.getUserDocuments()
      } catch (error: any) {
        this.errors.documents = [error.message || 'Failed to fetch documents']
        throw error
      }
    },

    updateStepStatuses() {
      if (!this.verificationData) return

      const currentBackendStep = this.verificationData.current_step
      const status = this.verificationData.status

      this.steps = this.steps.map((step) => {
        // Handle completed verification
        if (status === 'verified') {
          return { ...step, status: 'completed' as const }
        }

        // Handle rejected verification
        if (status === 'rejected') {
          if (step.backendStep === currentBackendStep) {
            return { ...step, status: 'rejected' as const }
          }
          // Mark previous steps as completed
          if (step.backendStep && verificationService.isStepCompleted(step.backendStep, currentBackendStep)) {
            return { ...step, status: 'completed' as const }
          }
        }

        // Mark completed steps
        if (step.backendStep && verificationService.isStepCompleted(step.backendStep, currentBackendStep)) {
          return { ...step, status: 'completed' as const }
        }

        // Mark current step
        if (step.backendStep === currentBackendStep) {
          return { ...step, status: 'in_progress' as const }
        }

        return step
      })
    },

    setCurrentStepFromBackend() {
      if (!this.verificationData) return

      const currentBackendStep = this.verificationData.current_step

      // Find the step that matches the current backend step
      const stepIndex = this.steps.findIndex((step) => step.backendStep === currentBackendStep)

      if (stepIndex >= 0) {
        this.currentStep = stepIndex
      } else {
        // If no exact match, find the first non-completed step
        const firstIncompleteIndex = this.steps.findIndex((step) => step.status !== 'completed')
        this.currentStep = firstIncompleteIndex >= 0 ? firstIncompleteIndex : 0
      }
    },

    async updateProfile(profileData: Partial<ProfileData>) {
      this.isLoading = true
      this.errors = {}

      try {
        await verificationService.updateUserProfile(profileData)
        this.formData.profile = { ...this.formData.profile, ...profileData }

        // Mark profile step as completed
        const profileStep = this.steps.find((step) => step.backendStep === 'contact')
        if (profileStep) {
          profileStep.status = 'completed'
        }

        // Refresh verification status
        await this.fetchVerificationStatus()
      } catch (error: any) {
        this.errors.profile = [error.message || 'Failed to update profile']
        throw error
      } finally {
        this.isLoading = false
      }
    },

    async uploadDocument(file: File, documentType: string, title: string) {
      this.isLoading = true
      this.errors = {}

      try {
        const base64 = await verificationService.fileToBase64(file)

        const documentData: DocumentUpload = {
          document_type: documentType,
          file_base64: base64,
          title: title,
          description: `${title} for verification`,
        }

        const uploadedDoc = await verificationService.uploadUserDocument(documentData)
        this.uploadedDocuments.push(uploadedDoc)

        // Check if all required documents for current step are uploaded
        await this.checkDocumentStepCompletion()
      } catch (error: any) {
        this.errors.upload = [error.message || 'Failed to upload document']
        throw error
      } finally {
        this.isLoading = false
      }
    },

    async checkDocumentStepCompletion() {
      const currentStep = this.steps[this.currentStep]
      if (!currentStep?.requiredDocuments) return

      const requiredDocs = currentStep.requiredDocuments
      const uploadedTypes = this.uploadedDocuments.map((doc) => doc.document_type)

      const allUploaded = requiredDocs.every((docType) => uploadedTypes.includes(docType))

      if (allUploaded) {
        currentStep.status = 'completed'
        await this.fetchVerificationStatus() // Refresh backend status
      }
    },

    async updateRoleSpecificData(data: Partial<RoleSpecificData>) {
      this.isLoading = true
      this.errors = {}

      try {
        // Role-specific data is typically updated via profile endpoint
        await verificationService.updateUserProfile(data as any)
        this.formData.roleSpecific = { ...this.formData.roleSpecific, ...data }

        // Mark role-specific step as completed
        const roleStep = this.steps.find((step) => step.backendStep === 'role_specific')
        if (roleStep) {
          roleStep.status = 'completed'
        }

        await this.fetchVerificationStatus()
      } catch (error: any) {
        this.errors.roleSpecific = [error.message || 'Failed to update role-specific data']
        throw error
      } finally {
        this.isLoading = false
      }
    },

    nextStep() {
      if (!this.isLastStep && this.canProceedToNext) {
        this.currentStep++
      }
    },

    previousStep() {
      if (!this.isFirstStep) {
        this.currentStep--
      }
    },

    goToStep(stepIndex: number) {
      if (stepIndex >= 0 && stepIndex < this.steps.length) {
        this.currentStep = stepIndex
      }
    },

    async pollVerificationStatus(intervalMs: number = 30000) {
      const poll = setInterval(async () => {
        try {
          await this.fetchVerificationStatus()

          if (this.verificationData?.status === 'verified') {
            clearInterval(poll)
            // Mark all steps as completed
            this.steps.forEach((step) => {
              step.status = 'completed'
            })
            // Go to completion step
            this.currentStep = this.steps.length - 1
          } else if (this.verificationData?.status === 'rejected') {
            clearInterval(poll)
            this.updateStepStatuses()
          }
        } catch (error) {
          console.error('Failed to poll verification status:', error)
        }
      }, intervalMs)

      return poll
    },

    clearErrors() {
      this.errors = {}
    },

    clearError(field: string) {
      if (this.errors[field]) {
        delete this.errors[field]
      }
    },

    reset() {
      this.currentStep = 0
      this.steps = []
      this.verificationData = null
      this.uploadedDocuments = []
      this.formData = {
        profile: {},
        roleSpecific: {},
      }
      this.isLoading = false
      this.errors = {}
    },
  },
})
