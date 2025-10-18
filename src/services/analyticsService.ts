/**
 * Analytics Service
 * Handles all analytics and dashboard operations based on API documentation
 */

import axios from 'axios'

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api/v1'

const ENDPOINTS = {
  dashboard: import.meta.env.VITE_ANALYTICS_DASHBOARD || '/admin/analytics/dashboard/',
  revenue: import.meta.env.VITE_ANALYTICS_REVENUE || '/admin/analytics/revenue/',
  users: import.meta.env.VITE_ANALYTICS_USERS || '/admin/analytics/users/',
  health: import.meta.env.VITE_ANALYTICS_HEALTH || '/admin/analytics/health/',
}

const buildUrl = (endpoint: string) => `${API_BASE_URL}${endpoint}`

// Dashboard Interfaces (matching API spec)
export interface DashboardStats {
  users: {
    total: number
    new_30d: number
    active: number
    by_type: {
      client: number
      consultant: number
      student: number
      lecturer: number
      admin: number
    }
    growth_rate: number
  }
  subscriptions: {
    total: number
    active: number
    revenue_30d: string
  }
  call_credits: {
    purchases_30d: number
    revenue_30d: string
    total_calls_30d: number
  }
  consultations: {
    total: number
    completed: number
    revenue_30d: string
  }
  documents: {
    total: number
    approved: number
    pending_approvals: number
    revenue_30d: string
  }
  revenue: {
    total_30d: string
    total_all_time: string
    by_type: {
      subscriptions: string
      call_credits: string
      consultations: string
      documents: string
    }
    growth_rate: number
  }
  disbursements: {
    pending_count: number
    pending_amount: string
    total_disbursed: string
  }
}

// Revenue Analytics (matching API spec)
export interface RevenueData {
  period: string
  total_revenue: string
  subscription?: string
  call_credit?: string
  physical_consultation?: string
  document_download?: string
  transaction_count: number
}

export interface RevenueAnalytics {
  period: 'daily' | 'weekly' | 'monthly' | 'yearly'
  transaction_type: string
  data: RevenueData[]
}

// User Analytics (matching API spec)
export interface UserGrowth {
  period: string
  new_users: number
}

export interface ActiveByType {
  [key: string]: {
    total: number
    active: number
    engaged_30d: number
  }
}

export interface UserRetention {
  cohort_size: number
  retained: number
  retention_rate: number
}

export interface UserAnalytics {
  user_growth: UserGrowth[]
  active_by_type: ActiveByType
  retention: UserRetention
}

// Platform Health (matching API spec)
export interface PlatformHealth {
  payments: {
    success_rate: number
    failed_count: number
    total_count: number
  }
  disbursements: {
    pending_count: number
    pending_amount: string
    avg_processing_hours: number
  }
  consultations: {
    cancellation_rate: number
    average_rating: number
  }
  approvals: {
    pending_count: number
    oldest_pending_days: number
  }
}

export const analyticsService = {
  /**
   * Get main dashboard statistics
   */
  getDashboard: async (): Promise<DashboardStats> => {
    const response = await axios.get(buildUrl(ENDPOINTS.dashboard))
    return response.data
  },

  /**
   * Get revenue analytics
   */
  getRevenue: async (
    period: 'daily' | 'weekly' | 'monthly' | 'yearly' = 'daily',
    type: 'subscription' | 'call_credit' | 'physical_consultation' | 'document_download' | 'all' = 'all',
  ): Promise<RevenueAnalytics> => {
    const params = new URLSearchParams()
    params.append('period', period)
    params.append('type', type)

    const response = await axios.get(buildUrl(`${ENDPOINTS.revenue}?${params.toString()}`))
    return response.data
  },

  /**
   * Get user analytics
   */
  getUserStats: async (): Promise<UserAnalytics> => {
    const response = await axios.get(buildUrl(ENDPOINTS.users))
    return response.data
  },

  /**
   * Get platform health
   */
  getHealth: async (): Promise<PlatformHealth> => {
    const response = await axios.get(buildUrl(ENDPOINTS.health))
    return response.data
  },
}

export default analyticsService
