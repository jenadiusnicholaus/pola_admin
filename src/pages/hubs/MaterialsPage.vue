<template>
  <div class="materials-page">
    <!-- Header with Back Button -->
    <div class="page-header">
      <VaButton icon="arrow_back" preset="plain" @click="goBack">Back to Subtopics</VaButton>
      <div v-if="selectedSubtopic">
        <h1 class="page-title">{{ selectedSubtopic.name }}</h1>
        <p class="page-subtitle">{{ selectedSubtopic.name_sw }}</p>
      </div>
      <div v-else>
        <h1 class="page-title">Materials</h1>
      </div>
    </div>

    <!-- Toolbar -->
    <VaCard class="my-6">
      <VaCardContent>
        <div class="toolbar">
          <div class="search-filters">
            <VaInput v-model="searchQuery" placeholder="Search materials..." clearable>
              <template #prependInner>
                <VaIcon name="search" />
              </template>
            </VaInput>

            <VaSelect v-model="typeFilter" placeholder="Type" :options="typeOptions" clearable />

            <VaSelect v-model="statusFilter" placeholder="Status" :options="statusOptions" clearable />

            <VaButton icon="refresh" @click="loadData" />
          </div>
          <VaButton icon="add" @click="openCreateModal">Add Material</VaButton>
        </div>
      </VaCardContent>
    </VaCard>

    <!-- Materials List -->
    <div v-if="loading" class="loading-container">
      <VaProgressCircle indeterminate />
      <p>Loading materials...</p>
    </div>

    <div v-else-if="materials.length === 0" class="empty-state">
      <VaIcon name="inbox" size="4rem" color="secondary" />
      <p class="empty-message">No materials found</p>
    </div>

    <div v-else class="materials-list">
      <VaCard
        v-for="material in materials"
        :key="material.id"
        class="material-card"
        :class="{ inactive: !material.is_active }"
      >
        <VaCardContent>
          <div class="material-header">
            <div class="material-type">
              <VaIcon :name="getMaterialIcon(material.category)" size="2rem" />
              <VaBadge :text="material.category_display || material.category" />
            </div>
            <div class="material-badges">
              <VaBadge v-if="material.is_approved === true" text="Approved" color="success" />
              <VaBadge v-else-if="material.is_approved === false" text="Rejected" color="danger" />
              <VaBadge v-else text="Pending" color="warning" />
              <VaBadge
                :text="material.is_active ? 'Active' : 'Inactive'"
                :color="material.is_active ? 'success' : 'danger'"
              />
              <VaBadge :text="material.uploader_type_display || material.uploader_type" color="info" />
            </div>
          </div>

          <h3 class="material-title">{{ material.title }}</h3>
          <p v-if="material.description" class="material-description">{{ material.description }}</p>

          <!-- File Preview -->
          <div v-if="material.file" class="file-preview">
            <div v-if="isImageFile(material.file)" class="preview-image">
              <img :src="getFileUrl(material.file)" :alt="material.title" @click="openFilePreview(material)" />
            </div>
            <div v-else-if="isPdfFile(material.file)" class="preview-pdf">
              <VaIcon name="picture_as_pdf" size="3rem" color="danger" />
              <span class="preview-label">PDF Document</span>
              <VaButton size="small" @click="openFilePreview(material)">Preview</VaButton>
            </div>
            <div v-else class="preview-file">
              <VaIcon :name="getFileIcon(material.file)" size="3rem" />
              <span class="preview-label">{{ getFileType(material.file) }}</span>
              <VaButton size="small" @click="openFilePreview(material)">Open</VaButton>
            </div>
          </div>

          <div class="material-info">
            <div class="info-item">
              <VaIcon name="person" size="small" />
              <span>
                {{
                  material.uploader?.first_name && material.uploader?.last_name
                    ? `${material.uploader.first_name} ${material.uploader.last_name}`
                    : material.uploader?.email || 'Unknown'
                }}
              </span>
            </div>
            <div class="info-item">
              <VaIcon name="attach_money" size="small" />
              <span>TZS {{ formatPrice(material.price) }}</span>
            </div>
            <div class="info-item">
              <VaIcon name="download" size="small" />
              <span>{{ material.downloads_count || 0 }} downloads</span>
            </div>
            <div class="info-item">
              <VaIcon name="calendar_today" size="small" />
              <span>{{ formatDate(material.created_at) }}</span>
            </div>
            <div v-if="material.file" class="info-item">
              <VaIcon name="attachment" size="small" />
              <span>{{ material.file_size_mb }} MB</span>
            </div>
          </div>

          <div class="material-actions">
            <VaButton v-if="material.file" size="small" preset="plain" icon="download" @click="downloadFile(material)">
              Download
            </VaButton>
            <VaButton size="small" preset="plain" icon="visibility" @click="viewMaterial(material)">View</VaButton>
            <VaButton size="small" preset="plain" icon="edit" @click="editMaterial(material)">Edit</VaButton>
            <VaButton
              v-if="material.is_approved === null"
              size="small"
              preset="plain"
              icon="check"
              color="success"
              @click="approveMaterial(material)"
            >
              Approve
            </VaButton>
            <VaButton
              v-if="material.is_approved === null"
              size="small"
              preset="plain"
              icon="close"
              color="danger"
              @click="rejectMaterial(material)"
            >
              Reject
            </VaButton>
            <VaButton
              size="small"
              preset="plain"
              :icon="material.is_active ? 'toggle_on' : 'toggle_off'"
              @click="toggleMaterial(material)"
            >
              Toggle
            </VaButton>
            <VaButton size="small" preset="plain" icon="delete" color="danger" @click="deleteMaterial(material)">
              Delete
            </VaButton>
          </div>
        </VaCardContent>
      </VaCard>
    </div>

    <!-- View Material Modal -->
    <VaModal v-model="showViewModal" title="Material Details" size="large" hide-default-actions fullscreen>
      <div v-if="selectedMaterial" class="material-details">
        <div class="detail-row">
          <strong>Title:</strong>
          <span>{{ selectedMaterial.title }}</span>
        </div>
        <div class="detail-row">
          <strong>Description:</strong>
          <span>{{ selectedMaterial.description || 'N/A' }}</span>
        </div>
        <div class="detail-row">
          <strong>Category:</strong>
          <span>{{ selectedMaterial.category_display || selectedMaterial.category }}</span>
        </div>
        <div class="detail-row">
          <strong>Uploader:</strong>
          <span>
            {{
              selectedMaterial.uploader?.first_name && selectedMaterial.uploader?.last_name
                ? `${selectedMaterial.uploader.first_name} ${selectedMaterial.uploader.last_name}`
                : selectedMaterial.uploader?.email || 'Unknown'
            }}
            ({{ selectedMaterial.uploader_type_display }})
          </span>
        </div>
        <div class="detail-row">
          <strong>Price:</strong>
          <span>TZS {{ formatPrice(selectedMaterial.price) }}</span>
        </div>
        <div class="detail-row">
          <strong>Downloads:</strong>
          <span>{{ selectedMaterial.downloads_count || 0 }}</span>
        </div>
        <div class="detail-row">
          <strong>Revenue:</strong>
          <span>TZS {{ formatPrice(selectedMaterial.total_revenue) }}</span>
        </div>
        <div class="detail-row">
          <strong>File:</strong>
          <span v-if="selectedMaterial.file">
            {{ selectedMaterial.file_size_mb }} MB
            <VaButton size="small" icon="download" @click="downloadFile(selectedMaterial)">Download</VaButton>
          </span>
          <span v-else>No file attached</span>
        </div>

        <!-- File Preview Section -->
        <div v-if="selectedMaterial.file" class="file-preview-section">
          <div class="preview-header">
            <strong>File Preview:</strong>
          </div>
          <div class="preview-content">
            <div v-if="isImageFile(selectedMaterial.file)" class="preview-image-detail">
              <img :src="getFileUrl(selectedMaterial.file)" :alt="selectedMaterial.title" />
            </div>
            <div v-else-if="isPdfFile(selectedMaterial.file)" class="preview-pdf-detail">
              <VuePDF v-if="detailPdf" :pdf="detailPdf" />
              <div v-else class="pdf-loading">
                <VaProgressCircle indeterminate size="small" />
                <p>Loading PDF...</p>
              </div>
            </div>
            <div v-else class="preview-other-file">
              <VaIcon :name="getFileIcon(selectedMaterial.file)" size="4rem" color="primary" />
              <p class="text-secondary mt-2">{{ getFileType(selectedMaterial.file) }}</p>
              <VaButton size="small" icon="download" @click="downloadFile(selectedMaterial)">
                Download to View
              </VaButton>
            </div>
          </div>
        </div>

        <div class="detail-row">
          <strong>Status:</strong>
          <span>
            <VaBadge
              :text="selectedMaterial.is_active ? 'Active' : 'Inactive'"
              :color="selectedMaterial.is_active ? 'success' : 'danger'"
            />
            <VaBadge v-if="selectedMaterial.is_approved === true" text="Approved" color="success" class="ml-2" />
            <VaBadge v-else-if="selectedMaterial.is_approved === false" text="Rejected" color="danger" class="ml-2" />
            <VaBadge v-else text="Pending" color="warning" class="ml-2" />
          </span>
        </div>
        <div class="detail-row">
          <strong>Created:</strong>
          <span>{{ formatDate(selectedMaterial.created_at) }}</span>
        </div>
        <div class="detail-row">
          <strong>Updated:</strong>
          <span>{{ formatDate(selectedMaterial.updated_at) }}</span>
        </div>
      </div>

      <template #footer>
        <VaButton color="secondary" @click="showViewModal = false">Close</VaButton>
        <VaButton
          v-if="selectedMaterial && selectedMaterial.file"
          icon="download"
          @click="downloadFile(selectedMaterial)"
        >
          Download File
        </VaButton>
      </template>
    </VaModal>

    <!-- Edit Material Modal -->
    <VaModal v-model="showEditModal" title="Edit Material" size="large" hide-default-actions>
      <div v-if="editForm" class="modal-form">
        <VaInput v-model="editForm.title" label="Title" required />
        <VaTextarea v-model="editForm.description" label="Description" :min-rows="3" />
        <VaSelect
          v-model="editForm.category"
          label="Category"
          :options="categoryOptions"
          value-by="value"
          text-by="text"
        />
        <VaInput v-model="editForm.price" label="Price (TSh)" type="number" step="0.01" />
        <VaCheckbox v-model="editForm.is_active" label="Active" />
      </div>

      <template #footer>
        <VaButton color="secondary" @click="showEditModal = false">Cancel</VaButton>
        <VaButton @click="saveMaterial">Update Material</VaButton>
      </template>
    </VaModal>

    <!-- Create Material Modal -->
    <VaModal v-model="showCreateModal" title="Create Material" size="large" hide-default-actions>
      <div v-if="createForm" class="modal-form">
        <VaInput v-model="createForm.title" label="Title" required />
        <VaTextarea v-model="createForm.description" label="Description" :min-rows="3" required />
        <VaSelect
          v-model="createForm.category"
          label="Category"
          :options="createCategoryOptions"
          value-by="value"
          text-by="text"
          required
        />
        <VaInput
          v-model="createForm.price"
          label="Price (TSh)"
          type="number"
          step="0.01"
          hint="Use 0 for free materials"
        />
        <VaSelect
          v-model="createForm.content_type"
          label="Content Type"
          :options="contentTypeOptions"
          value-by="value"
          text-by="text"
          required
        />
        <VaFileUpload
          v-if="createForm.content_type === 'file'"
          v-model="createForm.file"
          type="single"
          file-types=".pdf,.doc,.docx,.ppt,.pptx,.xls,.xlsx,.mp4,.mp3,.jpg,.jpeg,.png"
          dropzone
        >
          Upload File (Required for file content)
        </VaFileUpload>
        <VaTextarea
          v-if="createForm.content_type === 'rich_text'"
          v-model="createForm.rich_text_content"
          label="Rich Text Content"
          :min-rows="5"
          required
        />
        <VaSelect
          v-model="createForm.language"
          label="Language"
          :options="languageOptions"
          value-by="value"
          text-by="text"
        />
        <VaCheckbox v-model="createForm.is_downloadable" label="Downloadable" />
        <VaCheckbox v-model="createForm.is_approved" label="Pre-approve Material" />
        <VaCheckbox v-model="createForm.is_active" label="Active" />
      </div>

      <template #footer>
        <VaButton color="secondary" @click="showCreateModal = false">Cancel</VaButton>
        <VaButton :loading="creating" @click="saveNewMaterial">Create Material</VaButton>
      </template>
    </VaModal>

    <!-- File Preview Modal -->
    <VaModal v-model="showFilePreviewModal" size="large" hide-default-actions fullscreen>
      <template #header>
        <h2>{{ previewFile?.title || 'File Preview' }}</h2>
      </template>

      <div v-if="previewFile && previewFile.file" class="file-preview-container">
        <div v-if="isImageFile(previewFile.file)" class="preview-full-image">
          <img :src="getFileUrl(previewFile.file)" :alt="previewFile.title" />
        </div>
        <div v-else-if="isPdfFile(previewFile.file)" class="preview-full-pdf">
          <VuePDF v-if="previewPdf" :pdf="previewPdf" />
          <div v-else class="pdf-loading">
            <VaProgressCircle indeterminate />
            <p>Loading PDF...</p>
          </div>
        </div>
        <div v-else class="preview-full-file">
          <VaIcon :name="getFileIcon(previewFile.file)" size="5rem" color="primary" />
          <h3>{{ previewFile.title }}</h3>
          <p class="text-secondary">{{ getFileType(previewFile.file) }}</p>
          <VaButton icon="download" @click="downloadFile(previewFile)">Download File</VaButton>
        </div>
      </div>
      <div v-else class="file-preview-container">
        <VaIcon name="error_outline" size="5rem" color="warning" />
        <p>No file available for preview</p>
      </div>

      <template #footer>
        <VaButton color="secondary" @click="showFilePreviewModal = false">Close</VaButton>
        <VaButton v-if="previewFile && previewFile.file" icon="download" @click="downloadFile(previewFile)">
          Download
        </VaButton>
      </template>
    </VaModal>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useHubsStore } from '../../stores/hubs-store'
