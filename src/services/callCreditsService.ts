/**
 * Call Credits Service
 * Handles all call credit bundle and user credit operations
 * Based on: /api/v1/admin/call-credits/
 */

import makeRequest from './makeRequest'
import type IRequestParams from '../models/models'
import API_ENDPOINTS from './apiConfig'

// ============================================
// TypeScript Interfaces
// ============================================

export interface CallCreditBundle {
  id: number
  name: string
  name_sw: string
  description: string
  description_sw: string
  minutes: number
  price: string
  currency: string
  validity_days: number
  is_active: boolean
  total_purchases: number
  total_revenue: string
  total_minutes_sold: number
  total_minutes_used: number
  formatted_price: string
  per_minute_cost: string
  created_at: string
  updated_at: string
}

export interface BundleFormData {
  name: string
  name_sw: string
  description: string
  description_sw: string
  minutes: number
  price: string
  currency?: string
  validity_days: number
  is_active?: boolean
}

export interface BundleFilters {
  is_active?: boolean
}

export interface UserDetails {
  id: number
  email: string
  full_name: string
}

export interface BundleDetails {
  id: number
  name: string
  price: number
}

export interface UsageStats {
  used_minutes: number
  usage_percent: number
  is_valid: boolean
  days_until_expiry: number
}

export interface UserCallCredit {
  id: number
  user: number
  user_details: UserDetails
  bundle: number
  bundle_details: BundleDetails
  total_minutes: number
  remaining_minutes: number
  purchase_date: string
  expiry_date: string
  status: 'active' | 'expired' | 'depleted'
  usage_stats: UsageStats
}

export interface UserCreditFilters {
  status?: 'active' | 'expired' | 'depleted'
  bundle_id?: number
  user_id?: number
  active_only?: boolean
  page?: number
  page_size?: number
}

export interface GrantCreditsData {
  user_id: number
  minutes: number
  validity_days: number
  reason?: string
}

export interface GrantCreditsResponse {
  success: boolean
  message: string
  reason?: string
  credit: UserCallCredit
}

export interface CallCreditStatistics {
  total_bundles: number
  active_bundles: number
  total_purchases: number
  total_revenue: string
  total_minutes_sold: number
  total_minutes_used: number
  total_minutes_remaining: number
  active_credits: number
  expired_credits: number
  average_usage_rate: string
}

export interface UsageDataPoint {
  period: string
  total_calls: number
  total_minutes: number
  unique_users: number
}

export interface UsageReport {
  period: 'daily' | 'weekly' | 'monthly'
  data: UsageDataPoint[]
}

export interface PaginatedResponse<T> {
  count: number
  page: number
  page_size: number
  results: T[]
}

export interface ActivateBundleData {
  is_active: boolean
}

export interface ActivateBundleResponse {
  success: boolean
  message: string
  bundle: CallCreditBundle
}

// ============================================
// Bundle Management Service
// ============================================

