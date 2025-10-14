<template>
  <div class="document-review">
    <div class="review-header">
      <VaIcon name="folder_open" size="3rem" color="secondary" class="mb-4" />
      <h1 class="va-h1">Document Review</h1>
      <p class="va-text-secondary">
        <span class="document-count">{{ verificationStore.documents.length }}</span>
        documents pending review
      </p>
    </div>

    <VaAlert v-if="verificationStore.error" color="danger" class="error-alert" @close="verificationStore.clearError">
      {{ verificationStore.error }}
    </VaAlert>

    <!-- Loading State -->
    <div v-if="verificationStore.loading.documents" class="flex flex-col items-center justify-center py-16 gap-4">
      <VaProgressCircle indeterminate size="large" />
      <p class="va-text-secondary">Loading documents...</p>
    </div>

    <!-- Document Grid -->
    <div v-else class="document-grid">
      <VaCard
        v-for="document in verificationStore.documents"
        :key="document.id"
        hover
        class="document-card"
        @click="selectDocument(document)"
      >
        <VaCardContent>
          <div class="flex justify-between items-start mb-4">
            <div class="flex items-center gap-3">
              <div class="document-icon-wrapper">
                <VaIcon :name="getDocumentIcon(document.document_type)" size="1.5rem" />
              </div>
              <div class="flex-1 min-w-0">
                <div class="va-h6 truncate">{{ document.title }}</div>
                <div class="va-text-secondary text-sm">{{ document.document_type_display }}</div>
              </div>
            </div>
            <div class="status-badge" :class="getStatusColor(document.verification_status)">
              {{ document.verification_status_display }}
            </div>
          </div>

          <VaDivider class="my-3" />

          <div class="flex flex-col gap-2 mb-4">
            <div class="flex items-center gap-2 text-sm">
              <VaIcon name="person" size="small" />
              <span>{{ document.user_name }}</span>
            </div>
            <div class="flex items-center gap-2 text-sm">
              <VaIcon name="email" size="small" />
              <span>{{ document.user_email }}</span>
            </div>
            <div class="flex items-center gap-2 text-sm">
              <VaIcon name="schedule" size="small" />
              <span>{{ formatDate(document.created_at) }}</span>
            </div>
          </div>

          <VaDivider class="my-3" />

          <VaButton
            color="secondary"
            size="small"
            icon="visibility"
            block
            class="review-button"
            @click.stop="selectDocument(document)"
          >
            Review Document
          </VaButton>
        </VaCardContent>
      </VaCard>
    </div>

    <!-- Document Viewer Modal -->
    <VaModal
      v-model="showViewer"
      :title="`Document Review - ${selectedDocument?.title}`"
      size="large"
      class="professional-modal"
      @close="closeViewer"
    >
      <div v-if="selectedDocument" class="document-viewer">
        <div class="modal-layout">
          <!-- Left Panel - Document Info -->
          <div class="info-panel">
            <div class="info-header">
              <VaIcon name="info" size="1.2rem" class="mr-2" />
              <h4 class="va-h6 mb-0">Document Information</h4>
            </div>
            <div class="info-content">
              <div class="info-row">
                <span class="info-label">Type</span>
                <span class="info-value">{{ selectedDocument.document_type_display }}</span>
              </div>
              <div class="info-row">
                <span class="info-label">User</span>
                <span class="info-value">{{ selectedDocument.user_name }}</span>
              </div>
              <div class="info-row">
                <span class="info-label">Email</span>
                <span class="info-value">{{ selectedDocument.user_email }}</span>
              </div>
              <div class="info-row">
                <span class="info-label">Status</span>
                <div class="status-badge" :class="getStatusColor(selectedDocument.verification_status)">
                  {{ selectedDocument.verification_status_display }}
                </div>
              </div>
              <div class="info-row">
                <span class="info-label">Uploaded</span>
                <span class="info-value">{{ formatDateTime(selectedDocument.created_at) }}</span>
              </div>
            </div>
          </div>

          <!-- Right Panel - Document Preview -->
          <div class="preview-panel">
            <div class="preview-header">
              <VaIcon name="visibility" size="1.2rem" class="mr-2" />
              <h4 class="va-h6 mb-0">Document Preview</h4>
              <VaButton size="small" color="secondary" icon="download" class="ml-auto" @click="downloadDocument">
                Download
              </VaButton>
            </div>
            <div class="document-container">
              <div v-if="selectedDocument.file_url" class="document-wrapper">
                <!-- PDF Viewer -->
                <iframe
                  v-if="selectedDocument.file_url.toLowerCase().includes('.pdf')"
                  :src="selectedDocument.file_url"
                  class="pdf-viewer"
                  frameborder="0"
                ></iframe>
                <!-- Image Viewer -->
                <div v-else-if="isImageFile(selectedDocument.file_url)" class="image-viewer">
                  <img :src="selectedDocument.file_url" :alt="selectedDocument.title" class="document-image" />
                </div>
                <!-- Other Files -->
                <div v-else class="file-placeholder">
                  <VaIcon name="description" size="3rem" color="secondary" />
                  <p class="file-name">{{ selectedDocument.title }}</p>
                  <p class="file-type">{{ getFileType(selectedDocument.file_url) }}</p>
                </div>
              </div>
              <div v-else class="no-document">
                <VaIcon name="error_outline" size="3rem" color="secondary" />
                <p>Document not available</p>
              </div>
            </div>
          </div>
        </div>

        <!-- Review Actions Section -->
        <div class="review-actions-section">
          <VaCard v-if="!showRejectForm" outlined class="verify-section">
            <VaCardContent>
              <div class="flex items-center gap-3 mb-4">
                <VaIcon name="check_circle" color="success" size="large" />
                <div>
                  <div class="va-h6">Verify Document</div>
                  <div class="va-text-secondary">Approve this document for verification</div>
                </div>
              </div>
              <VaTextarea v-model="verificationNotes" placeholder="Add verification notes..." :rows="3" class="mb-4" />
              <div class="flex gap-3">
                <VaButton
                  color="success"
                  :loading="verificationStore.loading.actions"
                  icon="check"
                  @click="verifyDocument"
                >
                  Verify Document
                </VaButton>
                <VaButton color="danger" icon="close" @click="showRejectForm = true"> Reject Document </VaButton>
              </div>
            </VaCardContent>
          </VaCard>

          <VaCard v-else outlined class="reject-section">
            <VaCardContent>
              <div class="flex items-center gap-3 mb-4">
                <VaIcon name="cancel" color="danger" size="large" />
                <div>
                  <div class="va-h6">Reject Document</div>
                  <div class="va-text-secondary">Provide a reason for rejection</div>
                </div>
              </div>
              <VaTextarea
                v-model="rejectReason"
                placeholder="Reason for rejection..."
                :rows="3"
                class="mb-4"
                required
              />
              <div class="flex gap-3">
                <VaButton
                  color="danger"
                  :loading="verificationStore.loading.actions"
                  :disabled="!rejectReason.trim()"
                  icon="close"
                  @click="rejectDocument"
                >
                  Reject Document
                </VaButton>
                <VaButton color="secondary" icon="arrow_back" @click="showRejectForm = false"> Cancel </VaButton>
              </div>
            </VaCardContent>
          </VaCard>
        </div>
      </div>
    </VaModal>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useToast } from 'vuestic-ui'
