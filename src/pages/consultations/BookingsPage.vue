<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { useConsultations } from '../../composables'

const { bookings, isLoading, totalCount, fetchBookings, updateBookingStatus } = useConsultations()

const filters = ref({
  status: '',
  service_type: '',
  email: '',
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
  { key: 'client_email', label: 'Client', sortable: true },
  { key: 'consultant_name', label: 'Consultant', sortable: true },
  { key: 'service_type', label: 'Service', sortable: true },
  { key: 'scheduled_date', label: 'Date', sortable: true },
  { key: 'scheduled_duration_minutes', label: 'Duration', sortable: true },
  { key: 'total_amount', label: 'Amount', sortable: true },
  { key: 'status', label: 'Status', sortable: true },
  { key: 'actions', label: 'Actions', width: '150px' },
]

const getStatusColor = (status: string) => {
  switch (status) {
    case 'confirmed':
      return 'success'
    case 'pending':
      return 'warning'
    case 'in_progress':
      return 'info'
    case 'completed':
      return 'primary'
    case 'cancelled':
      return 'danger'
    default:
      return 'info'
  }
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
          <VaInput v-model="filters.email" placeholder="Search by email" clearable>
            <template #prependInner>
              <VaIcon name="search" />
            </template>
          </VaInput>

          <VaSelect
            v-model="filters.status"
            placeholder="All Statuses"
            :options="['', 'pending', 'confirmed', 'in_progress', 'completed', 'cancelled']"
            clearable
          />

          <VaSelect
            v-model="filters.service_type"
            placeholder="All Services"
            :options="['', 'physical', 'mobile', 'video']"
            clearable
          />

          <VaButton @click="handleSearch">Search</VaButton>
          <VaButton preset="secondary" @click="filters = { status: '', service_type: '', email: '' }">Clear</VaButton>
        </div>
      </VaCardContent>
    </VaCard>

    <VaCard>
      <VaCardContent>
        <VaDataTable :items="bookings" :columns="columns" :loading="isLoading" striped hoverable>
          <template #cell(client_email)="{ rowData }">
            <div class="user-cell">
              <VaIcon name="person" size="small" />
              <span>{{ rowData.client_email }}</span>
            </div>
          </template>

          <template #cell(consultant_name)="{ rowData }">
            <div class="user-cell">
              <VaIcon name="support_agent" size="small" />
              <span>{{ rowData.consultant_name }}</span>
            </div>
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
          :options="['pending', 'confirmed', 'in_progress', 'completed', 'cancelled']"
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
  grid-template-columns: 1fr 200px 200px auto auto;
  gap: 1rem;
  align-items: end;
}

.user-cell {
  display: flex;
  align-items: center;
  gap: 0.5rem;
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

  .filters {
    grid-template-columns: 1fr;
  }
}
</style>
