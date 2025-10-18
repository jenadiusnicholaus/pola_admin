/**
 * Disbursements Service
 * Handles consultant and uploader earnings tracking and disbursement management
 */

import { subscriptionApiClient, buildUrl } from './subscriptionApiClient'

// Types
export interface ConsultantEarning {
  id: number
  consultant: number
  consultant_email: string
  consultant_name: string
  booking: number
  booking_reference: string
  total_amount: string
  consultant_share: string
  platform_commission: string
  status: 'pending' | 'paid' | 'cancelled'
  created_at: string
  paid_at?: string
  disbursement_reference?: string
}

export interface UploaderEarning {
  id: number
  uploader: number
  uploader_email: string
  uploader_name: string
  material: number
  material_title: string
  sale_amount: string
  uploader_share: string
  platform_commission: string
  status: 'pending' | 'paid' | 'cancelled'
  created_at: string
  paid_at?: string
  disbursement_reference?: string
}

export interface Disbursement {
  id: number
  recipient: number
  recipient_email: string
  recipient_name: string
  recipient_type: 'consultant' | 'uploader'
  total_amount: string
  items_count: number
  reference_number: string
  payment_method: string
  status: 'pending' | 'processing' | 'completed' | 'failed'
  created_at: string
  processed_at?: string
  completed_at?: string
}

export interface EarningsFilters {
  status?: string
  email?: string
  start_date?: string
  end_date?: string
  page?: number
  page_size?: number
}

export interface EarningsStatistics {
  total_earnings: string
  pending_earnings: string
  paid_earnings: string
  total_consultants?: number
  total_uploaders?: number
  earnings_this_month: string
  disbursements_this_month: number
}

export interface MarkPaidData {
  disbursement_reference: string
  payment_method?: string
  notes?: string
}

