<template>
  <div class="verification-details">
    <!-- Modern Header with Breadcrumb -->
    <div class="modern-header">
      <VaInnerLoading :loading="loading">
        <div class="header-content">
          <div class="breadcrumb-section">
            <VaButton preset="plain" icon="arrow_back" class="back-btn" color="primary" @click="router.go(-1)" />
            <VaBreadcrumbs class="breadcrumb">
              <VaBreadcrumbsItem label="Admin" />
              <VaBreadcrumbsItem label="Verifications" />
              <VaBreadcrumbsItem label="User Details" active />
            </VaBreadcrumbs>
          </div>
          <div v-if="verification" class="header-title">
            <h1 class="va-h1 page-title">Verification Details</h1>
            <p class="va-text-secondary page-subtitle">
              Review and manage {{ verification.user_name }}'s verification process
            </p>
          </div>
        </div>
      </VaInnerLoading>
    </div>

    <VaAlert v-if="verificationStore.error" color="danger" class="error-alert" @close="verificationStore.clearError">
      {{ verificationStore.error }}
    </VaAlert>

    <!-- Multi-Step Verification Process -->
    <div v-if="!loading && verification" class="verification-stepper-container">
      <div class="stepper-wrapper">
        <EnhancedVerificationStepper
          :user-id="verification.id"
          :verification="verification"
          @refreshNeeded="loadVerificationDetails"
          @verified="onStepVerified"
          @completed="onVerificationCompleted"
          @documentView="onDocumentView"
        />
      </div>
    </div>

    <!-- Loading State with Skeleton -->
    <div v-if="loading" class="loading-state">
      <div class="skeleton-cards">
        <div v-for="i in 3" :key="i" class="skeleton-card">
          <div class="skeleton-header"></div>
          <div class="skeleton-content">
            <div v-for="j in 4" :key="j" class="skeleton-line"></div>
          </div>
        </div>
      </div>
    </div>

    <!-- Main Content -->
    <div v-else-if="verification" class="main-content">
      <!-- User Profile Section -->
      <div class="profile-section">
        <VaCard gradient color="primary" class="profile-card">
          <VaCardContent class="profile-content">
            <div class="profile-header">
              <div class="profile-avatar">
                <VaAvatar size="large" color="background-element">
                  <VaIcon name="person" size="large" />
                </VaAvatar>
                <div class="status-indicator">
                  <div class="status-badge" :class="getStatusColor(verification.status)">
                    {{ verification.status_display }}
                  </div>
                </div>
              </div>
              <div class="profile-info">
                <h2 class="va-h2 user-name">{{ verification.user_name }}</h2>
                <p class="va-text-secondary user-email">{{ verification.user_email }}</p>
                <VaDivider class="my-3" />
                <div class="user-meta">
                  <VaChip outline class="meta-chip">
                    <VaIcon name="phone" size="small" class="mr-1" />
                    {{ verification.user_phone }}
                  </VaChip>
                  <VaChip outline class="meta-chip">
                    <VaIcon name="work" size="small" class="mr-1" />
                    {{ verification.user_role?.display }}
                  </VaChip>
                  <VaChip outline class="meta-chip">
                    <VaIcon name="schedule" size="small" class="mr-1" />
                    {{ verification.days_since_registration }} days
                  </VaChip>
                </div>
              </div>
            </div>
          </VaCardContent>
        </VaCard>
      </div>

      <!-- Progress & Stats Grid -->
      <div class="stats-grid">
        <!-- Progress Card -->
        <VaCard stripe stripe-color="success" class="progress-card">
          <VaCardTitle class="flex items-center gap-3">
            <VaIcon name="trending_up" color="success" size="large" />
            <div>
              <div class="va-h5">Verification Progress</div>
              <div class="va-text-secondary">{{ verification.current_step_display }}</div>
            </div>
          </VaCardTitle>
          <VaCardContent>
            <div class="progress-content">
              <VaProgressCircle
                :model-value="verification.progress"
                :color="getProgressColor(verification.progress)"
                :thickness="0.08"
                size="large"
                class="progress-circle"
              >
                <div class="text-center">
                  <div class="va-h3">{{ verification.progress }}%</div>
                  <div class="va-text-secondary" style="font-size: 0.75rem">Complete</div>
                </div>
              </VaProgressCircle>
            </div>
            <VaDivider class="my-3" />
            <div class="flex justify-between items-center">
              <span class="va-text-secondary">Current Step:</span>
              <VaChip :color="getProgressColor(verification.progress)" size="small">
                {{ verification.current_step_display }}
              </VaChip>
            </div>
          </VaCardContent>
        </VaCard>

        <!-- Documents Summary Card -->
        <VaCard stripe stripe-color="info" class="documents-summary-card">
          <VaCardTitle class="flex items-center gap-3">
            <VaIcon name="description" color="info" size="large" />
            <div>
              <div class="va-h5">Documents Overview</div>
              <div class="va-text-secondary">{{ getDocumentCount() }} total documents</div>
            </div>
          </VaCardTitle>
          <VaCardContent>
            <div class="docs-stats-grid">
              <VaCounter
                :model-value="verification.documents_summary?.verified || 0"
                color="success"
                label="Verified"
                class="stat-counter"
              />
              <VaCounter
                :model-value="verification.documents_summary?.pending || 0"
                color="warning"
                label="Pending"
                class="stat-counter"
              />
              <VaCounter
                :model-value="verification.documents_summary?.rejected || 0"
                color="danger"
                label="Rejected"
                class="stat-counter"
              />
            </div>
          </VaCardContent>
        </VaCard>
      </div>

      <!-- Address Information -->
      <VaCard v-if="verification.user_address" class="address-card">
        <VaCardTitle>Address Information</VaCardTitle>
        <VaCardContent>
          <div class="address-info">
            <template v-if="'street' in verification.user_address">
              <p><strong>Street:</strong> {{ verification.user_address.street }}</p>
              <p><strong>City:</strong> {{ verification.user_address.city }}</p>
            </template>
            <template v-else>
              <p><strong>Office Address:</strong> {{ verification.user_address.office_address }}</p>
              <p><strong>Ward:</strong> {{ verification.user_address.ward }}</p>
            </template>
            <p><strong>Region:</strong> {{ verification.user_address.region }}</p>
            <p><strong>District:</strong> {{ verification.user_address.district }}</p>
          </div>
        </VaCardContent>
      </VaCard>

      <!-- Documents Summary -->
      <VaCard class="documents-card">
        <VaCardTitle>Documents Summary</VaCardTitle>
        <VaCardContent>
          <div class="documents-summary">
            <div class="doc-stat">
              <span class="doc-label">Total Documents:</span>
              <span class="doc-value">{{ getDocumentCount() }}</span>
            </div>
            <div class="doc-stat">
              <span class="doc-label">Verified:</span>
              <span class="doc-value verified">{{ verification.documents_summary?.verified || 0 }}</span>
            </div>
            <div class="doc-stat">
              <span class="doc-label">Pending:</span>
              <span class="doc-value pending">{{ verification.documents_summary?.pending || 0 }}</span>
            </div>
            <div class="doc-stat">
              <span class="doc-label">Rejected:</span>
              <span class="doc-value rejected">{{ verification.documents_summary?.rejected || 0 }}</span>
            </div>
          </div>
        </VaCardContent>
      </VaCard>

      <!-- User Documents Section -->
      <VaCard class="documents-section modern-card">
        <VaCardContent>
          <div class="section-header">
            <div class="section-title-area">
              <div class="section-icon">
                <VaIcon name="folder" />
              </div>
              <div>
                <h3 class="section-title">User Documents</h3>
                <p class="section-subtitle">Review uploaded verification documents</p>
              </div>
            </div>
            <VaButton
              preset="secondary"
              icon="refresh"
              :loading="loadingDocuments"
              class="refresh-btn"
              @click="loadUserDocuments"
            >
              Refresh
            </VaButton>
          </div>

          <!-- Documents Content -->
          <div class="documents-content">
            <!-- Loading State -->
            <div v-if="loadingDocuments" class="documents-loading">
              <div class="loading-skeleton">
                <div v-for="i in 3" :key="i" class="skeleton-doc">
                  <div class="skeleton-doc-icon"></div>
                  <div class="skeleton-doc-content">
                    <div class="skeleton-doc-title"></div>
                    <div class="skeleton-doc-meta"></div>
                  </div>
                </div>
              </div>
            </div>

            <!-- Empty State -->
            <div v-else-if="userDocuments.length === 0" class="empty-documents">
              <div class="empty-icon">
                <VaIcon name="description" size="3rem" />
              </div>
              <h4 class="empty-title">No Documents Found</h4>
              <p class="empty-text">This user hasn't uploaded any documents yet.</p>
            </div>

            <!-- Documents Grid -->
            <div v-else class="documents-grid">
              <div
                v-for="document in userDocuments"
                :key="document.id"
                class="document-card"
                @click="viewDocument(document)"
              >
                <div class="document-card-header">
                  <div class="document-type-icon">
                    <VaIcon :name="getDocumentIcon(document.document_type)" />
                  </div>
                  <VaBadge
                    :color="getStatusColor(document.verification_status)"
                    :text="document.verification_status_display"
                    class="document-status"
                  />
                </div>
                <div class="document-card-body">
                  <h4 class="document-title">{{ document.title }}</h4>
                  <p class="document-type">{{ document.document_type_display }}</p>
                  <div class="document-meta">
                    <span class="document-date">
                      <VaIcon name="schedule" size="small" />
                      {{ formatDate(document.created_at) }}
                    </span>
                  </div>
                </div>
                <div class="document-card-actions">
                  <VaButton preset="primary" size="small" icon="visibility" @click.stop="viewDocument(document)">
                    View
                  </VaButton>
                  <VaButton preset="secondary" size="small" icon="download" @click.stop="downloadDocument(document)" />
                </div>
              </div>
            </div>
          </div>
        </VaCardContent>
      </VaCard>
    </div>

    <!-- Document Viewer Modal -->
    <VaModal
      v-model="showDocumentViewer"
      :title="`Document Preview - ${selectedDocument?.title}`"
      size="large"
      @close="showDocumentViewer = false"
    >
      <div v-if="selectedDocument" class="document-viewer">
        <div class="document-info-section">
          <h3>Document Information</h3>
          <div class="info-grid">
            <div class="info-item">
              <span class="label">Type:</span>
              <span class="value">{{ selectedDocument.document_type_display }}</span>
            </div>
            <div class="info-item">
              <span class="label">Status:</span>
              <VaBadge
                :color="getStatusColor(selectedDocument.verification_status)"
                :text="selectedDocument.verification_status_display"
              />
            </div>
            <div class="info-item">
              <span class="label">Uploaded:</span>
              <span class="value">{{ formatDate(selectedDocument.created_at) }}</span>
            </div>
          </div>
        </div>

        <div class="document-preview-section">
          <h3>Document Preview</h3>
          <div class="preview-container">
            <div v-if="selectedDocument.file_url" class="preview-wrapper">
              <!-- Try to embed PDF first -->
              <embed
                v-if="selectedDocument.file_url.toLowerCase().includes('.pdf')"
                :src="selectedDocument.file_url"
                type="application/pdf"
                width="100%"
                height="500px"
                class="document-embed"
              />
              <!-- For images -->
              <img
                v-else-if="isImageFile(selectedDocument.file_url)"
                :src="selectedDocument.file_url"
                :alt="selectedDocument.title"
                class="document-image"
              />
              <!-- Fallback for other files -->
              <div v-else class="file-preview">
                <VaIcon name="description" size="4rem" color="primary" />
                <p>{{ selectedDocument.title }}</p>
                <VaButton color="primary" @click="downloadDocument(selectedDocument)"> Download to View </VaButton>
              </div>
            </div>
            <div v-else class="no-preview">
              <VaIcon name="description" size="4rem" color="secondary" />
              <p>No preview available</p>
            </div>
          </div>
        </div>

        <div class="document-actions-section">
          <div class="action-buttons">
            <VaButton color="success" :loading="verificationStore.loading.actions" @click="verifySelectedDocument">
              ✓ Verify Document
            </VaButton>
            <VaButton color="danger" :loading="verificationStore.loading.actions" @click="rejectSelectedDocument">
              ✗ Reject Document
            </VaButton>
            <VaButton color="secondary" @click="downloadDocument(selectedDocument)"> Download </VaButton>
          </div>
        </div>
      </div>
    </VaModal>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useVerificationStore } from '../../../../stores/verification-store'
