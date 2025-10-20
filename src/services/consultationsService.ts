/**
 * Consultations Service
 * Handles consultation pricing, consultant profiles, and bookings management
 * Based on: /api/v1/admin/consultations/
 */

import makeRequest from './makeRequest'
import type IRequestParams from '../models/models'
import { API_ENDPOINTS } from './apiConfig'

// TypeScript Interfaces
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
  client: {
    id: number
    email: string
    first_name: string
    last_name: string
    phone_number: string | null
    is_active: boolean
  }
  consultant: {
    id: number
    email: string
    first_name: string
    last_name: string
    phone_number: string | null
    is_active: boolean
  }
  consultant_profile_details: any | null
  booking_type: 'mobile' | 'physical'
  status: 'pending' | 'confirmed' | 'completed' | 'cancelled'
  scheduled_date: string
  scheduled_duration_minutes: number
  actual_start_time: string | null
  actual_end_time: string | null
  actual_duration_minutes: number
  total_amount: string
  platform_commission: string
  consultant_earnings: string
  meeting_location: string
  client_notes: string
  consultant_notes: string
  created_at: string
  updated_at: string
  payment_details: any | null
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
  consultant_type: string
  specialization: string
  years_of_experience: number
  offers_mobile_consultations?: boolean
  offers_physical_consultations?: boolean
  city?: string
  is_available?: boolean
}

export interface UpdateBookingStatusData {
  status: string
  notes?: string
}

export interface ConsultantFilters {
  is_available?: boolean
  specialization?: string
  consultant_type?: string
  city?: string
}

export interface BookingFilters {
  booking_type?: string
  status?: string
  client_email?: string
  consultant_id?: number
  start_date?: string
  end_date?: string
  page?: number
  page_size?: number
}

export interface ConsultantEarnings {
  consultant_id: number
  total_earnings: string
  monthly_earnings: Record<string, string>
  total_bookings: number
}

