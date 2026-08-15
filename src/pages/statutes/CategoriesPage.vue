<template>
  <div class="statutes-categories-page">
    <div class="page-header">
      <div>
        <h1 class="page-title">Sheria za Nchi — Categories</h1>
        <p class="page-subtitle">Bilingual categories for Tanzania statutes (EN / SW)</p>
      </div>
      <div class="header-actions">
        <VaButton preset="secondary" icon="gavel" @click="$router.push({ name: 'statutes-laws' })">
          Manage Laws
        </VaButton>
        <VaButton icon="add" color="primary" @click="openCreate">New Category</VaButton>
      </div>
    </div>

    <div class="stats-row">
      <VaCard class="stat-chip">
        <VaCardContent>
          <div class="stat-chip-inner">
            <VaIcon name="category" color="primary" />
            <div>
              <div class="stat-value">{{ totalCount }}</div>
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

    <VaCard class="toolbar-card">
      <VaCardContent>
        <div class="toolbar">
          <VaInput
            v-model="searchQuery"
            class="search-input"
            placeholder="Search English or Swahili name..."
            clearable
            @keyup.enter="searchAndReload"
          >
            <template #prependInner>
              <VaIcon name="search" />
            </template>
          </VaInput>
          <VaSelect
            v-model="statusFilter"
            class="filter-select"
            placeholder="All statuses"
            :options="statusOptions"
            text-by="text"
            value-by="value"
            clearable
            @update:modelValue="searchAndReload"
          />
          <VaButton icon="refresh" preset="secondary" @click="loadData" />
        </div>
      </VaCardContent>
    </VaCard>

    <div v-if="loading" class="loading-container">
      <VaProgressCircle indeterminate />
      <p>Loading categories...</p>
    </div>

    <div v-else-if="categories.length === 0" class="empty-state">
      <div class="empty-icon">📂</div>
      <h3>No categories yet</h3>
      <p>Create your first statute category to organize PDF laws.</p>
      <VaButton icon="add" @click="openCreate">Create Category</VaButton>
    </div>

    <div v-else class="category-grid">
      <VaCard v-for="cat in categories" :key="cat.id" class="category-card" :class="{ inactive: !cat.is_active }">
        <div class="lang-split">
          <div class="lang-panel sw">
            <span class="lang-tag">SW</span>
            <h3>{{ cat.name_sw }}</h3>
            <p>{{ cat.description_sw || '—' }}</p>
          </div>
          <div class="lang-divider" />
          <div class="lang-panel en">
            <span class="lang-tag">EN</span>
            <h3>{{ cat.name }}</h3>
            <p>{{ cat.description || '—' }}</p>
          </div>
        </div>

        <VaCardContent class="card-footer">
          <div class="meta">
            <VaBadge :text="cat.is_active ? 'Active' : 'Inactive'" :color="cat.is_active ? 'success' : 'danger'" />
            <span class="meta-item">
              <VaIcon name="description" size="small" />
              {{ cat.statutes_count || 0 }} laws
            </span>
            <span class="meta-item">Order {{ cat.sort_order }}</span>
          </div>
          <div class="actions">
            <VaButton size="small" preset="primary" icon="edit" @click="openEdit(cat)">Edit</VaButton>
            <VaButton
              size="small"
              preset="secondary"
              :icon="cat.is_active ? 'visibility_off' : 'visibility'"
              @click="toggle(cat)"
            >
              {{ cat.is_active ? 'Disable' : 'Enable' }}
            </VaButton>
            <VaButton size="small" preset="plain" icon="delete" color="danger" @click="confirmDelete(cat)">
              Delete
            </VaButton>
          </div>
        </VaCardContent>
      </VaCard>
    </div>

    <div v-if="categories.length" class="pager">
      <VaButton preset="secondary" :disabled="page <= 1" @click="prevPage">Previous</VaButton>
      <span>Page {{ page }} · {{ totalCount }} total</span>
      <VaButton preset="secondary" :disabled="!hasNext" @click="nextPage">Next</VaButton>
    </div>

    <!-- Create / Edit drawer-style modal -->
    <VaModal
      v-model="showModal"
      :title="isEditing ? 'Edit Category' : 'Create Category'"
      size="large"
      hide-default-actions
      close-button
    >
      <div class="form-shell">
        <VaCard class="form-section">
          <VaCardContent>
            <div class="section-title">
              <VaIcon name="translate" color="primary" />
              <h4>Names</h4>
            </div>
            <div class="form-grid">
              <VaInput v-model="form.name" label="English name *" placeholder="e.g. Criminal Law" />
              <VaInput v-model="form.name_sw" label="Swahili name *" placeholder="e.g. Sheria ya Jinai" />
            </div>
          </VaCardContent>
        </VaCard>

        <VaCard class="form-section">
          <VaCardContent>
            <div class="section-title">
              <VaIcon name="notes" color="primary" />
              <h4>Descriptions</h4>
            </div>
            <div class="form-grid">
              <VaTextarea v-model="form.description" label="English description" :min-rows="3" />
              <VaTextarea v-model="form.description_sw" label="Swahili description" :min-rows="3" />
            </div>
          </VaCardContent>
        </VaCard>

        <VaCard class="form-section">
          <VaCardContent>
            <div class="section-title">
              <VaIcon name="tune" color="primary" />
              <h4>Settings</h4>
            </div>
            <div class="form-grid settings-grid">
              <VaInput v-model.number="form.sort_order" type="number" label="Display order" />
              <div class="switch-row">
                <VaCheckbox v-model="form.is_active" label="Active (visible in the app)" />
              </div>
            </div>
          </VaCardContent>
        </VaCard>
      </div>

      <template #footer>
        <div class="modal-footer">
          <VaButton preset="secondary" @click="showModal = false">Cancel</VaButton>
          <VaButton :loading="saving" icon="save" @click="save">
            {{ isEditing ? 'Save changes' : 'Create category' }}
          </VaButton>
        </div>
      </template>
    </VaModal>

    <!-- Delete confirm -->
    <VaModal v-model="showDeleteModal" title="Soft delete category?" size="small" hide-default-actions>
      <p>
        Soft-delete <strong>{{ deleting?.name }}</strong> / <strong>{{ deleting?.name_sw }}</strong
        >? It will be hidden from the app but can be restored later.
      </p>
      <template #footer>
        <div class="modal-footer">
          <VaButton preset="secondary" @click="showDeleteModal = false">Cancel</VaButton>
          <VaButton color="danger" :loading="saving" icon="delete" @click="softDelete">Delete</VaButton>
        </div>
      </template>
    </VaModal>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { useToast } from 'vuestic-ui'
