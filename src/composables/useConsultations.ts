/**
 * Composable for Consultations Management
 * Provides reactive state and methods for handling consultations, consultants, and pricing
 */

import { ref, computed } from 'vue'
import { useToast } from 'vuestic-ui'
import {
  consultationsService,
  type PricingConfiguration,
  type ConsultantProfile,
  type ConsultationBooking,
  type ConsultationFilters,
  type ConsultationStatistics,
  type CreatePricingData,
  type CreateConsultantData,
  type UpdateBookingStatusData,
} from '../services/consultationsService'

export function useConsultations() {
  const { init: notify } = useToast()

  const pricingConfigs = ref<PricingConfiguration[]>([])
  const consultants = ref<ConsultantProfile[]>([])
  const bookings = ref<ConsultationBooking[]>([])
  const statistics = ref<ConsultationStatistics | null>(null)
  const totalCount = ref(0)
  const isLoading = ref(false)
  const error = ref<string | null>(null)

  // Computed properties
  const activePricing = computed(() => pricingConfigs.value.filter((p) => p.is_active))
  const availableConsultants = computed(() => consultants.value.filter((c) => c.is_available))
  const pendingBookings = computed(() => bookings.value.filter((b) => b.status === 'pending'))
  const completedBookings = computed(() => bookings.value.filter((b) => b.status === 'completed'))

  // ==================== Pricing Configuration ====================

  const fetchPricingConfigs = async () => {
    isLoading.value = true
    error.value = null
    try {
      pricingConfigs.value = await consultationsService.getPricingConfigs()
    } catch (err: any) {
      error.value = err.response?.data?.detail || 'Failed to fetch pricing configs'
      notify({ message: error.value ?? 'Failed to fetch pricing configs', color: 'danger' })
    } finally {
      isLoading.value = false
    }
  }

  const createPricing = async (data: CreatePricingData) => {
    isLoading.value = true
    error.value = null
    try {
      const newPricing = await consultationsService.createPricing(data)
      pricingConfigs.value.push(newPricing)
      notify({ message: 'Pricing configuration created', color: 'success' })
      return newPricing
    } catch (err: any) {
      error.value = err.response?.data?.detail || 'Failed to create pricing'
      notify({ message: error.value ?? 'Failed to create pricing', color: 'danger' })
      throw err
    } finally {
      isLoading.value = false
    }
  }

  const updatePricing = async (id: number, data: Partial<CreatePricingData>) => {
    isLoading.value = true
    error.value = null
    try {
      const updated = await consultationsService.updatePricing(id, data)
      const index = pricingConfigs.value.findIndex((p) => p.id === id)
      if (index !== -1) {
        pricingConfigs.value[index] = updated
      }
      notify({ message: 'Pricing updated successfully', color: 'success' })
      return updated
    } catch (err: any) {
      error.value = err.response?.data?.detail || 'Failed to update pricing'
      notify({ message: error.value ?? 'Failed to update pricing', color: 'danger' })
      throw err
    } finally {
      isLoading.value = false
    }
  }

  const deletePricing = async (id: number) => {
    isLoading.value = true
    error.value = null
    try {
      await consultationsService.deletePricing(id)
      pricingConfigs.value = pricingConfigs.value.filter((p) => p.id !== id)
      notify({ message: 'Pricing deleted successfully', color: 'success' })
    } catch (err: any) {
      error.value = err.response?.data?.detail || 'Failed to delete pricing'
      notify({ message: error.value ?? 'Failed to delete pricing', color: 'danger' })
      throw err
    } finally {
      isLoading.value = false
    }
  }

  // ==================== Consultants ====================

  const fetchConsultants = async (filters: ConsultationFilters = {}) => {
    isLoading.value = true
    error.value = null
    try {
      const response = await consultationsService.getConsultants(filters)
      consultants.value = response.results
      totalCount.value = response.count
    } catch (err: any) {
      error.value = err.response?.data?.detail || 'Failed to fetch consultants'
      notify({ message: error.value ?? 'Failed to fetch consultants', color: 'danger' })
    } finally {
      isLoading.value = false
    }
  }

  const createConsultant = async (data: CreateConsultantData) => {
    isLoading.value = true
    error.value = null
    try {
      const newConsultant = await consultationsService.createConsultant(data)
      consultants.value.push(newConsultant)
      notify({ message: 'Consultant profile created', color: 'success' })
      return newConsultant
    } catch (err: any) {
      error.value = err.response?.data?.detail || 'Failed to create consultant'
      notify({ message: error.value ?? 'Failed to create consultant', color: 'danger' })
      throw err
    } finally {
      isLoading.value = false
    }
  }

  const updateConsultant = async (id: number, data: Partial<CreateConsultantData>) => {
    isLoading.value = true
    error.value = null
    try {
      const updated = await consultationsService.updateConsultant(id, data)
      const index = consultants.value.findIndex((c) => c.id === id)
      if (index !== -1) {
        consultants.value[index] = updated
      }
      notify({ message: 'Consultant updated successfully', color: 'success' })
      return updated
    } catch (err: any) {
      error.value = err.response?.data?.detail || 'Failed to update consultant'
      notify({ message: error.value ?? 'Failed to update consultant', color: 'danger' })
      throw err
    } finally {
      isLoading.value = false
    }
  }

  const toggleConsultantAvailability = async (id: number) => {
    try {
      const updated = await consultationsService.toggleAvailability(id)
      const index = consultants.value.findIndex((c) => c.id === id)
      if (index !== -1) {
        consultants.value[index] = updated
      }
      notify({
        message: `Consultant ${updated.is_available ? 'enabled' : 'disabled'}`,
        color: 'success',
      })
      return updated
    } catch (err: any) {
      const errorMsg = err.response?.data?.detail || 'Failed to toggle availability'
      notify({ message: errorMsg, color: 'danger' })
      throw err
    }
  }

  // ==================== Bookings ====================

  const fetchBookings = async (filters: ConsultationFilters = {}) => {
    isLoading.value = true
    error.value = null
    try {
      const response = await consultationsService.getBookings(filters)
      bookings.value = response.results
      totalCount.value = response.count
    } catch (err: any) {
      error.value = err.response?.data?.detail || 'Failed to fetch bookings'
      notify({ message: error.value ?? 'Failed to fetch bookings', color: 'danger' })
    } finally {
      isLoading.value = false
    }
  }

  const updateBookingStatus = async (id: number, data: UpdateBookingStatusData) => {
    isLoading.value = true
    error.value = null
    try {
      const updated = await consultationsService.updateBookingStatus(id, data)
      const index = bookings.value.findIndex((b) => b.id === id)
      if (index !== -1) {
        bookings.value[index] = updated
      }
      notify({ message: 'Booking status updated', color: 'success' })
      return updated
    } catch (err: any) {
      error.value = err.response?.data?.detail || 'Failed to update booking'
      notify({ message: error.value ?? 'Failed to update booking', color: 'danger' })
      throw err
    } finally {
      isLoading.value = false
    }
  }

  const fetchStatistics = async () => {
    try {
      statistics.value = await consultationsService.getStatistics()
    } catch (err: any) {
      const errorMsg = err.response?.data?.detail || 'Failed to fetch statistics'
      notify({ message: errorMsg, color: 'danger' })
    }
  }

  return {
    // State
    pricingConfigs,
    consultants,
    bookings,
    statistics,
    totalCount,
    isLoading,
    error,

    // Computed
    activePricing,
    availableConsultants,
    pendingBookings,
    completedBookings,

    // Methods
    fetchPricingConfigs,
    createPricing,
    updatePricing,
    deletePricing,
    fetchConsultants,
    createConsultant,
    updateConsultant,
    toggleConsultantAvailability,
    fetchBookings,
    updateBookingStatus,
    fetchStatistics,
  }
}
