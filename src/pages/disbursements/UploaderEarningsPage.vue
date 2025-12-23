<template>
  <div>
    <h1 class="page-title">Uploader Earnings</h1>

    <!-- Statistics Cards -->
    <div class="stats-grid">
      <VaCard class="stat-card">
        <VaCardContent>
          <div class="stat-item">
            <VaIcon name="attach_money" color="primary" size="2.5rem" />
            <div class="stat-content">
              <div class="stat-value">{{ formatCurrency(totalEarnings) }}</div>
              <div class="stat-label">Total Earnings</div>
            </div>
          </div>
        </VaCardContent>
      </VaCard>

      <VaCard class="stat-card">
        <VaCardContent>
          <div class="stat-item">
            <VaIcon name="check_circle" color="success" size="2.5rem" />
            <div class="stat-content">
              <div class="stat-value">{{ formatCurrency(paidEarnings) }}</div>
              <div class="stat-label">Paid</div>
            </div>
          </div>
        </VaCardContent>
      </VaCard>

      <VaCard class="stat-card">
        <VaCardContent>
          <div class="stat-item">
            <VaIcon name="pending" color="warning" size="2.5rem" />
            <div class="stat-content">
              <div class="stat-value">{{ formatCurrency(unpaidEarnings) }}</div>
              <div class="stat-label">Unpaid</div>
            </div>
          </div>
        </VaCardContent>
      </VaCard>
    </div>

    <!-- Filters -->
    <VaCard class="filters-card">
      <VaCardContent>
        <div class="filters">
          <VaInput v-model="filters.email" placeholder="Search by uploader email..." clearable />

          <VaSelect
            v-model="filters.status"
            placeholder="Status"
            :options="statusOptions"
            clearable
            text-by="text"
            value-by="value"
          />

          <VaDateInput v-model="filters.start_date" placeholder="Start Date" clearable />

          <VaDateInput v-model="filters.end_date" placeholder="End Date" clearable />

          <VaButton @click="handleSearch">Search</VaButton>
          <VaButton color="secondary" @click="handleClear">Clear</VaButton>
        </div>
      </VaCardContent>
    </VaCard>

    <!-- Data Table -->
    <VaCard>
      <VaCardContent>
        <VaDataTable :items="earnings" :columns="columns" :loading="loading" striped hoverable>
          <template #cell(uploader)="{ rowData }">
            <div>
              <div class="font-semibold">{{ rowData.uploader_name }}</div>
              <div class="text-sm text-secondary">{{ rowData.uploader_email }}</div>
            </div>
          </template>

          <template #cell(material_title)="{ rowData }">
            <div class="flex flex-col gap-1">
              <span class="font-semibold">{{ rowData.material_title }}</span>
              <VaBadge :text="'ID: ' + rowData.material" color="info" size="small" />
            </div>
          </template>

          <template #cell(gross_amount)="{ rowData }">
            <span class="font-semibold">{{ formatCurrency(rowData.gross_amount) }}</span>
          </template>

          <template #cell(net_earnings)="{ rowData }">
            <span class="font-semibold text-success">{{ formatCurrency(rowData.net_earnings) }}</span>
          </template>

          <template #cell(platform_commission)="{ rowData }">
            <span class="text-secondary">{{ formatCurrency(rowData.platform_commission) }}</span>
          </template>

          <template #cell(paid_out)="{ rowData }">
            <VaBadge :text="rowData.paid_out ? 'Paid' : 'Pending'" :color="rowData.paid_out ? 'success' : 'warning'" />
          </template>

          <template #cell(created_at)="{ rowData }">
            {{ formatDate(rowData.created_at) }}
          </template>

          <template #cell(actions)="{ rowData }">
            <div class="action-buttons">
              <VaButton
                v-if="!rowData.paid_out"
                size="small"
                color="success"
                :loading="processingId === rowData.id"
                @click="handleMarkAsPaid(rowData)"
              >
                Mark as Paid
              </VaButton>
              <VaBadge v-else text="Paid" color="success" />
            </div>
          </template>
        </VaDataTable>

        <!-- Pagination -->
        <div v-if="totalPages > 1" class="pagination">
          <VaPagination v-model="currentPage" :pages="totalPages" :visible-pages="5" />
        </div>
      </VaCardContent>
    </VaCard>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue'
