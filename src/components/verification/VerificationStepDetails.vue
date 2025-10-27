<template>
  <div class="verification-step-details">
    <!-- Final Step Summary with All Steps Status -->
    <div v-if="stepKey === 'final'" class="final-step-summary">
      <h5 class="summary-title">Verification Summary</h5>
      <ul class="steps-status-list">
        <li v-for="step in allStepsStatus" :key="step.key" class="step-status-item">
          <VaIcon
            :name="step.status === 'complete' ? 'check_circle' : step.status === 'incomplete' ? 'cancel' : 'pending'"
            :color="step.status === 'complete' ? 'success' : step.status === 'incomplete' ? 'danger' : 'warning'"
            size="small"
            class="step-icon"
          />
          <div class="step-status-info">
            <span class="step-name">{{ step.title }}</span>
            <VaBadge
              :color="step.status === 'complete' ? 'success' : step.status === 'incomplete' ? 'danger' : 'warning'"
              :text="step.statusText"
              size="small"
            />
          </div>
        </li>
      </ul>

      <div v-if="isFinalStepReady" class="final-status ready-for-approval">
        <VaIcon name="check_circle" color="success" size="medium" />
        <span>Ready for Final Approval</span>
      </div>
      <div v-else class="final-status pending-completion">
        <VaIcon name="pending" color="warning" size="medium" />
        <span>Pending - Complete all steps above</span>
      </div>
    </div>

    <!-- Verified Fields Display - Simple List with Icons -->
    <ul v-else-if="verifiedFields && verifiedFields.length > 0" class="fields-list">
      <li v-for="field in verifiedFields" :key="field.field" class="field-item">
        <VaIcon
          :name="field.status === 'verified' ? 'check_circle' : 'cancel'"
          :color="field.status === 'verified' ? 'success' : 'danger'"
          size="small"
          class="field-icon"
        />
        <div class="field-info">
          <span class="field-label">{{ field.label }}:</span>
          <span class="field-value">{{ formatFieldDisplay(field) }}</span>
        </div>
      </li>
    </ul>

    <!-- Issues Section -->
    <div v-if="issues && issues.length > 0" class="issues-section">
      <VaAlert color="warning" border="left" class="issues-alert">
        <template #title>
          <VaIcon name="warning" size="small" class="mr-2" />
          Issues Found ({{ issues.length }})
        </template>
        <ul class="issues-list">
          <li v-for="(issue, index) in issues" :key="index" class="issue-item">
            <VaIcon name="error_outline" size="small" color="warning" />
            <span>{{ issue.message || issue.label || 'Unknown issue' }}</span>
          </li>
        </ul>
      </VaAlert>
    </div>

    <!-- Missing Required Fields -->
    <div v-if="missingRequiredFields && missingRequiredFields.length > 0" class="missing-fields-section">
      <VaAlert color="danger" border="left" class="missing-alert">
        <template #title>
          <VaIcon name="cancel" size="small" class="mr-2" />
          Missing Required Information
        </template>
        <div class="missing-fields-grid">
          <VaChip v-for="field in missingRequiredFields" :key="field" color="danger" outline class="missing-chip">
            <VaIcon name="remove_circle_outline" size="small" class="mr-1" />
            {{ formatFieldName(field) }}
          </VaChip>
        </div>
      </VaAlert>
    </div>

    <!-- Step Action Buttons (for non-final steps) - Moved to bottom -->
    <div v-if="stepKey !== 'final' && hasAnyData" class="step-actions-inline">
      <VaButton v-if="!isStepCompleted" size="small" color="success" icon="check" @click="handleAcceptStep">
        Verify
      </VaButton>
      <VaButton size="small" color="danger" icon="close" preset="outline" @click="handleRejectStep"> Reject </VaButton>
    </div>

    <!-- Empty State -->
    <div v-if="!hasAnyData" class="empty-state">
      <VaIcon name="info" size="large" color="secondary" />
      <p class="va-text-secondary">No verification data available for this step</p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'

