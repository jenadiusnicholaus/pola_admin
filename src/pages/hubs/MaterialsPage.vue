<template>
  <div class="materials-page">
    <!-- Header with Back Button -->
    <div class="page-header">
      <VaButton icon="arrow_back" preset="plain" @click="goBack">Back to Subtopics</VaButton>
      <div v-if="selectedSubtopic">
        <h1 class="page-title">{{ languageFilter === 'sw' ? selectedSubtopic.name_sw : selectedSubtopic.name }}</h1>
        <p class="page-subtitle">
          {{ languageFilter === 'sw' ? selectedSubtopic.topic_name_sw : selectedSubtopic.topic_name }}
        </p>
      </div>
      <div v-else>
        <h1 class="page-title">Subtopic Materials</h1>
      </div>
    </div>

    <!-- Create Material Modal -->
    <VaModal v-model="showCreateForm" title="Create New Material" size="large" hide-default-actions>
      <div v-if="createForm" class="create-form">
        <div class="form-container">
          <!-- Section 1: Basic Details (Compact) -->
          <VaCard class="form-section-card compact-section">
            <VaCardContent>
              <div class="section-header compact-header">
                <VaIcon name="info" color="primary" size="small" />
                <h3>Basic Information</h3>
              </div>
              <div class="form-grid compact-grid">
                <div class="form-field full-width">
                  <VaInput
                    v-model="createForm.title"
                    label="Material Title"
                    placeholder="Enter material title"
                    required
                  />
                </div>
                <div class="form-field">
                  <VaSelect
                    v-model="createForm.content_type"
                    label="Content Type"
                    :options="contentTypeOptions"
                    value-by="value"
                    text-by="text"
                    required
                  >
                    <template #prependInner>
                      <VaIcon name="category" size="small" color="secondary" />
                    </template>
                  </VaSelect>
                </div>
                <div class="form-field">
                  <VaSelect
                    v-model="createForm.language"
                    label="Language"
                    :options="languageOptions"
                    value-by="value"
                    text-by="text"
                  >
                    <template #prependInner>
                      <VaIcon name="language" size="small" color="secondary" />
                    </template>
                  </VaSelect>
                </div>
                <div class="form-field">
                  <VaInput v-model="createForm.price" label="Price (TSh)" type="number" step="0.01" placeholder="0.00">
                    <template #prependInner>
                      <span class="currency-symbol">TSh</span>
                      <VaIcon name="attach_money" size="small" color="secondary" />
                    </template>
                  </VaInput>
                </div>
              </div>
            </VaCardContent>
          </VaCard>

          <!-- Section 2: Description (Main Focus) -->
          <VaCard class="form-section-card">
            <VaCardContent>
              <div class="section-header">
                <VaIcon name="description" color="primary" />
                <h3>Description</h3>
              </div>
              <div class="form-field full-width">
                <QuillEditor
                  ref="editorRef"
                  v-model:content="createForm.description"
                  content-type="html"
                  theme="snow"
                  class="rich-editor-large"
                />
              </div>
            </VaCardContent>
          </VaCard>

          <!-- Section 3: File & Settings (Compact) -->
          <VaCard class="form-section-card compact-section">
            <VaCardContent>
              <div class="section-header compact-header">
                <VaIcon name="settings" color="primary" size="small" />
                <h3>Additional Options</h3>
              </div>
              <div class="form-grid compact-grid">
                <div class="form-field full-width">
                  <label class="field-label">
                    Attach File
                    <span v-if="createForm.content_type === 'document'" class="required-indicator"> *</span>
                    <span v-else class="optional-indicator"> (Optional)</span>
                  </label>
                  <VaFileUpload
                    v-model="createForm.file"
                    type="single"
                    file-types=".pdf,.doc,.docx,.ppt,.pptx,.xls,.xlsx,.mp4,.mp3,.jpg,.jpeg,.png"
                    dropzone
                    class="file-upload-compact"
                    :disabled="!createForm.content_type"
                  >
                    <template #upload-button-text>
                      <VaIcon name="cloud_upload" class="mr-2" size="small" />
                      <span>Upload file</span>
                    </template>
                  </VaFileUpload>
                  <p v-if="createForm.content_type === 'document'" class="field-hint required-hint">
                    File is required for document type
                  </p>
                </div>
                <div class="form-field full-width">
                  <div class="settings-grid compact-settings">
                    <div class="setting-item">
                      <VaCheckbox v-model="createForm.is_downloadable" size="small">
                        <template #label>
                          <div class="checkbox-label compact-label">
                            <VaIcon name="download" size="small" />
                            <span>Download</span>
                          </div>
                        </template>
                      </VaCheckbox>
                    </div>
                    <div class="setting-item">
                      <VaCheckbox v-model="createForm.is_approved" size="small">
                        <template #label>
                          <div class="checkbox-label compact-label">
                            <VaIcon name="verified" size="small" />
                            <span>Approve</span>
                          </div>
                        </template>
                      </VaCheckbox>
                    </div>
                    <div class="setting-item">
                      <VaCheckbox v-model="createForm.is_active" size="small">
                        <template #label>
                          <div class="checkbox-label compact-label">
                            <VaIcon name="visibility" size="small" />
                            <span>Active</span>
                          </div>
                        </template>
                      </VaCheckbox>
                    </div>
                  </div>
                </div>
              </div>
            </VaCardContent>
          </VaCard>
        </div>

        <div class="form-actions">
          <VaButton preset="plain" @click="closeCreateForm">Cancel</VaButton>
          <VaButton :loading="creating" color="primary" @click="saveNewMaterial">
            <VaIcon name="add" class="mr-2" />
            Create Material
          </VaButton>
        </div>
      </div>
    </VaModal>

    <!-- Materials View -->
    <div>
      <VaCard class="toolbar-card">
        <VaCardContent>
          <div class="toolbar-container">
            <div class="toolbar-filters">
              <VaInput v-model="searchQuery" placeholder="Search materials..." clearable class="filter-search">
                <template #prependInner>
                  <VaIcon name="search" color="secondary" />
                </template>
              </VaInput>

              <VaSelect
                v-model="typeFilter"
                placeholder="Type"
                :options="typeOptions"
                value-by="value"
                text-by="text"
                clearable
                class="filter-select"
              >
                <template #prependInner>
                  <VaIcon name="category" color="secondary" size="small" />
                </template>
              </VaSelect>

              <VaSelect
                v-model="statusFilter"
                placeholder="Status"
                :options="statusOptions"
                value-by="value"
                text-by="text"
                clearable
                class="filter-select"
              >
                <template #prependInner>
                  <VaIcon name="verified" color="secondary" size="small" />
                </template>
              </VaSelect>

              <VaSelect
                v-model="languageFilter"
                placeholder="Language"
                :options="languageOptions"
                value-by="value"
                text-by="text"
                clearable
                class="filter-select"
              >
                <template #prependInner>
                  <VaIcon name="language" color="secondary" size="small" />
                </template>
              </VaSelect>

              <VaButton icon="refresh" preset="secondary" color="primary" @click="loadData" />
            </div>

            <VaButton icon="add" color="warning" @click="openCreateForm">Add</VaButton>
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
                <VaIcon :name="getMaterialIcon(material.content_type)" size="2rem" />
                <VaBadge :text="material.content_type" />
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
            <p v-if="material.description" class="material-description" v-html="material.description"></p>

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
                  {{ material.uploader_name || material.uploader_email || 'Unknown' }}
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
                <span>{{ material.file_size ? (material.file_size / (1024 * 1024)).toFixed(2) : '0' }} MB</span>
              </div>
            </div>

            <div class="material-actions">
              <VaButton
                v-if="material.file"
                size="small"
                preset="plain"
                icon="download"
                @click="downloadFile(material)"
              >
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
          <span v-html="selectedMaterial.description || 'N/A'"></span>
        </div>
        <div class="detail-row">
          <strong>Content Type:</strong>
          <span>{{ selectedMaterial.content_type }}</span>
        </div>
        <div class="detail-row">
          <strong>Uploader:</strong>
          <span>
            {{ selectedMaterial.uploader_name || selectedMaterial.uploader_email || 'Unknown' }}
            ({{ selectedMaterial.uploader_type_display || selectedMaterial.uploader_type }})
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
            {{ selectedMaterial.file_size ? (selectedMaterial.file_size / (1024 * 1024)).toFixed(2) : '0' }} MB
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
              <template v-if="detailPdf">
                <div v-for="page in detailPages" :key="page" class="pdf-page">
                  <VuePDF :pdf="detailPdf" :page="page" />
                </div>
              </template>
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
        <VaInput v-model="editForm.price" label="Price (TSh)" type="number" step="0.01" />
        <VaSelect
          v-model="editForm.language"
          label="Language"
          :options="languageOptions"
          value-by="value"
          text-by="text"
        />
        <VaSelect
          v-model="editForm.subtopic"
          label="Subtopic"
          :options="subtopics"
          value-by="id"
          text-by="name"
          required
        />
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
        <!-- Basic Information -->
        <div class="form-section">
          <h3 class="form-section-title">Basic Information</h3>
          <VaInput v-model="createForm.title" label="Title" required class="form-field" />
          <VaTextarea v-model="createForm.description" label="Description" :min-rows="3" required class="form-field" />
          <VaSelect
            v-model="createForm.content_type"
            label="Content Type"
            :options="contentTypeOptions"
            value-by="value"
            text-by="text"
            required
            class="form-field"
          />
          <VaInput
            v-model="createForm.price"
            label="Price (TSh)"
            type="number"
            step="0.01"
            hint="Use 0 for free materials"
            class="form-field"
          />
        </div>

        <!-- Content Section -->
        <div class="form-section">
          <h3 class="form-section-title">Content</h3>
          <VaSelect
            v-model="createForm.language"
            label="Language"
            :options="languageOptions"
            value-by="value"
            text-by="text"
            class="form-field"
          />

          <!-- Rich Text Editor for content -->
          <div class="form-field">
            <label class="field-label">Content</label>
            <QuillEditor
              ref="editorRef"
              v-model:content="createForm.rich_text_content"
              content-type="html"
              theme="snow"
              class="rich-editor"
            />
          </div>

          <!-- Optional File Upload -->
          <div class="form-field">
            <label class="field-label">Attach File (Optional)</label>
            <VaFileUpload
              v-model="createForm.file"
              type="single"
              file-types=".pdf,.doc,.docx,.ppt,.pptx,.xls,.xlsx,.mp4,.mp3,.jpg,.jpeg,.png"
              dropzone
              class="file-upload"
            >
              <template #upload-button-text>
                <VaIcon name="cloud_upload" class="mr-2" />
                Upload supporting file
              </template>
            </VaFileUpload>
            <p class="field-hint">Upload a PDF, document, image, video, or audio file to supplement your content</p>
          </div>
        </div>

        <!-- Settings Section -->
        <div class="form-section">
          <h3 class="form-section-title">Settings</h3>
          <div class="checkbox-group">
            <VaCheckbox v-model="createForm.is_downloadable" label="Allow users to download this material" />
            <VaCheckbox v-model="createForm.is_approved" label="Pre-approve Material" />
            <VaCheckbox v-model="createForm.is_active" label="Active (visible to users)" />
          </div>
        </div>
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
          <template v-if="previewPdf">
            <div v-for="page in previewPages" :key="page" class="pdf-page">
              <VuePDF :pdf="previewPdf" :page="page" />
            </div>
          </template>
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
import { QuillEditor } from '@vueup/vue-quill'
import '@vueup/vue-quill/dist/vue-quill.snow.css'

