<template>
  <div>
    <h1 class="page-title">Disbursement Management</h1>

    <!-- Statistics Cards -->
    <div class="stats-grid">
      <VaCard class="stat-card">
        <VaCardContent>
          <div class="stat-item">
            <VaIcon name="account_balance_wallet" color="primary" size="2.5rem" />
            <div class="stat-content">
              <div class="stat-value">{{ formatCurrency(statistics.summary?.total_amount || 0) }}</div>
              <div class="stat-label">Total Amount</div>
            </div>
          </div>
        </VaCardContent>
      </VaCard>

      <VaCard class="stat-card">
        <VaCardContent>
          <div class="stat-item">
            <VaIcon name="schedule" color="warning" size="2.5rem" />
            <div class="stat-content">
              <div class="stat-value">{{ statistics.by_status?.pending?.count || 0 }}</div>
              <div class="stat-label">Pending</div>
              <div class="stat-sublabel">
                {{ formatCurrency(statistics.by_status?.pending?.total_amount || 0) }}
              </div>
            </div>
          </div>
        </VaCardContent>
      </VaCard>

      <VaCard class="stat-card">
        <VaCardContent>
          <div class="stat-item">
            <VaIcon name="check_circle" color="success" size="2.5rem" />
            <div class="stat-content">
              <div class="stat-value">{{ statistics.by_status?.completed?.count || 0 }}</div>
              <div class="stat-label">Completed</div>
              <div class="stat-sublabel">
                {{ formatCurrency(statistics.by_status?.completed?.total_amount || 0) }}
              </div>
            </div>
          </div>
        </VaCardContent>
      </VaCard>

      <VaCard class="stat-card">
        <VaCardContent>
          <div class="stat-item">
            <VaIcon name="error" color="danger" size="2.5rem" />
            <div class="stat-content">
              <div class="stat-value">{{ statistics.by_status?.failed?.count || 0 }}</div>
              <div class="stat-label">Failed</div>
              <div class="stat-sublabel">
                {{ formatCurrency(statistics.by_status?.failed?.total_amount || 0) }}
              </div>
            </div>
          </div>
        </VaCardContent>
      </VaCard>
    </div>

    <!-- Filters -->
    <VaCard class="my-6">
      <VaCardContent>
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-7 gap-3 items-end">
          <div class="xl:col-span-2">
            <VaInput v-model="filters.search" placeholder="Search by reference or recipient..." clearable />
          </div>

          <VaSelect
            v-model="filters.status"
            placeholder="Status"
            :options="statusOptions"
            clearable
            text-by="text"
            value-by="value"
          />

          <VaSelect
            v-model="filters.disbursement_type"
            placeholder="Type"
            :options="typeOptions"
            clearable
            text-by="text"
            value-by="value"
          />

          <VaDateInput v-model="filters.start_date" placeholder="Start Date" clearable />

          <VaDateInput v-model="filters.end_date" placeholder="End Date" clearable />

          <VaButton class="w-full" @click="handleSearch">Search</VaButton>
          <VaButton color="secondary" class="w-full" @click="handleClear">Clear</VaButton>
        </div>
      </VaCardContent>
    </VaCard>

    <!-- Data Table -->
    <VaCard>
      <VaCardContent>
        <VaDataTable :items="disbursements" :columns="columns" :loading="loading" striped hoverable>
          <template #cell(external_reference)="{ rowData }">
            <span class="font-semibold">{{ rowData.external_reference }}</span>
          </template>

          <template #cell(recipient)="{ rowData }">
            <div>
              <div class="font-semibold">{{ rowData.recipient_full_name || rowData.recipient_email }}</div>
              <div class="text-sm text-secondary">{{ rowData.recipient_email }}</div>
              <div class="text-xs text-secondary">{{ rowData.recipient_phone }}</div>
            </div>
          </template>

          <template #cell(amount)="{ rowData }">
            <span class="font-semibold">{{ formatCurrency(rowData.amount) }}</span>
          </template>

          <template #cell(earnings_count)="{ rowData }">
            <span>{{ rowData.consultant_earnings_count + rowData.uploader_earnings_count }}</span>
          </template>

          <template #cell(disbursement_type)="{ rowData }">
            <VaBadge :text="rowData.disbursement_type" :color="getTypeColor(rowData.disbursement_type)" />
          </template>

          <template #cell(payment_method)="{ rowData }">
            <span class="capitalize">{{ formatPaymentMethod(rowData.payment_method) }}</span>
          </template>

          <template #cell(status)="{ rowData }">
            <VaBadge :text="rowData.status" :color="getStatusColor(rowData.status)" />
          </template>

          <template #cell(initiated_at)="{ rowData }">
            {{ formatDate(rowData.initiated_at) }}
          </template>

          <template #cell(actions)="{ rowData }">
            <div class="action-buttons">
              <VaButton size="small" icon="visibility" @click="handleViewDetails(rowData)"> View </VaButton>

              <VaButton
                v-if="rowData.status === 'pending'"
                size="small"
                color="success"
                :loading="processingId === rowData.id"
                @click="handleProcess(rowData)"
              >
                Process
              </VaButton>

              <VaButton
                v-if="rowData.status === 'failed'"
                size="small"
                color="warning"
                icon="refresh"
                :loading="resubmittingId === rowData.id"
                @click="handleResubmit(rowData)"
              >
                Re-process
              </VaButton>

              <VaButton
                v-if="['pending', 'processing'].includes(rowData.status)"
                size="small"
                color="danger"
                :loading="cancelingId === rowData.id"
                @click="handleCancel(rowData)"
              >
                Cancel
              </VaButton>

              <VaButton
                v-if="rowData.status === 'processing'"
                size="small"
                color="info"
                :loading="checkingStatusId === rowData.id"
                @click="handleCheckStatus(rowData)"
              >
                Check Status
              </VaButton>
            </div>
          </template>
        </VaDataTable>

        <!-- Pagination -->
        <div v-if="totalPages > 1" class="pagination">
          <VaPagination v-model="currentPage" :pages="totalPages" :visible-pages="5" />
        </div>
      </VaCardContent>
    </VaCard>

    <!-- Process Disbursement Modal -->
    <VaModal
      v-model="showProcessModal"
      title="Confirm Disbursement Processing"
      size="medium"
      ok-text="Process Payment"
      @ok="confirmProcess"
    >
      <div v-if="selectedDisbursement" class="space-y-4">
        <VaAlert color="warning" class="mb-4">
          <template #title>⚠️ Real Money Transaction</template>
          Please verify all details before processing. This will initiate an actual payment.
        </VaAlert>

        <div class="grid grid-cols-2 gap-4">
          <div>
            <p class="text-sm text-secondary">Reference Number</p>
            <p class="font-semibold">{{ selectedDisbursement.external_reference }}</p>
          </div>
          <div>
            <p class="text-sm text-secondary">Status</p>
            <VaBadge :text="selectedDisbursement.status" :color="getStatusColor(selectedDisbursement.status)" />
          </div>
          <div>
            <p class="text-sm text-secondary">Recipient Name</p>
            <p class="font-semibold">
              {{ selectedDisbursement.recipient_full_name || selectedDisbursement.recipient_email }}
            </p>
          </div>
          <div>
            <p class="text-sm text-secondary">Recipient Email</p>
            <p class="font-semibold">{{ selectedDisbursement.recipient_email }}</p>
          </div>
          <div>
            <p class="text-sm text-secondary">Recipient Phone</p>
            <p class="font-semibold">{{ selectedDisbursement.recipient_phone }}</p>
          </div>
          <div>
            <p class="text-sm text-secondary">Payment Method</p>
            <p class="font-semibold capitalize">{{ formatPaymentMethod(selectedDisbursement.payment_method) }}</p>
          </div>
          <div>
            <p class="text-sm text-secondary">Amount</p>
            <p class="text-xl font-bold text-success">{{ formatCurrency(selectedDisbursement.amount) }}</p>
          </div>
          <div>
            <p class="text-sm text-secondary">Type</p>
            <VaBadge
              :text="selectedDisbursement.disbursement_type"
              :color="getTypeColor(selectedDisbursement.disbursement_type)"
            />
          </div>
          <div class="col-span-2">
            <p class="text-sm text-secondary">Earnings Count</p>
            <p class="font-semibold">
              {{ selectedDisbursement.consultant_earnings_count + selectedDisbursement.uploader_earnings_count }}
              items
            </p>
          </div>
        </div>

        <VaDivider />

        <div class="bg-info/10 p-4 rounded">
          <p class="text-sm font-semibold mb-2">Processing will:</p>
          <ul class="text-sm space-y-1 ml-4">
            <li>• Initiate payment to {{ selectedDisbursement.recipient_phone }}</li>
            <li>
              • Send {{ formatCurrency(selectedDisbursement.amount) }} via
              {{ formatPaymentMethod(selectedDisbursement.payment_method) }}
            </li>
            <li>• Update status to "Processing"</li>
            <li>• Create transaction with AzamPay</li>
          </ul>
        </div>
      </div>
    </VaModal>

    <!-- Disbursement Details Modal -->
    <VaModal v-model="showDetailsModal" title="Disbursement Details" size="large" hide-default-actions>
      <div v-if="selectedDisbursement" class="space-y-4">
        <!-- Header with Status -->
        <div class="flex items-center justify-between mb-4">
          <div>
            <h3 class="text-xl font-bold">{{ selectedDisbursement.external_reference }}</h3>
            <p class="text-sm text-secondary">Initiated {{ formatDate(selectedDisbursement.initiated_at) }}</p>
          </div>
          <VaBadge
            :text="selectedDisbursement.status"
            :color="getStatusColor(selectedDisbursement.status)"
            size="large"
          />
        </div>

        <VaDivider />

        <!-- Recipient Information -->
        <div>
          <h4 class="font-semibold mb-3 flex items-center gap-2">
            <VaIcon name="person" />
            Recipient Information
          </h4>
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4 bg-background-element p-4 rounded">
            <div>
              <p class="text-sm text-secondary">Full Name</p>
              <p class="font-semibold">
                {{ selectedDisbursement.recipient_full_name || 'N/A' }}
              </p>
            </div>
            <div>
              <p class="text-sm text-secondary">Email</p>
              <p class="font-semibold">{{ selectedDisbursement.recipient_email }}</p>
            </div>
            <div>
              <p class="text-sm text-secondary">Phone Number</p>
              <p class="font-semibold">{{ selectedDisbursement.recipient_phone }}</p>
            </div>
            <div>
              <p class="text-sm text-secondary">Recipient ID</p>
              <p class="font-semibold">#{{ selectedDisbursement.recipient }}</p>
            </div>
          </div>
        </div>

        <!-- Payment Information -->
        <div>
          <h4 class="font-semibold mb-3 flex items-center gap-2">
            <VaIcon name="payments" />
            Payment Information
          </h4>
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4 bg-background-element p-4 rounded">
            <div>
              <p class="text-sm text-secondary">Amount</p>
              <p class="text-2xl font-bold text-success">{{ formatCurrency(selectedDisbursement.amount) }}</p>
            </div>
            <div>
              <p class="text-sm text-secondary">Currency</p>
              <p class="font-semibold">{{ selectedDisbursement.currency }}</p>
            </div>
            <div>
              <p class="text-sm text-secondary">Payment Method</p>
              <p class="font-semibold capitalize">{{ formatPaymentMethod(selectedDisbursement.payment_method) }}</p>
            </div>
            <div>
              <p class="text-sm text-secondary">Type</p>
              <VaBadge
                :text="selectedDisbursement.disbursement_type"
                :color="getTypeColor(selectedDisbursement.disbursement_type)"
              />
            </div>
            <div v-if="selectedDisbursement.azampay_transaction_id">
              <p class="text-sm text-secondary">AzamPay Transaction ID</p>
              <p class="font-semibold">{{ selectedDisbursement.azampay_transaction_id }}</p>
            </div>
          </div>
        </div>

        <!-- Earnings Information -->
        <div>
          <h4 class="font-semibold mb-3 flex items-center gap-2">
            <VaIcon name="account_balance_wallet" />
            Earnings Breakdown
          </h4>
          <div class="grid grid-cols-1 md:grid-cols-3 gap-4 bg-background-element p-4 rounded">
            <div>
              <p class="text-sm text-secondary">Consultant Earnings</p>
              <p class="text-lg font-bold">{{ selectedDisbursement.consultant_earnings_count }}</p>
            </div>
            <div>
              <p class="text-sm text-secondary">Uploader Earnings</p>
              <p class="text-lg font-bold">{{ selectedDisbursement.uploader_earnings_count }}</p>
            </div>
            <div>
              <p class="text-sm text-secondary">Total Items</p>
              <p class="text-lg font-bold">
                {{ selectedDisbursement.consultant_earnings_count + selectedDisbursement.uploader_earnings_count }}
              </p>
            </div>
          </div>
        </div>

        <!-- Timeline -->
        <div>
          <h4 class="font-semibold mb-3 flex items-center gap-2">
            <VaIcon name="schedule" />
            Timeline
          </h4>
          <div class="space-y-3 bg-background-element p-4 rounded">
            <div class="flex items-start gap-3">
              <VaIcon name="play_arrow" color="info" />
              <div class="flex-1">
                <p class="font-semibold">Initiated</p>
                <p class="text-sm text-secondary">{{ formatDateTime(selectedDisbursement.initiated_at) }}</p>
                <p class="text-xs text-secondary">By: {{ selectedDisbursement.initiated_by_email }}</p>
              </div>
            </div>
            <div v-if="selectedDisbursement.processed_at" class="flex items-start gap-3">
              <VaIcon name="sync" color="warning" />
              <div class="flex-1">
                <p class="font-semibold">Processed</p>
                <p class="text-sm text-secondary">{{ formatDateTime(selectedDisbursement.processed_at) }}</p>
              </div>
            </div>
            <div v-if="selectedDisbursement.completed_at" class="flex items-start gap-3">
              <VaIcon name="check_circle" color="success" />
              <div class="flex-1">
                <p class="font-semibold">Completed</p>
                <p class="text-sm text-secondary">{{ formatDateTime(selectedDisbursement.completed_at) }}</p>
              </div>
            </div>
          </div>
        </div>

        <!-- Notes and Failure Reason -->
        <div v-if="selectedDisbursement.notes || selectedDisbursement.failure_reason">
          <h4 class="font-semibold mb-3 flex items-center gap-2">
            <VaIcon name="notes" />
            Additional Information
          </h4>
          <div class="space-y-3">
            <div v-if="selectedDisbursement.notes" class="bg-background-element p-4 rounded">
              <p class="text-sm text-secondary mb-1">Notes</p>
              <p>{{ selectedDisbursement.notes }}</p>
            </div>
            <div v-if="selectedDisbursement.failure_reason" class="bg-danger/10 p-4 rounded">
              <p class="text-sm text-secondary mb-1">Failure Reason</p>
              <p class="text-danger">{{ selectedDisbursement.failure_reason }}</p>
            </div>
          </div>
        </div>

        <!-- Action Buttons -->
        <VaDivider />
        <div class="flex gap-3 justify-end">
          <VaButton color="secondary" @click="showDetailsModal = false">Close</VaButton>
          <VaButton
            v-if="selectedDisbursement.status === 'pending'"
            color="success"
            @click="handleProcessFromDetails()"
          >
            Process Payment
          </VaButton>
          <VaButton
            v-if="selectedDisbursement.status === 'failed'"
            color="warning"
            icon="refresh"
            :loading="resubmittingId === selectedDisbursement.id"
            @click="handleResubmitFromDetails()"
          >
            Resubmit Payment
          </VaButton>
          <VaButton
            v-if="['pending', 'processing'].includes(selectedDisbursement.status)"
            color="danger"
            @click="handleCancelFromDetails()"
          >
            Cancel Disbursement
          </VaButton>
          <VaButton
            v-if="selectedDisbursement.status === 'processing'"
            color="info"
            @click="handleCheckStatusFromDetails()"
          >
            Check Status
          </VaButton>
        </div>
      </div>
    </VaModal>

    <!-- Cancel Modal -->
    <VaModal v-model="showCancelModal" title="Cancel Disbursement" ok-text="Cancel Disbursement" @ok="confirmCancel">
      <p>Are you sure you want to cancel this disbursement?</p>
      <p class="font-semibold">Reference: {{ selectedDisbursement?.external_reference }}</p>
      <VaInput
        v-model="cancelReason"
        placeholder="Reason for cancellation"
        type="textarea"
        :min-rows="3"
        class="mt-4"
      />
    </VaModal>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, watch } from 'vue'