import { useToast } from 'vuestic-ui'
import { VuePDF, usePDF } from '@tato30/vue-pdf'

const route = useRoute()
const router = useRouter()
const { init: notify } = useToast()
const hubsStore = useHubsStore()

// Check if required params exist, if not redirect
if (!route.params.topicId || !route.params.subtopicId) {
  router.replace({ name: 'legal-education' })
}

const topicId = ref<number>(Number(route.params.topicId) || 0)
const subtopicId = ref<number>(Number(route.params.subtopicId) || 0)

// Computed from store
const loading = computed(() => hubsStore.loadingMaterials)
const materials = computed(() => hubsStore.subtopicMaterials)
const selectedSubtopic = computed(() => hubsStore.selectedSubtopic)

// Modal state
const showViewModal = ref(false)
const selectedMaterial = ref<any>(null)
const showEditModal = ref(false)
const editForm = ref<any>(null)
const showCreateModal = ref(false)
const createForm = ref<any>(null)
const creating = ref(false)
const showFilePreviewModal = ref(false)
const previewFile = ref<any>(null)

// PDF loading state
const detailPdfSrc = ref<string>('')
const previewPdfSrc = ref<string>('')

// Load PDF for detail modal
const { pdf: detailPdf } = usePDF(detailPdfSrc)

