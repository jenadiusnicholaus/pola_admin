<script setup lang="ts">
import { onMounted, ref, computed } from 'vue'
import { useSubscriptions } from '../../../composables'
import { usePlans } from '../../../composables/usePlans'
import type { Subscription } from '../../../services/subscriptionsService'
import { downloadAsCSV } from '../../../services/toCSV'

const {
  subscriptions,
  isLoading,
  fetchSubscriptions,
  totalCount,
  statistics,
  fetchStatistics,
  extendSubscription,
  cancelSubscription,
  activateSubscription,
  createForUser,
} = useSubscriptions()
const { plans, fetchPlans } = usePlans()

const filters = ref({
  status: '',
  email: '',
  plan: '',
  user: '',
  expiring_in_days: '',
  is_trial: '',
  page: 1,
  page_size: 20,
})

// Pagination
const currentPage = ref(1)
const perPage = ref(20)
const totalPages = computed(() => Math.ceil(totalCount.value / perPage.value))

// Modals
const showExtendModal = ref(false)
const showCancelModal = ref(false)
const showDetailsModal = ref(false)
const showCreateModal = ref(false)
const selectedSubscription = ref<Subscription | null>(null)

// Extend form
const extendForm = ref({
  days: 30,
  reason: '',
})

// Cancel form
const cancelForm = ref({
  reason: '',
})

// Create form
const createForm = ref({
  user_id: '',
  plan_id: '',
  auto_renew: true,
})

onMounted(() => {
  fetchSubscriptions()
  fetchPlans()
  fetchStatistics()
})

// Helper to prepare filters for API
const prepareFilters = () => {
  const searchFilters: any = { ...filters.value }
  if (searchFilters.expiring_in_days) {
    searchFilters.expiring_in_days = Number(searchFilters.expiring_in_days)
  }
  if (searchFilters.is_trial) {
    searchFilters.is_trial = searchFilters.is_trial === 'true'
  }
  return searchFilters
}

const handleSearch = () => {
  currentPage.value = 1
  filters.value.page = 1
  fetchSubscriptions(prepareFilters())
}

const handlePageChange = (page: number) => {
  currentPage.value = page
  filters.value.page = page
  fetchSubscriptions(prepareFilters())
}

const resetFilters = () => {
  filters.value = {
    status: '',
    email: '',
    plan: '',
    user: '',
    expiring_in_days: '',
    is_trial: '',
    page: 1,
    page_size: 20,
  }
  currentPage.value = 1
  fetchSubscriptions()
}

// Action handlers
const openExtendModal = (subscription: Subscription) => {
  selectedSubscription.value = subscription
  extendForm.value = { days: 30, reason: '' }
  showExtendModal.value = true
}

const handleExtend = async () => {
  if (!selectedSubscription.value) return
  try {
    await extendSubscription(selectedSubscription.value.id, extendForm.value)
    showExtendModal.value = false
    await Promise.all([fetchSubscriptions(prepareFilters()), fetchStatistics()])
  } catch (error) {
    console.error('Failed to extend subscription:', error)
  }
}

const openCancelModal = (subscription: Subscription) => {
  selectedSubscription.value = subscription
  cancelForm.value = { reason: '' }
  showCancelModal.value = true
}

const handleCancel = async () => {
  if (!selectedSubscription.value) return
  try {
    await cancelSubscription(selectedSubscription.value.id, cancelForm.value)
    showCancelModal.value = false
    await Promise.all([fetchSubscriptions(prepareFilters()), fetchStatistics()])
  } catch (error) {
    console.error('Failed to cancel subscription:', error)
  }
}

const handleActivate = async (subscription: Subscription) => {
  try {
    await activateSubscription(subscription.id)
    await Promise.all([fetchSubscriptions(prepareFilters()), fetchStatistics()])
  } catch (error) {
    console.error('Failed to activate subscription:', error)
  }
}

const openDetailsModal = (subscription: Subscription) => {
  selectedSubscription.value = subscription
  showDetailsModal.value = true
}