import { disbursementsService } from '../../services/disbursementsService'
import { useToast } from 'vuestic-ui'
import type { Disbursement } from '../../services/disbursementsService'

const { init: notify } = useToast()

// State
const loading = ref(false)
const disbursements = ref<Disbursement[]>([])
const statistics = ref<any>({})
const currentPage = ref(1)
const totalPages = ref(1)
const pageSize = 10

const processingId = ref<number | null>(null)
const cancelingId = ref<number | null>(null)
const checkingStatusId = ref<number | null>(null)
const resubmittingId = ref<number | null>(null)

const showProcessModal = ref(false)
const showDetailsModal = ref(false)
const showCancelModal = ref(false)
const selectedDisbursement = ref<Disbursement | null>(null)
const cancelReason = ref('')

// Filters
const filters = ref({
  search: '',
  status: null as string | null,
  disbursement_type: null as string | null,
  start_date: null as Date | null,
  end_date: null as Date | null,
})

const statusOptions = [
  { text: 'Pending', value: 'pending' },
  { text: 'Processing', value: 'processing' },
  { text: 'Completed', value: 'completed' },
  { text: 'Failed', value: 'failed' },
]

const typeOptions = [
  { text: 'Consultant', value: 'consultant' },
  { text: 'Uploader', value: 'uploader' },
]

