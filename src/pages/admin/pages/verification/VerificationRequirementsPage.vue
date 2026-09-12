<template>
  <div class="flex flex-col gap-4">
    <!-- Statistics Cards -->
    <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
      <VaCard>
        <VaCardContent>
          <div class="flex flex-col">
            <span class="text-secondary text-sm">Total Requirements</span>
            <span class="text-2xl font-bold">{{ totalCount }}</span>
          </div>
        </VaCardContent>
      </VaCard>
      <VaCard>
        <VaCardContent>
          <div class="flex flex-col">
            <span class="text-secondary text-sm">Required</span>
            <span class="text-2xl font-bold text-danger">{{ requiredCount }}</span>
          </div>
        </VaCardContent>
      </VaCard>
      <VaCard>
        <VaCardContent>
          <div class="flex flex-col">
            <span class="text-secondary text-sm">Roles Covered</span>
            <span class="text-2xl font-bold text-success">{{ rolesCovered }}</span>
          </div>
        </VaCardContent>
      </VaCard>
    </div>

    <!-- Main Table Card -->
    <VaCard>
      <VaCardTitle>
        <h1 class="card-title">Verification Requirements</h1>
      </VaCardTitle>
      <VaCardContent>
        <div class="flex flex-col gap-4 mb-4">
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <VaSelect
              v-model="roleFilter"
              placeholder="Filter by role"
              :options="roleFilterOptions"
              text-by="label"
              value-by="value"
              clearable
              @update:modelValue="loadData"
            />
            <VaSelect
              v-model="requiredFilter"
              placeholder="Filter by status"
              :options="requiredFilterOptions"
              text-by="label"
              value-by="value"
              clearable
              @update:modelValue="loadData"
            />
          </div>
          <div class="flex justify-between items-center">
            <VaButton preset="secondary" icon="refresh" @click="loadData">Refresh</VaButton>
            <VaButton icon="add" color="primary" @click="openCreate">New Requirement</VaButton>
          </div>
        </div>

        <VaDataTable :items="requirements" :loading="loading" :columns="columns" hoverable striped>
          <template #cell(role)="{ value }">
            <VaBadge :text="roleLabel(Number(value))" color="primary" />
          </template>
          <template #cell(document_type)="{ rowData }">
            <VaBadge :text="docTypeLabel(rowData as VerificationRequirement)" color="info" />
          </template>
          <template #cell(is_required)="{ value }">
            <VaBadge :text="value ? 'Required' : 'Optional'" :color="value ? 'danger' : 'secondary'" />
          </template>
          <template #cell(sort_order)="{ value }">
            <span class="sort-badge">{{ value }}</span>
          </template>
          <template #cell(description)="{ rowData }">
            <div class="description-cell">
              <span class="description-text">{{
                trimDescription((rowData as VerificationRequirement).description)
              }}</span>
              <VaButton
                v-if="(rowData as VerificationRequirement).description"
                size="small"
                preset="primary"
                icon="visibility"
                @click="openDetail(rowData as VerificationRequirement)"
              />
            </div>
          </template>
          <template #cell(actions)="{ rowData }">
            <div class="table-actions">
              <VaButton size="small" preset="primary" icon="edit" @click="openEdit(rowData as VerificationRequirement)"
                >Edit</VaButton
              >
              <VaButton
                size="small"
                preset="primary"
                :icon="(rowData as VerificationRequirement).is_required ? 'toggle_off' : 'toggle_on'"
                :color="(rowData as VerificationRequirement).is_required ? 'warning' : 'success'"
                @click="toggleRequired(rowData as VerificationRequirement)"
              >
                {{ (rowData as VerificationRequirement).is_required ? 'Make Optional' : 'Make Required' }}
              </VaButton>
              <VaButton
                size="small"
                preset="primary"
                icon="delete"
                color="danger"
                @click="confirmDelete(rowData as VerificationRequirement)"
              />
            </div>
          </template>
        </VaDataTable>
      </VaCardContent>
    </VaCard>

    <!-- Create / Edit Modal -->
    <VaModal
      v-model="showModal"
      :title="isEditing ? 'Edit Requirement' : 'New Requirement'"
      size="large"
      hide-default-actions
    >
      <div class="modal-form">
        <VaSelect v-model="form.role" label="Role" :options="ROLE_OPTIONS" text-by="label" value-by="value" required />
        <div class="document-type-field">
          <VaSelect
            v-model="form.document_type_ref"
            label="Document Type"
            :options="documentTypeOptions"
            text-by="label"
            value-by="value"
            class="document-type-select"
            required
          />
          <VaButton preset="primary" icon="add" @click="openDocumentTypeModal">New Type</VaButton>
        </div>
        <VaInput v-model="form.label" label="Label" required />
        <VaSwitch v-model="form.is_required" label="Required" />
        <VaInput v-model.number="form.sort_order" type="number" label="Sort Order" />
        <VaTextarea v-model="form.description" label="Description" :min-rows="2" />
      </div>
      <template #footer>
        <VaButton color="secondary" @click="showModal = false">Cancel</VaButton>
        <VaButton :loading="saving" @click="save">{{ isEditing ? 'Update' : 'Create' }}</VaButton>
      </template>
    </VaModal>

    <!-- Create Document Type Modal -->
    <VaModal v-model="showDocumentTypeModal" title="New Document Type" size="small" hide-default-actions>
      <div class="modal-form">
        <VaInput v-model="newDocumentType.code" label="Code (e.g. practice_license)" required />
        <VaInput v-model="newDocumentType.label" label="Label (e.g. Practice License)" required />
        <VaTextarea v-model="newDocumentType.description" label="Description" :min-rows="2" />
      </div>
      <template #footer>
        <VaButton color="secondary" @click="showDocumentTypeModal = false">Cancel</VaButton>
        <VaButton :loading="saving" @click="createDocumentTypeFromRequirement">Create</VaButton>
      </template>
    </VaModal>

    <!-- Detail Modal -->
    <VaModal v-model="showDetailModal" title="Requirement Details" size="medium" hide-default-actions>
      <div v-if="selectedDetail" class="detail-content">
        <div class="detail-row">
          <span class="detail-label">Role</span>
          <VaBadge :text="roleLabel(selectedDetail.role)" color="primary" />
        </div>
        <div class="detail-row">
          <span class="detail-label">Document Type</span>
          <VaBadge :text="docTypeLabel(selectedDetail)" color="info" />
        </div>
        <div class="detail-row">
          <span class="detail-label">Label</span>
          <span>{{ selectedDetail.label }}</span>
        </div>
        <div class="detail-row">
          <span class="detail-label">Status</span>
          <VaBadge
            :text="selectedDetail.is_required ? 'Required' : 'Optional'"
            :color="selectedDetail.is_required ? 'danger' : 'secondary'"
          />
        </div>
        <div class="detail-row">
          <span class="detail-label">Sort Order</span>
          <span>{{ selectedDetail.sort_order }}</span>
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
    <VaModal v-model="showDeleteModal" title="Delete Requirement" hide-default-actions>
      <p>
        Are you sure you want to delete the requirement <strong>{{ deleteTarget?.label }}</strong
        >?
      </p>
      <p class="text-secondary">This action cannot be undone.</p>
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
import {
  verificationRequirementsService,
  type VerificationRequirement,
  DOCUMENT_TYPE_FALLBACKS,
  ROLE_OPTIONS,
} from '../../../../services/verificationRequirementsService'
import { documentTypesService, type DocumentType } from '../../../../services/documentTypesService'

