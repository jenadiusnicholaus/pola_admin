/**
 * Vue Composable for Permission Checking
 *
 * This composable provides reactive permission checking throughout the application
 */

import { computed } from 'vue'
import { storeToRefs } from 'pinia'
import { useUserStore } from '../stores/user-store'
import { createPermissionChecker } from '../utils/permissions'

export function usePermissions() {
  const userStore = useUserStore()
  const { profile } = storeToRefs(userStore)

  // Create reactive permission checker
  const permissions = computed(() => {
    if (!profile.value) {
      return null
    }
    return createPermissionChecker(profile.value)
  })

  // Helper methods
  const hasPermission = (permission: string): boolean => {
    return permissions.value?.hasPermission(permission) || false
  }

  const hasAnyPermission = (perms: string[]): boolean => {
    return permissions.value?.hasAnyPermission(perms) || false
  }

  const hasAllPermissions = (perms: string[]): boolean => {
    return permissions.value?.hasAllPermissions(perms) || false
  }

  const can = (action: 'view' | 'add' | 'change' | 'delete', model: string): boolean => {
    return permissions.value?.can(action, model) || false
  }

  const canView = (model: string): boolean => {
    return permissions.value?.canView(model) || false
  }

  const canAdd = (model: string): boolean => {
    return permissions.value?.canAdd(model) || false
  }

  const canChange = (model: string): boolean => {
    return permissions.value?.canChange(model) || false
  }

  const canDelete = (model: string): boolean => {
    return permissions.value?.canDelete(model) || false
  }

  const hasCustomPermission = (permission: string): boolean => {
    return permissions.value?.hasCustomPermission(permission) || false
  }

  const isSuperuser = computed(() => permissions.value?.superuser || false)
  const isStaff = computed(() => permissions.value?.staff || false)

  // Convenience methods
  const canManageUsers = computed(() => permissions.value?.canManageUsers() || false)
  const canManageDocuments = computed(() => permissions.value?.canManageDocuments() || false)
  const canApproveDocuments = computed(() => permissions.value?.canApproveDocuments() || false)
  const canVerifyOthers = computed(() => permissions.value?.canVerifyOthers() || false)
  const canManageVerifications = computed(() => permissions.value?.canManageVerifications() || false)

  return {
    // Permission checker instance
    permissions,

    // Permission checking methods
    hasPermission,
    hasAnyPermission,
    hasAllPermissions,
    can,
    canView,
    canAdd,
    canChange,
    canDelete,
    hasCustomPermission,

    // User status
    isSuperuser,
    isStaff,

    // Convenience computed properties
    canManageUsers,
    canManageDocuments,
    canApproveDocuments,
    canVerifyOthers,
    canManageVerifications,
  }
}