const route = useRoute()
const router = useRouter()
const { init: notify } = useToast()
const hubsStore = useHubsStore()

const topicId = ref<number>(Number(route.params.topicId) || 0)
const subtopicId = ref<number>(Number(route.params.subtopicId) || 0)
// Pre-populate language filter from query param (set by language panel click)
const initialLanguage = route.query.language as string | undefined

// Computed from store
const loading = computed(() => hubsStore.loadingHubContent || hubsStore.loadingMaterials)
const materials = computed(() => (subtopicId.value ? hubsStore.subtopicMaterials : hubsStore.hubContent))
const subtopics = computed(() => hubsStore.subtopics)
const selectedSubtopic = computed(() => {
  if (hubsStore.selectedSubtopic && hubsStore.selectedSubtopic.id === subtopicId.value) {
    return hubsStore.selectedSubtopic
  }
  return hubsStore.subtopics.find((s) => s.id === subtopicId.value) || null
})

// Modal state
const showViewModal = ref(false)
const selectedMaterial = ref<any>(null)
const showEditModal = ref(false)
const editForm = ref<any>(null)
const showCreateModal = ref(false)
const showCreateForm = ref(false)
const createForm = ref<any>(null)
const creating = ref(false)
const showFilePreviewModal = ref(false)
const previewFile = ref<any>(null)
const editorRef = ref<any>(null)

