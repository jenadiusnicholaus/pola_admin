<script setup lang="ts">
import { ref, watch, computed } from 'vue'
import { adminUserService } from '../../../services/adminUserService'
import type { AdminUser, Permission, UserPermissionsResponse } from '../../../services/adminUserService'
import { useToast } from 'vuestic-ui'

const props = defineProps<{
  modelValue: boolean
  user: AdminUser | null
}>()

const emit = defineEmits<{
  (event: 'update:modelValue', value: boolean): void
  (event: 'refresh'): void
}>()

const { init: notify } = useToast()

const userPermissions = ref<UserPermissionsResponse | null>(null)
const availablePermissions = ref<Record<string, Permission[]>>({})
const selectedPermissions = ref<string[]>([])
const searchQuery = ref('')
const isLoading = ref(false)
const activeTab = ref<'current' | 'assign' | 'revoke'>('current')

// Computed properties
const directPermissionCodes = computed(() => {
  return userPermissions.value?.direct_permissions.map((p) => p.codename) || []
})

const rolePermissionCodes = computed(() => {
  return userPermissions.value?.role_permissions.map((p) => p.codename) || []
})

const allUserPermissionCodes = computed(() => {
  return [...directPermissionCodes.value, ...rolePermissionCodes.value]
})

const availablePermissionsFlat = computed(() => {
  const permissions: Permission[] = []
  Object.values(availablePermissions.value).forEach((perms) => {
    permissions.push(...perms)
  })
  return permissions
})

const permissionsToAssign = computed(() => {
  // Only show permissions not already assigned
  let filtered = availablePermissionsFlat.value.filter((p) => !allUserPermissionCodes.value.includes(p.codename))

  // Apply search filter if query exists
  if (searchQuery.value.trim()) {
    const query = searchQuery.value.toLowerCase()
    filtered = filtered.filter(
      (p) =>
        p.name.toLowerCase().includes(query) ||
        p.codename.toLowerCase().includes(query) ||
        (p.content_type && p.content_type.toLowerCase().includes(query)),
    )
  }

  return filtered
})

const permissionsToRevoke = computed(() => {
  // Only show direct permissions (role permissions can't be revoked individually)
  return userPermissions.value?.direct_permissions || []
})

// Watch for user changes
watch(
  () => props.user,
  async (newUser) => {
    if (newUser) {
      await fetchUserPermissions()
      await fetchAvailablePermissions()
      selectedPermissions.value = []
      searchQuery.value = ''
      activeTab.value = 'current'
    }
  },
  { immediate: true },
)

// Fetch user's current permissions
const fetchUserPermissions = async () => {
  if (!props.user) return

  isLoading.value = true
  try {
    userPermissions.value = await adminUserService.getUserPermissions(props.user.id)
  } catch (error: any) {
    notify({
      message: error.response?.data?.error || 'Failed to fetch user permissions',
      color: 'danger',
    })
  } finally {
    isLoading.value = false
  }
}

// Fetch all available permissions
const fetchAvailablePermissions = async () => {
  try {
    availablePermissions.value = await adminUserService.getAvailablePermissions()
  } catch (error: any) {
    notify({
      message: error.response?.data?.error || 'Failed to fetch available permissions',
      color: 'danger',
    })
  }
}

// Assign selected permissions
const handleAssignPermissions = async () => {
  if (!props.user || selectedPermissions.value.length === 0) return

  isLoading.value = true
  try {
    const response = await adminUserService.assignPermissions({
      user_id: props.user.id,
      permission_codenames: selectedPermissions.value,
    })

    notify({
      message: response.message,
      color: 'success',
    })

    selectedPermissions.value = []
    await fetchUserPermissions()
    emit('refresh')
    activeTab.value = 'current'
  } catch (error: any) {
    notify({
      message: error.response?.data?.error || 'Failed to assign permissions',
      color: 'danger',
    })
  } finally {
    isLoading.value = false
  }
}