export const bundlesService = {
  /**
   * Get all bundles with optional filters
   */
  getAll: async (filters: BundleFilters = {}): Promise<CallCreditBundle[]> => {
    const queryParams: Record<string, string> = {}

    if (filters.is_active !== undefined) {
      queryParams.is_active = String(filters.is_active)
    }

    const queryString = new URLSearchParams(queryParams).toString()
    const url = queryString
      ? `${API_ENDPOINTS.callCredits.bundles.list()}?${queryString}`
      : API_ENDPOINTS.callCredits.bundles.list()

    const requestParams: IRequestParams = {
      url,
      method: 'GET',
    }

    const response = await makeRequest(requestParams)

    // Handle paginated response - extract results array
    if (response.data && response.data.results) {
      return response.data.results
    }

    // Fallback for non-paginated response
    return response.data
  },

  /**
   * Get bundle by ID
   */
  getById: async (id: number): Promise<CallCreditBundle> => {
    const requestParams: IRequestParams = {
      url: API_ENDPOINTS.callCredits.bundles.detail(id),
      method: 'GET',
    }

    const response = await makeRequest(requestParams)
    return response.data
  },

  /**
   * Create new bundle
   */
  create: async (data: BundleFormData): Promise<CallCreditBundle> => {
    const requestParams: IRequestParams = {
      url: API_ENDPOINTS.callCredits.bundles.list(),
      method: 'POST',
      data,
    }

    const response = await makeRequest(requestParams)
    return response.data
  },

  /**
   * Update bundle (full update - PUT)
   */
  update: async (id: number, data: BundleFormData): Promise<CallCreditBundle> => {
    const requestParams: IRequestParams = {
      url: API_ENDPOINTS.callCredits.bundles.detail(id),
      method: 'PUT',
      data,
    }

    const response = await makeRequest(requestParams)
    return response.data
  },

  /**
   * Partially update bundle (PATCH)
   */
  partialUpdate: async (id: number, data: Partial<BundleFormData>): Promise<CallCreditBundle> => {
    const requestParams: IRequestParams = {
      url: API_ENDPOINTS.callCredits.bundles.detail(id),
      method: 'PATCH',
      data,
    }

    const response = await makeRequest(requestParams)
    return response.data
  },

  /**
   * Delete bundle
   */
  delete: async (id: number): Promise<void> => {
    const requestParams: IRequestParams = {
      url: API_ENDPOINTS.callCredits.bundles.detail(id),
      method: 'DELETE',
    }

    await makeRequest(requestParams)
  },

  /**
   * Activate/Deactivate bundle
   */
  toggleActivation: async (id: number, is_active: boolean): Promise<ActivateBundleResponse> => {
    const requestParams: IRequestParams = {
      url: API_ENDPOINTS.callCredits.bundles.activate(id),
      method: 'POST',
      data: { is_active },
    }

    const response = await makeRequest(requestParams)
    return response.data
  },

  /**
   * Get bundle purchases with pagination
   */
  getPurchases: async (
    id: number,
    page: number = 1,
    page_size: number = 20,
  ): Promise<PaginatedResponse<UserCallCredit>> => {
    const queryParams = new URLSearchParams({
      page: String(page),
      page_size: String(page_size),
    }).toString()

    const requestParams: IRequestParams = {
      url: `${API_ENDPOINTS.callCredits.bundles.purchases(id)}?${queryParams}`,
      method: 'GET',
    }

    const response = await makeRequest(requestParams)
    return response.data
  },
}

// ============================================
// User Credits Management Service
// ============================================

export const userCreditsService = {
  /**
   * Get all user credits with filters
   */
  getAll: async (filters: UserCreditFilters = {}): Promise<UserCallCredit[]> => {
    const queryParams: Record<string, string> = {}

    if (filters.status) queryParams.status = filters.status
    if (filters.bundle_id) queryParams.bundle_id = String(filters.bundle_id)
    if (filters.user_id) queryParams.user_id = String(filters.user_id)
    if (filters.active_only !== undefined) queryParams.active_only = String(filters.active_only)
    if (filters.page) queryParams.page = String(filters.page)
    if (filters.page_size) queryParams.page_size = String(filters.page_size)

    const queryString = new URLSearchParams(queryParams).toString()
    const url = queryString
      ? `${API_ENDPOINTS.callCredits.users.list()}?${queryString}`
      : API_ENDPOINTS.callCredits.users.list()

    const requestParams: IRequestParams = {
      url,
      method: 'GET',
    }

    const response = await makeRequest(requestParams)

    // Handle paginated response - extract results array
    if (response.data && response.data.results) {
      return response.data.results
    }

    // Fallback for non-paginated response
    return response.data
  },

  /**
   * Grant free credits to a user
   */
  grantCredits: async (data: GrantCreditsData): Promise<GrantCreditsResponse> => {
    const requestParams: IRequestParams = {
      url: API_ENDPOINTS.callCredits.users.grant(),
      method: 'POST',
      data,
    }

    const response = await makeRequest(requestParams)
    return response.data
  },

  /**
   * Get call credit statistics
   */
  getStatistics: async (): Promise<CallCreditStatistics> => {
    const requestParams: IRequestParams = {
      url: API_ENDPOINTS.callCredits.users.stats(),
      method: 'GET',
    }

    const response = await makeRequest(requestParams)
    return response.data
  },

  /**
   * Get usage reports
   */
  getUsageReport: async (period: 'daily' | 'weekly' | 'monthly' = 'daily'): Promise<UsageReport> => {
    const queryParams = new URLSearchParams({ period }).toString()

    const requestParams: IRequestParams = {
      url: `${API_ENDPOINTS.callCredits.users.usage()}?${queryParams}`,
      method: 'GET',
    }

    const response = await makeRequest(requestParams)
    return response.data
  },
}

// ============================================
// Combined Service Export
// ============================================

const callCreditsService = {
  bundles: bundlesService,
  userCredits: userCreditsService,
}

export default callCreditsService
