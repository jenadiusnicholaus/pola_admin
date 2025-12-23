<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { useDisbursements } from '../../composables'

const { consultantEarnings, isLoading, totalCount, fetchConsultantEarnings, markConsultantEarningPaid } =
  useDisbursements()

const filters = ref({
  status: '',
  email: '',
})

const showMarkPaidModal = ref(false)
const showDetailsModal = ref(false)
const selectedEarning = ref<any>(null)
const selectedEarningId = ref<number | null>(null)
const paidForm = ref({
  disbursement_reference: '',
  payment_method: 'bank_transfer',
  notes: '',
})

onMounted(() => {
  fetchConsultantEarnings()
})

const handleSearch = () => {
  fetchConsultantEarnings(filters.value)
}

const openDetailsModal = (earning: any) => {
  selectedEarning.value = earning
  showDetailsModal.value = true
}

const openMarkPaidModal = (earning: any) => {
  selectedEarningId.value = earning.id
  paidForm.value = { disbursement_reference: '', payment_method: 'bank_transfer', notes: '' }
  showMarkPaidModal.value = true
}

const handleMarkPaid = async () => {
  if (!selectedEarningId.value) return

  await markConsultantEarningPaid(selectedEarningId.value, paidForm.value)
  showMarkPaidModal.value = false
  await fetchConsultantEarnings()
}

const openMarkPaidFromDetails = (earning: any) => {
  showDetailsModal.value = false
  openMarkPaidModal(earning)
}

const columns = [
  { key: 'consultant_email', label: 'Consultant', sortable: true },
  { key: 'booking', label: 'Booking', sortable: true },
  { key: 'client_name', label: 'Client', sortable: true },
  { key: 'service_type', label: 'Service Type', sortable: true },
  { key: 'gross_amount', label: 'Gross Amount', sortable: true },
  { key: 'net_earnings', label: 'Net Earnings', sortable: true },
  { key: 'platform_commission', label: 'Commission', sortable: true },
  { key: 'paid_out', label: 'Status', sortable: true },
  { key: 'created_at', label: 'Date', sortable: true },
  { key: 'actions', label: 'Actions', width: '180px' },
]

const getStatusColor = (paidOut: boolean) => {
  return paidOut ? 'success' : 'warning'
}

const getStatusText = (paidOut: boolean) => {
  return paidOut ? 'Paid' : 'Pending'
}

const formatServiceType = (serviceType: string) => {
  return serviceType
    .split('_')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ')
}

const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  })
}

const formatCurrency = (amount: string) => {
  return `TSh ${parseFloat(amount).toLocaleString()}`
}
</script>