// Load PDF for preview modal
const { pdf: previewPdf } = usePDF(previewPdfSrc)

// Watch for changes in selected material to load PDF
watch(
  () => selectedMaterial.value,
  (newMaterial) => {
    if (newMaterial && newMaterial.file && isPdfFile(newMaterial.file)) {
      detailPdfSrc.value = getFileUrl(newMaterial.file)
    } else {
      detailPdfSrc.value = ''
    }
  },
)

// Watch for changes in preview file to load PDF
watch(
  () => previewFile.value,
  (newFile) => {
    if (newFile && newFile.file && isPdfFile(newFile.file)) {
      previewPdfSrc.value = getFileUrl(newFile.file)
    } else {
      previewPdfSrc.value = ''
    }
  },
)

// Filters
const searchQuery = ref('')
const typeFilter = ref<string | null>(null)
const statusFilter = ref<boolean | null>(null)

const typeOptions = [
  { text: 'PDF', value: 'pdf' },
  { text: 'Video', value: 'video' },
  { text: 'Audio', value: 'audio' },
  { text: 'Image', value: 'image' },
  { text: 'Document', value: 'document' },
]

const statusOptions = [
  { text: 'Active', value: true },
  { text: 'Inactive', value: false },
]

const categoryOptions = [
  { text: 'PDF', value: 'pdf' },
  { text: 'Video', value: 'video' },
  { text: 'Audio', value: 'audio' },
  { text: 'Notes', value: 'notes' },
  { text: 'Past Papers', value: 'past_papers' },
  { text: 'Hub Content', value: 'hub_content' },
]