import { useVerificationStore } from '../../../../stores/verification-store'
import type { Document } from '../../../../services/verificationService'

const { init } = useToast()
const verificationStore = useVerificationStore()

const showViewer = ref(false)
const selectedDocument = ref<Document | null>(null)
const showRejectForm = ref(false)
const verificationNotes = ref('')
const rejectReason = ref('')

const getStatusColor = (status: string) => {
  switch (status) {
    case 'verified':
      return 'success'
    case 'pending':
      return 'warning'
    case 'rejected':
      return 'danger'
    default:
      return 'secondary'
  }
}

const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString()
}

const formatDateTime = (dateString: string) => {
  return new Date(dateString).toLocaleString()
}

const selectDocument = (document: Document) => {
  selectedDocument.value = document
  showViewer.value = true
  showRejectForm.value = false
  verificationNotes.value = ''
  rejectReason.value = ''
}

const closeViewer = () => {
  showViewer.value = false
  selectedDocument.value = null
  showRejectForm.value = false
  verificationNotes.value = ''
  rejectReason.value = ''
}

const verifyDocument = async () => {
  if (!selectedDocument.value) return

  try {
    // Use the updated verifyDocument method with 2 parameters
    await verificationStore.verifyDocument(selectedDocument.value.id, verificationNotes.value)
    init({ message: 'Document verified successfully', color: 'success' })
    closeViewer()
  } catch (error: any) {
    const errorMessage = error.message || 'Failed to verify document'
    init({ message: errorMessage, color: 'danger' })
    console.error('Failed to verify document:', error)
  }
}

