<template>
  <div class="intelligent-stepper">
    <div class="stepper-header">
      <h3 class="va-h5">Verification Progress</h3>
      <p class="va-text-secondary">Track the user's verification journey</p>
    </div>

    <VerificationProgressBar :progress="currentProgress" :current-step-display="getCurrentStepDisplay()" />

    <div class="steps-container">
      <div
        v-for="(step, index) in verificationSteps"
        :key="step.key"
        :class="[
          'step-item',
          {
            completed: isStepCompleted(step.key),
            current: isCurrentStep(step.key),
            pending: !isStepCompleted(step.key) && !isCurrentStep(step.key),
          },
        ]"
      >
        <div class="step-marker">
          <div class="step-number">
            <VaIcon v-if="isStepCompleted(step.key)" name="check" size="small" />
            <VaIcon v-else-if="isCurrentStep(step.key)" name="play_arrow" size="small" />
            <span v-else class="step-index">{{ index + 1 }}</span>
          </div>
        </div>

        <div class="step-content">
          <h4 class="step-title">{{ step.title }}</h4>
          <p class="step-description">{{ step.description }}</p>

          <!-- Critical Information Display -->
          <div v-if="isCurrentStep(step.key) || isStepCompleted(step.key)" class="step-details">
            <div v-if="step.key === 'documents'" class="verification-checklist">
              <h5 class="checklist-title">Document Review & Approval</h5>

              <!-- Show actual uploaded documents if available -->
              <div v-if="hasUploadedDocuments()" class="document-approval-section">
                <div class="documents-grid-admin">
                  <DocumentCard
                    v-for="document in getUploadedDocuments()"
                    :key="document.id"
                    :document="document"
                    :is-approving="isApprovingDocument === document.id"
                    @view="viewDocument"
                    @approve="approveDocument"
                    @reject="openRejectDocumentDialog"
                  />
                </div>
              </div>

              <!-- Show required documents if no uploads available -->
              <div v-else class="document-requirements">
                <template v-if="verification?.required_documents">
                  <div v-for="doc in verification.required_documents" :key="doc.type" class="requirement-item">
                    <VaIcon
                      :name="
                        doc.uploaded
                          ? doc.status === 'verified'
                            ? 'check_circle'
                            : doc.status === 'pending'
                              ? 'schedule'
                              : 'cancel'
                          : 'cancel'
                      "
                      :color="
                        doc.uploaded
                          ? doc.status === 'verified'
                            ? 'success'
                            : doc.status === 'pending'
                              ? 'warning'
                              : 'danger'
                          : 'danger'
                      "
                      size="small"
                    />
                    <span
                      :class="{
                        'text-success': doc.uploaded && doc.status === 'verified',
                        'text-warning': doc.uploaded && doc.status === 'pending',
                        'text-danger': !doc.uploaded || doc.status === 'rejected',
                      }"
                    >
                      {{ doc.label }}
                    </span>
                    <VaChip v-if="!doc.uploaded" color="danger" size="small" class="missing-doc-chip">
                      NOT UPLOADED
                    </VaChip>
                    <div v-if="doc.uploaded && doc.status === 'pending'" class="doc-inline-actions">
                      <VaButton
                        size="small"
                        color="success"
                        icon="check"
                        round
                        class="doc-action-btn"
                        :loading="isApprovingDocument === doc.document_id"
                        @click="approveDocument({ id: doc.document_id, title: doc.label })"
                      />
                      <VaButton
                        size="small"
                        preset="plain"
                        icon="visibility"
                        color="primary"
                        round
                        class="doc-action-btn"
                        @click="viewDocument({ id: doc.document_id, title: doc.label })"
                      />
                    </div>
                  </div>
                </template>

                <template v-else>
                  <div v-for="doc in getRequiredDocuments()" :key="doc.type" class="requirement-item">
                    <VaIcon
                      :name="doc.provided ? 'check_circle' : 'cancel'"
                      :color="doc.provided ? 'success' : 'danger'"
                      size="small"
                    />
                    <span :class="{ 'text-success': doc.provided, 'text-danger': !doc.provided }">
                      {{ doc.label }}
                    </span>
                    <VaChip v-if="!doc.provided" color="danger" size="small" class="missing-doc-chip">
                      NOT UPLOADED
                    </VaChip>
                  </div>
                </template>
              </div>

              <!-- Documents Status Summary -->
              <DocumentsStatusSummary
                :provided-count="getProvidedDocumentsCount()"
                :missing-count="getMissingDocumentsCount()"
                :total-count="getTotalRequiredDocuments()"
              />

              <!-- Uploaded Documents Display -->
              <div v-if="hasUploadedDocuments()" class="uploaded-documents-section">
                <h6 class="documents-subtitle">
                  Uploaded Documents
                  <VaBadge color="info" size="small" class="ml-2"> {{ getUploadedDocuments().length }} files </VaBadge>
                </h6>
                <div class="documents-grid">
                  <div
                    v-for="document in getUploadedDocuments()"
                    :key="document.id"
                    class="mini-document-card"
                    :class="{ 'verified-doc': document.verification_status === 'verified' }"
                  >
                    <div class="mini-doc-header">
                      <VaIcon :name="getDocumentTypeIcon(document.document_type)" size="small" class="doc-icon" />
                      <VaBadge
                        :color="getDocumentStatusColor(document.verification_status)"
                        size="small"
                        class="doc-badge"
                      >
                        {{ document.verification_status_display }}
                      </VaBadge>
                    </div>
                    <div class="mini-doc-content">
                      <p class="doc-title">{{ document.title }}</p>
                      <p class="doc-type">{{ document.document_type_display }}</p>
                      <p class="doc-date">{{ formatDocumentDate(document.created_at) }}</p>
                    </div>
                    <div class="mini-doc-actions">
                      <VaButton
                        v-if="document.verification_status === 'pending'"
                        size="small"
                        color="success"
                        icon="check"
                        round
                        class="doc-action-btn"
                        :loading="isApprovingDocument === document.id"
                        @click="approveDocument(document)"
                      />
                      <VaButton
                        size="small"
                        preset="plain"
                        icon="visibility"
                        color="primary"
                        round
                        class="doc-action-btn"
                        @click="viewDocument(document)"
                      />
                    </div>
                  </div>
                </div>
              </div>

              <!-- Document Step Details and Action Buttons -->
              <VerificationStepDetails
                v-if="hasStepData('documents')"
                :step-data="getStepData('documents')"
                step-key="documents"
                :verification="props.verification || currentUser"
                @accept="handleAcceptStep"
                @reject="handleRejectStep"
              />
            </div>
            <div v-else-if="step.key === 'identity'" class="verification-checklist">
              <!-- Comprehensive Step Details -->
              <VerificationStepDetails
                v-if="hasStepData('identity')"
                :step-data="getStepData('identity')"
                step-key="identity"
                :verification="props.verification || currentUser"
                @accept="handleAcceptStep"
                @reject="handleRejectStep"
              />
            </div>

            <div v-else-if="step.key === 'contact'" class="verification-checklist">
              <!-- Comprehensive Step Details -->
              <VerificationStepDetails
                v-if="hasStepData('contact')"
                :step-data="getStepData('contact')"
                step-key="contact"
                :verification="props.verification || currentUser"
                @accept="handleAcceptStep"
                @reject="handleRejectStep"
              />
            </div>

            <div v-else-if="step.key === 'role_specific'" class="verification-checklist">
              <!-- Comprehensive Step Details -->
              <VerificationStepDetails
                v-if="hasStepData('role_specific')"
                :step-data="getStepData('role_specific')"
                step-key="role_specific"
                :verification="props.verification || currentUser"
                @accept="handleAcceptStep"
                @reject="handleRejectStep"
              />
            </div>

            <div v-else-if="step.key === 'final'" class="verification-checklist">
              <!-- Comprehensive Step Details -->
              <VerificationStepDetails
                v-if="hasStepData('final')"
                :step-data="getStepData('final')"
                step-key="final"
                :verification="props.verification || currentUser"
                @accept="handleAcceptStep"
                @reject="handleRejectStep"
              />
            </div>
          </div>

          <div class="step-status">
            <VaBadge v-if="isStepCompleted(step.key)" color="success" size="small"> Completed </VaBadge>
            <VaBadge v-else-if="isCurrentStep(step.key)" color="primary" size="small"> In Progress </VaBadge>
            <VaBadge v-else color="secondary" size="small"> Pending </VaBadge>
          </div>
        </div>

        <!-- Connection Line -->
        <div
          v-if="index < verificationSteps.length - 1"
          :class="['connection-line', { completed: isStepCompleted(step.key) }]"
        ></div>
      </div>
    </div>

    <!-- Quick Actions -->
    <div class="stepper-actions">
      <VaButton
        v-if="canVerifyCurrentStep()"
        color="primary"
        icon="check"
        size="small"
        :loading="isVerifying"
        @click="verifyCurrentStep"
      >
        Verify Current Step
      </VaButton>

      <VaButton
        v-if="canCompleteVerification()"
        color="success"
        icon="task_alt"
        size="small"
        :loading="isCompleting"
        @click="completeVerification"
      >
        Mark as Complete
      </VaButton>
    </div>

    <!-- Reject Step Dialog -->
    <RejectDialog
      v-model="showRejectDialog"
      v-model:reason="rejectReason"
      :title="`Reject ${getCurrentStepDisplay()}`"
      warning-title="You are about to reject:"
      :warning-message="`${getCurrentStepDisplay()} - This action will require the user to address the issues and resubmit.`"
      placeholder="Please provide a detailed reason for rejection..."
      @confirm="confirmRejectStep"
    />

    <!-- Reject Document Dialog -->
    <RejectDialog
      v-model="showRejectDocumentDialog"
      v-model:reason="documentRejectReason"
      title="Reject Document"
      warning-title="You are about to reject:"
      :warning-message="`${rejectingDocument?.title} - This document will be marked as rejected and the user will need to resubmit.`"
      placeholder="Please provide a detailed reason for rejecting this document..."
      @confirm="confirmRejectDocument"
    />

    <!-- Document Viewer Modal -->
    <VaModal
      v-model="showDocumentViewer"
      :title="`Document Preview - ${selectedDocument?.title || 'Document'}`"
      size="large"
      @close="showDocumentViewer = false"
    >
      <div v-if="selectedDocument" class="document-viewer">
        <!-- Document Information -->
        <div class="document-info-section">
          <div class="info-grid">
            <div class="info-item">
              <span class="label">Type:</span>
              <span class="value">{{ selectedDocument.document_type_display || 'N/A' }}</span>
            </div>
            <div class="info-item">
              <span class="label">Status:</span>
              <VaBadge
                :color="getDocumentStatusColor(selectedDocument.verification_status || selectedDocument.status)"
                :text="selectedDocument.verification_status_display || selectedDocument.status || 'Pending'"
              />
            </div>
            <div class="info-item">
              <span class="label">Uploaded:</span>
              <span class="value">{{ formatDocumentDate(selectedDocument.created_at) }}</span>
            </div>
          </div>
          <div v-if="selectedDocument.description" class="document-description">
            <span class="label">Description:</span>
            <p>{{ selectedDocument.description }}</p>
          </div>
        </div>

        <!-- Document Preview -->
        <div class="document-preview-section">
          <h3>Document Preview</h3>
          <div class="preview-container">
            <div v-if="getDocumentUrl(selectedDocument)" class="preview-wrapper">
              <!-- PDF Preview -->
              <div v-if="isPdfFile(getDocumentUrl(selectedDocument))" class="pdf-preview-container">
                <!-- Try object embed first -->
                <object
                  :data="getDocumentUrl(selectedDocument)"
                  type="application/pdf"
                  width="100%"
                  height="600px"
                  class="document-pdf-object"
                >
                  <!-- Fallback if object fails -->
                  <div class="pdf-fallback">
                    <VaIcon name="picture_as_pdf" size="4rem" color="danger" />
                    <p class="fallback-title">PDF Preview Not Available</p>
                    <p class="fallback-message">
                      Your browser cannot display PDFs inline. Please use one of the options below:
                    </p>
                    <div class="fallback-actions">
                      <VaButton color="primary" @click="openInNewTab(selectedDocument)">
                        <VaIcon name="open_in_new" /> Open in New Tab
                      </VaButton>
                      <VaButton color="secondary" @click="downloadDocument(selectedDocument)">
                        <VaIcon name="download" /> Download PDF
                      </VaButton>
                    </div>
                  </div>
                </object>
              </div>
              <!-- Image Preview -->
              <img
                v-else-if="isImageFile(getDocumentUrl(selectedDocument))"
                :src="getDocumentUrl(selectedDocument)"
                :alt="selectedDocument.title"
                class="document-image"
                @error="handleImageError"
              />
              <!-- Fallback for Other Files -->
              <div v-else class="file-preview">
                <VaIcon name="description" size="4rem" color="primary" />
                <p class="file-name">{{ selectedDocument.title }}</p>
                <p class="file-type">{{ getFileExtension(getDocumentUrl(selectedDocument)).toUpperCase() }} File</p>
                <VaButton color="primary" @click="downloadDocument(selectedDocument)">
                  <VaIcon name="download" /> Download to View
                </VaButton>
              </div>
            </div>
            <div v-else class="no-preview">
              <VaIcon name="description" size="4rem" color="secondary" />
              <p>No preview available</p>
            </div>
          </div>
        </div>

        <!-- Document Actions -->
        <div class="document-actions-section">
          <div class="action-buttons">
            <VaButton
              v-if="selectedDocument.verification_status === 'pending' || selectedDocument.status === 'pending'"
              color="success"
              icon="check"
              :loading="isApprovingDocument === (selectedDocument.id || selectedDocument.document_id)"
              @click="approveDocument(selectedDocument)"
            >
              Approve Document
            </VaButton>
            <VaButton
              v-if="selectedDocument.verification_status === 'pending' || selectedDocument.status === 'pending'"
              color="danger"
              icon="close"
              @click="openRejectDocumentDialog(selectedDocument)"
            >
              Reject Document
            </VaButton>
            <VaButton color="primary" icon="open_in_new" @click="openInNewTab(selectedDocument)">
              Open in New Tab
            </VaButton>
            <VaButton color="secondary" icon="download" @click="downloadDocument(selectedDocument)">
              Download
            </VaButton>
            <VaButton preset="secondary" @click="showDocumentViewer = false"> Close </VaButton>
          </div>
        </div>
      </div>
    </VaModal>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue'
