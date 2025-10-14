import { RouteLocationNormalized, NavigationGuardNext } from 'vue-router'
import { adminAuthService } from '../services/adminAuthService'

export const adminAuthGuard = async (
  to: RouteLocationNormalized,
  from: RouteLocationNormalized,
  next: NavigationGuardNext,
) => {
  // Check if the route requires admin authentication
  const adminRoutes = [
    '/admin-verification/dashboard',
    '/admin-verification/verifications',
    '/admin-verification/documents',
    '/admin-verification/verifications/',
  ]

  const isAdminRoute = adminRoutes.some((route) => to.path.startsWith(route) || to.path === route)

  if (isAdminRoute) {
    // Check if admin is authenticated
    const isAuthenticated = adminAuthService.isAuthenticated()

    if (!isAuthenticated) {
      // Redirect to admin login
      next('/auth/admin-login')
      return
    }

    // Token exists, allow navigation
    // The interceptor will handle token refresh automatically if needed
    next()
  } else {
    next()
  }
}

export const userAuthGuard = async (
  to: RouteLocationNormalized,
  from: RouteLocationNormalized,
  next: NavigationGuardNext,
) => {
  // Check if the route requires user authentication
  const protectedRoutes = ['/dashboard', '/users', '/projects', '/payments', '/settings', '/preferences', '/faq']

  const isProtectedRoute = protectedRoutes.some((route) => to.path.startsWith(route) || to.path === route)

  if (isProtectedRoute) {
    // Check if user is authenticated (regular user, not admin)
    const userToken = localStorage.getItem('access')

    if (!userToken) {
      // Redirect to user login
      next('/auth/login')
      return
    }

    // If user is authenticated, proceed
    next()
  } else {
    next()
  }
}
