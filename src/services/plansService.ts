/**
 * Plans Service
 * Handles all subscription plan operations
 */

import { subscriptionApiClient, buildUrl, ENDPOINTS } from './subscriptionApiClient'

export interface SubscriptionPlan {
  id: number
  name: string
  description: string
  price: string
  currency: string
  duration_days: number
  features: string[]
  is_active: boolean
  is_popular: boolean
  max_users?: number
  created_at: string
  updated_at: string
}

export interface PlanStatistics {
  total_plans: number
  active_plans: number
  inactive_plans: number
  total_subscribers: number
  popular_plans: Array<{
    plan_name: string
    subscriber_count: number
  }>
}

export interface CreatePlanData {
  name: string
  description: string
  price: number | string
  currency?: string
  duration_days: number
  features: string[]
  is_active?: boolean
  is_popular?: boolean
  max_users?: number
}

export const plansService = {
  /**
   * Get all subscription plans
   */
  getAll: async (): Promise<SubscriptionPlan[]> => {
    const response = await subscriptionApiClient.get(buildUrl(ENDPOINTS.plans))
    // Handle both paginated and non-paginated responses
    return response.data.results || response.data
  },

  /**
   * Get plan by ID
   */
  getById: async (id: number): Promise<SubscriptionPlan> => {
    const response = await subscriptionApiClient.get(buildUrl(`${ENDPOINTS.plans}${id}/`))
    return response.data
  },

  /**
   * Create new plan
   */
  create: async (planData: CreatePlanData): Promise<SubscriptionPlan> => {
    const response = await subscriptionApiClient.post(buildUrl(ENDPOINTS.plans), planData)
    return response.data
  },

  /**
   * Update existing plan
   */
  update: async (id: number, planData: Partial<CreatePlanData>): Promise<SubscriptionPlan> => {
    const response = await subscriptionApiClient.patch(buildUrl(`${ENDPOINTS.plans}${id}/`), planData)
    return response.data
  },

  /**
   * Delete plan
   */
  delete: async (id: number): Promise<void> => {
    await subscriptionApiClient.delete(buildUrl(`${ENDPOINTS.plans}${id}/`))
  },

  /**
   * Activate plan
   */
  activate: async (id: number): Promise<SubscriptionPlan> => {
    const response = await subscriptionApiClient.post(buildUrl(`${ENDPOINTS.plans}${id}/activate/`))
    return response.data
  },

  /**
   * Deactivate plan
   */
  deactivate: async (id: number): Promise<SubscriptionPlan> => {
    const response = await subscriptionApiClient.post(buildUrl(`${ENDPOINTS.plans}${id}/deactivate/`))
    return response.data
  },

  /**
   * Get plan statistics
   */
  getStatistics: async (): Promise<PlanStatistics> => {
    const response = await subscriptionApiClient.get(buildUrl('/subscriptions/admin/plans/statistics/'))
    return response.data
  },
}

export default plansService