import { verificationService } from '../../../../services/verificationService'
import EnhancedVerificationStepper from '../../../../components/verification/EnhancedVerificationStepper.vue'
// import SimpleVerificationStepper from '../../../../components/verification/SimpleVerificationStepper.vue'
import type { VerificationUser, Document } from '../../../../services/verificationService'

const route = useRoute()
const router = useRouter()
const verificationStore = useVerificationStore()

const verification = ref<VerificationUser | null>(null)
const loading = ref(true)
const userDocuments = ref<Document[]>([])
const loadingDocuments = ref(false)
const showDocumentViewer = ref(false)
const selectedDocument = ref<Document | null>(null)

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

const getProgressColor = (progress: number) => {
  if (progress >= 80) return 'success'
  if (progress >= 50) return 'warning'
  return 'danger'
}

const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString()
}

const getDocumentCount = () => {
  if (!verification.value) return 0

  // Use the new API structure with documents_summary
  if (verification.value.documents_summary?.total) {
    return verification.value.documents_summary.total
  }

  // Fallback to checking if documents array exists in missing_information
  if (verification.value.missing_information?.documents?.length) {
    return verification.value.missing_information.documents.length
  }

  return 0
}

const loadUserDocuments = async () => {
  if (!verification.value) {
    console.log('No verification data available, skipping document loading')
    return
  }

  loadingDocuments.value = true
  try {
    console.log('Loading user documents for email:', verification.value.user_email)

    // First check if documents are in the missing_information structure
    if (
      verification.value.missing_information?.documents &&
      verification.value.missing_information.documents.length > 0
    ) {
      console.log('Using documents from missing_information:', verification.value.missing_information.documents)
      userDocuments.value = verification.value.missing_information.documents
      return
    }

    // Try to get all documents and filter by user email
    const allDocsResponse = await verificationService.getAllDocuments()

    // Filter documents for this specific user by email
    if (allDocsResponse.results) {
      userDocuments.value = allDocsResponse.results.filter(
        (doc: any) => doc.user_email === verification.value?.user_email,
      )
      console.log('Loaded documents from all documents:', userDocuments.value)
    } else {
      // Fallback to pending documents
      const pendingResponse = await verificationService.getPendingDocuments()
      userDocuments.value =
        pendingResponse.documents?.filter((doc) => doc.user_email === verification.value?.user_email) || []
      console.log('Loaded documents from pending documents:', userDocuments.value)
    }
  } catch (error) {
    console.error('Failed to load user documents:', error)

    // If all documents endpoint fails, try pending documents as fallback
    try {
      const pendingResponse = await verificationService.getPendingDocuments()
      userDocuments.value =
        pendingResponse.documents?.filter((doc) => doc.user_email === verification.value?.user_email) || []
      console.log('Loaded documents from pending documents fallback:', userDocuments.value)
    } catch (fallbackError) {
      console.error('Failed to load pending documents:', fallbackError)
      // Set empty array if all fails
      userDocuments.value = []
    }
  } finally {
    console.log('Setting loadingDocuments to false')
    loadingDocuments.value = false
  }
}

