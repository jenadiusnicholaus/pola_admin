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
            <VaIcon name="description" color="info" size="2.5rem" />
            <div class="stat-content">
              <div class="stat-value">{{ stats.total_materials }}</div>
              <div class="stat-label">Total Materials</div>
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

            <VaSelect
              v-model="statusFilter"
              placeholder="Status"
              :options="statusOptions"
              text-by="text"
              value-by="value"
              clearable
            />

            <VaButton icon="refresh" preset="secondary" @click="loadData" />
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

    <div v-else-if="filteredTopics.length === 0" class="empty-state">
      <VaIcon name="inbox" size="4rem" color="secondary" />
      <p class="empty-message">No topics found</p>
      <VaButton @click="openCreateModal">Create First Topic</VaButton>
    </div>

    <div v-else class="topics-grid">
      <VaCard
        v-for="topic in filteredTopics"
        :key="topic.id"
        class="topic-card"
        :class="{ inactive: !topic.is_active }"
      >
        <!-- Language panel split -->
        <div class="topic-lang-panels">
          <!-- Swahili panel -->
          <div class="lang-panel lang-panel--sw" @click="viewTopicByLang(topic, 'sw')">
            <div class="lang-flag">🇹🇿</div>
            <div class="lang-label">Swahili</div>
            <h3 class="lang-title">{{ topic.name_sw }}</h3>
            <p class="lang-description">{{ topic.description_sw || topic.description }}</p>
            <div class="lang-cta">
              <VaIcon name="arrow_forward" size="small" />
              <span>Tazama Nyaraka</span>
            </div>
          </div>

          <!-- Divider -->
          <div class="lang-divider" />

          <!-- English panel -->
          <div class="lang-panel lang-panel--en" @click="viewTopicByLang(topic, 'en')">
            <div class="lang-flag">🇬🇧</div>
            <div class="lang-label">English</div>
            <h3 class="lang-title">{{ topic.name }}</h3>
            <p class="lang-description">{{ topic.description }}</p>
            <div class="lang-cta">
              <VaIcon name="arrow_forward" size="small" />
              <span>View Materials</span>
            </div>
          </div>
        </div>

        <!-- Footer with stats + actions -->
        <VaCardContent class="topic-footer">
          <div class="topic-footer-row">
            <div class="topic-status">
              <VaBadge
                :text="topic.is_active ? 'Active' : 'Inactive'"
                :color="topic.is_active ? 'success' : 'danger'"
              />
              <span class="stat-badge">
                <VaIcon name="description" size="small" />
                {{ topic.materials_count }} materials
              </span>
            </div>
            <div class="topic-actions">
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

const filteredTopics = computed(() => {
  const q = searchQuery.value.trim().toLowerCase()
  return topics.value.filter((t) => {
    const matchesSearch =
      !q ||
      t.name?.toLowerCase().includes(q) ||
      t.name_sw?.toLowerCase().includes(q) ||
      t.description?.toLowerCase().includes(q) ||
      t.description_sw?.toLowerCase().includes(q)
    const matchesStatus = statusFilter.value === null || t.is_active === statusFilter.value
    return matchesSearch && matchesStatus
  })
})

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
  const maxOrder = topics.value.reduce((max, t) => Math.max(max, t.display_order ?? 0), -1)
  form.value = {
    name: '',
    name_sw: '',
    slug: '',
    description: '',
    description_sw: '',
    icon: '📚',
    display_order: maxOrder + 1,
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

    await loadData()
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
    await loadData()
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
    await loadData()
    notify({ message: 'Topic deleted successfully', color: 'success' })
  } catch (error: any) {
    notify({
      message: error.message || 'Failed to delete topic',
      color: 'danger',
    })
  }
}

const viewTopicByLang = (topic: any, lang: 'en' | 'sw') => {
  console.log('Clicked viewTopicByLang:', topic, lang)
  router.push({ name: 'subtopics', params: { topicId: String(topic.id) }, query: { language: lang } })
}

// Mount
onMounted(() => {
  loadData()
})
</script>

<style scoped>
.legal-education-page {
  padding: 0.5rem;
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

@media (min-width: 1024px) {
  .stats-grid {
    grid-template-columns: repeat(4, 1fr);
  }
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
  width: 100%;
}

.search-filters {
  display: flex !important;
  flex-direction: row !important;
  flex-wrap: nowrap !important;
  gap: 1rem;
  flex: 1;
  align-items: center;
}

.search-filters :deep(.va-input),
.search-filters :deep(.va-select) {
  min-width: 150px;
  flex: 1;
}

@media (min-width: 768px) {
  .search-filters :deep(.va-input) {
    max-width: 400px;
  }
}

.toolbar :deep(.va-button) {
  flex-shrink: 0;
  white-space: nowrap;
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
  gap: 0.75rem;
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
  padding: 2rem;
  text-align: center;
}

@media (min-width: 768px) {
  .empty-state {
    padding: 4rem;
  }
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
/* Language Split Panels */
.topic-lang-panels {
  display: flex;
  min-height: 180px;
  overflow: hidden;
  border-radius: 6px 6px 0 0;
}

.lang-panel {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 0.4rem;
  padding: 1.2rem 1rem;
  cursor: pointer;
  transition:
    background 0.2s,
    transform 0.15s;
}

.lang-panel--sw {
  background: linear-gradient(135deg, #e8f5e9 0%, #c8e6c9 100%);
  border-right: 2px solid var(--va-background-border);
}

.lang-panel--sw:hover {
  background: linear-gradient(135deg, #c8e6c9 0%, #a5d6a7 100%);
  transform: scale(1.02);
}

.lang-panel--en {
  background: linear-gradient(135deg, #e3f2fd 0%, #bbdefb 100%);
}

.lang-panel--en:hover {
  background: linear-gradient(135deg, #bbdefb 0%, #90caf9 100%);
  transform: scale(1.02);
}

.lang-flag {
  font-size: 1.5rem;
  line-height: 1;
}

.lang-label {
  font-size: 0.7rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  color: var(--va-text-secondary);
}

.lang-title {
  font-size: 1rem;
  font-weight: bold;
  margin: 0;
  line-height: 1.3;
}

.lang-description {
  font-size: 0.8rem;
  color: var(--va-text-secondary);
  flex: 1;
  overflow: hidden;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  line-clamp: 2;
  -webkit-box-orient: vertical;
}

.lang-cta {
  display: flex;
  align-items: center;
  gap: 0.25rem;
  font-size: 0.75rem;
  font-weight: 600;
  color: var(--va-primary);
  margin-top: auto;
}

.lang-divider {
  width: 2px;
  background: var(--va-background-border);
  flex-shrink: 0;
}

/* Footer */
.topic-footer .topic-footer-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: 0.5rem;
}

.topic-status {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}
</style>