const openCreateModal = () => {
  createForm.value = { user_id: '', plan_id: '', auto_renew: true }
  showCreateModal.value = true
}

const handleCreate = async () => {
  if (!createForm.value.user_id || !createForm.value.plan_id) return
  try {
    await createForUser({
      user_id: Number(createForm.value.user_id),
      plan_id: Number(createForm.value.plan_id),
      auto_renew: createForm.value.auto_renew,
    })
    showCreateModal.value = false
    await Promise.all([fetchSubscriptions(prepareFilters()), fetchStatistics()])
  } catch (error) {
    console.error('Failed to create subscription:', error)
  }
}

const exportToCSV = () => {
  const exportData = subscriptions.value.map((sub) => ({
    ID: sub.id,
    User_Email: sub.user_details?.email || '',
    User_Name: sub.user_details?.full_name || '',
    User_ID: sub.user,
    Plan_Name: sub.plan_details?.name || '',
    Plan_Type: sub.plan_details?.type || '',
    Plan_Price: sub.plan_details?.price || '',
    Currency: sub.plan_details?.currency || '',
    Status: sub.status,
    Start_Date: new Date(sub.start_date).toLocaleDateString(),
    End_Date: new Date(sub.end_date).toLocaleDateString(),
    Days_Remaining: sub.usage_stats?.days_remaining || 0,
    Auto_Renew: sub.auto_renew ? 'Yes' : 'No',
    Questions_Used: sub.usage_stats?.questions_used || 0,
    Questions_Limit: sub.usage_stats?.questions_limit || 0,
    Documents_Generated: sub.usage_stats?.documents_generated || 0,
    Documents_Limit: sub.usage_stats?.documents_limit || 0,
    Is_Trial: sub.plan_details?.type === 'free_trial' ? 'Yes' : 'No',
    Is_Active: sub.usage_stats?.is_active ? 'Yes' : 'No',
  }))

  const filename = `subscriptions_${new Date().toISOString().split('T')[0]}.csv`
  downloadAsCSV(exportData, filename)
}

const columns = [
  { key: 'user', label: 'User', sortable: true },
  { key: 'plan', label: 'Plan', sortable: true },
  { key: 'status', label: 'Status', sortable: true },
  { key: 'days_remaining', label: 'Days Left', sortable: true },
  { key: 'start_date', label: 'Start Date', sortable: true },
  { key: 'end_date', label: 'End Date', sortable: true },
  { key: 'auto_renew', label: 'Auto Renew', sortable: true },
  { key: 'actions', label: 'Actions', width: '150px' },
]

const getStatusColor = (status: string) => {
  const colors: Record<string, string> = {
    active: 'success',
    expired: 'danger',
    cancelled: 'warning',
    pending: 'info',
  }
  return colors[status] || 'secondary'
}

const getDaysRemainingColor = (days: number) => {
  if (days <= 0) return 'danger'
  if (days <= 7) return 'warning'
  if (days <= 30) return 'info'
  return 'success'
}
</script>