// PDF loading state
const detailPdfSrc = ref<string>('')
const previewPdfSrc = ref<string>('')

// Load PDF for detail modal
const { pdf: detailPdf, pages: detailPages } = usePDF(detailPdfSrc)

// Load PDF for preview modal
const { pdf: previewPdf, pages: previewPages } = usePDF(previewPdfSrc)

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
const languageFilter = ref<string | null>(initialLanguage || null)

let searchTimeout: ReturnType<typeof setTimeout>

watch([typeFilter, statusFilter, languageFilter], () => {
  loadData()
})

watch(searchQuery, () => {
  clearTimeout(searchTimeout)
  searchTimeout = setTimeout(() => {
    loadData()
  }, 500)
})

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

const contentTypeOptions = [
  // Post types (usually free, text-based)
  { text: 'Discussion Post', value: 'discussion' },
  { text: 'Question Post', value: 'question' },
  { text: 'Article', value: 'article' },
  { text: 'News', value: 'news' },
  { text: 'Announcement', value: 'announcement' },

  // Document types (can be paid, file-based)
  { text: 'General Document', value: 'document' },
  { text: 'Study Notes', value: 'notes' },
  { text: 'Past Exam Papers', value: 'past_papers' },
  { text: 'Assignments', value: 'assignments' },
  { text: 'Research Paper', value: 'research' },
  { text: 'Case Study', value: 'case_study' },
  { text: 'Tutorial', value: 'tutorial' },
  { text: 'Hub Content', value: 'hub_content' },
  { text: 'Other', value: 'other' },
]