const viewDocument = (document: Document) => {
  selectedDocument.value = document
  showDocumentViewer.value = true
}

const downloadDocument = (document: Document) => {
  if (document.file_url) {
    window.open(document.file_url, '_blank')
  }
}

const isImageFile = (url: string) => {
  const imageExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.bmp', '.webp', '.svg']
  return imageExtensions.some((ext) => url.toLowerCase().includes(ext))
}

const getDocumentIcon = (documentType: string) => {
  switch (documentType) {
    case 'roll_number_cert':
      return 'assignment'
    case 'practice_license':
      return 'verified'
    case 'work_certificate':
      return 'work'
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

const verifySelectedDocument = async () => {
  if (!selectedDocument.value) return

  try {
    await verificationStore.verifyDocument(selectedDocument.value.id, 'Document verified by admin')
    showDocumentViewer.value = false
    await loadUserDocuments() // Refresh the documents list
  } catch (error) {
    console.error('Failed to verify document:', error)
  }
}

const rejectSelectedDocument = async () => {
  if (!selectedDocument.value) return

  try {
    await verificationStore.rejectDocument(selectedDocument.value.id, 'Document rejected by admin')
    showDocumentViewer.value = false
    await loadUserDocuments() // Refresh the documents list
  } catch (error) {
    console.error('Failed to reject document:', error)
  }
}

const loadVerificationDetails = async () => {
  const verificationId = route.params.id as string

  if (!verificationId) {
    console.error('No verification ID provided')
    loading.value = false
    return
  }

  try {
    console.log('Loading verification details for ID:', verificationId)

    // Try to get from verification service first
    verification.value = await verificationService.getVerificationDetails(parseInt(verificationId))
    console.log('Loaded verification data:', verification.value)

    // Load user documents after verification details are loaded
    if (verification.value) {
      await loadUserDocuments()
    }
  } catch (error) {
    console.error('Failed to load verification details:', error)

    // Try to get from store as fallback
    const storeVerification = verificationStore.verifications.find((v) => v.id === parseInt(verificationId))
    if (storeVerification) {
      console.log('Using store verification data:', storeVerification)
      verification.value = storeVerification
      await loadUserDocuments()
    } else {
      console.log('Creating mock verification data for ID:', verificationId)
      // Create mock verification for demo purposes
      verification.value = {
        id: parseInt(verificationId),
        user_name: `Demo User ${verificationId}`,
        user_email: `demo${verificationId}@example.com`,
        user_phone: '+1234567890',
        user_role: { display: 'Advocate', value: 'advocate' },
        status: 'pending',
        status_display: 'Pending Review',
        current_step: 'documents',
        current_step_display: 'Document Review',
        progress: 40,
        days_since_registration: 5,
        documents_summary: {
          total_uploaded: 3,
          verified: 3,
          pending: 0,
          rejected: 0,
          latest_upload: new Date().toISOString(),
        },
        documents: [
          {
            id: 1,
            user: parseInt(verificationId),
            user_email: `demo${verificationId}@example.com`,
            user_name: `Demo User ${verificationId}`,
            document_type: 'roll_number_cert',
            document_type_display: 'Roll Number Certificate',
            file_url: 'https://via.placeholder.com/400x300/4CAF50/white?text=Certificate',
            title: 'Demo Certificate',
            verification_status: 'verified',
            verification_status_display: 'Verified',
            created_at: new Date().toISOString(),
          },
        ],
        required_documents: [
          {
            type: 'roll_number_cert',
            label: 'Roll Number Certificate',
            required: true,
            uploaded: true,
            status: 'verified',
            document_id: 1,
          },
          {
            type: 'practice_license',
            label: 'Practice License',
            required: true,
            uploaded: false,
            status: null,
            document_id: null,
          },
        ],
        missing_information: {
          has_missing_items: true,
          is_ready_for_approval: false,
          by_step: {
            documents: {
              status: 'complete',
              is_current: false,
              issues: [],
            },
            identity: {
              status: 'complete',
              is_current: false,
              issues: [],
            },
            contact: {
              status: 'complete',
              is_current: false,
              issues: [],
            },
            role_specific: {
              status: 'incomplete',
              is_current: false,
              issues: [
                {
                  type: 'missing_field',
                  field: 'years_of_experience',
                  message: 'Years of experience not specified',
                },
              ],
            },
            final: {
              status: 'incomplete',
              is_current: true,
              issues: [],
            },
          },
          current_step: 'final',
          summary: '⚠️ Missing profile information',
        },
      } as any
    }
  } finally {
    console.log('Setting loading to false')
    loading.value = false
  }
}

// Event handlers for the stepper
const onStepVerified = (stepKey: string) => {
  console.log(`Step ${stepKey} verified`)
  // Could add specific logic here if needed
}

const onVerificationCompleted = () => {
  console.log('Verification completed')
  // Could add specific completion logic here
}

const onDocumentView = (document: any) => {
  console.log('Document view requested from stepper:', document)
  // Use the existing document viewer
  selectedDocument.value = document
  showDocumentViewer.value = true
}

onMounted(async () => {
  try {
    console.log('Component mounted, loading verification details...')

    // Set a timeout to prevent infinite loading
    setTimeout(() => {
      if (loading.value) {
        console.warn('Loading timeout reached, forcing loading to false')
        loading.value = false
      }
    }, 10000) // 10 second timeout

    await loadVerificationDetails()
    console.log('Verification details loaded successfully')
  } catch (error) {
    console.error('Error in onMounted:', error)
    loading.value = false
  }
})
</script>

<style scoped>
.verification-details {
  min-height: 100vh;
  background: var(--va-background-secondary);
  padding: 0;
}

/* Modern Header */
.modern-header {
  background: var(--va-background-element);
  border-bottom: 1px solid var(--va-background-border);
  padding: 2rem 0;
  margin-bottom: 2rem;
  box-shadow: var(--va-box-shadow);
}

.header-content {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 2rem;
}

.breadcrumb-section {
  display: flex;
  align-items: center;
  gap: 1rem;
  margin-bottom: 1rem;
}

.back-btn {
  padding: 0.5rem;
  border-radius: 50%;
  transition: var(--transition);
}

.back-btn:hover {
  background: rgba(102, 126, 234, 0.1);
  transform: translateX(-2px);
}

.breadcrumb {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.9rem;
}

.breadcrumb-item {
  color: #6b7280;
  transition: var(--transition);
}

.breadcrumb-current {
  color: #667eea;
  font-weight: 500;
}

.breadcrumb-separator {
  color: #d1d5db;
}

.header-title {
  margin-left: 3rem;
}

.page-title {
  margin: 0 0 0.5rem 0;
}

.page-subtitle {
  margin: 0;
}

.error-alert {
  max-width: 1200px;
  margin: 0 auto 2rem auto;
  padding: 0 2rem;
}

/* Loading States */
.loading-state {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 2rem;
}

.skeleton-cards {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(350px, 1fr));
  gap: 2rem;
}

.skeleton-card {
  background: white;
  border-radius: var(--border-radius);
  padding: 2rem;
  box-shadow: var(--card-shadow);
}

.skeleton-header {
  height: 20px;
  background: linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%);
  background-size: 200% 100%;
  animation: shimmer 2s infinite;
  border-radius: 4px;
  margin-bottom: 1rem;
}