const createCategoryOptions = [
  { text: 'Notes', value: 'notes' },
  { text: 'Past Papers', value: 'past_papers' },
  { text: 'Assignments', value: 'assignments' },
  { text: 'Tutorials', value: 'tutorials' },
  { text: 'Hub Content', value: 'hub_content' },
  { text: 'Other', value: 'other' },
]

const contentTypeOptions = [
  { text: 'File Upload', value: 'file' },
  { text: 'Rich Text', value: 'rich_text' },
]

const languageOptions = [
  { text: 'English', value: 'en' },
  { text: 'Swahili', value: 'sw' },
]

// Load data
const loadData = async () => {
  try {
    // Load subtopics first to get subtopic details
    if (!hubsStore.selectedSubtopic || hubsStore.selectedSubtopic.id !== subtopicId.value) {
      await hubsStore.fetchSubtopics({ topic_id: topicId.value })
    }
    // Then load materials
    await hubsStore.fetchSubtopicMaterials(subtopicId.value)
    // Debug: Check if materials have file property
    console.log('Loaded materials:', hubsStore.subtopicMaterials)
    console.log(
      'Materials with files:',
      hubsStore.subtopicMaterials.filter((m: any) => m.file),
    )
  } catch (error: any) {
    notify({
      message: error.message || 'Failed to load materials',
      color: 'danger',
    })
  }
}

