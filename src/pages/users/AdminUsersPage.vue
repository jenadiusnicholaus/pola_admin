<script setup lang="ts">
import { ref, onMounted, watchEffect } from 'vue'
import { useToast } from 'vuestic-ui'
import { useAdminUsers } from './composables/useAdminUsers'
import AdminUsersTable from './widgets/AdminUsersTable.vue'
import AdminUserFormModal from './widgets/AdminUserFormModal.vue'
import AssignRoleModal from './widgets/AssignRoleModal.vue'
import UserPermissionsModal from './widgets/UserPermissionsModal.vue'
import type { AdminUser } from '../../services/adminUserService'

const {
  users,
  stats,
  isLoading,
  error,
  pagination,
  filters,
  fetchUsers,
  refreshUsers, // Use this for manual refreshes after CRUD
  fetchStats,
  createUser,
  updateUser,
  deleteUser,
  assignRole,
  toggleActive,
  makeStaff,
  removeStaff,
} = useAdminUsers()

const { init: notify } = useToast()

// Modal states
const showUserFormModal = ref(false)
const showRoleModal = ref(false)
const showPermissionsModal = ref(false)
const selectedUser = ref<AdminUser | null>(null)
const isEditMode = ref(false)

// Initialize
onMounted(() => {
  fetchUsers()
  fetchStats()
})

// Watch for errors
watchEffect(() => {
  if (error.value) {
    notify({
      message: error.value,
      color: 'danger',
    })
  }
})

// User CRUD operations
const handleCreateUser = () => {
  selectedUser.value = null
  isEditMode.value = false
  showUserFormModal.value = true
}

const handleEditUser = (user: AdminUser) => {
  selectedUser.value = user
  isEditMode.value = true
  showUserFormModal.value = true
}

const handleSaveUser = async (userData: any) => {
  console.log('[handleSaveUser] Starting save operation...')
  console.log('[handleSaveUser] isEditMode:', isEditMode.value)
  console.log('[handleSaveUser] userData:', userData)
  console.log('[handleSaveUser] Current users count:', users.value.length)

  if (isEditMode.value && selectedUser.value) {
    // Detect if role changed
    const roleChanged = userData.user_role && userData.user_role !== selectedUser.value.user_role?.role_name

    // Separate role from other data (role must be updated via assign_role endpoint)
    const { user_role, ...otherData } = userData

    // Update user profile (without role)
    const success = await updateUser(selectedUser.value.id, otherData)

    // If role changed, assign it separately using the dedicated endpoint
    if (success && roleChanged) {
      const roleSuccess = await assignRole(selectedUser.value.id, user_role)
      if (roleSuccess) {
        notify({
          message: 'User and role updated successfully',
          color: 'success',
        })
      } else {
        notify({
          message: 'User updated but role assignment failed',
          color: 'warning',
        })
      }
    } else if (success) {
      notify({
        message: 'User updated successfully',
        color: 'success',
      })
    }

    if (success) {
      showUserFormModal.value = false
      console.log('[handleSaveUser] Refreshing users list after update...')
      await refreshUsers()
      await fetchStats()
      console.log('[handleSaveUser] After refresh, users count:', users.value.length)
    }
  } else {
    console.log('[handleSaveUser] Creating new user...')
    const newUser = await createUser(userData)
    console.log('[handleSaveUser] createUser response:', newUser)

    if (newUser) {
      notify({
        message: 'User created successfully',
        color: 'success',
      })
      showUserFormModal.value = false
      console.log('[handleSaveUser] Refreshing users list after create...')
      console.log('[handleSaveUser] Before refresh, users count:', users.value.length)
      // Clear filters when creating a new user to ensure it shows up in the list
      await refreshUsers(true)
      console.log('[handleSaveUser] After refreshUsers, users count:', users.value.length)
      await fetchStats()
      console.log('[handleSaveUser] After fetchStats, users count:', users.value.length)
    } else {
      console.error('[handleSaveUser] createUser returned null/undefined')
      console.error('[handleSaveUser] Error from store:', error.value)
      // Show error to user
      notify({
        message: error.value || 'Failed to create user. Please check the form and try again.',
        color: 'danger',
      })
    }
  }
}

const handleDeleteUser = async (user: AdminUser) => {
  const success = await deleteUser(user.id)
  if (success) {
    notify({
      message: `User ${user.first_name} ${user.last_name} deleted successfully`,
      color: 'success',
    })
    // Refresh the user list and statistics
    await refreshUsers()
    await fetchStats()
  }
}

// Role assignment
const handleAssignRole = (user: AdminUser) => {
  selectedUser.value = user
  showRoleModal.value = true
}

const handleRoleAssign = async (roleName: string) => {
  if (selectedUser.value) {
    const success = await assignRole(selectedUser.value.id, roleName)
    if (success) {
      notify({
        message: `Role assigned successfully to ${selectedUser.value.first_name} ${selectedUser.value.last_name}`,
        color: 'success',
      })
      showRoleModal.value = false
      // Refresh the user list
      await refreshUsers()
    }
  }
}

// Toggle active status
const handleToggleActive = async (user: AdminUser) => {
  const success = await toggleActive(user.id)
  if (success) {
    notify({
      message: `User ${user.is_active ? 'deactivated' : 'activated'} successfully`,
      color: 'success',
    })
    // Refresh the user list and statistics
    await refreshUsers()
    await fetchStats()
  }
}

