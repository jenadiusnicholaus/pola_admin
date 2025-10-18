/**
 * Plans Service
 * Handles all subscription plan operations
 * API Spec: GET/POST /api/v1/admin/subscriptions/plans/
 */

import makeRequest from './makeRequest'
import type IRequestParams from '../models/models'
import API_ENDPOINTS from './apiConfig'

export interface SubscriptionPlan {
  id: number
  plan_type: string // free_trial, monthly, yearly, etc.
  name: string
  name_sw: string
  description: string
  description_sw: string
  price: string // Decimal as string
  currency: string
  duration_days: number
  is_active: boolean

  // Access & Features
  full_legal_library_access: boolean
  monthly_questions_limit: number
  free_documents_per_month: number
  legal_updates: boolean
  forum_access: boolean
  student_hub_access: boolean

  // Bilingual Benefits
  benefits_en: string[]
  benefits_sw: string[]

  // Permissions (from public API)
  permissions?: {
    can_access_legal_library: boolean
    can_ask_questions: boolean
    can_generate_documents: boolean
    can_access_forum: boolean
    can_access_student_hub: boolean
    questions_remaining_this_month: number
    documents_remaining_this_month: number
  }

  // Statistics (Admin only)
  total_subscribers?: number
  active_subscribers?: number
  total_revenue?: number

  // Timestamps
  created_at: string
  updated_at: string
}

export interface PlanStatistics {
  total_plans: number
  active_plans: number
  inactive_plans: number
  total_subscribers: number
  total_revenue: string
}

export interface SubscriptionStatistics {
  total_plans: number
  active_plans: number
  total_subscribers: number
  active_subscribers: number
  expired_subscribers: number
  trial_users: number
  paid_users: number
  total_revenue: string
  monthly_revenue: string
  churn_rate: number
  growth_rate: number
}

export interface CreatePlanData {
  name: string
  name_sw?: string
  description: string
  description_sw?: string
  plan_type: string
  price: number | string
  currency?: string
  duration_days: number
  is_active?: boolean

  // Access & Features
  full_legal_library_access?: boolean
  monthly_questions_limit?: number
  free_documents_per_month?: number
  legal_updates?: boolean
  forum_access?: boolean
  student_hub_access?: boolean

  // Benefits
  benefits_en?: string[]
  benefits_sw?: string[]
}

export interface PlanSubscriber {
  id: number
  user_details: {
    id: number
    email: string
    name: string
  }
  start_date: string
  end_date: string
  status: string
}

// Benefits API Types
export interface PlanBenefit {
  plan_id: number
  plan_name: string
  plan_type: string
  price: string
  duration_days: number
  benefits: string[]
}

export interface BenefitsResponse {
  language: string
  plans: PlanBenefit[]
}

export interface SinglePlanBenefit {
  plan_id: number
  plan_name: string
  plan_type: string
  benefits: string[]
  language: string
}