interface VerifiedField {
  field: string
  label: string
  value: any
  status: string
}

interface Issue {
  type: string
  message?: string
  label?: string
  document_type?: string
}

interface StepData {
  status: string
  is_current: boolean
  issues?: Issue[]
  required_fields?: string[]
  verified_fields?: VerifiedField[]
  missing_documents?: string[]
  missing_profile_fields?: string[]
}

const props = defineProps<{
  stepKey: string
  stepData: StepData | null
  verification: any
}>()

// Emits
interface Emits {
  (e: 'accept', stepKey: string): void
  (e: 'reject', stepKey: string): void
}

const emit = defineEmits<Emits>()

// Event Handlers
const handleAcceptStep = () => {
  emit('accept', props.stepKey)
}

const handleRejectStep = () => {
  emit('reject', props.stepKey)
}

// Computed Properties
const verifiedFields = computed(() => props.stepData?.verified_fields || [])
const issues = computed(() => props.stepData?.issues || [])
const requiredFields = computed(() => props.stepData?.required_fields || [])
// const status = computed(() => props.stepData?.status || 'pending')

const isStepCompleted = computed(() => {
  return (
    props.stepData?.status === 'complete' ||
    props.stepData?.status === 'verified' ||
    props.verification?.status === 'verified'
  )
})

const allStepsStatus = computed(() => {
  if (props.stepKey !== 'final') return []

  const byStep = props.verification?.missing_information?.by_step || {}

  const steps = [
    { key: 'identity', title: 'Identity Verification' },
    { key: 'contact', title: 'Contact Information' },
    { key: 'role_specific', title: 'Role-Specific Details' },
    { key: 'documents', title: 'Document Verification' },
  ]

  return steps.map((step) => {
    const stepData = byStep[step.key]
    const status = stepData?.status || 'incomplete'

    return {
      key: step.key,
      title: step.title,
      status: status,
      statusText: status === 'complete' ? 'Complete' : status === 'incomplete' ? 'Incomplete' : 'Pending',
    }
  })
})

const isFinalStepReady = computed(() => {
  if (props.stepKey !== 'final') return false

  // Check if verification object indicates ready for approval
  return (
    props.verification?.missing_information?.is_ready_for_approval === true ||
    props.stepData?.status === 'complete' ||
    props.verification?.status === 'verified'
  )
})

const missingRequiredFields = computed(() => {
  // If step is complete or has verified fields, don't show missing fields
  if (props.stepData?.status === 'complete' || verifiedFields.value.length > 0) {
    return []
  }

  // Only show truly missing fields (in required_fields but not in verified_fields)
  const verified = verifiedFields.value.map((f) => f.field)
  return requiredFields.value.filter((field) => !verified.includes(field))
})

const hasAnyData = computed(() => {
  // Final step always has content (summary)
  if (props.stepKey === 'final') {
    return true
  }

  return verifiedFields.value.length > 0 || issues.value.length > 0 || missingRequiredFields.value.length > 0
})

// Helper Methods
const isComplexValue = (value: any): boolean => {
  return typeof value === 'object' && value !== null
}

const formatFieldValue = (field: VerifiedField): string => {
  const { field: fieldName, value } = field

  if (value === null || value === undefined || value === '') {
    return 'N/A'
  }

  switch (fieldName) {
    case 'date_of_birth':
      return formatDate(value)

    case 'gender':
      return formatGender(value)

    case 'phone_number':
      return value

    case 'email':
      return value

    case 'years_of_experience':
      return `${value} years`

    case 'is_verified':
    case 'is_active':
      return value ? 'Yes' : 'No'

    default:
      return String(value)
  }
}