import { useToast } from 'vuestic-ui'
import { useVerificationStore } from '../../stores/verification-store'
import type { VerificationUser } from '../../services/verificationService'
import VerificationProgressBar from './VerificationProgressBar.vue'
import DocumentCard from './DocumentCard.vue'
import DocumentsStatusSummary from './DocumentsStatusSummary.vue'
import RejectDialog from './RejectDialog.vue'
import VerificationStepDetails from './VerificationStepDetails.vue'

interface Props {
  userId: string | number
  verification?: VerificationUser | null
}

const props = defineProps<Props>()

const { init: showToast } = useToast()
const verificationStore = useVerificationStore()

const isVerifying = ref(false)
const isCompleting = ref(false)
const currentUser = ref<VerificationUser | null>(null)
const showRejectDialog = ref(false)
const rejectReason = ref('')
const currentRejectingStep = ref('')
const showDocumentViewer = ref(false)
const selectedDocument = ref<any>(null)

// Document approval/rejection
const isApprovingDocument = ref<number | null>(null)
const showRejectDocumentDialog = ref(false)
const rejectingDocument = ref<any>(null)
const documentRejectReason = ref('')

const verificationSteps = [
  {
    key: 'documents',
    title: 'Document Verification',
    description: 'Review and verify uploaded documents',
  },
  {
    key: 'identity',
    title: 'Identity Verification',
    description: 'Verify personal identity information',
  },
  {
    key: 'contact',
    title: 'Contact Verification',
    description: 'Verify contact information and communication',
  },
  {
    key: 'role_specific',
    title: 'Role-Specific Verification',
    description: 'Complete role-based verification requirements',
  },
  {
    key: 'final',
    title: 'Final Approval',
    description: 'Final review and approval process',
  },
]

