<template>
  <div class="verification-page">
    <div class="page-header">
      <VaIcon name="verified_user" size="2.5rem" color="primary" />
      <h1>User Verifications</h1>
      <p>Manage and review user verification requests</p>
    </div>

    <!-- Simple Filter Buttons -->
    <VaCard class="filter-card">
      <VaCardContent>
        <div class="filter-row">
          <div class="filter-buttons">
            <VaButton
              v-for="option in filterOptions"
              :key="option.value"
              :preset="selectedFilter === option.value ? 'primary' : 'secondary'"
              size="small"
              @click="handleFilterChange(option.value)"
            >
              {{ option.label }}
            </VaButton>
          </div>
          <VaButton color="primary" icon="refresh" size="small" :loading="isLoading" @click="manualRefresh">
            Refresh
          </VaButton>
        </div>
      </VaCardContent>
    </VaCard>

    <!-- Loading State -->
    <div v-if="isLoading || verificationStore.loading.verifications" class="loading-container">
      <VaProgressCircle indeterminate size="large" />
      <p>Loading verifications...</p>
    </div>

    <!-- Data Table -->
    <VaCard v-else class="verification-table-card">
      <VaCardContent>
        <VaDataTable
          :items="paginatedData.results"
          :columns="tableColumns"
          :loading="isLoading || verificationStore.loading.verifications"
          :per-page="perPage"
          striped
          hoverable
          class="verification-table"
        >
          <!-- User Column -->
          <template #cell(user_info)="{ rowData }">
            <div class="user-cell">
              <VaAvatar size="small" color="primary" class="mr-2">
                <VaIcon name="person" />
              </VaAvatar>
              <div class="user-details">
                <div class="user-name">{{ rowData.user_name }}</div>
                <div class="user-email">{{ rowData.user_email }}</div>
                <div class="user-role">{{ rowData.user_role?.display }}</div>
              </div>
            </div>
          </template>

          <!-- Status Column -->
          <template #cell(status)="{ rowData }">
            <div class="status-badge-wrapper">
              <div
                class="status-badge"
                :style="{
                  backgroundColor: getBadgeColor(rowData.status),
                  color: getStatusTextColor(rowData.status),
                }"
              >
                {{ rowData.status_display }}
              </div>
            </div>
          </template>

          <!-- Progress Column -->
          <template #cell(progress)="{ rowData }">
            <div class="progress-cell">
              <VaProgressBar
                :model-value="rowData.progress"
                :color="getProgressColor(rowData.progress)"
                size="small"
                class="mb-1"
              />
              <span class="progress-text">{{ rowData.progress }}%</span>
            </div>
          </template>

          <!-- Documents Column -->
          <template #cell(documents)="{ rowData }">
            <div class="documents-cell">
              <VaChip size="small" color="info" class="mr-1"> {{ rowData.documents_summary.total }} Total </VaChip>
              <VaChip size="small" color="success" class="mr-1"> {{ rowData.documents_summary.verified }} ✓ </VaChip>
              <VaChip size="small" color="warning" class="mr-1"> {{ rowData.documents_summary.pending }} ⏳ </VaChip>
              <VaChip v-if="rowData.documents_summary.rejected > 0" size="small" color="danger">
                {{ rowData.documents_summary.rejected }} ✗
              </VaChip>
            </div>
          </template>

          <!-- Current Step Column -->
          <template #cell(current_step)="{ rowData }">
            <div class="current-step-cell">
              <VaChip :color="getStepColor(rowData.current_step)" size="small" class="step-chip">
                {{ rowData.current_step_display }}
              </VaChip>
            </div>
          </template>

          <!-- Days Column -->
          <template #cell(days_since_registration)="{ rowData }">
            <span class="days-cell">{{ rowData.days_since_registration }} days</span>
          </template>

          <!-- Actions Column -->
          <template #cell(actions)="{ rowData }">
            <div class="actions-cell">
              <VaButton size="small" preset="plain" icon="timeline" color="primary" @click="openStepper(rowData)" />
              <VaButton size="small" preset="plain" icon="visibility" color="info" @click="openDetails(rowData)" />
              <VaButton size="small" preset="plain" icon="launch" color="secondary" @click="viewFullDetails(rowData)" />
            </div>
          </template>
        </VaDataTable>

        <!-- Pagination -->
        <div class="pagination-wrapper">
          <VaPagination
            v-model="currentPage"
            :pages="totalPages"
            :visible-pages="5"
            buttons-preset="secondary"
            rounded
            gapped
            border-color="primary"
            @update:modelValue="handlePageChange"
          />
          <div class="pagination-info">
            <span> Showing {{ getShowingStart() }} to {{ getShowingEnd() }} of {{ paginatedData.count }} results </span>
            <VaSelect
              v-model="perPage"
              :options="perPageOptions"
              class="per-page-select"
              @update:modelValue="handlePerPageChange"
            />
          </div>
        </div>
      </VaCardContent>
    </VaCard>

    <!-- Stepper Modal - Temporarily Disabled -->
    <!-- <VaModal v-model="showStepper" title="Verification Stepper" size="large">
      <div v-if="selectedVerification">
        Stepper component removed temporarily
      </div>
    </VaModal> -->

    <!-- Details Modal -->
    <VaModal v-model="showDetails" :title="`Verification Details - ${selectedVerification?.user_name}`" size="large">
      <div v-if="selectedVerification" class="details-content">
        <!-- User Information Section -->
        <VaCard class="info-section">
          <VaCardTitle>User Information</VaCardTitle>
          <VaCardContent>
            <div class="user-info-grid">
              <div class="info-item">
                <VaIcon name="person" class="info-icon" />
                <div>
                  <strong>{{ selectedVerification.user_name }}</strong>
                  <p>{{ selectedVerification.user_email }}</p>
                </div>
              </div>
              <div class="info-item">
                <VaIcon name="phone" class="info-icon" />
                <div>
                  <strong>Phone</strong>
                  <p>{{ selectedVerification.user_phone }}</p>
                </div>
              </div>
              <div class="info-item">
                <VaIcon name="work" class="info-icon" />
                <div>
                  <strong>Role</strong>
                  <p>{{ selectedVerification.user_role?.display }}</p>
                </div>
              </div>
              <div class="info-item">
                <VaIcon name="schedule" class="info-icon" />
                <div>
                  <strong>Days Since Registration</strong>
                  <p>{{ selectedVerification.days_since_registration }} days</p>
                </div>
              </div>
            </div>
          </VaCardContent>
        </VaCard>

        <!-- Status and Progress Section -->
        <VaCard class="progress-section">
          <VaCardTitle>Verification Progress</VaCardTitle>
          <VaCardContent>
            <div class="progress-content">
              <div class="status-display">
                <VaBadge :color="getBadgeColor(selectedVerification.status)" size="large">
                  {{ selectedVerification.status_display }}
                </VaBadge>
                <span class="current-step">Current Step: {{ selectedVerification.current_step_display }}</span>
              </div>
              <div class="progress-bar-section">
                <VaProgressBar
                  :model-value="selectedVerification.progress"
                  :color="getProgressColor(selectedVerification.progress)"
                  size="large"
                />
                <span class="progress-text">{{ selectedVerification.progress }}% Complete</span>
              </div>
            </div>
          </VaCardContent>
        </VaCard>

        <!-- Documents Summary Section -->
        <VaCard class="documents-section">
          <VaCardTitle>Documents Summary</VaCardTitle>
          <VaCardContent>
            <div class="documents-grid">
              <div class="doc-summary-item total">
                <VaIcon name="folder" size="large" />
                <div class="doc-summary-content">
                  <span class="doc-number">{{ selectedVerification.documents_summary.total }}</span>
                  <span class="doc-label">Total Documents</span>
                </div>
              </div>
              <div class="doc-summary-item verified">
                <VaIcon name="check_circle" size="large" />
                <div class="doc-summary-content">
                  <span class="doc-number">{{ selectedVerification.documents_summary.verified }}</span>
                  <span class="doc-label">Verified</span>
                </div>
              </div>
              <div class="doc-summary-item pending">
                <VaIcon name="schedule" size="large" />
                <div class="doc-summary-content">
                  <span class="doc-number">{{ selectedVerification.documents_summary.pending }}</span>
                  <span class="doc-label">Pending</span>
                </div>
              </div>
              <div class="doc-summary-item rejected">
                <VaIcon name="cancel" size="large" />
                <div class="doc-summary-content">
                  <span class="doc-number">{{ selectedVerification.documents_summary.rejected }}</span>
                  <span class="doc-label">Rejected</span>
                </div>
              </div>
            </div>
          </VaCardContent>
        </VaCard>

        <!-- Action Buttons -->
        <div class="modal-actions">
          <VaButton color="primary" icon="visibility" size="large" @click="viewFullDetails(selectedVerification)">
            View Full Details & Steps
          </VaButton>
          <VaButton color="info" icon="timeline" size="large" @click="openStepper(selectedVerification)">
            Open Stepper
          </VaButton>
          <VaButton
            color="success"
            icon="check"
            :loading="verificationStore.loading.actions"
            @click="approveVerification"
          >
            Quick Approve
          </VaButton>
          <VaButton
            color="danger"
            icon="close"
            :loading="verificationStore.loading.actions"
            @click="rejectVerification"
          >
            Quick Reject
          </VaButton>
        </div>
      </div>
    </VaModal>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useToast } from 'vuestic-ui'