// Table columns
const columns = [
  { key: 'external_reference', label: 'Reference', sortable: true },
  { key: 'recipient', label: 'Recipient', sortable: false },
  { key: 'amount', label: 'Amount', sortable: true },
  { key: 'earnings_count', label: 'Items', sortable: false },
  { key: 'disbursement_type', label: 'Type', sortable: true },
  { key: 'payment_method', label: 'Payment Method', sortable: false },
  { key: 'status', label: 'Status', sortable: true },
  { key: 'initiated_at', label: 'Initiated', sortable: true },
  { key: 'actions', label: 'Actions', sortable: false },
]

// Fetch data
const fetchDisbursements = async () => {
  loading.value = true
  try {
    const params: any = {
      page: currentPage.value,
      page_size: pageSize,
    }

    if (filters.value.status) {
      params.status = filters.value.status
    }

    if (filters.value.disbursement_type) {
      params.disbursement_type = filters.value.disbursement_type
    }

    if (filters.value.start_date) {
      params.start_date = formatDateForAPI(filters.value.start_date)
    }

    if (filters.value.end_date) {
      params.end_date = formatDateForAPI(filters.value.end_date)
    }

    if (filters.value.search) {
      params.search = filters.value.search
    }

    const response = await disbursementsService.getDisbursements(params)
    disbursements.value = response.results
    totalPages.value = Math.ceil(response.count / pageSize)
  } catch (error: any) {
    notify({
      message: error.message || 'Failed to fetch disbursements',
      color: 'danger',
    })
  } finally {
    loading.value = false
  }
}

