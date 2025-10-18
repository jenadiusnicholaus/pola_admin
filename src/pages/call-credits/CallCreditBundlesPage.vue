<script setup lang="ts">
import { onMounted, ref, computed } from 'vue'
import { useCallCredits } from '../../composables'
import callCreditsService from '../../services/callCreditsService'

const { bundles, isLoading, fetchBundles, createBundle, updateBundle, deleteBundle } = useCallCredits()

const showModal = ref(false)
const isEditMode = ref(false)
const editingBundleId = ref<number | null>(null)

const form = ref({
  name: '',
  name_sw: '',
  description: '',
  description_sw: '',
  minutes: 1,
  price: '',
  currency: 'TZS',
  validity_days: 30,
  is_active: true,
})

onMounted(() => {
  fetchBundles()
})

const modalTitle = computed(() => (isEditMode.value ? 'Edit Bundle' : 'Create Bundle'))
const modalOkText = computed(() => (isEditMode.value ? 'Update' : 'Create'))

const openCreateModal = () => {
  isEditMode.value = false
  editingBundleId.value = null
  resetForm()
  showModal.value = true
}

const openEditModal = (bundle: any) => {
  isEditMode.value = true
  editingBundleId.value = bundle.id
  form.value = {
    name: bundle.name,
    name_sw: bundle.name_sw || '',
    description: bundle.description || '',
    description_sw: bundle.description_sw || '',
    minutes: bundle.minutes,
    price: bundle.price,
    currency: bundle.currency,
    validity_days: bundle.validity_days,
    is_active: bundle.is_active,
  }
  showModal.value = true
}

const resetForm = () => {
  form.value = {
    name: '',
    name_sw: '',
    description: '',
    description_sw: '',
    minutes: 1,
    price: '',
    currency: 'TZS',
    validity_days: 30,
    is_active: true,
  }
}

const handleSave = async () => {
  try {
    // Ensure numeric fields are properly converted
    const formData = {
      ...form.value,
      minutes: Number(form.value.minutes),
      validity_days: Number(form.value.validity_days),
      price: String(form.value.price),
    }

    // Validate required fields
    if (!formData.minutes || formData.minutes < 1) {
      alert('Minutes must be at least 1')
      return
    }
    if (!formData.validity_days || formData.validity_days < 1) {
      alert('Validity days must be at least 1')
      return
    }

    if (isEditMode.value && editingBundleId.value) {
      await updateBundle(editingBundleId.value, formData)
    } else {
      await createBundle(formData)
    }
    showModal.value = false
    resetForm()
    await fetchBundles()
  } catch (error) {
    console.error('Failed to save bundle:', error)
  }
}

const handleDelete = async (bundle: any) => {
  if (confirm(`Are you sure you want to delete the bundle "${bundle.name}"?`)) {
    await deleteBundle(bundle.id)
    await fetchBundles()
  }
}

const toggleActivation = async (bundle: any) => {
  try {
    const newStatus = !bundle.is_active
    const action = newStatus ? 'activate' : 'deactivate'
    if (confirm(`Are you sure you want to ${action} "${bundle.name}"?`)) {
      await callCreditsService.bundles.toggleActivation(bundle.id, newStatus)
      await fetchBundles()
    }
  } catch (error) {
    console.error('Failed to toggle activation:', error)
  }
}

const showPurchasesModal = ref(false)
const selectedBundle = ref<any>(null)
const purchases = ref<any[]>([])
const loadingPurchases = ref(false)

const purchaseColumns = [
  { key: 'user', label: 'User', sortable: true },
  { key: 'purchase_date', label: 'Purchase Date', sortable: true },
  { key: 'price', label: 'Price', sortable: true },
  { key: 'total_minutes', label: 'Minutes', sortable: true },
  { key: 'status', label: 'Status', sortable: true },
]

const getStatusColor = (status: string) => {
  if (status === 'active') return 'success'
  if (status === 'expired') return 'warning'
  if (status === 'depleted') return 'danger'
  return 'secondary'
}

