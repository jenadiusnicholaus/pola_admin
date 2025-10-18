/**
 * Composable for Disbursements Management
 * Provides reactive state and methods for handling consultant and uploader earnings
 */

import { ref, computed } from 'vue'
import { useToast } from 'vuestic-ui'
import {
  disbursementsService,
  type ConsultantEarning,
  type UploaderEarning,
  type Disbursement,
  type EarningsFilters,
  type EarningsStatistics,
  type MarkPaidData,
} from '../services/disbursementsService'

export function useDisbursements() {
  const { init: notify } = useToast()

  const consultantEarnings = ref<ConsultantEarning[]>([])
  const uploaderEarnings = ref<UploaderEarning[]>([])
  const disbursements = ref<Disbursement[]>([])
  const consultantStats = ref<EarningsStatistics | null>(null)
  const uploaderStats = ref<EarningsStatistics | null>(null)
  const totalCount = ref(0)
  const isLoading = ref(false)
  const error = ref<string | null>(null)

  // Computed properties
  const pendingConsultantEarnings = computed(() => consultantEarnings.value.filter((e) => e.status === 'pending'))
  const pendingUploaderEarnings = computed(() => uploaderEarnings.value.filter((e) => e.status === 'pending'))
  const paidConsultantEarnings = computed(() => consultantEarnings.value.filter((e) => e.status === 'paid'))
  const paidUploaderEarnings = computed(() => uploaderEarnings.value.filter((e) => e.status === 'paid'))

  // ==================== Consultant Earnings ====================

  const fetchConsultantEarnings = async (filters: EarningsFilters = {}) => {
    isLoading.value = true
    error.value = null
    try {
      const response = await disbursementsService.getConsultantEarnings(filters)
      consultantEarnings.value = response.results
      totalCount.value = response.count
    } catch (err: any) {
      error.value = err.response?.data?.detail || 'Failed to fetch consultant earnings'
      notify({ message: error.value || 'Failed to fetch consultant earnings', color: 'danger' })
    } finally {
      isLoading.value = false
    }
  }

  const markConsultantEarningPaid = async (id: number, data: MarkPaidData) => {
    isLoading.value = true
    error.value = null
    try {
      const updated = await disbursementsService.markConsultantEarningPaid(id, data)
      const index = consultantEarnings.value.findIndex((e) => e.id === id)
      if (index !== -1) {
        consultantEarnings.value[index] = updated
      }
      notify({ message: 'Marked as paid successfully', color: 'success' })
      return updated
    } catch (err: any) {
      error.value = err.response?.data?.detail || 'Failed to mark as paid'
      notify({ message: error.value || 'Failed to mark consultant earning as paid', color: 'danger' })
      throw err
    } finally {
      isLoading.value = false
    }
  }

  const fetchPendingConsultantEarnings = async () => {
    try {
      consultantEarnings.value = await disbursementsService.getPendingConsultantEarnings()
    } catch (err: any) {
      const errorMsg = err.response?.data?.detail || 'Failed to fetch pending earnings'
      notify({ message: errorMsg, color: 'danger' })
    }
  }

  const fetchConsultantStats = async () => {
    try {
      consultantStats.value = await disbursementsService.getConsultantEarningsStats()
    } catch (err: any) {
      const errorMsg = err.response?.data?.detail || 'Failed to fetch consultant stats'
      notify({ message: errorMsg, color: 'danger' })
    }
  }

  // ==================== Uploader Earnings ====================

  const fetchUploaderEarnings = async (filters: EarningsFilters = {}) => {
    isLoading.value = true
    error.value = null
    try {
      const response = await disbursementsService.getUploaderEarnings(filters)
      uploaderEarnings.value = response.results
      totalCount.value = response.count
    } catch (err: any) {
      error.value = err.response?.data?.detail || 'Failed to fetch uploader earnings'
      notify({ message: error.value || 'Failed to fetch uploader earnings', color: 'danger' })
    } finally {
      isLoading.value = false
    }
  }

  const markUploaderEarningPaid = async (id: number, data: MarkPaidData) => {
    isLoading.value = true
    error.value = null
    try {
      const updated = await disbursementsService.markUploaderEarningPaid(id, data)
      const index = uploaderEarnings.value.findIndex((e) => e.id === id)
      if (index !== -1) {
        uploaderEarnings.value[index] = updated
      }
      notify({ message: 'Marked as paid successfully', color: 'success' })
      return updated
    } catch (err: any) {
      error.value = err.response?.data?.detail || 'Failed to mark as paid'
      notify({ message: error.value || 'Failed to mark uploader earning as paid', color: 'danger' })
      throw err
    } finally {
      isLoading.value = false
    }
  }

  const fetchPendingUploaderEarnings = async () => {
    try {
      uploaderEarnings.value = await disbursementsService.getPendingUploaderEarnings()
    } catch (err: any) {
      const errorMsg = err.response?.data?.detail || 'Failed to fetch pending earnings'
      notify({ message: errorMsg, color: 'danger' })
    }
  }

  const fetchUploaderStats = async () => {
    try {
      uploaderStats.value = await disbursementsService.getUploaderEarningsStats()
    } catch (err: any) {
      const errorMsg = err.response?.data?.detail || 'Failed to fetch uploader stats'
      notify({ message: errorMsg, color: 'danger' })
    }
  }

  // ==================== Disbursements ====================

  const fetchDisbursements = async (filters: EarningsFilters = {}) => {
    isLoading.value = true
    error.value = null
    try {
      const response = await disbursementsService.getDisbursements(filters)
      disbursements.value = response.results
      totalCount.value = response.count
    } catch (err: any) {
      error.value = err.response?.data?.detail || 'Failed to fetch disbursements'
      notify({ message: error.value || 'Failed to fetch disbursements', color: 'danger' })
    } finally {
      isLoading.value = false
    }
  }

  return {
    // State
    consultantEarnings,
    uploaderEarnings,
    disbursements,
    consultantStats,
    uploaderStats,
    totalCount,
    isLoading,
    error,

    // Computed
    pendingConsultantEarnings,
    pendingUploaderEarnings,
    paidConsultantEarnings,
    paidUploaderEarnings,

    // Methods
    fetchConsultantEarnings,
    markConsultantEarningPaid,
    fetchPendingConsultantEarnings,
    fetchConsultantStats,
    fetchUploaderEarnings,
    markUploaderEarningPaid,
    fetchPendingUploaderEarnings,
    fetchUploaderStats,
    fetchDisbursements,
  }
}
