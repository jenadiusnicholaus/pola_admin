<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { useCallCredits } from '../../composables'

const { userCredits, isLoading, totalCount, fetchUserCredits, extendUserCredit, grantCredits } = useCallCredits()

const filters = ref<{
  status: 'active' | 'expired' | 'depleted' | ''
  email: string
  bundle_id: number | undefined
  user_id: number | undefined
  active_only: boolean
}>({
  status: '',
  email: '',
  bundle_id: undefined,
  user_id: undefined,
  active_only: false,
})

const showAdvancedFilters = ref(false)

const showGrantModal = ref(false)
const showExtendModal = ref(false)
const selectedCreditId = ref<number | null>(null)

const grantForm = ref({
  user_id: 0,
  minutes: 0,
  validity_days: 30,
  reason: '',
})

const extendForm = ref({
  days: 30,
  reason: '',
})

onMounted(() => {
  fetchUserCredits()
})

const handleSearch = () => {
  const searchFilters: any = {
    ...filters.value,
  }
  // Remove empty values
  if (!searchFilters.status) delete searchFilters.status
  if (!searchFilters.email) delete searchFilters.email
  if (!searchFilters.bundle_id) delete searchFilters.bundle_id
  if (!searchFilters.user_id) delete searchFilters.user_id
  if (!searchFilters.active_only) delete searchFilters.active_only

  fetchUserCredits(searchFilters)
}

const resetFilters = () => {
  filters.value = {
    status: '',
    email: '',
    bundle_id: undefined,
    user_id: undefined,
    active_only: false,
  }
  fetchUserCredits()
}

const handleGrantCredits = async () => {
  try {
    await grantCredits(grantForm.value)
    showGrantModal.value = false
    await fetchUserCredits()
  } catch (error) {
    console.error('Failed to grant credits:', error)
  }
}

const openExtendModal = (credit: any) => {
  selectedCreditId.value = credit.id
  extendForm.value = { days: 30, reason: '' }
  showExtendModal.value = true
}

const handleExtendCredit = async () => {
  try {
    if (selectedCreditId.value) {
      await extendUserCredit(selectedCreditId.value, extendForm.value.days)
    }
    showExtendModal.value = false
    await fetchUserCredits()
  } catch (error) {
    console.error('Failed to extend credit:', error)
  }
}

const columns = [
  { key: 'user_details', label: 'User', sortable: true },
  { key: 'bundle_details', label: 'Bundle', sortable: true },
  { key: 'remaining_minutes', label: 'Minutes Remaining', sortable: true },
  { key: 'status', label: 'Status', sortable: true },
  { key: 'expiry_date', label: 'Expires', sortable: true },
  { key: 'usage_stats', label: 'Usage', sortable: true },
  { key: 'actions', label: 'Actions', width: '150px' },
]

const getStatusColor = (status: string) => {
  if (status === 'active') return 'success'
  if (status === 'expired') return 'danger'
  if (status === 'depleted') return 'warning'
  return 'info'
}

const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  })
}
</script>