import { disbursementsService } from '../../services/disbursementsService'
import { useToast } from 'vuestic-ui'
import type { UploaderEarning } from '../../services/disbursementsService'

const { init: notify } = useToast()

// State
const loading = ref(false)
const earnings = ref<UploaderEarning[]>([])
const currentPage = ref(1)
const totalPages = ref(1)
const pageSize = 10

const processingId = ref<number | null>(null)

// Filters
const filters = ref({
  email: '',
  status: null as string | null,
  start_date: null as Date | null,
  end_date: null as Date | null,
})

const statusOptions = [
  { text: 'Pending', value: 'false' },
  { text: 'Paid', value: 'true' },
]

// Table columns
const columns = [
  { key: 'uploader', label: 'Uploader', sortable: false },
  { key: 'material_title', label: 'Material', sortable: true },
  { key: 'gross_amount', label: 'Gross Amount', sortable: true },
  { key: 'net_earnings', label: 'Net Earnings', sortable: true },
  { key: 'platform_commission', label: 'Platform Fee', sortable: true },
  { key: 'paid_out', label: 'Status', sortable: true },
  { key: 'created_at', label: 'Created', sortable: true },
  { key: 'actions', label: 'Actions', sortable: false, width: '150px' },
]

// Computed statistics
const totalEarnings = computed(() => {
  return earnings.value.reduce((sum, earning) => sum + parseFloat(earning.gross_amount), 0)
})

const paidEarnings = computed(() => {
  return earnings.value
    .filter((earning) => earning.paid_out)
    .reduce((sum, earning) => sum + parseFloat(earning.net_earnings), 0)
})

const unpaidEarnings = computed(() => {
  return earnings.value
    .filter((earning) => !earning.paid_out)
    .reduce((sum, earning) => sum + parseFloat(earning.net_earnings), 0)
})

// Fetch data
const fetchEarnings = async () => {
  loading.value = true
  try {
    const params: any = {
      page: currentPage.value,
      page_size: pageSize,
    }

    if (filters.value.status) {
      params.status = filters.value.status
    }

    if (filters.value.email) {
      params.email = filters.value.email
    }

    if (filters.value.start_date) {
      params.start_date = formatDateForAPI(filters.value.start_date)
    }

    if (filters.value.end_date) {
      params.end_date = formatDateForAPI(filters.value.end_date)
    }

    const response = await disbursementsService.getUploaderEarnings(params)
    earnings.value = response.results
    totalPages.value = Math.ceil(response.count / pageSize)
  } catch (error: any) {
    notify({
      message: error.message || 'Failed to fetch uploader earnings',
      color: 'danger',
    })
  } finally {
    loading.value = false
  }
}

// Actions
const handleMarkAsPaid = async (earning: UploaderEarning) => {
  processingId.value = earning.id
  try {
    // This would typically process through a disbursement
    notify({
      message: 'Please use the bulk payout feature to process payments',
      color: 'info',
    })
  } catch (error: any) {
    notify({
      message: error.message || 'Failed to mark as paid',
      color: 'danger',
    })
  } finally {
    processingId.value = null
  }
}

const handleSearch = () => {
  currentPage.value = 1
  fetchEarnings()
}

const handleClear = () => {
  filters.value = {
    email: '',
    status: null,
    start_date: null,
    end_date: null,
  }
  currentPage.value = 1
  fetchEarnings()
}

// Utilities
const formatCurrency = (amount: string | number) => {
  const num = typeof amount === 'string' ? parseFloat(amount) : amount
  return new Intl.NumberFormat('en-TZ', {
    style: 'currency',
    currency: 'TZS',
  }).format(num)
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

// Watchers
watch(currentPage, () => {
  fetchEarnings()
})

// Lifecycle
onMounted(() => {
  fetchEarnings()
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

.filters-card {
  margin: 1.5rem 0;
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
}

@media (max-width: 768px) {
  .filters {
    grid-template-columns: 1fr 1fr;
  }

  .filters > :first-child {
    grid-column: span 2;
  }

  .stats-grid {
    grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
    gap: 1rem;
  }
}

@media (max-width: 480px) {
  .filters {
    grid-template-columns: 1fr;
  }

  .filters > :first-child {
    grid-column: span 1;
  }

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

.font-semibold {
  font-weight: 600;
}

.text-sm {
  font-size: 0.875rem;
}

.text-secondary {
  color: var(--va-secondary);
}

.text-success {
  color: var(--va-success);
}
</style>