<template>
  <div class="earnings-page">
    <div class="page-header">
      <div>
        <h1 class="page-title">Consultant Earnings</h1>
        <p class="page-subtitle">Track and manage consultant payments</p>
      </div>
    </div>

    <VaCard>
      <VaCardContent>
        <div class="filters">
          <VaInput v-model="filters.email" placeholder="Search by consultant email" clearable>
            <template #prependInner>
              <VaIcon name="search" />
            </template>
          </VaInput>

          <VaSelect
            v-model="filters.status"
            placeholder="All Statuses"
            :options="[
              { text: 'All', value: '' },
              { text: 'Pending', value: 'false' },
              { text: 'Paid', value: 'true' },
            ]"
            text-by="text"
            value-by="value"
            clearable
          />

          <VaButton @click="handleSearch">Search</VaButton>
          <VaButton preset="secondary" @click="filters = { status: '', email: '' }">Clear</VaButton>
        </div>
      </VaCardContent>
    </VaCard>

    <VaCard>
      <VaCardContent>
        <VaDataTable :items="consultantEarnings" :columns="columns" :loading="isLoading" striped hoverable>
          <template #cell(consultant_email)="{ rowData }">
            <div class="user-cell">
              <VaIcon name="support_agent" size="small" />
              <div>
                <div class="flex items-center gap-1">
                  <span>{{ rowData.consultant_name || 'N/A' }}</span>
                  <VaBadge v-if="rowData.consultant_type" :text="rowData.consultant_type" color="info" size="small" />
                </div>
                <div class="email-text">{{ rowData.consultant_email }}</div>
              </div>
            </div>
          </template>

          <template #cell(booking)="{ rowData }">
            <div class="flex flex-col gap-1">
              <VaBadge :text="'#' + rowData.booking" color="info" />
              <span class="text-xs text-secondary">{{ formatDate(rowData.booking_details.scheduled_date) }}</span>
            </div>
          </template>

          <template #cell(client_name)="{ rowData }">
            <div class="flex items-center gap-1">
              <VaIcon name="person" size="small" color="secondary" />
              <span>{{ rowData.booking_details.client_name || 'N/A' }}</span>
            </div>
          </template>

          <template #cell(service_type)="{ rowData }">
            <VaBadge :text="formatServiceType(rowData.service_type)" color="primary" />
          </template>

          <template #cell(gross_amount)="{ rowData }">
            <strong>{{ formatCurrency(rowData.gross_amount) }}</strong>
          </template>

          <template #cell(net_earnings)="{ rowData }">
            <strong class="share-text">{{ formatCurrency(rowData.net_earnings) }}</strong>
          </template>

          <template #cell(platform_commission)="{ rowData }">
            <span class="commission-text">{{ formatCurrency(rowData.platform_commission) }}</span>
          </template>

          <template #cell(paid_out)="{ rowData }">
            <VaBadge :text="getStatusText(rowData.paid_out)" :color="getStatusColor(rowData.paid_out)" />
          </template>

          <template #cell(created_at)="{ rowData }">
            <span>{{ formatDate(rowData.created_at) }}</span>
          </template>

          <template #cell(actions)="{ rowData }">
            <div class="actions-cell">
              <VaButton preset="plain" icon="visibility" size="small" @click="openDetailsModal(rowData)">
                Details
              </VaButton>
              <VaButton
                v-if="!rowData.paid_out"
                preset="plain"
                icon="payments"
                color="success"
                size="small"
                @click="openMarkPaidModal(rowData)"
              >
                Mark Paid
              </VaButton>
              <VaBadge v-else text="Paid" color="success" />
            </div>
          </template>
        </VaDataTable>

        <div class="pagination-info">
          <span>Total: {{ totalCount }} earnings</span>
        </div>
      </VaCardContent>
    </VaCard>

    <!-- Booking Details Modal -->
    <VaModal v-model="showDetailsModal" title="Earning Details" size="large" :close-button="true">
      <div v-if="selectedEarning" class="details-modal">
        <div class="details-section">
          <h3 class="section-title">Consultant Information</h3>
          <div class="details-grid">
            <div class="detail-item">
              <span class="detail-label">Name:</span>
              <span class="detail-value">{{ selectedEarning.consultant_name || 'N/A' }}</span>
            </div>
            <div class="detail-item">
              <span class="detail-label">Email:</span>
              <span class="detail-value">{{ selectedEarning.consultant_email }}</span>
            </div>
            <div class="detail-item">
              <span class="detail-label">Type:</span>
              <VaBadge :text="selectedEarning.consultant_type || 'N/A'" color="info" />
            </div>
          </div>
        </div>

        <div class="details-section">
          <h3 class="section-title">Booking Information</h3>
          <div class="details-grid">
            <div class="detail-item">
              <span class="detail-label">Booking ID:</span>
              <VaBadge :text="'#' + selectedEarning.booking" color="info" />
            </div>
            <div class="detail-item">
              <span class="detail-label">Client:</span>
              <span class="detail-value">{{ selectedEarning.booking_details.client_name || 'N/A' }}</span>
            </div>
            <div class="detail-item">
              <span class="detail-label">Type:</span>
              <VaBadge :text="formatServiceType(selectedEarning.service_type)" color="primary" />
            </div>
            <div class="detail-item">
              <span class="detail-label">Status:</span>
              <VaBadge :text="selectedEarning.booking_details.status" color="success" />
            </div>
            <div class="detail-item">
              <span class="detail-label">Scheduled Date:</span>
              <span class="detail-value">{{ formatDate(selectedEarning.booking_details.scheduled_date) }}</span>
            </div>
            <div class="detail-item">
              <span class="detail-label">Scheduled Duration:</span>
              <span class="detail-value">{{ selectedEarning.booking_details.scheduled_duration_minutes }} min</span>
            </div>
            <div class="detail-item">
              <span class="detail-label">Actual Duration:</span>
              <span class="detail-value">{{ selectedEarning.booking_details.actual_duration_minutes }} min</span>
            </div>
            <div class="detail-item">
              <span class="detail-label">Total Amount:</span>
              <span class="detail-value">{{ formatCurrency(selectedEarning.booking_details.total_amount) }}</span>
            </div>
          </div>
        </div>

        <div class="details-section">
          <h3 class="section-title">Earnings Breakdown</h3>
          <div class="earnings-breakdown">
            <div class="earning-row">
              <span class="earning-label">Gross Amount:</span>
              <span class="earning-value gross">{{ formatCurrency(selectedEarning.gross_amount) }}</span>
            </div>
            <div class="earning-row">
              <span class="earning-label">Platform Commission:</span>
              <span class="earning-value commission">{{ formatCurrency(selectedEarning.platform_commission) }}</span>
            </div>
            <div class="earning-row total">
              <span class="earning-label">Net Earnings:</span>
              <span class="earning-value net">{{ formatCurrency(selectedEarning.net_earnings) }}</span>
            </div>
          </div>
        </div>

        <div class="details-section">
          <h3 class="section-title">Payment Status</h3>
          <div class="payment-status">
            <VaBadge
              :text="selectedEarning.paid_out ? 'Paid Out' : 'Pending'"
              :color="selectedEarning.paid_out ? 'success' : 'warning'"
              size="large"
            />
            <div v-if="selectedEarning.payout_date" class="payout-date">
              <VaIcon name="event" />
              <span>Paid on: {{ formatDate(selectedEarning.payout_date) }}</span>
            </div>
          </div>
        </div>

        <div class="details-section">
          <h3 class="section-title">Timeline</h3>
          <div class="detail-item">
            <span class="detail-label">Created:</span>
            <span class="detail-value">{{ formatDate(selectedEarning.created_at) }}</span>
          </div>
        </div>
      </div>

      <template #footer>
        <VaButton preset="secondary" @click="showDetailsModal = false">Close</VaButton>
        <VaButton
          v-if="selectedEarning && !selectedEarning.paid_out"
          color="success"
          @click="openMarkPaidFromDetails(selectedEarning)"
        >
          Mark as Paid
        </VaButton>
      </template>
    </VaModal>

    <!-- Mark as Paid Modal -->
    <VaModal v-model="showMarkPaidModal" title="Mark Earning as Paid" size="medium">
      <div class="modal-form">
        <VaInput
          v-model="paidForm.disbursement_reference"
          label="Disbursement Reference"
          placeholder="e.g., DISB-2025-001"
          required
        />

        <VaSelect
          v-model="paidForm.payment_method"
          label="Payment Method"
          :options="['bank_transfer', 'mobile_money', 'check', 'cash']"
          required
        />

        <VaTextarea
          v-model="paidForm.notes"
          label="Notes (Optional)"
          placeholder="Add payment details or notes..."
          :min-rows="3"
        />
      </div>

      <template #footer>
        <VaButton preset="secondary" @click="showMarkPaidModal = false">Cancel</VaButton>
        <VaButton color="success" @click="handleMarkPaid">Confirm Payment</VaButton>
      </template>
    </VaModal>
  </div>
