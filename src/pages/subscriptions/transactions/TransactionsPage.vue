<script setup lang="ts">
import { onMounted, ref, computed } from 'vue'
import transactionsService, { type TransactionFilters, type Transaction } from '../../../services/transactionsService'
import { formatCurrency } from '../../../utils/formatters'

const transactions = ref<Transaction[]>([])
const statistics = ref<any>(null)
const isLoading = ref(false)
const totalCount = ref(0)
const showDetailModal = ref(false)
const selectedTransaction = ref<Transaction | null>(null)

// All available filters according to dev_doc.md
const filters = ref<TransactionFilters>({
  user_id: undefined,
  status: undefined,
  transaction_type: undefined,
  payment_method: undefined,
  date_from: undefined,
  date_to: undefined,
  search: undefined,
  page: 1,
  page_size: 20,
})

// Filter options from dev_doc.md
const statusOptions = [
  { text: 'All Status', value: undefined },
  { text: 'Pending', value: 'pending' },
  { text: 'Completed', value: 'completed' },
  { text: 'Failed', value: 'failed' },
  { text: 'Refunded', value: 'refunded' },
  { text: 'Cancelled', value: 'cancelled' },
]

const transactionTypeOptions = [
  { text: 'All Types', value: undefined },
  { text: 'Subscription', value: 'subscription' },
  { text: 'Consultation', value: 'consultation' },
  { text: 'Learning Material', value: 'learning_material' },
  { text: 'Document', value: 'document' },
  { text: 'Call Credit', value: 'call_credit' },
]

const paymentMethodOptions = [
  { text: 'All Methods', value: undefined },
  { text: 'Mobile Money', value: 'mobile_money' },
  { text: 'Bank Transfer', value: 'bank_transfer' },
  { text: 'Card', value: 'card' },
]

const fetchTransactions = async () => {
  isLoading.value = true
  try {
    const response = await transactionsService.getAll(filters.value)
    transactions.value = response.results
    totalCount.value = response.count
  } catch (error) {
    console.error('Failed to fetch transactions:', error)
  } finally {
    isLoading.value = false
  }
}

const fetchStatistics = async () => {
  try {
    statistics.value = await transactionsService.getStatistics(filters.value)
  } catch (error) {
    console.error('Failed to fetch statistics:', error)
  }
}

const handleSearch = () => {
  filters.value.page = 1 // Reset to first page
  fetchTransactions()
  fetchStatistics()
}

const handleReset = () => {
  filters.value = {
    user_id: undefined,
    status: undefined,
    transaction_type: undefined,
    payment_method: undefined,
    date_from: undefined,
    date_to: undefined,
    search: undefined,
    page: 1,
    page_size: 20,
  }
  fetchTransactions()
  fetchStatistics()
}

onMounted(() => {
  fetchTransactions()
  fetchStatistics()
})

const columns = [
  { key: 'payment_reference', label: 'Reference', sortable: true },
  { key: 'user_details', label: 'User', sortable: false },
  { key: 'transaction_type', label: 'Type', sortable: true },
  { key: 'amount', label: 'Amount', sortable: true },
  { key: 'payment_method', label: 'Method', sortable: false },
  { key: 'status', label: 'Status', sortable: true },
  { key: 'created_at', label: 'Date', sortable: true },
  { key: 'actions', label: 'Actions', width: '80px' },
]

const getStatusColor = (status: string) => {
  const colors: Record<string, string> = {
    completed: 'success',
    pending: 'warning',
    failed: 'danger',
    refunded: 'info',
    cancelled: 'secondary',
  }
  return colors[status] || 'secondary'
}

const getTypeColor = (type: string) => {
  const colors: Record<string, string> = {
    subscription: 'primary',
    consultation: 'info',
    learning_material: 'success',
    document: 'warning',
    call_credit: 'secondary',
  }
  return colors[type] || 'primary'
}

const formatTransactionType = (type: string) => {
  return type.replace(/_/g, ' ').replace(/\b\w/g, (l) => l.toUpperCase())
}

const formatPaymentMethod = (method: string) => {
  return method.replace(/_/g, ' ').replace(/\b\w/g, (l) => l.toUpperCase())
}

const totalRevenue = computed(() => {
  if (!statistics.value) return 0
  return statistics.value.total_revenue || 0
})

const viewTransaction = (transaction: Transaction) => {
  selectedTransaction.value = transaction
  showDetailModal.value = true
}

const closeDetailModal = () => {
  showDetailModal.value = false
  selectedTransaction.value = null
}
</script>