<template>
  <div class="subscriptions-page">
    <div class="page-header">
      <div>
        <h1 class="page-title">User Subscriptions</h1>
        <p class="page-subtitle">View and manage all user subscriptions</p>
      </div>
      <div class="header-actions">
        <VaButton icon="download" preset="secondary" @click="exportToCSV">Export CSV</VaButton>
        <VaButton icon="add" @click="openCreateModal">Create Subscription</VaButton>
      </div>
    </div>

    <!-- Compact Stats & Filters Section -->
    <VaCard class="compact-section">
      <VaCardContent>
        <!-- Quick Stats Row -->
        <div v-if="statistics" class="quick-stats">
          <div class="stat-item">
            <VaIcon name="group" size="small" />
            <span class="stat-number">{{ statistics.total_subscribers || 0 }}</span>
            <span class="stat-text">Total</span>
          </div>
          <div class="stat-divider"></div>
          <div class="stat-item">
            <VaIcon name="check_circle" size="small" color="success" />
            <span class="stat-number">{{ statistics.active_subscribers || 0 }}</span>
            <span class="stat-text">Active</span>
          </div>
          <div class="stat-divider"></div>
          <div class="stat-item">
            <VaIcon name="cancel" size="small" color="danger" />
            <span class="stat-number">{{ statistics.expired_subscribers || 0 }}</span>
            <span class="stat-text">Expired</span>
          </div>
          <div class="stat-divider"></div>
          <div class="stat-item">
            <VaIcon name="star" size="small" color="warning" />
            <span class="stat-number">{{ statistics.trial_users || 0 }}</span>
            <span class="stat-text">Trial</span>
          </div>
          <div class="stat-divider"></div>
          <div class="stat-item">
            <VaIcon name="attach_money" size="small" />
            <span class="stat-number">{{ statistics.total_revenue || 0 }}</span>
            <span class="stat-text">Revenue</span>
          </div>
        </div>

        <VaDivider />

        <!-- Compact Filters -->
        <div class="compact-filters">
          <VaInput v-model="filters.email" label="Email" placeholder="Search email..." clearable class="filter-input" />

          <VaSelect
            v-model="filters.status"
            label="Status"
            placeholder="All"
            :options="['active', 'expired', 'cancelled', 'pending']"
            clearable
            class="filter-input"
          />

          <VaSelect
            v-model="filters.plan"
            label="Plan"
            placeholder="All plans"
            :options="plans"
            text-by="name"
            value-by="id"
            clearable
            class="filter-input"
          />

          <VaInput v-model="filters.user" label="User ID" placeholder="ID" clearable class="filter-input" />

          <div class="filter-actions-inline">
            <VaButton icon="search" size="small" @click="handleSearch">Filter</VaButton>
            <VaButton icon="refresh" preset="secondary" size="small" @click="resetFilters">Reset</VaButton>
          </div>
        </div>
      </VaCardContent>
    </VaCard>

    <!-- Subscriptions Table -->
    <VaCard>
      <VaCardContent>
        <VaDataTable :items="subscriptions" :columns="columns" :loading="isLoading" striped hoverable>
          <template #cell(user)="{ rowData }">
            <div v-if="rowData.user_details">
              <div class="user-email">{{ rowData.user_details.email }}</div>
              <div class="user-id">User ID: {{ rowData.user }}</div>
              <div v-if="rowData.user_details.full_name" class="user-name">
                {{ rowData.user_details.full_name }}
              </div>
            </div>
            <span v-else class="text-muted">No user data</span>
          </template>

          <template #cell(plan)="{ rowData }">
            <div v-if="rowData.plan_details">
              <div class="plan-name">{{ rowData.plan_details.name }}</div>
              <div class="plan-price">{{ rowData.plan_details.price }} {{ rowData.plan_details.currency }}</div>
              <div class="plan-type">{{ rowData.plan_details.type }}</div>
            </div>
            <span v-else class="text-muted">No plan data</span>
          </template>

          <template #cell(status)="{ rowData }">
            <div class="status-cell">
              <VaBadge :text="rowData.status" :color="getStatusColor(rowData.status)" />
              <VaChip v-if="rowData.plan_details?.type === 'free_trial'" size="small" color="info" outline>
                Trial
              </VaChip>
            </div>
          </template>

          <template #cell(days_remaining)="{ rowData }">
            <VaChip :color="getDaysRemainingColor(rowData.usage_stats?.days_remaining || 0)" size="small">
              {{ rowData.usage_stats?.days_remaining || 0 }}
              {{ rowData.usage_stats?.days_remaining === 1 ? 'day' : 'days' }}
            </VaChip>
          </template>

          <template #cell(auto_renew)="{ rowData }">
            <VaIcon
              :name="rowData.auto_renew ? 'check_circle' : 'cancel'"
              :color="rowData.auto_renew ? 'success' : 'danger'"
            />
          </template>

          <template #cell(start_date)="{ rowData }">
            {{ new Date(rowData.start_date).toLocaleDateString() }}
          </template>

          <template #cell(end_date)="{ rowData }">
            {{ new Date(rowData.end_date).toLocaleDateString() }}
          </template>

          <template #cell(actions)="{ rowData }">
            <div class="actions-cell">
              <VaButton
                preset="plain"
                icon="visibility"
                size="small"
                color="info"
                title="View Details"
                @click="openDetailsModal(rowData)"
              />
              <VaButton
                v-if="rowData.status === 'pending'"
                preset="plain"
                icon="check_circle"
                size="small"
                color="success"
                title="Activate"
                @click="handleActivate(rowData)"
              />
              <VaButton
                v-if="rowData.status === 'active'"
                preset="plain"
                icon="event"
                size="small"
                color="primary"
                title="Extend"
                @click="openExtendModal(rowData)"
              />
              <VaButton
                v-if="rowData.status === 'active'"
                preset="plain"
                icon="cancel"
                size="small"
                color="danger"
                title="Cancel"
                @click="openCancelModal(rowData)"
              />
            </div>
          </template>
        </VaDataTable>

        <!-- Pagination -->
        <div v-if="totalPages > 1" class="pagination-container">
          <VaPagination
            v-model="currentPage"
            :pages="totalPages"
            :visible-pages="5"
            buttons-preset="secondary"
            @update:modelValue="handlePageChange"
          />
          <div class="pagination-info">
            Showing {{ (currentPage - 1) * perPage + 1 }} to {{ Math.min(currentPage * perPage, totalCount) }} of
            {{ totalCount }} subscriptions
          </div>
        </div>
      </VaCardContent>
    </VaCard>

    <!-- Extend Subscription Modal -->
    <VaModal v-model="showExtendModal" title="Extend Subscription" size="small" hide-default-actions>
      <div v-if="selectedSubscription" class="modal-content">
        <p class="modal-info">
          Extending subscription for <strong>{{ selectedSubscription.user_details?.email }}</strong>
        </p>
        <p class="modal-info">
          Plan: <strong>{{ selectedSubscription.plan_details?.name }}</strong>
        </p>
        <p class="modal-info">
          Current End Date: <strong>{{ new Date(selectedSubscription.end_date).toLocaleDateString() }}</strong>
        </p>

        <VaInput v-model.number="extendForm.days" label="Extend by Days" type="number" :min="1" />
        <VaTextarea v-model="extendForm.reason" label="Reason" placeholder="Reason for extension..." :min-rows="3" />
      </div>

      <template #footer>
        <VaButton preset="secondary" @click="showExtendModal = false">Cancel</VaButton>
        <VaButton :disabled="!extendForm.days || !extendForm.reason" @click="handleExtend">Extend</VaButton>
      </template>
    </VaModal>

    <!-- Cancel Subscription Modal -->
    <VaModal v-model="showCancelModal" title="Cancel Subscription" size="small" hide-default-actions>
      <div v-if="selectedSubscription" class="modal-content">
        <VaAlert color="warning" border="top" class="mb-4">
          <p>Are you sure you want to cancel this subscription?</p>
        </VaAlert>

        <p class="modal-info">
          User: <strong>{{ selectedSubscription.user_details?.email }}</strong>
        </p>
        <p class="modal-info">
          Plan: <strong>{{ selectedSubscription.plan_details?.name }}</strong>
        </p>
        <p class="modal-info">
          End Date: <strong>{{ new Date(selectedSubscription.end_date).toLocaleDateString() }}</strong>
        </p>

        <VaTextarea
          v-model="cancelForm.reason"
          label="Cancellation Reason"
          placeholder="Reason for cancellation..."
          :min-rows="3"
        />
      </div>

      <template #footer>
        <VaButton preset="secondary" @click="showCancelModal = false">No, Keep It</VaButton>
        <VaButton color="danger" :disabled="!cancelForm.reason" @click="handleCancel">Yes, Cancel</VaButton>
      </template>
    </VaModal>

    <!-- Subscription Details Modal -->
    <VaModal v-model="showDetailsModal" title="Subscription Details" size="medium" hide-default-actions>
      <div v-if="selectedSubscription" class="modal-content">
        <div class="details-grid">
          <div class="detail-section">
            <h3 class="section-title">User Information</h3>
            <div class="detail-row">
              <span class="detail-label">Email:</span>
              <span class="detail-value">{{ selectedSubscription.user_details?.email }}</span>
            </div>
            <div class="detail-row">
              <span class="detail-label">Full Name:</span>
              <span class="detail-value">{{ selectedSubscription.user_details?.full_name || 'N/A' }}</span>
            </div>
            <div class="detail-row">
              <span class="detail-label">User ID:</span>
              <span class="detail-value">{{ selectedSubscription.user }}</span>
            </div>
            <div class="detail-row">
              <span class="detail-label">Phone:</span>
              <span class="detail-value">{{ selectedSubscription.user_details?.phone || 'N/A' }}</span>
            </div>
          </div>

          <div class="detail-section">
            <h3 class="section-title">Plan Information</h3>
            <div class="detail-row">
              <span class="detail-label">Plan:</span>
              <span class="detail-value">{{ selectedSubscription.plan_details?.name }}</span>
            </div>
            <div class="detail-row">
              <span class="detail-label">Type:</span>
              <span class="detail-value">{{ selectedSubscription.plan_details?.type }}</span>
            </div>
            <div class="detail-row">
              <span class="detail-label">Price:</span>
              <span class="detail-value"
                >{{ selectedSubscription.plan_details?.price }} {{ selectedSubscription.plan_details?.currency }}</span
              >
            </div>
          </div>

          <div class="detail-section">
            <h3 class="section-title">Subscription Status</h3>
            <div class="detail-row">
              <span class="detail-label">Status:</span>
              <VaBadge :text="selectedSubscription.status" :color="getStatusColor(selectedSubscription.status)" />
            </div>
            <div class="detail-row">
              <span class="detail-label">Start Date:</span>
              <span class="detail-value">{{ new Date(selectedSubscription.start_date).toLocaleDateString() }}</span>
            </div>
            <div class="detail-row">
              <span class="detail-label">End Date:</span>
              <span class="detail-value">{{ new Date(selectedSubscription.end_date).toLocaleDateString() }}</span>
            </div>
            <div class="detail-row">
              <span class="detail-label">Days Remaining:</span>
              <span class="detail-value">{{ selectedSubscription.usage_stats?.days_remaining || 0 }} days</span>
            </div>
            <div class="detail-row">
              <span class="detail-label">Auto Renew:</span>
              <VaIcon
                :name="selectedSubscription.auto_renew ? 'check_circle' : 'cancel'"
                :color="selectedSubscription.auto_renew ? 'success' : 'danger'"
              />
            </div>
            <div class="detail-row">
              <span class="detail-label">Active:</span>
              <VaBadge
                :text="selectedSubscription.usage_stats?.is_active ? 'Yes' : 'No'"
                :color="selectedSubscription.usage_stats?.is_active ? 'success' : 'danger'"
              />
            </div>
          </div>

          <div class="detail-section">
            <h3 class="section-title">Usage Statistics</h3>
            <div class="detail-row">
              <span class="detail-label">Questions Used:</span>
              <span class="detail-value"
                >{{ selectedSubscription.usage_stats?.questions_used || 0 }} /
                {{ selectedSubscription.usage_stats?.questions_limit || 0 }}</span
              >
            </div>
            <div class="detail-row">
              <span class="detail-label">Documents Generated:</span>
              <span class="detail-value"
                >{{ selectedSubscription.usage_stats?.documents_generated || 0 }} /
                {{ selectedSubscription.usage_stats?.documents_limit || 0 }}</span
              >
            </div>
            <div class="detail-row">
              <span class="detail-label">Last Reset Date:</span>
              <span class="detail-value">{{
                selectedSubscription.last_reset_date
                  ? new Date(selectedSubscription.last_reset_date).toLocaleDateString()
                  : 'N/A'
              }}</span>
            </div>
          </div>

          <!-- Payment History Section -->
          <div v-if="selectedSubscription.payment_history?.length" class="detail-section payment-history">
            <h3 class="section-title">Payment History ({{ selectedSubscription.payment_history.length }} payments)</h3>
            <div
              v-for="payment in selectedSubscription.payment_history.slice(0, 5)"
              :key="payment.id"
              class="payment-item"
            >
              <div class="payment-row">
                <span class="payment-amount"
                  >{{ payment.amount }} {{ selectedSubscription.plan_details?.currency }}</span
                >
                <VaBadge
                  :text="payment.status"
                  :color="
                    payment.status === 'completed' ? 'success' : payment.status === 'pending' ? 'warning' : 'danger'
                  "
                />
              </div>
              <div class="payment-meta">
                <span>{{ payment.payment_method }}</span>
                <span>{{ new Date(payment.created_at).toLocaleDateString() }}</span>
              </div>
            </div>
            <div v-if="selectedSubscription.payment_history.length > 5" class="payment-more">
              +{{ selectedSubscription.payment_history.length - 5 }} more payments
            </div>
          </div>
        </div>
      </div>

      <template #footer>
        <VaButton @click="showDetailsModal = false">Close</VaButton>
      </template>
    </VaModal>

    <!-- Create Subscription Modal -->
    <VaModal v-model="showCreateModal" title="Create Subscription for User" size="small" hide-default-actions>
      <div class="modal-content">
        <VaInput
          v-model="createForm.user_id"
          label="User ID"
          placeholder="Enter user ID"
          type="number"
          :rules="[(v) => !!v || 'User ID is required']"
        />

        <VaSelect
          v-model="createForm.plan_id"
          label="Select Plan"
          placeholder="Choose a plan"
          :options="plans"
          text-by="name"
          value-by="id"
          :rules="[(v) => !!v || 'Plan is required']"
        >
          <template #content="{ value }">
            <div v-if="value">
              {{ plans.find((p) => p.id === value)?.name }} - {{ plans.find((p) => p.id === value)?.price }}
              {{ plans.find((p) => p.id === value)?.currency }}
            </div>
          </template>
        </VaSelect>

        <VaCheckbox v-model="createForm.auto_renew" label="Enable Auto Renew" />

        <VaAlert color="info" border="left" class="mt-3">
          <p class="mb-0">
            <small
              >This will create a new subscription for the specified user. Make sure the user exists and the plan is
              active.</small
            >
          </p>
        </VaAlert>
      </div>

      <template #footer>
        <VaButton preset="secondary" @click="showCreateModal = false">Cancel</VaButton>
        <VaButton :disabled="!createForm.user_id || !createForm.plan_id" @click="handleCreate"
          >Create Subscription</VaButton
        >
      </template>
    </VaModal>
  </div>
