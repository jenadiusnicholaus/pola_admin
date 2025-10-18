/**
 * Composable for Documents Management
 * Provides reactive state and methods for handling learning materials
 */

import { ref, computed } from 'vue'
import { useToast } from 'vuestic-ui'
import {
  documentsService,
  type LearningMaterial,
  type DocumentFilters,
  type DocumentStatistics,
  type ApproveRejectData,
  type UpdatePriceData,
} from '../services/documentsService'

export function useDocuments() {
  const { init: notify } = useToast()

  const materials = ref<LearningMaterial[]>([])
  const statistics = ref<DocumentStatistics | null>(null)
  const totalCount = ref(0)
  const isLoading = ref(false)
  const error = ref<string | null>(null)

  // Computed properties
  const pendingMaterials = computed(() => materials.value.filter((m) => m.status === 'pending'))
  const approvedMaterials = computed(() => materials.value.filter((m) => m.status === 'approved'))
  const rejectedMaterials = computed(() => materials.value.filter((m) => m.status === 'rejected'))

  /**
   * Fetch all materials with filters
   */
  const fetchMaterials = async (filters: DocumentFilters = {}) => {
    isLoading.value = true
    error.value = null
    try {
      const response = await documentsService.getMaterials(filters)
      materials.value = response.results
      totalCount.value = response.count
    } catch (err: any) {
      error.value = err.response?.data?.detail || 'Failed to fetch materials'
      notify({
        message: error.value || 'Failed to fetch materials',
        color: 'danger',
      })
    } finally {
      isLoading.value = false
    }
  }

  /**
   * Fetch material statistics
   */
  const fetchStatistics = async () => {
    try {
      statistics.value = await documentsService.getStatistics()
    } catch (err: any) {
      const errorMsg = err.response?.data?.detail || 'Failed to fetch statistics'
      notify({
        message: errorMsg,
        color: 'danger',
      })
    }
  }

  /**
   * Approve material
   */
  const approveMaterial = async (id: number, data: ApproveRejectData = {}) => {
    isLoading.value = true
    error.value = null
    try {
      const updated = await documentsService.approveMaterial(id, data)
      const index = materials.value.findIndex((m) => m.id === id)
      if (index !== -1) {
        materials.value[index] = updated
      }
      notify({
        message: 'Material approved successfully',
        color: 'success',
      })
      return updated
    } catch (err: any) {
      error.value = err.response?.data?.detail || 'Failed to approve material'
      notify({
        message: error.value || 'Failed to approve material',
        color: 'danger',
      })
      throw err
    } finally {
      isLoading.value = false
    }
  }

  /**
   * Reject material
   */
  const rejectMaterial = async (id: number, data: ApproveRejectData) => {
    isLoading.value = true
    error.value = null
    try {
      const updated = await documentsService.rejectMaterial(id, data)
      const index = materials.value.findIndex((m) => m.id === id)
      if (index !== -1) {
        materials.value[index] = updated
      }
      notify({
        message: 'Material rejected',
        color: 'warning',
      })
      return updated
    } catch (err: any) {
      error.value = err.response?.data?.detail || 'Failed to reject material'
      notify({
        message: error.value || 'Failed to reject material',
        color: 'danger',
      })
      throw err
    } finally {
      isLoading.value = false
    }
  }

  /**
   * Update material price
   */
  const updatePrice = async (id: number, data: UpdatePriceData) => {
    isLoading.value = true
    error.value = null
    try {
      const updated = await documentsService.updatePrice(id, data)
      const index = materials.value.findIndex((m) => m.id === id)
      if (index !== -1) {
        materials.value[index] = updated
      }
      notify({
        message: 'Price updated successfully',
        color: 'success',
      })
      return updated
    } catch (err: any) {
      error.value = err.response?.data?.detail || 'Failed to update price'
      notify({
        message: error.value || 'Failed to update price',
        color: 'danger',
      })
      throw err
    } finally {
      isLoading.value = false
    }
  }

  /**
   * Delete material
   */
  const deleteMaterial = async (id: number) => {
    isLoading.value = true
    error.value = null
    try {
      await documentsService.deleteMaterial(id)
      materials.value = materials.value.filter((m) => m.id !== id)
      totalCount.value -= 1
      notify({
        message: 'Material deleted successfully',
        color: 'success',
      })
    } catch (err: any) {
      error.value = err.response?.data?.detail || 'Failed to delete material'
      notify({
        message: error.value || 'Failed to delete material',
        color: 'danger',
      })
      throw err
    } finally {
      isLoading.value = false
    }
  }

  return {
    // State
    materials,
    statistics,
    totalCount,
    isLoading,
    error,

    // Computed
    pendingMaterials,
    approvedMaterials,
    rejectedMaterials,

    // Methods
    fetchMaterials,
    fetchStatistics,
    approveMaterial,
    rejectMaterial,
    updatePrice,
    deleteMaterial,
  }
}