import { useVerificationStore } from '../../../../stores/verification-store'
import type { VerificationUser } from '../../../../services/verificationService'

const router = useRouter()
const verificationStore = useVerificationStore()
const { init: showToast } = useToast()
const selectedFilter = ref('all')
const showStepper = ref(false)
const showDetails = ref(false)
const selectedVerification = ref<VerificationUser | null>(null)
const isLoading = ref(false)

// Pagination
const currentPage = ref(1)
const perPage = ref(10)
const paginatedData = ref({
  count: 0,
  results: [] as VerificationUser[],
  next: null as string | null,
  previous: null as string | null,
})

// Per page options
const perPageOptions = [
  { text: '10 per page', value: 10 },
  { text: '25 per page', value: 25 },
  { text: '50 per page', value: 50 },
  { text: '100 per page', value: 100 },
]

// Table columns
const tableColumns = [
  { key: 'user_info', label: 'User', sortable: true, width: '220px' },
  { key: 'status', label: 'Status', sortable: true, width: '140px' },
  { key: 'progress', label: 'Progress', sortable: true, width: '160px' },
  { key: 'documents', label: 'Documents', sortable: false, width: '220px' },
  { key: 'current_step', label: 'Current Step', sortable: true, width: '160px' },
  { key: 'days_since_registration', label: 'Days', sortable: true, width: '90px' },
  { key: 'actions', label: 'Actions', sortable: false, width: '130px' },
]