export const consultationsService = {
  // Pricing Configuration
  getPricingConfigs: async (): Promise<PricingConfiguration[]> => {
    const params: IRequestParams = {
      url: API_ENDPOINTS.consultations.pricing.list(),
      method: 'GET',
    }
    const response = await makeRequest(params)
    return response.data.results || response.data || []
  },

  getPricingById: async (id: number): Promise<PricingConfiguration> => {
    const params: IRequestParams = {
      url: API_ENDPOINTS.consultations.pricing.detail(id),
      method: 'GET',
    }
    const response = await makeRequest(params)
    return response.data
  },

  createPricing: async (data: CreatePricingData): Promise<PricingConfiguration> => {
    const params: IRequestParams = {
      url: API_ENDPOINTS.consultations.pricing.list(),
      method: 'POST',
      data,
    }
    const response = await makeRequest(params)
    return response.data
  },

  updatePricing: async (id: number, data: Partial<CreatePricingData>): Promise<PricingConfiguration> => {
    const params: IRequestParams = {
      url: API_ENDPOINTS.consultations.pricing.detail(id),
      method: 'PATCH',
      data,
    }
    const response = await makeRequest(params)
    return response.data
  },

  deletePricing: async (id: number): Promise<void> => {
    const params: IRequestParams = {
      url: API_ENDPOINTS.consultations.pricing.detail(id),
      method: 'DELETE',
    }
    await makeRequest(params)
  },

  // Consultant Profiles
  getConsultants: async (filters: ConsultantFilters = {}): Promise<{ results: ConsultantProfile[]; count: number }> => {
    const queryParams = new URLSearchParams()
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        queryParams.append(key, String(value))
      }
    })

    const baseUrl = API_ENDPOINTS.consultations.consultants.list()
    const url = queryParams.toString() ? `${baseUrl}?${queryParams.toString()}` : baseUrl

    console.log('[Service] Calling consultants API:', url)
    const params: IRequestParams = {
      url,
      method: 'GET',
    }
    const response = await makeRequest(params)
    console.log('[Service] Raw axios response:', response)
    console.log('[Service] Response.data type:', typeof response.data)
    console.log('[Service] Response.data:', response.data)
    console.log('[Service] Is array?:', Array.isArray(response.data))
    console.log('[Service] Has results?:', response.data?.results !== undefined)

    // Return the data structure expected
    if (response.data.results) {
      return response.data
    } else if (Array.isArray(response.data)) {
      return { results: response.data, count: response.data.length }
    } else {
      console.error('[Service] Unexpected response structure:', response.data)
      return { results: [], count: 0 }
    }
  },

  getConsultantById: async (id: number): Promise<ConsultantProfile> => {
    const params: IRequestParams = {
      url: API_ENDPOINTS.consultations.consultants.detail(id),
      method: 'GET',
    }
    const response = await makeRequest(params)
    return response.data
  },

  createConsultant: async (data: CreateConsultantData): Promise<ConsultantProfile> => {
    const params: IRequestParams = {
      url: API_ENDPOINTS.consultations.consultants.list(),
      method: 'POST',
      data,
    }
    const response = await makeRequest(params)
    return response.data
  },

  updateConsultant: async (id: number, data: Partial<CreateConsultantData>): Promise<ConsultantProfile> => {
    const params: IRequestParams = {
      url: API_ENDPOINTS.consultations.consultants.detail(id),
      method: 'PATCH',
      data,
    }
    const response = await makeRequest(params)
    return response.data
  },

  deleteConsultant: async (id: number): Promise<void> => {
    const params: IRequestParams = {
      url: API_ENDPOINTS.consultations.consultants.detail(id),
      method: 'DELETE',
    }
    await makeRequest(params)
  },

  toggleAvailability: async (id: number, is_available: boolean): Promise<any> => {
    const params: IRequestParams = {
      url: API_ENDPOINTS.consultations.consultants.toggleAvailability(id),
      method: 'POST',
      data: { is_available },
    }
    const response = await makeRequest(params)
    return response.data
  },

  getConsultantBookings: async (
    id: number,
    filters: BookingFilters = {},
  ): Promise<{ results: ConsultationBooking[]; count: number; page: number; page_size: number }> => {
    const queryParams = new URLSearchParams()
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        queryParams.append(key, String(value))
      }
    })

    const baseUrl = API_ENDPOINTS.consultations.consultants.bookings(id)
    const url = queryParams.toString() ? `${baseUrl}?${queryParams.toString()}` : baseUrl

    const params: IRequestParams = {
      url,
      method: 'GET',
    }
    const response = await makeRequest(params)
    return response.data
  },

  getConsultantEarnings: async (id: number): Promise<ConsultantEarnings> => {
    const params: IRequestParams = {
      url: API_ENDPOINTS.consultations.consultants.earnings(id),
      method: 'GET',
    }
    const response = await makeRequest(params)
    return response.data
  },

  // Consultation Bookings
  getBookings: async (filters: BookingFilters = {}): Promise<{ results: ConsultationBooking[]; count: number }> => {
    const queryParams = new URLSearchParams()
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        queryParams.append(key, String(value))
      }
    })

    const baseUrl = API_ENDPOINTS.consultations.bookings.list()
    const url = queryParams.toString() ? `${baseUrl}?${queryParams.toString()}` : baseUrl

    const params: IRequestParams = {
      url,
      method: 'GET',
    }
    const response = await makeRequest(params)
    return response.data
  },

  getBookingById: async (id: number): Promise<ConsultationBooking> => {
    const params: IRequestParams = {
      url: API_ENDPOINTS.consultations.bookings.detail(id),
      method: 'GET',
    }
    const response = await makeRequest(params)
    return response.data
  },

  updateBookingStatus: async (id: number, data: UpdateBookingStatusData): Promise<ConsultationBooking> => {
    const params: IRequestParams = {
      url: API_ENDPOINTS.consultations.bookings.updateStatus(id),
      method: 'POST',
      data,
    }
    const response = await makeRequest(params)
    return response.data
  },

  getStatistics: async (): Promise<ConsultationStatistics> => {
    const params: IRequestParams = {
      url: API_ENDPOINTS.consultations.bookings.stats(),
      method: 'GET',
    }
    const response = await makeRequest(params)
    return response.data
  },

  getRevenue: async (filters: BookingFilters = {}): Promise<any> => {
    const queryParams = new URLSearchParams()
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        queryParams.append(key, String(value))
      }
    })

    const baseUrl = API_ENDPOINTS.consultations.revenue()
    const url = queryParams.toString() ? `${baseUrl}?${queryParams.toString()}` : baseUrl

    const params: IRequestParams = {
      url,
      method: 'GET',
    }
    const response = await makeRequest(params)
    return response.data
  },
}

export default consultationsService