</template>

<style scoped>
.earnings-page {
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

.user-cell {
  display: flex;
  align-items: flex-start;
  gap: 0.5rem;
}

.email-text {
  font-size: 0.875rem;
  color: #6b7280;
}

.share-text {
  color: #10b981;
}

.commission-text {
  color: #6b7280;
}

.actions-cell {
  display: flex;
  gap: 0.5rem;
  align-items: center;
}

.paid-badge {
  display: flex;
  align-items: center;
  gap: 0.25rem;
  font-size: 0.875rem;
  color: #10b981;
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

.details-modal {
  display: flex;
  flex-direction: column;
  gap: 2rem;
  padding: 1rem 0;
}

.details-section {
  border-bottom: 1px solid #e5e7eb;
  padding-bottom: 1.5rem;
}

.details-section:last-child {
  border-bottom: none;
}

.section-title {
  font-size: 1.125rem;
  font-weight: 600;
  margin-bottom: 1rem;
  color: #1a1a1a;
}

.details-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 1rem;
}

.detail-item {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.detail-label {
  font-size: 0.875rem;
  color: #6b7280;
  font-weight: 500;
}

.detail-value {
  font-size: 1rem;
  color: #1a1a1a;
}

.earnings-breakdown {
  background: #f9fafb;
  padding: 1.5rem;
  border-radius: 0.5rem;
}

.earning-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.75rem 0;
  border-bottom: 1px solid #e5e7eb;
}

.earning-row:last-child {
  border-bottom: none;
}

.earning-row.total {
  margin-top: 0.5rem;
  padding-top: 1rem;
  border-top: 2px solid #1a1a1a;
  font-weight: 600;
}

.earning-label {
  font-size: 0.9375rem;
  color: #4b5563;
}

.earning-value {
  font-size: 1.125rem;
  font-weight: 600;
}

.earning-value.gross {
  color: #1a1a1a;
}

.earning-value.commission {
  color: #ef4444;
}

.earning-value.net {
  color: #10b981;
  font-size: 1.25rem;
}

.payment-status {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.payout-date {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  color: #6b7280;
  font-size: 0.9375rem;
}

@media (max-width: 768px) {
  .earnings-page {
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
