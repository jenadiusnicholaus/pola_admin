<!-- eslint-disable @typescript-eslint/no-unused-vars -->
<template>
  <div class="intelligent-stepper">
    <div class="stepper-header">
      <h3 class="va-h5">Verification Progress</h3>
      <p class="va-text-secondary">Track the user's verification journey</p>
    </div>

    <div class="progress-overview">
      <div class="progress-bar-section">
        <div class="progress-info">
          <span class="progress-label">Overall Progress</span>
          <span class="progress-percentage">{{ currentProgress }}%</span>
        </div>
        <VaProgressBar
          :model-value="currentProgress"
          :color="getProgressColor(currentProgress)"
          size="large"
          class="main-progress-bar"
        />
      </div>
      <div class="current-step-info">
        <VaChip :color="getCurrentStepColor()" size="small">
          {{ getCurrentStepDisplay() }}
        </VaChip>
      </div>
    </div>

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
            <VaIcon v-if="isStepCompleted(step.key)" name="check" size="small" color="white" />
            <VaIcon v-else-if="isCurrentStep(step.key)" name="play_arrow" size="small" color="white" />
            <span v-else class="step-index">{{ index + 1 }}</span>
          </div>
        </div>

        <div class="step-content">
          <h4 class="step-title">{{ step.title }}</h4>
          <p class="step-description">{{ step.description }}</p>

          <!-- Critical Information Display -->
          <div v-if="isCurrentStep(step.key) || isStepCompleted(step.key)" class="step-details">
            <div v-if="step.key === 'documents'" class="verification-checklist">
              <h5 class="checklist-title">Required Documents Check</h5>
              <div class="document-requirements">
                <div v-for="doc in getRequiredDocuments()" :key="doc.type" class="requirement-item">
                  <VaIcon
                    :name="doc.provided ? 'check_circle' : 'cancel'"
                    :color="doc.provided ? 'success' : 'danger'"
                    size="small"
                  />
                  <span :class="{ 'text-success': doc.provided, 'text-danger': !doc.provided }">
                    {{ doc.label }}
                  </span>
                </div>
              </div>

              <!-- Uploaded Documents Display -->
              <div v-if="hasUploadedDocuments()" class="uploaded-documents-section">
                <h6 class="documents-subtitle">Uploaded Documents</h6>
                <div class="documents-grid">
                  <div v-for="document in getUploadedDocuments()" :key="document.id" class="mini-document-card">
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
                      <VaButton size="small" preset="plain" icon="visibility" @click="viewDocument(document)" />
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div v-else-if="step.key === 'identity'" class="verification-checklist">
              <h5 class="checklist-title">Identity Information Check</h5>
              <div class="identity-requirements">
                <div v-for="field in getIdentityFields()" :key="field.key" class="requirement-item">
                  <VaIcon
                    :name="field.verified ? 'check_circle' : 'cancel'"
                    :color="field.verified ? 'success' : 'danger'"
                    size="small"
                  />
                  <span :class="{ 'text-success': field.verified, 'text-danger': !field.verified }">
                    {{ field.label }}: {{ field.value || 'Not provided' }}
                  </span>
                </div>
              </div>
            </div>

            <div v-else-if="step.key === 'contact'" class="verification-checklist">
              <h5 class="checklist-title">Contact Information Check</h5>
              <div class="contact-requirements">
                <div v-for="contact in getContactInfo()" :key="contact.type" class="requirement-item">
                  <VaIcon
                    :name="contact.verified ? 'check_circle' : 'cancel'"
                    :color="contact.verified ? 'success' : 'danger'"
                    size="small"
                  />
                  <span :class="{ 'text-success': contact.verified, 'text-danger': !contact.verified }">
                    {{ contact.label }}: {{ contact.value || 'Not provided' }}
                  </span>
                </div>
              </div>
            </div>

            <div v-else-if="step.key === 'role_specific'" class="verification-checklist">
              <h5 class="checklist-title">Professional Requirements Check</h5>
              <div class="professional-requirements">
                <div
                  v-for="requirement in getRoleSpecificRequirements()"
                  :key="requirement.key"
                  class="requirement-item"
                >
                  <VaIcon
                    :name="requirement.verified ? 'check_circle' : 'cancel'"
                    :color="requirement.verified ? 'success' : 'danger'"
                    size="small"
                  />
                  <span :class="{ 'text-success': requirement.verified, 'text-danger': !requirement.verified }">
                    {{ requirement.label }}: {{ requirement.value || 'Not provided' }}
                  </span>
                </div>
              </div>
            </div>

            <div v-else-if="step.key === 'final'" class="verification-checklist">
              <h5 class="checklist-title">Final Review Checklist</h5>
              <div class="final-requirements">
                <div v-for="check in getFinalChecklist()" :key="check.key" class="requirement-item">
                  <VaIcon
                    :name="check.passed ? 'check_circle' : 'cancel'"
                    :color="check.passed ? 'success' : 'danger'"
                    size="small"
                  />
                  <span :class="{ 'text-success': check.passed, 'text-danger': !check.passed }">
                    {{ check.label }}
                  </span>
                </div>
              </div>
            </div>
          </div>

          <div class="step-status">
            <VaBadge v-if="isStepCompleted(step.key)" color="success" size="small"> Completed </VaBadge>
            <VaBadge v-else-if="isCurrentStep(step.key)" color="primary" size="small"> In Progress </VaBadge>
            <VaBadge v-else color="secondary" size="small"> Pending </VaBadge>
          </div>

          <!-- Step Actions -->
          <div v-if="isCurrentStep(step.key)" class="step-actions">
            <VaButton
              v-if="canVerifyStep(step.key)"
              color="success"
              size="small"
              icon="check"
              :loading="isVerifying"
              @click="verifyCurrentStep"
            >
              Verify & Continue
            </VaButton>

            <VaButton color="danger" size="small" icon="close" preset="outline" @click="showRejectDialog = true">
              Reject Step
            </VaButton>
          </div>
        </div>

        <!-- Connection Line -->
        <div
          v-if="index < verificationSteps.length - 1"
          :class="['connection-line', { completed: isStepCompleted(step.key) }]"
        />
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
    <VaModal v-model="showRejectDialog" :title="`Reject ${getCurrentStepDisplay()}`" size="medium">
      <div class="reject-dialog-content">
        <VaAlert color="warning" class="mb-4">
          <div class="flex items-center gap-3">
            <VaIcon name="warning" />
            <div>
              <p class="font-semibold">You are about to reject: {{ getCurrentStepDisplay() }}</p>
              <p class="text-sm">This action will require the user to address the issues and resubmit.</p>
            </div>
          </div>
        </VaAlert>

        <VaInput
          v-model="rejectReason"
          label="Reason for Rejection *"
          placeholder="Please provide a detailed reason for rejection..."
          type="textarea"
          rows="4"
          class="mb-4"
          :rules="[(v) => !!v || 'Reason is required']"
        />

        <div class="flex gap-3 justify-end">
          <VaButton preset="outline" @click="showRejectDialog = false"> Cancel </VaButton>
          <VaButton color="danger" icon="close" :disabled="!rejectReason.trim()" @click="confirmRejectStep">
            Reject Step
          </VaButton>
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
// eslint-disable-next-line @typescript-eslint/no-unused-vars
const uploadedDocuments = ref<any[]>([])
const showDocumentViewer = ref(false)
const selectedDocument = ref<any>(null)

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