const filterOptions = [
  { label: 'All', value: 'all' },
  { label: 'Pending', value: 'pending' },
  { label: 'Verified', value: 'verified' },
  { label: 'Rejected', value: 'rejected' },
]

// Computed properties for pagination
const totalPages = computed(() => {
  return Math.ceil(paginatedData.value.count / perPage.value)
})

const getStepColor = (step: string) => {
  switch (step) {
    case 'documents':
      return 'info'
    case 'identity':
      return 'warning'
    case 'contact':
      return 'primary'
    case 'role_specific':
      return 'secondary'
    case 'final':
      return 'success'
    default:
      return 'info'
  }
}

// Pagination helper methods
const getShowingStart = () => {
  return (currentPage.value - 1) * perPage.value + 1
}

const getShowingEnd = () => {
  const end = currentPage.value * perPage.value
  return Math.min(end, paginatedData.value.count)
}

const handlePageChange = (page: number) => {
  currentPage.value = page
  refreshData()
}

const handlePerPageChange = (newPerPage: number) => {
  perPage.value = newPerPage
  currentPage.value = 1
  refreshData()
}

const mockVerifications = [
  {
    id: 1,
    user_id: 1,
    user_name: 'John Doe',
    user_email: 'john@example.com',
    user_phone: '+1234567890',
    user_role: { display: 'Advocate', value: 'advocate' },
    status: 'pending' as const,
    status_display: 'Pending Review',
    current_step: 'documents',
    current_step_display: 'Document Review',
    progress: 40,
    days_since_registration: 5,
    documents_summary: {
      total: 5,
      verified: 2,
      pending: 3,
      rejected: 0,
    },
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: 2,
    user_id: 2,
    user_name: 'Jane Smith',
    user_email: 'jane@example.com',
    user_phone: '+1234567891',
    user_role: { display: 'Lawyer', value: 'lawyer' },
    status: 'verified' as const,
    status_display: 'Verified',
    current_step: 'completed',
    current_step_display: 'Completed',
    progress: 100,
    days_since_registration: 12,
    documents_summary: {
      total: 4,
      verified: 4,
      pending: 0,
      rejected: 0,
    },
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: 3,
    user_id: 3,
    user_name: 'Mike Johnson',
    user_email: 'mike@example.com',
    user_phone: '+1234567892',
    user_role: { display: 'Paralegal', value: 'paralegal' },
    status: 'rejected' as const,
    status_display: 'Rejected',
    current_step: 'documents',
    current_step_display: 'Document Issues',
    progress: 20,
    days_since_registration: 8,
    documents_summary: {
      total: 3,
      verified: 0,
      pending: 0,
      rejected: 3,
    },
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
]

const getBadgeColor = (status: string) => {
  switch (status) {
    case 'verified':
      return '#dcfce7' // Very light green with more saturation
    case 'pending':
      return '#fef3c7' // Very light amber
    case 'rejected':
      return '#fee2e2' // Very light red
    default:
      return '#dbeafe' // Very light blue
  }
}

const getStatusTextColor = (status: string) => {
  switch (status) {
    case 'verified':
      return '#15803d' // Strong green
    case 'pending':
      return '#d97706' // Strong amber/orange
    case 'rejected':
      return '#dc2626' // Strong red
    default:
      return '#2563eb' // Strong blue
  }
}

const refreshData = async () => {
  isLoading.value = true
  try {
    // Call the store method with pagination parameters
    const status = selectedFilter.value === 'all' ? undefined : selectedFilter.value
    await verificationStore.fetchVerifications(currentPage.value, status, perPage.value)

    // Update paginated data with the response
    if (verificationStore.verifications.length > 0) {
      paginatedData.value = {
        count: verificationStore.pagination.totalCount || verificationStore.verifications.length,
        results: verificationStore.verifications,
        next: currentPage.value < verificationStore.pagination.totalPages ? `page=${currentPage.value + 1}` : null,
        previous: currentPage.value > 1 ? `page=${currentPage.value - 1}` : null,
      }
    } else {
      // Use mock data for demo if no real data
      console.log('📊 Using mock data. Filter:', selectedFilter.value)
      const mockData = getMockPaginatedData()
      console.log('📊 Mock data results:', mockData.results.length, 'Total:', mockData.count)
      paginatedData.value = mockData
    }
  } catch (error) {
    console.error('Failed to fetch verifications:', error)
    // Fallback to mock data
    console.log('📊 Error fallback - using mock data. Filter:', selectedFilter.value)
    const mockData = getMockPaginatedData()
    console.log('📊 Mock data results:', mockData.results.length, 'Total:', mockData.count)
    paginatedData.value = mockData
  } finally {
    isLoading.value = false
  }
}

const getMockPaginatedData = () => {
  const allMockData = mockVerifications
  const filteredData =
    selectedFilter.value === 'all' ? allMockData : allMockData.filter((v) => v.status === selectedFilter.value)

  const startIndex = (currentPage.value - 1) * perPage.value
  const endIndex = startIndex + perPage.value
  const paginatedResults = filteredData.slice(startIndex, endIndex)

  return {
    count: filteredData.length,
    results: paginatedResults,
    next: endIndex < filteredData.length ? `page=${currentPage.value + 1}` : null,
    previous: startIndex > 0 ? `page=${currentPage.value - 1}` : null,
  }
}

const handleFilterChange = async (filterValue: string) => {
  selectedFilter.value = filterValue
  currentPage.value = 1 // Reset to first page when filter changes
  await refreshData()
}

const manualRefresh = async () => {
  await refreshData()
  showToast({
    message: 'Data refreshed successfully!',
    color: 'info',
    duration: 2000,
    position: 'top-right',
  })
}

const openStepper = (verification: any) => {
  selectedVerification.value = verification
  showStepper.value = true
}

const openDetails = (verification: any) => {
  selectedVerification.value = verification
  showDetails.value = true
}

const approveVerification = async () => {
  if (!selectedVerification.value) return

  try {
    const response = await verificationStore.approveVerification(selectedVerification.value.id, 'Approved by admin')

    // Show success message
    if (response?.status === 200 || response?.success) {
      showToast({
        message: 'Verification approved successfully!',
        color: 'success',
        duration: 3000,
        position: 'top-right',
      })
    }

    showDetails.value = false

    // Update the selected verification status locally for immediate feedback
    if (selectedVerification.value) {
      selectedVerification.value.status = 'verified'
      selectedVerification.value.status_display = 'Verified'
      selectedVerification.value.progress = 100
    }

    // Refresh the data to show updated status
    await refreshData()
  } catch (error) {
    console.error('❌ Failed to approve verification:', error)
    showToast({
      message: 'Failed to approve verification. Please try again.',
      color: 'danger',
      duration: 4000,
      position: 'top-right',
    })
  }
}

const rejectVerification = async () => {
  if (!selectedVerification.value) return

  try {
    const response = await verificationStore.rejectVerification(selectedVerification.value.id, 'Rejected by admin')

    // Show success message
    if (response?.status === 200 || response?.success) {
      showToast({
        message: 'Verification rejected successfully!',
        color: 'warning',
        duration: 3000,
        position: 'top-right',
      })
    }

    showDetails.value = false

    // Update the selected verification status locally for immediate feedback
    if (selectedVerification.value) {
      selectedVerification.value.status = 'rejected'
      selectedVerification.value.status_display = 'Rejected'
      selectedVerification.value.progress = 0
    }

    // Refresh the data to show updated status
    await refreshData()
  } catch (error) {
    console.error('❌ Failed to reject verification:', error)
    showToast({
      message: 'Failed to reject verification. Please try again.',
      color: 'danger',
      duration: 4000,
      position: 'top-right',
    })
  }
}

const viewFullDetails = (verification?: VerificationUser) => {
  const targetVerification = verification || selectedVerification.value
  if (!targetVerification) {
    console.error('No verification selected for details view')
    return
  }

  if (!targetVerification.id || targetVerification.id === undefined || targetVerification.id === null) {
    console.error('Verification ID is missing or invalid:', targetVerification)
    return
  }

  showDetails.value = false
  router.push(`/admin-verification/verifications/${targetVerification.id}`)
}

const getProgressColor = (progress: number) => {
  if (progress >= 80) return 'success'
  if (progress >= 50) return 'warning'
  return 'danger'
}

onMounted(() => {
  refreshData()
})
</script>

<style scoped>
/* Data Table Styles */
.verification-table-card {
  margin-top: 1rem;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  overflow-x: auto;
}

.verification-table {
  --va-data-table-cell-padding: 12px;
  width: 100%;
  table-layout: fixed;
}

.verification-table :deep(td) {
  overflow: hidden;
  text-overflow: ellipsis;
  vertical-align: middle;
  padding: 0.75rem 0.5rem;
}

.verification-table :deep(th) {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  padding: 0.75rem 0.5rem;
}

/* Status Badge Styles */
.status-badge-wrapper {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 100%;
}

.status-badge {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 0.5rem 1rem !important;
  border-radius: 8px;
  font-size: 0.875rem;
  font-weight: 700;
  white-space: nowrap;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  min-width: 130px;
  max-width: 130px;
  text-align: center;
  letter-spacing: 0.025em;
  transition: all 0.2s ease;
}

.status-badge:hover {
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.15);
  transform: translateY(-1px);
}