// Navigation
const goBack = () => {
  router.push({ name: 'subtopics', params: { topicId: topicId.value } })
}

// Helper to get full file URL
const getFileUrl = (filePath: string) => {
  if (!filePath) return ''
  // If already a full URL (starts with http), return as is
  if (filePath.startsWith('http://') || filePath.startsWith('https://')) {
    return filePath
  }
  // If it's a data URL (base64), return as is
  if (filePath.startsWith('data:')) {
    return filePath
  }
  // Otherwise, prepend the backend base URL
  const backendUrl = import.meta.env.VITE_API_BASE_URL?.replace('/api/v1', '') || 'http://localhost:8000'
  return `${backendUrl}${filePath}`
}

// Material Actions
const downloadFile = (material: any) => {
  if (material.file) {
    const fileUrl = getFileUrl(material.file)
    window.open(fileUrl, '_blank')
  }
}

const viewMaterial = (material: any) => {
  selectedMaterial.value = material
  showViewModal.value = true
}

const editMaterial = (material: any) => {
  editForm.value = {
    id: material.id,
    title: material.title,
    description: material.description || '',
    category: material.category,
    price: material.price,
    is_active: material.is_active,
  }
  showEditModal.value = true
}

const saveMaterial = async () => {
  if (!editForm.value) return

  try {
    await hubsStore.updateMaterial(editForm.value.id, {
      title: editForm.value.title,
      description: editForm.value.description,
      category: editForm.value.category,
      price: editForm.value.price,
      is_active: editForm.value.is_active,
    })

    notify({ message: 'Material updated successfully', color: 'success' })
    showEditModal.value = false
  } catch (error: any) {
    notify({
      message: error.message || 'Failed to update material',
      color: 'danger',
    })
  }
}