const currentProgress = computed(() => {
  if (props.verification) {
    return props.verification.progress
  }
  if (currentUser.value) {
    return currentUser.value.progress
  }
  return 0
})

const getCurrentStepDisplay = () => {
  if (props.verification) {
    return props.verification.current_step_display || 'Unknown Step'
  }
  if (currentUser.value) {
    return currentUser.value.current_step_display || 'Unknown Step'
  }
  return 'Not Started'
}

const getCurrentStep = () => {
  if (props.verification) {
    return props.verification.current_step
  }
  if (currentUser.value) {
    return currentUser.value.current_step
  }
  return 'documents'
}

const isCurrentStep = (stepKey: string) => {
  return getCurrentStep() === stepKey
}

const isStepCompleted = (stepKey: string) => {
  const currentStepKey = getCurrentStep()
  const currentStepIndex = verificationSteps.findIndex((s) => s.key === currentStepKey)
  const stepIndex = verificationSteps.findIndex((s) => s.key === stepKey)

  // If current progress is 100%, all steps are completed
  if (currentProgress.value === 100) {
    return true
  }

  // Step is completed if it's before the current step
  return stepIndex < currentStepIndex
}

const canVerifyCurrentStep = () => {
  const currentStep = getCurrentStep()
  return currentStep !== 'final' && currentProgress.value < 100
}

