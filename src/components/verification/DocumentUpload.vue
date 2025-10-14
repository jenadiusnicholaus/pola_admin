<template>
  <div class="document-upload">
    <div
      class="upload-zone"
      :class="{
        'upload-zone-active': isDragOver,
        'upload-zone-uploading': isUploading,
      }"
      @dragover.prevent="handleDragOver"
      @dragleave.prevent="handleDragLeave"
      @drop.prevent="handleDrop"
      @click="triggerFileInput"
    >
      <input
        ref="fileInput"
        type="file"
        accept=".pdf,.jpg,.jpeg,.png"
        style="display: none"
        @change="handleFileSelect"
      />

      <div v-if="isUploading" class="upload-loading">
        <VaProgressCircle indeterminate size="48px" />
        <p>Uploading {{ documentLabel }}...</p>
      </div>

      <div v-else class="upload-content">
        <VaIcon
          :name="isDragOver ? 'cloud_upload' : 'upload_file'"
          size="48px"
          :color="isDragOver ? 'primary' : 'secondary'"
        />

        <div class="upload-text">
          <h4>{{ isDragOver ? 'Drop file here' : 'Upload ' + documentLabel }}</h4>
          <p>
            {{ isDragOver ? 'Release to upload' : 'Drag and drop or click to browse' }}
          </p>
        </div>

        <div class="upload-requirements">
          <p class="requirements-title">File Requirements:</p>
          <ul class="requirements-list">
            <li>Supported formats: PDF, JPG, PNG</li>
            <li>Maximum file size: 10MB</li>
            <li>Document should be clear and readable</li>
          </ul>
        </div>

        <VaButton preset="primary" icon="upload" size="small" @click.stop="triggerFileInput"> Choose File </VaButton>
      </div>
    </div>

    <!-- File Preview -->
    <div v-if="selectedFile && !isUploading" class="file-preview">
      <div class="preview-header">
        <h4>Selected File</h4>
        <VaButton preset="secondary" size="small" icon="close" @click="clearSelection"> Remove </VaButton>
      </div>

      <div class="preview-content">
        <div class="file-info">
          <VaIcon name="description" size="24px" color="primary" />
          <div class="file-details">
            <p class="file-name">{{ selectedFile.name }}</p>
            <p class="file-size">{{ formatFileSize(selectedFile.size) }}</p>
          </div>
        </div>

        <!-- Image preview for image files -->
        <div v-if="isImageFile(selectedFile)" class="image-preview">
          <img :src="imagePreview" alt="Preview" />
        </div>
      </div>

      <div class="preview-actions">
        <VaButton preset="primary" icon="cloud_upload" @click="uploadFile"> Upload {{ documentLabel }} </VaButton>
      </div>
    </div>

    <!-- Error Display -->
    <div v-if="error" class="upload-error">
      <VaAlert color="danger" icon="error" size="small">
        {{ error }}
      </VaAlert>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'

interface Props {
  documentType: string
  documentLabel: string
  isUploading?: boolean
  maxFileSize?: number // in MB
  acceptedTypes?: string[]
}

interface Emits {
  (e: 'upload', file: File, documentType: string, title: string): void
}

const props = withDefaults(defineProps<Props>(), {
  isUploading: false,
  maxFileSize: 10,
  acceptedTypes: () => ['pdf', 'jpg', 'jpeg', 'png'],
})

const emit = defineEmits<Emits>()

const fileInput = ref<HTMLInputElement>()
const selectedFile = ref<File | null>(null)
const imagePreview = ref<string | undefined>(undefined)
const isDragOver = ref(false)
const error = ref<string | null>(null)

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const acceptedTypesString = computed(() => {
  return props.acceptedTypes.map((type) => `.${type}`).join(',')
})

const triggerFileInput = () => {
  if (!props.isUploading) {
    fileInput.value?.click()
  }
}

const handleFileSelect = (event: Event) => {
  const target = event.target as HTMLInputElement
  const file = target.files?.[0]
  if (file) {
    processFile(file)
  }
}

const handleDragOver = (event: DragEvent) => {
  event.preventDefault()
  isDragOver.value = true
}

const handleDragLeave = (event: DragEvent) => {
  event.preventDefault()
  isDragOver.value = false
}

const handleDrop = (event: DragEvent) => {
  event.preventDefault()
  isDragOver.value = false

  const files = event.dataTransfer?.files
  if (files && files.length > 0) {
    processFile(files[0])
  }
}

