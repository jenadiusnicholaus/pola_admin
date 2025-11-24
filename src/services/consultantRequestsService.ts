/**
 * Consultant Requests Service
 * Handles all consultant registration requests and profile management operations
 */

import makeRequest from './makeRequest'
import type IRequestParams from '../models/models'

// ==================== Types ====================

export interface UserDetails {
  id: number
  email: string
  full_name: string
  phone: string
  profile_picture?: string | null
}

export interface ReviewerDetails {
  id: number
  email: string
  full_name: string
}

export interface ProfessionalInfo {
  full_name: string
  email: string
  phone: string
  years_of_experience: number | null
  specializations: string[]
  roll_number: string | null
  bar_membership_number: string | null
}

export interface ConsultantRequest {
  id: number
  user: number
  user_details: UserDetails
  consultant_type: 'advocate' | 'lawyer' | 'paralegal'
  consultant_type_display: string
  license_document: string | null
  id_document: string | null
  cv_document: string | null
  additional_documents: string | null
  offers_mobile_consultations: boolean
  offers_physical_consultations: boolean
  preferred_consultation_city: string
  professional_info: ProfessionalInfo
  status: 'pending' | 'approved' | 'rejected'
  status_display: string
  admin_notes: string
  reviewed_by: number | null
  reviewed_at: string | null
  created_at: string
  updated_at: string
  days_pending?: number
}

export interface ConsultantProfile {
  id: number
  user: UserDetails
  consultant_type: 'advocate' | 'lawyer' | 'paralegal'
  availability_status: 'available' | 'busy' | 'offline'
  offers_mobile_consultation: boolean
  offers_physical_consultation: boolean
  physical_consultation_location: string
  professional_license: string | null
  bio: string
  total_consultations: number
  total_earnings: string
  rating: string
  is_active: boolean
  created_at: string
}

export interface RequestStatistics {
  total_requests: number
  by_status: {
    pending: number
    approved: number
    rejected: number
  }
  by_consultant_type: {
    advocate: number
    lawyer: number
    paralegal: number
  }
  approval_rate: string
  rejection_rate: string
  pending_rate: string
  recent_requests: Array<{
    id: number
    user_email: string
    consultant_type: string
    status: string
    created_at: string
  }>
}

export interface ConsultantStatistics {
  total_consultants: number
  by_type: {
    advocate: number
    lawyer: number
    paralegal: number
  }
  by_availability: {
    available: number
    busy: number
    offline: number
  }
  active_consultants: number
  inactive_consultants: number
  total_consultations_completed: number
  total_earnings: string
  average_rating: string
  top_performers: Array<{
    id: number
    user_full_name: string
    consultant_type: string
    total_consultations: number
    total_earnings: string
    rating: string
  }>
}

export interface RequestFilters {
  status?: 'pending' | 'approved' | 'rejected'
  consultant_type?: 'advocate' | 'lawyer' | 'paralegal'
  date_from?: string
  date_to?: string
  search?: string
  ordering?: string
  page?: number
  page_size?: number
}

export interface ConsultantFilters {
  consultant_type?: 'advocate' | 'lawyer' | 'paralegal'
  availability_status?: 'available' | 'busy' | 'offline'
  search?: string
  ordering?: string
  page?: number
  page_size?: number
}

export interface PaginatedResponse<T> {
  count: number
  next: string | null
  previous: string | null
  results: T[]
}

export interface RejectData {
  reason: string
}

export interface UpdateConsultantData {
  bio?: string
  physical_consultation_location?: string
  is_active?: boolean
}

// ==================== API Endpoints ====================

const getBaseUrl = () => import.meta.env.VITE_API_BASE_URL
const getEndpoint = (key: string) => import.meta.env[key] || ''

const ENDPOINTS = {
  requests: {
    list: () => `${getBaseUrl()}${getEndpoint('VITE_ADMIN_CONSULTANT_REQUESTS')}`,
    detail: (id: number) => `${getBaseUrl()}${getEndpoint('VITE_ADMIN_CONSULTANT_REQUESTS')}${id}/`,
    pending: () => `${getBaseUrl()}${getEndpoint('VITE_ADMIN_CONSULTANT_REQUESTS_PENDING')}`,
    statistics: () => `${getBaseUrl()}${getEndpoint('VITE_ADMIN_CONSULTANT_REQUESTS_STATISTICS')}`,
    approve: (id: number) =>
      `${getBaseUrl()}${getEndpoint('VITE_ADMIN_CONSULTANT_REQUESTS_APPROVE').replace('{id}', String(id))}`,
    reject: (id: number) =>
      `${getBaseUrl()}${getEndpoint('VITE_ADMIN_CONSULTANT_REQUESTS_REJECT').replace('{id}', String(id))}`,
  },
  consultants: {
    list: () => `${getBaseUrl()}${getEndpoint('VITE_ADMIN_CONSULTANTS')}`,
    detail: (id: number) => `${getBaseUrl()}${getEndpoint('VITE_ADMIN_CONSULTANTS')}${id}/`,
    statistics: () => `${getBaseUrl()}${getEndpoint('VITE_ADMIN_CONSULTANTS_STATISTICS')}`,
    toggleAvailability: (id: number) =>
      `${getBaseUrl()}${getEndpoint('VITE_ADMIN_CONSULTANTS_TOGGLE').replace('{id}', String(id))}`,
  },
}