const canCompleteVerification = () => {
  return getCurrentStep() === 'final' && currentProgress.value >= 80
}

// Helper functions for VerificationStepDetails component
const hasStepData = (stepKey: string) => {
  const user = props.verification || currentUser.value
  return user?.missing_information?.by_step?.[stepKey] !== undefined
}

const getStepData = (stepKey: string) => {
  const user = props.verification || currentUser.value
  const stepData = user?.missing_information?.by_step?.[stepKey]

  // Return with required defaults if data exists
  if (stepData) {
    return {
      status: stepData.status || 'incomplete',
      is_current: stepData.is_current || false,
      issues: stepData.issues || [],
      required_fields: stepData.required_fields || [],
      verified_fields: stepData.verified_fields || [],
      missing_documents: stepData.missing_documents || [],
      missing_profile_fields: stepData.missing_profile_fields || [],
    }
  }

  // Return safe defaults
  return {
    status: 'incomplete',
    is_current: false,
    issues: [],
    required_fields: [],
    verified_fields: [],
  }
}

const getRequiredDocuments = () => {
  const user = props.verification || currentUser.value
  if (!user) return []

  const role = user.user_role?.value || 'citizen'
  const baseDocuments = [
    {
      type: 'national_id',
      label: 'National ID/Passport',
      provided: false,
    },
    {
      type: 'proof_of_address',
      label: 'Proof of Address',
      provided: false,
    },
  ]

  // Role-specific document requirements
  const roleSpecificDocs = {
    advocate: [
      { type: 'law_degree', label: 'Law Degree Certificate', provided: false },
      { type: 'roll_number_cert', label: 'Roll Number Certificate', provided: false },
      { type: 'chamber_membership', label: 'Chamber Membership', provided: false },
    ],
    lawyer: [
      { type: 'law_degree', label: 'Law Degree Certificate', provided: false },
      { type: 'bar_admission', label: 'Bar Admission Certificate', provided: false },
    ],
    paralegal: [
      { type: 'paralegal_cert', label: 'Paralegal Certificate', provided: false },
      { type: 'employment_letter', label: 'Employment Letter', provided: false },
    ],
    law_firm: [
      { type: 'business_license', label: 'Business License', provided: false },
      { type: 'firm_registration', label: 'Firm Registration', provided: false },
    ],
    law_student: [
      { type: 'student_id', label: 'Student ID', provided: false },
      { type: 'enrollment_letter', label: 'Enrollment Letter', provided: false },
    ],
  }

  const allDocs = [...baseDocuments, ...(roleSpecificDocs[role as keyof typeof roleSpecificDocs] || [])]

  // Mark as provided based on documents_summary
  if (user.documents_summary) {
    const totalCount = user.documents_summary.total || 0

    // Simple logic: mark first N documents as provided based on total count
    allDocs.forEach((doc, index) => {
      doc.provided = index < totalCount
    })
  }

  return allDocs
}

const hasUploadedDocuments = () => {
  const user = props.verification || currentUser.value
  return user && user.documents_summary && user.documents_summary.total > 0
}

const getUploadedDocuments = () => {
  // This would ideally come from the API, but for now we'll simulate based on the user data
  const user = props.verification || currentUser.value
  if (!user || !user.documents_summary) return []

  // Create mock documents based on the summary
  const mockDocuments = []
  const role = user.user_role?.value || 'citizen'

  // Generate mock documents based on role and counts
  if (user.documents_summary.total > 0) {
    const baseDocTypes = [
      { type: 'national_id', display: 'National ID', icon: 'badge' },
      { type: 'proof_of_address', display: 'Proof of Address', icon: 'home' },
    ]

    const roleDocTypes = {
      advocate: [
        { type: 'law_degree', display: 'Law Degree', icon: 'school' },
        { type: 'roll_number_cert', display: 'Roll Number Certificate', icon: 'verified_user' },
        { type: 'chamber_membership', display: 'Chamber Membership', icon: 'work' },
      ],
      lawyer: [
        { type: 'law_degree', display: 'Law Degree', icon: 'school' },
        { type: 'bar_admission', display: 'Bar Admission', icon: 'gavel' },
      ],
      paralegal: [
        { type: 'paralegal_cert', display: 'Paralegal Certificate', icon: 'assignment' },
        { type: 'employment_letter', display: 'Employment Letter', icon: 'work' },
      ],
    }

    const allDocTypes = [...baseDocTypes, ...(roleDocTypes[role as keyof typeof roleDocTypes] || [])]

    for (let i = 0; i < Math.min(user.documents_summary.total, allDocTypes.length); i++) {
      const docType = allDocTypes[i]
      const status =
        i < user.documents_summary.verified
          ? 'verified'
          : i < user.documents_summary.verified + user.documents_summary.pending
            ? 'pending'
            : 'rejected'

      mockDocuments.push({
        id: i + 1,
        title: `${docType.display} - ${user.user_name}`,
        document_type: docType.type,
        document_type_display: docType.display,
        verification_status: status,
        verification_status_display: status.charAt(0).toUpperCase() + status.slice(1),
        created_at: new Date(Date.now() - i * 24 * 60 * 60 * 1000).toISOString(),
        file_url: '#',
        icon: docType.icon,
      })
    }
  }

  return mockDocuments
}

const getDocumentTypeIcon = (docType: string) => {
  const iconMap: Record<string, string> = {
    national_id: 'badge',
    proof_of_address: 'home',
    law_degree: 'school',
    roll_number_cert: 'verified_user',
    chamber_membership: 'work',
    bar_admission: 'gavel',
    paralegal_cert: 'assignment',
    employment_letter: 'work',
    business_license: 'business',
    firm_registration: 'domain_verification',
    student_id: 'school',
    enrollment_letter: 'assignment',
  }
  return iconMap[docType] || 'description'
}

