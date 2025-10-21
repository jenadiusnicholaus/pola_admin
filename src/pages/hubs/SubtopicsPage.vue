<template>
  <div class="subtopics-page">
    <!-- Header with Back Button -->
    <div class="page-header">
      <VaButton icon="arrow_back" preset="plain" @click="goBack">Back to Topics</VaButton>
      <div v-if="selectedTopic">
        <h1 class="page-title">{{ selectedTopic.name }}</h1>
        <p class="page-subtitle">{{ selectedTopic.name_sw }}</p>
      </div>
    </div>

    <!-- Toolbar -->
    <VaCard class="my-6">
      <VaCardContent>
        <div class="toolbar">
          <div class="search-filters">
            <VaInput v-model="searchQuery" placeholder="Search subtopics..." clearable>
              <template #prependInner>
                <VaIcon name="search" />
              </template>
            </VaInput>

            <VaSelect v-model="statusFilter" placeholder="Status" :options="statusOptions" clearable />

            <VaButton icon="refresh" @click="loadData">Refresh</VaButton>
          </div>

          <div class="action-buttons">
            <VaButton icon="add" @click="openCreateModal">Create Subtopic</VaButton>
          </div>
        </div>
      </VaCardContent>
    </VaCard>

    <!-- Subtopics List -->
    <div v-if="loading" class="loading-container">
      <VaProgressCircle indeterminate />
      <p>Loading subtopics...</p>
    </div>

    <div v-else-if="subtopics.length === 0" class="empty-state">
      <VaIcon name="inbox" size="4rem" color="secondary" />
      <p class="empty-message">No subtopics found</p>
      <VaButton @click="openCreateModal">Create First Subtopic</VaButton>
    </div>

    <div v-else class="subtopics-grid">
      <VaCard
        v-for="subtopic in subtopics"
        :key="subtopic.id"
        class="subtopic-card"
        :class="{ inactive: !subtopic.is_active }"
      >
        <VaCardContent>
          <div class="subtopic-header">
            <VaBadge
              :text="subtopic.is_active ? 'Active' : 'Inactive'"
              :color="subtopic.is_active ? 'success' : 'danger'"
            />
          </div>

          <h3 class="subtopic-title">{{ subtopic.name }}</h3>
          <p class="subtopic-subtitle">{{ subtopic.name_sw }}</p>
          <p class="subtopic-description">{{ subtopic.description }}</p>

          <div class="subtopic-stats">
            <div class="stat-badge">
              <VaIcon name="description" size="small" />
              <span>{{ subtopic.materials_count }} materials</span>
            </div>
          </div>

          <div class="subtopic-actions">
            <VaButton size="small" preset="plain" icon="visibility" @click="viewMaterials(subtopic)">
              Materials
            </VaButton>
            <VaButton size="small" preset="plain" icon="edit" @click="editSubtopic(subtopic)">Edit</VaButton>
            <VaButton
              size="small"
              preset="plain"
              :icon="subtopic.is_active ? 'toggle_on' : 'toggle_off'"
              @click="toggleSubtopic(subtopic)"
            >
              Toggle
            </VaButton>
            <VaButton size="small" preset="plain" icon="delete" color="danger" @click="deleteSubtopic(subtopic)">
              Delete
            </VaButton>
          </div>
        </VaCardContent>
      </VaCard>
    </div>

    <!-- Create/Edit Modal -->
    <VaModal
      v-model="showModal"
      :title="isEditing ? 'Edit Subtopic' : 'Create Subtopic'"
      size="large"
      hide-default-actions
    >
      <div class="modal-form">
        <VaInput v-model="form.name" label="Subtopic Name (English)" required />
        <VaInput v-model="form.name_sw" label="Subtopic Name (Swahili)" required />
        <VaTextarea v-model="form.description" label="Description (English)" :min-rows="3" />
        <VaTextarea v-model="form.description_sw" label="Description (Swahili)" :min-rows="3" />
        <VaInput v-model.number="form.display_order" type="number" label="Display Order" />
        <VaCheckbox v-model="form.is_active" label="Active" />
      </div>
      <template #footer>
        <VaButton color="secondary" @click="showModal = false">Cancel</VaButton>
        <VaButton @click="saveSubtopic">{{ isEditing ? 'Update' : 'Create' }}</VaButton>
      </template>
    </VaModal>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useHubsStore } from '../../stores/hubs-store'
import { useToast } from 'vuestic-ui'

const route = useRoute()
const router = useRouter()
const { init: notify } = useToast()
const hubsStore = useHubsStore()

// Check if required param exists, if not redirect
if (!route.params.topicId) {
  router.replace({ name: 'legal-education' })
}

const topicId = ref<number>(Number(route.params.topicId) || 0)

// Computed from store
const loading = computed(() => hubsStore.loadingSubtopics)
const subtopics = computed(() => {
  // Filter out any null/undefined values
  return (hubsStore.subtopics || []).filter((s) => s != null)
})
const selectedTopic = computed(() => hubsStore.selectedTopic)