</template>

<style scoped>
.subscriptions-page {
  padding: 0.5rem 0;
}

.page-header {
  margin-bottom: 2rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.header-actions {
  display: flex;
  gap: 1rem;
}

.page-title {
  font-size: 1.75rem;
  font-weight: 700;
  color: #1a1a1a;
  margin: 0 0 0.5rem 0;
}

.page-subtitle {
  font-size: 1rem;
  color: #6b7280;
  margin: 0;
}

/* Compact Stats & Filters Section */
.compact-section {
  margin-bottom: 1.5rem;
}

.quick-stats {
  display: flex;
  align-items: center;
  justify-content: space-around;
  padding: 0.75rem 0;
  gap: 1rem;
}

.stat-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.25rem;
  flex: 1;
  min-width: 0;
}

.stat-number {
  font-size: 1.5rem;
  font-weight: 700;
  color: #1a1a1a;
  line-height: 1;
}

.stat-text {
  font-size: 0.75rem;
  color: #6b7280;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  font-weight: 500;
}

.stat-divider {
  width: 1px;
  height: 40px;
  background: #e5e7eb;
}

.compact-filters {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
  gap: 1rem;
  align-items: end;
  padding-top: 1rem;
}

.filter-input {
  flex: 1;
  min-width: 0;
}