const rejectDocument = async () => {
  if (!selectedDocument.value) return

  try {
    // Use the new rejectDocument method
    await verificationStore.rejectDocument(selectedDocument.value.id, rejectReason.value)
    init({ message: 'Document rejected successfully', color: 'success' })
    closeViewer()
  } catch (error: any) {
    const errorMessage = error.message || 'Failed to reject document'
    init({ message: errorMessage, color: 'danger' })
    console.error('Failed to reject document:', error)
  }
}

const downloadDocument = () => {
  if (selectedDocument.value?.file_url) {
    window.open(selectedDocument.value.file_url, '_blank')
  }
}

const isImageFile = (url: string) => {
  const imageExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.bmp', '.webp', '.svg']
  return imageExtensions.some((ext) => url.toLowerCase().includes(ext))
}

const getDocumentIcon = (documentType: string) => {
  switch (documentType) {
    case 'registration':
      return 'assignment'
    case 'practice':
      return 'work'
    case 'academic':
      return 'school'
    case 'identity':
      return 'badge'
    case 'license':
      return 'verified'
    default:
      return 'description'
  }
}

const getFileType = (url: string) => {
  const extension = url.split('.').pop()?.toLowerCase()
  switch (extension) {
    case 'pdf':
      return 'PDF Document'
    case 'doc':
    case 'docx':
      return 'Word Document'
    case 'xls':
    case 'xlsx':
      return 'Excel Spreadsheet'
    case 'ppt':
    case 'pptx':
      return 'PowerPoint Presentation'
    case 'txt':
      return 'Text File'
    case 'jpg':
    case 'jpeg':
    case 'png':
    case 'gif':
    case 'bmp':
    case 'webp':
      return 'Image File'
    default:
      return 'Document'
  }
}

onMounted(async () => {
  try {
    await verificationStore.fetchPendingDocuments()
  } catch (error) {
    console.error('Failed to load documents:', error)
  }
})
</script>

<style scoped>
.document-review {
  @apply p-8 max-w-7xl mx-auto;
  background: var(--va-background-secondary);
  min-height: 100vh;
}

.review-header {
  @apply text-center mb-8 flex flex-col items-center;
}

.error-alert {
  @apply mb-8;
}

.document-grid {
  @apply grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8;
}

.document-card {
  @apply cursor-pointer transition-all duration-300;
  background: white;
  border: 1px solid rgba(0, 0, 0, 0.06);
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
}

.document-card:hover {
  transform: translateY(-2px);
  border-color: rgba(0, 0, 0, 0.1);
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.12);
}

.document-count {
  @apply inline-block px-2 py-1 rounded-md text-sm font-semibold mr-2;
  background: rgba(0, 0, 0, 0.05);
  color: #374151;
}

.document-icon-wrapper {
  @apply w-10 h-10 rounded-lg flex items-center justify-center;
  background: rgba(0, 0, 0, 0.05);
  color: #6b7280;
}

