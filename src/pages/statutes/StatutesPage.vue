<template>
  <div class="statutes-laws-page">
    <div class="page-header">
      <div>
        <h1 class="page-title">Sheria za Nchi — Laws</h1>
        <p class="page-subtitle">PDF statutes · multi-category · EN / SW</p>
      </div>
      <div class="header-actions">
        <VaButton preset="secondary" icon="category" @click="router.push({ name: 'statutes-categories' })"
          >Manage Categories</VaButton
        >
        <VaButton icon="add" color="primary" @click="openCreate">Upload Law PDF</VaButton>
      </div>
    </div>

    <div class="stats-row">
      <VaCard class="stat-chip">
        <VaCardContent>
          <div class="stat-chip-inner">
            <VaIcon name="gavel" color="primary" />
            <div>
              <div class="stat-value">{{ totalCount }}</div>
              <div class="stat-label">Total Laws</div>
            </div>
          </div>
        </VaCardContent>
      </VaCard>
      <VaCard class="stat-chip">
        <VaCardContent>
          <div class="stat-chip-inner">
            <VaIcon name="category" color="info" />
            <div>
              <div class="stat-value">{{ allCategories.length }}</div>
              <div class="stat-label">Categories</div>
            </div>
          </div>
        </VaCardContent>
      </VaCard>
      <VaCard class="stat-chip">
        <VaCardContent>
          <div class="stat-chip-inner">
            <VaIcon name="check_circle" color="success" />
            <div>
              <div class="stat-value">{{ activeCount }}</div>
              <div class="stat-label">Active</div>
            </div>
          </div>
        </VaCardContent>
      </VaCard>
    </div>

    <VaCard class="filter-card">
      <VaCardContent>
        <div class="filter-grid">
          <div class="filter-field filter-search">
            <label class="filter-label">Search</label>
            <VaInput
              v-model="searchQuery"
              placeholder="Search by title..."
              clearable
              @keyup.enter="loadData"
              @update:modelValue="onFilterChange"
            >
              <template #prependInner>
                <VaIcon name="search" />
              </template>
            </VaInput>
          </div>
          <div class="filter-field">
            <label class="filter-label">Category</label>
            <VaSelect
              v-model="categoryFilter"
              placeholder="All categories"
              :options="categoryOptions"
              text-by="text"
              value-by="value"
              clearable
              @update:modelValue="onFilterChange"
            />
          </div>
          <div class="filter-field">
            <label class="filter-label">Status</label>
            <VaSelect
              v-model="statusFilter"
              placeholder="All statuses"
              :options="statusOptions"
              text-by="text"
              value-by="value"
              clearable
              @update:modelValue="onFilterChange"
            />
          </div>
          <div class="filter-actions">
            <VaButton icon="refresh" preset="secondary" @click="loadData">Refresh</VaButton>
          </div>
        </div>
      </VaCardContent>
    </VaCard>

    <div v-if="loading" class="loading-container">
      <VaProgressCircle indeterminate />
    </div>

    <div v-else-if="laws.length === 0" class="empty-state">
      <VaIcon name="picture_as_pdf" size="4rem" color="secondary" />
      <p>No statutes found</p>
      <VaButton @click="openCreate">Upload First PDF</VaButton>
    </div>

    <VaCard v-else>
      <VaDataTable :items="laws" :columns="columns" :loading="loading">
        <template #cell(title)="{ rowData }">
          <div>
            <strong>{{ rowData.title }}</strong>
            <div class="muted">{{ rowData.title_sw }}</div>
          </div>
        </template>
        <template #cell(categories)="{ rowData }">
          <div class="chips">
            <VaBadge v-for="c in rowData.categories" :key="c.id" :text="c.name" color="info" class="chip" />
            <span v-if="!rowData.categories?.length" class="muted">—</span>
          </div>
        </template>
        <template #cell(file)="{ rowData }">
          <a v-if="rowData.file_url" :href="rowData.file_url" target="_blank" rel="noopener">
            PDF ({{ rowData.file_size_mb }} MB)
          </a>
          <span v-else class="muted">No file</span>
        </template>
        <template #cell(is_active)="{ rowData }">
          <VaBadge
            :text="rowData.is_active ? 'Active' : 'Inactive'"
            :color="rowData.is_active ? 'success' : 'danger'"
          />
        </template>
        <template #cell(actions)="{ rowData }">
          <div class="row-actions">
            <VaButton size="small" preset="plain" icon="edit" @click="openEdit(rowData)" />
            <VaButton
              size="small"
              preset="plain"
              :icon="rowData.is_active ? 'toggle_on' : 'toggle_off'"
              @click="toggle(rowData)"
            />
            <VaButton size="small" preset="plain" icon="delete" color="danger" @click="softDelete(rowData)" />
          </div>
        </template>
      </VaDataTable>
      <div class="pager">
        <VaButton preset="secondary" :disabled="page <= 1" @click="prevPage">Prev</VaButton>
        <span>Page {{ page }} · {{ totalCount }} total</span>
        <VaButton preset="secondary" :disabled="!hasNext" @click="nextPage">Next</VaButton>
      </div>
    </VaCard>

    <VaModal v-model="showModal" :title="isEditing ? 'Edit Law' : 'Upload Law PDF'" size="large" hide-default-actions>
      <div class="modal-form">
        <!-- Bilingual Title Section -->
        <div class="form-section">
          <div class="form-section-title">
            <VaIcon name="title" size="small" color="primary" />
            Titles
          </div>
          <div class="bilingual-grid">
            <VaInput v-model="form.title" label="Title (English)" required />
            <VaInput v-model="form.title_sw" label="Title (Swahili)" required />
          </div>
        </div>

        <!-- Bilingual Description Section -->
        <div class="form-section">
          <div class="form-section-title">
            <VaIcon name="description" size="small" color="primary" />
            Descriptions
          </div>
          <div class="bilingual-grid">
            <VaTextarea v-model="form.description" label="Description (English)" :min-rows="2" />
            <VaTextarea v-model="form.description_sw" label="Description (Swahili)" :min-rows="2" />
          </div>
        </div>

        <!-- Categories & Settings Section -->
        <div class="form-section">
          <div class="form-section-title">
            <VaIcon name="category" size="small" color="primary" />
            Categories & Settings
          </div>
          <VaSelect
            v-model="form.category_ids"
            label="Categories (multi-select)"
            :options="categoryOptions.filter((o) => o.value !== '')"
            text-by="text"
            value-by="value"
            multiple
          />
          <div class="settings-row">
            <VaInput v-model.number="form.sort_order" type="number" label="Sort order" />
            <div class="toggle-wrapper">
              <VaSwitch v-model="form.is_active" label="Active" />
            </div>
          </div>
        </div>

        <!-- File Upload Section -->
        <div class="form-section">
          <div class="form-section-title">
            <VaIcon name="picture_as_pdf" size="small" color="primary" />
            PDF File
            <span class="file-hint">{{ isEditing ? '(leave empty to keep current)' : '(required)' }}</span>
          </div>
          <div class="file-upload-area" @click="triggerFileInput" @dragover.prevent="onDragOver" @drop.prevent="onDrop">
            <input
              ref="fileInputRef"
              type="file"
              accept="application/pdf,.pdf"
              class="file-input-hidden"
              @change="onFileChange"
            />
            <template v-if="selectedFile">
              <VaIcon name="check_circle" color="success" size="2rem" />
              <div>
                <strong>{{ selectedFile.name }}</strong>
                <div class="muted">{{ (selectedFile.size / 1024 / 1024).toFixed(2) }} MB</div>
              </div>
            </template>
            <template v-else-if="isEditing && existingFileUrl">
              <VaIcon name="picture_as_pdf" color="info" size="2rem" />
              <div>
                <strong>Current file</strong>
                <a :href="existingFileUrl" target="_blank" rel="noopener" class="file-link">Open PDF</a>
              </div>
            </template>
            <template v-else>
              <VaIcon name="upload_file" color="secondary" size="2rem" />
              <div>
                <strong>Click to browse or drag a PDF here</strong>
                <div class="muted">Accepted: .pdf</div>
              </div>
            </template>
          </div>
        </div>
      </div>
      <template #footer>
        <VaButton color="secondary" @click="showModal = false">Cancel</VaButton>
        <VaButton :loading="saving" @click="save">{{ isEditing ? 'Update' : 'Upload' }}</VaButton>
      </template>
    </VaModal>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import { useToast } from 'vuestic-ui'
