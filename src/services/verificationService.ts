/* eslint-disable @typescript-eslint/no-unused-vars */
import makeRequest from './makeRequest'
import IRequestParams from '../models/models'
import type { VerificationData, ProfileData, DocumentUpload, UploadedDocument, UserRole } from '../types/verification'
import API_ENDPOINTS from './apiConfig'

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL
const STATISTICS_ENDPOINT = import.meta.env.VITE_ADMIN_VERIFICATION_STATISTICS
const VERIFICATIONS_ALL_ENDPOINT = import.meta.env.VITE_VERIFICATIONS_ALL
const PENDING_DOCS_ENDPOINT = import.meta.env.VITE_ADMIN_VERIFICATION_PENDING_DOCS
const APPROVE_ENDPOINT = import.meta.env.VITE_ADMIN_VERIFICATION_APPROVE
const REJECT_ENDPOINT = import.meta.env.VITE_ADMIN_VERIFICATION_REJECT
const VERIFY_DOC_ENDPOINT = import.meta.env.VITE_ADMIN_VERIFICATION_VERIFY_DOC
const VERIFICATIONS_DETAIL_ENDPOINT = import.meta.env.VITE_VERIFICATIONS_DETAIL

// Additional endpoints
const DOCUMENTS_ENDPOINT = import.meta.env.VITE_DOCUMENTS_ENDPOINT
const DOCUMENT_VERIFY_ENDPOINT = import.meta.env.VITE_DOCUMENT_VERIFY_ENDPOINT
const DOCUMENT_REJECT_ENDPOINT = import.meta.env.VITE_DOCUMENT_REJECT_ENDPOINT
const VERIFICATIONS_APPROVE_ENDPOINT = import.meta.env.VITE_VERIFICATIONS_APPROVE_ENDPOINT
const VERIFICATIONS_REJECT_ENDPOINT = import.meta.env.VITE_VERIFICATIONS_REJECT_ENDPOINT
const VERIFICATIONS_VERIFY_STEP_ENDPOINT = import.meta.env.VITE_VERIFICATIONS_VERIFY_STEP_ENDPOINT
const VERIFICATIONS_REQUEST_DOCS_ENDPOINT = import.meta.env.VITE_VERIFICATIONS_REQUEST_DOCS_ENDPOINT
const VERIFICATIONS_BY_ROLE_ENDPOINT = import.meta.env.VITE_VERIFICATIONS_BY_ROLE_ENDPOINT
const VERIFICATIONS_PENDING_ENDPOINT = import.meta.env.VITE_VERIFICATIONS_PENDING_ENDPOINT
const USERS_NEEDING_REVIEW_ENDPOINT = import.meta.env.VITE_USERS_NEEDING_REVIEW_ENDPOINT

// User-facing endpoints
const USER_VERIFICATION_STATUS_ENDPOINT = '/authentication/verifications/my_status/'
const USER_PROFILE_ENDPOINT = '/authentication/profile/'
const USER_DOCUMENTS_ENDPOINT = '/authentication/documents/'

export interface VerificationStatistics {
  overview: {
    total_users: number
    verified_users: number
    pending_verifications: number
    rejected_verifications: number
  }
  by_role: {
    [role: string]: {
      total: number
      verified: number
      pending: number
      rejected: number
    }
  }
}

export interface VerificationUser {
  id: number
  user_name: string
  user_email: string
  user_phone: string
  user_role: {
    display: string
    value: string
  }
  status: 'pending' | 'verified' | 'rejected'
  status_display: string
  current_step: string
  current_step_display: string
  progress: number
  days_since_registration: number
  documents_summary: {
    total: number
    verified: number
    pending: number
    rejected: number
  }
  user_address?:
    | {
        // Old API structure
        street: string
        city: string
        region: string
        district: string
      }
    | {
        // New API structure
        office_address: string
        ward: string
        district: string
        region: string
      }
  // New API structure properties
  missing_information?: {
    has_missing_items: boolean
    is_ready_for_approval: boolean
    by_step?: {
      [stepName: string]: {
        status: string
        is_current: boolean
        issues: Array<{
          type: string
          field?: string
          message: string
        }>
        missing_documents?: string[]
        missing_profile_fields?: string[]
        required_fields?: string[]
        verified_fields?: Array<{
          field: string
          label: string
          value: any
          status: string
        }>
      }
    }
    current_step?: string
    summary?: string
    documents?: Document[]
  }
  required_documents?: Array<{
    type: string
    label: string
    required: boolean
    uploaded: boolean
    status: string | null
    document_id: number | null
  }>
}