// ==================== Service Methods ====================

export const consultantRequestsService = {
  // ========== Request Management ==========

  /**
   * Get all consultant requests with optional filters
   */
  getAllRequests: async (filters: RequestFilters = {}): Promise<PaginatedResponse<ConsultantRequest>> => {
    const queryParams: Record<string, string> = {}

    if (filters.status) queryParams.status = filters.status
    if (filters.consultant_type) queryParams.consultant_type = filters.consultant_type
    if (filters.date_from) queryParams.date_from = filters.date_from
    if (filters.date_to) queryParams.date_to = filters.date_to
    if (filters.search) queryParams.search = filters.search
    if (filters.ordering) queryParams.ordering = filters.ordering
    if (filters.page) queryParams.page = String(filters.page)
    if (filters.page_size) queryParams.page_size = String(filters.page_size)

    const queryString = new URLSearchParams(queryParams).toString()
    const url = queryString ? `${ENDPOINTS.requests.list()}?${queryString}` : ENDPOINTS.requests.list()

    const requestParams: IRequestParams = {
      url,
      method: 'GET',
    }

    const response = await makeRequest(requestParams)
    return response.data
  },

  /**
   * Get request by ID
   */
  getRequestById: async (id: number): Promise<ConsultantRequest> => {
    const requestParams: IRequestParams = {
      url: ENDPOINTS.requests.detail(id),
      method: 'GET',
    }

    const response = await makeRequest(requestParams)
    return response.data
  },

  /**
   * Get pending requests only
   */
  getPendingRequests: async (): Promise<{ count: number; pending_requests: ConsultantRequest[] }> => {
    const requestParams: IRequestParams = {
      url: ENDPOINTS.requests.pending(),
      method: 'GET',
    }

    const response = await makeRequest(requestParams)
    return response.data
  },

  /**
   * Get request statistics
   */
  getRequestStatistics: async (): Promise<RequestStatistics> => {
    const requestParams: IRequestParams = {
      url: ENDPOINTS.requests.statistics(),
      method: 'GET',
    }

    const response = await makeRequest(requestParams)
    return response.data
  },

  /**
   * Approve a consultant request
   */
  approveRequest: async (id: number): Promise<any> => {
    const requestParams: IRequestParams = {
      url: ENDPOINTS.requests.approve(id),
      method: 'POST',
    }

    const response = await makeRequest(requestParams)
    return response.data
  },

  /**
   * Reject a consultant request
   */
  rejectRequest: async (id: number, data: RejectData): Promise<any> => {
    const requestParams: IRequestParams = {
      url: ENDPOINTS.requests.reject(id),
      method: 'POST',
      data,
    }

    const response = await makeRequest(requestParams)
    return response.data
  },

  // ========== Consultant Management ==========

  /**
   * Get all consultants with optional filters
   */
  getAllConsultants: async (filters: ConsultantFilters = {}): Promise<PaginatedResponse<ConsultantProfile>> => {
    const queryParams: Record<string, string> = {}

    if (filters.consultant_type) queryParams.consultant_type = filters.consultant_type
    if (filters.availability_status) queryParams.availability_status = filters.availability_status
    if (filters.search) queryParams.search = filters.search
    if (filters.ordering) queryParams.ordering = filters.ordering
    if (filters.page) queryParams.page = String(filters.page)
    if (filters.page_size) queryParams.page_size = String(filters.page_size)

    const queryString = new URLSearchParams(queryParams).toString()
    const url = queryString ? `${ENDPOINTS.consultants.list()}?${queryString}` : ENDPOINTS.consultants.list()

    const requestParams: IRequestParams = {
      url,
      method: 'GET',
    }

    const response = await makeRequest(requestParams)
    return response.data
  },

  /**
   * Get consultant by ID
   */
  getConsultantById: async (id: number): Promise<ConsultantProfile> => {
    const requestParams: IRequestParams = {
      url: ENDPOINTS.consultants.detail(id),
      method: 'GET',
    }

    const response = await makeRequest(requestParams)
    return response.data
  },

  /**
   * Get consultant statistics
   */
  getConsultantStatistics: async (): Promise<ConsultantStatistics> => {
    const requestParams: IRequestParams = {
      url: ENDPOINTS.consultants.statistics(),
      method: 'GET',
    }

    const response = await makeRequest(requestParams)
    return response.data
  },

  /**
   * Update consultant profile
   */
  updateConsultant: async (id: number, data: UpdateConsultantData): Promise<ConsultantProfile> => {
    const requestParams: IRequestParams = {
      url: ENDPOINTS.consultants.detail(id),
      method: 'PATCH',
      data,
    }

    const response = await makeRequest(requestParams)
    return response.data
  },

  /**
   * Toggle consultant availability
   */
  toggleAvailability: async (id: number): Promise<any> => {
    const requestParams: IRequestParams = {
      url: ENDPOINTS.consultants.toggleAvailability(id),
      method: 'POST',
    }

    const response = await makeRequest(requestParams)
    return response.data
  },
}

export default consultantRequestsService
