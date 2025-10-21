<template>
  <div class="legal-education-page">
    <h1 class="page-title">Legal Education Hub</h1>

    <!-- Statistics Cards -->
    <div class="stats-grid">
      <VaCard class="stat-card">
        <VaCardContent>
          <div class="stat-item">
            <VaIcon name="library_books" color="primary" size="2.5rem" />
            <div class="stat-content">
              <div class="stat-value">{{ stats.total_topics }}</div>
              <div class="stat-label">Total Topics</div>
            </div>
          </div>
        </VaCardContent>
      </VaCard>

      <VaCard class="stat-card">
        <VaCardContent>
          <div class="stat-item">
            <VaIcon name="topic" color="success" size="2.5rem" />
            <div class="stat-content">
              <div class="stat-value">{{ stats.total_subtopics }}</div>
              <div class="stat-label">Total Subtopics</div>
            </div>
          </div>
        </VaCardContent>
      </VaCard>

      <VaCard class="stat-card">
        <VaCardContent>
          <div class="stat-item">
            <VaIcon name="description" color="info" size="2.5rem" />
            <div class="stat-content">
              <div class="stat-value">{{ stats.total_materials }}</div>
              <div class="stat-label">Total Materials</div>
            </div>
          </div>
        </VaCardContent>
      </VaCard>

      <VaCard class="stat-card">
        <VaCardContent>
          <div class="stat-item">
            <VaIcon name="warning" color="warning" size="2.5rem" />
            <div class="stat-content">
              <div class="stat-value">{{ stats.topics_without_subtopics }}</div>
              <div class="stat-label">Topics Need Subtopics</div>
            </div>
          </div>
        </VaCardContent>
      </VaCard>
    </div>

    <!-- Toolbar -->
    <VaCard class="my-6">
      <VaCardContent>
        <div class="toolbar">
          <div class="search-filters">
            <VaInput v-model="searchQuery" placeholder="Search topics..." clearable>
              <template #prependInner>
                <VaIcon name="search" />
              </template>
            </VaInput>

            <VaSelect v-model="statusFilter" placeholder="Status" :options="statusOptions" clearable />

            <VaButton icon="refresh" @click="loadData">Refresh</VaButton>
          </div>

          <div class="action-buttons">
            <VaButton icon="add" @click="openCreateModal">Create Topic</VaButton>
          </div>
        </div>
      </VaCardContent>
    </VaCard>

    <!-- Topics List -->
    <div v-if="loading" class="loading-container">
      <VaProgressCircle indeterminate />
      <p>Loading topics...</p>
    </div>

    <div v-else-if="topics.length === 0" class="empty-state">
      <VaIcon name="inbox" size="4rem" color="secondary" />
      <p class="empty-message">No topics found</p>
      <VaButton @click="openCreateModal">Create First Topic</VaButton>
    </div>

    <div v-else class="topics-grid">
      <VaCard v-for="topic in topics" :key="topic.id" class="topic-card" :class="{ inactive: !topic.is_active }">
        <VaCardContent>
          <div class="topic-header">
            <div class="topic-icon">{{ topic.icon || '📚' }}</div>
            <VaBadge :text="topic.is_active ? 'Active' : 'Inactive'" :color="topic.is_active ? 'success' : 'danger'" />
          </div>

          <h3 class="topic-title">{{ topic.name }}</h3>
          <p class="topic-subtitle">{{ topic.name_sw }}</p>
          <p class="topic-description">{{ topic.description }}</p>

          <div class="topic-stats">
            <div class="stat-badge">
              <VaIcon name="topic" size="small" />
              <span>{{ topic.subtopics_count }} subtopics</span>
            </div>
            <div class="stat-badge">
              <VaIcon name="description" size="small" />
              <span>{{ topic.materials_count }} materials</span>
            </div>
          </div>

          <div class="topic-actions">
            <VaButton size="small" preset="plain" icon="visibility" @click="viewTopic(topic)">View</VaButton>
            <VaButton size="small" preset="plain" icon="edit" @click="editTopic(topic)">Edit</VaButton>
            <VaButton
              size="small"
              preset="plain"
              :icon="topic.is_active ? 'toggle_on' : 'toggle_off'"
              @click="toggleTopic(topic)"
            >
              Toggle
            </VaButton>
            <VaButton size="small" preset="plain" icon="delete" color="danger" @click="deleteTopic(topic)">
              Delete
            </VaButton>
          </div>
        </VaCardContent>
      </VaCard>
    </div>

    <!-- Create/Edit Modal -->
    <VaModal v-model="showModal" :title="isEditing ? 'Edit Topic' : 'Create Topic'" size="large" hide-default-actions>
      <div class="modal-form">
        <VaInput v-model="form.name" label="Topic Name (English)" required />
        <VaInput v-model="form.name_sw" label="Topic Name (Swahili)" required />
        <VaTextarea v-model="form.description" label="Description (English)" :min-rows="3" />
        <VaTextarea v-model="form.description_sw" label="Description (Swahili)" :min-rows="3" />
        <div class="form-row">
          <VaInput v-model="form.icon" label="Icon (Emoji)" placeholder="📚" />
          <VaInput v-model.number="form.display_order" type="number" label="Display Order" />
        </div>
        <VaCheckbox v-model="form.is_active" label="Active" />
      </div>
      <template #footer>
        <VaButton color="secondary" @click="showModal = false">Cancel</VaButton>
        <VaButton @click="saveTopic">{{ isEditing ? 'Update' : 'Create' }}</VaButton>
      </template>
    </VaModal>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useHubsStore } from '../../stores/hubs-store'