import { statutesService, type StatuteCategory } from '../../services/statutesService'

const { init: notify } = useToast()
const loading = ref(false)
const saving = ref(false)
const categories = ref<StatuteCategory[]>([])
const searchQuery = ref('')
const statusFilter = ref<boolean | null>(null)
const page = ref(1)
const pageSize = 20
const totalCount = ref(0)
const hasNext = ref(false)
const showModal = ref(false)
const showDeleteModal = ref(false)
const isEditing = ref(false)
const editingId = ref<number | null>(null)
const deleting = ref<StatuteCategory | null>(null)

const statusOptions = [
  { text: 'Active', value: true },
  { text: 'Inactive', value: false },
]

const form = ref({
  name: '',
  name_sw: '',
  description: '',
  description_sw: '',
  sort_order: 0,
  is_active: true,
})

const activeCount = computed(() => categories.value.filter((c) => c.is_active).length)

const searchAndReload = () => {
  page.value = 1
  loadData()
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
    const data = await statutesService.listCategories({
      page: page.value,
      page_size: pageSize,
      search: searchQuery.value || undefined,
      is_active: statusFilter.value === null ? undefined : statusFilter.value,
    })
    if (Array.isArray(data)) {
      categories.value = data
      totalCount.value = data.length
      hasNext.value = false
    } else {
      categories.value = data.results
      totalCount.value = data.count
      hasNext.value = !!data.next
    }
  } catch (e: any) {
    notify({ message: e?.response?.data?.detail || 'Failed to load categories', color: 'danger' })
  } finally {
    loading.value = false
  }
}

const openCreate = () => {
  isEditing.value = false
  editingId.value = null
  form.value = { name: '', name_sw: '', description: '', description_sw: '', sort_order: 0, is_active: true }
  showModal.value = true
}

const openEdit = (row: StatuteCategory) => {
  isEditing.value = true
  editingId.value = row.id
  form.value = {
    name: row.name,
    name_sw: row.name_sw,
    description: row.description || '',
    description_sw: row.description_sw || '',
    sort_order: row.sort_order,
    is_active: row.is_active,
  }
  showModal.value = true
}

const save = async () => {
  if (!form.value.name.trim() || !form.value.name_sw.trim()) {
    notify({ message: 'English and Swahili names are required', color: 'warning' })
    return
  }
  saving.value = true
  try {
    if (isEditing.value && editingId.value) {
      await statutesService.updateCategory(editingId.value, form.value)
      notify({ message: 'Category updated', color: 'success' })
    } else {
      await statutesService.createCategory(form.value)
      notify({ message: 'Category created', color: 'success' })
    }
    showModal.value = false
    await loadData()
  } catch (e: any) {
    const msg =
      e?.response?.data?.name?.[0] || e?.response?.data?.name_sw?.[0] || e?.response?.data?.detail || 'Save failed'
    notify({ message: String(msg), color: 'danger' })
  } finally {
    saving.value = false
  }
}

const toggle = async (row: StatuteCategory) => {
  try {
    await statutesService.toggleCategory(row.id)
    notify({ message: row.is_active ? 'Category disabled' : 'Category enabled', color: 'success' })
    await loadData()
  } catch (e: any) {
    notify({ message: e?.response?.data?.error || 'Toggle failed', color: 'danger' })
  }
}

