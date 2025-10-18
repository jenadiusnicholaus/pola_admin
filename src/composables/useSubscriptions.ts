/**
 * Composable for Subscriptions Management
 * Provides reactive state and methods for handling user subscriptions
 */

import { ref, computed } from 'vue'
import { useToast } from 'vuestic-ui'
import {
  subscriptionsService,
  type Subscription,
  type SubscriptionFilters,
  type ExtendSubscriptionData,
  type CancelSubscriptionData,
  type CreateSubscriptionForUserData,
} from '../services/subscriptionsService'
import { plansService, type SubscriptionStatistics } from '../services/plansService'

export function useSubscriptions() {
  const { init: notify } = useToast()

  const subscriptions = ref<Subscription[]>([])
  const statistics = ref<SubscriptionStatistics | null>(null)
  const totalCount = ref(0)
  const isLoading = ref(false)
  const error = ref<string | null>(null)

  // Computed properties
  const activeSubscriptions = computed(() => subscriptions.value.filter((sub) => sub.status === 'active'))
  const expiredSubscriptions = computed(() => subscriptions.value.filter((sub) => sub.status === 'expired'))
  const cancelledSubscriptions = computed(() => subscriptions.value.filter((sub) => sub.status === 'cancelled'))
  const trialSubscriptions = computed(() => subscriptions.value.filter((sub) => sub.plan_details.type === 'free_trial'))

  /**
   * Fetch all subscriptions with filters
   */
  const fetchSubscriptions = async (filters: SubscriptionFilters = {}) => {
    isLoading.value = true
    error.value = null
    try {
      const response = await subscriptionsService.getAll(filters)
      subscriptions.value = response.results
      totalCount.value = response.count
    } catch (err: any) {
      error.value = err.response?.data?.detail || 'Failed to fetch subscriptions'
      notify({
        message: error.value || 'Failed to fetch subscriptions',
        color: 'danger',
      })
    } finally {
      isLoading.value = false
    }
  }

  /**
   * Fetch subscription statistics
   */
  const fetchStatistics = async () => {
    try {
      statistics.value = await plansService.getSubscriptionStatistics()
    } catch (err: any) {
      const errorMsg = err.response?.data?.detail || 'Failed to fetch statistics'
      notify({
        message: errorMsg,
        color: 'danger',
      })
    }
  }

  /**
   * Get subscription by ID
   */
  const getSubscription = async (id: number): Promise<Subscription | null> => {
    try {
      return await subscriptionsService.getById(id)
    } catch (err: any) {
      const errorMsg = err.response?.data?.detail || 'Failed to fetch subscription'
      notify({
        message: errorMsg,
        color: 'danger',
      })
      return null
    }
  }

  /**
   * Cancel subscription
   */
  const cancelSubscription = async (id: number, data: CancelSubscriptionData) => {
    isLoading.value = true
    error.value = null
    try {
      const updated = await subscriptionsService.cancel(id, data)
      const index = subscriptions.value.findIndex((s) => s.id === id)
      if (index !== -1) {
        subscriptions.value[index] = updated
      }
      notify({
        message: 'Subscription cancelled successfully',
        color: 'success',
      })
      return updated
    } catch (err: any) {
      error.value = err.response?.data?.detail || 'Failed to cancel subscription'
      notify({
        message: error.value || 'Failed to cancel subscription',
        color: 'danger',
      })
      throw err
    } finally {
      isLoading.value = false
    }
  }

  /**
   * Extend subscription duration
   */
  const extendSubscription = async (id: number, data: ExtendSubscriptionData) => {
    isLoading.value = true
    error.value = null
    try {
      const updated = await subscriptionsService.extend(id, data)
      const index = subscriptions.value.findIndex((s) => s.id === id)
      if (index !== -1) {
        subscriptions.value[index] = updated
      }
      notify({
        message: `Subscription extended by ${data.days} days`,
        color: 'success',
      })
      return updated
    } catch (err: any) {
      error.value = err.response?.data?.detail || 'Failed to extend subscription'
      notify({
        message: error.value || 'Failed to extend subscription',
        color: 'danger',
      })
      throw err
    } finally {
      isLoading.value = false
    }
  }

  /**
   * Activate subscription
   */
  const activateSubscription = async (id: number) => {
    try {
      const updated = await subscriptionsService.activate(id)
      const index = subscriptions.value.findIndex((s) => s.id === id)
      if (index !== -1) {
        subscriptions.value[index] = updated
      }
      notify({
        message: 'Subscription activated successfully',
        color: 'success',
      })
      return updated
    } catch (err: any) {
      const errorMsg = err.response?.data?.detail || 'Failed to activate subscription'
      notify({
        message: errorMsg,
        color: 'danger',
      })
      throw err
    }
  }

  /**
   * Create subscription for user
   */
  const createForUser = async (data: CreateSubscriptionForUserData) => {
    isLoading.value = true
    error.value = null
    try {
      const newSubscription = await subscriptionsService.createForUser(data)
      subscriptions.value.unshift(newSubscription)
      totalCount.value += 1
      notify({
        message: 'Subscription created successfully',
        color: 'success',
      })
      return newSubscription
    } catch (err: any) {
      error.value = err.response?.data?.detail || 'Failed to create subscription'
      notify({
        message: error.value || 'Failed to create subscription',
        color: 'danger',
      })
      throw err
    } finally {
      isLoading.value = false
    }
  }

  return {
    // State
    subscriptions,
    statistics,
    totalCount,
    isLoading,
    error,

    // Computed
    activeSubscriptions,
    expiredSubscriptions,
    cancelledSubscriptions,
    trialSubscriptions,

    // Methods
    fetchSubscriptions,
    fetchStatistics,
    getSubscription,
    cancelSubscription,
    extendSubscription,
    activateSubscription,
    createForUser,
  }
}
