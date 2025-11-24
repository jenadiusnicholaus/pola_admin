<template>
  <div class="consultant-requests-page">
    <!-- Page Header -->
    <div class="page-header">
      <div>
        <h1 class="page-title">
          <VaIcon name="how_to_reg" size="large" class="mr-2" />
          Consultant Requests
        </h1>
        <p class="page-subtitle">Review and manage consultant registration requests</p>
      </div>
      <VaButton color="primary" icon="refresh" :loading="loading.requests" @click="refreshData"> Refresh </VaButton>
    </div>

    <!-- Statistics Cards -->
    <div v-if="statistics && statistics.by_status" class="statistics-grid">
      <StatCard
        icon="inbox"
        icon-color="primary"
        icon-bg-color="rgba(var(--va-primary), 0.1)"
        :value="statistics.total_requests"
        label="Total Requests"
        :subtext="`${statistics.approval_rate} approved`"
      />
      <StatCard
        icon="schedule"
        icon-color="warning"
        icon-bg-color="rgba(var(--va-warning), 0.1)"
        :value="statistics.by_status.pending"
        label="Pending Review"
        badge="Action Required"
        badge-color="warning"
      />
      <StatCard
        icon="check_circle"
        icon-color="success"
        icon-bg-color="rgba(var(--va-success), 0.1)"
        :value="statistics.by_status.approved"
        label="Approved"
        :subtext="`${statistics.approval_rate} approval rate`"
      />
      <StatCard
        icon="cancel"
        icon-color="danger"
        icon-bg-color="rgba(var(--va-danger), 0.1)"
        :value="statistics.by_status.rejected"
        label="Rejected"
        :subtext="`${statistics.rejection_rate} rejection rate`"
      />
    </div>

    <!-- Filters -->
    <VaCard class="filters-card">
      <VaCardContent>
        <div class="filters-row">
          <VaInput
            v-model="filters.search"
            placeholder="Search by name or email..."
            class="filter-item"
            clearable
            @update:modelValue="debouncedSearch"
          >
            <template #prepend>
              <VaIcon name="search" />
            </template>
          </VaInput>

          <VaSelect
            v-model="filters.status"
            label="Status"
            :options="statusOptions"
            class="filter-item"
            clearable
            @update:modelValue="applyFilters"
          />

          <VaSelect
            v-model="filters.consultant_type"
            label="Consultant Type"
            :options="consultantTypeOptions"
            class="filter-item"
            clearable
            @update:modelValue="applyFilters"
          />

          <VaSelect
            v-model="filters.ordering"
            label="Sort By"
            :options="orderingOptions"
            class="filter-item"
            @update:modelValue="applyFilters"
          />
        </div>
      </VaCardContent>
    </VaCard>

    <!-- Requests Table -->
    <VaCard>
      <VaCardContent>
        <VaDataTable :items="requests" :columns="tableColumns" :loading="loading.requests" striped hoverable>
          <!-- User Column -->
          <template #cell(user)="{ rowData }">
            <div class="user-cell">
              <VaAvatar size="small" color="primary">
                <VaIcon name="person" />
              </VaAvatar>
              <div class="user-info">
                <div class="user-name">{{ rowData.user_details.full_name }}</div>
                <div class="user-email">{{ rowData.user_details.email }}</div>
              </div>
            </div>
          </template>

          <!-- Type Column -->
          <template #cell(consultant_type)="{ rowData }">
            <VaBadge :text="rowData.consultant_type" color="info" />
          </template>

          <!-- Status Column -->
          <template #cell(status)="{ rowData }">
            <VaBadge :text="rowData.status" :color="getStatusColor(rowData.status)" />
          </template>

          <!-- Consultation Types Column -->
          <template #cell(consultation_types)="{ rowData }">
            <div class="consultation-types">
              <VaChip v-if="rowData.offers_mobile_consultations" size="small" color="success"> Mobile </VaChip>
              <VaChip v-if="rowData.offers_physical_consultations" size="small" color="primary"> Physical </VaChip>
            </div>
          </template>

          <!-- Created Column -->
          <template #cell(created_at)="{ rowData }">
            <span class="date-text">{{ formatDate(rowData.created_at) }}</span>
          </template>

          <!-- Actions Column -->
          <template #cell(actions)="{ rowData }">
            <div class="actions-cell">
              <VaButton size="small" preset="plain" icon="visibility" color="info" @click="viewRequest(rowData)" />
              <VaButton
                v-if="rowData.status === 'pending'"
                size="small"
                preset="plain"
                icon="check"
                color="success"
                :loading="loading.actions"
                @click="approveRequest(rowData.id)"
              />
              <VaButton
                v-if="rowData.status === 'pending'"
                size="small"
                preset="plain"
                icon="close"
                color="danger"
                :loading="loading.actions"
                @click="openRejectDialog(rowData)"
              />
            </div>
          </template>
        </VaDataTable>

        <!-- Pagination -->
        <div v-if="pagination.count > 0" class="pagination-wrapper">
          <VaPagination
            v-model="pagination.currentPage"
            :pages="Math.ceil(pagination.count / pagination.pageSize)"
            :visible-pages="5"
            @update:modelValue="handlePageChange"
          />
          <div class="pagination-info">
            <span> Showing {{ getShowingStart() }} to {{ getShowingEnd() }} of {{ pagination.count }} results </span>
          </div>
        </div>
      </VaCardContent>
    </VaCard>

    <!-- Request Detail Modal -->
    <RequestDetailModal
      v-model="showDetailModal"
      :request="selectedRequest"
      @approve="handleApproveFromModal"
      @reject="openRejectDialog(selectedRequest)"
    />

    <!-- Reject Reason Modal -->
    <VaModal
      v-model="showRejectModal"
      title="Reject Request"
      size="small"
      ok-text="Reject"
      @ok="handleReject"
      @cancel="cancelReject"
    >
      <VaTextarea
        v-model="rejectReason"
        label="Reason for Rejection"
        placeholder="Please provide a reason for rejecting this request..."
        :min-rows="4"
        :error="!!rejectError"
        :error-messages="rejectError ? [rejectError] : []"
      />
    </VaModal>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useToast } from 'vuestic-ui'
