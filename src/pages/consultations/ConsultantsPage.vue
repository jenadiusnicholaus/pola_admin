<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { useConsultations } from '../../composables'

const { consultants, isLoading, fetchConsultants, toggleConsultantAvailability } = useConsultations()

const filters = ref({
  specialization: '',
  is_available: undefined as boolean | undefined,
  consultant_type: '',
  city: '',
})

onMounted(() => {
  fetchConsultants()
})

const handleSearch = () => {
  // Only pass defined filters
  const activeFilters: any = {}
  if (filters.value.specialization) activeFilters.specialization = filters.value.specialization
  if (filters.value.is_available !== undefined) activeFilters.is_available = filters.value.is_available
  if (filters.value.consultant_type) activeFilters.consultant_type = filters.value.consultant_type
  if (filters.value.city) activeFilters.city = filters.value.city

  fetchConsultants(activeFilters)
}

const handleClearFilters = () => {
  filters.value = {
    specialization: '',
    is_available: undefined,
    consultant_type: '',
    city: '',
  }
  fetchConsultants()
}

const handleToggleAvailability = async (id: number) => {
  await toggleConsultantAvailability(id)
  await fetchConsultants()
}

const columns = [
  { key: 'consultant_name', label: 'Consultant', sortable: true },
  { key: 'consultant_type', label: 'Type', sortable: true },
  { key: 'specialization', label: 'Specialization', sortable: true },
  { key: 'city', label: 'City', sortable: true },
  { key: 'years_of_experience', label: 'Experience', sortable: true },
  { key: 'total_bookings', label: 'Bookings', sortable: true },
  { key: 'total_earnings', label: 'Earnings', sortable: true },
  { key: 'average_rating', label: 'Rating', sortable: true },
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
          <VaInput v-model="filters.specialization" placeholder="Search specialization (e.g., Criminal Law)" clearable>
            <template #prependInner>
              <VaIcon name="search" />
            </template>
          </VaInput>

          <VaSelect
            v-model="filters.consultant_type"
            placeholder="All Types"
            :options="[
              { text: 'All Types', value: '' },
              { text: 'Advocate', value: 'advocate' },
              { text: 'Lawyer', value: 'lawyer' },
              { text: 'Paralegal', value: 'paralegal' },
            ]"
            clearable
          />

          <VaInput v-model="filters.city" placeholder="City" clearable>
            <template #prependInner>
              <VaIcon name="location_on" />
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
          <VaButton preset="secondary" @click="handleClearFilters">Clear</VaButton>
        </div>
      </VaCardContent>
    </VaCard>

    <VaCard>
      <VaCardContent>
        <VaDataTable :items="consultants" :columns="columns" :loading="isLoading" striped hoverable>
          <template #cell(consultant_name)="{ rowData }">
            <div class="consultant-cell">
              <VaIcon name="account_circle" size="large" />
              <div>
                <div class="consultant-name">{{ rowData.user.first_name }} {{ rowData.user.last_name }}</div>
                <div class="consultant-email">{{ rowData.user.email }}</div>
                <div class="consultant-phone">{{ rowData.user.phone_number }}</div>
              </div>
            </div>
          </template>

          <template #cell(consultant_type)="{ rowData }">
            <VaBadge
              :text="rowData.consultant_type"
              :color="
                rowData.consultant_type === 'advocate'
                  ? 'primary'
                  : rowData.consultant_type === 'lawyer'
                    ? 'info'
                    : 'warning'
              "
            />
          </template>

          <template #cell(specialization)="{ rowData }">
            <div class="specialization-text">{{ rowData.specialization }}</div>
          </template>

          <template #cell(city)="{ rowData }">
            <div class="city-cell">
              <VaIcon name="location_on" size="small" />
              {{ rowData.city }}
            </div>
          </template>

          <template #cell(years_of_experience)="{ rowData }">
            <VaBadge :text="`${rowData.years_of_experience} years`" color="info" />
          </template>

          <template #cell(total_bookings)="{ rowData }">
            <div class="stat-cell">
              <div class="stat-item">
                <VaIcon name="event" size="small" color="primary" />
                <span>{{ rowData.total_bookings }}</span>
              </div>
              <div class="booking-details">
                <small
                  >✓ {{ rowData.completed_bookings }} | ⏳ {{ rowData.pending_bookings }} | ✗
                  {{ rowData.cancelled_bookings }}</small
                >
              </div>
            </div>
          </template>

          <template #cell(total_earnings)="{ rowData }">
            <strong class="earnings-text">{{ formatCurrency(rowData.total_earnings) }}</strong>
          </template>

          <template #cell(average_rating)="{ rowData }">
            <div class="rating-cell">
              <VaIcon name="star" color="warning" size="small" />
              <strong>{{ rowData.average_rating.toFixed(1) }}</strong>
              <small>({{ rowData.total_reviews }})</small>
            </div>
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
  grid-template-columns: 2fr 1fr 1fr 1fr auto auto;
  gap: 0.75rem;
  align-items: end;
}

@media (max-width: 1200px) {
  .filters {
    grid-template-columns: 1fr 1fr 1fr;
  }

  .filters > :nth-child(5),
  .filters > :nth-child(6) {
    grid-column: span 1;
  }
}

@media (max-width: 768px) {
  .filters {
    grid-template-columns: 1fr 1fr;
  }

  .filters > :first-child {
    grid-column: span 2;
  }
}

@media (max-width: 480px) {
  .filters {
    grid-template-columns: 1fr;
  }

  .filters > :first-child {
    grid-column: span 1;
  }
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

.consultant-phone {
  font-size: 0.75rem;
  color: #9ca3af;
  margin-top: 0.125rem;
}

.specialization-text {
  font-size: 0.875rem;
  color: #374151;
  max-width: 250px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.city-cell {
  display: flex;
  align-items: center;
  gap: 0.25rem;
  font-size: 0.875rem;
  color: #6b7280;
}

.stat-cell {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.stat-item {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-weight: 600;
}

.booking-details {
  font-size: 0.75rem;
  color: #9ca3af;
}

.rating-cell {
  display: flex;
  align-items: center;
  gap: 0.25rem;
  font-size: 0.875rem;
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
}
</style>