.filter-actions-inline {
  display: flex;
  gap: 0.5rem;
  justify-content: flex-end;
}

.pagination-container {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 1.5rem;
  padding-top: 1rem;
  border-top: 1px solid #e5e7eb;
}

.pagination-info {
  font-size: 0.875rem;
  color: #6b7280;
}

.status-cell {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.user-email {
  font-weight: 600;
  color: #1a1a1a;
  font-size: 0.9rem;
}

.user-id {
  font-size: 0.75rem;
  color: #9ca3af;
  margin-top: 0.125rem;
}

.plan-name {
  font-weight: 600;
  color: #1a1a1a;
  font-size: 0.9rem;
}

.plan-price {
  font-size: 0.875rem;
  color: #10b981;
  font-weight: 500;
  margin-top: 0.125rem;
}

.plan-duration {
  font-size: 0.75rem;
  color: #6b7280;
  margin-top: 0.125rem;
}

.plan-type {
  font-size: 0.75rem;
  color: #6b7280;
  margin-top: 0.125rem;
  text-transform: uppercase;
}

.user-name {
  font-size: 0.75rem;
  color: #6b7280;
  margin-top: 0.125rem;
}

.payment-history {
  grid-column: 1 / -1;
}

.payment-item {
  padding: 0.75rem;
  border: 1px solid #e5e7eb;
  border-radius: 6px;
  margin-bottom: 0.5rem;
  background: #f9fafb;
}

.payment-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 0.5rem;
}