const getDocumentStatusColor = (status: string) => {
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

const formatDocumentDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  })
}

const viewDocument = (document: any) => {
  selectedDocument.value = document
  showDocumentViewer.value = true
  // Emit event to parent to handle document viewing
  emit('documentView', document)
}

// Document Preview Helper Functions
const getDocumentUrl = (document: any): string => {
  return document?.file_url || document?.file || ''
}

const isPdfFile = (url: string): boolean => {
  if (!url) return false
  return url.toLowerCase().includes('.pdf') || url.toLowerCase().includes('application/pdf')
}

const isImageFile = (url: string): boolean => {
  if (!url) return false
  const imageExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.bmp', '.webp', '.svg']
  return imageExtensions.some((ext) => url.toLowerCase().includes(ext))
}

const getFileExtension = (url: string): string => {
  if (!url) return 'file'
  const match = url.match(/\.([a-zA-Z0-9]+)(?:\?|$)/)
  return match ? match[1] : 'file'
}

const downloadDocument = (document: any) => {
  const url = getDocumentUrl(document)
  if (url) {
    window.open(url, '_blank')
  } else {
    showToast({
      message: 'Document URL not available',
      color: 'danger',
    })
  }
}

const openInNewTab = (document: any) => {
  const url = getDocumentUrl(document)
  if (url) {
    window.open(url, '_blank', 'noopener,noreferrer')
  } else {
    showToast({
      message: 'Document URL not available',
      color: 'danger',
    })
  }
}

const handleImageError = (event: Event) => {
  const target = event.target as HTMLImageElement
  target.style.display = 'none'
  const container = target.parentElement
  if (container) {
    container.innerHTML = `
      <div class="file-preview">
        <i class="va-icon material-icons" style="font-size: 4rem; color: var(--va-danger)">broken_image</i>
        <p class="file-name">Failed to load image</p>
        <p class="file-type">The image could not be displayed</p>
      </div>
    `
  }
  showToast({
    message: 'Failed to load image preview',
    color: 'warning',
  })
}

const getProvidedDocumentsCount = () => {
  // Safety check: ensure props and verification are available
  if (!props || !props.verification) {
    return 0
  }

  // Use API data if available
  if (props.verification.required_documents) {
    return props.verification.required_documents.filter((doc) => doc.uploaded && doc.status !== 'rejected').length
  }

  // Fallback to mock data
  try {
    const docs = getRequiredDocuments()
    return docs.filter((doc) => doc.provided).length
  } catch (error) {
    console.warn('Error in getProvidedDocumentsCount:', error)
    return 0
  }
}

const getMissingDocumentsCount = () => {
  // Safety check: ensure props and verification are available
  if (!props || !props.verification) {
    return 0
  }

  // Use API data if available
  if (props.verification.required_documents) {
    return props.verification.required_documents.filter((doc) => doc.required && !doc.uploaded).length
  }

  // Fallback to mock data
  try {
    const docs = getRequiredDocuments()
    return docs.filter((doc) => !doc.provided).length
  } catch (error) {
    console.warn('Error in getMissingDocumentsCount:', error)
    return 0
  }
}

const getTotalRequiredDocuments = () => {
  // Safety check: ensure props and verification are available
  if (!props || !props.verification) {
    return 0
  }

  // Use API data if available
  if (props.verification.required_documents) {
    return props.verification.required_documents.filter((doc) => doc.required).length
  }

  // Fallback to mock data
  try {
    return getRequiredDocuments().length
  } catch (error) {
    console.warn('Error in getTotalRequiredDocuments:', error)
    return 0
  }
}

const verifyCurrentStep = async () => {
  if (isVerifying.value) return

  isVerifying.value = true

  try {
    const currentStep = getCurrentStep()
    await verificationStore.verifyStep(Number(props.userId), currentStep, `Step ${currentStep} verified by admin`)

    showToast({
      message: `${getCurrentStepDisplay()} verified successfully!`,
      color: 'success',
      duration: 3000,
      position: 'top-right',
    })

    // Emit events to parent
    const stepKey = getCurrentStep()
    emit('verified', stepKey)
    emit('refreshNeeded')
  } catch (error) {
    console.error('Error verifying step:', error)
    showToast({
      message: 'Failed to verify step. Please try again.',
      color: 'danger',
      duration: 4000,
      position: 'top-right',
    })
  } finally {
    isVerifying.value = false
  }
}

const completeVerification = async () => {
  if (isCompleting.value) return

  isCompleting.value = true

  try {
    await verificationStore.verifyStep(Number(props.userId), 'final', 'Final verification completed by admin')

    showToast({
      message: 'Verification completed successfully!',
      color: 'success',
      duration: 3000,
      position: 'top-right',
    })

    // Emit events to parent
    emit('completed')
    emit('refreshNeeded')
  } catch (error) {
    console.error('Error completing verification:', error)
    showToast({
      message: 'Failed to complete verification. Please try again.',
      color: 'danger',
      duration: 4000,
      position: 'top-right',
    })
  } finally {
    isCompleting.value = false
  }
}

const confirmRejectStep = async () => {
  if (!rejectReason.value.trim()) {
    showToast({
      message: 'Please provide a reason for rejection',
      color: 'warning',
      duration: 3000,
    })
    return
  }

  try {
    // Use currentRejectingStep if set, otherwise fall back to getCurrentStep
    const stepToReject = currentRejectingStep.value || getCurrentStep()
    await verificationStore.rejectStep(Number(props.userId), stepToReject, rejectReason.value)

    showToast({
      message: `${stepToReject.replace('_', ' ')} step rejected successfully`,
      color: 'success',
      duration: 3000,
    })

    showRejectDialog.value = false
    rejectReason.value = ''
    currentRejectingStep.value = ''
    emit('refreshNeeded')
  } catch (error) {
    console.error('Error rejecting step:', error)
    showToast({
      message: 'Failed to reject step',
      color: 'danger',
      duration: 4000,
    })
  }
}