import { statutesService, type Statute, type StatuteCategory } from '../../services/statutesService'

const router = useRouter()
const { init: notify } = useToast()
const loading = ref(false)
const saving = ref(false)
const laws = ref<Statute[]>([])
const allCategories = ref<StatuteCategory[]>([])
const searchQuery = ref('')
const categoryFilter = ref<number | ''>('')
const statusFilter = ref<boolean | null>(null)
const page = ref(1)
const pageSize = 20
const totalCount = ref(0)
const hasNext = ref(false)
const showModal = ref(false)
const isEditing = ref(false)
const editingId = ref<number | null>(null)
const selectedFile = ref<File | null>(null)
const existingFileUrl = ref('')
const fileInputRef = ref<HTMLInputElement | null>(null)

const activeCount = computed(() => laws.value.filter((l) => l.is_active).length)

const onFilterChange = () => {
  page.value = 1
  loadData()
}

const triggerFileInput = () => {
  fileInputRef.value?.click()
}

const onDragOver = (e: DragEvent) => {
  e.dataTransfer!.dropEffect = 'copy'
}

const onDrop = (e: DragEvent) => {
  const file = e.dataTransfer?.files?.[0]
  if (file && file.type === 'application/pdf') {
    selectedFile.value = file
  }
}

const statusOptions = [
  { text: 'Active', value: true },
  { text: 'Inactive', value: false },
]