.payment-amount {
  font-weight: 600;
  color: #1a1a1a;
  font-size: 0.95rem;
}

.payment-meta {
  display: flex;
  justify-content: space-between;
  font-size: 0.75rem;
  color: #6b7280;
}

.payment-more {
  text-align: center;
  padding: 0.5rem;
  font-size: 0.875rem;
  color: #6b7280;
  font-style: italic;
}

.text-muted {
  color: #9ca3af;
  font-style: italic;
  font-size: 0.875rem;
}

.actions-cell {
  display: flex;
  gap: 0.5rem;
}

.modal-content {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.modal-info {
  font-size: 0.95rem;
  color: #4b5563;
  margin: 0 0 0.5rem 0;
}

.modal-info strong {
  color: #1a1a1a;
  font-weight: 600;
}

.details-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 2rem;
}

.detail-section {
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  padding: 1.5rem;
}

.section-title {
  font-size: 1rem;
  font-weight: 700;
  color: #1a1a1a;
  margin: 0 0 1rem 0;
  padding-bottom: 0.75rem;
  border-bottom: 2px solid #f59e0b;
}

.detail-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.75rem 0;
  border-bottom: 1px solid #f3f4f6;
}

.detail-row:last-child {
  border-bottom: none;
}

.detail-label {
  font-weight: 500;
  color: #6b7280;
  font-size: 0.875rem;
}

.detail-value {
  font-weight: 600;
  color: #1a1a1a;
  font-size: 0.875rem;
}

@media (max-width: 768px) {
  .page-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 1rem;
  }

  .header-actions {
    width: 100%;
    flex-direction: column;
  }

  .quick-stats {
    flex-wrap: wrap;
    gap: 0.75rem;
  }

  .stat-item {
    flex: 0 0 calc(50% - 0.5rem);
  }

  .stat-divider {
    display: none;
  }

  .compact-filters {
    grid-template-columns: 1fr;
  }

  .filter-actions-inline {
    grid-column: span 1;
  }

  .pagination-container {
    flex-direction: column;
    gap: 1rem;
    align-items: stretch;
  }

  .details-grid {
    grid-template-columns: 1fr;
    gap: 1rem;
  }
}
</style>
