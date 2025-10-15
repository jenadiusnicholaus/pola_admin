/**
 * Permission Route Guard
 *
 * Prevents users from accessing routes they don't have permissions for
 */

import { NavigationGuardNext, RouteLocationNormalized } from 'vue-router'
import { useUserStore } from '../stores/user-store'
import { createPermissionChecker } from '../utils/permissions'

export interface PermissionMeta {
  // Single required permission
  permission?: string
  // Any of these permissions (OR logic)
  permissionsAny?: string[]
  // All of these permissions (AND logic)
  permissionsAll?: string[]
  // CRUD check: { action: 'delete', model: 'document' }
  can?: { action: 'view' | 'add' | 'change' | 'delete'; model: string }
  // Custom permission check
  customPermission?: string
  // Requires superuser
  requiresSuperuser?: boolean
  // Requires staff
  requiresStaff?: boolean
}

/**
 * Permission guard for routes
 * Add to routes that require specific permissions
 */
export function permissionGuard(to: RouteLocationNormalized, from: RouteLocationNormalized, next: NavigationGuardNext) {
  const userStore = useUserStore()
  const profile = userStore.profile

  // If no profile, redirect to login
  if (!profile) {
    console.warn('No user profile found, redirecting to login')
    next({ name: 'admin-login', query: { redirect: to.fullPath } })
    return
  }

  // Get permission requirements from route meta
  const meta = to.meta as PermissionMeta

  // If no permission requirements, allow access
  if (
    !meta.permission &&
    !meta.permissionsAny &&
    !meta.permissionsAll &&
    !meta.can &&
    !meta.customPermission &&
    !meta.requiresSuperuser &&
    !meta.requiresStaff
  ) {
    next()
    return
  }

  // Create permission checker
  const permissions = createPermissionChecker(profile)

  // Check superuser requirement
  if (meta.requiresSuperuser && !permissions.superuser) {
    console.warn(`Route ${to.path} requires superuser access`)
    next({ name: 'unauthorized' })
    return
  }

  // Check staff requirement
  if (meta.requiresStaff && !permissions.staff) {
    console.warn(`Route ${to.path} requires staff access`)
    next({ name: 'unauthorized' })
    return
  }

  // Check single permission
  if (meta.permission && !permissions.hasPermission(meta.permission)) {
    console.warn(`Route ${to.path} requires permission: ${meta.permission}`)
    next({ name: 'unauthorized' })
    return
  }

  // Check any permission (OR logic)
  if (meta.permissionsAny && !permissions.hasAnyPermission(meta.permissionsAny)) {
    console.warn(`Route ${to.path} requires any of: ${meta.permissionsAny.join(', ')}`)
    next({ name: 'unauthorized' })
    return
  }

  // Check all permissions (AND logic)
  if (meta.permissionsAll && !permissions.hasAllPermissions(meta.permissionsAll)) {
    console.warn(`Route ${to.path} requires all of: ${meta.permissionsAll.join(', ')}`)
    next({ name: 'unauthorized' })
    return
  }

  // Check CRUD permission
  if (meta.can && !permissions.can(meta.can.action, meta.can.model)) {
    console.warn(`Route ${to.path} requires ${meta.can.action} permission on ${meta.can.model}`)
    next({ name: 'unauthorized' })
    return
  }

  // Check custom permission
  if (meta.customPermission && !permissions.hasCustomPermission(meta.customPermission)) {
    console.warn(`Route ${to.path} requires custom permission: ${meta.customPermission}`)
    next({ name: 'unauthorized' })
    return
  }

  // All checks passed, allow access
  next()
}

/**
 * Helper to check permissions without navigation
 * Useful for programmatic checks
 */
export function canAccessRoute(): boolean {
  const userStore = useUserStore()
  const profile = userStore.profile

  if (!profile) {
    return false
  }

  const permissions = createPermissionChecker(profile)
  return permissions.superuser // Superusers can access everything
}