.status-badge {
  @apply px-3 py-1 rounded-full text-xs font-semibold;
  border: 1px solid rgba(0, 0, 0, 0.1);
  max-width: 120px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.status-badge.success {
  background: rgba(34, 197, 94, 0.1);
  color: #166534;
  border-color: rgba(34, 197, 94, 0.2);
}

.status-badge.warning {
  background: rgba(245, 158, 11, 0.1);
  color: #92400e;
  border-color: rgba(245, 158, 11, 0.2);
}

.status-badge.danger {
  background: rgba(239, 68, 68, 0.1);
  color: #991b1b;
  border-color: rgba(239, 68, 68, 0.2);
}

.status-badge.secondary {
  background: rgba(107, 114, 128, 0.1);
  color: #374151;
  border-color: rgba(107, 114, 128, 0.2);
}

.review-button {
  border-radius: 8px;
}

/* Professional Modal Styling */
.professional-modal {
  --va-modal-width: 95vw;
  --va-modal-max-width: 1400px;
  --va-modal-height: 90vh;
}

.document-viewer {
  height: 80vh;
  overflow: hidden;
}

.modal-layout {
  display: grid;
  grid-template-columns: 300px 1fr;
  gap: 1.5rem;
  height: 100%;
}

/* Left Panel - Info */
.info-panel {
  background: #f8f9fa;
  border-radius: 8px;
  padding: 1rem;
  overflow-y: auto;
}

.info-header {
  @apply flex items-center mb-4 pb-3;
  border-bottom: 1px solid rgba(0, 0, 0, 0.1);
}

.info-content {
  @apply flex flex-col gap-3;
}

.info-row {
  @apply flex flex-col gap-1;
}

.info-label {
  @apply text-xs font-semibold uppercase;
  color: #6b7280;
  letter-spacing: 0.5px;
}

.info-value {
  @apply text-sm font-medium;
  color: #1f2937;
  word-break: break-word;
}

/* Right Panel - Preview */
.preview-panel {
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.preview-header {
  @apply flex items-center mb-4 pb-3;
  border-bottom: 1px solid rgba(0, 0, 0, 0.1);
}

.document-container {
  flex: 1;
  overflow: hidden;
  border-radius: 8px;
  border: 1px solid rgba(0, 0, 0, 0.1);
  background: white;
}

.document-wrapper {
  width: 100%;
  height: 100%;
}

/* PDF Viewer */
.pdf-viewer {
  width: 100%;
  height: 600px;
  border: none;
  border-radius: 8px;
}

/* Image Viewer */
.image-viewer {
  width: 100%;
  height: 600px;
  overflow: auto;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #f8f9fa;
}

.document-image {
  max-width: 100%;
  max-height: 100%;
  object-fit: contain;
  border-radius: 4px;
}

/* File Placeholder */
.file-placeholder {
  @apply flex flex-col items-center justify-center text-center;
  height: 400px;
  background: #f8f9fa;
}

.file-name {
  @apply font-semibold mt-3 mb-1;
  color: #1f2937;
}

.file-type {
  @apply text-sm;
  color: #6b7280;
}

.no-document {
  @apply flex flex-col items-center justify-center text-center;
  height: 400px;
  color: #6b7280;
}

/* Review Actions Section */
.review-actions-section {
  margin-top: 1.5rem;
  padding-top: 1.5rem;
  border-top: 1px solid rgba(0, 0, 0, 0.1);
}

.verify-section,
.reject-section {
  border-radius: 8px;
}

/* Responsive Design */
@media (max-width: 1024px) {
  .modal-layout {
    grid-template-columns: 1fr;
    grid-template-rows: auto 1fr;
  }

  .info-panel {
    max-height: 200px;
  }

  .pdf-viewer,
  .image-viewer {
    height: 500px;
  }
}

.document-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
}

.document-header h3 {
  margin: 0;
  color: #2c3e50;
  font-size: 1.1rem;
}

.document-info {
  margin-bottom: 1rem;
}

.info-item {
  margin-bottom: 0.5rem;
  font-size: 0.9rem;
}

.document-actions {
  border-top: 1px solid #ecf0f1;
  padding-top: 1rem;
  text-align: center;
}

.document-viewer {
  max-height: 80vh;
  overflow-y: auto;
}

.viewer-content {
  display: flex;
  flex-direction: column;
  gap: 2rem;
}

.document-info-section h3,
.document-preview-section h3,
.review-actions-section h3 {
  color: #2c3e50;
  margin-bottom: 1rem;
}

.info-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1rem;
}

.info-item .label {
  font-weight: 500;
  color: #7f8c8d;
}

.info-item .value {
  color: #2c3e50;
}

.preview-container {
  border: 1px solid #ecf0f1;
  border-radius: 0.5rem;
  overflow: hidden;
}

.preview-wrapper {
  width: 100%;
}

.document-embed {
  border: none;
  display: block;
}

.document-image {
  max-width: 100%;
  height: auto;
  display: block;
  margin: 0 auto;
}

.file-preview {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 3rem;
  text-align: center;
  color: #7f8c8d;
}

.file-preview p {
  margin: 0.5rem 0;
}

.file-type {
  font-size: 0.9rem;
  color: #95a5a6;
  font-style: italic;
}

.no-preview {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 3rem;
  text-align: center;
  color: #7f8c8d;
}

.no-preview p {
  margin: 1rem 0;
}

.verify-section,
.reject-section {
  padding: 1rem;
  background: #f8f9fa;
  border-radius: 0.5rem;
}

.notes-textarea {
  margin-bottom: 1rem;
}

.action-buttons {
  display: flex;
  gap: 1rem;
  justify-content: center;
}

@media (max-width: 768px) {
  .document-review {
    padding: 1rem;
  }

  .document-grid {
    grid-template-columns: 1fr;
  }

  .action-buttons {
    flex-direction: column;
  }

  .info-grid {
    grid-template-columns: 1fr;
  }
}
</style>
