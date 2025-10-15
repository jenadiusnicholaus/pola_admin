/**
 * Composable for Plans Management
 * Provides reactive state and methods for handling subscription plans
 */

import { ref, computed } from 'vue'
import { useToast } from 'vuestic-ui'
import { plansService, type SubscriptionPlan, type CreatePlanData, type PlanStatistics } from '../services/plansService'

export function usePlans() {
  const { init: notify } = useToast()

  const plans = ref<SubscriptionPlan[]>([])
  const statistics = ref<PlanStatistics | null>(null)
  const isLoading = ref(false)
  const error = ref<string | null>(null)

  // Computed properties
  const activePlans = computed(() => plans.value.filter((plan) => plan.is_active))
  const inactivePlans = computed(() => plans.value.filter((plan) => !plan.is_active))
  const popularPlans = computed(() => plans.value.filter((plan) => plan.is_popular))

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
   * Fetch plan statistics
   */
  const fetchStatistics = async () => {
    try {
      statistics.value = await plansService.getStatistics()
    } catch (err: any) {
      const errorMsg = err.response?.data?.detail || 'Failed to fetch statistics'
      notify({
        message: errorMsg,
        color: 'danger',
      })
    }
  }

  /**
   * Create new plan
   */
  const createPlan = async (planData: CreatePlanData) => {
    isLoading.value = true
    error.value = null
    try {
      const newPlan = await plansService.create(planData)
      plans.value.push(newPlan)
      notify({
        message: 'Plan created successfully',
        color: 'success',
      })
      return newPlan
    } catch (err: any) {
      error.value = err.response?.data?.detail || 'Failed to create plan'
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
      const updatedPlan = await plansService.update(id, planData)
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
      error.value = err.response?.data?.detail || 'Failed to update plan'
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
      await plansService.delete(id)
      plans.value = plans.value.filter((p) => p.id !== id)
      notify({
        message: 'Plan deleted successfully',
        color: 'success',
      })
    } catch (err: any) {
      error.value = err.response?.data?.detail || 'Failed to delete plan'
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
   * Activate plan
   */
  const activatePlan = async (id: number) => {
    try {
      const updatedPlan = await plansService.activate(id)
      const index = plans.value.findIndex((p) => p.id === id)
      if (index !== -1) {
        plans.value[index] = updatedPlan
      }
      notify({
        message: 'Plan activated successfully',
        color: 'success',
      })
      return updatedPlan
    } catch (err: any) {
      const errorMsg = err.response?.data?.detail || 'Failed to activate plan'
      notify({
        message: errorMsg,
        color: 'danger',
      })
      throw err
    }
  }

  /**
   * Deactivate plan
   */
  const deactivatePlan = async (id: number) => {
    try {
      const updatedPlan = await plansService.deactivate(id)
      const index = plans.value.findIndex((p) => p.id === id)
      if (index !== -1) {
        plans.value[index] = updatedPlan
      }
      notify({
        message: 'Plan deactivated successfully',
        color: 'success',
      })
      return updatedPlan
    } catch (err: any) {
      const errorMsg = err.response?.data?.detail || 'Failed to deactivate plan'
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
    statistics,
    isLoading,
    error,

    // Computed
    activePlans,
    inactivePlans,
    popularPlans,

    // Methods
    fetchPlans,
    fetchStatistics,
    createPlan,
    updatePlan,
    deletePlan,
    activatePlan,
    deactivatePlan,
  }
}
