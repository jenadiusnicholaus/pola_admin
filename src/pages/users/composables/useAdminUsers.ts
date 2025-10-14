import { ref, computed, watch } from 'vue'
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

  const pagination = ref<AdminUserPagination>({
    page: 1,
    perPage: 10,
    total: 0,
  })

  const filters = ref<AdminUserFilters>({
    search: '',
  })

  // Fetch users with filters and pagination
  const fetchUsers = async () => {
    isLoading.value = true
    error.value = null

    try {
      const response = await adminUserService.getAllUsers({
        ...filters.value,
        page: pagination.value.page,
        page_size: pagination.value.perPage,
      })

      users.value = response.results
      pagination.value.total = response.count
    } catch (err: any) {
      error.value = err.message || 'Failed to fetch users'
      console.error('Error fetching users:', err)
    } finally {
      isLoading.value = false
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
    isLoading.value = true
    error.value = null

    try {
      const newUser = await adminUserService.createUser(data)
      await fetchUsers() // Refresh list
      return newUser
    } catch (err: any) {
      error.value = err.message || 'Failed to create user'
      return null
    } finally {
      isLoading.value = false
    }
  }

  // Update user
  const updateUser = async (id: number, data: Partial<AdminUser>): Promise<AdminUser | null> => {
    isLoading.value = true
    error.value = null

    try {
      const updatedUser = await adminUserService.updateUser(id, data)
      await fetchUsers() // Refresh list
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
      await fetchUsers() // Refresh list
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
      await fetchUsers() // Refresh list
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
      await fetchUsers() // Refresh list
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
      await fetchUsers() // Refresh list
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
      await fetchUsers() // Refresh list
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
      await fetchUsers() // Refresh list
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
      pagination.value.page = 1
      fetchUsers()
    },
    { deep: true },
  )

  // Watch pagination
  watch(
    () => [pagination.value.page, pagination.value.perPage],
    () => {
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