import { useConsultantRequestsStore } from '../../stores/consultant-requests-store'
import type { ConsultantRequest } from '../../services/consultantRequestsService'
import StatCard from '../../components/consultations/StatCard.vue'
import RequestDetailModal from '../../components/consultations/RequestDetailModal.vue'

const store = useConsultantRequestsStore()
const { init: showToast } = useToast()

// State
const showDetailModal = ref(false)
const showRejectModal = ref(false)
const rejectReason = ref('')
const rejectError = ref('')
const selectedRequest = ref<ConsultantRequest | null>(null)

// Filters
const filters = ref({
  search: '',
  status: undefined as 'pending' | 'approved' | 'rejected' | undefined,
  consultant_type: undefined as 'advocate' | 'lawyer' | 'paralegal' | undefined,
  ordering: '-created_at',
})

// Computed
const requests = computed(() => store.requests)
const statistics = computed(() => store.requestStatistics)
const pagination = computed(() => store.requestsPagination)
const loading = computed(() => store.loading)

// Options
const statusOptions = [
  { text: 'All Status', value: undefined },
  { text: 'Pending', value: 'pending' },
  { text: 'Approved', value: 'approved' },
  { text: 'Rejected', value: 'rejected' },
]

const consultantTypeOptions = [
  { text: 'All Types', value: undefined },
  { text: 'Advocate', value: 'advocate' },
  { text: 'Lawyer', value: 'lawyer' },
  { text: 'Paralegal', value: 'paralegal' },
]

const orderingOptions = [
  { text: 'Newest First', value: '-created_at' },
  { text: 'Oldest First', value: 'created_at' },
  { text: 'Name A-Z', value: 'user__full_name' },
  { text: 'Name Z-A', value: '-user__full_name' },
]

// Table columns
const tableColumns = [
  { key: 'user', label: 'User', sortable: false },
  { key: 'consultant_type', label: 'Type', sortable: true },
  { key: 'status', label: 'Status', sortable: true },
  { key: 'consultation_types', label: 'Offers', sortable: false },
  { key: 'created_at', label: 'Created', sortable: true },
  { key: 'actions', label: 'Actions', sortable: false },
]

// Methods
const fetchData = async () => {
  await Promise.all([store.fetchRequests(filters.value), store.fetchRequestStatistics()])
}

const refreshData = () => {
  fetchData()
}

const applyFilters = () => {
  store.setRequestsPage(1)
  fetchData()
}