const viewPurchases = async (bundle: any) => {
  selectedBundle.value = bundle
  showPurchasesModal.value = true
  loadingPurchases.value = true
  try {
    const response = await callCreditsService.bundles.getPurchases(bundle.id)
    purchases.value = response.results || response || []
  } catch (error) {
    console.error('Failed to fetch purchases:', error)
    purchases.value = []
  } finally {
    loadingPurchases.value = false
  }
}
</script>

<template>
  <div class="call-credits-page">
    <div class="page-header">
      <div>
        <h1 class="page-title">Call Credit Bundles</h1>
        <p class="page-subtitle">Manage call credit packages for users</p>
      </div>
      <VaButton icon="add" color="primary" @click="openCreateModal">Create Bundle</VaButton>
    </div>

    <div v-if="isLoading" class="loading-container">
      <VaProgressCircle indeterminate />
      <p>Loading bundles...</p>
    </div>

    <div v-else-if="!bundles || bundles.length === 0" class="empty-state">
      <VaIcon name="inbox" size="4rem" color="secondary" />
      <h3>No bundles yet</h3>
      <p>Create your first call credit bundle to get started</p>
      <VaButton icon="add" @click="openCreateModal">Create Your First Bundle</VaButton>
    </div>

    <div v-else class="bundles-grid">
      <VaCard v-for="bundle in bundles" :key="bundle.id" class="bundle-card">
        <VaCardTitle>
          <div class="bundle-header">
            <div>
              <h3 class="bundle-name">{{ bundle.name }}</h3>
              <VaBadge v-if="bundle.is_active" text="Active" color="success" />
              <VaBadge v-else text="Inactive" color="danger" />
            </div>
            <div class="bundle-actions">
              <VaButton
                preset="plain"
                :icon="bundle.is_active ? 'toggle_on' : 'toggle_off'"
                size="small"
                :color="bundle.is_active ? 'success' : 'secondary'"
                @click="toggleActivation(bundle)"
              />
              <VaButton preset="plain" icon="edit" size="small" @click="openEditModal(bundle)" />
              <VaButton preset="plain" icon="history" size="small" color="info" @click="viewPurchases(bundle)" />
              <VaButton preset="plain" icon="delete" size="small" color="danger" @click="handleDelete(bundle)" />
            </div>
          </div>
        </VaCardTitle>
        <VaCardContent>
          <p v-if="bundle.description" class="bundle-description">{{ bundle.description }}</p>
          <p v-else class="bundle-description bundle-description--empty">No description provided</p>

          <div class="bundle-price-section">
            <div class="price-amount">
              <span class="currency">{{ bundle.currency }}</span>
              <span class="price">{{ parseFloat(bundle.price).toLocaleString() }}</span>
            </div>
            <div class="credits-info">
              <VaIcon name="phone" size="small" />
              <span>{{ bundle.minutes }} Minutes</span>
            </div>
          </div>

          <div class="bundle-details">
            <div class="detail-item">
              <VaIcon name="schedule" size="small" />
              <span>Valid for {{ bundle.validity_days }} days</span>
            </div>
          </div>
        </VaCardContent>
      </VaCard>
    </div>

    <!-- Create/Edit Modal -->
    <VaModal v-model="showModal" size="medium" :title="modalTitle" @ok="handleSave" @cancel="showModal = false">
      <div class="modal-form">
        <div class="form-row">
          <VaInput v-model="form.name" label="Bundle Name (English)" placeholder="e.g., Starter Pack" required />
          <VaInput
            v-model="form.name_sw"
            label="Bundle Name (Swahili)"
            placeholder="e.g., Kifurushi cha Kuanza"
            required
          />
        </div>

        <div class="form-row">
          <VaTextarea v-model="form.description" label="Description (English)" placeholder="Brief description" />
          <VaTextarea v-model="form.description_sw" label="Description (Swahili)" placeholder="Maelezo mafupi" />
        </div>

        <div class="form-row">
          <VaInput v-model.number="form.minutes" type="number" label="Minutes" placeholder="100" min="1" required />
          <VaInput v-model="form.price" type="text" label="Price (TZS)" placeholder="5000" required />
        </div>

        <VaInput
          v-model.number="form.validity_days"
          type="number"
          label="Validity (Days)"
          placeholder="30"
          min="1"
          required
        />

        <VaSwitch v-model="form.is_active" label="Active" />
      </div>

      <template #footer>
        <VaButton preset="secondary" @click="showModal = false">Cancel</VaButton>
        <VaButton color="primary" @click="handleSave">{{ modalOkText }}</VaButton>
      </template>
    </VaModal>

    <!-- Purchases History Modal -->
    <VaModal v-model="showPurchasesModal" size="large" :title="`Purchase History - ${selectedBundle?.name || ''}`">
      <div v-if="loadingPurchases" class="loading-container">
        <VaProgressCircle indeterminate />
        <p>Loading purchases...</p>
      </div>

      <div v-else-if="purchases.length === 0" class="empty-state">
        <VaIcon name="shopping_cart" size="large" />
        <p>No purchases found for this bundle yet.</p>
      </div>

      <div v-else class="purchases-list">
        <VaDataTable :items="purchases" :columns="purchaseColumns">
          <template #cell(user)="{ rowData }">
            <div class="user-info">
              <div>{{ rowData.user_details?.full_name || 'N/A' }}</div>
              <div class="text-secondary">{{ rowData.user_details?.email || '' }}</div>
            </div>
          </template>

          <template #cell(purchase_date)="{ rowData }">
            {{ new Date(rowData.purchase_date).toLocaleDateString() }}
          </template>

          <template #cell(price)="{ rowData }">
            {{ rowData.bundle_details?.currency || 'TZS' }}
            {{ parseFloat(rowData.bundle_details?.price || 0).toLocaleString() }}
          </template>

          <template #cell(status)="{ rowData }">
            <VaBadge :text="rowData.status" :color="getStatusColor(rowData.status)" />
          </template>
        </VaDataTable>
      </div>

      <template #footer>
        <VaButton preset="secondary" @click="showPurchasesModal = false">Close</VaButton>
      </template>
    </VaModal>
  </div>
