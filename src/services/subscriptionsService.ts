/**
 * Subscriptions Service
 * Handles all user subscription management operations
 */

import { subscriptionApiClient, buildUrl, ENDPOINTS } from './subscriptionApiClient'

export interface PlanDetails {
  id: number
  plan_type: string
  name: string
  name_sw: string
  description: string
  description_sw: string
  price: string
  currency: string
  price_details: {
    amount: string
    currency: string
    currency_symbol: string
    formatted: string
  }
  duration_days: number
  is_active: boolean
  full_legal_library_access: boolean
  monthly_questions_limit: number
  free_documents_per_month: number
  legal_updates: boolean
  forum_access: boolean
  student_hub_access: boolean
  benefits_en: string[]
  benefits_sw: string[]
  permissions: Record<string, any>
  created_at: string
  updated_at: string
}

export interface Subscription {
  id: number
  user: number
  user_email: string
  plan: number
  plan_details: PlanDetails
  status: 'active' | 'expired' | 'cancelled' | 'pending'
  start_date: string
  end_date: string
  auto_renew: boolean
  questions_asked_this_month: number
  documents_generated_this_month: number
  is_active_status: boolean
  days_remaining: number
  is_trial_status: boolean
  can_ask_more_questions: boolean
  can_generate_free_doc: boolean
  permissions: Record<string, any>
  cancelled_at?: string
  cancellation_reason?: string
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
    const response = await subscriptionApiClient.get(buildUrl(`${ENDPOINTS.subscriptions}?${params.toString()}`))
    return response.data
  },

  /**
   * Get subscription by ID
   */
  getById: async (id: number): Promise<Subscription> => {
    const response = await subscriptionApiClient.get(buildUrl(`${ENDPOINTS.subscriptions}${id}/`))
    return response.data
  },

  /**
   * Cancel subscription
   */
  cancel: async (id: number, data: CancelSubscriptionData): Promise<Subscription> => {
    const response = await subscriptionApiClient.post(buildUrl(`${ENDPOINTS.subscriptions}${id}/cancel/`), data)
    return response.data
  },

  /**
   * Extend subscription duration
   */
  extend: async (id: number, data: ExtendSubscriptionData): Promise<Subscription> => {
    const response = await subscriptionApiClient.post(buildUrl(`${ENDPOINTS.subscriptions}${id}/extend/`), data)
    return response.data
  },

  /**
   * Activate subscription
   */
  activate: async (id: number): Promise<Subscription> => {
    const response = await subscriptionApiClient.post(buildUrl(`${ENDPOINTS.subscriptions}${id}/activate/`))
    return response.data
  },

  /**
   * Create subscription for user
   */
  createForUser: async (data: CreateSubscriptionForUserData): Promise<Subscription> => {
    const response = await subscriptionApiClient.post(
      buildUrl('/subscriptions/admin/subscriptions/create_for_user/'),
      data,
    )
    return response.data
  },

  /**
   * Get subscription statistics
   */
  getStatistics: async (): Promise<SubscriptionStatistics> => {
    const response = await subscriptionApiClient.get(buildUrl('/subscriptions/admin/subscriptions/statistics/'))
    return response.data
  },
}

export default subscriptionsService
