/**
 * Call Credits Pinia Store
 * Manages state for call credit bundles and user credits
 */

import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import callCreditsService, {
  type CallCreditBundle,
  type UserCallCredit,
  type CallCreditStatistics,
  type BundleFilters,
  type UserCreditFilters,
  type BundleFormData,
  type GrantCreditsData,
  type UsageReport,
} from '../services/callCreditsService'

export const useCallCreditsStore = defineStore('callCredits', () => {
  // ============================================
  // State
  // ============================================

  // Bundles
  const bundles = ref<CallCreditBundle[]>([])
  const selectedBundle = ref<CallCreditBundle | null>(null)
  const bundlesLoading = ref(false)

  // User Credits
  const userCredits = ref<UserCallCredit[]>([])
  const userCreditsLoading = ref(false)
  const userCreditsTotalCount = ref(0)

  // Statistics
  const statistics = ref<CallCreditStatistics | null>(null)
  const statisticsLoading = ref(false)

  // Usage Reports
  const usageReport = ref<UsageReport | null>(null)
  const usageReportLoading = ref(false)

  // Errors
  const error = ref<string | null>(null)

  // ============================================
  // Computed
  // ============================================

  const activeBundles = computed(() => bundles.value.filter((b) => b.is_active))

  const inactiveBundles = computed(() => bundles.value.filter((b) => !b.is_active))

  const activeUserCredits = computed(() => userCredits.value.filter((c) => c.status === 'active'))

  const expiredUserCredits = computed(() => userCredits.value.filter((c) => c.status === 'expired'))

  const depletedUserCredits = computed(() => userCredits.value.filter((c) => c.status === 'depleted'))

  // ============================================
  // Bundle Actions
  // ============================================

  /**
   * Fetch all bundles
   */
  const fetchBundles = async (filters: BundleFilters = {}) => {
    bundlesLoading.value = true
    error.value = null
    try {
      bundles.value = await callCreditsService.bundles.getAll(filters)
    } catch (err: any) {
      error.value = err.response?.data?.detail || 'Failed to fetch bundles'
      throw err
    } finally {
      bundlesLoading.value = false
    }
  }

  /**
   * Fetch bundle by ID
   */
  const fetchBundleById = async (id: number) => {
    bundlesLoading.value = true
    error.value = null
    try {
      selectedBundle.value = await callCreditsService.bundles.getById(id)
      return selectedBundle.value
    } catch (err: any) {
      error.value = err.response?.data?.detail || 'Failed to fetch bundle'
      throw err
    } finally {
      bundlesLoading.value = false
    }
  }

  /**
   * Create new bundle
   */
  const createBundle = async (data: BundleFormData) => {
    bundlesLoading.value = true
    error.value = null
    try {
      const newBundle = await callCreditsService.bundles.create(data)
      bundles.value.push(newBundle)
      return newBundle
    } catch (err: any) {
      error.value = err.response?.data?.detail || 'Failed to create bundle'
      throw err
    } finally {
      bundlesLoading.value = false
    }
  }

  /**
   * Update bundle
   */
  const updateBundle = async (id: number, data: Partial<BundleFormData>) => {
    bundlesLoading.value = true
    error.value = null
    try {
      const updated = await callCreditsService.bundles.partialUpdate(id, data)
      const index = bundles.value.findIndex((b) => b.id === id)
      if (index !== -1) {
        bundles.value[index] = updated
      }
      if (selectedBundle.value?.id === id) {
        selectedBundle.value = updated
      }
      return updated
    } catch (err: any) {
      error.value = err.response?.data?.detail || 'Failed to update bundle'
      throw err
    } finally {
      bundlesLoading.value = false
    }
  }

  /**
   * Delete bundle
   */
  const deleteBundle = async (id: number) => {
    bundlesLoading.value = true
    error.value = null
    try {
      await callCreditsService.bundles.delete(id)
      bundles.value = bundles.value.filter((b) => b.id !== id)
      if (selectedBundle.value?.id === id) {
        selectedBundle.value = null
      }
    } catch (err: any) {
      error.value = err.response?.data?.detail || 'Failed to delete bundle'
      throw err
    } finally {
      bundlesLoading.value = false
    }
  }

  /**
   * Toggle bundle activation
   */
  const toggleBundleActivation = async (id: number, is_active: boolean) => {
    bundlesLoading.value = true
    error.value = null
    try {
      const response = await callCreditsService.bundles.toggleActivation(id, is_active)
      const index = bundles.value.findIndex((b) => b.id === id)
      if (index !== -1) {
        bundles.value[index] = response.bundle
      }
      if (selectedBundle.value?.id === id) {
        selectedBundle.value = response.bundle
      }
      return response
    } catch (err: any) {
      error.value = err.response?.data?.detail || 'Failed to toggle bundle activation'
      throw err
    } finally {
      bundlesLoading.value = false
    }
  }

  /**
   * Fetch bundle purchases
   */
  const fetchBundlePurchases = async (id: number, page: number = 1, page_size: number = 20) => {
    bundlesLoading.value = true
    error.value = null
    try {
      return await callCreditsService.bundles.getPurchases(id, page, page_size)
    } catch (err: any) {
      error.value = err.response?.data?.detail || 'Failed to fetch bundle purchases'
      throw err
    } finally {
      bundlesLoading.value = false
    }
  }

  // ============================================
  // User Credits Actions
  // ============================================

  /**
   * Fetch user credits
   */
  const fetchUserCredits = async (filters: UserCreditFilters = {}) => {
    userCreditsLoading.value = true
    error.value = null
    try {
      userCredits.value = await callCreditsService.userCredits.getAll(filters)
      // If response includes count, update it
      if (Array.isArray(userCredits.value)) {
        userCreditsTotalCount.value = userCredits.value.length
      }
    } catch (err: any) {
      error.value = err.response?.data?.detail || 'Failed to fetch user credits'
      throw err
    } finally {
      userCreditsLoading.value = false
    }
  }

  /**
   * Grant credits to a user
   */
  const grantCredits = async (data: GrantCreditsData) => {
    userCreditsLoading.value = true
    error.value = null
    try {
      const response = await callCreditsService.userCredits.grantCredits(data)
      // Add to the list if we have user credits loaded
      if (userCredits.value.length > 0) {
        userCredits.value.unshift(response.credit)
      }
      return response
    } catch (err: any) {
      error.value = err.response?.data?.detail || 'Failed to grant credits'
      throw err
    } finally {
      userCreditsLoading.value = false
    }
  }

  // ============================================
  // Statistics Actions
  // ============================================

  /**
   * Fetch statistics
   */
  const fetchStatistics = async () => {
    statisticsLoading.value = true
    error.value = null
    try {
      statistics.value = await callCreditsService.userCredits.getStatistics()
    } catch (err: any) {
      error.value = err.response?.data?.detail || 'Failed to fetch statistics'
      throw err
    } finally {
      statisticsLoading.value = false
    }
  }

  /**
   * Fetch usage report
   */
  const fetchUsageReport = async (period: 'daily' | 'weekly' | 'monthly' = 'daily') => {
    usageReportLoading.value = true
    error.value = null
    try {
      usageReport.value = await callCreditsService.userCredits.getUsageReport(period)
    } catch (err: any) {
      error.value = err.response?.data?.detail || 'Failed to fetch usage report'
      throw err
    } finally {
      usageReportLoading.value = false
    }
  }

  // ============================================
  // Utility Actions
  // ============================================

  /**
   * Clear error
   */
  const clearError = () => {
    error.value = null
  }

  /**
   * Reset store
   */
  const resetStore = () => {
    bundles.value = []
    selectedBundle.value = null
    userCredits.value = []
    statistics.value = null
    usageReport.value = null
    error.value = null
    bundlesLoading.value = false
    userCreditsLoading.value = false
    statisticsLoading.value = false
    usageReportLoading.value = false
  }

  return {
    // State
    bundles,
    selectedBundle,
    bundlesLoading,
    userCredits,
    userCreditsLoading,
    userCreditsTotalCount,
    statistics,
    statisticsLoading,
    usageReport,
    usageReportLoading,
    error,

    // Computed
    activeBundles,
    inactiveBundles,
    activeUserCredits,
    expiredUserCredits,
    depletedUserCredits,

    // Bundle Actions
    fetchBundles,
    fetchBundleById,
    createBundle,
    updateBundle,
    deleteBundle,
    toggleBundleActivation,
    fetchBundlePurchases,

    // User Credits Actions
    fetchUserCredits,
    grantCredits,

    // Statistics Actions
    fetchStatistics,
    fetchUsageReport,

    // Utility Actions
    clearError,
    resetStore,
  }
})