export interface VerificationListResponse {
  count: number
  next: string | null
  previous: string | null
  results: VerificationUser[]
}

export interface Document {
  id: number
  title: string
  document_type: string
  document_type_display: string
  verification_status: 'pending' | 'verified' | 'rejected'
  verification_status_display: string
  file_url: string
  created_at: string
  user_name: string
  user_email: string
  verification_notes?: string
}

export interface PendingDocumentsResponse {
  count: number
  documents: Document[]
}

export interface VerificationStepRequest {
  verification_id: number
  step: string
  notes: string
}

export interface DocumentVerificationRequest {
  document_id: number
  action: 'verified' | 'rejected'
  notes: string
}

export const verificationService = {
  async getStatistics(): Promise<VerificationStatistics> {
    const params: IRequestParams = {
      url: `${API_BASE_URL}${STATISTICS_ENDPOINT}`,
      method: 'GET',
    }

    const response = await makeRequest(params)
    return response.data
  },

  async getAllVerifications(
    page: number = 1,
    status?: string,
    perPage: number = 10,
  ): Promise<VerificationListResponse> {
    const queryParams: any = {
      page,
      page_size: perPage,
    }
    if (status && status !== 'all') {
      queryParams.status = status
    }

    const params: IRequestParams = {
      url: `${API_BASE_URL}${VERIFICATIONS_ALL_ENDPOINT}`,
      method: 'GET',
      params: queryParams,
    }

    const response = await makeRequest(params)
    return response.data
  },

  async getPendingDocuments(): Promise<PendingDocumentsResponse> {
    const params: IRequestParams = {
      url: `${API_BASE_URL}${PENDING_DOCS_ENDPOINT}`,
      method: 'GET',
    }

    const response = await makeRequest(params)
    return response.data
  },

  async verifyStep(verificationId: number, step: string, notes: string): Promise<any> {
    const params: IRequestParams = {
      url: API_ENDPOINTS.verifications.verifyStep(verificationId),
      method: 'POST',
      data: {
        step,
        notes,
      },
    }

    const response = await makeRequest(params)
    return response.data
  },

  async approveVerification(verificationId: number, notes: string): Promise<any> {
    const params: IRequestParams = {
      url: API_ENDPOINTS.verifications.approve(verificationId),
      method: 'POST',
      data: {
        notes,
      },
    }

    const response = await makeRequest(params)
    return response.data
  },

  async rejectVerification(verificationId: number, reason: string): Promise<any> {
    const params: IRequestParams = {
      url: API_ENDPOINTS.verifications.reject(verificationId),
      method: 'POST',
      data: {
        reason,
      },
    }

    const response = await makeRequest(params)
    return response.data
  },

  async rejectStep(verificationId: number, step: string, reason: string): Promise<any> {
    const params: IRequestParams = {
      url: `${API_BASE_URL}${VERIFICATIONS_VERIFY_STEP_ENDPOINT}${verificationId}/reject_step/`,
      method: 'POST',
      data: {
        step,
        reason,
      },
    }

    const response = await makeRequest(params)
    return response.data
  },

  async verifyDocument(documentId: number, notes: string): Promise<any> {
    const params: IRequestParams = {
      url: API_ENDPOINTS.documents.verify(documentId),
      method: 'POST',
      data: {
        status: 'verified',
        notes,
      },
    }

    const response = await makeRequest(params)
    return response.data
  },

  async rejectDocument(documentId: number, reason: string): Promise<any> {
    const params: IRequestParams = {
      url: API_ENDPOINTS.documents.reject(documentId),
      method: 'POST',
      data: {
        reason,
      },
    }

    const response = await makeRequest(params)
    return response.data
  },

  async getVerificationDetails(verificationId: number): Promise<VerificationUser> {
    const params: IRequestParams = {
      url: API_ENDPOINTS.verifications.detail(verificationId),
      method: 'GET',
    }

    const response = await makeRequest(params)
    return response.data
  },

  async requestDocuments(verificationId: number, documents: string[], message: string): Promise<any> {
    const params: IRequestParams = {
      url: API_ENDPOINTS.verifications.requestDocs(verificationId),
      method: 'POST',
      data: {
        documents,
        message,
      },
    }

    const response = await makeRequest(params)
    return response.data
  },

  async getUsersNeedingReview(): Promise<any> {
    const params: IRequestParams = {
      url: `${API_BASE_URL}${USERS_NEEDING_REVIEW_ENDPOINT}`,
      method: 'GET',
    }

    const response = await makeRequest(params)
    return response.data
  },

  async getVerificationsByRole(role: string): Promise<any> {
    const params: IRequestParams = {
      url: `${API_BASE_URL}${VERIFICATIONS_BY_ROLE_ENDPOINT}`,
      method: 'GET',
      params: { role },
    }

    const response = await makeRequest(params)
    return response.data
  },

  async getPendingVerifications(): Promise<VerificationListResponse> {
    const params: IRequestParams = {
      url: `${API_BASE_URL}${VERIFICATIONS_PENDING_ENDPOINT}`,
      method: 'GET',
    }

    const response = await makeRequest(params)
    return response.data
  },

  async getAdminUserDocuments(userId: number): Promise<Document[]> {
    const params: IRequestParams = {
      url: `${API_BASE_URL}${DOCUMENTS_ENDPOINT}`,
      method: 'GET',
      params: { user: userId },
    }

    const response = await makeRequest(params)
    return response.data.results || response.data
  },

  async getAllDocuments(): Promise<any> {
    const params: IRequestParams = {
      url: `${API_BASE_URL}${DOCUMENTS_ENDPOINT}`,
      method: 'GET',
    }

    const response = await makeRequest(params)
    return response.data
  },

  // User-facing verification methods
  async getUserVerificationStatus(): Promise<VerificationData> {
    const params: IRequestParams = {
      url: `${API_BASE_URL}${USER_VERIFICATION_STATUS_ENDPOINT}`,
      method: 'GET',
    }

    const response = await makeRequest(params)
    return response.data
  },

  async getUserProfile(): Promise<ProfileData> {
    const params: IRequestParams = {
      url: `${API_BASE_URL}${USER_PROFILE_ENDPOINT}`,
      method: 'GET',
    }

    const response = await makeRequest(params)
    return response.data
  },

  async updateUserProfile(profileData: Partial<ProfileData>): Promise<any> {
    const params: IRequestParams = {
      url: `${API_BASE_URL}${USER_PROFILE_ENDPOINT}`,
      method: 'PATCH',
      data: profileData,
    }

    const response = await makeRequest(params)
    return response.data
  },

  async uploadUserDocument(documentData: DocumentUpload): Promise<UploadedDocument> {
    const params: IRequestParams = {
      url: `${API_BASE_URL}${USER_DOCUMENTS_ENDPOINT}`,
      method: 'POST',
      data: documentData,
    }

    const response = await makeRequest(params)
    return response.data
  },

  async getUserDocuments(): Promise<UploadedDocument[]> {
    const params: IRequestParams = {
      url: `${API_BASE_URL}${USER_DOCUMENTS_ENDPOINT}`,
      method: 'GET',
    }

    const response = await makeRequest(params)
    return response.data.results || response.data
  },

  // Utility functions
  fileToBase64(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader()
      reader.readAsDataURL(file)
      reader.onload = () => resolve(reader.result as string)
      reader.onerror = (error) => reject(error)
    })
  },

  isStepCompleted(stepName: string, currentStep: string): boolean {
    const stepOrder = ['documents', 'identity', 'contact', 'role_specific', 'final']
    return stepOrder.indexOf(stepName) < stepOrder.indexOf(currentStep)
  },

  getProgressPercentage(currentStep: string): number {
    const stepOrder = ['documents', 'identity', 'contact', 'role_specific', 'final']
    const currentIndex = stepOrder.indexOf(currentStep)
    return currentIndex >= 0 ? ((currentIndex + 1) / stepOrder.length) * 100 : 0
  },
}