// Step action handlers from VerificationStepDetails component
const handleAcceptStep = async (stepKey: string) => {
  if (isVerifying.value) return

  isVerifying.value = true

  try {
    await verificationStore.verifyStep(Number(props.userId), stepKey, `Step ${stepKey} accepted by admin`)

    showToast({
      message: `${stepKey.replace('_', ' ')} step accepted successfully!`,
      color: 'success',
      duration: 3000,
      position: 'top-right',
    })

    // Emit events to parent
    emit('verified', stepKey)
    emit('refreshNeeded')
  } catch (error) {
    console.error('Error accepting step:', error)
    showToast({
      message: 'Failed to accept step. Please try again.',
      color: 'danger',
      duration: 4000,
      position: 'top-right',
    })
  } finally {
    isVerifying.value = false
  }
}

const handleRejectStep = (stepKey: string) => {
  // Store the step being rejected for the dialog
  currentRejectingStep.value = stepKey
  showRejectDialog.value = true
}

// Document approval/rejection functions
const approveDocument = async (document: any) => {
  if (isApprovingDocument.value === document.id) return

  isApprovingDocument.value = document.id

  try {
    await verificationStore.verifyDocument(document.id, 'Document approved by admin')

    showToast({
      message: `${document.title} approved successfully!`,
      color: 'success',
      duration: 3000,
    })

    emit('refreshNeeded')
  } catch (error) {
    console.error('Error approving document:', error)
    showToast({
      message: 'Failed to approve document. Please try again.',
      color: 'danger',
      duration: 4000,
    })
  } finally {
    isApprovingDocument.value = null
  }
}

const openRejectDocumentDialog = (document: any) => {
  rejectingDocument.value = document
  documentRejectReason.value = ''
  showRejectDocumentDialog.value = true
}

const confirmRejectDocument = async () => {
  if (!documentRejectReason.value.trim()) {
    showToast({
      message: 'Please provide a reason for rejection',
      color: 'warning',
      duration: 3000,
    })
    return
  }

  if (!rejectingDocument.value) return

  try {
    await verificationStore.rejectDocument(rejectingDocument.value.id, documentRejectReason.value)

    showToast({
      message: `${rejectingDocument.value.title} rejected successfully`,
      color: 'success',
      duration: 3000,
    })

    showRejectDocumentDialog.value = false
    rejectingDocument.value = null
    documentRejectReason.value = ''
    emit('refreshNeeded')
  } catch (error) {
    console.error('Error rejecting document:', error)
    showToast({
      message: 'Failed to reject document',
      color: 'danger',
      duration: 4000,
    })
  }
}

const emit = defineEmits<{
  verified: [stepKey: string]
  completed: []
  refreshNeeded: []
  documentView: [document: any]
}>()

// Watch for changes in verification prop
watch(
  () => props.verification,
  (newVerification) => {
    if (newVerification) {
      currentUser.value = newVerification
    }
  },
  { immediate: true, deep: true },
)

onMounted(() => {
  if (props.verification) {
    currentUser.value = props.verification
  }
})
</script>

<style scoped>
.intelligent-stepper {
  background: white;
  border-radius: 12px;
  padding: 2rem;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.08);
  border: 1px solid rgba(0, 0, 0, 0.06);
}

.stepper-header {
  text-align: center;
  margin-bottom: 2rem;
}

.stepper-header h3 {
  margin: 0 0 0.5rem 0;
  color: #1f2937;
}

.stepper-header p {
  margin: 0;
  color: #6b7280;
}

.progress-overview {
  background: #f8fafc;
  border-radius: 8px;
  padding: 1.5rem;
  margin-bottom: 2rem;
  border: 1px solid rgba(0, 0, 0, 0.05);
}

.progress-bar-section {
  margin-bottom: 1rem;
}

.progress-info {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 0.75rem;
}

.progress-label {
  font-weight: 600;
  color: #374151;
}

.progress-percentage {
  font-weight: 700;
  color: #1f2937;
  font-size: 1.1rem;
}

.main-progress-bar {
  border-radius: 6px;
  overflow: hidden;
}

.current-step-info {
  display: flex;
  justify-content: center;
}

.steps-container {
  position: relative;
  margin-bottom: 2rem;
}

.step-item {
  position: relative;
  display: flex;
  align-items: flex-start;
  gap: 1rem;
  padding: 1rem 0;
  transition: all 0.3s ease;
}

.step-item.completed {
  opacity: 0.8;
}

.step-item.current {
  background: rgba(59, 130, 246, 0.05);
  border-radius: 8px;
  padding: 1rem;
  margin: 0 -1rem;
}

.step-marker {
  flex-shrink: 0;
  z-index: 2;
}

.step-number {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 600;
  font-size: 0.9rem;
  transition: all 0.3s ease;
  border: 2px solid transparent;

  .va-icon {
    color: white !important;
  }
}

.step-item.completed .step-number {
  background: #22c55e;
  color: white;
  border-color: #22c55e;
}

.step-item.current .step-number {
  background: #3b82f6;
  color: white;
  border-color: #3b82f6;
  animation: pulse 2s infinite;
}

.step-item.pending .step-number {
  background: #e5e7eb;
  color: #6b7280;
  border-color: #d1d5db;
}

.step-index {
  font-size: 0.9rem;
  font-weight: 600;
}

.step-content {
  flex: 1;
  min-width: 0;
}

.step-title {
  margin: 0 0 0.5rem 0;
  font-size: 1.1rem;
  font-weight: 600;
  color: #1f2937;
}

.step-description {
  margin: 0 0 0.75rem 0;
  color: #6b7280;
  font-size: 0.9rem;
  line-height: 1.4;
}

.step-status {
  display: flex;
  gap: 0.5rem;
}