const openCreateModal = () => {
  createForm.value = {
    title: '',
    description: '',
    subtopic: subtopicId.value,
    category: 'hub_content',
    price: '0',
    uploader_type: 'admin',
    content_type: 'file',
    file: undefined,
    rich_text_content: '',
    language: 'en',
    is_downloadable: true,
    is_approved: true,
    is_active: true,
  }
  showCreateModal.value = true
}

const saveNewMaterial = async () => {
  if (!createForm.value) return

  // Validate required fields
  if (!createForm.value.title || !createForm.value.description) {
    notify({ message: 'Please fill in all required fields', color: 'warning' })
    return
  }

  if (createForm.value.content_type === 'file' && !createForm.value.file) {
    notify({ message: 'Please upload a file', color: 'warning' })
    return
  }

  if (createForm.value.content_type === 'rich_text' && !createForm.value.rich_text_content) {
    notify({ message: 'Please provide rich text content', color: 'warning' })
    return
  }

  try {
    creating.value = true

    // Prepare data for submission
    const materialData: any = {
      title: createForm.value.title,
      description: createForm.value.description,
      subtopic: createForm.value.subtopic,
      category: createForm.value.category,
      price: createForm.value.price,
      uploader_type: createForm.value.uploader_type,
      content_type: createForm.value.content_type,
      language: createForm.value.language,
      is_downloadable: createForm.value.is_downloadable,
      is_approved: createForm.value.is_approved,
      is_active: createForm.value.is_active,
    }

    // Add file or rich text content based on content type
    if (createForm.value.content_type === 'file' && createForm.value.file) {
      // VaFileUpload returns a single File object, not an array
      const file = Array.isArray(createForm.value.file) ? createForm.value.file[0] : createForm.value.file

      if (file instanceof File) {
        console.log('Converting file to base64:', file.name, file.type, file.size)
        const base64 = await convertFileToBase64(file)
        materialData.file = base64
        console.log('File converted successfully. Base64 length:', base64.length)
      }
    } else if (createForm.value.content_type === 'rich_text') {
      materialData.rich_text_content = createForm.value.rich_text_content
    }

    console.log('Final materialData being sent to store:', materialData)

    await hubsStore.createMaterial(materialData)

    notify({ message: 'Material created successfully', color: 'success' })
    showCreateModal.value = false
  } catch (error: any) {
    notify({
      message: error.message || 'Failed to create material',
      color: 'danger',
    })
  } finally {
    creating.value = false
  }
}

const approveMaterial = async (material: any) => {
  try {
    await hubsStore.approveMaterial(material.id)
    notify({ message: 'Material approved successfully', color: 'success' })
  } catch (error: any) {
    notify({
      message: error.message || 'Failed to approve material',
      color: 'danger',
    })
  }
}

const rejectMaterial = async (material: any) => {
  const reason = prompt('Rejection reason (optional):')
  try {
    await hubsStore.rejectMaterial(material.id, reason || undefined)
    notify({ message: 'Material rejected', color: 'success' })
  } catch (error: any) {
    notify({
      message: error.message || 'Failed to reject material',
      color: 'danger',
    })
  }
}

const toggleMaterial = async (material: any) => {
  try {
    await hubsStore.toggleMaterial(material.id)
    notify({
      message: `Material ${material.is_active ? 'deactivated' : 'activated'}`,
      color: 'success',
    })
  } catch (error: any) {
    notify({
      message: error.message || 'Failed to toggle material',
      color: 'danger',
    })
  }
}