const fetchStatistics = async () => {
  try {
    statistics.value = await disbursementsService.getDisbursementStatistics()
  } catch (error: any) {
    console.error('Failed to fetch statistics:', error)
  }
}

// Actions
const handleViewDetails = (disbursement: Disbursement) => {
  selectedDisbursement.value = disbursement
  showDetailsModal.value = true
}

const handleProcess = (disbursement: Disbursement) => {
  selectedDisbursement.value = disbursement
  showProcessModal.value = true
}

const confirmProcess = async () => {
  if (!selectedDisbursement.value) return

  processingId.value = selectedDisbursement.value.id
  try {
    await disbursementsService.processDisbursement(selectedDisbursement.value.id)
    notify({
      message: 'Disbursement processed successfully',
      color: 'success',
    })
    showProcessModal.value = false
    await fetchDisbursements()
    await fetchStatistics()
  } catch (error: any) {
    notify({
      message: error.message || 'Failed to process disbursement',
      color: 'danger',
    })
  } finally {
    processingId.value = null
  }
}

const handleProcessFromDetails = () => {
  showDetailsModal.value = false
  showProcessModal.value = true
}

const handleCancel = (disbursement: Disbursement) => {
  selectedDisbursement.value = disbursement
  cancelReason.value = ''
  showCancelModal.value = true
}

