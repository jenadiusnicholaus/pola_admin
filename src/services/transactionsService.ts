/**
 * Payment Transactions Service
 * Handles all payment transaction operations for subscriptions, consultations, etc.
 * Based on: /api/v1/admin/subscriptions/transactions/
 */

import makeRequest from './makeRequest'
import type IRequestParams from '../models/models'
import API_ENDPOINTS from './apiConfig'

export interface UserDetails {
  id: number
  email: string
  full_name: string
}

export interface RelatedSubscription {
  id: number
  plan: string
  plan_name?: string
}

export interface RelatedBooking {
  id: number
  consultant: string | { full_name: string }
}

export interface TransactionDetails {
  type: string
  amount: number
  currency: string
  formatted_amount: string
  payment_method: string
  status: string
  reference: string
  phone_number?: string
  account_number?: string
  provider?: string
  [key: string]: any // Allow additional dynamic fields
}

export interface Transaction {
  id: number
  user: number
  user_details: UserDetails
  transaction_type: 'subscription' | 'consultation' | 'learning_material' | 'document' | 'call_credit'
  amount: string
  currency: string
  payment_method: 'mobile_money' | 'bank_transfer' | 'card'
  payment_reference: string
  gateway_reference: string
  status: 'pending' | 'completed' | 'failed' | 'refunded' | 'cancelled'
  description: string
  transaction_details: TransactionDetails
  related_items: {
    subscription?: RelatedSubscription
    booking?: RelatedBooking
  } | null
  created_at: string
  updated_at: string
}

export interface TransactionFilters {
  user_id?: number
  status?: 'pending' | 'completed' | 'failed' | 'refunded' | 'cancelled'
  transaction_type?: 'subscription' | 'consultation' | 'learning_material' | 'document' | 'call_credit'
  payment_method?: 'mobile_money' | 'bank_transfer' | 'card'
  date_from?: string // YYYY-MM-DD
  date_to?: string // YYYY-MM-DD
  search?: string // Search by reference or email
  page?: number
  page_size?: number
}

export interface TransactionStatistics {
  total_transactions: number
  total_revenue: number
  by_status: {
    [status: string]: {
      count: number
      total_amount: number
    }
  }
  by_transaction_type: {
    [type: string]: {
      count: number
      total_amount: number
    }
  }
  by_payment_method: {
    [method: string]: {
      count: number
      total_amount: number
    }
  }
}

export interface PaginatedResponse<T> {
  count: number
  next: string | null
  previous: string | null
  results: T[]
}

export const transactionsService = {
  /**
   * Get all payment transactions with optional filters
   * Supports all 7 filters: user_id, status, transaction_type, payment_method, date_from, date_to, search
   */
  getAll: async (filters: TransactionFilters = {}): Promise<PaginatedResponse<Transaction>> => {
    // Build query string from filters
    const queryParams: Record<string, string> = {}

    if (filters.user_id) queryParams.user_id = String(filters.user_id)
    if (filters.status) queryParams.status = filters.status
    if (filters.transaction_type) queryParams.transaction_type = filters.transaction_type
    if (filters.payment_method) queryParams.payment_method = filters.payment_method
    if (filters.date_from) queryParams.date_from = filters.date_from
    if (filters.date_to) queryParams.date_to = filters.date_to
    if (filters.search) queryParams.search = filters.search
    if (filters.page) queryParams.page = String(filters.page)
    if (filters.page_size) queryParams.page_size = String(filters.page_size)

    const queryString = new URLSearchParams(queryParams).toString()
    const url = queryString
      ? `${API_ENDPOINTS.subscriptions.transactions.list()}?${queryString}`
      : API_ENDPOINTS.subscriptions.transactions.list()

    const requestParams: IRequestParams = {
      url,
      method: 'GET',
    }

    const response = await makeRequest(requestParams)
    return response.data
  },

  /**
   * Get transaction by ID
   */
  getById: async (id: number): Promise<Transaction> => {
    const requestParams: IRequestParams = {
      url: API_ENDPOINTS.subscriptions.transactions.detail(id),
      method: 'GET',
    }

    const response = await makeRequest(requestParams)
    return response.data
  },

  /**
   * Get transaction statistics
   * Returns aggregated statistics by status, type, and payment method
   */
  getStatistics: async (filters: TransactionFilters = {}): Promise<TransactionStatistics> => {
    // Build query string from filters (statistics endpoint respects filters)
    const queryParams: Record<string, string> = {}

    if (filters.user_id) queryParams.user_id = String(filters.user_id)
    if (filters.status) queryParams.status = filters.status
    if (filters.transaction_type) queryParams.transaction_type = filters.transaction_type
    if (filters.payment_method) queryParams.payment_method = filters.payment_method
    if (filters.date_from) queryParams.date_from = filters.date_from
    if (filters.date_to) queryParams.date_to = filters.date_to
    if (filters.search) queryParams.search = filters.search

    const queryString = new URLSearchParams(queryParams).toString()
    const url = queryString
      ? `${API_ENDPOINTS.subscriptions.transactions.stats()}?${queryString}`
      : API_ENDPOINTS.subscriptions.transactions.stats()

    const requestParams: IRequestParams = {
      url,
      method: 'GET',
    }

    const response = await makeRequest(requestParams)
    return response.data
  },
}

export default transactionsService