import { useToast } from 'vuestic-ui'

const router = useRouter()
const { init: notify } = useToast()
const hubsStore = useHubsStore()

// Computed from store
const loading = computed(() => hubsStore.loading)
const topics = computed(() => hubsStore.topics)
const stats = computed(() => hubsStore.topicStatistics)

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
  name: '',
  name_sw: '',
  slug: '',
  description: '',
  description_sw: '',
  icon: '📚',
  display_order: 0,
  is_active: true,
})

// Load data
const loadData = async () => {
  try {
    await Promise.all([hubsStore.fetchTopics(), hubsStore.fetchStatistics()])
  } catch (error: any) {
    notify({
      message: error.message || 'Failed to load data',
      color: 'danger',
    })
  }
}

// CRUD Operations
const openCreateModal = () => {
  isEditing.value = false
  editingId.value = null
  form.value = {
    name: '',
    name_sw: '',
    slug: '',
    description: '',
    description_sw: '',
    icon: '📚',
    display_order: topics.value.length,
    is_active: true,
  }
  showModal.value = true
}

const editTopic = (topic: any) => {
  isEditing.value = true
  editingId.value = topic.id
  form.value = {
    name: topic.name,
    name_sw: topic.name_sw,
    slug: topic.slug,
    description: topic.description,
    description_sw: topic.description_sw,
    icon: topic.icon,
    display_order: topic.display_order,
    is_active: topic.is_active,
  }
  showModal.value = true
}

const saveTopic = async () => {
  try {
    if (isEditing.value && editingId.value) {
      // Update
      await hubsStore.updateTopic(editingId.value, form.value)
      notify({ message: 'Topic updated successfully', color: 'success' })
    } else {
      // Create
      await hubsStore.createTopic(form.value)
      notify({ message: 'Topic created successfully', color: 'success' })
    }

    showModal.value = false
  } catch (error: any) {
    notify({
      message: error.message || 'Failed to save topic',
      color: 'danger',
    })
  }
}

const toggleTopic = async (topic: any) => {
  try {
    await hubsStore.toggleTopic(topic.id)
    notify({
      message: `Topic ${topic.is_active ? 'deactivated' : 'activated'}`,
      color: 'success',
    })
  } catch (error: any) {
    notify({
      message: error.message || 'Failed to toggle topic',
      color: 'danger',
    })
  }
}

const deleteTopic = async (topic: any) => {
  if (!confirm(`Delete "${topic.name}"?`)) return

  try {
    await hubsStore.deleteTopic(topic.id)
    notify({ message: 'Topic deleted successfully', color: 'success' })
  } catch (error: any) {
    notify({
      message: error.message || 'Failed to delete topic',
      color: 'danger',
    })
  }
}

const viewTopic = (topic: any) => {
  router.push({ name: 'subtopics', params: { topicId: topic.id } })
}

// Mount
onMounted(() => {
  loadData()
})
</script>

<style scoped>
.legal-education-page {
  padding: 1rem;
}

.page-title {
  font-size: 2rem;
  font-weight: bold;
  margin-bottom: 1.5rem;
}

/* Statistics Grid */
.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 1rem;
  margin-bottom: 1.5rem;
}

.stat-card {
  cursor: pointer;
  transition: transform 0.2s;
}

.stat-card:hover {
  transform: translateY(-2px);
}

.stat-item {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.stat-content {
  flex: 1;
}

.stat-value {
  font-size: 2rem;
  font-weight: bold;
  color: var(--va-primary);
}

.stat-label {
  font-size: 0.875rem;
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

/* Topics Grid */
.topics-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 1rem;
}

.topic-card {
  transition: all 0.3s;
}

.topic-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 8px 16px rgba(0, 0, 0, 0.1);
}

.topic-card.inactive {
  opacity: 0.6;
}

.topic-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
}

.topic-icon {
  font-size: 2rem;
}

.topic-title {
  font-size: 1.25rem;
  font-weight: bold;
  margin: 0.5rem 0;
}

.topic-subtitle {
  font-size: 0.875rem;
  color: var(--va-text-secondary);
  margin: 0 0 0.5rem 0;
}

.topic-description {
  font-size: 0.875rem;
  color: var(--va-text-secondary);
  margin: 0.5rem 0;
  min-height: 3rem;
}

.topic-stats {
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

.topic-actions {
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

.form-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1rem;
}
</style>