// Helper to check if content type is file-based
// const isFileBasedType = (type: string) => {
//   const fileBasedTypes = [
//     'document',
//     'notes',
//     'past_papers',
//     'assignments',
//     'research',
//     'case_study',
//     'tutorial',
//     'hub_content',
//     'other',
//   ]
//   return fileBasedTypes.includes(type)
// }

// Helper to check if content type is text-based
// const isTextBasedType = (type: string) => {
//   const textBasedTypes = ['discussion', 'question', 'article', 'news', 'announcement']
//   return textBasedTypes.includes(type)
// }

const languageOptions = [
  { text: 'English', value: 'en' },
  { text: 'Swahili', value: 'sw' },
]

// Load data
const loadData = async () => {
  try {
    // Load subtopic context if needed
    if (!hubsStore.subtopics.length || !hubsStore.subtopics.some((s) => s.id === subtopicId.value)) {
      await hubsStore.fetchTopicById(topicId.value)
    }

    const filters: any = {
      is_active: statusFilter.value,
      is_approved: true, // Show approved by default
    }

    // Add common filters
    if (searchQuery.value) filters.search = searchQuery.value
    if (typeFilter.value) filters.content_type = typeFilter.value
    if (languageFilter.value) filters.language = languageFilter.value

    if (subtopicId.value) {
      // Use the specific subtopic materials endpoint for reliable filtering
      await hubsStore.fetchSubtopicMaterials(subtopicId.value, filters)
      console.log('Loaded subtopic materials:', hubsStore.subtopicMaterials)
    } else {
      // Fallback to general content list if no subtopic (though in this flow there should be one)
      filters.topic_slug = hubsStore.selectedTopic?.slug
      await hubsStore.fetchHubContent(filters)
      console.log('Loaded topic materials (fallback):', hubsStore.hubContent)
    }
  } catch (error: any) {
    notify({
      message: error.message || 'Failed to load materials',
      color: 'danger',
    })
  }
}

