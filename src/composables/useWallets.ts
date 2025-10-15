/**
 * Composable for Wallets Management
 * Provides reactive state and methods for handling user wallets
 */

import { ref, computed } from 'vue'
import { useToast } from 'vuestic-ui'
import {
  walletsService,
  type Wallet,
  type WalletFilters,
  type WalletStatistics,
  type AdjustBalanceData,
  type FreezeWalletData,
} from '../services/walletsService'

export function useWallets() {
  const { init: notify } = useToast()

  const wallets = ref<Wallet[]>([])
  const statistics = ref<WalletStatistics | null>(null)
  const totalCount = ref(0)
  const isLoading = ref(false)
  const error = ref<string | null>(null)

  // Computed properties
  const activeWallets = computed(() => wallets.value.filter((w) => w.is_active))
  const frozenWallets = computed(() => wallets.value.filter((w) => !w.is_active))
  const walletsWithBalance = computed(() => wallets.value.filter((w) => parseFloat(w.balance) > 0))

  /**
   * Fetch all wallets with filters
   */
  const fetchWallets = async (filters: WalletFilters = {}) => {
    isLoading.value = true
    error.value = null
    try {
      const response = await walletsService.getAll(filters)
      wallets.value = response.results
      totalCount.value = response.count
    } catch (err: any) {
      error.value = err.response?.data?.detail || 'Failed to fetch wallets'
      notify({
        message: error.value || 'Failed to fetch wallets',
        color: 'danger',
      })
    } finally {
      isLoading.value = false
    }
  }

  /**
   * Fetch wallet statistics
   */
  const fetchStatistics = async () => {
    try {
      statistics.value = await walletsService.getStatistics()
    } catch (err: any) {
      const errorMsg = err.response?.data?.detail || 'Failed to fetch statistics'
      notify({
        message: errorMsg,
        color: 'danger',
      })
    }
  }

  /**
   * Get wallet by ID
   */
  const getWallet = async (id: number): Promise<Wallet | null> => {
    try {
      return await walletsService.getById(id)
    } catch (err: any) {
      const errorMsg = err.response?.data?.detail || 'Failed to fetch wallet'
      notify({
        message: errorMsg,
        color: 'danger',
      })
      return null
    }
  }

  /**
   * Adjust wallet balance
   */
  const adjustBalance = async (id: number, data: AdjustBalanceData) => {
    isLoading.value = true
    error.value = null
    try {
      const updated = await walletsService.adjust(id, data)
      const index = wallets.value.findIndex((w) => w.id === id)
      if (index !== -1) {
        wallets.value[index] = updated
      }
      const action = data.amount > 0 ? 'added to' : 'deducted from'
      notify({
        message: `Balance ${action} wallet successfully`,
        color: 'success',
      })
      return updated
    } catch (err: any) {
      error.value = err.response?.data?.detail || 'Failed to adjust wallet balance'
      notify({
        message: error.value || 'Failed to adjust wallet balance',
        color: 'danger',
      })
      throw err
    } finally {
      isLoading.value = false
    }
  }

  /**
   * Freeze wallet
   */
  const freezeWallet = async (id: number, data: FreezeWalletData) => {
    try {
      const updated = await walletsService.freeze(id, data)
      const index = wallets.value.findIndex((w) => w.id === id)
      if (index !== -1) {
        wallets.value[index] = updated
      }
      notify({
        message: 'Wallet frozen successfully',
        color: 'success',
      })
      return updated
    } catch (err: any) {
      const errorMsg = err.response?.data?.detail || 'Failed to freeze wallet'
      notify({
        message: errorMsg,
        color: 'danger',
      })
      throw err
    }
  }

  /**
   * Unfreeze wallet
   */
  const unfreezeWallet = async (id: number) => {
    try {
      const updated = await walletsService.unfreeze(id)
      const index = wallets.value.findIndex((w) => w.id === id)
      if (index !== -1) {
        wallets.value[index] = updated
      }
      notify({
        message: 'Wallet unfrozen successfully',
        color: 'success',
      })
      return updated
    } catch (err: any) {
      const errorMsg = err.response?.data?.detail || 'Failed to unfreeze wallet'
      notify({
        message: errorMsg,
        color: 'danger',
      })
      throw err
    }
  }

  return {
    // State
    wallets,
    statistics,
    totalCount,
    isLoading,
    error,

    // Computed
    activeWallets,
    frozenWallets,
    walletsWithBalance,

    // Methods
    fetchWallets,
    fetchStatistics,
    getWallet,
    adjustBalance,
    freezeWallet,
    unfreezeWallet,
  }
}
