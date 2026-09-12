<template>
  <div class="flex flex-col gap-4">
    <!-- Statistics Cards -->
    <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
      <VaCard>
        <VaCardContent>
          <div class="flex flex-col">
            <span class="text-secondary text-sm">Total Types</span>
            <span class="text-2xl font-bold">{{ totalCount }}</span>
          </div>
        </VaCardContent>
      </VaCard>
      <VaCard>
        <VaCardContent>
          <div class="flex flex-col">
            <span class="text-secondary text-sm">Active</span>
            <span class="text-2xl font-bold text-success">{{ activeCount }}</span>
          </div>
        </VaCardContent>
      </VaCard>
      <VaCard>
        <VaCardContent>
          <div class="flex flex-col">
            <span class="text-secondary text-sm">Inactive</span>
            <span class="text-2xl font-bold text-danger">{{ inactiveCount }}</span>
          </div>
        </VaCardContent>
      </VaCard>
    </div>

    <!-- Main Table Card -->
    <VaCard>
      <VaCardTitle>
        <h1 class="card-title">Document Types</h1>
      </VaCardTitle>
      <VaCardContent>
        <div class="flex flex-col gap-4 mb-4">
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <VaInput v-model="searchQuery" placeholder="Search by code or label..." clearable @keyup.enter="loadData">
              <template #prependInner>
                <VaIcon name="search" />
              </template>
            </VaInput>
          </div>
          <div class="flex justify-between items-center">
            <VaButton preset="secondary" icon="refresh" @click="loadData">Refresh</VaButton>
            <VaButton icon="add" color="primary" @click="openCreate">New Document Type</VaButton>
          </div>
        </div>

        <VaDataTable :items="filteredTypes" :loading="loading" :columns="columns" hoverable striped>
          <template #cell(code)="{ value }">
            <code class="code-badge">{{ value }}</code>
          </template>
          <template #cell(is_active)="{ value }">
            <VaBadge :text="value ? 'Active' : 'Inactive'" :color="value ? 'success' : 'danger'" />
          </template>
          <template #cell(description)="{ rowData }">
            <div class="description-cell">
              <span class="description-text">{{ trimDescription((rowData as DocumentType).description) }}</span>
              <VaButton
                v-if="(rowData as DocumentType).description"
                size="small"
                preset="primary"
                icon="visibility"
                @click="openDetail(rowData as DocumentType)"
              />
            </div>
          </template>
          <template #cell(actions)="{ rowData }">
            <div class="table-actions">
              <VaButton size="small" preset="primary" icon="edit" @click="openEdit(rowData as DocumentType)"
                >Edit</VaButton
              >
              <VaButton
                size="small"
                preset="primary"
                :icon="(rowData as DocumentType).is_active ? 'toggle_off' : 'toggle_on'"
                :color="(rowData as DocumentType).is_active ? 'warning' : 'success'"
                @click="toggleActive(rowData as DocumentType)"
              >
                {{ (rowData as DocumentType).is_active ? 'Deactivate' : 'Activate' }}
              </VaButton>
              <VaButton
                size="small"
                preset="primary"
                icon="delete"
                color="danger"
                @click="confirmDelete(rowData as DocumentType)"
              />
            </div>
          </template>
        </VaDataTable>
      </VaCardContent>
    </VaCard>

    <!-- Create / Edit Modal -->
    <VaModal
      v-model="showModal"
      :title="isEditing ? 'Edit Document Type' : 'New Document Type'"
      size="medium"
      hide-default-actions
    >
      <div class="modal-form">
        <VaInput v-model="form.code" label="Code (e.g. practice_license)" required :disabled="isEditing" />
        <VaInput v-model="form.label" label="Label (e.g. Practice License)" required />
        <VaTextarea v-model="form.description" label="Description" :min-rows="2" />
        <VaSwitch v-model="form.is_active" label="Active" />
      </div>
      <template #footer>
        <VaButton color="secondary" @click="showModal = false">Cancel</VaButton>
        <VaButton :loading="saving" @click="save">{{ isEditing ? 'Update' : 'Create' }}</VaButton>
      </template>
    </VaModal>

    <!-- Detail Modal -->
    <VaModal v-model="showDetailModal" title="Document Type Details" size="medium" hide-default-actions>
      <div v-if="selectedDetail" class="detail-content">
        <div class="detail-row">
          <span class="detail-label">Code</span>
          <code class="code-badge">{{ selectedDetail.code }}</code>
        </div>
        <div class="detail-row">
          <span class="detail-label">Label</span>
          <span>{{ selectedDetail.label }}</span>
        </div>
        <div class="detail-row">
          <span class="detail-label">Status</span>
          <VaBadge
            :text="selectedDetail.is_active ? 'Active' : 'Inactive'"
            :color="selectedDetail.is_active ? 'success' : 'danger'"
          />
        </div>
        <div class="detail-row detail-row-block">
          <span class="detail-label">Description</span>
          <p class="detail-description">{{ selectedDetail.description || '—' }}</p>
        </div>
      </div>
      <template #footer>
        <VaButton color="secondary" @click="showDetailModal = false">Close</VaButton>
      </template>
    </VaModal>

    <!-- Delete Confirmation Modal -->
    <VaModal v-model="showDeleteModal" title="Delete Document Type" hide-default-actions>
      <p>
        Are you sure you want to delete <strong>{{ deleteTarget?.label }}</strong
        >?
      </p>
      <p class="text-secondary">This will affect any verification requirements using this type.</p>
      <template #footer>
        <VaButton color="secondary" @click="showDeleteModal = false">Cancel</VaButton>
        <VaButton color="danger" :loading="saving" icon="delete" @click="softDelete">Delete</VaButton>
      </template>
    </VaModal>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { useToast } from 'vuestic-ui'