export const plansService = {
  /**
   * Get all subscription plans
   * GET /api/v1/admin/subscriptions/plans/
   */
  getAll: async (): Promise<SubscriptionPlan[]> => {
    const requestParams: IRequestParams = {
      url: API_ENDPOINTS.subscriptions.plans.list(),
      method: 'GET',
    }

    const response = await makeRequest(requestParams)
    // API returns array directly (not paginated for plans list)
    return Array.isArray(response.data) ? response.data : response.data.results || []
  },

  /**
   * Get plan by ID
   * GET /api/v1/admin/subscriptions/plans/{id}/
   */
  getById: async (id: number): Promise<SubscriptionPlan> => {
    const requestParams: IRequestParams = {
      url: API_ENDPOINTS.subscriptions.plans.detail(id),
      method: 'GET',
    }

    const response = await makeRequest(requestParams)
    return response.data
  },

  /**
   * Create new plan
   * POST /api/v1/admin/subscriptions/plans/
   */
  create: async (planData: CreatePlanData): Promise<SubscriptionPlan> => {
    console.log('Service: Creating plan at', API_ENDPOINTS.subscriptions.plans.create(), 'with data:', planData)

    const requestParams: IRequestParams = {
      url: API_ENDPOINTS.subscriptions.plans.create(),
      method: 'POST',
      data: planData,
    }

    const response = await makeRequest(requestParams)
    console.log('Service: Create response:', response.data)
    return response.data
  },

  /**
   * Update existing plan (partial update)
   * PATCH /api/v1/admin/subscriptions/plans/{id}/
   */
  update: async (id: number, planData: Partial<CreatePlanData>): Promise<SubscriptionPlan> => {
    console.log(
      'Service: Updating plan',
      id,
      'at',
      API_ENDPOINTS.subscriptions.plans.update(id),
      'with data:',
      planData,
    )

    const requestParams: IRequestParams = {
      url: API_ENDPOINTS.subscriptions.plans.update(id),
      method: 'PATCH',
      data: planData,
    }

    const response = await makeRequest(requestParams)
    console.log('Service: Update response:', response.data)
    return response.data
  },

  /**
   * Delete plan
   * DELETE /api/v1/admin/subscriptions/plans/{id}/
   */
  delete: async (id: number): Promise<void> => {
    console.log('Service: Deleting plan', id, 'at', API_ENDPOINTS.subscriptions.plans.delete(id))

    const requestParams: IRequestParams = {
      url: API_ENDPOINTS.subscriptions.plans.delete(id),
      method: 'DELETE',
    }

    await makeRequest(requestParams)
    console.log('Service: Delete successful')
  },

  /**
   * Toggle plan activation
   * POST /api/v1/admin/subscriptions/plans/{id}/activate/
   * Note: This endpoint may not exist in backend - needs verification
   */
  toggleActivation: async (id: number, is_active: boolean): Promise<SubscriptionPlan> => {
    const requestParams: IRequestParams = {
      url: `${API_ENDPOINTS.subscriptions.plans.detail(id)}activate/`,
      method: 'POST',
      data: { is_active },
    }

    const response = await makeRequest(requestParams)
    return response.data
  },

  /**
   * Get subscription statistics (user-level stats)
   * GET /api/v1/admin/subscriptions/users/stats/
   */
  getSubscriptionStatistics: async (): Promise<SubscriptionStatistics> => {
    const requestParams: IRequestParams = {
      url: API_ENDPOINTS.subscriptions.users.stats(),
      method: 'GET',
    }

    const response = await makeRequest(requestParams)
    return response.data
  },

  /**
   * Get plan subscribers
   * GET /api/v1/admin/subscriptions/plans/{id}/subscribers/
   * Note: This endpoint may not exist in backend - needs verification
   */
  getSubscribers: async (
    id: number,
    page = 1,
    page_size = 20,
  ): Promise<{ count: number; results: PlanSubscriber[] }> => {
    const params = new URLSearchParams()
    params.append('page', String(page))
    params.append('page_size', String(page_size))

    const requestParams: IRequestParams = {
      url: `${API_ENDPOINTS.subscriptions.plans.detail(id)}subscribers/?${params.toString()}`,
      method: 'GET',
    }

    const response = await makeRequest(requestParams)
    return response.data
  },

  // ==================== Public User-Facing Endpoints ====================

  /**
   * Get all active plans (Public endpoint - user side)
   * GET /api/v1/subscriptions/subscriptions/plans/
   * Returns only active plans with permissions for display to users
   * Note: Uses different endpoint structure - may need to be added to apiConfig
   */
  getPublicPlans: async (): Promise<SubscriptionPlan[]> => {
    const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api/v1'

    const requestParams: IRequestParams = {
      url: `${API_BASE_URL}/subscriptions/subscriptions/plans/`,
      method: 'GET',
    }

    const response = await makeRequest(requestParams)
    return response.data
  },

  /**
   * Get benefits for all plans or a specific plan (Public endpoint)
   * GET /api/v1/subscriptions/subscriptions/benefits/
   *
   * @param language - 'en' or 'sw' (default: 'en')
   * @param planId - Optional plan ID to get benefits for a specific plan
   * Note: Uses different endpoint structure - may need to be added to apiConfig
   */
  getBenefits: async (language: 'en' | 'sw' = 'en', planId?: number): Promise<BenefitsResponse | SinglePlanBenefit> => {
    const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api/v1'
    const params = new URLSearchParams()
    params.append('language', language)
    if (planId) {
      params.append('plan_id', String(planId))
    }

    const requestParams: IRequestParams = {
      url: `${API_BASE_URL}/subscriptions/subscriptions/benefits/?${params.toString()}`,
      method: 'GET',
    }

    const response = await makeRequest(requestParams)
    return response.data
  },
}

export default plansService