</template>

<style scoped>
.call-credits-page {
  padding: 2rem;
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
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

.loading-container,
.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 4rem 2rem;
  text-align: center;
}

.empty-state h3 {
  margin: 1rem 0 0.5rem 0;
  color: #1a1a1a;
}

.empty-state p {
  color: #6b7280;
  margin: 0 0 2rem 0;
}

.bundles-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
  gap: 1.5rem;
}

.bundle-card {
  transition:
    transform 0.2s,
    box-shadow 0.2s;
}

.bundle-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 8px 16px rgba(0, 0, 0, 0.1);
}

.bundle-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
}

.bundle-name {
  font-size: 1.25rem;
  font-weight: 700;
  color: #1a1a1a;
  margin: 0 0 0.5rem 0;
}

.bundle-actions {
  display: flex;
  gap: 0.25rem;
}

.bundle-description {
  color: #6b7280;
  font-size: 0.875rem;
  line-height: 1.5;
  margin: 0 0 1.5rem 0;
}

.bundle-description--empty {
  font-style: italic;
  opacity: 0.6;
}

.bundle-price-section {
  background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%);
  border-radius: 12px;
  padding: 1.5rem;
  margin-bottom: 1.5rem;
  color: white;
}

.price-amount {
  display: flex;
  align-items: baseline;
  gap: 0.5rem;
  margin-bottom: 0.75rem;
}

.currency {
  font-size: 1rem;
  font-weight: 600;
  opacity: 0.9;
}

.price {
  font-size: 2rem;
  font-weight: 700;
  line-height: 1;
}

.credits-info {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.875rem;
  opacity: 0.9;
}

.bundle-details {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.detail-item {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  color: #6b7280;
  font-size: 0.875rem;
}

.modal-form {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
  padding: 1rem 0;
}

.form-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1rem;
}

.purchases-list {
  max-height: 500px;
  overflow-y: auto;
}

.user-info {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.text-secondary {
  font-size: 0.875rem;
  color: #6b7280;
}

@media (max-width: 768px) {
  .call-credits-page {
    padding: 1rem;
  }

  .page-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 1rem;
  }

  .bundles-grid {
    grid-template-columns: 1fr;
  }

  .form-row {
    grid-template-columns: 1fr;
  }
}
</style>
