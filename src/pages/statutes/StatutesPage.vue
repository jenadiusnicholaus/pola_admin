<template>
  <div class="statutes-laws-page">
    <div class="page-header">
      <div>
        <h1 class="page-title">Sheria za Nchi — Laws</h1>
        <p class="page-subtitle">PDF statutes · multi-category · EN / SW</p>
      </div>
      <VaButton preset="secondary" @click="$router.push({ name: 'statutes-categories' })">Manage Categories</VaButton>
    </div>

    <VaCard class="my-4">
      <VaCardContent>
        <div class="toolbar">
          <VaInput v-model="searchQuery" placeholder="Search laws..." clearable @keyup.enter="loadData">
            <template #prependInner>
              <VaIcon name="search" />
            </template>
          </VaInput>
          <VaSelect
            v-model="categoryFilter"
            placeholder="All categories"
            :options="categoryOptions"
            text-by="text"
            value-by="value"
            clearable
          />
          <VaSelect
            v-model="statusFilter"
            placeholder="Status"
            :options="statusOptions"
            text-by="text"
            value-by="value"
            clearable
          />
          <VaButton icon="refresh" preset="secondary" @click="loadData" />
          <VaButton icon="add" @click="openCreate">Upload Law PDF</VaButton>
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
        <VaButton
          preset="secondary"
          :disabled="page <= 1"
          @click="
            page--
            loadData()
          "
          >Prev</VaButton
        >
        <span>Page {{ page }} · {{ totalCount }} total</span>
        <VaButton
          preset="secondary"
          :disabled="!hasNext"
          @click="
            page++
            loadData()
          "
          >Next</VaButton
        >
      </div>
    </VaCard>

    <VaModal v-model="showModal" :title="isEditing ? 'Edit Law' : 'Upload Law PDF'" size="large" hide-default-actions>
      <div class="modal-form">
        <VaInput v-model="form.title" label="Title (English)" required />
        <VaInput v-model="form.title_sw" label="Title (Swahili)" required />
        <VaTextarea v-model="form.description" label="Description (English)" :min-rows="2" />
        <VaTextarea v-model="form.description_sw" label="Description (Swahili)" :min-rows="2" />
        <VaSelect
          v-model="form.category_ids"
          label="Categories (multi)"
          :options="categoryOptions.filter((o) => o.value !== '')"
          text-by="text"
          value-by="value"
          multiple
        />
        <div class="file-block">
          <label>PDF file {{ isEditing ? '(leave empty to keep current)' : '(required)' }}</label>
          <input type="file" accept="application/pdf,.pdf" @change="onFileChange" />
          <div v-if="existingFileUrl" class="muted">
            Current:
            <a :href="existingFileUrl" target="_blank" rel="noopener">Open PDF</a>
          </div>
        </div>
        <VaInput v-model.number="form.sort_order" type="number" label="Sort order" />
        <VaCheckbox v-model="form.is_active" label="Active" />
      </div>
      <template #footer>
        <VaButton color="secondary" @click="showModal = false">Cancel</VaButton>
        <VaButton :loading="saving" @click="save">{{ isEditing ? 'Update' : 'Create' }}</VaButton>
      </template>
    </VaModal>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { useToast } from 'vuestic-ui'
import { statutesService, type Statute, type StatuteCategory } from '../../services/statutesService'

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
.page-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 1rem;
}
.page-title {
  margin: 0;
  font-size: 1.75rem;
}
.page-subtitle {
  margin: 0.25rem 0 0;
  opacity: 0.7;
}
.toolbar {
  display: flex;
  flex-wrap: wrap;
  gap: 0.75rem;
  align-items: center;
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
.modal-form {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}
.file-block {
  display: flex;
  flex-direction: column;
  gap: 0.35rem;
}
</style>