const deleteMaterial = async (material: any) => {
  if (!confirm(`Delete "${material.title}"?`)) return

  try {
    await hubsStore.deleteMaterial(material.id)
    notify({ message: 'Material deleted successfully', color: 'success' })
  } catch (error: any) {
    notify({
      message: error.message || 'Failed to delete material',
      color: 'danger',
    })
  }
}

// Helpers
const getMaterialIcon = (type: string) => {
  if (!type) return 'description'
  const icons: Record<string, string> = {
    pdf: 'picture_as_pdf',
    video: 'video_library',
    audio: 'audio_file',
    image: 'image',
    document: 'description',
  }
  return icons[type.toLowerCase()] || 'description'
}

const formatPrice = (price: number | string) => {
  if (!price && price !== 0) return '0'
  const numPrice = typeof price === 'string' ? parseFloat(price) : price
  return numPrice.toLocaleString()
}

const formatDate = (date: string) => {
  if (!date) return 'N/A'
  return new Date(date).toLocaleDateString()
}

// File type helpers
const isImageFile = (fileUrl: string) => {
  if (!fileUrl) return false
  const imageExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.bmp', '.webp', '.svg']
  return imageExtensions.some((ext) => fileUrl.toLowerCase().includes(ext))
}

const isPdfFile = (fileUrl: string) => {
  if (!fileUrl) return false
  return fileUrl.toLowerCase().includes('.pdf') || fileUrl.toLowerCase().includes('application/pdf')
}

const getFileIcon = (fileUrl: string) => {
  if (!fileUrl) return 'description'
  const url = fileUrl.toLowerCase()
  if (url.includes('.pdf')) return 'picture_as_pdf'
  if (url.includes('.doc') || url.includes('.docx')) return 'description'
  if (url.includes('.xls') || url.includes('.xlsx')) return 'table_chart'
  if (url.includes('.ppt') || url.includes('.pptx')) return 'slideshow'
  if (url.includes('.mp4') || url.includes('.avi') || url.includes('.mov')) return 'video_library'
  if (url.includes('.mp3') || url.includes('.wav')) return 'audio_file'
  if (url.includes('.zip') || url.includes('.rar')) return 'folder_zip'
  return 'insert_drive_file'
}

const getFileType = (fileUrl: string) => {
  if (!fileUrl) return 'File'
  const url = fileUrl.toLowerCase()
  if (url.includes('.pdf')) return 'PDF Document'
  if (url.includes('.doc') || url.includes('.docx')) return 'Word Document'
  if (url.includes('.xls') || url.includes('.xlsx')) return 'Excel Spreadsheet'
  if (url.includes('.ppt') || url.includes('.pptx')) return 'PowerPoint Presentation'
  if (url.includes('.mp4') || url.includes('.avi') || url.includes('.mov')) return 'Video File'
  if (url.includes('.mp3') || url.includes('.wav')) return 'Audio File'
  if (url.includes('.zip') || url.includes('.rar')) return 'Compressed Archive'
  return 'File'
}

const openFilePreview = (material: any) => {
  console.log('Opening file preview for material:', material)
  console.log('File URL:', material.file)
  console.log('Is Image?', isImageFile(material.file))
  console.log('Is PDF?', isPdfFile(material.file))
  previewFile.value = material
  showFilePreviewModal.value = true
}

// Helper function to convert File to base64
const convertFileToBase64 = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => {
      const result = reader.result as string
      resolve(result)
    }
    reader.onerror = (error) => reject(error)
    reader.readAsDataURL(file)
  })
}

// Mount
onMounted(() => {
  loadData()
})
</script>

<style scoped>
.materials-page {
  padding: 1rem;
}

.page-header {
  margin-bottom: 1.5rem;
}

.page-title {
  font-size: 2rem;
  font-weight: bold;
  margin: 0.5rem 0;
}