const { init: notify } = useToast()

const loading = ref(false)
const saving = ref(false)
const requirements = ref<VerificationRequirement[]>([])
const documentTypes = ref<DocumentType[]>([])

const documentTypeOptions = computed(() =>
  documentTypes.value.length > 0
    ? documentTypes.value.map((d) => ({ value: d.id, label: d.label }))
    : DOCUMENT_TYPE_FALLBACKS,
)

const roleFilter = ref<number | ''>('')
const requiredFilter = ref<boolean | ''>('')

const roleFilterOptions = ROLE_OPTIONS.map((r) => ({ value: r.value, label: r.label }))
const requiredFilterOptions = [
  { value: true, label: 'Required' },
  { value: false, label: 'Optional' },
]

const showModal = ref(false)
const showDeleteModal = ref(false)
const showDocumentTypeModal = ref(false)
const showDetailModal = ref(false)
const isEditing = ref(false)
const deleteTarget = ref<VerificationRequirement | null>(null)
const selectedDetail = ref<VerificationRequirement | null>(null)

const newDocumentType = ref({ code: '', label: '', description: '' })

const form = ref({
  id: 0,
  role: 1 as number,
  document_type_ref: 0 as number,
  label: '',
  is_required: true,
  sort_order: 0,
  description: '',
})

const columns = [
  { key: 'role', label: 'Role', sortable: true },
  { key: 'document_type', label: 'Document Type', sortable: true },
  { key: 'label', label: 'Label', sortable: true },
  { key: 'is_required', label: 'Status', sortable: true },
  { key: 'sort_order', label: 'Order', sortable: true },
  { key: 'description', label: 'Description' },
  { key: 'actions', label: 'Actions' },
]

const totalCount = computed(() => requirements.value.length)
const requiredCount = computed(() => requirements.value.filter((r) => r.is_required).length)
const rolesCovered = computed(() => new Set(requirements.value.map((r) => r.role)).size)

const roleLabel = (roleValue: number) => {
  const role = ROLE_OPTIONS.find((r) => r.value === roleValue)
  return role ? role.label : `Role ${roleValue}`
}

const docTypeLabel = (row: VerificationRequirement) => {
  if (row.document_type_label) return row.document_type_label
  if (row.document_type_display) return row.document_type_display
  const doc = documentTypeOptions.value.find((d) => d.value === row.document_type_ref)
  if (doc) return doc.label
  const fallback = DOCUMENT_TYPE_FALLBACKS.find((d) => d.value === row.document_type)
  return fallback ? fallback.label : row.document_type || '—'
}