// Filters
const searchQuery = ref('')
const statusFilter = ref<boolean | null>(null)

const statusOptions = [
  { text: 'Active', value: true },
  { text: 'Inactive', value: false },
]

// Modal
const showModal = ref(false)
const isEditing = ref(false)
const editingId = ref<number | null>(null)
const form = ref({
  topic: topicId.value,
  name: '',
  name_sw: '',
  slug: '',
  description: '',
  description_sw: '',
  display_order: 0,
  is_active: true,
})

// Load data
const loadData = async () => {
  try {
    await Promise.all([hubsStore.fetchTopicById(topicId.value), hubsStore.fetchSubtopics({ topic_id: topicId.value })])
  } catch (error: any) {
    notify({
      message: error.message || 'Failed to load data',
      color: 'danger',
    })
  }
}

// Navigation
const goBack = () => {
  router.push({ name: 'legal-education' })
}

// Navigation Actions
const viewMaterials = (subtopic: any) => {
  router.push({ name: 'hubs-materials', params: { topicId: topicId.value, subtopicId: subtopic.id } })
}

// CRUD Operations
const openCreateModal = () => {
  isEditing.value = false
  editingId.value = null
  form.value = {
    topic: topicId.value,
    name: '',
    name_sw: '',
    slug: '',
    description: '',
    description_sw: '',
    display_order: subtopics.value.length,
    is_active: true,
  }
  showModal.value = true
}

const editSubtopic = (subtopic: any) => {
  isEditing.value = true
  editingId.value = subtopic.id
  form.value = {
    topic: topicId.value,
    name: subtopic.name,
    name_sw: subtopic.name_sw,
    slug: subtopic.slug,
    description: subtopic.description,
    description_sw: subtopic.description_sw,
    display_order: subtopic.display_order,
    is_active: subtopic.is_active,
  }
  showModal.value = true
}

const saveSubtopic = async () => {
  try {
    if (isEditing.value && editingId.value) {
      // Update
      await hubsStore.updateSubtopic(editingId.value, form.value)
      notify({ message: 'Subtopic updated successfully', color: 'success' })
    } else {
      // Create
      await hubsStore.createSubtopic(form.value)
      notify({ message: 'Subtopic created successfully', color: 'success' })
    }

    showModal.value = false
    await loadData()
  } catch (error: any) {
    notify({
      message: error.message || 'Failed to save subtopic',
      color: 'danger',
    })
  }
}

const toggleSubtopic = async (subtopic: any) => {
  try {
    await hubsStore.toggleSubtopic(subtopic.id)
    notify({
      message: `Subtopic ${subtopic.is_active ? 'deactivated' : 'activated'}`,
      color: 'success',
    })
  } catch (error: any) {
    notify({
      message: error.message || 'Failed to toggle subtopic',
      color: 'danger',
    })
  }
}

const deleteSubtopic = async (subtopic: any) => {
  if (!confirm(`Delete "${subtopic.name}"?`)) return

  try {
    await hubsStore.deleteSubtopic(subtopic.id)
    notify({ message: 'Subtopic deleted successfully', color: 'success' })
  } catch (error: any) {
    notify({
      message: error.message || 'Failed to delete subtopic',
      color: 'danger',
    })
  }
}

// Mount
onMounted(() => {
  loadData()
})
</script>

<style scoped>
.subtopics-page {
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

.action-buttons {
  display: flex;
  gap: 0.5rem;
  align-items: center;
}

/* Subtopics Grid */
.subtopics-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 1rem;
}

.subtopic-card {
  transition: all 0.3s;
}

.subtopic-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 8px 16px rgba(0, 0, 0, 0.1);
}

.subtopic-card.inactive {
  opacity: 0.6;
}

.subtopic-header {
  display: flex;
  justify-content: flex-end;
  align-items: center;
  margin-bottom: 1rem;
}

.subtopic-title {
  font-size: 1.25rem;
  font-weight: bold;
  margin: 0.5rem 0;
}

.subtopic-subtitle {
  font-size: 0.875rem;
  color: var(--va-text-secondary);
  margin: 0 0 0.5rem 0;
}

.subtopic-description {
  font-size: 0.875rem;
  color: var(--va-text-secondary);
  margin: 0.5rem 0;
  min-height: 3rem;
}

.subtopic-stats {
  display: flex;
  gap: 1rem;
  margin: 1rem 0;
  padding-top: 1rem;
  border-top: 1px solid var(--va-background-border);
}

.stat-badge {
  display: flex;
  align-items: center;
  gap: 0.25rem;
  font-size: 0.875rem;
}

.subtopic-actions {
  display: flex;
  gap: 0.25rem;
  flex-wrap: wrap;
  margin-top: 1rem;
  padding-top: 1rem;
  border-top: 1px solid var(--va-background-border);
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

/* Modal */
.modal-form {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}
</style>
