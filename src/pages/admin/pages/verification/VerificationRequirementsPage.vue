<template>
  <div class="verification-requirements-page">
    <div class="page-header">
      <div>
        <h1 class="page-title">Verification Requirements</h1>
        <p class="page-subtitle">Manage document requirements per user role for the verification flow</p>
      </div>
      <div class="header-actions">
        <VaButton icon="add" color="primary" @click="openCreate">New Requirement</VaButton>
      </div>
    </div>

    <div class="stats-row">
      <VaCard class="stat-chip">
        <VaCardContent>
          <div class="stat-chip-inner">
            <VaIcon name="rule" color="primary" />
            <div>
              <div class="stat-value">{{ totalCount }}</div>
              <div class="stat-label">Total Requirements</div>
            </div>
          </div>
        </VaCardContent>
      </VaCard>
      <VaCard class="stat-chip">
        <VaCardContent>
          <div class="stat-chip-inner">
            <VaIcon name="mandatory" color="danger" />
            <div>
              <div class="stat-value">{{ requiredCount }}</div>
              <div class="stat-label">Required</div>
            </div>
          </div>
        </VaCardContent>
      </VaCard>
      <VaCard class="stat-chip">
        <VaCardContent>
          <div class="stat-chip-inner">
            <VaIcon name="group" color="success" />
            <div>
              <div class="stat-value">{{ rolesCovered }}</div>
              <div class="stat-label">Roles Covered</div>
            </div>
          </div>
        </VaCardContent>
      </VaCard>
    </div>

    <VaCard class="my-4">
      <VaCardContent>
        <div class="toolbar">
          <VaSelect
            v-model="roleFilter"
            placeholder="All roles"
            :options="roleFilterOptions"
            text-by="label"
            value-by="value"
            clearable
          />
          <VaSelect
            v-model="requiredFilter"
            placeholder="Required status"
            :options="requiredFilterOptions"
            text-by="label"
            value-by="value"
            clearable
          />
          <VaButton preset="secondary" icon="refresh" @click="loadData">Refresh</VaButton>
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
        <VaSelect
          v-model="form.document_type_ref"
          label="Document Type"
          :options="documentTypeOptions"
          text-by="label"
          value-by="value"
          required
        />
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
const isEditing = ref(false)
const deleteTarget = ref<VerificationRequirement | null>(null)

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
.verification-requirements-page {
  padding: 1.5rem;
  max-width: 1400px;
  margin: 0 auto;
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 1.5rem;
  flex-wrap: wrap;
  gap: 1rem;
}

.page-title {
  font-size: 1.75rem;
  font-weight: 700;
  margin: 0 0 0.25rem 0;
}

.page-subtitle {
  color: var(--va-text-secondary);
  margin: 0;
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
  min-width: 180px;
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

.toolbar {
  display: flex;
  gap: 1rem;
  margin-bottom: 1rem;
  flex-wrap: wrap;
  align-items: center;
}

.table-actions {
  display: flex;
  gap: 0.5rem;
  flex-wrap: wrap;
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

@media (max-width: 768px) {
  .verification-requirements-page {
    padding: 1rem;
  }

  .stats-row {
    flex-direction: column;
  }

  .stat-chip {
    min-width: 100%;
  }
}
</style>
