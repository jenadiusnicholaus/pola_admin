/**
 * Consultant Requests Store
 * Manages state for consultant registration requests and profiles
 */

import { defineStore } from 'pinia'
import { ref } from 'vue'
import {
  consultantRequestsService,
  type ConsultantRequest,
  type ConsultantProfile,
  type RequestStatistics,
  type ConsultantStatistics,
  type RequestFilters,
  type ConsultantFilters,
  type RejectData,
  type UpdateConsultantData,
} from '../services/consultantRequestsService'

export const useConsultantRequestsStore = defineStore('consultantRequests', () => {
  // ========== State ==========
  const requests = ref<ConsultantRequest[]>([])
  const consultants = ref<ConsultantProfile[]>([])
  const selectedRequest = ref<ConsultantRequest | null>(null)
  const selectedConsultant = ref<ConsultantProfile | null>(null)
  const requestStatistics = ref<RequestStatistics | null>(null)
  const consultantStatistics = ref<ConsultantStatistics | null>(null)

  // Pagination
  const requestsPagination = ref({
    count: 0,
    next: null as string | null,
    previous: null as string | null,
    currentPage: 1,
    pageSize: 10,
  })

  const consultantsPagination = ref({
    count: 0,
    next: null as string | null,
    previous: null as string | null,
    currentPage: 1,
    pageSize: 10,
  })

  // Loading states
  const loading = ref({
    requests: false,
    consultants: false,
    requestDetail: false,
    consultantDetail: false,
    statistics: false,
    actions: false,
  })

  const error = ref<string | null>(null)

  // ========== Request Management Actions ==========

  /**
   * Fetch all requests with filters
   */
  const fetchRequests = async (filters: RequestFilters = {}) => {
    loading.value.requests = true
    error.value = null

    try {
      const response = await consultantRequestsService.getAllRequests({
        ...filters,
        page: requestsPagination.value.currentPage,
        page_size: requestsPagination.value.pageSize,
      })

      requests.value = response.results
      requestsPagination.value.count = response.count
      requestsPagination.value.next = response.next
      requestsPagination.value.previous = response.previous
    } catch (err: any) {
      error.value = err.response?.data?.detail || 'Failed to fetch requests'
      throw err
    } finally {
      loading.value.requests = false
    }
  }

  /**
   * Fetch request by ID
   */
  const fetchRequestById = async (id: number) => {
    loading.value.requestDetail = true
    error.value = null

    try {
      const request = await consultantRequestsService.getRequestById(id)
      selectedRequest.value = request
      return request
    } catch (err: any) {
      error.value = err.response?.data?.detail || 'Failed to fetch request details'
      throw err
    } finally {
      loading.value.requestDetail = false
    }
  }

  /**
   * Fetch pending requests
   */
  const fetchPendingRequests = async () => {
    loading.value.requests = true
    error.value = null

    try {
      const response = await consultantRequestsService.getPendingRequests()
      requests.value = response.pending_requests
      requestsPagination.value.count = response.count
    } catch (err: any) {
      error.value = err.response?.data?.detail || 'Failed to fetch pending requests'
      throw err
    } finally {
      loading.value.requests = false
    }
  }

  /**
   * Fetch request statistics
   */
  const fetchRequestStatistics = async () => {
    loading.value.statistics = true
    error.value = null

    try {
      const stats = await consultantRequestsService.getRequestStatistics()
      requestStatistics.value = stats
      return stats
    } catch (err: any) {
      error.value = err.response?.data?.detail || 'Failed to fetch statistics'
      throw err
    } finally {
      loading.value.statistics = false
    }
  }

  /**
   * Approve request
   */
  const approveRequest = async (id: number) => {
    loading.value.actions = true
    error.value = null

    try {
      const result = await consultantRequestsService.approveRequest(id)

      // Update local state
      const index = requests.value.findIndex((r) => r.id === id)
      if (index !== -1) {
        requests.value[index].status = 'approved'
      }

      if (selectedRequest.value?.id === id) {
        selectedRequest.value.status = 'approved'
      }

      return result
    } catch (err: any) {
      error.value = err.response?.data?.error || err.response?.data?.detail || 'Failed to approve request'
      throw err
    } finally {
      loading.value.actions = false
    }
  }

  /**
   * Reject request
   */
  const rejectRequest = async (id: number, data: RejectData) => {
    loading.value.actions = true
    error.value = null

    try {
      const result = await consultantRequestsService.rejectRequest(id, data)

      // Update local state
      const index = requests.value.findIndex((r) => r.id === id)
      if (index !== -1) {
        requests.value[index].status = 'rejected'
        requests.value[index].admin_notes = data.reason
      }

      if (selectedRequest.value?.id === id) {
        selectedRequest.value.status = 'rejected'
        selectedRequest.value.admin_notes = data.reason
      }

      return result
    } catch (err: any) {
      error.value = err.response?.data?.error || err.response?.data?.detail || 'Failed to reject request'
      throw err
    } finally {
      loading.value.actions = false
    }
  }

  // ========== Consultant Management Actions ==========

  /**
   * Fetch all consultants with filters
   */
  const fetchConsultants = async (filters: ConsultantFilters = {}) => {
    loading.value.consultants = true
    error.value = null

    try {
      const response = await consultantRequestsService.getAllConsultants({
        ...filters,
        page: consultantsPagination.value.currentPage,
        page_size: consultantsPagination.value.pageSize,
      })

      consultants.value = response.results
      consultantsPagination.value.count = response.count
      consultantsPagination.value.next = response.next
      consultantsPagination.value.previous = response.previous
    } catch (err: any) {
      error.value = err.response?.data?.detail || 'Failed to fetch consultants'
      throw err
    } finally {
      loading.value.consultants = false
    }
  }

  /**
   * Fetch consultant by ID
   */
  const fetchConsultantById = async (id: number) => {
    loading.value.consultantDetail = true
    error.value = null

    try {
      const consultant = await consultantRequestsService.getConsultantById(id)
      selectedConsultant.value = consultant
      return consultant
    } catch (err: any) {
      error.value = err.response?.data?.detail || 'Failed to fetch consultant details'
      throw err
    } finally {
      loading.value.consultantDetail = false
    }
  }

  /**
   * Fetch consultant statistics
   */
  const fetchConsultantStatistics = async () => {
    loading.value.statistics = true
    error.value = null

    try {
      const stats = await consultantRequestsService.getConsultantStatistics()
      consultantStatistics.value = stats
      return stats
    } catch (err: any) {
      error.value = err.response?.data?.detail || 'Failed to fetch consultant statistics'
      throw err
    } finally {
      loading.value.statistics = false
    }
  }

  /**
   * Update consultant profile
   */
  const updateConsultant = async (id: number, data: UpdateConsultantData) => {
    loading.value.actions = true
    error.value = null

    try {
      const updated = await consultantRequestsService.updateConsultant(id, data)

      // Update local state
      const index = consultants.value.findIndex((c) => c.id === id)
      if (index !== -1) {
        consultants.value[index] = updated
      }

      if (selectedConsultant.value?.id === id) {
        selectedConsultant.value = updated
      }

      return updated
    } catch (err: any) {
      error.value = err.response?.data?.detail || 'Failed to update consultant'
      throw err
    } finally {
      loading.value.actions = false
    }
  }

  /**
   * Toggle consultant availability
   */
  const toggleConsultantAvailability = async (id: number) => {
    loading.value.actions = true
    error.value = null

    try {
      const result = await consultantRequestsService.toggleAvailability(id)

      // Update local state
      const index = consultants.value.findIndex((c) => c.id === id)
      if (index !== -1) {
        consultants.value[index].availability_status = result.availability_status
      }

      if (selectedConsultant.value?.id === id) {
        selectedConsultant.value.availability_status = result.availability_status
      }

      return result
    } catch (err: any) {
      error.value = err.response?.data?.detail || 'Failed to toggle availability'
      throw err
    } finally {
      loading.value.actions = false
    }
  }

  // ========== Utility Actions ==========

  /**
   * Clear error
   */
  const clearError = () => {
    error.value = null
  }

  /**
   * Reset selected request
   */
  const clearSelectedRequest = () => {
    selectedRequest.value = null
  }

  /**
   * Reset selected consultant
   */
  const clearSelectedConsultant = () => {
    selectedConsultant.value = null
  }

  /**
   * Set requests page
   */
  const setRequestsPage = (page: number) => {
    requestsPagination.value.currentPage = page
  }

  /**
   * Set consultants page
   */
  const setConsultantsPage = (page: number) => {
    consultantsPagination.value.currentPage = page
  }

  return {
    // State
    requests,
    consultants,
    selectedRequest,
    selectedConsultant,
    requestStatistics,
    consultantStatistics,
    requestsPagination,
    consultantsPagination,
    loading,
    error,

    // Request Actions
    fetchRequests,
    fetchRequestById,
    fetchPendingRequests,
    fetchRequestStatistics,
    approveRequest,
    rejectRequest,

    // Consultant Actions
    fetchConsultants,
    fetchConsultantById,
    fetchConsultantStatistics,
    updateConsultant,
    toggleConsultantAvailability,

    // Utility Actions
    clearError,
    clearSelectedRequest,
    clearSelectedConsultant,
    setRequestsPage,
    setConsultantsPage,
  }
})
