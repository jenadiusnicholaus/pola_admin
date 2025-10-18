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

const columns = [
  { key: 'consultant_email', label: 'Consultant', sortable: true },
  { key: 'booking_reference', label: 'Booking', sortable: true },
  { key: 'total_amount', label: 'Total Amount', sortable: true },
  { key: 'consultant_share', label: 'Consultant Share', sortable: true },
  { key: 'platform_commission', label: 'Commission', sortable: true },
  { key: 'status', label: 'Status', sortable: true },
  { key: 'created_at', label: 'Date', sortable: true },
  { key: 'actions', label: 'Actions', width: '150px' },
]

const getStatusColor = (status: string) => {
  switch (status) {
    case 'paid':
      return 'success'
    case 'pending':
      return 'warning'
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
            :options="['', 'pending', 'paid', 'cancelled']"
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
                <div>{{ rowData.consultant_name }}</div>
                <div class="email-text">{{ rowData.consultant_email }}</div>
              </div>
            </div>
          </template>

          <template #cell(total_amount)="{ rowData }">
            <strong>{{ formatCurrency(rowData.total_amount) }}</strong>
          </template>

          <template #cell(consultant_share)="{ rowData }">
            <strong class="share-text">{{ formatCurrency(rowData.consultant_share) }}</strong>
          </template>

          <template #cell(platform_commission)="{ rowData }">
            <span class="commission-text">{{ formatCurrency(rowData.platform_commission) }}</span>
          </template>

          <template #cell(status)="{ rowData }">
            <VaBadge :text="rowData.status" :color="getStatusColor(rowData.status)" />
          </template>

          <template #cell(created_at)="{ rowData }">
            <span>{{ formatDate(rowData.created_at) }}</span>
          </template>

          <template #cell(actions)="{ rowData }">
            <div class="actions-cell">
              <VaButton
                v-if="rowData.status === 'pending'"
                preset="plain"
                icon="payments"
                color="success"
                size="small"
                @click="openMarkPaidModal(rowData)"
              >
                Mark Paid
              </VaButton>
            </div>
          </template>
        </VaDataTable>

        <div class="pagination-info">
          <span>Total: {{ totalCount }} earnings</span>
        </div>
      </VaCardContent>
    </VaCard>

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