<template>
  <div class="transactions-page">
    <div class="page-header">
      <div>
        <h1 class="page-title">Payment Transactions</h1>
        <p class="page-subtitle">View and filter all payment transactions from users</p>
      </div>
    </div>

    <!-- Statistics Cards -->
    <div v-if="statistics" class="stats-grid">
      <VaCard>
        <VaCardContent>
          <div class="stat-card">
            <VaIcon name="receipt" color="primary" size="large" />
            <div class="stat-info">
              <div class="stat-label">Total Transactions</div>
              <div class="stat-value">{{ statistics.total_transactions.toLocaleString() }}</div>
            </div>
          </div>
        </VaCardContent>
      </VaCard>

      <VaCard>
        <VaCardContent>
          <div class="stat-card">
            <VaIcon name="payments" color="success" size="large" />
            <div class="stat-info">
              <div class="stat-label">Total Revenue</div>
              <div class="stat-value">{{ formatCurrency(totalRevenue) }}</div>
            </div>
          </div>
        </VaCardContent>
      </VaCard>

      <VaCard>
        <VaCardContent>
          <div class="stat-card">
            <VaIcon name="check_circle" color="success" size="large" />
            <div class="stat-info">
              <div class="stat-label">Completed</div>
              <div class="stat-value">
                {{ statistics.by_status.completed ? statistics.by_status.completed.count : 0 }}
              </div>
            </div>
          </div>
        </VaCardContent>
      </VaCard>

      <VaCard>
        <VaCardContent>
          <div class="stat-card">
            <VaIcon name="pending" color="warning" size="large" />
            <div class="stat-info">
              <div class="stat-label">Pending</div>
              <div class="stat-value">{{ statistics.by_status.pending ? statistics.by_status.pending.count : 0 }}</div>
            </div>
          </div>
        </VaCardContent>
      </VaCard>
    </div>

    <!-- Filters -->
    <VaCard class="filters-card">
      <VaCardContent>
        <div class="filters-grid">
          <VaInput v-model="filters.search" label="Search" placeholder="Reference, email..." clearable />

          <VaSelect v-model="filters.status" label="Status" :options="statusOptions" clearable />

          <VaSelect
            v-model="filters.transaction_type"
            label="Transaction Type"
            :options="transactionTypeOptions"
            clearable
          />

          <VaSelect v-model="filters.payment_method" label="Payment Method" :options="paymentMethodOptions" clearable />

          <VaDateInput v-model="filters.date_from" label="Date From" clearable />

          <VaDateInput v-model="filters.date_to" label="Date To" clearable />

          <div class="filter-actions">
            <VaButton icon="search" @click="handleSearch">Search</VaButton>
            <VaButton icon="refresh" preset="secondary" @click="handleReset">Reset</VaButton>
          </div>
        </div>
      </VaCardContent>
    </VaCard>

    <!-- Transactions Table -->
    <VaCard>
      <VaCardContent>
        <div class="table-header">
          <div class="table-title">Transactions ({{ totalCount }})</div>
        </div>

        <VaDataTable :items="transactions" :columns="columns" :loading="isLoading" striped hoverable>
          <template #cell(payment_reference)="{ rowData }">
            <div class="reference-cell">
              <div class="reference-main">{{ rowData.payment_reference }}</div>
              <div v-if="rowData.gateway_reference" class="reference-gateway">{{ rowData.gateway_reference }}</div>
            </div>
          </template>

          <template #cell(user_details)="{ rowData }">
            <div class="user-cell">
              <div class="user-name">{{ rowData.user_details.full_name }}</div>
              <div class="user-email">{{ rowData.user_details.email }}</div>
            </div>
          </template>

          <template #cell(transaction_type)="{ rowData }">
            <VaChip size="small" :color="getTypeColor(rowData.transaction_type)">
              {{ formatTransactionType(rowData.transaction_type) }}
            </VaChip>
          </template>

          <template #cell(amount)="{ rowData }">
            <div class="amount-cell">
              <div class="amount-value">{{ parseFloat(rowData.amount).toLocaleString() }} {{ rowData.currency }}</div>
            </div>
          </template>

          <template #cell(payment_method)="{ rowData }">
            <VaBadge :text="formatPaymentMethod(rowData.payment_method)" color="info" />
          </template>

          <template #cell(status)="{ rowData }">
            <VaBadge :text="rowData.status.toUpperCase()" :color="getStatusColor(rowData.status)" />
          </template>

          <template #cell(created_at)="{ rowData }">
            <div class="date-cell">
              <div>{{ new Date(rowData.created_at).toLocaleDateString() }}</div>
              <div class="date-time">{{ new Date(rowData.created_at).toLocaleTimeString() }}</div>
            </div>
          </template>

          <template #cell(actions)="{ rowData }">
            <VaButton size="small" preset="primary" icon="visibility" @click="viewTransaction(rowData)">View</VaButton>
          </template>
        </VaDataTable>
      </VaCardContent>
    </VaCard>

    <!-- Transaction Detail Modal -->
    <VaModal
      v-model="showDetailModal"
      size="large"
      :title="`Transaction Details - ${selectedTransaction?.payment_reference || ''}`"
      @close="closeDetailModal"
    >
      <div v-if="selectedTransaction" class="transaction-detail">
        <!-- User Information -->
        <div class="detail-section">
          <h3 class="section-title">User Information</h3>
          <div class="detail-grid">
            <div class="detail-item">
              <span class="detail-label">Full Name:</span>
              <span class="detail-value">{{ selectedTransaction.user_details.full_name }}</span>
            </div>
            <div class="detail-item">
              <span class="detail-label">Email:</span>
              <span class="detail-value">{{ selectedTransaction.user_details.email }}</span>
            </div>
            <div class="detail-item">
              <span class="detail-label">User ID:</span>
              <span class="detail-value">{{ selectedTransaction.user }}</span>
            </div>
          </div>
        </div>

        <!-- Transaction Information -->
        <div class="detail-section">
          <h3 class="section-title">Transaction Information</h3>
          <div class="detail-grid">
            <div class="detail-item">
              <span class="detail-label">Payment Reference:</span>
              <span class="detail-value monospace">{{ selectedTransaction.payment_reference }}</span>
            </div>
            <div class="detail-item">
              <span class="detail-label">Gateway Reference:</span>
              <span class="detail-value monospace">{{ selectedTransaction.gateway_reference || 'N/A' }}</span>
            </div>
            <div class="detail-item">
              <span class="detail-label">Type:</span>
              <VaChip :color="getTypeColor(selectedTransaction.transaction_type)" size="small">
                {{ formatTransactionType(selectedTransaction.transaction_type) }}
              </VaChip>
            </div>
            <div class="detail-item">
              <span class="detail-label">Status:</span>
              <VaBadge
                :color="getStatusColor(selectedTransaction.status)"
                :text="selectedTransaction.status.toUpperCase()"
              />
            </div>
            <div class="detail-item">
              <span class="detail-label">Amount:</span>
              <span class="detail-value amount">{{ formatCurrency(parseFloat(selectedTransaction.amount)) }}</span>
            </div>
            <div class="detail-item">
              <span class="detail-label">Payment Method:</span>
              <VaBadge color="info" :text="formatPaymentMethod(selectedTransaction.payment_method)" />
            </div>
          </div>
        </div>

        <!-- Transaction Details -->
        <div v-if="selectedTransaction.transaction_details" class="detail-section">
          <h3 class="section-title">Transaction Details</h3>
          <div class="detail-grid">
            <div v-if="selectedTransaction.transaction_details.phone_number" class="detail-item">
              <span class="detail-label">Phone Number:</span>
              <span class="detail-value">{{ selectedTransaction.transaction_details.phone_number }}</span>
            </div>
            <div v-if="selectedTransaction.transaction_details.account_number" class="detail-item">
              <span class="detail-label">Account Number:</span>
              <span class="detail-value">{{ selectedTransaction.transaction_details.account_number }}</span>
            </div>
            <div v-if="selectedTransaction.transaction_details.provider" class="detail-item">
              <span class="detail-label">Provider:</span>
              <span class="detail-value">{{ selectedTransaction.transaction_details.provider }}</span>
            </div>
          </div>
        </div>

        <!-- Related Items -->
        <div v-if="selectedTransaction.related_items" class="detail-section">
          <h3 class="section-title">Related Items</h3>
          <div class="detail-grid">
            <div v-if="selectedTransaction.related_items.subscription" class="detail-item">
              <span class="detail-label">Subscription ID:</span>
              <span class="detail-value">{{ selectedTransaction.related_items.subscription.id }}</span>
            </div>
            <div v-if="selectedTransaction.related_items.subscription" class="detail-item">
              <span class="detail-label">Plan:</span>
              <span class="detail-value">{{
                selectedTransaction.related_items.subscription.plan_name ||
                selectedTransaction.related_items.subscription.plan
              }}</span>
            </div>
            <div v-if="selectedTransaction.related_items.booking" class="detail-item">
              <span class="detail-label">Booking ID:</span>
              <span class="detail-value">{{ selectedTransaction.related_items.booking.id }}</span>
            </div>
            <div v-if="selectedTransaction.related_items.booking?.consultant" class="detail-item">
              <span class="detail-label">Consultant:</span>
              <span class="detail-value">{{
                typeof selectedTransaction.related_items.booking.consultant === 'object'
                  ? selectedTransaction.related_items.booking.consultant.full_name
                  : selectedTransaction.related_items.booking.consultant
              }}</span>
            </div>
          </div>
        </div>

        <!-- Description -->
        <div v-if="selectedTransaction.description" class="detail-section">
          <h3 class="section-title">Description</h3>
          <p class="description-text">{{ selectedTransaction.description }}</p>
        </div>

        <!-- Timestamps -->
        <div class="detail-section">
          <h3 class="section-title">Timestamps</h3>
          <div class="detail-grid">
            <div class="detail-item">
              <span class="detail-label">Created At:</span>
              <span class="detail-value">{{ new Date(selectedTransaction.created_at).toLocaleString() }}</span>
            </div>
            <div class="detail-item">
              <span class="detail-label">Updated At:</span>
              <span class="detail-value">{{ new Date(selectedTransaction.updated_at).toLocaleString() }}</span>
            </div>
          </div>
        </div>
      </div>

      <template #footer>
        <VaButton color="secondary" @click="closeDetailModal">Close</VaButton>
      </template>
    </VaModal>
  </div>
