/**
 * Composable for Plans Management
 * Provides reactive state and methods for handling subscription plans
 */

import { ref, computed } from 'vue'
import { useToast } from 'vuestic-ui'
import {
  plansService,
  type SubscriptionPlan,
  type CreatePlanData,
  type SubscriptionStatistics,
} from '../services/plansService'

export function usePlans() {
  const { init: notify } = useToast()

  const plans = ref<SubscriptionPlan[]>([])
  const subscriptionStatistics = ref<SubscriptionStatistics | null>(null)
  const isLoading = ref(false)
  const error = ref<string | null>(null)

  // Computed properties
  const activePlans = computed(() => plans.value.filter((plan) => plan.is_active))
  const inactivePlans = computed(() => plans.value.filter((plan) => !plan.is_active))

  /**
   * Fetch all plans
   */
  const fetchPlans = async () => {
    isLoading.value = true
    error.value = null
    try {
      plans.value = await plansService.getAll()
    } catch (err: any) {
      error.value = err.response?.data?.detail || 'Failed to fetch plans'
      notify({
        message: error.value || 'Failed to fetch plans',
        color: 'danger',
      })
    } finally {
      isLoading.value = false
    }
  }

  /**
   * Fetch subscription statistics (user-level)
   */
  const fetchSubscriptionStatistics = async () => {
    try {
      subscriptionStatistics.value = await plansService.getSubscriptionStatistics()
    } catch (err: any) {
      const errorMsg = err.response?.data?.detail || 'Failed to fetch subscription statistics'
      notify({
        message: errorMsg,
        color: 'danger',
      })
    }
  }

  /**
   * Fetch public plans (user-facing)
   */
  const fetchPublicPlans = async () => {
    isLoading.value = true
    error.value = null
    try {
      plans.value = await plansService.getPublicPlans()
    } catch (err: any) {
      error.value = err.response?.data?.detail || 'Failed to fetch public plans'
      notify({
        message: error.value || 'Failed to fetch public plans',
        color: 'danger',
      })
    } finally {
      isLoading.value = false
    }
  }

  /**
   * Fetch plan benefits
   */
  const fetchBenefits = async (language: 'en' | 'sw' = 'en', planId?: number) => {
    try {
      return await plansService.getBenefits(language, planId)
    } catch (err: any) {
      const errorMsg = err.response?.data?.detail || 'Failed to fetch benefits'
      notify({
        message: errorMsg,
        color: 'danger',
      })
      throw err
    }
  }

  /**
   * Create new plan
   */
  const createPlan = async (planData: CreatePlanData) => {
    isLoading.value = true
    error.value = null
    try {
      console.log('Creating plan with data:', planData)
      const newPlan = await plansService.create(planData)
      console.log('Plan created successfully:', newPlan)
      plans.value.push(newPlan)
      notify({
        message: 'Plan created successfully',
        color: 'success',
      })
      return newPlan
    } catch (err: any) {
      console.error('Error creating plan:', err)
      console.error('Error response:', err.response?.data)

      // Handle validation errors (field-specific errors)
      if (err.response?.data && typeof err.response.data === 'object') {
        const errors = err.response.data
        const errorMessages: string[] = []

        // Collect all field errors
        Object.keys(errors).forEach((field) => {
          const fieldErrors = errors[field]
          if (Array.isArray(fieldErrors)) {
            fieldErrors.forEach((msg) => errorMessages.push(`${field}: ${msg}`))
          } else if (typeof fieldErrors === 'string') {
            errorMessages.push(`${field}: ${fieldErrors}`)
          }
        })

        if (errorMessages.length > 0) {
          error.value = errorMessages.join('\n')
          notify({
            message: errorMessages.join('<br>'),
            color: 'danger',
            duration: 6000, // Show longer for multiple errors
          })
          throw err
        }
      }

      // Fallback to generic error
      error.value = err.response?.data?.detail || err.response?.data?.message || 'Failed to create plan'
      notify({
        message: error.value || 'Failed to create plan',
        color: 'danger',
      })
      throw err
    } finally {
      isLoading.value = false
    }
  }

  /**
   * Update existing plan
   */
  const updatePlan = async (id: number, planData: Partial<CreatePlanData>) => {
    isLoading.value = true
    error.value = null
    try {
      console.log('Updating plan', id, 'with data:', planData)
      const updatedPlan = await plansService.update(id, planData)
      console.log('Plan updated successfully:', updatedPlan)
      const index = plans.value.findIndex((p) => p.id === id)
      if (index !== -1) {
        plans.value[index] = updatedPlan
      }
      notify({
        message: 'Plan updated successfully',
        color: 'success',
      })
      return updatedPlan
    } catch (err: any) {
      console.error('Error updating plan:', err)
      console.error('Error response:', err.response?.data)

      // Handle validation errors (field-specific errors)
      if (err.response?.data && typeof err.response.data === 'object') {
        const errors = err.response.data
        const errorMessages: string[] = []

        // Collect all field errors
        Object.keys(errors).forEach((field) => {
          const fieldErrors = errors[field]
          if (Array.isArray(fieldErrors)) {
            fieldErrors.forEach((msg) => errorMessages.push(`${field}: ${msg}`))
          } else if (typeof fieldErrors === 'string') {
            errorMessages.push(`${field}: ${fieldErrors}`)
          }
        })

        if (errorMessages.length > 0) {
          error.value = errorMessages.join('\n')
          notify({
            message: errorMessages.join('<br>'),
            color: 'danger',
            duration: 6000, // Show longer for multiple errors
          })
          throw err
        }
      }

      // Fallback to generic error
      error.value = err.response?.data?.detail || err.response?.data?.message || 'Failed to update plan'
      notify({
        message: error.value || 'Failed to update plan',
        color: 'danger',
      })
      throw err
    } finally {
      isLoading.value = false
    }
  }

  /**
   * Delete plan
   */
  const deletePlan = async (id: number) => {
    isLoading.value = true
    error.value = null
    try {
      console.log('Deleting plan:', id)
      await plansService.delete(id)
      plans.value = plans.value.filter((p) => p.id !== id)
      notify({
        message: 'Plan deleted successfully',
        color: 'success',
      })
    } catch (err: any) {
      console.error('Error deleting plan:', err)
      console.error('Error response:', err.response?.data)
      error.value = err.response?.data?.detail || err.response?.data?.message || 'Failed to delete plan'
      notify({
        message: error.value || 'Failed to delete plan',
        color: 'danger',
      })
      throw err
    } finally {
      isLoading.value = false
    }
  }

  /**
   * Toggle plan activation
   */
  const toggleActivation = async (id: number, is_active: boolean) => {
    try {
      const updatedPlan = await plansService.toggleActivation(id, is_active)
      const index = plans.value.findIndex((p) => p.id === id)
      if (index !== -1) {
        plans.value[index] = updatedPlan
      }
      notify({
        message: `Plan ${is_active ? 'activated' : 'deactivated'} successfully`,
        color: 'success',
      })
      return updatedPlan
    } catch (err: any) {
      const errorMsg = err.response?.data?.detail || 'Failed to toggle plan activation'
      notify({
        message: errorMsg,
        color: 'danger',
      })
      throw err
    }
  }

  return {
    // State
    plans,
    subscriptionStatistics,
    isLoading,
    error,

    // Computed
    activePlans,
    inactivePlans,

    // Methods
    fetchPlans,
    fetchPublicPlans,
    fetchBenefits,
    fetchSubscriptionStatistics,
    createPlan,
    updatePlan,
    deletePlan,
    toggleActivation,
  }
}