.user-cell {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  min-width: 0;
  max-width: 100%;
}

.user-details {
  display: flex;
  flex-direction: column;
  gap: 0.125rem;
  min-width: 0;
  flex: 1;
  overflow: hidden;
}

.user-name {
  font-weight: 600;
  color: var(--va-text-primary);
  font-size: 0.9rem;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.user-email {
  color: var(--va-text-secondary);
  font-size: 0.8rem;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.user-role {
  color: var(--va-text-secondary);
  font-size: 0.75rem;
  font-style: italic;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.progress-cell {
  min-width: 120px;
}

.progress-text {
  font-size: 0.8rem;
  color: var(--va-text-secondary);
  font-weight: 500;
}

.documents-cell {
  display: flex;
  flex-wrap: wrap;
  gap: 0.25rem;
  max-width: 100%;
  overflow: hidden;
}

.current-step-cell {
  display: flex;
  justify-content: center;
  align-items: center;
}

.step-chip {
  min-width: 140px;
  max-width: 140px;
  justify-content: center;
  text-align: center;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.days-cell {
  font-size: 0.85rem;
  color: var(--va-text-secondary);
  white-space: nowrap;
}

.actions-cell {
  display: flex;
  gap: 0.25rem;
  justify-content: center;
  white-space: nowrap;
}

/* Pagination Styles */
.pagination-wrapper {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 1.5rem;
  padding-top: 1rem;
  border-top: 1px solid var(--va-background-border);
}

.pagination-info {
  display: flex;
  align-items: center;
  gap: 1rem;
  font-size: 0.875rem;
  color: var(--va-text-secondary);
}

.per-page-select {
  min-width: 140px;
}

@media (max-width: 768px) {
  .pagination-wrapper {
    flex-direction: column;
    gap: 1rem;
    align-items: stretch;
  }

  .pagination-info {
    justify-content: center;
    flex-wrap: wrap;
  }

  .documents-cell {
    max-width: 150px;
  }

  .user-cell {
    gap: 0.5rem;
  }
}

.info-section {
  background: var(--va-background-secondary);
  border-radius: 8px;
  padding: 1rem;
  margin-bottom: 1rem;
}

.progress-section {
  background: linear-gradient(135deg, var(--va-background-secondary) 0%, var(--va-background-border) 100%);
  border-radius: 8px;
  padding: 1rem;
  margin-bottom: 1rem;
}

.documents-section {
  background: var(--va-background-element);
  border-radius: 8px;
  padding: 1rem;
  margin-bottom: 1rem;
}

.info-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1rem;
}

.info-item {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.doc-summary {
  display: flex;
  gap: 2rem;
  justify-content: space-between;
}

.doc-summary-item {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  flex: 1;
  text-align: center;
}

.doc-summary-content {
  display: flex;
  flex-direction: column;
}

.doc-number {
  font-size: 1.5rem;
  font-weight: bold;
}

.doc-label {
  font-size: 0.8rem;
  opacity: 0.7;
}

.user-info-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1rem;
}

.info-icon {
  margin-right: 0.5rem;
}

.progress-content {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.status-display {
  display: flex;
  align-items: center;
  gap: 1rem;
  margin-bottom: 1rem;
}

.progress-bar-section {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.progress-text {
  font-size: 0.9rem;
  font-weight: 500;
  color: var(--va-text-primary);
}

.documents-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
  gap: 1rem;
}

.verification-page {
  padding: 2rem;
  max-width: 1200px;
  margin: 0 auto;
}

.loading-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 4rem 2rem;
  text-align: center;
  gap: 1rem;
}

.page-header {
  text-align: center;
  margin-bottom: 2rem;
}

.page-header h1 {
  margin: 0.5rem 0;
  font-size: 2rem;
  color: #1a1a1a;
}

.page-header p {
  margin: 0;
  color: #666;
}

.filter-card {
  margin-bottom: 2rem;
}

.filter-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 1rem;
}

.filter-buttons {
  display: flex;
  gap: 0.5rem;
}

.cards-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
  gap: 1.5rem;
}

.verification-item {
  transition: transform 0.2s ease;
}

.verification-item:hover {
  transform: translateY(-2px);
}

.card-top {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 1rem;
}

.user-section {
  display: flex;
  gap: 1rem;
  align-items: center;
}

.user-details h4 {
  margin: 0 0 0.25rem 0;
  font-size: 1.1rem;
  color: #1a1a1a;
}

.user-details p {
  margin: 0.125rem 0;
  font-size: 0.9rem;
  color: #666;
}

.card-middle {
  margin: 1rem 0;
}

.progress-info {
  margin-bottom: 1rem;
}

.progress-info span {
  display: block;
  margin-bottom: 0.5rem;
  font-size: 0.9rem;
  font-weight: 500;
}

.doc-info {
  display: flex;
  justify-content: space-between;
  gap: 1rem;
}

.doc-item {
  text-align: center;
  flex: 1;
}

.doc-number {
  display: block;
  font-size: 1.25rem;
  font-weight: bold;
  color: #1a1a1a;
}

.doc-number.verified {
  color: #22c55e;
}

.doc-number.pending {
  color: #f59e0b;
}

.doc-text {
  display: block;
  font-size: 0.75rem;
  color: #666;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.card-actions {
  display: flex;
  gap: 0.5rem;
  justify-content: center;
}

.details-content {
  padding: 1rem 0;
}

.detail-row {
  display: flex;
  justify-content: space-between;
  padding: 0.5rem 0;
  border-bottom: 1px solid #f0f0f0;
}

.detail-row:last-child {
  border-bottom: none;
}

.modal-actions {
  display: flex;
  gap: 1rem;
  justify-content: center;
  margin-top: 2rem;
  padding-top: 1rem;
  border-top: 1px solid #f0f0f0;
}

@media (max-width: 768px) {
  .verification-page {
    padding: 1rem;
  }

  .cards-grid {
    grid-template-columns: 1fr;
  }

  .filter-row {
    flex-direction: column;
    align-items: stretch;
  }

  .card-actions {
    flex-direction: column;
  }
}
</style>