// Revoke selected permissions
const handleRevokePermissions = async () => {
  if (!props.user || selectedPermissions.value.length === 0) return

  isLoading.value = true
  try {
    const response = await adminUserService.revokePermissions({
      user_id: props.user.id,
      permission_codenames: selectedPermissions.value,
    })

    notify({
      message: response.message,
      color: 'success',
    })

    selectedPermissions.value = []
    await fetchUserPermissions()
    emit('refresh')
    activeTab.value = 'current'
  } catch (error: any) {
    notify({
      message: error.response?.data?.error || 'Failed to revoke permissions',
      color: 'danger',
    })
  } finally {
    isLoading.value = false
  }
}

const close = () => {
  emit('update:modelValue', false)
}

const groupPermissionsByModel = (permissions: Permission[]) => {
  const grouped: Record<string, Permission[]> = {}
  permissions.forEach((perm) => {
    const key = perm.content_type || 'Other'
    if (!grouped[key]) {
      grouped[key] = []
    }
    grouped[key].push(perm)
  })
  return grouped
}
</script>

<template>
  <VaModal
    :model-value="modelValue"
    size="large"
    mobile-fullscreen
    @update:modelValue="emit('update:modelValue', $event)"
  >
    <template #header>
      <h2 class="va-h5">
        Manage Permissions - {{ user?.email }}
        <VaBadge v-if="user?.is_superuser" color="warning" text="Superuser" class="ml-2" />
      </h2>
    </template>

    <div v-if="isLoading" class="flex justify-center py-8">
      <VaProgressCircle indeterminate />
    </div>

    <div v-else>
      <!-- Tabs -->
      <VaTabs v-model="activeTab" class="mb-4">
        <template #tabs>
          <VaTab name="current"> Current Permissions ({{ userPermissions?.total_permissions || 0 }}) </VaTab>
          <VaTab name="assign">Assign Permissions</VaTab>
          <VaTab name="revoke">Revoke Permissions</VaTab>
        </template>
      </VaTabs>

      <!-- Current Permissions Tab -->
      <div v-if="activeTab === 'current'" class="permissions-content">
        <VaAlert v-if="user?.is_superuser" color="warning" class="mb-4">
          This user is a superuser and has all permissions. Individual permissions cannot be modified.
        </VaAlert>

        <!-- Role Permissions -->
        <div class="mb-6">
          <h3 class="va-h6 mb-3">
            <VaIcon name="shield" class="mr-2" />
            Role-Based Permissions
            <VaBadge :text="String(userPermissions?.role_permissions.length || 0)" class="ml-2" />
          </h3>
          <VaCard v-if="userPermissions?.role" class="mb-3" stripe stripe-color="info">
            <VaCardContent>
              <div class="text-sm"><strong>Role:</strong> {{ userPermissions.role }}</div>
            </VaCardContent>
          </VaCard>

          <div v-if="userPermissions?.role_permissions.length" class="grid grid-cols-1 md:grid-cols-2 gap-2">
            <VaChip v-for="perm in userPermissions.role_permissions" :key="perm.id" color="info" outline size="small">
              {{ perm.name }}
            </VaChip>
          </div>
          <div v-else class="text-gray-500">No role-based permissions</div>
        </div>

        <!-- Direct Permissions -->
        <div>
          <h3 class="va-h6 mb-3">
            <VaIcon name="key" class="mr-2" />
            Direct Permissions
            <VaBadge :text="String(userPermissions?.direct_permissions.length || 0)" class="ml-2" />
          </h3>
          <div v-if="userPermissions?.direct_permissions.length" class="grid grid-cols-1 md:grid-cols-2 gap-2">
            <VaChip
              v-for="perm in userPermissions.direct_permissions"
              :key="perm.id"
              color="success"
              outline
              size="small"
            >
              {{ perm.name }}
            </VaChip>
          </div>
          <div v-else class="text-gray-500">No direct permissions assigned</div>
        </div>
      </div>

      <!-- Assign Permissions Tab -->
      <div v-if="activeTab === 'assign'" class="permissions-content">
        <VaAlert v-if="user?.is_superuser" color="warning" class="mb-4">
          Cannot modify permissions for superusers.
        </VaAlert>

        <div v-else>
          <div class="mb-4">
            <p class="text-sm text-gray-600 mb-3">
              Select permissions to assign to this user. These will be added as direct permissions.
            </p>
            <VaInput
              v-model="searchQuery"
              label="Search Permissions"
              placeholder="Search by name, codename, or model..."
              clearable
            >
              <template #prependInner>
                <VaIcon name="search" size="small" />
              </template>
            </VaInput>
          </div>

          <div class="max-h-96 overflow-y-auto">
            <div v-for="(perms, model) in groupPermissionsByModel(permissionsToAssign)" :key="model" class="mb-4">
              <h4 class="text-sm font-semibold text-gray-700 mb-2">{{ model }}</h4>
              <div class="grid grid-cols-1 gap-2">
                <VaCheckbox
                  v-for="perm in perms"
                  :key="perm.codename"
                  v-model="selectedPermissions"
                  :array-value="perm.codename"
                  :label="perm.name"
                  class="mb-1"
                >
                  <template #label>
                    <span>{{ perm.name }}</span>
                    <span class="text-xs text-gray-500 ml-2">({{ perm.codename }})</span>
                  </template>
                </VaCheckbox>
              </div>
            </div>
          </div>

          <VaDivider class="my-4" />

          <div class="flex justify-between items-center">
            <div class="text-sm"><strong>Selected:</strong> {{ selectedPermissions.length }} permission(s)</div>
            <VaButton
              :disabled="selectedPermissions.length === 0 || user?.is_superuser"
              @click="handleAssignPermissions"
            >
              Assign Selected Permissions
            </VaButton>
          </div>
        </div>
      </div>

      <!-- Revoke Permissions Tab -->
      <div v-if="activeTab === 'revoke'" class="permissions-content">
        <VaAlert v-if="user?.is_superuser" color="warning" class="mb-4">
          Cannot modify permissions for superusers.
        </VaAlert>

        <div v-else>
          <div class="mb-4">
            <p class="text-sm text-gray-600 mb-3">
              Select direct permissions to revoke from this user. Role-based permissions cannot be revoked individually.
            </p>
          </div>

          <div v-if="permissionsToRevoke.length > 0" class="max-h-96 overflow-y-auto">
            <div class="grid grid-cols-1 gap-2">
              <VaCheckbox
                v-for="perm in permissionsToRevoke"
                :key="perm.codename"
                v-model="selectedPermissions"
                :array-value="perm.codename"
                :label="perm.name"
                class="mb-1"
              >
                <template #label>
                  <span>{{ perm.name }}</span>
                  <span class="text-xs text-gray-500 ml-2">({{ perm.codename }})</span>
                </template>
              </VaCheckbox>
            </div>
          </div>
          <div v-else class="text-gray-500 py-4">No direct permissions to revoke</div>

          <VaDivider class="my-4" />

          <div class="flex justify-between items-center">
            <div class="text-sm"><strong>Selected:</strong> {{ selectedPermissions.length }} permission(s)</div>
            <VaButton
              color="danger"
              :disabled="selectedPermissions.length === 0 || user?.is_superuser"
              @click="handleRevokePermissions"
            >
              Revoke Selected Permissions
            </VaButton>
          </div>
        </div>
      </div>
    </div>

    <template #footer>
      <div class="flex justify-end gap-2">
        <VaButton preset="secondary" @click="close">Close</VaButton>
      </div>
    </template>
  </VaModal>
</template>

<style scoped>
.permissions-content {
  min-height: 300px;
}
</style>