// Navigation
const goBack = () => {
  router.push({
    name: 'subtopics',
    params: { topicId: String(topicId.value) },
    query: { language: languageFilter.value },
  })
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
    price: material.price,
    language: material.language,
    subtopic: material.subtopic || subtopicId.value,
    is_active: material.is_active,
  }
  showEditModal.value = true
}

const saveMaterial = async () => {
  if (!editForm.value) return

  try {
    await hubsStore.updateHubContent(editForm.value.id, {
      title: editForm.value.title,
      description: editForm.value.description,
      price: editForm.value.price,
      language: editForm.value.language,
      subtopic: editForm.value.subtopic,
      subtopic_id: editForm.value.subtopic,
      is_active: editForm.value.is_active,
    })

    await loadData()
    notify({ message: 'Material updated successfully', color: 'success' })
    showEditModal.value = false
  } catch (error: any) {
    notify({
      message: error.message || 'Failed to update material',
      color: 'danger',
    })
  }
}

// const openCreateModal = () => {
//   createForm.value = {
//     title: '',
//     description: '',
//     topic: topicId.value,
//     subtopic: subtopicId.value,
//     price: '0',
//     uploader_type: 'admin',
//     content_type: 'document',
//     file: undefined,
//     rich_text_content: '',
//     language: languageFilter.value || 'en',
//     is_downloadable: true,
//     is_approved: true,
//     is_active: true,
//   }
//   showCreateModal.value = true
// }

const openCreateForm = () => {
  createForm.value = {
    title: '',
    description: '',
    topic: topicId.value,
    subtopic: subtopicId.value,
    price: '0',
    uploader_type: 'admin',
    content_type: 'document',
    file: undefined,
    rich_text_content: '',
    language: languageFilter.value || 'en',
    is_downloadable: true,
    is_approved: true,
    is_active: true,
  }
  showCreateForm.value = true
}

const closeCreateForm = () => {
  showCreateForm.value = false
  createForm.value = null
}

