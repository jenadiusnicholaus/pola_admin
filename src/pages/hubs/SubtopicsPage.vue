<template>
  <div class="subtopics-page">
    <!-- Header with Back Button -->
    <div class="page-header">
      <VaButton icon="arrow_back" preset="plain" @click="goBack">Back to Topics</VaButton>
      <div v-if="selectedTopic">
        <h1 class="page-title">
          {{ languageFilter === 'sw' ? selectedTopic.name_sw : selectedTopic.name }} - Subtopics
        </h1>
        <p class="page-subtitle">{{ languageFilter === 'sw' ? selectedTopic.name : selectedTopic.name_sw }}</p>
      </div>
      <div v-else>
        <h1 class="page-title">Subtopics</h1>
      </div>
    </div>

    <!-- Statistics Cards -->
    <div class="stats-grid">
      <VaCard class="stat-card">
        <VaCardContent>
          <div class="stat-item">
            <VaIcon name="folder" color="primary" size="2.5rem" />
            <div class="stat-content">
              <div class="stat-value">{{ filteredSubtopics.length }}</div>
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
              <div class="stat-value">{{ totalMaterials }}</div>
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
            <VaInput v-model="searchQuery" placeholder="Search subtopics..." clearable>
              <template #prependInner>
                <VaIcon name="search" />
              </template>
            </VaInput>

            <VaSelect
              v-model="languageFilter"
              :options="languageOptions"
              value-by="value"
              text-by="text"
              placeholder="Language"
            >
              <template #prependInner>
                <VaIcon name="language" size="small" />
              </template>
            </VaSelect>

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

    <div v-else-if="filteredSubtopics.length === 0" class="empty-state">
      <VaIcon name="inbox" size="4rem" color="secondary" />
      <p class="empty-message">No subtopics found for this topic</p>
      <VaButton @click="openCreateModal">Create First Subtopic</VaButton>
    </div>

    <div v-else class="subtopics-grid">
      <VaCard
        v-for="subtopic in filteredSubtopics"
        :key="subtopic.id"
        class="subtopic-card"
        :class="{ inactive: !subtopic.is_active }"
      >
        <VaCardContent class="subtopic-content" @click="viewMaterials(subtopic)">
          <div class="subtopic-header">
            <h3 class="subtopic-title">{{ subtopic.name }}</h3>
            <div class="subtopic-badges">
              <VaBadge :text="subtopic.language === 'sw' ? 'Swahili' : 'English'" color="info" />
              <VaBadge
                :text="subtopic.is_active ? 'Active' : 'Inactive'"
                :color="subtopic.is_active ? 'success' : 'danger'"
              />
            </div>
          </div>
          <p class="subtopic-description">
            {{ subtopic.description }}
          </p>

          <div class="subtopic-stats">
            <span class="stat-badge">
              <VaIcon name="description" size="small" />
              {{ subtopic.materials_count }} materials
            </span>
          </div>
        </VaCardContent>

        <VaCardContent class="subtopic-actions">
          <VaButton size="small" preset="plain" icon="edit" @click.stop="editSubtopic(subtopic)">Edit</VaButton>
          <VaButton
            size="small"
            preset="plain"
            :icon="subtopic.is_active ? 'toggle_on' : 'toggle_off'"
            @click.stop="toggleSubtopic(subtopic)"
          >
            Toggle
          </VaButton>
          <VaButton size="small" preset="plain" icon="delete" color="danger" @click.stop="deleteSubtopic(subtopic)">
            Delete
          </VaButton>
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
        <VaSelect
          v-model="form.language"
          label="Language"
          :options="languageOptions"
          value-by="value"
          text-by="text"
          required
          :disabled="isEditing"
        />
        <VaInput
          v-model="form.name"
          :label="form.language === 'sw' ? 'Subtopic Name (Swahili)' : 'Subtopic Name (English)'"
          required
        />
        <VaTextarea
          v-model="form.description"
          :label="form.language === 'sw' ? 'Description (Swahili)' : 'Description (English)'"
          :min-rows="3"
        />
        <div class="form-row">
          <VaInput v-model.number="form.display_order" type="number" label="Display Order" />
        </div>
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
import { ref, computed, onMounted, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useHubsStore } from '../../stores/hubs-store'
import { useToast } from 'vuestic-ui'

const route = useRoute()
const router = useRouter()
const { init: notify } = useToast()
const hubsStore = useHubsStore()

const topicId = ref<number>(Number(route.params.topicId) || 0)
const languageFilter = ref<string>((route.query.language as string) || 'en')

// Computed from store
const loading = computed(() => hubsStore.loadingSubtopics)
const subtopics = computed(() => hubsStore.subtopics)
const selectedTopic = computed(() => hubsStore.selectedTopic)

// Filters
const searchQuery = ref('')
const statusFilter = ref<boolean | null>(null)

const statusOptions = [
  { text: 'Active', value: true },
  { text: 'Inactive', value: false },
]

const languageOptions = [
  { text: 'English', value: 'en' },
  { text: 'Swahili', value: 'sw' },
]

