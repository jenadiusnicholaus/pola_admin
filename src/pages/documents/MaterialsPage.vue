<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { useDocuments } from '../../composables'

const { materials, isLoading, totalCount, fetchMaterials, approveMaterial, rejectMaterial } = useDocuments()

const filters = ref({
  status: '',
  category: '',
  email: '',
})

const showRejectModal = ref(false)
const selectedMaterialId = ref<number | null>(null)
const rejectNote = ref('')

onMounted(() => {
  fetchMaterials()
})

const handleSearch = () => {
  fetchMaterials(filters.value)
}

const handleApprove = async (id: number) => {
  if (confirm('Approve this material?')) {
    await approveMaterial(id, { admin_note: 'Approved' })
    await fetchMaterials()
  }
}

const openRejectModal = (id: number) => {
  selectedMaterialId.value = id
  rejectNote.value = ''
  showRejectModal.value = true
}

const handleReject = async () => {
  if (!selectedMaterialId.value) return

  await rejectMaterial(selectedMaterialId.value, { admin_note: rejectNote.value })
  showRejectModal.value = false
  await fetchMaterials()
}

const columns = [
  { key: 'title', label: 'Title', sortable: true },
  { key: 'category_display', label: 'Category', sortable: true },
  { key: 'uploader', label: 'Uploader', sortable: false },
  { key: 'uploader_type_display', label: 'Uploader Type', sortable: true },
  { key: 'file_size_mb', label: 'Size (MB)', sortable: true },
  { key: 'price', label: 'Price (TZS)', sortable: true },
  { key: 'downloads_count', label: 'Downloads', sortable: true },
  { key: 'is_approved', label: 'Status', sortable: true },
  { key: 'created_at', label: 'Uploaded', sortable: true },
  { key: 'actions', label: 'Actions', width: '200px' },
]

const getStatusColor = (isApproved: boolean | null) => {
  if (isApproved === true) return 'success'
  if (isApproved === false) return 'danger'
  return 'warning' // null or pending
}

const getStatusText = (isApproved: boolean | null) => {
  if (isApproved === true) return 'Approved'
  if (isApproved === false) return 'Rejected'
  return 'Pending'
}

const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  })
}

const formatPrice = (price: string) => {
  return `TZS ${parseFloat(price).toLocaleString()}`
}

const getUploaderName = (uploader: any) => {
  if (uploader.first_name || uploader.last_name) {
    return `${uploader.first_name} ${uploader.last_name}`.trim()
  }
  return uploader.email
}
</script>

