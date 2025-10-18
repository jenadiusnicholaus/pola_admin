/**
 * Composable for Call Credits Management
 * Provides reactive state and methods for handling call credit bundles and user credits
 */

import { ref, computed } from 'vue'
import { useToast } from 'vuestic-ui'
import callCreditsService from '../services/callCreditsService'
import type {
  CallCreditBundle,
  UserCallCredit,
  BundleFormData,
  UserCreditFilters,
  CallCreditStatistics,
  GrantCreditsData,
} from '../services/callCreditsService'

export function useCallCredits() {
  const { init: notify } = useToast()

  const bundles = ref<CallCreditBundle[]>([])
  const userCredits = ref<UserCallCredit[]>([])
  const statistics = ref<CallCreditStatistics | null>(null)
  const totalCount = ref(0)
  const isLoading = ref(false)
  const error = ref<string | null>(null)

  // Computed properties
  const activeBundles = computed(() => bundles.value.filter((bundle) => bundle.is_active))
  const inactiveBundles = computed(() => bundles.value.filter((bundle) => !bundle.is_active))
  const activeUserCredits = computed(() => userCredits.value.filter((credit) => credit.status === 'active'))
  const expiredUserCredits = computed(() => userCredits.value.filter((credit) => credit.status === 'expired'))

  /**
   * Fetch all bundles
   */
  const fetchBundles = async () => {
    isLoading.value = true
    error.value = null
    try {
      const response = await callCreditsService.bundles.getAll()
      bundles.value = Array.isArray(response) ? response : []
    } catch (err: any) {
      console.error('[useCallCredits] Error fetching bundles:', err)
      error.value = err.response?.data?.detail || 'Failed to fetch bundles'
      bundles.value = [] // Ensure bundles is always an array
      notify({
        message: error.value || 'Failed to fetch bundles',
        color: 'danger',
      })
    } finally {
      isLoading.value = false
    }
  }

  /**
   * Fetch bundle statistics
   */
  const fetchStatistics = async () => {
    try {
      statistics.value = await callCreditsService.userCredits.getStatistics()
    } catch (err: any) {
      const errorMsg = err.response?.data?.detail || 'Failed to fetch statistics'
      notify({
        message: errorMsg,
        color: 'danger',
      })
    }
  }

  /**
   * Create new bundle
   */
  const createBundle = async (data: BundleFormData) => {
    isLoading.value = true
    error.value = null
    try {
      console.log('[useCallCredits] Creating bundle with data:', data)
      const newBundle = await callCreditsService.bundles.create(data)
      bundles.value.push(newBundle)
      notify({
        message: 'Bundle created successfully',
        color: 'success',
      })
      return newBundle
    } catch (err: any) {
      console.error('[useCallCredits] Create bundle error:', err)
      console.error('[useCallCredits] Error response:', err.response?.data)
      error.value = err.response?.data?.detail || 'Failed to create bundle'

      // Show specific field errors if available
      if (err.response?.data && typeof err.response.data === 'object') {
        const errors = Object.entries(err.response.data)
          .map(([field, messages]) => `${field}: ${Array.isArray(messages) ? messages.join(', ') : messages}`)
          .join('\n')
        notify({
          message: `Validation errors:\n${errors}`,
          color: 'danger',
        })
      } else {
        notify({
          message: error.value || 'Failed to create bundle',
          color: 'danger',
        })
      }
      throw err
    } finally {
      isLoading.value = false
    }
  }

  /**
   * Update existing bundle
   */
  const updateBundle = async (id: number, data: Partial<BundleFormData>) => {
    isLoading.value = true
    error.value = null
    try {
      const updated = await callCreditsService.bundles.partialUpdate(id, data)
      const index = bundles.value.findIndex((b) => b.id === id)
      if (index !== -1) {
        bundles.value[index] = updated
      }
      notify({
        message: 'Bundle updated successfully',
        color: 'success',
      })
      return updated
    } catch (err: any) {
      error.value = err.response?.data?.detail || 'Failed to update bundle'
      notify({
        message: error.value || 'Failed to update bundle',
        color: 'danger',
      })
      throw err
    } finally {
      isLoading.value = false
    }
  }

  /**
   * Delete bundle
   */
  const deleteBundle = async (id: number) => {
    isLoading.value = true
    error.value = null
    try {
      await callCreditsService.bundles.delete(id)
      bundles.value = bundles.value.filter((b) => b.id !== id)
      notify({
        message: 'Bundle deleted successfully',
        color: 'success',
      })
    } catch (err: any) {
      error.value = err.response?.data?.detail || 'Failed to delete bundle'
      notify({
        message: error.value || 'Failed to delete bundle',
        color: 'danger',
      })
      throw err
    } finally {
      isLoading.value = false
    }
  }

  /**
   * Fetch user credits with filters
   */
  const fetchUserCredits = async (filters: UserCreditFilters = {}) => {
    isLoading.value = true
    error.value = null
    try {
      const response = await callCreditsService.userCredits.getAll(filters)
      userCredits.value = response
      totalCount.value = response.length
    } catch (err: any) {
      error.value = err.response?.data?.detail || 'Failed to fetch user credits'
      notify({
        message: error.value || 'Failed to fetch user credits',
        color: 'danger',
      })
    } finally {
      isLoading.value = false
    }
  }

  /**
   * Extend user credit expiration
   * Note: This feature is not yet implemented in the backend
   */
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const extendUserCredit = async (_id: number, _days: number) => {
    isLoading.value = true
    error.value = null
    try {
      // Note: The current service doesn't have an extend method
      // This would need to be implemented in the backend
      notify({
        message: 'Extend credit feature not yet implemented',
        color: 'warning',
      })
      return null
    } catch (err: any) {
      error.value = err.response?.data?.detail || 'Failed to extend credit'
      notify({
        message: error.value || 'Failed to extend credit',
        color: 'danger',
      })
      throw err
    } finally {
      isLoading.value = false
    }
  }

  /**
   * Grant credits to user
   */
  const grantCredits = async (data: GrantCreditsData) => {
    isLoading.value = true
    error.value = null
    try {
      const response = await callCreditsService.userCredits.grantCredits(data)
      if (response.credit) {
        userCredits.value.unshift(response.credit)
        totalCount.value += 1
      }
      notify({
        message: response.message || 'Credits granted successfully',
        color: 'success',
      })
      return response
    } catch (err: any) {
      error.value = err.response?.data?.detail || 'Failed to grant credits'
      notify({
        message: error.value || 'Failed to grant credits',
        color: 'danger',
      })
      throw err
    } finally {
      isLoading.value = false
    }
  }

  /**
   * Get usage report
   */
  const getUsageReport = async (period: 'daily' | 'weekly' | 'monthly' = 'daily') => {
    try {
      return await callCreditsService.userCredits.getUsageReport(period)
    } catch (err: any) {
      const errorMsg = err.response?.data?.detail || 'Failed to fetch usage report'
      notify({
        message: errorMsg,
        color: 'danger',
      })
      return null
    }
  }

  return {
    // State
    bundles,
    userCredits,
    statistics,
    totalCount,
    isLoading,
    error,

    // Computed
    activeBundles,
    inactiveBundles,
    activeUserCredits,
    expiredUserCredits,

    // Methods
    fetchBundles,
    fetchStatistics,
    createBundle,
    updateBundle,
    deleteBundle,
    fetchUserCredits,
    extendUserCredit,
    grantCredits,
    getUsageReport,
  }
}
