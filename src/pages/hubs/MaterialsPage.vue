<template>
  <div class="materials-page">
    <!-- Header with Back Button -->
    <div class="page-header">
      <VaButton icon="arrow_back" preset="plain" @click="goBack">Back to Subtopics</VaButton>
      <div v-if="selectedSubtopic">
        <h1 class="page-title">{{ selectedSubtopic.name }}</h1>
        <p class="page-subtitle">{{ selectedSubtopic.name_sw }}</p>
      </div>
      <div v-else>
        <h1 class="page-title">Materials</h1>
      </div>
    </div>

    <!-- Toolbar -->
    <VaCard class="my-6">
      <VaCardContent>
        <div class="toolbar">
          <div class="search-filters">
            <VaInput v-model="searchQuery" placeholder="Search materials..." clearable>
              <template #prependInner>
                <VaIcon name="search" />
              </template>
            </VaInput>

            <VaSelect v-model="typeFilter" placeholder="Type" :options="typeOptions" clearable />

            <VaSelect v-model="statusFilter" placeholder="Status" :options="statusOptions" clearable />

            <VaButton icon="refresh" @click="loadData">Refresh</VaButton>
          </div>
        </div>
      </VaCardContent>
    </VaCard>

    <!-- Materials List -->
    <div v-if="loading" class="loading-container">
      <VaProgressCircle indeterminate />
      <p>Loading materials...</p>
    </div>

    <div v-else-if="materials.length === 0" class="empty-state">
      <VaIcon name="inbox" size="4rem" color="secondary" />
      <p class="empty-message">No materials found</p>
    </div>

    <div v-else class="materials-list">
      <VaCard
        v-for="material in materials"
        :key="material.id"
        class="material-card"
        :class="{ inactive: !material.is_active }"
      >
        <VaCardContent>
          <div class="material-header">
            <div class="material-type">
              <VaIcon :name="getMaterialIcon(material.category)" size="2rem" />
              <VaBadge :text="material.category_display || material.category" />
            </div>
            <div class="material-badges">
              <VaBadge v-if="material.is_approved === true" text="Approved" color="success" />
              <VaBadge v-else-if="material.is_approved === false" text="Rejected" color="danger" />
              <VaBadge v-else text="Pending" color="warning" />
              <VaBadge
                :text="material.is_active ? 'Active' : 'Inactive'"
                :color="material.is_active ? 'success' : 'danger'"
              />
              <VaBadge :text="material.uploader_type_display || material.uploader_type" color="info" />
            </div>
          </div>

          <h3 class="material-title">{{ material.title }}</h3>
          <p v-if="material.description" class="material-description">{{ material.description }}</p>

          <div class="material-info">
            <div class="info-item">
              <VaIcon name="person" size="small" />
              <span>
                {{
                  material.uploader?.first_name && material.uploader?.last_name
                    ? `${material.uploader.first_name} ${material.uploader.last_name}`
                    : material.uploader?.email || 'Unknown'
                }}
              </span>
            </div>
            <div class="info-item">
              <VaIcon name="attach_money" size="small" />
              <span>TZS {{ formatPrice(material.price) }}</span>
            </div>
            <div class="info-item">
              <VaIcon name="download" size="small" />
              <span>{{ material.downloads_count || 0 }} downloads</span>
            </div>
            <div class="info-item">
              <VaIcon name="calendar_today" size="small" />
              <span>{{ formatDate(material.created_at) }}</span>
            </div>
            <div v-if="material.file" class="info-item">
              <VaIcon name="attachment" size="small" />
              <span>{{ material.file_size_mb }} MB</span>
            </div>
          </div>

          <div class="material-actions">
            <VaButton v-if="material.file" size="small" preset="plain" icon="download" @click="downloadFile(material)">
              Download
            </VaButton>
            <VaButton size="small" preset="plain" icon="visibility" @click="viewMaterial(material)">View</VaButton>
            <VaButton size="small" preset="plain" icon="edit" @click="editMaterial(material)">Edit</VaButton>
            <VaButton
              v-if="material.is_approved === null"
              size="small"
              preset="plain"
              icon="check"
              color="success"
              @click="approveMaterial(material)"
            >
              Approve
            </VaButton>
            <VaButton
              v-if="material.is_approved === null"
              size="small"
              preset="plain"
              icon="close"
              color="danger"
              @click="rejectMaterial(material)"
            >
              Reject
            </VaButton>
            <VaButton
              size="small"
              preset="plain"
              :icon="material.is_active ? 'toggle_on' : 'toggle_off'"
              @click="toggleMaterial(material)"
            >
              Toggle
            </VaButton>
            <VaButton size="small" preset="plain" icon="delete" color="danger" @click="deleteMaterial(material)">
              Delete
            </VaButton>
          </div>
        </VaCardContent>
      </VaCard>
    </div>

    <!-- View Material Modal -->
    <VaModal v-model="showViewModal" title="Material Details" size="large" hide-default-actions>
      <div v-if="selectedMaterial" class="material-details">
        <div class="detail-row">
          <strong>Title:</strong>
          <span>{{ selectedMaterial.title }}</span>
        </div>
        <div class="detail-row">
          <strong>Description:</strong>
          <span>{{ selectedMaterial.description || 'N/A' }}</span>
        </div>
        <div class="detail-row">
          <strong>Category:</strong>
          <span>{{ selectedMaterial.category_display || selectedMaterial.category }}</span>
        </div>
        <div class="detail-row">
          <strong>Uploader:</strong>
          <span>
            {{
              selectedMaterial.uploader?.first_name && selectedMaterial.uploader?.last_name
                ? `${selectedMaterial.uploader.first_name} ${selectedMaterial.uploader.last_name}`
                : selectedMaterial.uploader?.email || 'Unknown'
            }}
            ({{ selectedMaterial.uploader_type_display }})
          </span>
        </div>
        <div class="detail-row">
          <strong>Price:</strong>
          <span>TZS {{ formatPrice(selectedMaterial.price) }}</span>
        </div>
        <div class="detail-row">
          <strong>Downloads:</strong>
          <span>{{ selectedMaterial.downloads_count || 0 }}</span>
        </div>
        <div class="detail-row">
          <strong>Revenue:</strong>
          <span>TZS {{ formatPrice(selectedMaterial.total_revenue) }}</span>
        </div>
        <div class="detail-row">
          <strong>File:</strong>
          <span v-if="selectedMaterial.file">
            {{ selectedMaterial.file_size_mb }} MB
            <VaButton size="small" @click="downloadFile(selectedMaterial)">Download</VaButton>
          </span>
          <span v-else>No file attached</span>
        </div>
        <div class="detail-row">
          <strong>Status:</strong>
          <span>
            <VaBadge
              :text="selectedMaterial.is_active ? 'Active' : 'Inactive'"
              :color="selectedMaterial.is_active ? 'success' : 'danger'"
            />
            <VaBadge v-if="selectedMaterial.is_approved === true" text="Approved" color="success" class="ml-2" />
            <VaBadge v-else-if="selectedMaterial.is_approved === false" text="Rejected" color="danger" class="ml-2" />
            <VaBadge v-else text="Pending" color="warning" class="ml-2" />
          </span>
        </div>
        <div class="detail-row">
          <strong>Created:</strong>
          <span>{{ formatDate(selectedMaterial.created_at) }}</span>
        </div>
        <div class="detail-row">
          <strong>Updated:</strong>
          <span>{{ formatDate(selectedMaterial.updated_at) }}</span>
        </div>
      </div>

      <template #footer>
        <VaButton color="secondary" @click="showViewModal = false">Close</VaButton>
      </template>
    </VaModal>

    <!-- Edit Material Modal -->
    <VaModal v-model="showEditModal" title="Edit Material" size="large" hide-default-actions>
      <div v-if="editForm" class="modal-form">
        <VaInput v-model="editForm.title" label="Title" required />
        <VaTextarea v-model="editForm.description" label="Description" :min-rows="3" />
        <VaSelect
          v-model="editForm.category"
          label="Category"
          :options="categoryOptions"
          value-by="value"
          text-by="text"
        />
        <VaInput v-model="editForm.price" label="Price (TSh)" type="number" step="0.01" />
        <VaCheckbox v-model="editForm.is_active" label="Active" />
      </div>

      <template #footer>
        <VaButton color="secondary" @click="showEditModal = false">Cancel</VaButton>
        <VaButton @click="saveMaterial">Update Material</VaButton>
      </template>
    </VaModal>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useHubsStore } from '../../stores/hubs-store'
