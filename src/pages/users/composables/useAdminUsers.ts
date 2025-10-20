import { ref, computed, watch, nextTick } from 'vue'
import { adminUserService, type AdminUser, type AdminUserStats } from '../../../services/adminUserService'

export interface AdminUserFilters {
  role?: string
  is_active?: boolean
  is_verified?: boolean
  is_staff?: boolean
  search?: string
}

export interface AdminUserPagination {
  page: number
  perPage: number
  total: number
}

export function useAdminUsers() {
  const users = ref<AdminUser[]>([])
  const stats = ref<AdminUserStats | null>(null)
  const isLoading = ref(false)
  const error = ref<string | null>(null)
  const skipWatch = ref(false) // Flag to skip watcher during manual refresh

  const pagination = ref<AdminUserPagination>({
    page: 1,
    perPage: 10,
    total: 0,
  })

  const filters = ref<AdminUserFilters>({
    search: '',
    role: undefined,
    is_active: undefined,
    is_verified: undefined,
    is_staff: undefined,
  })

  // Fetch users with filters and pagination
  const fetchUsers = async () => {
    console.log('[fetchUsers] Starting fetch...')
    console.log('[fetchUsers] Current filters:', JSON.stringify(filters.value))
    console.log('[fetchUsers] Current pagination:', JSON.stringify(pagination.value))
    isLoading.value = true
    error.value = null

    try {
      // Clean filters - remove empty strings, undefined values, and whitespace-only strings
      const cleanFilters: any = {}
      Object.entries(filters.value).forEach(([key, value]) => {
        // Trim strings and check if they're empty
        if (typeof value === 'string') {
          const trimmedValue = value.trim()
          if (trimmedValue !== '') {
            cleanFilters[key] = trimmedValue
            console.log(`[fetchUsers] Including filter: ${key} = "${trimmedValue}"`)
          } else {
            console.log(`[fetchUsers] Skipping empty string filter: ${key}`)
          }
        } else if (value !== null && value !== undefined) {
          // Include boolean and other non-null, non-undefined values
          cleanFilters[key] = value
          console.log(`[fetchUsers] Including filter: ${key} = ${value}`)
        } else {
          console.log(`[fetchUsers] Skipping null/undefined filter: ${key}`)
        }
      })

      const requestParams = {
        ...cleanFilters,
        page: pagination.value.page,
        page_size: pagination.value.perPage,
      }
      console.log('[fetchUsers] Request params (after cleaning):', JSON.stringify(requestParams))

      const response = await adminUserService.getAllUsers(requestParams)

      console.log('[fetchUsers] ===== API RESPONSE =====')
      console.log('[fetchUsers] Full response:', JSON.stringify(response))
      console.log('[fetchUsers] Results count:', response.results?.length || 0)
      console.log('[fetchUsers] Total count:', response.count)
      console.log('[fetchUsers] Next page:', response.next)
      console.log('[fetchUsers] Previous page:', response.previous)

      if (!response.results || !Array.isArray(response.results)) {
        console.error('[fetchUsers] ERROR: response.results is not an array!', response.results)
        users.value = []
        return
      }

      users.value = response.results
      pagination.value.total = response.count

      console.log('[fetchUsers] users.value successfully updated to:', users.value.length, 'items')
    } catch (err: any) {
      error.value = err.message || 'Failed to fetch users'
      console.error('[fetchUsers] Error fetching users:', err)
      console.error('[fetchUsers] Error stack:', err.stack)
    } finally {
      isLoading.value = false
      console.log('[fetchUsers] Fetch complete, users.value.length =', users.value.length)
    }
  }

  // Manual refresh without triggering watchers
  const refreshUsers = async (clearFilters = false) => {
    console.log('[refreshUsers] Manual refresh triggered, clearFilters:', clearFilters)
    console.log('[refreshUsers] Current users count before:', users.value.length)

    if (clearFilters) {
      console.log('[refreshUsers] Clearing all filters')
      filters.value = {
        search: '',
        role: undefined,
        is_active: undefined,
        is_verified: undefined,
        is_staff: undefined,
      }
      pagination.value.page = 1
    }

    skipWatch.value = true
    try {
      await fetchUsers()
      // Wait for Vue to finish all DOM updates and reactive updates
      await nextTick()
      console.log('[refreshUsers] After fetchUsers, users count:', users.value.length)
    } finally {
      // Use nextTick again before re-enabling watchers to be extra safe
      await nextTick()
      skipWatch.value = false
      console.log('[refreshUsers] Re-enabled watchers, final users count:', users.value.length)
    }
  }

  // Fetch user statistics
  const fetchStats = async () => {
    try {
      stats.value = await adminUserService.getUserStats()
    } catch (err: any) {
      console.error('Error fetching stats:', err)
    }
  }

  // Get user by ID
  const getUserById = async (id: number): Promise<AdminUser | null> => {
    try {
      return await adminUserService.getUserById(id)
    } catch (err: any) {
      error.value = err.message || 'Failed to fetch user'
      return null
    }
  }

  // Create user
  const createUser = async (data: {
    email: string
    password: string
    first_name: string
    last_name: string
    user_role?: string
    date_of_birth?: string
  }): Promise<AdminUser | null> => {
    console.log('[createUser] Starting user creation...')
    console.log('[createUser] Data to send:', JSON.stringify(data))
    isLoading.value = true
    error.value = null

    try {
      const newUser = await adminUserService.createUser(data)
      console.log('[createUser] User created successfully:', newUser)
      // Don't call fetchUsers here - let the parent component handle refresh
      // to avoid multiple simultaneous requests
      return newUser
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || err.message || 'Failed to create user'
      const errorDetails = err.response?.data || err
      error.value = errorMessage

      console.error('[createUser] ===== ERROR CREATING USER =====')
      console.error('[createUser] Error message:', errorMessage)
      console.error('[createUser] Error details:', errorDetails)
      console.error('[createUser] Full error object:', err)
      console.error('[createUser] Response status:', err.response?.status)
      console.error('[createUser] Response data:', JSON.stringify(err.response?.data))

      return null
    } finally {
      isLoading.value = false
      console.log('[createUser] Create operation complete')
    }
  }

  // Update user
  const updateUser = async (id: number, data: Partial<AdminUser>): Promise<AdminUser | null> => {
    isLoading.value = true
    error.value = null

    try {
      const updatedUser = await adminUserService.updateUser(id, data)
      // Don't call fetchUsers here - let the parent component handle refresh
      return updatedUser
    } catch (err: any) {
      error.value = err.message || 'Failed to update user'
      return null
    } finally {
      isLoading.value = false
    }
  }

  // Partial update user
  const partialUpdateUser = async (id: number, data: Partial<AdminUser>): Promise<AdminUser | null> => {
    isLoading.value = true
    error.value = null

    try {
      const updatedUser = await adminUserService.partialUpdateUser(id, data)
      // Don't call fetchUsers here - let the parent component handle refresh
      return updatedUser
    } catch (err: any) {
      error.value = err.message || 'Failed to update user'
      return null
    } finally {
      isLoading.value = false
    }
  }

  // Delete user
  const deleteUser = async (id: number): Promise<boolean> => {
    isLoading.value = true
    error.value = null

    try {
      await adminUserService.deleteUser(id)
      // Don't call fetchUsers here - let the parent component handle refresh
      return true
    } catch (err: any) {
      error.value = err.message || 'Failed to delete user'
      return false
    } finally {
      isLoading.value = false
    }
  }

  // Assign role to user
  const assignRole = async (userId: number, roleName: string): Promise<boolean> => {
    isLoading.value = true
    error.value = null

    try {
      await adminUserService.assignRole(userId, roleName)
      // Don't call fetchUsers here - let the parent component handle refresh
      return true
    } catch (err: any) {
      error.value = err.message || 'Failed to assign role'
      return false
    } finally {
      isLoading.value = false
    }
  }

  // Toggle user active status
  const toggleActive = async (userId: number): Promise<boolean> => {
    isLoading.value = true
    error.value = null

    try {
      await adminUserService.toggleActive(userId)
      // Don't call fetchUsers here - let the parent component handle refresh
      return true
    } catch (err: any) {
      error.value = err.message || 'Failed to toggle active status'
      return false
    } finally {
      isLoading.value = false
    }
  }

  // Make user staff
  const makeStaff = async (userId: number): Promise<boolean> => {
    isLoading.value = true
    error.value = null

    try {
      await adminUserService.makeStaff(userId)
      // Don't call fetchUsers here - let the parent component handle refresh
      return true
    } catch (err: any) {
      error.value = err.message || 'Failed to make user staff'
      return false
    } finally {
      isLoading.value = false
    }
  }

  // Remove staff status
  const removeStaff = async (userId: number): Promise<boolean> => {
    isLoading.value = true
    error.value = null

    try {
      await adminUserService.removeStaff(userId)
      // Don't call fetchUsers here - let the parent component handle refresh
      return true
    } catch (err: any) {
      error.value = err.message || 'Failed to remove staff status'
      return false
    } finally {
      isLoading.value = false
    }
  }

  // Get user permissions
  const getUserPermissions = async (userId: number) => {
    try {
      return await adminUserService.getUserPermissions(userId)
    } catch (err: any) {
      error.value = err.message || 'Failed to fetch user permissions'
      return null
    }
  }

  // Assign permissions to user
  const assignPermissions = async (userId: number, permissionCodenames: string[]): Promise<boolean> => {
    try {
      await adminUserService.assignPermissions({ user_id: userId, permission_codenames: permissionCodenames })
      return true
    } catch (err: any) {
      error.value = err.message || 'Failed to assign permissions'
      return false
    }
  }

  // Revoke permissions from user
  const revokePermissions = async (userId: number, permissionCodenames: string[]): Promise<boolean> => {
    try {
      await adminUserService.revokePermissions({ user_id: userId, permission_codenames: permissionCodenames })
      return true
    } catch (err: any) {
      error.value = err.message || 'Failed to revoke permissions'
      return false
    }
  }

  // Watch filters and reset pagination
  watch(
    () => filters.value,
    () => {
      if (skipWatch.value) {
        console.log('[Watcher] Skipping filter watcher')
        return
      }
      console.log('[Watcher] Filter changed, resetting pagination and fetching users')
      pagination.value.page = 1
      fetchUsers()
    },
    { deep: true },
  )

  // Watch pagination
  watch(
    () => [pagination.value.page, pagination.value.perPage],
    () => {
      if (skipWatch.value) {
        console.log('[Watcher] Skipping pagination watcher')
        return
      }
      console.log('[Watcher] Pagination changed, fetching users')
      fetchUsers()
    },
  )

  // Computed properties
  const totalPages = computed(() => Math.ceil(pagination.value.total / pagination.value.perPage))

  return {
    users,
    stats,
    isLoading,
    error,
    pagination,
    filters,
    totalPages,
    fetchUsers,
    refreshUsers, // Use this for manual refreshes after CRUD operations
    fetchStats,
    getUserById,
    createUser,
    updateUser,
    partialUpdateUser,
    deleteUser,
    assignRole,
    toggleActive,
    makeStaff,
    removeStaff,
    getUserPermissions,
    assignPermissions,
    revokePermissions,
  }
}