.connection-line {
  position: absolute;
  left: 19px;
  top: 50px;
  width: 2px;
  height: calc(100% - 20px);
  background: #e5e7eb;
  transition: all 0.3s ease;
}

.connection-line.completed {
  background: #22c55e;
}

.step-item:last-child .connection-line {
  display: none;
}

.stepper-actions {
  display: flex;
  gap: 1rem;
  justify-content: center;
  padding-top: 1.5rem;
  border-top: 1px solid rgba(0, 0, 0, 0.1);
}

@keyframes pulse {
  0%,
  100% {
    box-shadow: 0 0 0 0 rgba(59, 130, 246, 0.4);
  }
  50% {
    box-shadow: 0 0 0 6px rgba(59, 130, 246, 0.1);
  }
}

@media (max-width: 768px) {
  .intelligent-stepper {
    padding: 1.5rem;
  }

  .step-item {
    gap: 0.75rem;
  }

  .step-number {
    width: 32px;
    height: 32px;
    font-size: 0.8rem;
  }

  .connection-line {
    left: 15px;
  }

  .stepper-actions {
    flex-direction: column;
  }
}

.step-details {
  margin-top: 0.75rem;
  padding: 0;
  background: transparent;
  border-radius: 0;
  border: none;
}

.verification-checklist {
  margin-bottom: 0.5rem;
}

.checklist-title {
  font-size: 0.875rem;
  font-weight: 600;
  color: #374151;
  margin: 0 0 0.75rem 0;
}

.document-requirements,
.identity-requirements,
.contact-requirements,
.professional-requirements,
.final-requirements {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.requirement-item {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.875rem;
  padding: 0.25rem 0;
}

.doc-inline-actions {
  display: flex;
  gap: 0.25rem;
  margin-left: 0.5rem;
  align-items: center;
}

.doc-action-btn {
  width: 1.5rem !important;
  height: 1.5rem !important;
  min-width: 1.5rem !important;
  padding: 0 !important;

  .va-button__content {
    padding: 0 !important;
  }

  .va-icon {
    font-size: 0.875rem !important;
  }
}

.text-success {
  color: #059669;
}

.text-danger {
  color: #dc2626;
}

.step-actions {
  display: flex;
  gap: 0.75rem;
  margin-top: 1rem;
  padding-top: 0.75rem;
  border-top: 1px solid #e5e7eb;
}

/* Uploaded Documents Section */
.uploaded-documents-section {
  margin-top: 1rem;
  padding-top: 1rem;
  border-top: 1px solid #e5e7eb;
}

.documents-subtitle {
  font-size: 0.8rem;
  font-weight: 600;
  color: #374151;
  margin: 0 0 0.75rem 0;
}

.documents-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: 0.75rem;
}

.mini-document-card {
  background: white;
  border: 1px solid #e5e7eb;
  border-radius: 6px;
  padding: 0.75rem;
  transition: all 0.2s ease;
  font-size: 0.75rem;
}

.mini-document-card:hover {
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  border-color: #3b82f6;
  transform: translateY(-1px);
}

.mini-doc-header {
  display: flex;
  justify-content: between;
  align-items: center;
  margin-bottom: 0.5rem;
}

.doc-icon {
  color: #6b7280;
}

.doc-badge {
  margin-left: auto;
}

.mini-doc-content {
  margin-bottom: 0.5rem;
}

.doc-title {
  font-weight: 600;
  color: #1f2937;
  margin: 0 0 0.25rem 0;
  font-size: 0.75rem;
  line-height: 1.2;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.doc-type {
  color: #6b7280;
  margin: 0 0 0.25rem 0;
  font-size: 0.7rem;
}

.doc-date {
  color: #9ca3af;
  margin: 0;
  font-size: 0.65rem;
}

.mini-doc-actions {
  display: flex;
  gap: 0.375rem;
  justify-content: flex-end;
  align-items: center;
}

/* Document Status Enhancements */
.missing-doc-chip,
.provided-doc-chip {
  margin-left: auto;
  font-size: 0.6rem;
  font-weight: 700;
}

.documents-status-summary {
  margin: 1rem 0;
  padding: 1rem;
  background: #f1f5f9;
  border-radius: 6px;
  border: 1px solid #e2e8f0;
}

.status-summary-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 1rem;
}

.status-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  padding: 0.75rem;
  background: white;
  border-radius: 4px;
  border: 1px solid #e5e7eb;
}

.status-count {
  font-size: 1.25rem;
  font-weight: 700;
  margin: 0.25rem 0;
}

.status-label {
  font-size: 0.75rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.provided-status .status-count {
  color: #059669;
}

.missing-status .status-count {
  color: #dc2626;
}

.total-status .status-count {
  color: #2563eb;
}

.verified-doc {
  border-color: #22c55e !important;
  box-shadow: 0 0 0 1px rgba(34, 197, 94, 0.1);
}

.missing-documents-alert,
.api-verification-summary {
  margin-top: 1rem;
}

.verification-status-alert {
  margin-bottom: 0;
}

.verification-status-alert .text-sm {
  margin: 0.25rem 0;
}

.verification-status-alert ul {
  list-style: none;
  padding-left: 0;
}

.verification-status-alert ul li {
  margin: 0.125rem 0;
}

.all-docs-provided {
  margin-top: 1rem;
}

.missing-docs-list {
  margin: 0;
  padding-left: 1rem;
}

.missing-doc-item {
  font-size: 0.875rem;
  color: #92400e;
  margin-bottom: 0.25rem;
}

.success-message p {
  margin: 0;
}

.documents-subtitle {
  display: flex;
  align-items: center;
  margin-bottom: 0.75rem;
}

/* Document Admin Cards */
.document-approval-section {
  margin-top: 1rem;
}

.documents-grid-admin {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
  gap: 1rem;
}

.document-admin-card {
  background: white;
  border: 2px solid #e5e7eb;
  border-radius: 8px;
  padding: 1rem;
  transition: all 0.2s ease;
}

.document-admin-card:hover {
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  transform: translateY(-2px);
}

.document-admin-card.verified-document {
  border-color: #22c55e;
  background: rgba(34, 197, 94, 0.02);
}

.document-admin-card.pending-document {
  border-color: #f59e0b;
  background: rgba(245, 158, 11, 0.02);
}

.document-admin-card.rejected-document {
  border-color: #ef4444;
  background: rgba(239, 68, 68, 0.02);
}

.document-admin-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 1rem;
}