.skeleton-content {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.skeleton-line {
  height: 16px;
  background: linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%);
  background-size: 200% 100%;
  animation: shimmer 2s infinite;
  border-radius: 4px;
}

.skeleton-line:nth-child(1) {
  width: 80%;
}
.skeleton-line:nth-child(2) {
  width: 60%;
}
.skeleton-line:nth-child(3) {
  width: 90%;
}
.skeleton-line:nth-child(4) {
  width: 70%;
}

@keyframes shimmer {
  0% {
    background-position: -200% 0;
  }
  100% {
    background-position: 200% 0;
  }
}

/* Main Content */
.main-content {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 2rem 2rem 2rem;
  display: flex;
  flex-direction: column;
  gap: 2rem;
}

/* Modern Cards */
.modern-card {
  background: white !important;
  border-radius: 12px !important;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08) !important;
  border: 1px solid rgba(0, 0, 0, 0.06) !important;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1) !important;
  overflow: hidden;
}

.modern-card:hover {
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.12) !important;
  transform: translateY(-2px) !important;
  border-color: rgba(0, 0, 0, 0.1) !important;
}

/* Profile Section */
.profile-section {
  margin-bottom: 1rem;
}

.profile-card {
  box-shadow: var(--va-box-shadow) !important;
}

.profile-content {
  padding: 2rem !important;
}