<template>
  <div class="materials-page">
    <div class="page-header">
      <div>
        <h1 class="page-title">Learning Materials</h1>
        <p class="page-subtitle">Review and approve learning materials</p>
      </div>
    </div>

    <VaCard>
      <VaCardContent>
        <div class="filters">
          <VaInput v-model="filters.email" placeholder="Search by uploader email" clearable>
            <template #prependInner>
              <VaIcon name="search" />
            </template>
          </VaInput>

          <VaSelect
            v-model="filters.status"
            placeholder="All Statuses"
            :options="['', 'pending', 'approved', 'rejected']"
            clearable
          />

          <VaSelect
            v-model="filters.category"
            placeholder="All Categories"
            :options="['', 'notes', 'past_papers', 'textbooks', 'guides']"
            clearable
          />

          <VaButton @click="handleSearch">Search</VaButton>
          <VaButton preset="secondary" @click="filters = { status: '', category: '', email: '' }">Clear</VaButton>
        </div>
      </VaCardContent>
    </VaCard>

    <VaCard>
      <VaCardContent>
        <VaDataTable :items="materials" :columns="columns" :loading="isLoading" striped hoverable>
          <template #cell(title)="{ rowData }">
            <div class="title-cell">
              <VaIcon name="description" size="small" />
              <div>
                <div class="title-text">{{ rowData.title }}</div>
                <div class="description-text">{{ rowData.description }}</div>
              </div>
            </div>
          </template>

          <template #cell(uploader)="{ rowData }">
            <div class="user-cell">
              <VaIcon name="person" size="small" />
              <div>
                <div>{{ getUploaderName(rowData.uploader) }}</div>
                <div class="email-text">{{ rowData.uploader.email }}</div>
              </div>
            </div>
          </template>

          <template #cell(file_size_mb)="{ rowData }">
            <span>{{ rowData.file_size_mb }} MB</span>
          </template>

          <template #cell(price)="{ rowData }">
            <strong>{{ formatPrice(rowData.price) }}</strong>
          </template>

          <template #cell(downloads_count)="{ rowData }">
            <VaBadge :text="String(rowData.downloads_count)" color="info" />
          </template>

          <template #cell(is_approved)="{ rowData }">
            <VaBadge :text="getStatusText(rowData.is_approved)" :color="getStatusColor(rowData.is_approved)" />
          </template>

          <template #cell(created_at)="{ rowData }">
            <span>{{ formatDate(rowData.created_at) }}</span>
          </template>

          <template #cell(actions)="{ rowData }">
            <div class="actions-cell">
              <VaButton
                v-if="rowData.is_approved === null || rowData.is_approved === false"
                preset="plain"
                icon="check"
                color="success"
                size="small"
                @click="handleApprove(rowData.id)"
              >
                Approve
              </VaButton>
              <VaButton
                v-if="rowData.is_approved === null || rowData.is_approved === true"
                preset="plain"
                icon="close"
                color="danger"
                size="small"
                @click="openRejectModal(rowData.id)"
              >
                Reject
              </VaButton>
              <VaButton preset="plain" icon="visibility" size="small" :href="rowData.file" target="_blank">
                View
              </VaButton>
              <VaButton preset="plain" icon="download" size="small" :href="rowData.file" download> Download </VaButton>
            </div>
          </template>
        </VaDataTable>

        <div class="pagination-info">
          <span>Total: {{ totalCount }} materials</span>
        </div>
      </VaCardContent>
    </VaCard>

    <VaModal v-model="showRejectModal" title="Reject Material" size="small">
      <div class="modal-form">
        <VaTextarea
          v-model="rejectNote"
          label="Rejection Reason"
          placeholder="Explain why this material is being rejected..."
          required
          :min-rows="4"
        />
      </div>

      <template #footer>
        <VaButton preset="secondary" @click="showRejectModal = false">Cancel</VaButton>
        <VaButton color="danger" @click="handleReject">Reject Material</VaButton>
      </template>
    </VaModal>
  </div>
</template>

<style scoped>
.materials-page {
  padding: 2rem;
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.page-title {
  font-size: 2rem;
  font-weight: 700;
  margin: 0;
  color: #1a1a1a;
}

.page-subtitle {
  font-size: 1rem;
  color: #6b7280;
  margin: 0.5rem 0 0 0;
}

.filters {
  display: grid;
  grid-template-columns: 1fr 200px 200px auto auto;
  gap: 1rem;
  align-items: end;
}

.title-cell,
.user-cell {
  display: flex;
  align-items: flex-start;
  gap: 0.5rem;
}

.title-text {
  font-weight: 600;
  color: #1a1a1a;
}

.description-text {
  font-size: 0.875rem;
  color: #6b7280;
  margin-top: 0.25rem;
}

.email-text {
  font-size: 0.875rem;
  color: #6b7280;
}

.actions-cell {
  display: flex;
  gap: 0.5rem;
  flex-wrap: wrap;
}

.pagination-info {
  margin-top: 1rem;
  padding-top: 1rem;
  border-top: 1px solid #e5e7eb;
  text-align: right;
  color: #6b7280;
  font-size: 0.875rem;
}

.modal-form {
  padding: 1rem 0;
}

@media (max-width: 768px) {
  .materials-page {
    padding: 1rem;
  }

  .page-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 1rem;
  }

  .filters {
    grid-template-columns: 1fr;
  }

  .actions-cell {
    flex-direction: column;
  }
}
</style>
