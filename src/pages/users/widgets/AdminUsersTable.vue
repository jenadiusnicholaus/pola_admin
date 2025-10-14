<script setup lang="ts">
import { defineVaDataTableColumns, useModal } from 'vuestic-ui'
import { computed, PropType } from 'vue'
import { useVModel } from '@vueuse/core'
import type { AdminUser } from '../../../services/adminUserService'
import type { AdminUserPagination } from '../composables/useAdminUsers'

const columns = defineVaDataTableColumns([
  { label: 'ID', key: 'id', sortable: true },
  { label: 'Email', key: 'email', sortable: true },
  { label: 'Name', key: 'name', sortable: true },
  { label: 'Role', key: 'user_role', sortable: true },
  { label: 'Status', key: 'status', sortable: false },
  { label: 'Permissions', key: 'permissions', sortable: false },
  { label: 'Joined', key: 'date_joined', sortable: true },
  { label: 'Actions', key: 'actions', align: 'right' },
])

const props = defineProps({
  users: {
    type: Array as PropType<AdminUser[]>,
    required: true,
  },
  loading: {
    type: Boolean,
    default: false,
  },
  pagination: {
    type: Object as PropType<AdminUserPagination>,
    required: true,
  },
})

const emit = defineEmits<{
  (event: 'edit-user', user: AdminUser): void
  (event: 'delete-user', user: AdminUser): void
  (event: 'toggle-active', user: AdminUser): void
  (event: 'assign-role', user: AdminUser): void
  (event: 'make-staff', user: AdminUser): void
  (event: 'remove-staff', user: AdminUser): void
  (event: 'manage-permissions', user: AdminUser): void
  (event: 'update:pagination', value: AdminUserPagination): void
}>()

const { confirm } = useModal()

const paginationVModel = useVModel(props, 'pagination', emit)

const totalPages = computed(() => Math.ceil(props.pagination.total / props.pagination.perPage))

const formatDate = (dateString: string) => {
  const date = new Date(dateString)
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  })
}

const getStatusColor = (user: AdminUser) => {
  if (!user.is_active) return 'danger'
  if (!user.is_verified) return 'warning'
  return 'success'
}

const getStatusText = (user: AdminUser) => {
  if (!user.is_active) return 'Inactive'
  if (!user.is_verified) return 'Unverified'
  return 'Active'
}

const getRoleBadgeColor = (user: AdminUser) => {
  if (user.is_superuser) return 'danger'
  if (user.is_staff) return 'warning'
  return 'primary'
}

const getRoleDisplay = (user: AdminUser) => {
  if (user.is_superuser) return 'Superuser'
  if (user.is_staff) return 'Staff'
  return user.user_role?.get_role_display || 'No Role'
}

const onDeleteUser = async (user: AdminUser) => {
  const agreed = await confirm({
    title: 'Delete User',
    message: `Are you sure you want to delete ${user.first_name} ${user.last_name}? This action cannot be undone.`,
    okText: 'Delete',
    cancelText: 'Cancel',
    size: 'small',
    maxWidth: '380px',
  })

  if (agreed) {
    emit('delete-user', user)
  }
}

const onToggleActive = async (user: AdminUser) => {
  const action = user.is_active ? 'deactivate' : 'activate'
  const agreed = await confirm({
    title: `${action.charAt(0).toUpperCase() + action.slice(1)} User`,
    message: `Are you sure you want to ${action} ${user.first_name} ${user.last_name}?`,
    okText: action.charAt(0).toUpperCase() + action.slice(1),
    cancelText: 'Cancel',
    size: 'small',
    maxWidth: '380px',
  })

  if (agreed) {
    emit('toggle-active', user)
  }
}

const onMakeStaff = async (user: AdminUser) => {
  const agreed = await confirm({
    title: 'Make Staff',
    message: `Grant staff privileges to ${user.first_name} ${user.last_name}?`,
    okText: 'Confirm',
    cancelText: 'Cancel',
    size: 'small',
    maxWidth: '380px',
  })

  if (agreed) {
    emit('make-staff', user)
  }
}

const onRemoveStaff = async (user: AdminUser) => {
  const agreed = await confirm({
    title: 'Remove Staff',
    message: `Remove staff privileges from ${user.first_name} ${user.last_name}?`,
    okText: 'Confirm',
    cancelText: 'Cancel',
    size: 'small',
    maxWidth: '380px',
  })

  if (agreed) {
    emit('remove-staff', user)
  }
}
</script>

