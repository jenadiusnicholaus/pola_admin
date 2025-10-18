/**
 * Consultations Service
 * Handles consultation pricing, consultant profiles, and bookings management
 */

import { subscriptionApiClient, buildUrl } from './subscriptionApiClient'

// Types
export interface PricingConfiguration {
  id: number
  service_type: string
  service_type_display: string
  price: string
  currency: string
  platform_commission_percent: number
  consultant_share_percent: number
  is_active: boolean
  created_at: string
  updated_at: string
}

export interface ConsultantProfile {
  id: number
  user: {
    id: number
    email: string
    first_name: string
    last_name: string
    phone_number: string
    is_active: boolean
  }
  consultant_type: string
  specialization: string
  years_of_experience: number
  offers_mobile_consultations: boolean
  offers_physical_consultations: boolean
  city: string
  is_available: boolean
  total_consultations: number
  total_earnings: string
  average_rating: number
  total_reviews: number
  created_at: string
  updated_at: string
  total_bookings: number
  completed_bookings: number
  cancelled_bookings: number
  pending_bookings: number
}

export interface ConsultationBooking {
  id: number
  client: number
  client_email: string
  consultant: number
  consultant_name: string
  service_type: string
  scheduled_date: string
  scheduled_duration_minutes: number
  actual_duration_minutes?: number
  status: 'pending' | 'confirmed' | 'in_progress' | 'completed' | 'cancelled'
  total_amount: string
  client_notes?: string
  consultant_notes?: string
  created_at: string
  updated_at: string
}

export interface ConsultationFilters {
  service_type?: string
  status?: string
  email?: string
  consultant_id?: number
  start_date?: string
  end_date?: string
  page?: number
  page_size?: number
}

export interface ConsultationStatistics {
  total_bookings: number
  pending_bookings: number
  confirmed_bookings: number
  completed_bookings: number
  cancelled_bookings: number
  total_revenue: number
  total_consultants: number
  available_consultants: number
}

export interface CreatePricingData {
  service_type: string
  price: number | string
  currency?: string
  platform_commission_percent: number
  consultant_share_percent: number
  is_active?: boolean
}

export interface CreateConsultantData {
  user_id: number
  specialization: string
  years_of_experience: number
  bio?: string
  is_available?: boolean
}

export interface UpdateBookingStatusData {
  status: string
  notes?: string
}

export const consultationsService = {
  // ==================== Pricing Configuration ====================

  /**
   * Get all pricing configurations
   */
  getPricingConfigs: async (): Promise<PricingConfiguration[]> => {
    const response = await subscriptionApiClient.get(buildUrl('/admin/consultations/pricing/'))
    return response.data.results || response.data
  },

  /**
   * Get pricing by ID
   */
  getPricingById: async (id: number): Promise<PricingConfiguration> => {
    const response = await subscriptionApiClient.get(buildUrl(`/admin/consultations/pricing/${id}/`))
    return response.data
  },

  /**
   * Create pricing configuration
   */
  createPricing: async (data: CreatePricingData): Promise<PricingConfiguration> => {
    const response = await subscriptionApiClient.post(buildUrl('/admin/consultations/pricing/'), data)
    return response.data
  },

  /**
   * Update pricing configuration
   */
  updatePricing: async (id: number, data: Partial<CreatePricingData>): Promise<PricingConfiguration> => {
    const response = await subscriptionApiClient.patch(buildUrl(`/admin/consultations/pricing/${id}/`), data)
    return response.data
  },

  /**
   * Delete pricing configuration
   */
  deletePricing: async (id: number): Promise<void> => {
    await subscriptionApiClient.delete(buildUrl(`/admin/consultations/pricing/${id}/`))
  },

  // ==================== Consultant Profiles ====================

  /**
   * Get all consultants with filters
   */
  getConsultants: async (
    filters: ConsultationFilters = {},
  ): Promise<{ results: ConsultantProfile[]; count: number }> => {
    const params = new URLSearchParams()
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        params.append(key, String(value))
      }
    })
    const response = await subscriptionApiClient.get(buildUrl(`/admin/consultations/consultants/?${params.toString()}`))
    return response.data
  },

  /**
   * Get consultant by ID
   */
  getConsultantById: async (id: number): Promise<ConsultantProfile> => {
    const response = await subscriptionApiClient.get(buildUrl(`/admin/consultations/consultants/${id}/`))
    return response.data
  },

  /**
   * Create consultant profile
   */
  createConsultant: async (data: CreateConsultantData): Promise<ConsultantProfile> => {
    const response = await subscriptionApiClient.post(buildUrl('/admin/consultations/consultants/'), data)
    return response.data
  },

  /**
   * Update consultant profile
   */
  updateConsultant: async (id: number, data: Partial<CreateConsultantData>): Promise<ConsultantProfile> => {
    const response = await subscriptionApiClient.patch(buildUrl(`/admin/consultations/consultants/${id}/`), data)
    return response.data
  },

  /**
   * Delete consultant profile
   */
  deleteConsultant: async (id: number): Promise<void> => {
    await subscriptionApiClient.delete(buildUrl(`/admin/consultations/consultants/${id}/`))
  },

  /**
   * Toggle consultant availability
   */
  toggleAvailability: async (id: number): Promise<ConsultantProfile> => {
    const response = await subscriptionApiClient.post(
      buildUrl(`/admin/consultations/consultants/${id}/toggle-availability/`),
    )
    return response.data
  },

  /**
   * Get consultant bookings
   */
  getConsultantBookings: async (id: number): Promise<ConsultationBooking[]> => {
    const response = await subscriptionApiClient.get(buildUrl(`/admin/consultations/consultants/${id}/bookings/`))
    return response.data
  },

  /**
   * Get consultant earnings
   */
  getConsultantEarnings: async (id: number): Promise<any> => {
    const response = await subscriptionApiClient.get(buildUrl(`/admin/consultations/consultants/${id}/earnings/`))
    return response.data
  },

  // ==================== Consultation Bookings ====================

  /**
   * Get all bookings with filters
   */
  getBookings: async (
    filters: ConsultationFilters = {},
  ): Promise<{ results: ConsultationBooking[]; count: number }> => {
    const params = new URLSearchParams()
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        params.append(key, String(value))
      }
    })
    const response = await subscriptionApiClient.get(buildUrl(`/admin/consultations/bookings/?${params.toString()}`))
    return response.data
  },

  /**
   * Get booking by ID
   */
  getBookingById: async (id: number): Promise<ConsultationBooking> => {
    const response = await subscriptionApiClient.get(buildUrl(`/admin/consultations/bookings/${id}/`))
    return response.data
  },

  /**
   * Update booking status
   */
  updateBookingStatus: async (id: number, data: UpdateBookingStatusData): Promise<ConsultationBooking> => {
    const response = await subscriptionApiClient.post(
      buildUrl(`/admin/consultations/bookings/${id}/update-status/`),
      data,
    )
    return response.data
  },

  /**
   * Get consultation statistics
   * GET /api/v1/admin/consultations/bookings/stats/
   */
  getStatistics: async (): Promise<ConsultationStatistics> => {
    const response = await subscriptionApiClient.get(buildUrl('/admin/consultations/bookings/stats/'))
    return response.data
  },

  /**
   * Get consultation revenue
   */
  getRevenue: async (filters: ConsultationFilters = {}): Promise<any> => {
    const params = new URLSearchParams()
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        params.append(key, String(value))
      }
    })
    const response = await subscriptionApiClient.get(buildUrl(`/admin/consultations/revenue/?${params.toString()}`))
    return response.data
  },
}

export default consultationsService