// Staff management
const handleMakeStaff = async (user: AdminUser) => {
  const success = await makeStaff(user.id)
  if (success) {
    notify({
      message: `${user.first_name} ${user.last_name} is now a staff member`,
      color: 'success',
    })
    // Refresh the user list and statistics
    await refreshUsers()
    await fetchStats()
  }
}

const handleRemoveStaff = async (user: AdminUser) => {
  const success = await removeStaff(user.id)
  if (success) {
    notify({
      message: `Staff privileges removed from ${user.first_name} ${user.last_name}`,
      color: 'success',
    })
    // Refresh the user list and statistics
    await refreshUsers()
    await fetchStats()
  }
}
// Permission management
const handleManagePermissions = (user: AdminUser) => {
  selectedUser.value = user
  showPermissionsModal.value = true
}

const handlePermissionsRefresh = () => {
  refreshUsers()
}

// Filter options
const roleFilterOptions = [
  { value: '', text: 'All Roles' },
  { value: 'citizen', text: 'Citizen' },
  { value: 'law_student', text: 'Law Student' },
  { value: 'paralegal', text: 'Paralegal' },
  { value: 'lawyer', text: 'Lawyer' },
  { value: 'advocate', text: 'Advocate' },
  { value: 'law_firm', text: 'Law Firm' },
]

const statusFilterOptions = [
  { value: undefined, text: 'All Status' },
  { value: true, text: 'Active' },
  { value: false, text: 'Inactive' },
]

const verifiedFilterOptions = [
  { value: undefined, text: 'All Verification' },
  { value: true, text: 'Verified' },
  { value: false, text: 'Unverified' },
]

const staffFilterOptions = [
  { value: undefined, text: 'All Users' },
  { value: true, text: 'Staff Only' },
  { value: false, text: 'Non-Staff' },
]
</script>

<template>
  <div class="flex flex-col gap-4">
    <!-- Statistics Cards -->
    <div v-if="stats" class="grid grid-cols-1 md:grid-cols-4 gap-4">
      <VaCard>
        <VaCardContent>
          <div class="flex flex-col">
            <span class="text-secondary text-sm">Total Users</span>
            <span class="text-2xl font-bold">{{ stats.total_users }}</span>
          </div>
        </VaCardContent>
      </VaCard>

      <VaCard>
        <VaCardContent>
          <div class="flex flex-col">
            <span class="text-secondary text-sm">Active Users</span>
            <span class="text-2xl font-bold text-success">{{ stats.active_users }}</span>
          </div>
        </VaCardContent>
      </VaCard>

      <VaCard>
        <VaCardContent>
          <div class="flex flex-col">
            <span class="text-secondary text-sm">Verified Users</span>
            <span class="text-2xl font-bold text-info">{{ stats.verified_users }}</span>
          </div>
        </VaCardContent>
      </VaCard>

      <VaCard>
        <VaCardContent>
          <div class="flex flex-col">
            <span class="text-secondary text-sm">Staff Members</span>
            <span class="text-2xl font-bold text-warning">{{ stats.staff_users }}</span>
          </div>
        </VaCardContent>
      </VaCard>
    </div>

    <!-- Main Users Table Card -->
    <VaCard>
      <VaCardTitle>
        <h1 class="card-title">User Management</h1>
      </VaCardTitle>

      <VaCardContent>
        <!-- Filters and Actions -->
        <div class="flex flex-col gap-4 mb-4">
          <div class="grid grid-cols-1 md:grid-cols-5 gap-4">
            <VaInput v-model="filters.search" placeholder="Search users..." clearable>
              <template #prependInner>
                <VaIcon name="search" color="secondary" size="small" />
              </template>
            </VaInput>

            <VaSelect
              v-model="filters.role"
              :options="roleFilterOptions"
              text-by="text"
              value-by="value"
              placeholder="Filter by role"
            />

            <VaSelect
              v-model="filters.is_active"
              :options="statusFilterOptions"
              text-by="text"
              value-by="value"
              placeholder="Filter by status"
            />

            <VaSelect
              v-model="filters.is_verified"
              :options="verifiedFilterOptions"
              text-by="text"
              value-by="value"
              placeholder="Filter by verification"
            />

            <VaSelect
              v-model="filters.is_staff"
              :options="staffFilterOptions"
              text-by="text"
              value-by="value"
              placeholder="Filter by staff"
            />
          </div>

          <div class="flex justify-between items-center">
            <VaButton preset="secondary" icon="refresh" @click="fetchUsers">Refresh</VaButton>
            <VaButton icon="add" @click="handleCreateUser">Create New User</VaButton>
          </div>
        </div>

        <!-- Users Table -->
        <AdminUsersTable
          v-model:pagination="pagination"
          :users="users"
          :loading="isLoading"
          @editUser="handleEditUser"
          @deleteUser="handleDeleteUser"
          @toggleActive="handleToggleActive"
          @assignRole="handleAssignRole"
          @makeStaff="handleMakeStaff"
          @removeStaff="handleRemoveStaff"
          @managePermissions="handleManagePermissions"
        />
      </VaCardContent>
    </VaCard>

    <!-- Modals -->
    <AdminUserFormModal v-model="showUserFormModal" :user="selectedUser" :is-edit="isEditMode" @save="handleSaveUser" />

    <AssignRoleModal v-model="showRoleModal" :user="selectedUser" @assign="handleRoleAssign" />

    <UserPermissionsModal v-model="showPermissionsModal" :user="selectedUser" @refresh="handlePermissionsRefresh" />
  </div>
</template>