const categoryOptions = computed(() => [
  { text: 'All categories', value: '' as number | '' },
  ...allCategories.value.map((c) => ({ text: `${c.name} / ${c.name_sw}`, value: c.id as number | '' })),
])

const form = ref({
  title: '',
  title_sw: '',
  description: '',
  description_sw: '',
  category_ids: [] as number[],
  sort_order: 0,
  is_active: true,
})

const columns = [
  { key: 'title', label: 'Law' },
  { key: 'categories', label: 'Categories' },
  { key: 'file', label: 'PDF' },
  { key: 'is_active', label: 'Status' },
  { key: 'actions', label: 'Actions', width: '160px' },
]

const loadCategories = async () => {
  const data = await statutesService.listCategories({ page_size: 200 })
  allCategories.value = Array.isArray(data) ? data : data.results
}

const prevPage = () => {
  if (page.value <= 1) return
  page.value -= 1
  loadData()
}

const nextPage = () => {
  if (!hasNext.value) return
  page.value += 1
  loadData()
}

const loadData = async () => {
  loading.value = true
  try {
    const data = await statutesService.listStatutes({
      page: page.value,
      page_size: pageSize,
      search: searchQuery.value || undefined,
      category: categoryFilter.value || undefined,
      is_active: statusFilter.value === null ? undefined : statusFilter.value,
    })
    if (Array.isArray(data)) {
      laws.value = data
      totalCount.value = data.length
      hasNext.value = false
    } else {
      laws.value = data.results
      totalCount.value = data.count
      hasNext.value = !!data.next
    }
  } catch (e: any) {
    notify({ message: e?.response?.data?.detail || 'Failed to load statutes', color: 'danger' })
  } finally {
    loading.value = false
  }
}

const onFileChange = (e: Event) => {
  const input = e.target as HTMLInputElement
  selectedFile.value = input.files?.[0] || null
}

const openCreate = () => {
  isEditing.value = false
  editingId.value = null
  selectedFile.value = null
  existingFileUrl.value = ''
  form.value = {
    title: '',
    title_sw: '',
    description: '',
    description_sw: '',
    category_ids: [],
    sort_order: 0,
    is_active: true,
  }
  showModal.value = true
}

const openEdit = (row: Statute) => {
  isEditing.value = true
  editingId.value = row.id
  selectedFile.value = null
  existingFileUrl.value = row.file_url || ''
  form.value = {
    title: row.title,
    title_sw: row.title_sw,
    description: row.description || '',
    description_sw: row.description_sw || '',
    category_ids: (row.categories || []).map((c) => c.id),
    sort_order: row.sort_order,
    is_active: row.is_active,
  }
  showModal.value = true
}

const buildFormData = () => {
  const fd = new FormData()
  fd.append('title', form.value.title.trim())
  fd.append('title_sw', form.value.title_sw.trim())
  fd.append('description', form.value.description || '')
  fd.append('description_sw', form.value.description_sw || '')
  fd.append('sort_order', String(form.value.sort_order || 0))
  fd.append('is_active', form.value.is_active ? 'true' : 'false')
  form.value.category_ids.forEach((id) => fd.append('category_ids', String(id)))
  if (selectedFile.value) {
    fd.append('file', selectedFile.value)
  }
  return fd
}

const save = async () => {
  if (!form.value.title.trim() || !form.value.title_sw.trim()) {
    notify({ message: 'English and Swahili titles are required', color: 'warning' })
    return
  }
  if (!isEditing.value && !selectedFile.value) {
    notify({ message: 'PDF file is required', color: 'warning' })
    return
  }
  saving.value = true
  try {
    const fd = buildFormData()
    if (isEditing.value && editingId.value) {
      await statutesService.updateStatute(editingId.value, fd)
      notify({ message: 'Law updated', color: 'success' })
    } else {
      await statutesService.createStatute(fd)
      notify({ message: 'Law uploaded', color: 'success' })
    }
    showModal.value = false
    await loadData()
  } catch (e: any) {
    const msg = e?.response?.data?.file?.[0] || e?.response?.data?.detail || e?.response?.data?.error || 'Save failed'
    notify({ message: String(msg), color: 'danger' })
  } finally {
    saving.value = false
  }
}