.document-info {
  display: flex;
  align-items: flex-start;
  gap: 0.75rem;
}

.document-icon {
  color: #6b7280;
  margin-top: 0.125rem;
}

.document-details h6 {
  margin: 0 0 0.25rem 0;
  font-weight: 600;
  color: #1f2937;
  line-height: 1.2;
}

.document-details p {
  margin: 0;
  font-size: 0.875rem;
  color: #6b7280;
  line-height: 1.2;
}

.document-type {
  font-weight: 500;
}

.status-badge {
  margin-top: 0.125rem;
}

.document-admin-actions {
  display: flex;
  gap: 0.5rem;
  flex-wrap: wrap;
}

@media (max-width: 768px) {
  .documents-grid {
    grid-template-columns: 1fr;
  }

  .documents-grid-admin {
    grid-template-columns: 1fr;
  }

  .mini-document-card {
    padding: 0.5rem;
  }

  .status-summary-grid {
    grid-template-columns: 1fr;
    gap: 0.75rem;
  }

  .status-item {
    padding: 0.5rem;
  }

  .document-admin-header {
    flex-direction: column;
    gap: 0.75rem;
  }

  .document-admin-actions {
    justify-content: stretch;
  }

  .document-admin-actions .va-button {
    flex: 1;
  }
}

/* Document Viewer Modal Styles */
.document-viewer {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
  max-height: 80vh;
}

.document-info-section {
  padding: 1rem;
  background: #f9fafb;
  border-radius: 0.5rem;
}

.info-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1rem;
  margin-bottom: 0.5rem;
}

.info-item {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.info-item .label {
  font-size: 0.75rem;
  font-weight: 600;
  color: #6b7280;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.info-item .value {
  font-size: 0.875rem;
  color: #1f2937;
  font-weight: 500;
}

.document-description {
  margin-top: 1rem;
  padding-top: 1rem;
  border-top: 1px solid #e5e7eb;
}

.document-description .label {
  font-size: 0.75rem;
  font-weight: 600;
  color: #6b7280;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  margin-bottom: 0.5rem;
  display: block;
}

.document-description p {
  font-size: 0.875rem;
  color: #4b5563;
  margin: 0;
  line-height: 1.5;
}

.document-preview-section {
  flex: 1;
  overflow: hidden;
}

.document-preview-section h3 {
  font-size: 1rem;
  font-weight: 600;
  color: #1f2937;
  margin-bottom: 1rem;
}

.preview-container {
  border: 1px solid #e5e7eb;
  border-radius: 0.5rem;
  overflow: hidden;
  background: #f9fafb;
}

.preview-wrapper {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 400px;
  background: white;
}

.pdf-preview-container {
  width: 100%;
  min-height: 600px;
  background: white;
}

.document-pdf-object {
  border: none;
  width: 100%;
  min-height: 600px;
  background: white;
}

.pdf-fallback {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 3rem;
  gap: 1rem;
  background: #fef3f2;
  border: 2px dashed #fca5a5;
  border-radius: 0.5rem;
  margin: 2rem;
}

.pdf-fallback .fallback-title {
  font-size: 1.125rem;
  font-weight: 600;
  color: #991b1b;
  margin: 0;
}

.pdf-fallback .fallback-message {
  font-size: 0.875rem;
  color: #7f1d1d;
  margin: 0;
  text-align: center;
  max-width: 400px;
}

.pdf-fallback .fallback-actions {
  display: flex;
  gap: 0.75rem;
  margin-top: 0.5rem;
  flex-wrap: wrap;
  justify-content: center;
}

.document-iframe {
  border: none;
  width: 100%;
  min-height: 600px;
  background: white;
}

.document-image {
  max-width: 100%;
  max-height: 70vh;
  height: auto;
  object-fit: contain;
  display: block;
  margin: 0 auto;
}

.file-preview {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 3rem;
  gap: 1rem;
}

.file-preview .file-name {
  font-size: 1rem;
  font-weight: 600;
  color: #1f2937;
  margin: 0;
  text-align: center;
}

.file-preview .file-type {
  font-size: 0.875rem;
  color: #6b7280;
  margin: 0;
}

.no-preview {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 3rem;
  gap: 1rem;
  color: #9ca3af;
}

.no-preview p {
  font-size: 0.875rem;
  margin: 0;
}

.document-actions-section {
  padding: 1rem;
  background: #f9fafb;
  border-radius: 0.5rem;
  border-top: 1px solid #e5e7eb;
}

.action-buttons {
  display: flex;
  gap: 0.75rem;
  flex-wrap: wrap;
  justify-content: flex-end;
}

@media (max-width: 768px) {
  .document-viewer {
    max-height: 90vh;
  }

  .info-grid {
    grid-template-columns: 1fr;
    gap: 0.75rem;
  }

  .document-pdf-object {
    min-height: 400px;
  }

  .document-iframe {
    min-height: 400px;
  }

  .document-image {
    max-height: 50vh;
  }

  .pdf-fallback {
    padding: 2rem 1rem;
    margin: 1rem;
  }

  .pdf-fallback .fallback-actions {
    flex-direction: column;
    width: 100%;
  }

  .pdf-fallback .fallback-actions .va-button {
    width: 100%;
  }

  .action-buttons {
    flex-direction: column;
  }

  .action-buttons .va-button {
    width: 100%;
  }
}
</style>