import { useToast } from 'vuestic-ui'
import makeRequest from '../../services/makeRequest'

const route = useRoute()
const router = useRouter()
const { init: notify } = useToast()
const hubsStore = useHubsStore()

// Check if required params exist, if not redirect
if (!route.params.topicId || !route.params.subtopicId) {
  router.replace({ name: 'legal-education' })
}

const topicId = ref<number>(Number(route.params.topicId) || 0)
const subtopicId = ref<number>(Number(route.params.subtopicId) || 0)

// Computed from store
const loading = computed(() => hubsStore.loadingMaterials)
const materials = computed(() => hubsStore.subtopicMaterials)
const selectedSubtopic = computed(() => hubsStore.selectedSubtopic)

// Modal state
const showViewModal = ref(false)
const selectedMaterial = ref<any>(null)
const showEditModal = ref(false)
const editForm = ref<any>(null)

// Filters
const searchQuery = ref('')
const typeFilter = ref<string | null>(null)
const statusFilter = ref<boolean | null>(null)

const typeOptions = [
  { text: 'PDF', value: 'pdf' },
  { text: 'Video', value: 'video' },
  { text: 'Audio', value: 'audio' },
  { text: 'Image', value: 'image' },
  { text: 'Document', value: 'document' },
]

const statusOptions = [
  { text: 'Active', value: true },
  { text: 'Inactive', value: false },
]