.profile-header {
  display: flex;
  align-items: center;
  gap: 2rem;
}

.profile-avatar {
  position: relative;
}

.status-indicator {
  position: absolute;
  top: -8px;
  right: -8px;
}

.status-badge {
  padding: 0.25rem 0.75rem;
  border-radius: 9999px;
  font-size: 0.75rem;
  font-weight: 600;
  background: white;
  border: 1px solid rgba(255, 255, 255, 0.3);
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.status-badge.success {
  background: rgba(34, 197, 94, 0.9);
  color: white;
}

.status-badge.warning {
  background: rgba(245, 158, 11, 0.9);
  color: white;
}

.status-badge.danger {
  background: rgba(239, 68, 68, 0.9);
  color: white;
}

.status-badge.secondary {
  background: rgba(107, 114, 128, 0.9);
  color: white;
}

.profile-info {
  flex: 1;
}

.user-name {
  margin: 0 0 0.5rem 0;
  color: var(--va-on-primary) !important;
}

.user-email {
  margin: 0 0 1rem 0;
  color: var(--va-on-primary) !important;
  opacity: 0.9;
}

.user-meta {
  display: flex;
  flex-wrap: wrap;
  gap: 0.75rem;
}

.meta-chip {
  color: var(--va-on-primary) !important;
  border-color: var(--va-on-primary) !important;
}

/* Stats Grid */
.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 2rem;
}