const formatFieldDisplay = (field: VerifiedField): string => {
  const { field: fieldName, value } = field

  if (value === null || value === undefined || value === '') {
    return 'N/A'
  }

  // Handle address objects
  if (
    isComplexValue(value) &&
    (fieldName === 'contact_address' || fieldName === 'user_address' || fieldName === 'address')
  ) {
    const parts = [
      value.office_address || value.street_address || value.street,
      value.ward,
      value.district,
      value.region || value.city,
    ].filter(Boolean)
    return parts.length > 0 ? parts.join(', ') : 'N/A'
  }

  // Handle other complex objects
  if (isComplexValue(value)) {
    return JSON.stringify(value)
  }

  // Use existing formatFieldValue for simple values
  return formatFieldValue(field)
}

const formatDate = (dateString: string): string => {
  try {
    const date = new Date(dateString)
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    })
  } catch {
    return dateString
  }
}

const formatGender = (gender: string): string => {
  const genderMap: Record<string, string> = {
    M: 'Male',
    F: 'Female',
    O: 'Other',
  }
  return genderMap[gender] || gender
}

const formatFieldName = (field: string): string => {
  return field
    .split('_')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ')
}
</script>

<style scoped lang="scss">
.verification-step-details {
  margin-top: 0.5rem;
}

.fields-list {
  list-style: none;
  padding: 0;
  margin: 0;
}

.field-item {
  display: flex;
  align-items: flex-start;
  gap: 0.5rem;
  padding: 0.375rem 0;

  &:first-child {
    padding-top: 0;
  }
}

.field-icon {
  flex-shrink: 0;
  margin-top: 0.125rem;
}

.field-info {
  flex: 1;
  display: flex;
  flex-wrap: wrap;
  gap: 0.25rem;
  align-items: baseline;

  .field-label {
    font-weight: 600;
    color: var(--va-text-secondary);
    font-size: 0.8125rem;
  }

  .field-value {
    color: var(--va-text-primary);
    font-size: 0.8125rem;
    word-break: break-word;
  }
}

.issues-section,
.missing-fields-section {
  margin-top: 0.75rem;
  margin-bottom: 0.75rem;
}

.issues-alert,
.missing-alert {
  .issues-list {
    margin: 0.5rem 0 0 0;
    padding-left: 0;
    list-style: none;
  }

  .issue-item {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    margin-bottom: 0.5rem;
    padding: 0.5rem;
    background: var(--va-background-element);
    border-radius: 4px;

    &:last-child {
      margin-bottom: 0;
    }
  }
}

.missing-fields-grid {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
  margin-top: 0.75rem;
}

.missing-chip {
  display: inline-flex;
  align-items: center;
}

.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 3rem 1rem;
  text-align: center;
  color: var(--va-text-secondary);

  p {
    margin-top: 1rem;
    margin-bottom: 0;
  }
}

.final-step-summary {
  padding: 0;

  .summary-title {
    margin: 0 0 1rem 0;
    font-size: 1rem;
    font-weight: 600;
    color: var(--va-text-primary);
  }
}

.steps-status-list {
  list-style: none;
  padding: 0;
  margin: 0 0 1.5rem 0;
}

.step-status-item {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.75rem;
  margin-bottom: 0.5rem;
  background: var(--va-background-element);
  border-radius: 6px;
  border: 1px solid var(--va-background-border);

  &:last-child {
    margin-bottom: 0;
  }
}

.step-icon {
  flex-shrink: 0;
}

.step-status-info {
  flex: 1;
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 1rem;

  .step-name {
    font-weight: 600;
    font-size: 0.875rem;
    color: var(--va-text-primary);
  }
}

.step-actions-inline {
  display: flex;
  gap: 0.5rem;
  margin-top: 0.75rem;
  padding-top: 0.75rem;
  border-top: 1px solid rgba(0, 0, 0, 0.08);
  justify-content: flex-start;
}

.final-status {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.75rem;
  padding: 1rem;
  border-radius: 6px;
  font-weight: 600;
  font-size: 0.875rem;

  &.ready-for-approval {
    background: var(--va-success-light);
    color: var(--va-success);
    border: 1px solid var(--va-success);
  }

  &.pending-completion {
    background: var(--va-warning-light);
    color: var(--va-warning);
    border: 1px solid var(--va-warning);
  }
}
</style>