import { documentTypesService, type DocumentType } from '../../../../services/documentTypesService'

const { init: notify } = useToast()

const loading = ref(false)
const saving = ref(false)
const documentTypes = ref<DocumentType[]>([])
const searchQuery = ref('')

const showModal = ref(false)
const showDeleteModal = ref(false)
const showDetailModal = ref(false)
const isEditing = ref(false)
const deleteTarget = ref<DocumentType | null>(null)
const selectedDetail = ref<DocumentType | null>(null)

const form = ref({
  id: 0,
  code: '',
  label: '',
  description: '',
  is_active: true,
})

const columns = [
  { key: 'code', label: 'Code', sortable: true },
  { key: 'label', label: 'Label', sortable: true },
  { key: 'description', label: 'Description' },
  { key: 'is_active', label: 'Status', sortable: true },
  { key: 'actions', label: 'Actions' },
]

const totalCount = computed(() => documentTypes.value.length)
const activeCount = computed(() => documentTypes.value.filter((d) => d.is_active).length)
const inactiveCount = computed(() => documentTypes.value.filter((d) => !d.is_active).length)

const filteredTypes = computed(() => {
  if (!searchQuery.value) return documentTypes.value
  const q = searchQuery.value.toLowerCase()
  return documentTypes.value.filter((d) => d.code.toLowerCase().includes(q) || d.label.toLowerCase().includes(q))
})

const loadData = async () => {
  loading.value = true
  try {
    documentTypes.value = await documentTypesService.list()
  } catch (error) {
    console.error('Failed to load document types:', error)
    notify({ message: 'Failed to load document types', color: 'danger' })
  } finally {
    loading.value = false
  }
}

const resetForm = () => {
  form.value = { id: 0, code: '', label: '', description: '', is_active: true }
}

const openCreate = () => {
  resetForm()
  isEditing.value = false
  showModal.value = true
}

const openEdit = (row: DocumentType) => {
  form.value = {
    id: row.id,
    code: row.code,
    label: row.label,
    description: row.description || '',
    is_active: row.is_active,
  }
  isEditing.value = true
  showModal.value = true
}

const save = async () => {
  if (!form.value.code.trim() || !form.value.label.trim()) {
    notify({ message: 'Code and label are required', color: 'warning' })
    return
  }

  saving.value = true
  try {
    const payload = {
      code: form.value.code.trim(),
      label: form.value.label.trim(),
      description: form.value.description,
      is_active: form.value.is_active,
    }

    if (isEditing.value) {
      await documentTypesService.update(form.value.id, payload)
      notify({ message: 'Document type updated successfully', color: 'success' })
    } else {
      await documentTypesService.create(payload)
      notify({ message: 'Document type created successfully', color: 'success' })
    }

    showModal.value = false
    await loadData()
  } catch (error: any) {
    console.error('Failed to save document type:', error)
    const msg = error?.response?.data?.detail || error?.response?.data?.code?.[0] || 'Failed to save document type'
    notify({ message: String(msg), color: 'danger' })
  } finally {
    saving.value = false
  }
}

const toggleActive = async (row: DocumentType) => {
  try {
    await documentTypesService.update(row.id, { is_active: !row.is_active })
    notify({ message: `Document type ${!row.is_active ? 'activated' : 'deactivated'}`, color: 'success' })
    await loadData()
  } catch (error) {
    console.error('Failed to toggle document type:', error)
    notify({ message: 'Failed to update document type', color: 'danger' })
  }
}

const trimDescription = (text: string, max = 60) => {
  if (!text) return '—'
  return text.length > max ? `${text.slice(0, max)}...` : text
}

const openDetail = (row: DocumentType) => {
  selectedDetail.value = row
  showDetailModal.value = true
}

const confirmDelete = (row: DocumentType) => {
  deleteTarget.value = row
  showDeleteModal.value = true
}

const softDelete = async () => {
  if (!deleteTarget.value) return
  saving.value = true
  try {
    await documentTypesService.remove(deleteTarget.value.id)
    notify({ message: 'Document type deleted successfully', color: 'success' })
    showDeleteModal.value = false
    deleteTarget.value = null
    await loadData()
  } catch (error) {
    console.error('Failed to delete document type:', error)
    notify({ message: 'Failed to delete document type', color: 'danger' })
  } finally {
    saving.value = false
  }
}

onMounted(() => {
  loadData()
})
</script>

<style scoped>
.table-actions {
  display: flex;
  gap: 0.5rem;
  flex-wrap: wrap;
}

.description-cell {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  max-width: 300px;
}
.description-text {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.detail-content {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}
.detail-row {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}
.detail-row-block {
  flex-direction: column;
  align-items: flex-start;
}
.detail-label {
  font-size: 0.75rem;
  font-weight: 600;
  color: var(--va-text-secondary);
  text-transform: uppercase;
  letter-spacing: 0.5px;
  min-width: 110px;
}
.detail-description {
  margin: 0;
  white-space: pre-wrap;
  word-break: break-word;
}

.code-badge {
  display: inline-block;
  padding: 0.15rem 0.5rem;
  border-radius: 4px;
  background: var(--va-background-element);
  font-size: 0.85rem;
  font-family: monospace;
}

.modal-form {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  padding: 0.5rem 0;
}
</style>
