/**
 * Transactions Service
 * Handles all transaction operations including refunds
 */

import { subscriptionApiClient, buildUrl, ENDPOINTS } from './subscriptionApiClient'

export interface Transaction {
  id: number
  user: {
    id: number
    email: string
    first_name: string
    last_name: string
  }
  subscription?: {
    id: number
    plan_name: string
  }
  type: 'subscription' | 'refund' | 'wallet_topup' | 'wallet_deduction'
  status: 'pending' | 'completed' | 'failed' | 'cancelled'
  amount: string
  currency: string
  payment_method: string
  reference_number: string
  description: string
  metadata?: Record<string, any>
  created_at: string
  updated_at: string
  completed_at?: string
}

export interface TransactionFilters {
  status?: string
  type?: string
  payment_method?: string
  start_date?: string
  end_date?: string
  email?: string
  page?: number
  page_size?: number
}

export interface TransactionStatistics {
  total_transactions: number
  completed_transactions: number
  pending_transactions: number
  failed_transactions: number
  total_revenue: number
  total_refunds: number
  transactions_by_method: Record<string, number>
  revenue_by_month: Array<{
    month: string
    revenue: number
  }>
}

export interface RefundData {
  reason: string
  amount?: number | null
}

export interface FailTransactionData {
  reason: string
}

export interface CancelTransactionData {
  reason: string
}

export const transactionsService = {
  /**
   * Get all transactions with optional filters
   */
  getAll: async (filters: TransactionFilters = {}): Promise<{ results: Transaction[]; count: number }> => {
    const params = new URLSearchParams()
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        params.append(key, String(value))
      }
    })
    const response = await subscriptionApiClient.get(buildUrl(`${ENDPOINTS.transactions}?${params.toString()}`))
    return response.data
  },

  /**
   * Get transaction by ID
   */
  getById: async (id: number): Promise<Transaction> => {
    const response = await subscriptionApiClient.get(buildUrl(`${ENDPOINTS.transactions}${id}/`))
    return response.data
  },

  /**
   * Process refund (MOST IMPORTANT)
   */
  refund: async (id: number, data: RefundData): Promise<Transaction> => {
    const response = await subscriptionApiClient.post(buildUrl(`${ENDPOINTS.transactions}${id}/refund/`), data)
    return response.data
  },

  /**
   * Mark transaction as completed
   */
  complete: async (id: number): Promise<Transaction> => {
    const response = await subscriptionApiClient.post(buildUrl(`${ENDPOINTS.transactions}${id}/complete/`))
    return response.data
  },

  /**
   * Mark transaction as failed
   */
  fail: async (id: number, data: FailTransactionData): Promise<Transaction> => {
    const response = await subscriptionApiClient.post(buildUrl(`${ENDPOINTS.transactions}${id}/fail/`), data)
    return response.data
  },

  /**
   * Cancel transaction
   */
  cancel: async (id: number, data: CancelTransactionData): Promise<Transaction> => {
    const response = await subscriptionApiClient.post(
      buildUrl(`${ENDPOINTS.transactions}${id}/cancel_transaction/`),
      data,
    )
    return response.data
  },

  /**
   * Get transaction statistics
   */
  getStatistics: async (): Promise<TransactionStatistics> => {
    const response = await subscriptionApiClient.get(buildUrl('/subscriptions/admin/transactions/statistics/'))
    return response.data
  },
}

export default transactionsService