const processFile = (file: File) => {
  error.value = null

  // Validate file type
  const fileExtension = file.name.split('.').pop()?.toLowerCase()
  if (!fileExtension || !props.acceptedTypes.includes(fileExtension)) {
    error.value = `Invalid file type. Accepted types: ${props.acceptedTypes.join(', ').toUpperCase()}`
    return
  }

  // Validate file size
  const fileSizeMB = file.size / (1024 * 1024)
  if (fileSizeMB > props.maxFileSize) {
    error.value = `File size too large. Maximum size: ${props.maxFileSize}MB`
    return
  }

  selectedFile.value = file

  // Generate image preview for image files
  if (isImageFile(file)) {
    const reader = new FileReader()
    reader.onload = (e) => {
      imagePreview.value = e.target?.result as string
    }
    reader.readAsDataURL(file)
  }
}

const uploadFile = () => {
  if (selectedFile.value) {
    emit('upload', selectedFile.value, props.documentType, props.documentLabel)
    clearSelection()
  }
}

const clearSelection = () => {
  selectedFile.value = null
  imagePreview.value = undefined
  error.value = null
  if (fileInput.value) {
    fileInput.value.value = ''
  }
}

const isImageFile = (file: File) => {
  return file.type.startsWith('image/')
}

const formatFileSize = (bytes: number) => {
  if (bytes === 0) return '0 Bytes'

  const k = 1024
  const sizes = ['Bytes', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))

  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
}
</script>

<style scoped>
.document-upload {
  width: 100%;
}

.upload-zone {
  border: 2px dashed #d1d5db;
  border-radius: 12px;
  padding: 2rem;
  text-align: center;
  cursor: pointer;
  transition: all 0.3s ease;
  background: #fafafa;
  min-height: 200px;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
}

.upload-zone:hover {
  border-color: #3b82f6;
  background: #f0f9ff;
}

.upload-zone-active {
  border-color: #3b82f6;
  background: #eff6ff;
  transform: scale(1.02);
}

.upload-zone-uploading {
  border-color: #10b981;
  background: #f0fdf4;
  cursor: not-allowed;
}

.upload-loading {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1rem;
}

.upload-loading p {
  color: #10b981;
  font-weight: 500;
  margin: 0;
}

.upload-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1rem;
  width: 100%;
}

.upload-text h4 {
  font-size: 1.125rem;
  font-weight: 600;
  color: #374151;
  margin: 0;
}

.upload-text p {
  color: #6b7280;
  margin: 0;
  font-size: 0.875rem;
}

.upload-requirements {
  background: white;
  padding: 1rem;
  border-radius: 8px;
  border: 1px solid #e5e7eb;
  width: 100%;
  max-width: 300px;
  text-align: left;
}

.requirements-title {
  font-size: 0.875rem;
  font-weight: 600;
  color: #374151;
  margin: 0 0 0.5rem 0;
}

.requirements-list {
  font-size: 0.75rem;
  color: #6b7280;
  margin: 0;
  padding-left: 1rem;
}

.requirements-list li {
  margin-bottom: 0.25rem;
}

.file-preview {
  margin-top: 1rem;
  background: white;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  padding: 1rem;
}

.preview-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
}

.preview-header h4 {
  font-size: 1rem;
  font-weight: 600;
  color: #374151;
  margin: 0;
}

.preview-content {
  margin-bottom: 1rem;
}

.file-info {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  margin-bottom: 1rem;
}

.file-details {
  flex: 1;
}

.file-name {
  font-weight: 500;
  color: #374151;
  margin: 0 0 0.25rem 0;
  word-break: break-word;
}

.file-size {
  font-size: 0.875rem;
  color: #6b7280;
  margin: 0;
}

.image-preview {
  display: flex;
  justify-content: center;
  margin-top: 1rem;
}

.image-preview img {
  max-width: 200px;
  max-height: 200px;
  border-radius: 8px;
  border: 1px solid #e5e7eb;
  object-fit: cover;
}

.preview-actions {
  display: flex;
  justify-content: center;
}

.upload-error {
  margin-top: 1rem;
}

/* Responsive Design */
@media (max-width: 480px) {
  .upload-zone {
    padding: 1.5rem 1rem;
    min-height: 150px;
  }

  .upload-requirements {
    max-width: none;
  }

  .preview-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 0.5rem;
  }

  .file-info {
    flex-direction: column;
    align-items: flex-start;
    text-align: left;
  }

  .image-preview img {
    max-width: 150px;
    max-height: 150px;
  }
}
</style>