/* Card Headers */
.card-header {
  display: flex;
  align-items: center;
  gap: 1rem;
  margin-bottom: 1.5rem;
}

.card-icon {
  width: 48px;
  height: 48px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.5rem;
}

.progress-icon {
  background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%) !important;
  color: white !important;
  box-shadow: 0 4px 12px rgba(79, 172, 254, 0.3) !important;
}

.docs-icon {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%) !important;
  color: white !important;
  box-shadow: 0 4px 12px rgba(102, 126, 234, 0.3) !important;
}

.card-title-section {
  flex: 1;
}

.card-title {
  font-size: 1.25rem;
  font-weight: 600;
  color: #1f2937;
  margin: 0 0 0.25rem 0;
}

.card-subtitle {
  font-size: 0.9rem;
  color: #6b7280;
  margin: 0;
}

/* Progress Content */
.progress-content {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 1rem 0;
}

.progress-circle {
  margin: 0 auto;
}

.docs-stats-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 1rem;
  margin-top: 1rem;
}

.stat-counter {
  text-align: center;
}

/* Documents Stats */
.docs-stats {
  display: flex;
  justify-content: space-around;
  gap: 1rem;
}

.stat-item {
  text-align: center;
  padding: 1rem;
  border-radius: 8px;
  background: rgba(0, 0, 0, 0.02);
  flex: 1;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.stat-item:hover {
  transform: translateY(-2px);
  background: rgba(0, 0, 0, 0.04);
}

.stat-number {
  font-size: 2rem;
  font-weight: 700;
  margin-bottom: 0.25rem;
}

.stat-label {
  font-size: 0.85rem;
  font-weight: 500;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.stat-item.verified .stat-number {
  color: #10b981;
}
.stat-item.pending .stat-number {
  color: #f59e0b;
}
.stat-item.rejected .stat-number {
  color: #ef4444;
}

/* Documents Section */
.documents-section {
  margin-top: 1rem;
}

.section-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 2rem;
  padding-bottom: 1rem;
  border-bottom: 1px solid rgba(0, 0, 0, 0.05);
}

.section-title-area {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.section-icon {
  width: 40px;
  height: 40px;
  border-radius: 10px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%) !important;
  color: white !important;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.25rem;
  box-shadow: 0 4px 12px rgba(102, 126, 234, 0.3) !important;
}

.section-title {
  font-size: 1.5rem;
  font-weight: 600;
  color: #1f2937;
  margin: 0;
}

.section-subtitle {
  font-size: 0.9rem;
  color: #6b7280;
  margin: 0.25rem 0 0 0;
}

.refresh-btn {
  border-radius: 8px;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

/* Documents Content */
.documents-content {
  min-height: 200px;
}

/* Loading Skeleton for Documents */
.documents-loading {
  padding: 1rem 0;
}

.loading-skeleton {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 1rem;
}

.skeleton-doc {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 1rem;
  background: rgba(0, 0, 0, 0.02);
  border-radius: var(--border-radius-small);
}

.skeleton-doc-icon {
  width: 40px;
  height: 40px;
  border-radius: 8px;
  background: linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%);
  background-size: 200% 100%;
  animation: shimmer 2s infinite;
}

.skeleton-doc-content {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.skeleton-doc-title {
  height: 16px;
  width: 80%;
  background: linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%);
  background-size: 200% 100%;
  animation: shimmer 2s infinite;
  border-radius: 4px;
}

.skeleton-doc-meta {
  height: 12px;
  width: 60%;
  background: linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%);
  background-size: 200% 100%;
  animation: shimmer 2s infinite;
  border-radius: 4px;
}

/* Empty State */
.empty-documents {
  text-align: center;
  padding: 3rem 2rem;
  color: #6b7280;
}

.empty-icon {
  margin-bottom: 1rem;
  opacity: 0.5;
}

.empty-title {
  font-size: 1.25rem;
  font-weight: 600;
  color: #374151;
  margin: 0 0 0.5rem 0;
}

.empty-text {
  font-size: 1rem;
  margin: 0;
}

/* Documents Grid */
.documents-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
  gap: 1.5rem;
}