const toggle = async (row: Statute) => {
  try {
    await statutesService.toggleStatute(row.id)
    await loadData()
  } catch (e: any) {
    notify({ message: e?.response?.data?.error || 'Toggle failed', color: 'danger' })
  }
}

const softDelete = async (row: Statute) => {
  if (!confirm(`Soft-delete law "${row.title}"?`)) return
  try {
    await statutesService.deleteStatute(row.id)
    notify({ message: 'Law soft-deleted', color: 'success' })
    await loadData()
  } catch (e: any) {
    notify({ message: e?.response?.data?.detail || 'Delete failed', color: 'danger' })
  }
}

onMounted(async () => {
  await loadCategories()
  await loadData()
})
</script>

<style scoped>
.statutes-laws-page {
  padding: 1.5rem;
  max-width: 1400px;
  margin: 0 auto;
}
.page-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 1rem;
  margin-bottom: 1.5rem;
  flex-wrap: wrap;
}
.page-title {
  margin: 0;
  font-size: 1.75rem;
  font-weight: 700;
}
.page-subtitle {
  margin: 0.25rem 0 0;
  opacity: 0.7;
}
.header-actions {
  display: flex;
  gap: 0.75rem;
}
.stats-row {
  display: flex;
  gap: 1rem;
  margin-bottom: 1.5rem;
  flex-wrap: wrap;
}
.stat-chip {
  flex: 1;
  min-width: 160px;
}
.stat-chip-inner {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}
.stat-value {
  font-size: 1.5rem;
  font-weight: 700;
}
.stat-label {
  font-size: 0.8rem;
  color: var(--va-text-secondary);
}
.filter-card {
  margin-bottom: 1.5rem;
}
.filter-grid {
  display: grid;
  grid-template-columns: 2fr 1.5fr 1fr auto;
  gap: 1rem;
  align-items: end;
}
.filter-field {
  display: flex;
  flex-direction: column;
  gap: 0.35rem;
}
.filter-label {
  font-size: 0.75rem;
  font-weight: 600;
  color: var(--va-text-secondary);
  text-transform: uppercase;
  letter-spacing: 0.5px;
}
.filter-actions {
  display: flex;
  align-items: flex-end;
}
.loading-container,
.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1rem;
  padding: 3rem;
}
.muted {
  font-size: 0.85rem;
  opacity: 0.7;
}
.chips {
  display: flex;
  flex-wrap: wrap;
  gap: 0.25rem;
}
.chip {
  margin: 0;
}
.row-actions {
  display: flex;
  gap: 0.25rem;
}
.pager {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem;
}

/* Modal Form */
.modal-form {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
  padding: 0.5rem 0;
}
.form-section {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}
.form-section-title {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.9rem;
  font-weight: 700;
  color: var(--va-text-primary);
  padding-bottom: 0.5rem;
  border-bottom: 1px solid var(--va-background-border);
}
.file-hint {
  font-size: 0.75rem;
  font-weight: 400;
  color: var(--va-text-secondary);
}
.bilingual-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1rem;
}
.settings-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1rem;
  align-items: center;
}
.toggle-wrapper {
  display: flex;
  align-items: center;
  padding-top: 1.5rem;
}
.file-upload-area {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 1.5rem;
  border: 2px dashed var(--va-background-border);
  border-radius: 8px;
  cursor: pointer;
  transition:
    border-color 0.2s,
    background 0.2s;
}
.file-upload-area:hover {
  border-color: var(--va-primary);
  background: var(--va-background-element);
}
.file-input-hidden {
  display: none;
}
.file-link {
  color: var(--va-primary);
  text-decoration: underline;
}

@media (max-width: 900px) {
  .filter-grid {
    grid-template-columns: 1fr 1fr;
  }
  .bilingual-grid {
    grid-template-columns: 1fr;
  }
  .settings-row {
    grid-template-columns: 1fr;
  }
}
@media (max-width: 600px) {
  .filter-grid {
    grid-template-columns: 1fr;
  }
  .stats-row {
    flex-direction: column;
  }
  .stat-chip {
    min-width: 100%;
  }
}
</style>