let searchTimeout: NodeJS.Timeout
const debouncedSearch = () => {
  clearTimeout(searchTimeout)
  searchTimeout = setTimeout(() => {
    applyFilters()
  }, 500)
}

const handlePageChange = (page: number) => {
  store.setRequestsPage(page)
  fetchData()
}

const viewRequest = (request: ConsultantRequest) => {
  selectedRequest.value = request
  showDetailModal.value = true
}

const approveRequest = async (id: number) => {
  try {
    await store.approveRequest(id)
    showToast({
      message: 'Request approved successfully',
      color: 'success',
    })
    fetchData()
  } catch (error: any) {
    showToast({
      message: error.message || 'Failed to approve request',
      color: 'danger',
    })
  }
}

const handleApproveFromModal = async () => {
  if (!selectedRequest.value) return

  try {
    await store.approveRequest(selectedRequest.value.id)
    showToast({
      message: 'Request approved successfully',
      color: 'success',
    })
    showDetailModal.value = false
    fetchData()
  } catch (error: any) {
    showToast({
      message: error.message || 'Failed to approve request',
      color: 'danger',
    })
  }
}

const openRejectDialog = (request: ConsultantRequest | null) => {
  if (!request) return
  selectedRequest.value = request
  rejectReason.value = ''
  rejectError.value = ''
  showDetailModal.value = false
  showRejectModal.value = true
}

const handleReject = async () => {
  if (!selectedRequest.value) return

  if (!rejectReason.value.trim()) {
    rejectError.value = 'Please provide a reason for rejection'
    return
  }

  try {
    await store.rejectRequest(selectedRequest.value.id, { reason: rejectReason.value })
    showToast({
      message: 'Request rejected successfully',
      color: 'warning',
    })
    showRejectModal.value = false
    fetchData()
  } catch (error: any) {
    showToast({
      message: error.message || 'Failed to reject request',
      color: 'danger',
    })
  }
}

const cancelReject = () => {
  showRejectModal.value = false
  rejectReason.value = ''
  rejectError.value = ''
}

const getStatusColor = (status: string) => {
  switch (status) {
    case 'pending':
      return 'warning'
    case 'approved':
      return 'success'
    case 'rejected':
      return 'danger'
    default:
      return 'secondary'
  }
}

const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  })
}

const getShowingStart = () => {
  return (pagination.value.currentPage - 1) * pagination.value.pageSize + 1
}

const getShowingEnd = () => {
  const end = pagination.value.currentPage * pagination.value.pageSize
  return Math.min(end, pagination.value.count)
}

onMounted(() => {
  fetchData()
})
</script>

<style scoped>
.consultant-requests-page {
  padding: 1.5rem;
  max-width: 1400px;
  margin: 0 auto;
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 2rem;
}

.page-title {
  display: flex;
  align-items: center;
  font-size: 2rem;
  font-weight: 700;
  margin: 0 0 0.5rem 0;
  color: var(--va-text-primary);
}

.page-subtitle {
  color: var(--va-text-secondary);
  margin: 0;
}

.statistics-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 1.5rem;
  margin-bottom: 2rem;
}

.filters-card {
  margin-bottom: 1.5rem;
}

.filters-row {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1rem;
}

.filter-item {
  min-width: 0;
}

.user-cell {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.user-info {
  display: flex;
  flex-direction: column;
  gap: 0.125rem;
  min-width: 0;
}

.user-name {
  font-weight: 600;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.user-email {
  font-size: 0.875rem;
  color: var(--va-text-secondary);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.consultation-types {
  display: flex;
  gap: 0.5rem;
  flex-wrap: wrap;
}

.date-text {
  font-size: 0.875rem;
  color: var(--va-text-secondary);
}

.actions-cell {
  display: flex;
  gap: 0.25rem;
}

.pagination-wrapper {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 1.5rem;
  padding-top: 1rem;
  border-top: 1px solid var(--va-background-border);
}

.pagination-info {
  font-size: 0.875rem;
  color: var(--va-text-secondary);
}

@media (max-width: 768px) {
  .consultant-requests-page {
    padding: 1rem;
  }

  .page-header {
    flex-direction: column;
    gap: 1rem;
  }

  .statistics-grid {
    grid-template-columns: 1fr;
  }

  .filters-row {
    grid-template-columns: 1fr;
  }

  .pagination-wrapper {
    flex-direction: column;
    gap: 1rem;
  }
}
</style>