const confirmCancel = async () => {
  if (!selectedDisbursement.value) return

  cancelingId.value = selectedDisbursement.value.id
  try {
    await disbursementsService.cancelDisbursement(selectedDisbursement.value.id, cancelReason.value)
    notify({
      message: 'Disbursement cancelled successfully',
      color: 'success',
    })
    showCancelModal.value = false
    await fetchDisbursements()
    await fetchStatistics()
  } catch (error: any) {
    notify({
      message: error.message || 'Failed to cancel disbursement',
      color: 'danger',
    })
  } finally {
    cancelingId.value = null
  }
}

const handleCheckStatus = async (disbursement: Disbursement) => {
  checkingStatusId.value = disbursement.id
  try {
    const status = await disbursementsService.checkDisbursementStatus(disbursement.id)
    notify({
      message: `Status: ${status.status || 'Unknown'}`,
      color: 'info',
    })
    await fetchDisbursements()
  } catch (error: any) {
    notify({
      message: error.message || 'Failed to check status',
      color: 'danger',
    })
  } finally {
    checkingStatusId.value = null
  }
}

const handleResubmit = async (disbursement: Disbursement) => {
  resubmittingId.value = disbursement.id
  try {
    await disbursementsService.processDisbursement(disbursement.id)
    notify({
      message: 'Disbursement resubmitted successfully',
      color: 'success',
    })
    await fetchDisbursements()
    await fetchStatistics()
  } catch (error: any) {
    notify({
      message: error.message || 'Failed to resubmit disbursement',
      color: 'danger',
    })
  } finally {
    resubmittingId.value = null
  }
}