const categoryOptions = [
  { text: 'PDF', value: 'pdf' },
  { text: 'Video', value: 'video' },
  { text: 'Audio', value: 'audio' },
  { text: 'Notes', value: 'notes' },
  { text: 'Past Papers', value: 'past_papers' },
  { text: 'Hub Content', value: 'hub_content' },
]

// Load data
const loadData = async () => {
  try {
    // Load subtopics first to get subtopic details
    if (!hubsStore.selectedSubtopic || hubsStore.selectedSubtopic.id !== subtopicId.value) {
      await hubsStore.fetchSubtopics({ topic_id: topicId.value })
    }
    // Then load materials
    await hubsStore.fetchSubtopicMaterials(subtopicId.value)
    // Debug: Check if materials have file property
    console.log('Loaded materials:', hubsStore.subtopicMaterials)
    console.log(
      'Materials with files:',
      hubsStore.subtopicMaterials.filter((m: any) => m.file),
    )
  } catch (error: any) {
    notify({
      message: error.message || 'Failed to load materials',
      color: 'danger',
    })
  }
}

// Navigation
const goBack = () => {
  router.push({ name: 'subtopics', params: { topicId: topicId.value } })
}

// Material Actions
const downloadFile = (material: any) => {
  if (material.file) {
    window.open(material.file, '_blank')
  }
}

const viewMaterial = (material: any) => {
  selectedMaterial.value = material
  showViewModal.value = true
}

const editMaterial = (material: any) => {
  editForm.value = {
    id: material.id,
    title: material.title,
    description: material.description || '',
    category: material.category,
    price: material.price,
    is_active: material.is_active,
  }
  showEditModal.value = true
}

const saveMaterial = async () => {
  if (!editForm.value) return

  try {
    // Call API to update material
    await makeRequest({
      url: `/api/v1/admin/documents/materials/${editForm.value.id}/`,
      method: 'PATCH',
      data: {
        title: editForm.value.title,
        description: editForm.value.description,
        category: editForm.value.category,
        price: editForm.value.price,
        is_active: editForm.value.is_active,
      },
    })

    notify({ message: 'Material updated successfully', color: 'success' })
    showEditModal.value = false
    await loadData()
  } catch (error: any) {
    notify({
      message: error.message || 'Failed to update material',
      color: 'danger',
    })
  }
}

const approveMaterial = async (material: any) => {
  try {
    await hubsStore.approveMaterial(material.id)
    notify({ message: 'Material approved successfully', color: 'success' })
  } catch (error: any) {
    notify({
      message: error.message || 'Failed to approve material',
      color: 'danger',
    })
  }
}