const saveNewMaterial = async () => {
  if (!createForm.value) return

  // Debug: Log form values
  console.log('Form values:', {
    title: createForm.value.title,
    description: createForm.value.description,
    content_type: createForm.value.content_type,
    file: createForm.value.file,
  })

  // Validate required fields
  if (!createForm.value.title || !createForm.value.title.trim()) {
    notify({ message: 'Title is required', color: 'warning' })
    return
  }

  if (!createForm.value.description || !createForm.value.description.trim()) {
    notify({ message: 'Description is required', color: 'warning' })
    return
  }

  if (!createForm.value.content_type) {
    notify({ message: 'Content Type is required', color: 'warning' })
    return
  }

  // Validate file requirement for document type
  if (createForm.value.content_type === 'document' && !createForm.value.file) {
    notify({ message: 'File is required for document type', color: 'warning' })
    return
  }

  try {
    creating.value = true

    // Prepare data for submission
    const materialData: any = {
      title: createForm.value.title,
      description: createForm.value.description,
      topic: createForm.value.topic,
      topic_id: createForm.value.topic,
      subtopic: createForm.value.subtopic,
      subtopic_id: createForm.value.subtopic,
      hub_type: 'legal_ed',
      price: createForm.value.price || 0,
      uploader_type: createForm.value.uploader_type,
      content_type: createForm.value.content_type,
      language: createForm.value.language || 'en',
      is_downloadable: createForm.value.is_downloadable,
      is_approved: createForm.value.is_approved,
      is_active: createForm.value.is_active,
    }

    // Add file if provided (optional)
    if (createForm.value.file) {
      const file = Array.isArray(createForm.value.file) ? createForm.value.file[0] : createForm.value.file

      if (file instanceof File) {
        console.log('Converting file to base64:', file.name, file.type, file.size)
        const base64 = await convertFileToBase64(file)
        materialData.file = base64
        console.log('File converted successfully. Base64 length:', base64.length)
      }
    }

    console.log('Final materialData being sent to store:', materialData)

    await hubsStore.createHubContent(materialData)
    // Reload data since we are bypassing the subtopic local reactive update
    await loadData()

    notify({ message: 'Material created successfully', color: 'success' })
    closeCreateForm()
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
    await hubsStore.updateHubContent(material.id, { is_approved: true })
    await loadData()
    notify({ message: 'Material approved successfully', color: 'success' })
  } catch (error: any) {
    notify({
      message: error.message || 'Failed to approve material',
      color: 'danger',
    })
  }
}