const handleSearch = () => {
  currentPage.value = 1
  fetchDisbursements()
}

const handleClear = () => {
  filters.value = {
    search: '',
    status: null,
    disbursement_type: null,
    start_date: null,
    end_date: null,
  }
  currentPage.value = 1
  fetchDisbursements()
}

// Modal handlers for details modal
const handleCancelFromDetails = () => {
  showDetailsModal.value = false
  showCancelModal.value = true
}

const handleResubmitFromDetails = async () => {
  if (!selectedDisbursement.value) return
  resubmittingId.value = selectedDisbursement.value.id
  try {
    await disbursementsService.processDisbursement(selectedDisbursement.value.id)
    notify({
      message: 'Disbursement resubmitted successfully',
      color: 'success',
    })
    showDetailsModal.value = false
    await fetchDisbursements()
    await fetchStatistics()
  } catch (error: any) {
    notify({
      message: error.message || 'Failed to resubmit disbursement',
      color: 'danger',
    })
  } finally {
    resubmittingId.value = null
  }
}

const handleCheckStatusFromDetails = async () => {
  if (!selectedDisbursement.value) return
  checkingStatusId.value = selectedDisbursement.value.id
  try {
    const status = await disbursementsService.checkDisbursementStatus(selectedDisbursement.value.id)
    notify({
      message: `Disbursement status updated: ${status.status}`,
      color: 'info',
    })
    // Refresh the list to show updated status
    await fetchDisbursements()
    // Update the selected disbursement in the modal
    const updated = disbursements.value.find((d) => d.id === selectedDisbursement.value?.id)
    if (updated) {
      selectedDisbursement.value = updated
    }
  } catch (error: any) {
    notify({
      message: error.message || 'Failed to check disbursement status',
      color: 'danger',
    })
  } finally {
    checkingStatusId.value = null
  }
}

