/**
 * Composable for Transactions Management
 * Provides reactive state and methods for handling transactions and refunds
 */

import { ref, computed } from 'vue'
import { useToast } from 'vuestic-ui'
import {
  transactionsService,
  type Transaction,
  type TransactionFilters,
  type TransactionStatistics,
} from '../services/transactionsService'

export function useTransactions() {
  const { init: notify } = useToast()

  const transactions = ref<Transaction[]>([])
  const statistics = ref<TransactionStatistics | null>(null)
  const totalCount = ref(0)
  const isLoading = ref(false)
  const error = ref<string | null>(null)

  // Computed properties
  const completedTransactions = computed(() => transactions.value.filter((t) => t.status === 'completed'))
  const pendingTransactions = computed(() => transactions.value.filter((t) => t.status === 'pending'))
  const failedTransactions = computed(() => transactions.value.filter((t) => t.status === 'failed'))
  const refundTransactions = computed(() => transactions.value.filter((t) => t.status === 'refunded'))

  /**
   * Fetch all transactions with filters
   */
  const fetchTransactions = async (filters: TransactionFilters = {}) => {
    isLoading.value = true
    error.value = null
    try {
      const response = await transactionsService.getAll(filters)
      transactions.value = response.results
      totalCount.value = response.count
    } catch (err: any) {
      error.value = err.response?.data?.detail || 'Failed to fetch transactions'
      notify({
        message: error.value || 'Failed to fetch transactions',
        color: 'danger',
      })
    } finally {
      isLoading.value = false
    }
  }

  /**
   * Fetch transaction statistics
   */
  const fetchStatistics = async () => {
    try {
      statistics.value = await transactionsService.getStatistics()
    } catch (err: any) {
      const errorMsg = err.response?.data?.detail || 'Failed to fetch statistics'
      notify({
        message: errorMsg,
        color: 'danger',
      })
    }
  }

  /**
   * Get transaction by ID
   */
  const getTransaction = async (id: number): Promise<Transaction | null> => {
    try {
      return await transactionsService.getById(id)
    } catch (err: any) {
      const errorMsg = err.response?.data?.detail || 'Failed to fetch transaction'
      notify({
        message: errorMsg,
        color: 'danger',
      })
      return null
    }
  }

  // TODO: These methods are not yet implemented in the service
  // Uncomment when the backend endpoints are available

  /**
   * Process refund (MOST IMPORTANT)
   * NOTE: Not yet implemented in transactionsService
   */
  // const processRefund = async (id: number, data: any) => {
  //   isLoading.value = true
  //   error.value = null
  //   try {
  //     const refundTransaction = await transactionsService.refund(id, data)
  //     transactions.value.unshift(refundTransaction)
  //     totalCount.value += 1
  //     notify({
  //       message: 'Refund processed successfully',
  //       color: 'success',
  //     })
  //     return refundTransaction
  //   } catch (err: any) {
  //     error.value = err.response?.data?.detail || 'Failed to process refund'
  //     notify({
  //       message: error.value || 'Failed to process refund',
  //       color: 'danger',
  //     })
  //     throw err
  //   } finally {
  //     isLoading.value = false
  //   }
  // }

  /**
   * Mark transaction as completed
   * NOTE: Not yet implemented in transactionsService
   */
  // const completeTransaction = async (id: number) => {
  //   try {
  //     const updated = await transactionsService.complete(id)
  //     const index = transactions.value.findIndex((t) => t.id === id)
  //     if (index !== -1) {
  //       transactions.value[index] = updated
  //     }
  //     notify({
  //       message: 'Transaction marked as completed',
  //       color: 'success',
  //     })
  //     return updated
  //   } catch (err: any) {
  //     const errorMsg = err.response?.data?.detail || 'Failed to complete transaction'
  //     notify({
  //       message: errorMsg,
  //       color: 'danger',
  //     })
  //     throw err
  //   }
  // }

  /**
   * Mark transaction as failed
   * NOTE: Not yet implemented in transactionsService
   */
  // const failTransaction = async (id: number, data: any) => {
  //   try {
  //     const updated = await transactionsService.fail(id, data)
  //     const index = transactions.value.findIndex((t) => t.id === id)
  //     if (index !== -1) {
  //       transactions.value[index] = updated
  //     }
  //     notify({
  //       message: 'Transaction marked as failed',
  //       color: 'warning',
  //     })
  //     return updated
  //   } catch (err: any) {
  //     const errorMsg = err.response?.data?.detail || 'Failed to mark transaction as failed'
  //     notify({
  //       message: errorMsg,
  //       color: 'danger',
  //     })
  //     throw err
  //   }
  // }

  /**
   * Cancel transaction
   * NOTE: Not yet implemented in transactionsService
   */
  // const cancelTransaction = async (id: number, data: any) => {
  //   try {
  //     const updated = await transactionsService.cancel(id, data)
  //     const index = transactions.value.findIndex((t) => t.id === id)
  //     if (index !== -1) {
  //       transactions.value[index] = updated
  //     }
  //     notify({
  //       message: 'Transaction cancelled',
  //       color: 'success',
  //     })
  //     return updated
  //   } catch (err: any) {
  //     const errorMsg = err.response?.data?.detail || 'Failed to cancel transaction'
  //     notify({
  //       message: errorMsg,
  //       color: 'danger',
  //     })
  //     throw err
  //   }
  // }

  return {
    // State
    transactions,
    statistics,
    totalCount,
    isLoading,
    error,

    // Computed
    completedTransactions,
    pendingTransactions,
    failedTransactions,
    refundTransactions,

    // Methods
    fetchTransactions,
    fetchStatistics,
    getTransaction,
    // TODO: Uncomment when backend supports these operations
    // processRefund,
    // completeTransaction,
    // failTransaction,
    // cancelTransaction,
  }
}