const confirmDelete = (row: StatuteCategory) => {
  deleting.value = row
  showDeleteModal.value = true
}

const softDelete = async () => {
  if (!deleting.value) return
  saving.value = true
  try {
    await statutesService.deleteCategory(deleting.value.id)
    notify({ message: 'Category soft-deleted', color: 'success' })
    showDeleteModal.value = false
    deleting.value = null
    await loadData()
  } catch (e: any) {
    notify({ message: e?.response?.data?.detail || 'Delete failed', color: 'danger' })
  } finally {
    saving.value = false
  }
}

onMounted(loadData)
</script>

<style scoped>
.statutes-categories-page {
  padding-bottom: 2rem;
}
.page-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 1rem;
  margin-bottom: 1.25rem;
}
.page-title {
  margin: 0;
  font-size: 1.75rem;
  font-weight: 700;
}
.page-subtitle {
  margin: 0.35rem 0 0;
  opacity: 0.7;
}
.header-actions {
  display: flex;
  gap: 0.75rem;
  flex-wrap: wrap;
}
.stats-row {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
  gap: 1rem;
  margin-bottom: 1rem;
}
.stat-chip-inner {
  display: flex;
  align-items: center;
  gap: 0.85rem;
}
.stat-value {
  font-size: 1.5rem;
  font-weight: 700;
  line-height: 1.1;
}
.stat-label {
  opacity: 0.65;
  font-size: 0.85rem;
}
.toolbar-card {
  margin-bottom: 1.25rem;
}
.toolbar {
  display: flex;
  flex-wrap: wrap;
  gap: 0.75rem;
  align-items: center;
}
.search-input {
  flex: 1;
  min-width: 220px;
}
.filter-select {
  min-width: 160px;
}
.loading-container,
.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.75rem;
  padding: 3.5rem 1rem;
  text-align: center;
}
.empty-icon {
  font-size: 3rem;
}
.category-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(340px, 1fr));
  gap: 1rem;
}
.category-card {
  overflow: hidden;
  border: 1px solid rgba(0, 0, 0, 0.06);
  transition:
    box-shadow 0.2s ease,
    transform 0.2s ease;
}
.category-card:hover {
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.08);
  transform: translateY(-2px);
}
.category-card.inactive {
  opacity: 0.72;
}
.lang-split {
  display: grid;
  grid-template-columns: 1fr auto 1fr;
  min-height: 140px;
}
.lang-panel {
  padding: 1rem 1.1rem;
}
.lang-panel.sw {
  background: linear-gradient(160deg, #fff7ed 0%, #fff 70%);
}
.lang-panel.en {
  background: linear-gradient(160deg, #eff6ff 0%, #fff 70%);
}
.lang-tag {
  display: inline-block;
  font-size: 0.7rem;
  font-weight: 700;
  letter-spacing: 0.04em;
  padding: 0.15rem 0.45rem;
  border-radius: 999px;
  background: rgba(0, 0, 0, 0.06);
  margin-bottom: 0.5rem;
}
.lang-panel h3 {
  margin: 0 0 0.4rem;
  font-size: 1.05rem;
}
.lang-panel p {
  margin: 0;
  font-size: 0.88rem;
  opacity: 0.75;
  line-height: 1.4;
  display: -webkit-box;
  -webkit-line-clamp: 3;
  -webkit-box-orient: vertical;
  overflow: hidden;
}
.lang-divider {
  width: 1px;
  background: rgba(0, 0, 0, 0.08);
}
.card-footer {
  display: flex;
  flex-direction: column;
  gap: 0.85rem;
  border-top: 1px solid rgba(0, 0, 0, 0.06);
}
.meta {
  display: flex;
  flex-wrap: wrap;
  gap: 0.65rem;
  align-items: center;
}
.meta-item {
  display: inline-flex;
  align-items: center;
  gap: 0.25rem;
  font-size: 0.85rem;
  opacity: 0.75;
}
.actions {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
}
.pager {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 1.25rem;
  gap: 1rem;
}
.form-shell {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}
.form-section {
  border: 1px solid rgba(0, 0, 0, 0.06);
}
.section-title {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin-bottom: 0.85rem;
}
.section-title h4 {
  margin: 0;
  font-size: 0.95rem;
}
.form-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 0.85rem;
}
.settings-grid {
  align-items: end;
}
.switch-row {
  display: flex;
  align-items: center;
  min-height: 40px;
}
.modal-footer {
  display: flex;
  justify-content: flex-end;
  gap: 0.75rem;
  width: 100%;
}
@media (max-width: 720px) {
  .lang-split,
  .form-grid {
    grid-template-columns: 1fr;
  }
  .lang-divider {
    width: 100%;
    height: 1px;
  }
  .page-header {
    flex-direction: column;
  }
}
</style>
