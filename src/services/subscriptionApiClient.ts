/**
 * Subscription Management API Configuration
 * Uses global axios instance with interceptors from interceptors.ts
 */

import axios from 'axios'

// Base URLs from environment variables
export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api/v1'
export const SUBSCRIPTIONS_BASE = import.meta.env.VITE_SUBSCRIPTIONS_BASE || '/subscriptions/admin'

// Admin endpoints from environment variables
export const ENDPOINTS = {
  plans: import.meta.env.VITE_PLANS_ENDPOINT || '/subscriptions/admin/plans/',
  subscriptions: import.meta.env.VITE_SUBSCRIPTIONS_ENDPOINT || '/subscriptions/admin/subscriptions/',
  transactions: import.meta.env.VITE_TRANSACTIONS_ENDPOINT || '/subscriptions/admin/transactions/',
  wallets: import.meta.env.VITE_WALLETS_ENDPOINT || '/subscriptions/admin/wallets/',
}

// Helper to build full URL
export const buildUrl = (endpoint: string) => {
  return `${API_BASE_URL}${endpoint}`
}

// Use the global axios instance with interceptors
// The interceptors are already configured in src/services/interceptors.ts
export const subscriptionApiClient = axios

export default subscriptionApiClient