const loadData = async () => {
  loading.value = true
  try {
    const filters: Record<string, boolean | number | undefined> = {}
    if (roleFilter.value !== '') filters.role = roleFilter.value
    if (requiredFilter.value !== '') filters.is_required = requiredFilter.value

    const data = await verificationRequirementsService.list(filters)
    requirements.value = Array.isArray(data) ? data : data.results
  } catch (error) {
    console.error('Failed to load requirements:', error)
    notify({ message: 'Failed to load requirements', color: 'danger' })
  } finally {
    loading.value = false
  }
}

const resetForm = () => {
  form.value = {
    id: 0,
    role: 1,
    document_type_ref: Number(documentTypeOptions.value[0]?.value ?? 0),
    label: '',
    is_required: true,
    sort_order: 0,
    description: '',
  }
}

const openCreate = () => {
  resetForm()
  isEditing.value = false
  showModal.value = true
}

const openEdit = (row: VerificationRequirement) => {
  form.value = {
    id: row.id,
    role: row.role,
    document_type_ref: row.document_type_ref ?? 0,
    label: row.label,
    is_required: row.is_required,
    sort_order: row.sort_order,
    description: row.description,
  }
  isEditing.value = true
  showModal.value = true
}

const save = async () => {
  if (!form.value.label.trim()) {
    notify({ message: 'Label is required', color: 'warning' })
    return
  }

  saving.value = true
  try {
    const payload = {
      role: form.value.role,
      document_type_ref: form.value.document_type_ref,
      label: form.value.label,
      is_required: form.value.is_required,
      sort_order: form.value.sort_order,
      description: form.value.description,
    }

    if (isEditing.value) {
      await verificationRequirementsService.update(form.value.id, payload)
      notify({ message: 'Requirement updated successfully', color: 'success' })
    } else {
      await verificationRequirementsService.create(payload)
      notify({ message: 'Requirement created successfully', color: 'success' })
    }

    showModal.value = false
    await loadData()
  } catch (error) {
    console.error('Failed to save requirement:', error)
    notify({ message: 'Failed to save requirement', color: 'danger' })
  } finally {
    saving.value = false
  }
}

const toggleRequired = async (row: VerificationRequirement) => {
  try {
    await verificationRequirementsService.update(row.id, { is_required: !row.is_required })
    notify({
      message: `Requirement is now ${!row.is_required ? 'required' : 'optional'}`,
      color: 'success',
    })
    await loadData()
  } catch (error) {
    console.error('Failed to toggle requirement:', error)
    notify({ message: 'Failed to update requirement', color: 'danger' })
  }
}

const openDocumentTypeModal = () => {
  newDocumentType.value = { code: '', label: '', description: '' }
  showDocumentTypeModal.value = true
}

const createDocumentTypeFromRequirement = async () => {
  if (!newDocumentType.value.code.trim() || !newDocumentType.value.label.trim()) {
    notify({ message: 'Code and label are required', color: 'warning' })
    return
  }

  saving.value = true
  try {
    const created = await documentTypesService.create({
      code: newDocumentType.value.code.trim(),
      label: newDocumentType.value.label.trim(),
      description: newDocumentType.value.description,
      is_active: true,
    })
    notify({ message: 'Document type created', color: 'success' })
    showDocumentTypeModal.value = false
    await loadDocumentTypes()
    form.value.document_type_ref = created.id
  } catch (error: any) {
    console.error('Failed to create document type:', error)
    const msg = error?.response?.data?.detail || error?.response?.data?.code?.[0] || 'Failed to create document type'
    notify({ message: String(msg), color: 'danger' })
  } finally {
    saving.value = false
  }
}

const trimDescription = (text: string, max = 60) => {
  if (!text) return '—'
  return text.length > max ? `${text.slice(0, max)}...` : text
}

const openDetail = (row: VerificationRequirement) => {
  selectedDetail.value = row
  showDetailModal.value = true
}

const confirmDelete = (row: VerificationRequirement) => {
  deleteTarget.value = row
  showDeleteModal.value = true
}

const softDelete = async () => {
  if (!deleteTarget.value) return
  saving.value = true
  try {
    await verificationRequirementsService.remove(deleteTarget.value.id)
    notify({ message: 'Requirement deleted successfully', color: 'success' })
    showDeleteModal.value = false
    deleteTarget.value = null
    await loadData()
  } catch (error) {
    console.error('Failed to delete requirement:', error)
    notify({ message: 'Failed to delete requirement', color: 'danger' })
  } finally {
    saving.value = false
  }
}

const loadDocumentTypes = async () => {
  try {
    documentTypes.value = await documentTypesService.list()
  } catch (error) {
    console.error('Failed to load document types:', error)
  }
}

onMounted(async () => {
  await loadDocumentTypes()
  await loadData()
})
</script>

<style scoped>
.document-type-field {
  display: flex;
  align-items: flex-start;
  gap: 0.75rem;
}
.document-type-select {
  flex: 1;
}

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

.sort-badge {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 28px;
  height: 28px;
  border-radius: 50%;
  background: var(--va-background-element);
  font-weight: 600;
  font-size: 0.85rem;
}

.modal-form {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  padding: 0.5rem 0;
}
</style>