const rejectMaterial = async (material: any) => {
  try {
    await hubsStore.updateHubContent(material.id, { is_approved: false })
    await loadData()
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
    await hubsStore.toggleContentActive(material.id)
    await loadData()
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
    await hubsStore.deleteContent(material.id)
    await loadData()
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
    document: 'description',
    notes: 'description',
    past_papers: 'history_edu',
    assignments: 'assignment',
    research: 'science',
    case_study: 'work',
    tutorial: 'school',
    hub_content: 'hub',
    discussion: 'forum',
    question: 'help',
    article: 'article',
    news: 'newspaper',
    announcement: 'campaign',
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
  padding: 0;
}

/* Remove VaSplit default padding */
.materials-page :deep(.va-split) {
  padding: 0;
}

.materials-page :deep(.va-split-pane) {
  padding: 0;
}

.page-header {
  margin-bottom: 0.5rem;
  padding: 0;
}

.page-title {
  font-size: 1.25rem;
  font-weight: 600;
  margin: 0 0 0.25rem 0;
}

.page-subtitle {
  font-size: 0.875rem;
  color: var(--va-text-secondary);
  margin: 0;
}

/* Reduce card padding like analytics page */
.materials-page :deep(.va-card__content) {
  padding: 0.5rem;
}

.materials-page :deep(.va-card) {
  margin-bottom: 0.25rem;
}

/* Toolbar */
.toolbar-container {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 1rem;
  width: 100%;
}

.toolbar-card {
  margin-bottom: 0.5rem;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
  border: 1px solid var(--va-background-border);
}

.toolbar-filters {
  display: grid !important;
  grid-template-columns: repeat(auto-fit, minmax(140px, 1fr));
  gap: 0.75rem;
  flex: 1;
  align-items: center;
}

.filter-search {
  grid-column: span 2;
  min-width: 200px;
  max-width: 400px;
}

.filter-select {
  min-width: 140px;
  max-width: 160px;
}

.toolbar-container :deep(.va-button) {
  flex-shrink: 0;
  white-space: nowrap;
  border-radius: 8px;
  font-weight: 500;
}

/* Materials List */
.materials-list {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.material-card {
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  border-radius: 12px;
  border: 1px solid var(--va-background-border);
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.06);
}

.material-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 16px rgba(0, 0, 0, 0.12);
  border-color: var(--va-primary);
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

.material-description :deep(h1),
.material-description :deep(h2),
.material-description :deep(h3),
.material-description :deep(h4),
.material-description :deep(h5),
.material-description :deep(h6) {
  color: var(--va-text-primary);
  margin: 0.75rem 0 0.5rem 0;
  font-weight: 600;
}

.material-description :deep(h1) {
  font-size: 1.5rem;
}

.material-description :deep(h2) {
  font-size: 1.25rem;
}

.material-description :deep(h3) {
  font-size: 1.125rem;
}

.material-description :deep(p) {
  margin: 0.5rem 0;
}

.material-description :deep(ul),
.material-description :deep(ol) {
  margin: 0.5rem 0;
  padding-left: 1.5rem;
}

.material-description :deep(li) {
  margin: 0.25rem 0;
}

.material-description :deep(strong),
.material-description :deep(b) {
  font-weight: 600;
  color: var(--va-text-primary);
}

.material-description :deep(em),
.material-description :deep(i) {
  font-style: italic;
}

.material-description :deep(a) {
  color: var(--va-primary);
  text-decoration: underline;
}

.material-description :deep(a:hover) {
  color: var(--va-primary-dark);
}

/* Modal Form */
.modal-form {
  display: flex;
  flex-direction: column;
  gap: 2rem;
  max-height: 70vh;
  overflow-y: auto;
  padding: 0.5rem;
}

.form-section {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  padding: 1.5rem;
  background: var(--va-background-element);
  border-radius: 0.75rem;
  border: 1px solid var(--va-background-border);
}

.form-section-title {
  font-size: 1.125rem;
  font-weight: 600;
  color: var(--va-text-primary);
  margin: 0 0 0.5rem 0;
  padding-bottom: 0.75rem;
  border-bottom: 2px solid var(--va-primary);
}

.form-field {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.field-label {
  font-size: 0.875rem;
  font-weight: 500;
  color: var(--va-text-primary);
  margin: 0;
}

.field-hint {
  font-size: 0.75rem;
  color: var(--va-text-secondary);
  margin: 0.25rem 0 0 0;
}

.rich-editor {
  min-height: 200px;
  border: 1px solid var(--va-background-border);
  border-radius: 0.5rem;
  padding: 1rem;
  background: var(--va-background-primary);
}

.rich-editor:focus-within {
  border-color: var(--va-primary);
  box-shadow: 0 0 0 2px rgba(var(--va-primary-rgb), 0.1);
}

.file-upload {
  border: 2px dashed var(--va-background-border);
  border-radius: 0.5rem;
  padding: 1rem;
  text-align: center;
  transition: all 0.3s ease;
  min-height: 80px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.file-upload:hover {
  border-color: var(--va-primary);
  background: rgba(var(--va-primary-rgb), 0.05);
}

.checkbox-group {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

/* Split View Styles */
.materials-split {
  min-height: calc(100vh - 80px);
}

.split-content {
  padding: 0;
  overflow-y: auto;
  max-height: calc(100vh - 80px);
}

.split-form {
  padding: 0.5rem;
  background: var(--va-background-element);
  overflow-y: auto;
  max-height: calc(100vh - 80px);
  display: flex;
  flex-direction: column;
}

.form-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 0.75rem;
  padding-bottom: 0.5rem;
  border-bottom: 2px solid var(--va-primary);
  flex-shrink: 0;
}

.form-header h2 {
  margin: 0;
  font-size: 1.125rem;
  font-weight: 600;
  color: var(--va-text-primary);
}

.create-form {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  flex: 1;
  overflow-y: auto;
}

.form-section {
  padding: 0.75rem;
  gap: 0.5rem;
}

.form-section-title {
  font-size: 0.875rem;
  font-weight: 600;
  margin: 0 0 0.5rem 0;
  padding-bottom: 0.25rem;
}

.form-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 0.5rem;
}

.form-grid .form-field {
  grid-column: span 1;
}

.form-grid .form-field.full-width {
  grid-column: span 2;
}

.form-actions {
  display: flex;
  gap: 0.5rem;
  justify-content: flex-end;
  padding-top: 0.5rem;
  border-top: 1px solid var(--va-background-border);
  flex-shrink: 0;
  margin-top: auto;
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

.preview-full-pdf {
  width: 100%;
  height: 100%;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 1rem;
  gap: 1rem;
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
  display: flex;
  flex-direction: column;
  gap: 1rem;
  align-items: center;
  background: var(--va-background-element);
  min-height: 400px;
}

.pdf-page {
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  margin-bottom: 1rem;
  max-width: 100%;
}

.pdf-page canvas {
  max-width: 100% !important;
  height: auto !important;
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

/* Create Form Modal */
.create-form {
  padding: 0.5rem;
}

.form-container {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  max-height: 70vh;
  overflow-y: auto;
  padding-right: 0.25rem;
}

.form-section-card {
  border-radius: 8px;
  border: 1px solid var(--va-background-border);
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.04);
  transition: all 0.3s ease;
}

.form-section-card:hover {
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.08);
}

.compact-section {
  padding: 0.25rem;
}

.section-header {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin-bottom: 0.75rem;
  padding-bottom: 0.5rem;
  border-bottom: 1px solid var(--va-background-border);
}

.compact-header {
  margin-bottom: 0.5rem;
  padding-bottom: 0.25rem;
}

.section-header h3 {
  margin: 0;
  font-size: 1rem;
  font-weight: 600;
  color: var(--va-text-primary);
}

.compact-header h3 {
  font-size: 0.875rem;
}

.form-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 0.5rem;
}

.compact-grid {
  gap: 0.25rem;
}

.form-field {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.form-field.full-width {
  grid-column: span 2;
}

.field-label {
  font-size: 0.75rem;
  font-weight: 500;
  color: var(--va-text-secondary);
  margin-bottom: 0;
}

.field-hint {
  font-size: 0.7rem;
  color: var(--va-text-secondary);
  margin-top: 0;
}

.settings-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 0.5rem;
}

.compact-settings {
  gap: 0.25rem;
}

.setting-item {
  display: flex;
  align-items: center;
}

.checkbox-label {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.875rem;
}

.compact-label {
  font-size: 0.75rem;
  gap: 0.25rem;
}

.form-actions {
  display: flex;
  justify-content: flex-end;
  gap: 0.75rem;
  padding-top: 1rem;
  border-top: 1px solid var(--va-background-border);
  margin-top: 0.25rem;
}

.rich-editor {
  min-height: 300px;
  max-height: 400px;
  border: 1px solid var(--va-background-border);
  border-radius: 6px;
  padding: 0.5rem;
}

.rich-editor-large {
  min-height: 500px;
  max-height: 700px;
  border: 1px solid var(--va-background-border);
  border-radius: 6px;
  padding: 0.5rem;
}

.file-upload {
  border: 2px dashed var(--va-background-border);
  border-radius: 6px;
  padding: 1rem;
  text-align: center;
  transition: all 0.3s ease;
}

.file-upload-compact {
  border: 2px dashed var(--va-background-border);
  border-radius: 6px;
  padding: 0.5rem;
  text-align: center;
  transition: all 0.3s ease;
}

.file-upload:hover,
.file-upload-compact:hover {
  border-color: var(--va-primary);
  background-color: var(--va-background-element);
}

.currency-symbol {
  font-weight: 600;
  color: var(--va-text-primary);
  margin-right: 0.25rem;
}

.required-indicator {
  color: var(--va-danger);
  font-weight: bold;
}

.optional-indicator {
  color: var(--va-text-secondary);
  font-size: 0.875rem;
}

.required-hint {
  color: var(--va-danger);
  font-weight: 500;
}
</style>
