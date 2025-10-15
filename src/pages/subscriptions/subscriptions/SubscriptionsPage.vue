<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { useSubscriptions } from '../../../composables/useSubscriptions'

const { subscriptions, isLoading, fetchSubscriptions } = useSubscriptions()

const filters = ref({
  status: '',
  email: '',
})

onMounted(() => {
  fetchSubscriptions()
})

const handleSearch = () => {
  fetchSubscriptions(filters.value)
}

const columns = [
  { key: 'user', label: 'User', sortable: true },
  { key: 'plan', label: 'Plan', sortable: true },
  { key: 'status', label: 'Status', sortable: true },
  { key: 'days_remaining', label: 'Days Left', sortable: true },
  { key: 'start_date', label: 'Start Date', sortable: true },
  { key: 'end_date', label: 'End Date', sortable: true },
  { key: 'auto_renew', label: 'Auto Renew', sortable: true },
  { key: 'actions', label: 'Actions', width: '150px' },
]

const getStatusColor = (status: string) => {
  const colors: Record<string, string> = {
    active: 'success',
    expired: 'danger',
    cancelled: 'warning',
    pending: 'info',
  }
  return colors[status] || 'secondary'
}

const getDaysRemainingColor = (days: number) => {
  if (days <= 0) return 'danger'
  if (days <= 7) return 'warning'
  if (days <= 30) return 'info'
  return 'success'
}
</script>

<template>
  <div class="subscriptions-page">
    <div class="page-header">
      <div>
        <h1 class="page-title">User Subscriptions</h1>
        <p class="page-subtitle">View and manage all user subscriptions</p>
      </div>
    </div>

    <!-- Filters -->
    <VaCard class="filters-card">
      <VaCardContent>
        <div class="filters-grid">
          <VaInput v-model="filters.email" label="Search by Email" placeholder="user@example.com" />
          <VaSelect v-model="filters.status" label="Status" :options="['active', 'expired', 'cancelled', 'pending']" />
          <VaButton icon="search" @click="handleSearch">Search</VaButton>
          <VaButton icon="refresh" preset="secondary" @click="fetchSubscriptions()">Reset</VaButton>
        </div>
      </VaCardContent>
    </VaCard>

    <!-- Subscriptions Table -->
    <VaCard>
      <VaCardContent>
        <VaDataTable :items="subscriptions" :columns="columns" :loading="isLoading" striped hoverable>
          <template #cell(user)="{ rowData }">
            <div v-if="rowData.user_email">
              <div class="user-email">{{ rowData.user_email }}</div>
              <div class="user-id">User ID: {{ rowData.user }}</div>
            </div>
            <span v-else class="text-muted">No user data</span>
          </template>

          <template #cell(plan)="{ rowData }">
            <div v-if="rowData.plan_details">
              <div class="plan-name">{{ rowData.plan_details.name }}</div>
              <div class="plan-price">{{ rowData.plan_details.price_details.formatted }}</div>
              <div class="plan-duration">{{ rowData.plan_details.duration_days }} days</div>
            </div>
            <span v-else class="text-muted">No plan data</span>
          </template>

          <template #cell(status)="{ rowData }">
            <div class="status-cell">
              <VaBadge :text="rowData.status" :color="getStatusColor(rowData.status)" />
              <VaChip v-if="rowData.is_trial_status" size="small" color="info" outline>Trial</VaChip>
            </div>
          </template>

          <template #cell(days_remaining)="{ rowData }">
            <VaChip :color="getDaysRemainingColor(rowData.days_remaining)" size="small">
              {{ rowData.days_remaining }} {{ rowData.days_remaining === 1 ? 'day' : 'days' }}
            </VaChip>
          </template>

          <template #cell(auto_renew)="{ rowData }">
            <VaIcon
              :name="rowData.auto_renew ? 'check_circle' : 'cancel'"
              :color="rowData.auto_renew ? 'success' : 'danger'"
            />
          </template>

          <template #cell(start_date)="{ rowData }">
            {{ new Date(rowData.start_date).toLocaleDateString() }}
          </template>

          <template #cell(end_date)="{ rowData }">
            {{ new Date(rowData.end_date).toLocaleDateString() }}
          </template>

          <template #cell(actions)>
            <div class="actions-cell">
              <VaButton preset="plain" icon="event" size="small" color="primary" title="Extend" />
              <VaButton preset="plain" icon="cancel" size="small" color="danger" title="Cancel" />
            </div>
          </template>
        </VaDataTable>
      </VaCardContent>
    </VaCard>
  </div>
</template>

<style scoped>
.subscriptions-page {
  padding: 0.5rem 0;
}

.page-header {
  margin-bottom: 2rem;
}

.page-title {
  font-size: 1.75rem;
  font-weight: 700;
  color: #1a1a1a;
  margin: 0 0 0.5rem 0;
}

.page-subtitle {
  font-size: 1rem;
  color: #6b7280;
  margin: 0;
}

.filters-card {
  margin-bottom: 1.5rem;
}

.filters-grid {
  display: grid;
  grid-template-columns: 1fr 1fr auto auto;
  gap: 1rem;
  align-items: end;
}

.status-cell {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.user-email {
  font-weight: 600;
  color: #1a1a1a;
  font-size: 0.9rem;
}

.user-id {
  font-size: 0.75rem;
  color: #9ca3af;
  margin-top: 0.125rem;
}

.plan-name {
  font-weight: 600;
  color: #1a1a1a;
  font-size: 0.9rem;
}

.plan-price {
  font-size: 0.875rem;
  color: #10b981;
  font-weight: 500;
  margin-top: 0.125rem;
}

.plan-duration {
  font-size: 0.75rem;
  color: #6b7280;
  margin-top: 0.125rem;
}

.text-muted {
  color: #9ca3af;
  font-style: italic;
  font-size: 0.875rem;
}

.actions-cell {
  display: flex;
  gap: 0.5rem;
}

@media (max-width: 768px) {
  .filters-grid {
    grid-template-columns: 1fr;
  }
}
</style>
