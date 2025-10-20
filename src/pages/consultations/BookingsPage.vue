<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { useConsultations } from '../../composables'

const { bookings, isLoading, totalCount, fetchBookings, updateBookingStatus } = useConsultations()

const filters = ref({
  status: '',
  booking_type: '',
  client_email: '',
})

const showStatusModal = ref(false)
const selectedBookingId = ref<number | null>(null)
const statusForm = ref({
  status: '',
  notes: '',
})

onMounted(() => {
  fetchBookings()
})

const handleSearch = () => {
  fetchBookings(filters.value)
}

const openStatusModal = (booking: any) => {
  selectedBookingId.value = booking.id
  statusForm.value = { status: booking.status, notes: '' }
  showStatusModal.value = true
}

const handleUpdateStatus = async () => {
  if (!selectedBookingId.value) return

  await updateBookingStatus(selectedBookingId.value, statusForm.value)
  showStatusModal.value = false
  await fetchBookings()
}

const columns = [
  { key: 'client', label: 'Client', sortable: true },
  { key: 'consultant', label: 'Consultant', sortable: true },
  { key: 'booking_type', label: 'Type', sortable: true },
  { key: 'scheduled_date', label: 'Date', sortable: true },
  { key: 'scheduled_duration_minutes', label: 'Duration', sortable: true },
  { key: 'total_amount', label: 'Amount', sortable: true },
  { key: 'status', label: 'Status', sortable: true },
  { key: 'actions', label: 'Actions', width: '150px' },
]

const getStatusColor = (status: string) => {
  const colors = {
    confirmed: 'success',
    pending: 'warning',
    completed: 'primary',
    cancelled: 'danger',
  }
  return colors[status as keyof typeof colors] || 'info'
}

const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

const formatCurrency = (amount: string) => {
  return `TSh ${parseFloat(amount).toLocaleString()}`
}
</script>

<template>
  <div class="bookings-page">
    <div class="page-header">
      <div>
        <h1 class="page-title">Consultation Bookings</h1>
        <p class="page-subtitle">Manage consultation appointments</p>
      </div>
    </div>

    <VaCard>
      <VaCardContent>
        <div class="filters">
          <VaInput v-model="filters.client_email" placeholder="Search by client email" clearable>
            <template #prependInner>
              <VaIcon name="search" />
            </template>
          </VaInput>

          <VaSelect
            v-model="filters.status"
            placeholder="All Statuses"
            :options="['', 'pending', 'confirmed', 'completed', 'cancelled']"
            clearable
          />

          <VaSelect
            v-model="filters.booking_type"
            placeholder="All Types"
            :options="['', 'physical', 'mobile']"
            clearable
          />

          <VaButton @click="handleSearch">Search</VaButton>
          <VaButton preset="secondary" @click="filters = { status: '', booking_type: '', client_email: '' }">
            Clear
          </VaButton>
        </div>
      </VaCardContent>
    </VaCard>

    <VaCard>
      <VaCardContent>
        <VaDataTable :items="bookings" :columns="columns" :loading="isLoading" striped hoverable>
          <template #cell(client)="{ rowData }">
            <div class="user-cell">
              <VaIcon name="person" size="small" />
              <div>
                <div>{{ rowData.client.first_name }} {{ rowData.client.last_name }}</div>
                <div class="text-secondary">{{ rowData.client.email }}</div>
              </div>
            </div>
          </template>

          <template #cell(consultant)="{ rowData }">
            <div class="user-cell">
              <VaIcon name="support_agent" size="small" />
              <div>
                <div>{{ rowData.consultant.first_name }} {{ rowData.consultant.last_name }}</div>
                <div class="text-secondary">{{ rowData.consultant.email }}</div>
              </div>
            </div>
          </template>

          <template #cell(booking_type)="{ rowData }">
            <VaBadge :text="rowData.booking_type" :color="rowData.booking_type === 'physical' ? 'primary' : 'info'" />
          </template>

          <template #cell(scheduled_date)="{ rowData }">
            <span>{{ formatDate(rowData.scheduled_date) }}</span>
          </template>

          <template #cell(scheduled_duration_minutes)="{ rowData }">
            <VaBadge :text="`${rowData.scheduled_duration_minutes} min`" color="info" />
          </template>

          <template #cell(total_amount)="{ rowData }">
            <strong>{{ formatCurrency(rowData.total_amount) }}</strong>
          </template>

          <template #cell(status)="{ rowData }">
            <VaBadge :text="rowData.status" :color="getStatusColor(rowData.status)" />
          </template>

          <template #cell(actions)="{ rowData }">
            <div class="actions-cell">
              <VaButton preset="plain" icon="edit" size="small" @click="openStatusModal(rowData)">Update</VaButton>
            </div>
          </template>
        </VaDataTable>

        <div class="pagination-info">
          <span>Total: {{ totalCount }} bookings</span>
        </div>
      </VaCardContent>
    </VaCard>

    <VaModal v-model="showStatusModal" title="Update Booking Status" size="small">
      <div class="modal-form">
        <VaSelect
          v-model="statusForm.status"
          label="Status"
          :options="['pending', 'confirmed', 'completed', 'cancelled']"
          required
        />

        <VaTextarea
          v-model="statusForm.notes"
          label="Notes (Optional)"
          placeholder="Add any relevant notes..."
          :min-rows="3"
        />
      </div>

      <template #footer>
        <VaButton preset="secondary" @click="showStatusModal = false">Cancel</VaButton>
        <VaButton color="primary" @click="handleUpdateStatus">Update Status</VaButton>
      </template>
    </VaModal>
  </div>
</template>

<style scoped>
.bookings-page {
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
  grid-template-columns: 2fr 1fr 1fr auto auto;
  gap: 0.75rem;
  align-items: end;
}

@media (max-width: 1200px) {
  .filters {
    grid-template-columns: 1fr 1fr 1fr;
  }

  .filters > :nth-child(4),
  .filters > :nth-child(5) {
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

.user-cell {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.text-secondary {
  font-size: 0.875rem;
  color: #6b7280;
}

.actions-cell {
  display: flex;
  gap: 0.5rem;
}

.pagination-info {
  margin-top: 1rem;
  padding-top: 1rem;
  border-top: 1px solid #e5e7eb;
  text-align: right;
  color: #6b7280;
  font-size: 0.875rem;
}

.modal-form {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
  padding: 1rem 0;
}

@media (max-width: 768px) {
  .bookings-page {
    padding: 1rem;
  }

  .page-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 1rem;
  }
}
</style>
