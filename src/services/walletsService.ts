/**
 * Wallets Service
 * Handles all wallet management operations
 */

import { subscriptionApiClient, buildUrl, ENDPOINTS } from './subscriptionApiClient'

export interface MoneyDetails {
  amount: string
  currency: string
  currency_symbol: string
  formatted: string
}

export interface Wallet {
  id: number
  user: number
  user_email: string
  balance: string
  balance_details: MoneyDetails
  currency: string
  is_active: boolean
  total_earnings: string
  earnings_details: MoneyDetails
  total_withdrawn: string
  withdrawn_details: MoneyDetails
  available_for_withdrawal: number
  frozen_at?: string
  freeze_reason?: string
  created_at: string
  updated_at: string
}

export interface WalletFilters {
  email?: string
  min_balance?: number
  max_balance?: number
  is_active?: boolean
  page?: number
  page_size?: number
}

export interface WalletStatistics {
  total_wallets: number
  active_wallets: number
  frozen_wallets: number
  total_balance: number
  average_balance: number
  wallets_with_balance: number
}

export interface AdjustBalanceData {
  amount: number
  reason: string
}

export interface FreezeWalletData {
  reason: string
}

export const walletsService = {
  /**
   * Get all wallets with optional filters
   */
  getAll: async (filters: WalletFilters = {}): Promise<{ results: Wallet[]; count: number }> => {
    const params = new URLSearchParams()
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        params.append(key, String(value))
      }
    })
    const response = await subscriptionApiClient.get(buildUrl(`${ENDPOINTS.wallets}?${params.toString()}`))
    return response.data
  },

  /**
   * Get wallet by ID
   */
  getById: async (id: number): Promise<Wallet> => {
    const response = await subscriptionApiClient.get(buildUrl(`${ENDPOINTS.wallets}${id}/`))
    return response.data
  },

  /**
   * Adjust wallet balance (add or subtract)
   */
  adjust: async (id: number, data: AdjustBalanceData): Promise<Wallet> => {
    const response = await subscriptionApiClient.post(buildUrl(`${ENDPOINTS.wallets}${id}/adjust/`), data)
    return response.data
  },

  /**
   * Freeze wallet
   */
  freeze: async (id: number, data: FreezeWalletData): Promise<Wallet> => {
    const response = await subscriptionApiClient.post(buildUrl(`${ENDPOINTS.wallets}${id}/freeze/`), data)
    return response.data
  },

  /**
   * Unfreeze wallet
   */
  unfreeze: async (id: number): Promise<Wallet> => {
    const response = await subscriptionApiClient.post(buildUrl(`${ENDPOINTS.wallets}${id}/unfreeze/`))
    return response.data
  },

  /**
   * Get wallet statistics
   */
  getStatistics: async (): Promise<WalletStatistics> => {
    const response = await subscriptionApiClient.get(buildUrl('/subscriptions/admin/wallets/statistics/'))
    return response.data
  },
}

export default walletsService