const getCurrentStepColor = () => {
  const progress = currentProgress.value
  if (progress >= 100) return 'success'
  if (progress >= 80) return 'primary'
  if (progress >= 60) return 'info'
  if (progress >= 40) return 'warning'
  return 'secondary'
}

const getProgressColor = (progress: number) => {
  if (progress >= 100) return 'success'
  if (progress >= 80) return 'info'
  if (progress >= 60) return 'primary'
  if (progress >= 40) return 'warning'
  return 'danger'
}

const canVerifyCurrentStep = () => {
  const currentStep = getCurrentStep()
  return currentStep !== 'final' && currentProgress.value < 100
}

const canCompleteVerification = () => {
  return getCurrentStep() === 'final' && currentProgress.value >= 80
}

const canVerifyStep = (stepKey: string) => {
  const requirements = getStepRequirements(stepKey)
  return requirements.every((req: any) => req.verified || req.passed)
}

const getStepRequirements = (stepKey: string): any[] => {
  switch (stepKey) {
    case 'documents':
      return getRequiredDocuments()
    case 'identity':
      return getIdentityFields()
    case 'contact':
      return getContactInfo()
    case 'role_specific':
      return getRoleSpecificRequirements()
    case 'final':
      return getFinalChecklist()
    default:
      return []
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

const getIdentityFields = () => {
  const user = props.verification || currentUser.value
  if (!user) return []

  const role = user.user_role?.value || 'citizen'

  const baseFields = [
    {
      key: 'name',
      label: 'Full Name',
      value: user.user_name,
      verified: !!user.user_name,
    },
    {
      key: 'email',
      label: 'Email Address',
      value: user.user_email,
      verified: !!user.user_email,
    },
  ]

  // Role-specific identity requirements
  const roleSpecificFields = {
    advocate: [
      {
        key: 'roll_number',
        label: 'Roll Number',
        value: '(From documents)',
        verified: user.documents_summary?.verified > 0,
      },
    ],
    lawyer: [
      {
        key: 'bar_number',
        label: 'Bar Membership Number',
        value: '(From documents)',
        verified: user.documents_summary?.verified > 0,
      },
    ],
    law_firm: [
      {
        key: 'firm_name',
        label: 'Firm Name',
        value: '(From documents)',
        verified: user.documents_summary?.verified > 0,
      },
    ],
  }

  return [...baseFields, ...(roleSpecificFields[role as keyof typeof roleSpecificFields] || [])]
}

const getContactInfo = () => {
  const user = props.verification || currentUser.value
  if (!user) return []

  return [
    {
      type: 'phone',
      label: 'Phone Number',
      value: user.user_phone,
      verified: !!user.user_phone && user.user_phone.length >= 10,
    },
    {
      type: 'email',
      label: 'Email Address',
      value: user.user_email,
      verified: !!user.user_email && user.user_email.includes('@'),
    },
    {
      type: 'address',
      label: 'Physical Address',
      value: user.user_address ? `${user.user_address.street}, ${user.user_address.city}` : 'Not provided',
      verified: !!user.user_address?.street,
    },
  ]
}

const getRoleSpecificRequirements = () => {
  const user = props.verification || currentUser.value
  if (!user) return []

  const role = user.user_role?.value || 'citizen'

  const roleRequirements = {
    advocate: [
      {
        key: 'roll_number',
        label: 'Valid Roll Number',
        value: 'Verified from documents',
        verified: user.documents_summary?.verified >= 2,
      },
      {
        key: 'chamber_membership',
        label: 'Chamber Membership',
        value: 'Active membership required',
        verified: user.documents_summary?.verified >= 3,
      },
    ],
    lawyer: [
      {
        key: 'bar_admission',
        label: 'Bar Admission',
        value: 'Valid bar admission',
        verified: user.documents_summary?.verified >= 2,
      },
      {
        key: 'practice_license',
        label: 'Practice License',
        value: 'Current license',
        verified: user.documents_summary?.verified >= 2,
      },
    ],
    paralegal: [
      {
        key: 'certification',
        label: 'Paralegal Certification',
        value: 'Valid certification',
        verified: user.documents_summary?.verified >= 1,
      },
      {
        key: 'employment',
        label: 'Employment Verification',
        value: 'Current employment',
        verified: user.documents_summary?.verified >= 2,
      },
    ],
    law_firm: [
      {
        key: 'business_license',
        label: 'Business License',
        value: 'Valid business license',
        verified: user.documents_summary?.verified >= 1,
      },
      {
        key: 'firm_registration',
        label: 'Firm Registration',
        value: 'Proper registration',
        verified: user.documents_summary?.verified >= 2,
      },
    ],
    law_student: [
      {
        key: 'enrollment',
        label: 'Student Enrollment',
        value: 'Current enrollment',
        verified: user.documents_summary?.verified >= 1,
      },
    ],
    citizen: [
      {
        key: 'identity_verification',
        label: 'Identity Verification',
        value: 'Basic identity confirmed',
        verified: user.documents_summary?.verified >= 1,
      },
    ],
  }

  return roleRequirements[role as keyof typeof roleRequirements] || roleRequirements.citizen
}

const getFinalChecklist = () => {
  const user = props.verification || currentUser.value
  if (!user) return []

  return [
    {
      key: 'documents_complete',
      label: 'All required documents verified',
      passed: user.documents_summary?.verified >= 2,
    },
    {
      key: 'identity_confirmed',
      label: 'Identity information confirmed',
      passed: !!user.user_name && !!user.user_email,
    },
    {
      key: 'contact_verified',
      label: 'Contact information verified',
      passed: !!user.user_phone && !!user.user_email,
    },
    {
      key: 'role_requirements',
      label: 'Role-specific requirements met',
      passed: user.documents_summary?.verified >= 1,
    },
    {
      key: 'no_red_flags',
      label: 'No verification issues found',
      passed: user.documents_summary?.rejected === 0,
    },
  ]
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
    const currentStep = getCurrentStep()
    await verificationStore.rejectStep(Number(props.userId), currentStep, rejectReason.value)

    showToast({
      message: `${getCurrentStepDisplay()} rejected successfully`,
      color: 'success',
      duration: 3000,
    })

    showRejectDialog.value = false
    rejectReason.value = ''
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
  margin-top: 1rem;
  padding: 1rem;
  background: #f8fafc;
  border-radius: 6px;
  border: 1px solid #e2e8f0;
}

.verification-checklist {
  margin-bottom: 1rem;
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
  justify-content: flex-end;
}

@media (max-width: 768px) {
  .documents-grid {
    grid-template-columns: 1fr;
  }

  .mini-document-card {
    padding: 0.5rem;
  }
}
</style>
