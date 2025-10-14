import axios from 'axios'
import router from '../router'
import { adminAuthService } from './adminAuthService'

// Request interceptor
axios.interceptors.request.use(
  function (config) {
    console.log('[Interceptor] Outgoing request to:', config.url)

    // URLs that don't need authentication token
    const tobeInoredUrl = [
      '/authentication/login/',
      '/authentication/register/',
      '/authentication/refresh/',
      '/authentication/logout/',
      '/authentication/activate-account/',
      '/authentication/resend-otp/',
      '/authentication/reactivate-account/',
      '/authentication/reset-password/',
      '/authentication/confirm-reset-password/',
      '/authentication/admin-login/',
    ]
    const isToBeIgnored = tobeInoredUrl.some((url) => config.url?.includes(url))
    console.log('[Interceptor] Should ignore auth?', isToBeIgnored)

    // Add authentication token if not ignored
    if (!isToBeIgnored) {
      // Check for token in localStorage (matching adminAuthService storage)
      const accessTokenStr = localStorage.getItem('access')
      console.log('[Interceptor] Token from localStorage:', accessTokenStr ? 'Found' : 'Not found')

      if (accessTokenStr) {
        try {
          const token = JSON.parse(accessTokenStr)
          config.headers.Authorization = `Bearer ${token}`
          console.log(
            '[Interceptor] Added Authorization header:',
            config.headers.Authorization?.substring(0, 50) + '...',
          )
        } catch (parseError) {
          console.warn('[Interceptor] Failed to parse access token:', parseError)
          // Continue without adding the token if parsing fails
        }
      } else {
        console.warn('[Interceptor] No access token found in localStorage')
      }
    }

    // URLs that need API keys
    const urlsNeedingApiKeys = [] as any[]

    // Check if current URL needs API keys
    const needsApiKeys = urlsNeedingApiKeys.some((url) => config.url?.includes(url))

    // Add API authentication headers only to specific URLs
    if (needsApiKeys) {
      config.headers['x-Api-key'] = import.meta.env.VITE_APP_API_KEY
      config.headers['x-Secret-key'] = import.meta.env.VITE_APP_SECRET_KEY
    }

    return config
  },
  function (error) {
    console.log(error)
    return Promise.reject(error)
  },
)

// Response interceptor
axios.interceptors.response.use(
  function (response) {
    // Any status code that lie within the range of 2xx cause this function to trigger
    return response
  },
  async function (error) {
    // Any status codes that falls outside the range of 2xx cause this function to trigger
    const originalRequest: any = error.config || {}
    const status = error.response?.status
    console.log('[Interceptor] Response error:', status, 'for URL:', originalRequest?.url)

    if (status === 401) {
      const url: string = originalRequest?.url || ''
      const isAuthEndpoint = url.includes('/authentication/login/') || url.includes('/authentication/refresh/')

      console.log('[Interceptor] 401 Unauthorized - isAuthEndpoint:', isAuthEndpoint, '_retry:', originalRequest._retry)

      // Try refresh once for non-auth endpoints
      if (!isAuthEndpoint && !originalRequest._retry) {
        originalRequest._retry = true
        console.log('[Interceptor] Attempting token refresh...')
        try {
          const newAccess = await adminAuthService.refreshToken()
          console.log('[Interceptor] Token refreshed successfully')
          // Set header for future requests
          axios.defaults.headers.common['Authorization'] = `Bearer ${newAccess}`
          // Also set for the retried request
          originalRequest.headers = originalRequest.headers || {}
          originalRequest.headers['Authorization'] = `Bearer ${newAccess}`
          console.log('[Interceptor] Retrying original request with new token...')
          return axios.request(originalRequest)
        } catch (refreshErr) {
          // Refresh failed: clear tokens and redirect to login
          console.error('[Interceptor] Token refresh failed:', refreshErr)
          adminAuthService.logout()
          if (router.currentRoute.value.path !== '/auth/login') {
            router.push('/auth/login')
          }
          return Promise.reject(refreshErr)
        }
      }

      // If it's an auth endpoint or already retried, redirect to login
      console.log('[Interceptor] Redirecting to login...')
      if (router.currentRoute.value.path !== '/auth/login') {
        router.push('/auth/login')
      }
    }

    return Promise.reject(error)
  },
)