// Filter locally: search and status only — language filtering is handled by API
const filteredSubtopics = computed(() => {
  return subtopics.value.filter((s) => {
    const matchesSearch = s.name.toLowerCase().includes(searchQuery.value.toLowerCase())
    const matchesStatus = statusFilter.value === null || s.is_active === statusFilter.value
    return matchesSearch && matchesStatus
  })
})

const totalMaterials = computed(() => {
  return filteredSubtopics.value.reduce((acc, s) => acc + (s.materials_count || 0), 0)
})

// Modal
const showModal = ref(false)
const isEditing = ref(false)
const editingId = ref<number | null>(null)
const form = ref({
  topic: topicId.value as number,
  name: '',
  description: '',
  language: languageFilter.value || 'en',
  display_order: 0,
  is_active: true,
})

// Load data — sequential: fetchTopicById first for header info, then fetchSubtopics for filtered list
const loadData = async () => {
  try {
    await hubsStore.fetchTopicById(topicId.value)
    await hubsStore.fetchSubtopics({ topic: topicId.value, language: languageFilter.value })
  } catch (error: any) {
    notify({
      message: error.message || 'Failed to load subtopics',
      color: 'danger',
    })
  }
}

// Refetch from API when language filter changes
watch(languageFilter, () => {
  hubsStore.fetchSubtopics({ topic: topicId.value, language: languageFilter.value })
})

// Navigation
const goBack = () => {
  router.push({ name: 'legal-education' })
}

const viewMaterials = (subtopic: any) => {
  router.push({
    name: 'hubs-materials',
    params: {
      topicId: String(topicId.value),
      subtopicId: String(subtopic.id),
    },
    query: { language: languageFilter.value },
  })
}

// CRUD Operations
const openCreateModal = () => {
  isEditing.value = false
  editingId.value = null
  const maxOrder = subtopics.value.reduce((max, s) => Math.max(max, s.display_order ?? 0), -1)
  form.value = {
    topic: topicId.value,
    name: '',
    description: '',
    language: languageFilter.value || 'en',
    display_order: maxOrder + 1,
    is_active: true,
  }
  showModal.value = true
}

const editSubtopic = (subtopic: any) => {
  isEditing.value = true
  editingId.value = subtopic.id
  const topicIdNum = typeof subtopic.topic === 'object' ? subtopic.topic.id : subtopic.topic
  form.value = {
    topic: topicIdNum,
    name: subtopic.name,
    description: subtopic.description,
    language: subtopic.language || 'en',
    display_order: subtopic.display_order,
    is_active: subtopic.is_active,
  }
  showModal.value = true
}

const saveSubtopic = async () => {
  if (!form.value.name.trim()) {
    notify({ message: 'Subtopic name is required', color: 'warning' })
    return
  }

  try {
    if (isEditing.value && editingId.value) {
      await hubsStore.updateSubtopic(editingId.value, form.value as any)
      notify({ message: 'Subtopic updated successfully', color: 'success' })
    } else {
      await hubsStore.createSubtopic(form.value as any)
      notify({ message: 'Subtopic created successfully', color: 'success' })
    }

    await loadData()
    showModal.value = false
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
    await loadData()
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
  if (!confirm(`Delete "${subtopic.name}"? This may affect linked materials.`)) return

  try {
    await hubsStore.deleteSubtopic(subtopic.id)
    await loadData()
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
  padding: 0.5rem;
}

.page-header {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  margin-bottom: 1.5rem;
}

.page-title {
  font-size: 2rem;
  font-weight: bold;
  margin: 0;
}

.page-subtitle {
  font-size: 1rem;
  color: var(--va-text-secondary);
  margin: 0;
}

/* Statistics Grid */
.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 1rem;
  margin-bottom: 1.5rem;
}

.stat-card {
  transition: transform 0.2s;
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
  display: flex;
  gap: 1rem;
  flex: 1;
  align-items: center;
}

.search-filters :deep(.va-input),
.search-filters :deep(.va-select) {
  min-width: 150px;
  flex: 1;
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
  display: flex;
  flex-direction: column;
}

.subtopic-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 8px 16px rgba(0, 0, 0, 0.1);
}

.subtopic-card.inactive {
  opacity: 0.6;
}

.subtopic-content {
  cursor: pointer;
  flex: 1;
}

.subtopic-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 0.5rem;
}

.subtopic-badges {
  display: flex;
  gap: 0.25rem;
  flex-wrap: wrap;
  justify-content: flex-end;
}

.subtopic-title {
  font-size: 1.25rem;
  font-weight: bold;
  margin: 0;
  line-height: 1.3;
}

.subtopic-description {
  font-size: 0.875rem;
  color: var(--va-text-secondary);
  margin: 0.5rem 0;
  min-height: 2.5rem;
  display: -webkit-box;
  -webkit-line-clamp: 3;
  line-clamp: 3;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.subtopic-stats {
  margin-top: 1rem;
  padding-top: 0.75rem;
  border-top: 1px solid var(--va-background-border);
}

.stat-badge {
  display: flex;
  align-items: center;
  gap: 0.25rem;
  font-size: 0.875rem;
  color: var(--va-text-secondary);
}

.subtopic-actions {
  display: flex;
  gap: 0.25rem;
  padding-top: 0;
  border-top: none;
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
  grid-template-columns: 1fr;
  gap: 1rem;
}
</style>