<template>
  <div>
    <VaDataTable :columns="columns" :items="users" :loading="loading" striped hoverable>
      <template #cell(name)="{ rowData }">
        <div class="flex flex-col">
          <span class="font-semibold">{{ rowData.first_name }} {{ rowData.last_name }}</span>
          <span class="text-xs text-secondary">{{ rowData.email }}</span>
        </div>
      </template>

      <template #cell(user_role)="{ rowData }">
        <VaBadge :text="getRoleDisplay(rowData)" :color="getRoleBadgeColor(rowData)" />
      </template>

      <template #cell(status)="{ rowData }">
        <div class="flex flex-col gap-1">
          <VaBadge :text="getStatusText(rowData)" :color="getStatusColor(rowData)" size="small" />
          <VaBadge v-if="rowData.is_verified" text="Verified" color="success" size="small" />
        </div>
      </template>

      <template #cell(permissions)="{ rowData }">
        <div class="flex items-center gap-2">
          <VaChip size="small" color="info"> {{ rowData.permissions.length }} permissions </VaChip>
          <VaButton
            preset="plain"
            size="small"
            icon="mso-manage_accounts"
            @click="$emit('manage-permissions', rowData)"
          />
        </div>
      </template>

      <template #cell(date_joined)="{ rowData }">
        <span class="text-sm">{{ formatDate(rowData.date_joined) }}</span>
      </template>

      <template #cell(actions)="{ rowData }">
        <div class="flex gap-1 justify-end">
          <VaButton
            preset="plain"
            size="small"
            icon="mso-edit"
            aria-label="Edit user"
            color="primary"
            @click="$emit('edit-user', rowData)"
          />

          <VaButton
            preset="plain"
            size="small"
            :icon="rowData.is_active ? 'mso-block' : 'mso-check_circle'"
            :aria-label="rowData.is_active ? 'Deactivate user' : 'Activate user'"
            :color="rowData.is_active ? 'warning' : 'success'"
            @click="onToggleActive(rowData)"
          />

          <VaButton
            preset="plain"
            size="small"
            icon="mso-assignment_ind"
            aria-label="Assign role"
            color="info"
            @click="$emit('assign-role', rowData)"
          />

          <VaButton
            v-if="!rowData.is_superuser && !rowData.is_staff"
            preset="plain"
            size="small"
            icon="mso-admin_panel_settings"
            aria-label="Make staff"
            color="warning"
            @click="onMakeStaff(rowData)"
          />

          <VaButton
            v-if="!rowData.is_superuser && rowData.is_staff"
            preset="plain"
            size="small"
            icon="mso-remove_moderator"
            aria-label="Remove staff"
            color="warning"
            @click="onRemoveStaff(rowData)"
          />

          <VaButton
            v-if="!rowData.is_superuser"
            preset="plain"
            size="small"
            icon="mso-delete"
            aria-label="Delete user"
            color="danger"
            @click="onDeleteUser(rowData)"
          />
        </div>
      </template>
    </VaDataTable>

    <!-- Pagination -->
    <div class="flex flex-col-reverse md:flex-row gap-2 justify-between items-center py-2 mt-4">
      <div class="flex items-center gap-2">
        <b>{{ pagination.total }} results.</b>
        <span>Results per page</span>
        <VaSelect v-model="paginationVModel.perPage" class="!w-20" :options="[10, 25, 50, 100]" />
      </div>

      <div v-if="totalPages > 1" class="flex gap-2">
        <VaButton
          preset="secondary"
          icon="va-arrow-left"
          aria-label="Previous page"
          :disabled="pagination.page === 1"
          @click="paginationVModel.page--"
        />
        <VaPagination
          v-model="paginationVModel.page"
          buttons-preset="secondary"
          :pages="totalPages"
          :visible-pages="5"
          :boundary-links="false"
          :direction-links="false"
        />
        <VaButton
          preset="secondary"
          icon="va-arrow-right"
          aria-label="Next page"
          :disabled="pagination.page === totalPages"
          @click="paginationVModel.page++"
        />
      </div>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.va-data-table {
  ::v-deep(.va-data-table__table-tr) {
    border-bottom: 1px solid var(--va-background-border);
  }
}
</style>