.document-card {
  background: white;
  border: 1px solid rgba(0, 0, 0, 0.05);
  border-radius: var(--border-radius);
  padding: 1.5rem;
  cursor: pointer;
  transition: var(--transition);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);
}

.document-card:hover {
  transform: translateY(-4px);
  box-shadow: var(--card-shadow-hover);
  border-color: rgba(102, 126, 234, 0.2);
}

.document-card-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 1rem;
}

.document-type-icon {
  width: 40px;
  height: 40px;
  border-radius: 10px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%) !important;
  color: white !important;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.25rem;
  box-shadow: 0 4px 12px rgba(102, 126, 234, 0.3) !important;
}

.document-status {
  font-size: 0.75rem;
  font-weight: 600;
  padding: 0.25rem 0.75rem;
}

.document-card-body {
  margin-bottom: 1.5rem;
}

.document-title {
  font-size: 1.1rem;
  font-weight: 600;
  color: #1f2937;
  margin: 0 0 0.5rem 0;
  line-height: 1.4;
}

.document-type {
  font-size: 0.9rem;
  color: #6b7280;
  margin: 0 0 0.75rem 0;
}

.document-meta {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.document-date {
  display: flex;
  align-items: center;
  gap: 0.25rem;
  font-size: 0.85rem;
  color: #9ca3af;
}

.document-card-actions {
  display: flex;
  gap: 0.75rem;
  justify-content: flex-end;
}

/* Action Panel */
.action-panel {
  margin-top: 2rem;
}

.actions-header {
  margin-bottom: 2rem;
  padding-bottom: 1rem;
  border-bottom: 1px solid rgba(0, 0, 0, 0.05);
}

.actions-title-area {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.actions-icon {
  width: 48px;
  height: 48px;
  border-radius: 12px;
  background: linear-gradient(135deg, #ff6b6b 0%, #ee5a24 100%) !important;
  color: white !important;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.5rem;
  box-shadow: 0 4px 12px rgba(255, 107, 107, 0.3) !important;
}

.actions-title {
  font-size: 1.5rem;
  font-weight: 600;
  color: #1f2937;
  margin: 0;
}

.actions-subtitle {
  font-size: 0.9rem;
  color: #6b7280;
  margin: 0.25rem 0 0 0;
}

.actions-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 1.5rem;
}

.action-card {
  transition: all 0.3s ease;
  cursor: pointer;
}

.action-card:hover {
  transform: translateY(-4px);
  box-shadow: var(--va-box-shadow) !important;
}

.approve-card:hover {
  border-color: var(--va-success) !important;
}

.reject-card:hover {
  border-color: var(--va-danger) !important;
}

.review-card:hover {
  border-color: var(--va-primary) !important;
}

.action-item {
  background: white;
  border: 2px solid rgba(0, 0, 0, 0.05);
  border-radius: var(--border-radius);
  padding: 1.5rem;
  transition: var(--transition);
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.action-item:hover {
  transform: translateY(-2px);
  box-shadow: var(--card-shadow);
}

.approve-action:hover {
  border-color: rgba(16, 185, 129, 0.3);
  background: rgba(16, 185, 129, 0.02);
}

.reject-action:hover {
  border-color: rgba(239, 68, 68, 0.3);
  background: rgba(239, 68, 68, 0.02);
}

.review-action:hover {
  border-color: rgba(102, 126, 234, 0.3);
  background: rgba(102, 126, 234, 0.02);
}

.action-content {
  display: flex;
  align-items: center;
  gap: 1rem;
  flex: 1;
}

.action-icon {
  width: 48px;
  height: 48px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.5rem;
}

.action-icon.success {
  background: linear-gradient(135deg, #10b981 0%, #059669 100%) !important;
  color: white !important;
  box-shadow: 0 4px 12px rgba(16, 185, 129, 0.3) !important;
}

.action-icon.danger {
  background: linear-gradient(135deg, #ff6b6b 0%, #ee5a24 100%) !important;
  color: white !important;
  box-shadow: 0 4px 12px rgba(255, 107, 107, 0.3) !important;
}

.action-icon.primary {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%) !important;
  color: white !important;
  box-shadow: 0 4px 12px rgba(102, 126, 234, 0.3) !important;
}

.action-info {
  flex: 1;
}

.action-title {
  font-size: 1.1rem;
  font-weight: 600;
  color: #1f2937;
  margin: 0 0 0.25rem 0;
}

.action-description {
  font-size: 0.9rem;
  color: #6b7280;
  margin: 0;
}

.action-button {
  align-self: stretch;
  border-radius: var(--border-radius-small);
  font-weight: 600;
  transition: var(--transition);
}

/* Verification Stepper Container */
.verification-stepper-container {
  margin-top: 2rem;
}

/* Responsive Design */
@media (max-width: 768px) {
  .verification-details {
    padding: 0;
  }

  .header-content {
    padding: 0 1rem;
  }

  .header-title {
    margin-left: 0;
  }

  .page-title {
    font-size: 2rem;
  }

  .main-content {
    padding: 0 1rem 2rem 1rem;
  }

  .profile-header {
    flex-direction: column;
    text-align: center;
    gap: 1rem;
  }

  .user-meta {
    justify-content: center;
  }

  .stats-grid {
    grid-template-columns: 1fr;
  }

  .progress-content {
    flex-direction: column;
    text-align: center;
  }

  .docs-stats {
    flex-direction: column;
    gap: 0.5rem;
  }

  .documents-grid {
    grid-template-columns: 1fr;
  }

  .actions-grid {
    grid-template-columns: 1fr;
  }

  .action-content {
    flex-direction: column;
    text-align: center;
  }

  .section-header {
    flex-direction: column;
    gap: 1rem;
    align-items: stretch;
  }
}

@media (max-width: 480px) {
  .breadcrumb {
    display: none;
  }

  .page-title {
    font-size: 1.75rem;
  }

  .user-name {
    font-size: 1.5rem;
  }

  .card-header {
    flex-direction: column;
    text-align: center;
    gap: 0.75rem;
  }
}
.address-card,
.documents-card,
.actions-card {
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.info-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 1rem;
}

.info-item {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.info-item .label {
  font-weight: 500;
  color: #7f8c8d;
  font-size: 0.9rem;
}

.info-item .value {
  color: #2c3e50;
  font-size: 1rem;
}

.progress-section {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.progress-bar {
  height: 1rem;
}

.progress-info {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.progress-text {
  font-weight: 500;
  color: #2c3e50;
}

.days-text {
  color: #7f8c8d;
  font-size: 0.9rem;
}

.address-info p {
  margin: 0.5rem 0;
  color: #2c3e50;
}

.documents-summary {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
  gap: 1rem;
}

.doc-stat {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 1rem;
  background: #f8f9fa;
  border-radius: 0.5rem;
}

.doc-label {
  font-size: 0.9rem;
  color: #7f8c8d;
  margin-bottom: 0.5rem;
}

.doc-value {
  font-size: 1.5rem;
  font-weight: bold;
  color: #2c3e50;
}

.doc-value.verified {
  color: #27ae60;
}
.doc-value.pending {
  color: #f39c12;
}
.doc-value.rejected {
  color: #e74c3c;
}

.action-buttons {
  display: flex;
  gap: 1rem;
  justify-content: center;
  flex-wrap: wrap;
}

/* Document list styles */
.user-documents-card {
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.documents-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  width: 100%;
}

.loading-documents {
  display: flex;
  align-items: center;
  gap: 1rem;
  justify-content: center;
  padding: 2rem;
}

.no-documents {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 3rem;
  text-align: center;
  color: #7f8c8d;
}

.no-documents p {
  margin: 1rem 0;
}

.documents-list {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.document-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem;
  border: 1px solid #ecf0f1;
  border-radius: 0.5rem;
  cursor: pointer;
  transition: all 0.2s;
}

.document-item:hover {
  background-color: #f8f9fa;
  border-color: #3498db;
}

.document-info {
  flex: 1;
}

.document-title {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-weight: 500;
  color: #2c3e50;
  margin-bottom: 0.5rem;
}

.document-icon {
  color: #3498db;
}

.document-meta {
  display: flex;
  align-items: center;
  gap: 1rem;
  margin-bottom: 0.25rem;
}

.document-type {
  color: #7f8c8d;
  font-size: 0.9rem;
}

.status-badge {
  font-size: 0.8rem;
}

.document-date {
  color: #95a5a6;
  font-size: 0.8rem;
}

.document-actions {
  display: flex;
  gap: 0.5rem;
}

/* Document viewer modal styles */
.document-viewer {
  max-height: 80vh;
  overflow-y: auto;
}

.document-info-section,
.document-preview-section,
.document-actions-section {
  margin-bottom: 2rem;
}

.document-info-section h3,
.document-preview-section h3 {
  color: #2c3e50;
  margin-bottom: 1rem;
}

.preview-container {
  border: 1px solid #ecf0f1;
  border-radius: 0.5rem;
  overflow: hidden;
  background: #f8f9fa;
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
  margin: 1rem 0;
  font-weight: 500;
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

.document-actions-section {
  border-top: 1px solid #ecf0f1;
  padding-top: 1rem;
}

@media (max-width: 768px) {
  .verification-details {
    padding: 1rem;
  }

  .details-header {
    flex-direction: column;
    align-items: flex-start;
  }

  .info-grid {
    grid-template-columns: 1fr;
  }

  .documents-summary {
    grid-template-columns: repeat(2, 1fr);
  }

  .action-buttons {
    flex-direction: column;
  }

  .progress-info {
    flex-direction: column;
    align-items: flex-start;
    gap: 0.5rem;
  }

  .documents-header {
    flex-direction: column;
    gap: 1rem;
    align-items: stretch;
  }

  .document-item {
    flex-direction: column;
    align-items: stretch;
    gap: 1rem;
  }

  .document-actions {
    justify-content: center;
  }
}
</style>
