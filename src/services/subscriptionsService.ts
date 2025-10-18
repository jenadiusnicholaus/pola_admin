/**
 * Subscriptions Service
 * Handles all user subscription management operations
 */

import makeRequest from './makeRequest'
import type IRequestParams from '../models/models'
import API_ENDPOINTS from './apiConfig'

export interface UserDetails {
  id: number
  email: string
  full_name: string
  phone: string | null
}

export interface PlanDetails {
  id: number
  name: string
  type: string // 'free_trial', 'monthly', etc.
  price: number
  currency: string
}

export interface UsageStats {
  questions_used: number
  questions_limit: number
  documents_generated: number
  documents_limit: number
  days_remaining: number
  is_active: boolean
}

export interface PaymentHistory {
  id: number
  amount: number
  status: 'completed' | 'pending' | 'failed'
  payment_method: string
  created_at: string
}

export interface Subscription {
  id: number
  user: number
  user_details: UserDetails
  plan: number
  plan_details: PlanDetails
  status: 'active' | 'expired' | 'cancelled' | 'pending'
  start_date: string
  end_date: string
  auto_renew: boolean
  device_id: string | null
  questions_asked_this_month: number
  documents_generated_this_month: number
  last_reset_date: string
  usage_stats: UsageStats
  payment_history: PaymentHistory[]
  created_at: string
  updated_at: string
}

export interface SubscriptionFilters {
  status?: string
  email?: string
  expiring_in_days?: number
  is_trial?: boolean
  page?: number
  page_size?: number
}

export interface SubscriptionStatistics {
  total_subscriptions: number
  active_subscriptions: number
  expired_subscriptions: number
  cancelled_subscriptions: number
  trial_subscriptions: number
  expiring_this_week: number
  expiring_this_month: number
  total_revenue: number
}

export interface ExtendSubscriptionData {
  days: number
  reason: string
}

export interface CancelSubscriptionData {
  reason: string
}

export interface CreateSubscriptionForUserData {
  user_id: number
  plan_id: number
  auto_renew?: boolean
}

export const subscriptionsService = {
  /**
   * Get all subscriptions with optional filters
   */
  getAll: async (filters: SubscriptionFilters = {}): Promise<{ results: Subscription[]; count: number }> => {
    const params = new URLSearchParams()
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        params.append(key, String(value))
      }
    })

    const url = `${API_ENDPOINTS.subscriptions.users.list()}?${params.toString()}`
    const requestParams: IRequestParams = {
      url,
      method: 'GET',
    }

    const response = await makeRequest(requestParams)
    return response.data
  },

  /**
   * Get subscription by ID
   */
  getById: async (id: number): Promise<Subscription> => {
    const requestParams: IRequestParams = {
      url: API_ENDPOINTS.subscriptions.users.detail(id),
      method: 'GET',
    }

    const response = await makeRequest(requestParams)
    return response.data
  },

  /**
   * Cancel subscription
   */
  cancel: async (id: number, data: CancelSubscriptionData): Promise<Subscription> => {
    const requestParams: IRequestParams = {
      url: API_ENDPOINTS.subscriptions.users.cancel(id),
      method: 'POST',
      data,
    }

    const response = await makeRequest(requestParams)
    return response.data
  },

  /**
   * Extend subscription duration
   */
  extend: async (id: number, data: ExtendSubscriptionData): Promise<Subscription> => {
    const requestParams: IRequestParams = {
      url: API_ENDPOINTS.subscriptions.users.extend(id),
      method: 'POST',
      data,
    }

    const response = await makeRequest(requestParams)
    return response.data
  },

  /**
   * Activate subscription
   */
  activate: async (id: number): Promise<Subscription> => {
    const requestParams: IRequestParams = {
      url: API_ENDPOINTS.subscriptions.users.activate(id),
      method: 'POST',
    }

    const response = await makeRequest(requestParams)
    return response.data
  },

  /**
   * Create subscription for user
   */
  createForUser: async (data: CreateSubscriptionForUserData): Promise<Subscription> => {
    const requestParams: IRequestParams = {
      url: API_ENDPOINTS.subscriptions.users.create(),
      method: 'POST',
      data,
    }

    const response = await makeRequest(requestParams)
    return response.data
  },
}

export default subscriptionsService
