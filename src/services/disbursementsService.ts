/**
 * Disbursements Service
 * Handles disbursement management and earnings tracking
 * Based on: /api/v1/admin/disbursements/ and /api/v1/admin/earnings/
 */

import makeRequest from './makeRequest'
import type IRequestParams from '../models/models'
import { API_ENDPOINTS } from './apiConfig'

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
  recipient_full_name: string
  recipient_phone: string
  recipient_name: string
  disbursement_type: 'consultant' | 'uploader'
  amount: string
  currency: string
  payment_method: string
  azampay_transaction_id: string | null
  external_reference: string
  status: 'pending' | 'processing' | 'completed' | 'failed'
  consultant_earnings_count: number
  uploader_earnings_count: number
  initiated_by: number
  initiated_by_email: string
  notes: string
  failure_reason: string
  initiated_at: string
  processed_at: string | null
  completed_at: string | null
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
  // ==================== Disbursements ====================

  /**
   * Get all disbursements with filters
   * Endpoint: GET /api/v1/admin/disbursements/
   */
  getDisbursements: async (filters: EarningsFilters = {}): Promise<{ results: Disbursement[]; count: number }> => {
    const queryParams = new URLSearchParams()
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        queryParams.append(key, String(value))
      }
    })

    const baseUrl = API_ENDPOINTS.disbursements.list()
    const url = queryParams.toString() ? `${baseUrl}?${queryParams.toString()}` : baseUrl

    const params: IRequestParams = {
      url,
      method: 'GET',
    }
    const response = await makeRequest(params)
    return response.data
  },

  /**
   * Get disbursement by ID
   * Endpoint: GET /api/v1/admin/disbursements/{id}/
   */
  getDisbursementById: async (id: number): Promise<Disbursement> => {
    const params: IRequestParams = {
      url: API_ENDPOINTS.disbursements.detail(id),
      method: 'GET',
    }
    const response = await makeRequest(params)
    return response.data
  },

  /**
   * Create a new disbursement
   * Endpoint: POST /api/v1/admin/disbursements/
   */
  createDisbursement: async (data: {
    recipient: number
    disbursement_type: 'consultant' | 'uploader'
    amount: string
    payment_method: string
    recipient_phone: string
    notes?: string
    consultant_earnings?: number[]
    uploader_earnings?: number[]
  }): Promise<Disbursement> => {
    const params: IRequestParams = {
      url: API_ENDPOINTS.disbursements.list(),
      method: 'POST',
      data,
    }
    const response = await makeRequest(params)
    return response.data
  },

  /**
   * Process a pending disbursement
   * Endpoint: POST /api/v1/admin/disbursements/{id}/process/
   */
  processDisbursement: async (id: number): Promise<Disbursement> => {
    const params: IRequestParams = {
      url: API_ENDPOINTS.disbursements.process(id),
      method: 'POST',
    }
    const response = await makeRequest(params)
    return response.data
  },

  /**
   * Cancel a disbursement
   * Endpoint: POST /api/v1/admin/disbursements/{id}/cancel/
   */
  cancelDisbursement: async (id: number, reason: string): Promise<Disbursement> => {
    const params: IRequestParams = {
      url: API_ENDPOINTS.disbursements.cancel(id),
      method: 'POST',
      data: { reason },
    }
    const response = await makeRequest(params)
    return response.data
  },

  /**
   * Check disbursement status with AzamPay
   * Endpoint: POST /api/v1/admin/disbursements/{id}/check_status/
   */
  checkDisbursementStatus: async (id: number): Promise<any> => {
    const params: IRequestParams = {
      url: API_ENDPOINTS.disbursements.checkStatus(id),
      method: 'POST',
    }
    const response = await makeRequest(params)
    return response.data
  },

  /**
   * Get pending disbursements
   * Endpoint: GET /api/v1/admin/disbursements/pending/
   */
  getPendingDisbursements: async (): Promise<Disbursement[]> => {
    const params: IRequestParams = {
      url: API_ENDPOINTS.disbursements.pending(),
      method: 'GET',
    }
    const response = await makeRequest(params)
    return response.data
  },

  /**
   * Get disbursement statistics
   * Endpoint: GET /api/v1/admin/disbursements/statistics/
   */
  getDisbursementStatistics: async (): Promise<{
    summary: {
      total_count: number
      total_amount: number
    }
    by_status: Record<string, { count: number; total_amount: number }>
    by_type: Record<string, { count: number; total_amount: number }>
  }> => {
    const params: IRequestParams = {
      url: API_ENDPOINTS.disbursements.statistics(),
      method: 'GET',
    }
    const response = await makeRequest(params)
    return response.data
  },

  // ==================== Earnings Management ====================

  /**
   * Get consultant earnings
   * Endpoint: GET /api/v1/admin/earnings/consultant/
   */
  getConsultantEarnings: async (
    filters: EarningsFilters = {},
  ): Promise<{ results: ConsultantEarning[]; count: number }> => {
    const queryParams = new URLSearchParams()
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        queryParams.append(key, String(value))
      }
    })

    const baseUrl = API_ENDPOINTS.earnings.consultant()
    const url = queryParams.toString() ? `${baseUrl}?${queryParams.toString()}` : baseUrl

    const params: IRequestParams = {
      url,
      method: 'GET',
    }
    const response = await makeRequest(params)
    return response.data
  },

  /**
   * Get uploader earnings
   * Endpoint: GET /api/v1/admin/earnings/uploader/
   */
  getUploaderEarnings: async (
    filters: EarningsFilters = {},
  ): Promise<{ results: UploaderEarning[]; count: number }> => {
    const queryParams = new URLSearchParams()
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        queryParams.append(key, String(value))
      }
    })

    const baseUrl = API_ENDPOINTS.earnings.uploader()
    const url = queryParams.toString() ? `${baseUrl}?${queryParams.toString()}` : baseUrl

    const params: IRequestParams = {
      url,
      method: 'GET',
    }
    const response = await makeRequest(params)
    return response.data
  },

  /**
   * Get unpaid earnings
   * Endpoint: GET /api/v1/admin/earnings/unpaid/
   */
  getUnpaidEarnings: async (): Promise<{
    consultant_earnings: {
      count: number
      total_amount: number
      earnings: ConsultantEarning[]
    }
    uploader_earnings: {
      count: number
      total_amount: number
      earnings: UploaderEarning[]
    }
    total_unpaid: number
  }> => {
    const params: IRequestParams = {
      url: API_ENDPOINTS.earnings.unpaid(),
      method: 'GET',
    }
    const response = await makeRequest(params)
    return response.data
  },

  /**
   * Get earnings summary
   * Endpoint: GET /api/v1/admin/earnings/summary/
   */
  getEarningsSummary: async (
    user_id?: number,
  ): Promise<{
    count: number
    summaries: Array<{
      user_id: number
      user_email: string
      user_name: string
      total_consultant_earnings: number
      paid_consultant_earnings: number
      unpaid_consultant_earnings: number
      total_uploader_earnings: number
      paid_uploader_earnings: number
      unpaid_uploader_earnings: number
      total_earnings: number
      total_unpaid: number
    }>
  }> => {
    const queryParams = user_id ? `?user_id=${user_id}` : ''
    const params: IRequestParams = {
      url: `${API_ENDPOINTS.earnings.summary()}${queryParams}`,
      method: 'GET',
    }
    const response = await makeRequest(params)
    return response.data
  },

  /**
   * Create bulk payout
   * Endpoint: POST /api/v1/admin/earnings/bulk_payout/
   */
  createBulkPayout: async (data: {
    user_id: number
    phone_number: string
    payment_method: string
    earnings_type: 'consultant' | 'uploader' | 'all'
  }): Promise<Disbursement> => {
    const params: IRequestParams = {
      url: API_ENDPOINTS.earnings.bulkPayout(),
      method: 'POST',
      data,
    }
    const response = await makeRequest(params)
    return response.data
  },

  // ==================== Legacy Methods (Deprecated - for backwards compatibility) ====================

  /**
   * @deprecated Use getConsultantEarnings instead
   */
  getConsultantEarningById: async (id: number): Promise<ConsultantEarning> => {
    const params: IRequestParams = {
      url: API_ENDPOINTS.disbursements.detail(id),
      method: 'GET',
    }
    const response = await makeRequest(params)
    return response.data
  },

  /**
   * @deprecated Use processDisbursement instead
   */
  markConsultantEarningPaid: async (id: number, data: MarkPaidData): Promise<ConsultantEarning> => {
    const params: IRequestParams = {
      url: API_ENDPOINTS.disbursements.process(id),
      method: 'POST',
      data,
    }
    const response = await makeRequest(params)
    return response.data
  },

  /**
   * @deprecated Use getUnpaidEarnings instead
   */
  getPendingConsultantEarnings: async (): Promise<ConsultantEarning[]> => {
    const response = await disbursementsService.getUnpaidEarnings()
    return response.consultant_earnings.earnings
  },

  /**
   * @deprecated Use getDisbursementStatistics instead
   */
  getConsultantEarningsStats: async (): Promise<EarningsStatistics> => {
    const stats = await disbursementsService.getDisbursementStatistics()
    return {
      total_earnings: String(stats.summary.total_amount),
      pending_earnings: String(stats.by_status.pending?.total_amount || 0),
      paid_earnings: String(stats.by_status.completed?.total_amount || 0),
      total_consultants: stats.by_type.consultant?.count || 0,
      earnings_this_month: '0',
      disbursements_this_month: 0,
    }
  },

  /**
   * @deprecated Use getUploaderEarnings instead
   */
  getUploaderEarningById: async (id: number): Promise<UploaderEarning> => {
    const params: IRequestParams = {
      url: API_ENDPOINTS.disbursements.detail(id),
      method: 'GET',
    }
    const response = await makeRequest(params)
    return response.data
  },

  /**
   * @deprecated Use processDisbursement instead
   */
  markUploaderEarningPaid: async (id: number, data: MarkPaidData): Promise<UploaderEarning> => {
    const params: IRequestParams = {
      url: API_ENDPOINTS.disbursements.process(id),
      method: 'POST',
      data,
    }
    const response = await makeRequest(params)
    return response.data
  },

  /**
   * @deprecated Use getUnpaidEarnings instead
   */
  getPendingUploaderEarnings: async (): Promise<UploaderEarning[]> => {
    const response = await disbursementsService.getUnpaidEarnings()
    return response.uploader_earnings.earnings
  },

  /**
   * @deprecated Use getDisbursementStatistics instead
   */
  getUploaderEarningsStats: async (): Promise<EarningsStatistics> => {
    const stats = await disbursementsService.getDisbursementStatistics()
    return {
      total_earnings: String(stats.summary.total_amount),
      pending_earnings: String(stats.by_status.pending?.total_amount || 0),
      paid_earnings: String(stats.by_status.completed?.total_amount || 0),
      total_uploaders: stats.by_type.uploader?.count || 0,
      earnings_this_month: '0',
      disbursements_this_month: 0,
    }
  },
}

export default disbursementsService