// Utilities
const formatCurrency = (amount: string | number) => {
  const num = typeof amount === 'string' ? parseFloat(amount) : amount
  return new Intl.NumberFormat('en-TZ', {
    style: 'currency',
    currency: 'TZS',
  }).format(num)
}

const formatDateTime = (dateString: string) => {
  if (!dateString) return 'N/A'
  return new Date(dateString).toLocaleString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  })
}

const formatDateForAPI = (date: Date) => {
  return date.toISOString().split('T')[0]
}

const formatPaymentMethod = (method: string) => {
  return method.replace(/_/g, ' ')
}

const getStatusColor = (status: string) => {
  const colors: Record<string, string> = {
    pending: 'warning',
    processing: 'info',
    completed: 'success',
    failed: 'danger',
  }
  return colors[status] || 'secondary'
}

const getTypeColor = (type: string) => {
  return type === 'consultant' ? 'primary' : 'secondary'
}

// Watchers
watch(currentPage, () => {
  fetchDisbursements()
})

// Lifecycle
onMounted(() => {
  fetchDisbursements()
  fetchStatistics()
})
</script>

<style scoped>
.page-title {
  margin-bottom: 1.5rem;
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
  gap: 1.5rem;
  margin-bottom: 2rem;
}

.stat-card {
  transition:
    transform 0.2s ease,
    box-shadow 0.2s ease;
}

.stat-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 8px 16px rgba(0, 0, 0, 0.1);
}

.stat-item {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.stat-content {
  display: flex;
  flex-direction: column;
}

.stat-value {
  font-size: 1.75rem;
  font-weight: 700;
  color: #1a1a1a;
  line-height: 1.2;
}

.stat-label {
  font-size: 0.875rem;
  color: #6b7280;
  margin-top: 0.25rem;
}

.stat-sublabel {
  font-size: 0.75rem;
  color: #9ca3af;
  margin-top: 0.125rem;
}

@media (max-width: 768px) {
  .stats-grid {
    grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
    gap: 1rem;
  }
}

@media (max-width: 480px) {
  .stats-grid {
    grid-template-columns: 1fr;
  }
}

.action-buttons {
  display: flex;
  gap: 0.5rem;
}

.pagination {
  margin-top: 1.5rem;
  display: flex;
  justify-content: center;
}

.capitalize {
  text-transform: capitalize;
}

.font-semibold {
  font-weight: 600;
}

.text-sm {
  font-size: 0.875rem;
}

.text-xs {
  font-size: 0.75rem;
}

.text-secondary {
  color: var(--va-secondary);
}

.mt-4 {
  margin-top: 1rem;
}
</style>
