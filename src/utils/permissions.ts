/**
 * Permission Management System
 *
 * This module provides utilities for checking user permissions dynamically
 * without hardcoding permission names throughout the application.
 */

export interface UserPermissions {
  permissions: string[]
  is_superuser?: boolean
  is_staff?: boolean
}

/**
 * Permission checker class
 */
export class PermissionChecker {
  private permissions: Set<string>
  private isSuperuser: boolean
  private isStaff: boolean

  constructor(userPermissions: UserPermissions) {
    this.permissions = new Set(userPermissions.permissions || [])
    this.isSuperuser = userPermissions.is_superuser || this.permissions.has('*superuser*')
    this.isStaff = userPermissions.is_staff || false
  }

  /**
   * Check if user has a specific permission
   */
  hasPermission(permission: string): boolean {
    // Superusers have all permissions
    if (this.isSuperuser) {
      return true
    }

    return this.permissions.has(permission)
  }

  /**
   * Check if user has any of the specified permissions
   */
  hasAnyPermission(permissions: string[]): boolean {
    if (this.isSuperuser) {
      return true
    }

    return permissions.some((perm) => this.permissions.has(perm))
  }

  /**
   * Check if user has all of the specified permissions
   */
  hasAllPermissions(permissions: string[]): boolean {
    if (this.isSuperuser) {
      return true
    }

    return permissions.every((perm) => this.permissions.has(perm))
  }

  /**
   * Check if user can perform an action on a model
   * @param action - 'view', 'add', 'change', 'delete'
   * @param model - model name (e.g., 'polauser', 'document')
   */
  can(action: 'view' | 'add' | 'change' | 'delete', model: string): boolean {
    if (this.isSuperuser) {
      return true
    }

    const permission = `${action}_${model.toLowerCase()}`
    return this.permissions.has(permission)
  }

  /**
   * Check if user can view a model
   */
  canView(model: string): boolean {
    return this.can('view', model)
  }

  /**
   * Check if user can add/create a model
   */
  canAdd(model: string): boolean {
    return this.can('add', model)
  }

  /**
   * Check if user can change/update a model
   */
  canChange(model: string): boolean {
    return this.can('change', model)
  }

  /**
   * Check if user can delete a model
   */
  canDelete(model: string): boolean {
    return this.can('delete', model)
  }

  /**
   * Check if user has custom permission (e.g., 'can_approve_documents')
   */
  hasCustomPermission(permission: string): boolean {
    if (this.isSuperuser) {
      return true
    }

    return this.permissions.has(permission)
  }

  /**
   * Check if user is superuser
   */
  get superuser(): boolean {
    return this.isSuperuser
  }

  /**
   * Check if user is staff
   */
  get staff(): boolean {
    return this.isStaff
  }

  /**
   * Get all permissions
   */
  getAllPermissions(): string[] {
    return Array.from(this.permissions)
  }

  /**
   * Check if user can manage users
   */
  canManageUsers(): boolean {
    return this.hasAnyPermission(['add_polauser', 'change_polauser', 'delete_polauser']) || this.isSuperuser
  }

  /**
   * Check if user can manage documents
   */
  canManageDocuments(): boolean {
    return this.hasAnyPermission(['add_document', 'change_document', 'delete_document']) || this.isSuperuser
  }

  /**
   * Check if user can approve documents
   */
  canApproveDocuments(): boolean {
    return this.hasCustomPermission('can_approve_documents')
  }

  /**
   * Check if user can verify others
   */
  canVerifyOthers(): boolean {
    return this.hasCustomPermission('can_verify_others')
  }

  /**
   * Check if user can manage verifications
   */
  canManageVerifications(): boolean {
    return this.hasAnyPermission(['add_verification', 'change_verification', 'delete_verification']) || this.isSuperuser
  }
}

/**
 * Helper function to create permission checker from user data
 */
export function createPermissionChecker(user: any): PermissionChecker {
  return new PermissionChecker({
    permissions: user?.permissions || [],
    is_superuser: user?.is_superuser || false,
    is_staff: user?.is_staff || false,
  })
}

/**
 * Permission constants for common models
 * These can be used for consistency but are not hardcoded in logic
 */
export const PermissionModels = {
  USER: 'polauser',
  DOCUMENT: 'document',
  VERIFICATION: 'verification',
  CONTACT: 'contact',
  ADDRESS: 'address',
} as const

/**
 * Permission actions
 */
export const PermissionActions = {
  VIEW: 'view',
  ADD: 'add',
  CHANGE: 'change',
  DELETE: 'delete',
} as const

/**
 * Custom permissions
 */
export const CustomPermissions = {
  APPROVE_DOCUMENTS: 'can_approve_documents',
  VERIFY_OTHERS: 'can_verify_others',
  SUPERUSER: '*superuser*',
} as const

export default PermissionChecker