</template>

<style scoped>
.transactions-page {
  padding: 0.5rem 0;
}

.page-header {
  margin-bottom: 1.5rem;
}

.page-title {
  font-size: 1.5rem;
  font-weight: 700;
  color: #1a1a1a;
  margin: 0 0 0.5rem 0;
}

.page-subtitle {
  font-size: 0.9rem;
  color: #6b7280;
  margin: 0;
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
  gap: 1rem;
  margin-bottom: 1rem;
}

.stat-card {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.stat-info {
  flex: 1;
}

.stat-label {
  font-size: 0.75rem;
  color: var(--va-text-secondary);
  text-transform: uppercase;
  letter-spacing: 0.5px;
  font-weight: 600;
  margin-bottom: 0.25rem;
}

.stat-value {
  font-size: 1.25rem;
  font-weight: 700;
  color: var(--va-primary);
}

.filters-card {
  margin-bottom: 1rem;
}

.filters-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1rem;
  align-items: end;
}

.filter-actions {
  display: flex;
  gap: 0.5rem;
  align-items: end;
}

.table-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
}

.table-title {
  font-size: 1.125rem;
  font-weight: 600;
}

.reference-cell {
  font-family: monospace;
}

.reference-main {
  font-weight: 600;
  font-size: 0.875rem;
}

