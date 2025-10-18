/**
 * Subscription Management API Configuration
 * Uses global axios instance with interceptors from interceptors.ts
 */

import axios from 'axios'

// Base URLs from environment variables
export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api/v1'

// Admin endpoints from environment variables (following API documentation)
export const ENDPOINTS = {
  plans: import.meta.env.VITE_SUBSCRIPTIONS_PLANS || '/admin/subscriptions/plans/',
  subscriptions: import.meta.env.VITE_SUBSCRIPTIONS_USERS || '/admin/subscriptions/users/',
  transactions: import.meta.env.VITE_TRANSACTIONS_ENDPOINT || '/admin/subscriptions/transactions/',
}

// Helper to build full URL
export const buildUrl = (endpoint: string) => {
  return `${API_BASE_URL}${endpoint}`
}

// Use the global axios instance with interceptors
// The interceptors are already configured in src/services/interceptors.ts
export const subscriptionApiClient = axios

export default subscriptionApiClient
