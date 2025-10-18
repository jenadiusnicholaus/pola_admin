/**
 * Analytics Composable
 * Reactive state management for analytics dashboard
 */

import { ref, computed } from 'vue'
import type { Ref } from 'vue'
import analyticsService, {
  type DashboardStats,
  type RevenueAnalytics,
  type UserAnalytics,
  type PlatformHealth,
} from '../services/analyticsService'
import { useToast } from 'vuestic-ui'

export const useAnalytics = () => {
  const { init: notify } = useToast()

  // State
  const dashboard = ref<DashboardStats | null>(null) as Ref<DashboardStats | null>
  const revenue = ref<RevenueAnalytics | null>(null) as Ref<RevenueAnalytics | null>
  const users = ref<UserAnalytics | null>(null) as Ref<UserAnalytics | null>
  const health = ref<PlatformHealth | null>(null) as Ref<PlatformHealth | null>
  const isLoading = ref(false)

  // Computed
  const totalRevenue30d = computed(() => {
    return dashboard.value?.revenue.total_30d || '0.00'
  })

  const totalRevenueAllTime = computed(() => {
    return dashboard.value?.revenue.total_all_time || '0.00'
  })

  const totalUsers = computed(() => {
    return dashboard.value?.users.total || 0
  })

  const activeUsers = computed(() => {
    return dashboard.value?.users.active || 0
  })

  const revenueGrowthRate = computed(() => {
    return dashboard.value?.revenue.growth_rate || 0
  })

  const pendingDisbursements = computed(() => {
    return dashboard.value?.disbursements.pending_count || 0
  })

  const pendingApprovals = computed(() => {
    return dashboard.value?.documents.pending_approvals || 0
  })

  // Methods
  const fetchDashboard = async () => {
    isLoading.value = true
    try {
      dashboard.value = await analyticsService.getDashboard()
    } catch (error: any) {
      console.error('Failed to fetch dashboard:', error)
      notify({
        message: `Failed to load dashboard: ${error.response?.data?.detail || error.message}`,
        color: 'danger',
      })
    } finally {
      isLoading.value = false
    }
  }

  const fetchRevenue = async (period: 'daily' | 'weekly' | 'monthly' | 'yearly' = 'daily', type = 'all') => {
    isLoading.value = true
    try {
      revenue.value = await analyticsService.getRevenue(
        period,
        type as 'subscription' | 'call_credit' | 'physical_consultation' | 'document_download' | 'all',
      )
    } catch (error: any) {
      console.error('Failed to fetch revenue:', error)
      notify({
        message: `Failed to load revenue data: ${error.response?.data?.detail || error.message}`,
        color: 'danger',
      })
    } finally {
      isLoading.value = false
    }
  }

  const fetchUserStats = async () => {
    isLoading.value = true
    try {
      users.value = await analyticsService.getUserStats()
    } catch (error: any) {
      console.error('Failed to fetch user stats:', error)
      notify({
        message: `Failed to load user statistics: ${error.response?.data?.detail || error.message}`,
        color: 'danger',
      })
    } finally {
      isLoading.value = false
    }
  }

  const fetchHealth = async () => {
    isLoading.value = true
    try {
      health.value = await analyticsService.getHealth()
    } catch (error: any) {
      console.error('Failed to fetch health:', error)
      notify({
        message: `Failed to load platform health: ${error.response?.data?.detail || error.message}`,
        color: 'danger',
      })
    } finally {
      isLoading.value = false
    }
  }

  return {
    // State
    dashboard,
    revenue,
    users,
    health,
    isLoading,

    // Computed
    totalRevenue30d,
    totalRevenueAllTime,
    totalUsers,
    activeUsers,
    revenueGrowthRate,
    pendingDisbursements,
    pendingApprovals,

    // Methods
    fetchDashboard,
    fetchRevenue,
    fetchUserStats,
    fetchHealth,
  }
}