.reference-gateway {
  font-size: 0.75rem;
  color: var(--va-text-secondary);
}

.user-cell {
  max-width: 200px;
}

.user-name {
  font-weight: 600;
  color: #1a1a1a;
  font-size: 0.875rem;
}

.user-email {
  font-size: 0.75rem;
  color: #6b7280;
  word-break: break-all;
}

.amount-cell {
  text-align: right;
}

.amount-value {
  font-weight: 700;
  color: var(--va-success);
  font-size: 0.9375rem;
}

.date-cell {
  font-size: 0.875rem;
}

.date-time {
  font-size: 0.75rem;
  color: var(--va-text-secondary);
}

@media (max-width: 768px) {
  .filters-grid {
    grid-template-columns: 1fr;
  }

  .filter-actions {
    grid-column: 1 / -1;
  }
}

/* Transaction Detail Modal */
.transaction-detail {
  padding: 0.5rem 0;
}

.detail-section {
  margin-bottom: 1.5rem;
  padding-bottom: 1.5rem;
  border-bottom: 1px solid var(--va-background-border);
}

.detail-section:last-child {
  border-bottom: none;
  margin-bottom: 0;
  padding-bottom: 0;
}

.section-title {
  font-size: 1rem;
  font-weight: 600;
  margin: 0 0 1rem 0;
  color: var(--va-primary);
}

.detail-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1rem;
}

.detail-item {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.detail-label {
  font-size: 0.75rem;
  font-weight: 600;
  text-transform: uppercase;
  color: var(--va-text-secondary);
  letter-spacing: 0.5px;
}

.detail-value {
  font-size: 0.9375rem;
  color: var(--va-text-primary);
}

.detail-value.monospace {
  font-family: monospace;
  font-size: 0.875rem;
}

.detail-value.amount {
  font-weight: 700;
  color: var(--va-success);
  font-size: 1.125rem;
}

.description-text {
  font-size: 0.9375rem;
  line-height: 1.6;
  color: var(--va-text-primary);
  margin: 0;
  padding: 1rem;
  background: var(--va-background-element);
  border-radius: 0.5rem;
}
</style>