.page-subtitle {
  font-size: 1rem;
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

/* Materials List */
.materials-list {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.material-card {
  transition: all 0.3s;
}

.material-card:hover {
  transform: translateX(4px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.material-card.inactive {
  opacity: 0.6;
}

.material-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
}

.material-type {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.material-badges {
  display: flex;
  gap: 0.5rem;
}

.material-title {
  font-size: 1.25rem;
  font-weight: bold;
  margin: 0.5rem 0;
}

.material-info {
  display: flex;
  gap: 1.5rem;
  margin: 1rem 0;
  padding: 1rem 0;
  border-top: 1px solid var(--va-background-border);
  border-bottom: 1px solid var(--va-background-border);
}

.info-item {
  display: flex;
  align-items: center;
  gap: 0.25rem;
  font-size: 0.875rem;
  color: var(--va-text-secondary);
}

.material-actions {
  display: flex;
  gap: 0.25rem;
  flex-wrap: wrap;
  margin-top: 1rem;
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

/* Material Details Modal */
.material-details {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  position: relative;
  z-index: auto;
}

.detail-row {
  display: flex;
  gap: 1rem;
  padding: 0.75rem;
  border-bottom: 1px solid var(--va-background-border);
  position: relative;
  z-index: auto;
}

.detail-row strong {
  min-width: 150px;
  color: var(--va-text-primary);
}

.detail-row span {
  flex: 1;
  color: var(--va-text-secondary);
}

.material-description {
  color: var(--va-text-secondary);
  margin: 0.5rem 0 1rem 0;
  line-height: 1.5;
}

/* Modal Form */
.modal-form {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

/* File Preview */
.file-preview {
  margin: 1rem 0;
  padding: 1rem;
  background: var(--va-background-element);
  border-radius: 8px;
  border: 1px solid var(--va-background-border);
}

.preview-image {
  cursor: pointer;
  transition: transform 0.2s;
}

.preview-image:hover {
  transform: scale(1.02);
}

.preview-image img {
  width: 100%;
  max-height: 200px;
  object-fit: cover;
  border-radius: 4px;
}

.preview-pdf,
.preview-file {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.5rem;
  padding: 1rem;
}

.preview-label {
  font-weight: 500;
  color: var(--va-text-primary);
}

/* File Preview Modal */
.file-preview-container {
  min-height: 400px;
  display: flex;
  justify-content: center;
  align-items: center;
}

.preview-full-image img {
  width: 100%;
  max-height: 70vh;
  object-fit: contain;
  border-radius: 4px;
}

.preview-full-pdf iframe {
  border-radius: 4px;
}

.preview-full-file {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1rem;
  padding: 2rem;
  text-align: center;
}

/* View Details Modal File Preview Section */
.file-preview-section {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  margin-top: 1rem;
  padding: 1rem 0.75rem;
  border-top: 1px solid var(--va-background-border);
}

.preview-header {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.preview-header strong {
  min-width: 150px;
  color: var(--va-text-primary);
}

.file-preview-section .preview-content {
  padding: 1rem;
  background: var(--va-background-element);
  border: 1px solid var(--va-background-border);
  border-radius: 8px;
  max-height: 600px;
  overflow-y: auto;
  position: relative;
  z-index: 1;
}

.preview-image-detail img {
  width: 100%;
  max-height: 500px;
  object-fit: contain;
  border-radius: 4px;
  display: block;
}

.preview-pdf-detail {
  min-height: 400px;
  position: relative;
}

.preview-pdf-detail canvas {
  width: 100% !important;
  height: auto !important;
  max-width: 100%;
}

.preview-other-file {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 2rem;
  text-align: center;
  gap: 1rem;
}

.pdf-loading {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 3rem;
  gap: 1rem;
  min-height: 400px;
}

/* Ensure modal buttons are clickable */
:deep(.va-modal__container) {
  position: relative;
  z-index: auto;
}

:deep(.va-modal__inner) {
  display: flex;
  flex-direction: column;
  max-height: 90vh;
}

:deep(.va-modal__message) {
  overflow-y: auto;
  flex: 1;
}

:deep(.va-modal__footer) {
  position: sticky;
  bottom: 0;
  background: var(--va-background-element);
  padding: 1rem;
  border-top: 1px solid var(--va-background-border);
  z-index: 10;
}
</style>