const rejectMaterial = async (material: any) => {
  const reason = prompt('Rejection reason (optional):')
  try {
    await hubsStore.rejectMaterial(material.id, reason || undefined)
    notify({ message: 'Material rejected', color: 'success' })
  } catch (error: any) {
    notify({
      message: error.message || 'Failed to reject material',
      color: 'danger',
    })
  }
}

const toggleMaterial = async (material: any) => {
  try {
    await hubsStore.toggleMaterial(material.id)
    notify({
      message: `Material ${material.is_active ? 'deactivated' : 'activated'}`,
      color: 'success',
    })
  } catch (error: any) {
    notify({
      message: error.message || 'Failed to toggle material',
      color: 'danger',
    })
  }
}

const deleteMaterial = async (material: any) => {
  if (!confirm(`Delete "${material.title}"?`)) return

  try {
    await hubsStore.deleteMaterial(material.id)
    notify({ message: 'Material deleted successfully', color: 'success' })
  } catch (error: any) {
    notify({
      message: error.message || 'Failed to delete material',
      color: 'danger',
    })
  }
}

// Helpers
const getMaterialIcon = (type: string) => {
  if (!type) return 'description'
  const icons: Record<string, string> = {
    pdf: 'picture_as_pdf',
    video: 'video_library',
    audio: 'audio_file',
    image: 'image',
    document: 'description',
  }
  return icons[type.toLowerCase()] || 'description'
}

const formatPrice = (price: number | string) => {
  if (!price && price !== 0) return '0'
  const numPrice = typeof price === 'string' ? parseFloat(price) : price
  return numPrice.toLocaleString()
}

const formatDate = (date: string) => {
  if (!date) return 'N/A'
  return new Date(date).toLocaleDateString()
}

// Mount
onMounted(() => {
  loadData()
})
</script>

<style scoped>
.materials-page {
  padding: 1rem;
}

.page-header {
  margin-bottom: 1.5rem;
}

.page-title {
  font-size: 2rem;
  font-weight: bold;
  margin: 0.5rem 0;
}

.page-subtitle {
  font-size: 1rem;
  color: var(--va-text-secondary);
}

/* Toolbar */
.toolbar {
  display: flex;
  gap: 1rem;
  align-items: center;
  justify-content: space-between;
  flex-wrap: wrap;
}

.search-filters {
  display: flex;
  gap: 1rem;
  flex: 1;
  align-items: center;
}

.search-filters .va-input {
  min-width: 250px;
  flex: 1;
  max-width: 400px;
}

.search-filters .va-select {
  min-width: 150px;
}

/* Materials List */
.materials-list {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.material-card {
  transition: all 0.3s;
}

.material-card:hover {
  transform: translateX(4px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.material-card.inactive {
  opacity: 0.6;
}

.material-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
}

.material-type {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.material-badges {
  display: flex;
  gap: 0.5rem;
}

.material-title {
  font-size: 1.25rem;
  font-weight: bold;
  margin: 0.5rem 0;
}

.material-info {
  display: flex;
  gap: 1.5rem;
  margin: 1rem 0;
  padding: 1rem 0;
  border-top: 1px solid var(--va-background-border);
  border-bottom: 1px solid var(--va-background-border);
}

.info-item {
  display: flex;
  align-items: center;
  gap: 0.25rem;
  font-size: 0.875rem;
  color: var(--va-text-secondary);
}

.material-actions {
  display: flex;
  gap: 0.25rem;
  flex-wrap: wrap;
  margin-top: 1rem;
}

/* Loading & Empty States */
.loading-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 3rem;
  gap: 1rem;
}

.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 4rem;
  text-align: center;
}

.empty-message {
  font-size: 1.125rem;
  color: var(--va-text-secondary);
  margin: 1rem 0;
}

/* Material Details Modal */
.material-details {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.detail-row {
  display: flex;
  gap: 1rem;
  padding: 0.75rem;
  border-bottom: 1px solid var(--va-background-border);
}

.detail-row strong {
  min-width: 150px;
  color: var(--va-text-primary);
}

.detail-row span {
  flex: 1;
  color: var(--va-text-secondary);
}

.material-description {
  color: var(--va-text-secondary);
  margin: 0.5rem 0 1rem 0;
  line-height: 1.5;
}

/* Modal Form */
.modal-form {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}
</style>
