/**
 * Vue Directive for Permission-Based Rendering
 *
 * Usage in templates:
 * <button v-permission="'add_document'">Create Document</button>
 * <div v-permission:any="['add_user', 'change_user']">Manage Users</div>
 * <div v-permission:all="['view_document', 'change_document']">Edit Document</div>
 * <div v-permission:can="{ action: 'delete', model: 'document' }">Delete</div>
 */

import type { Directive, DirectiveBinding } from 'vue'
import { useUserStore } from '../stores/user-store'
import { createPermissionChecker } from '../utils/permissions'

interface PermissionValue {
  action: 'view' | 'add' | 'change' | 'delete'
  model: string
}

export const vPermission: Directive = {
  mounted(el: HTMLElement, binding: DirectiveBinding) {
    checkPermission(el, binding)
  },
  updated(el: HTMLElement, binding: DirectiveBinding) {
    checkPermission(el, binding)
  },
}

function checkPermission(el: HTMLElement, binding: DirectiveBinding) {
  const userStore = useUserStore()
  const profile = userStore.profile

  if (!profile) {
    // Hide element if no user profile
    el.style.display = 'none'
    return
  }

  const checker = createPermissionChecker(profile)
  let hasPermission = false

  // Handle different modifiers
  if (binding.arg === 'any') {
    // v-permission:any="['perm1', 'perm2']"
    const permissions = Array.isArray(binding.value) ? binding.value : [binding.value]
    hasPermission = checker.hasAnyPermission(permissions)
  } else if (binding.arg === 'all') {
    // v-permission:all="['perm1', 'perm2']"
    const permissions = Array.isArray(binding.value) ? binding.value : [binding.value]
    hasPermission = checker.hasAllPermissions(permissions)
  } else if (binding.arg === 'can') {
    // v-permission:can="{ action: 'delete', model: 'document' }"
    const value = binding.value as PermissionValue
    hasPermission = checker.can(value.action, value.model)
  } else {
    // v-permission="'permission_name'"
    hasPermission = checker.hasPermission(binding.value)
  }

  // Show/hide element based on permission
  if (hasPermission) {
    el.style.display = ''
    if (binding.modifiers.disabled) {
      el.removeAttribute('disabled')
    }
  } else {
    if (binding.modifiers.hide) {
      el.style.display = 'none'
    } else if (binding.modifiers.disabled) {
      el.setAttribute('disabled', 'true')
    } else {
      // Default: hide element
      el.style.display = 'none'
    }
  }
}

export default vPermission