export const disbursementsService = {
  // ==================== Disbursements (Correct API from changeslog.md) ====================

  /**
   * Get all disbursements with filters
   * Endpoint: GET /api/v1/admin/disbursements/
   */
  getDisbursements: async (filters: EarningsFilters = {}): Promise<{ results: Disbursement[]; count: number }> => {
    const params = new URLSearchParams()
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        params.append(key, String(value))
      }
    })
    const response = await subscriptionApiClient.get(buildUrl(`/admin/disbursements/?${params.toString()}`))
    return response.data
  },

  /**
   * Get disbursement by ID
   * Endpoint: GET /api/v1/admin/disbursements/{id}/
   */
  getDisbursementById: async (id: number): Promise<Disbursement> => {
    const response = await subscriptionApiClient.get(buildUrl(`/admin/disbursements/${id}/`))
    return response.data
  },

  /**
   * Initiate a new disbursement
   * Endpoint: POST /api/v1/admin/disbursements/
   */
  createDisbursement: async (data: {
    recipient: number
    disbursement_type: 'consultant' | 'uploader'
    amount: string
    payment_method: string
    recipient_phone: string
    notes?: string
  }): Promise<Disbursement> => {
    const response = await subscriptionApiClient.post(buildUrl('/admin/disbursements/'), data)
    return response.data
  },

  /**
   * Process a pending disbursement
   * Endpoint: POST /api/v1/admin/disbursements/{id}/process/
   */
  processDisbursement: async (id: number): Promise<Disbursement> => {
    const response = await subscriptionApiClient.post(buildUrl(`/admin/disbursements/${id}/process/`))
    return response.data
  },

  /**
   * Cancel a disbursement
   * Endpoint: POST /api/v1/admin/disbursements/{id}/cancel/
   */
  cancelDisbursement: async (id: number, reason: string): Promise<Disbursement> => {
    const response = await subscriptionApiClient.post(buildUrl(`/admin/disbursements/${id}/cancel/`), { reason })
    return response.data
  },

  /**
   * Check disbursement status with AzamPay
   * Endpoint: POST /api/v1/admin/disbursements/{id}/check_status/
   */
  checkDisbursementStatus: async (id: number): Promise<Disbursement> => {
    const response = await subscriptionApiClient.post(buildUrl(`/admin/disbursements/${id}/check_status/`))
    return response.data
  },

  /**
   * Get pending disbursements
   * Endpoint: GET /api/v1/admin/disbursements/pending/
   */
  getPendingDisbursements: async (): Promise<Disbursement[]> => {
    const response = await subscriptionApiClient.get(buildUrl('/admin/disbursements/pending/'))
    return response.data
  },

  /**
   * Get disbursement statistics
   * Endpoint: GET /api/v1/admin/disbursements/statistics/
   */
  getDisbursementStatistics: async (): Promise<{
    total_disbursements: number
    pending_count: number
    processing_count: number
    completed_count: number
    failed_count: number
    total_amount_disbursed: string
    pending_amount: string
    average_processing_time_hours: number
  }> => {
    const response = await subscriptionApiClient.get(buildUrl('/admin/disbursements/statistics/'))
    return response.data
  },

  // ==================== Legacy Consultant/Uploader Earnings (Keep for backwards compatibility) ====================

  /**
   * @deprecated Use getDisbursements with type filter instead
   */
  getConsultantEarnings: async (
    filters: EarningsFilters = {},
  ): Promise<{ results: ConsultantEarning[]; count: number }> => {
    const params = new URLSearchParams()
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        params.append(key, String(value))
      }
    })
    // Use main disbursements endpoint with type filter
    params.append('type', 'consultant')
    const response = await subscriptionApiClient.get(buildUrl(`/admin/disbursements/?${params.toString()}`))
    return response.data
  },

  /**
   * @deprecated Use getDisbursementById instead
   */
  getConsultantEarningById: async (id: number): Promise<ConsultantEarning> => {
    const response = await subscriptionApiClient.get(buildUrl(`/admin/disbursements/${id}/`))
    return response.data
  },

  /**
   * @deprecated Use processDisbursement instead
   */
  markConsultantEarningPaid: async (id: number, data: MarkPaidData): Promise<ConsultantEarning> => {
    const response = await subscriptionApiClient.post(buildUrl(`/admin/disbursements/${id}/process/`), data)
    return response.data
  },

  /**
   * @deprecated Use getPendingDisbursements with type filter
   */
  getPendingConsultantEarnings: async (): Promise<ConsultantEarning[]> => {
    const response = await subscriptionApiClient.get(buildUrl('/admin/disbursements/pending/?type=consultant'))
    return response.data
  },

  /**
   * @deprecated Use getDisbursementStatistics instead
   */
  getConsultantEarningsStats: async (): Promise<EarningsStatistics> => {
    const response = await subscriptionApiClient.get(buildUrl('/admin/disbursements/statistics/'))
    return response.data
  },

  /**
   * @deprecated Use getDisbursements with type filter instead
   */
  getUploaderEarnings: async (
    filters: EarningsFilters = {},
  ): Promise<{ results: UploaderEarning[]; count: number }> => {
    const params = new URLSearchParams()
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        params.append(key, String(value))
      }
    })
    params.append('type', 'uploader')
    const response = await subscriptionApiClient.get(buildUrl(`/admin/disbursements/?${params.toString()}`))
    return response.data
  },

  /**
   * @deprecated Use getDisbursementById instead
   */
  getUploaderEarningById: async (id: number): Promise<UploaderEarning> => {
    const response = await subscriptionApiClient.get(buildUrl(`/admin/disbursements/${id}/`))
    return response.data
  },

  /**
   * @deprecated Use processDisbursement instead
   */
  markUploaderEarningPaid: async (id: number, data: MarkPaidData): Promise<UploaderEarning> => {
    const response = await subscriptionApiClient.post(buildUrl(`/admin/disbursements/${id}/process/`), data)
    return response.data
  },

  /**
   * @deprecated Use getPendingDisbursements with type filter
   */
  getPendingUploaderEarnings: async (): Promise<UploaderEarning[]> => {
    const response = await subscriptionApiClient.get(buildUrl('/admin/disbursements/pending/?type=uploader'))
    return response.data
  },

  /**
   * @deprecated Use getDisbursementStatistics instead
   */
  getUploaderEarningsStats: async (): Promise<EarningsStatistics> => {
    const response = await subscriptionApiClient.get(buildUrl('/admin/disbursements/statistics/'))
    return response.data
  },
}

export default disbursementsService
