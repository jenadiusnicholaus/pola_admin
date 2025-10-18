<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { useConsultations } from '../../composables'

const { consultants, isLoading, fetchConsultants, toggleConsultantAvailability } = useConsultations()

const filters = ref({
  email: '',
  is_available: undefined as boolean | undefined,
})

onMounted(() => {
  fetchConsultants()
})

const handleSearch = () => {
  fetchConsultants(filters.value)
}

const handleToggleAvailability = async (id: number) => {
  await toggleConsultantAvailability(id)
  await fetchConsultants()
}

const columns = [
  { key: 'user_name', label: 'Consultant', sortable: true },
  { key: 'specialization', label: 'Specialization', sortable: true },
  { key: 'years_of_experience', label: 'Experience', sortable: true },
  { key: 'total_bookings', label: 'Bookings', sortable: true },
  { key: 'total_earnings', label: 'Earnings', sortable: true },
  { key: 'is_available', label: 'Status', sortable: true },
  { key: 'actions', label: 'Actions', width: '150px' },
]

const formatCurrency = (amount: string) => {
  return `TSh ${parseFloat(amount).toLocaleString()}`
}
</script>

<template>
  <div class="consultants-page">
    <div class="page-header">
      <div>
        <h1 class="page-title">Consultants</h1>
        <p class="page-subtitle">Manage consultant profiles and availability</p>
      </div>
    </div>

    <VaCard>
      <VaCardContent>
        <div class="filters">
          <VaInput v-model="filters.email" placeholder="Search by email" clearable>
            <template #prependInner>
              <VaIcon name="search" />
            </template>
          </VaInput>

          <VaSelect
            v-model="filters.is_available"
            placeholder="All Statuses"
            :options="[
              { text: 'All', value: undefined },
              { text: 'Available', value: true },
              { text: 'Unavailable', value: false },
            ]"
            clearable
          />

          <VaButton @click="handleSearch">Search</VaButton>
          <VaButton preset="secondary" @click="filters = { email: '', is_available: undefined }">Clear</VaButton>
        </div>
      </VaCardContent>
    </VaCard>

    <VaCard>
      <VaCardContent>
        <VaDataTable :items="consultants" :columns="columns" :loading="isLoading" striped hoverable>
          <template #cell(user_name)="{ rowData }">
            <div class="consultant-cell">
              <VaIcon name="account_circle" size="large" />
              <div>
                <div class="consultant-name">{{ rowData.user_name }}</div>
                <div class="consultant-email">{{ rowData.user_email }}</div>
              </div>
            </div>
          </template>

          <template #cell(years_of_experience)="{ rowData }">
            <VaBadge :text="`${rowData.years_of_experience} years`" color="info" />
          </template>

          <template #cell(total_bookings)="{ rowData }">
            <div class="stat-cell">
              <VaIcon name="event" size="small" />
              <strong>{{ rowData.total_bookings }}</strong>
            </div>
          </template>

          <template #cell(total_earnings)="{ rowData }">
            <strong class="earnings-text">{{ formatCurrency(rowData.total_earnings) }}</strong>
          </template>

          <template #cell(is_available)="{ rowData }">
            <VaBadge
              :text="rowData.is_available ? 'Available' : 'Unavailable'"
              :color="rowData.is_available ? 'success' : 'danger'"
            />
          </template>

          <template #cell(actions)="{ rowData }">
            <div class="actions-cell">
              <VaButton
                preset="plain"
                :icon="rowData.is_available ? 'pause' : 'play_arrow'"
                size="small"
                @click="handleToggleAvailability(rowData.id)"
              >
                {{ rowData.is_available ? 'Disable' : 'Enable' }}
              </VaButton>
            </div>
          </template>
        </VaDataTable>
      </VaCardContent>
    </VaCard>
  </div>
</template>

<style scoped>
.consultants-page {
  padding: 2rem;
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.page-title {
  font-size: 2rem;
  font-weight: 700;
  margin: 0;
  color: #1a1a1a;
}

.page-subtitle {
  font-size: 1rem;
  color: #6b7280;
  margin: 0.5rem 0 0 0;
}

.filters {
  display: grid;
  grid-template-columns: 1fr 200px auto auto;
  gap: 1rem;
  align-items: end;
}

.consultant-cell {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.consultant-name {
  font-weight: 600;
  color: #1a1a1a;
}

.consultant-email {
  font-size: 0.875rem;
  color: #6b7280;
}

.stat-cell {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.earnings-text {
  color: #10b981;
}

.actions-cell {
  display: flex;
  gap: 0.5rem;
}

@media (max-width: 768px) {
  .consultants-page {
    padding: 1rem;
  }

  .page-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 1rem;
  }

  .filters {
    grid-template-columns: 1fr;
  }
}
</style>