<template>
  <div class="user-credits-page">
    <div class="page-header">
      <div>
        <h1 class="page-title">User Call Credits</h1>
        <p class="page-subtitle">Manage user credit assignments and expirations</p>
      </div>
      <VaButton icon="add" color="primary" @click="showGrantModal = true">Grant Credits</VaButton>
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
            :options="['', 'active', 'expired', 'depleted']"
            clearable
          />

          <VaButton @click="handleSearch">Search</VaButton>
          <VaButton preset="secondary" @click="resetFilters">Clear</VaButton>
          <VaButton preset="secondary" icon="tune" @click="showAdvancedFilters = !showAdvancedFilters">
            {{ showAdvancedFilters ? 'Hide' : 'Show' }} Advanced
          </VaButton>
        </div>

        <!-- Advanced Filters -->
        <div v-if="showAdvancedFilters" class="advanced-filters">
          <div class="filter-group">
            <VaInput
              v-model.number="filters.user_id"
              type="number"
              placeholder="User ID"
              clearable
              label="Filter by User ID"
            />

            <VaInput
              v-model.number="filters.bundle_id"
              type="number"
              placeholder="Bundle ID"
              clearable
              label="Filter by Bundle ID"
            />

            <VaCheckbox v-model="filters.active_only" label="Active Credits Only" />
          </div>
        </div>
      </VaCardContent>
    </VaCard>

    <VaCard>
      <VaCardContent>
        <VaDataTable :items="userCredits" :columns="columns" :loading="isLoading" striped hoverable>
          <template #cell(user_details)="{ rowData }">
            <div class="user-cell">
              <VaIcon name="person" size="small" />
              <div class="user-info">
                <div class="user-name">{{ rowData.user_details.full_name || 'No Name' }}</div>
                <div class="user-email">{{ rowData.user_details.email }}</div>
              </div>
            </div>
          </template>

          <template #cell(bundle_details)="{ rowData }">
            <div class="bundle-cell">
              <div class="bundle-name">{{ rowData.bundle_details.name }}</div>
              <div class="bundle-price">TZS {{ rowData.bundle_details.price.toLocaleString() }}</div>
            </div>
          </template>

          <template #cell(remaining_minutes)="{ rowData }">
            <div class="credits-cell">
              <strong>{{ rowData.remaining_minutes }}</strong>
              <span class="credits-total">/ {{ rowData.total_minutes }} min</span>
            </div>
          </template>

          <template #cell(usage_stats)="{ rowData }">
            <div class="usage-cell">
              <VaProgressBar :model-value="rowData.usage_stats.usage_percent" size="small" />
              <span class="usage-text">{{ rowData.usage_stats.usage_percent.toFixed(1) }}% used</span>
            </div>
          </template>

          <template #cell(status)="{ rowData }">
            <VaBadge :text="rowData.status" :color="getStatusColor(rowData.status)" />
          </template>

          <template #cell(expiry_date)="{ rowData }">
            <div class="date-cell">
              <VaIcon name="schedule" size="small" />
              <div class="date-info">
                <div>{{ formatDate(rowData.expiry_date) }}</div>
                <div v-if="rowData.usage_stats.is_valid" class="days-remaining">
                  {{ rowData.usage_stats.days_until_expiry }} days left
                </div>
                <div v-else class="expired-text">Expired</div>
              </div>
            </div>
          </template>

          <template #cell(actions)="{ rowData }">
            <div class="actions-cell">
              <VaButton
                v-if="rowData.status === 'active'"
                preset="plain"
                icon="schedule"
                size="small"
                @click="openExtendModal(rowData)"
              >
                Extend
              </VaButton>
            </div>
          </template>
        </VaDataTable>

        <div class="pagination-info">
          <span>Total: {{ totalCount }} credits</span>
        </div>
      </VaCardContent>
    </VaCard>

    <VaModal v-model="showGrantModal" title="Grant Credits to User" size="medium">
      <div class="modal-form">
        <VaInput
          v-model.number="grantForm.user_id"
          type="number"
          label="User ID"
          placeholder="Enter user ID"
          required
        />

        <VaInput
          v-model.number="grantForm.minutes"
          type="number"
          label="Minutes"
          placeholder="Enter minutes (e.g., 30, 60, 120)"
          min="1"
          required
        />

        <VaInput
          v-model.number="grantForm.validity_days"
          type="number"
          label="Validity (Days)"
          placeholder="30"
          min="1"
          required
        />

        <VaTextarea
          v-model="grantForm.reason"
          label="Reason (Optional)"
          placeholder="Why are you granting these credits?"
        />
      </div>

      <template #footer>
        <VaButton preset="secondary" @click="showGrantModal = false">Cancel</VaButton>
        <VaButton color="primary" @click="handleGrantCredits">Grant Credits</VaButton>
      </template>
    </VaModal>

    <VaModal v-model="showExtendModal" title="Extend Credit Expiration" size="small">
      <div class="modal-form">
        <VaInput v-model="extendForm.days" type="number" label="Extend by (Days)" placeholder="30" min="1" required />

        <VaTextarea
          v-model="extendForm.reason"
          label="Reason"
          placeholder="Why are you extending this credit?"
          required
        />
      </div>

      <template #footer>
        <VaButton preset="secondary" @click="showExtendModal = false">Cancel</VaButton>
        <VaButton color="primary" @click="handleExtendCredit">Extend</VaButton>
      </template>
    </VaModal>
  </div>
</template>

<style scoped>
.user-credits-page {
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
  align-items: center;
  gap: 0.75rem;
}

.user-info {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.user-name {
  font-weight: 600;
  color: #1a1a1a;
}

.user-email {
  font-size: 0.875rem;
  color: #6b7280;
}

.bundle-cell {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.bundle-name {
  font-weight: 600;
  color: #1a1a1a;
}

.bundle-price {
  font-size: 0.875rem;
  color: #6b7280;
}

.credits-cell {
  display: flex;
  align-items: baseline;
  gap: 0.25rem;
}

.credits-total {
  color: #6b7280;
  font-size: 0.875rem;
}

.usage-cell {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  min-width: 120px;
}

.usage-text {
  font-size: 0.875rem;
  color: #6b7280;
}

.date-cell {
  display: flex;
  align-items: flex-start;
  gap: 0.5rem;
}

.date-info {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.days-remaining {
  font-size: 0.875rem;
  color: #10b981;
  font-weight: 500;
}

.expired-text {
  font-size: 0.875rem;
  color: #ef4444;
  font-weight: 500;
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

.advanced-filters {
  margin-top: 1.5rem;
  padding-top: 1.5rem;
  border-top: 1px solid #e5e7eb;
}

.filter-group {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1rem;
  align-items: end;
}

@media (max-width: 768px) {
  .user-credits-page {
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
