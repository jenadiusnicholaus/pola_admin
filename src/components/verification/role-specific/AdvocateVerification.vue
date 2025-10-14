<template>
  <div class="advocate-verification">
    <div class="role-header">
      <VaIcon name="gavel" size="2rem" color="primary" />
      <h4>Advocate Verification Requirements</h4>
      <p>Verify advocate-specific qualifications and credentials</p>
    </div>

    <div class="requirements-checklist">
      <VaCard>
        <VaCardContent>
          <h5>Required Documents Verification</h5>

          <div class="requirement-item">
            <VaCheckbox v-model="verificationChecks.rollNumberCert" />
            <div class="requirement-info">
              <span class="requirement-title">Roll Number Certificate</span>
              <p class="requirement-desc">Valid Tanganyika Law Society roll number certificate</p>
            </div>
            <VaChip :color="getDocumentStatus('roll_number_cert')" size="small">
              {{ getDocumentStatusText('roll_number_cert') }}
            </VaChip>
          </div>

          <div class="requirement-item">
            <VaCheckbox v-model="verificationChecks.practiceLicense" />
            <div class="requirement-info">
              <span class="requirement-title">Practice License</span>
              <p class="requirement-desc">Current practicing certificate (not expired)</p>
            </div>
            <VaChip :color="getDocumentStatus('practice_license')" size="small">
              {{ getDocumentStatusText('practice_license') }}
            </VaChip>
          </div>

          <div class="requirement-item">
            <VaCheckbox v-model="verificationChecks.workCertificate" />
            <div class="requirement-info">
              <span class="requirement-title">Work Certificate</span>
              <p class="requirement-desc">Employment certificate or firm association letter</p>
            </div>
            <VaChip :color="getDocumentStatus('work_certificate')" size="small">
              {{ getDocumentStatusText('work_certificate') }}
            </VaChip>
          </div>
        </VaCardContent>
      </VaCard>
    </div>

    <div class="professional-verification">
      <VaCard>
        <VaCardContent>
          <h5>User-Submitted Professional Information</h5>

          <div class="submitted-info">
            <div class="info-item">
              <span class="info-label">User Role:</span>
              <span class="info-value">{{ props.user?.user_role?.display || 'Not provided' }}</span>
              <VaChip :color="props.user?.user_role ? 'success' : 'warning'" size="small">
                {{ props.user?.user_role ? 'Verified Role' : 'Missing' }}
              </VaChip>
            </div>

            <div class="info-item">
              <span class="info-label">Full Name:</span>
              <span class="info-value">{{
                props.user?.user_full_name || props.user?.user_name || 'Not provided'
              }}</span>
              <VaChip :color="props.user?.user_full_name || props.user?.user_name ? 'success' : 'warning'" size="small">
                {{ props.user?.user_full_name || props.user?.user_name ? 'Provided' : 'Missing' }}
              </VaChip>
            </div>

            <div class="info-item">
              <span class="info-label">Email:</span>
              <span class="info-value">{{ props.user?.user_email || 'Not provided' }}</span>
              <VaChip :color="props.user?.user_email ? 'success' : 'warning'" size="small">
                {{ props.user?.user_email ? 'Provided' : 'Missing' }}
              </VaChip>
            </div>

            <div class="info-item">
              <span class="info-label">Phone:</span>
              <span class="info-value">{{ props.user?.user_phone || 'Not provided' }}</span>
              <VaChip :color="props.user?.user_phone ? 'success' : 'warning'" size="small">
                {{ props.user?.user_phone ? 'Provided' : 'Missing' }}
              </VaChip>
            </div>

            <div class="info-item">
              <span class="info-label">Date of Birth:</span>
              <span class="info-value">{{ props.user?.user_date_of_birth || 'Not provided' }}</span>
              <VaChip :color="props.user?.user_date_of_birth ? 'success' : 'warning'" size="small">
                {{ props.user?.user_date_of_birth ? 'Provided' : 'Missing' }}
              </VaChip>
            </div>

            <div class="info-item">
              <span class="info-label">Gender:</span>
              <span class="info-value">{{ formatGender(props.user?.user_gender) || 'Not provided' }}</span>
              <VaChip :color="props.user?.user_gender ? 'success' : 'warning'" size="small">
                {{ props.user?.user_gender ? 'Provided' : 'Missing' }}
              </VaChip>
            </div>
          </div>

          <div class="verification-actions-section">
            <h6>Admin Verification Actions</h6>
            <div class="field-group">
              <VaButton size="small" color="primary" :disabled="!props.user?.user_role" @click="verifyRollNumber">
                <VaIcon name="verified" /> Verify Role Information
              </VaButton>
              <span v-if="rollNumberVerified" class="verification-status">
                <VaIcon name="check_circle" color="success" /> Role information verified
              </span>
            </div>
          </div>
        </VaCardContent>
      </VaCard>
    </div>

    <div class="additional-verification">
      <VaCard>
        <VaCardContent>
          <h5>Additional Verification Notes</h5>
          <VaTextarea
            v-model="verificationNotes"
            placeholder="Add any additional notes about the advocate verification..."
            rows="4"
          />
        </VaCardContent>
      </VaCard>
    </div>

    <div class="verification-actions">
      <VaAlert v-if="!allRequirementsMet" color="warning" class="requirements-alert">
        Please complete all verification requirements before proceeding.
      </VaAlert>

      <VaButton :disabled="!allRequirementsMet" color="success" @click="completeVerification">
        Complete Advocate Verification
      </VaButton>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, watch } from 'vue'

// Props
interface Props {
  user: any
  documents: any[]
}

const props = defineProps<Props>()

// Emits
const emit = defineEmits<{
  'update:verification': [status: boolean]
}>()

// Reactive data
const verificationChecks = reactive({
  rollNumberCert: false,
  practiceLicense: false,
  workCertificate: false,
})

const rollNumberVerified = ref(false)
const verificationNotes = ref('')

// Computed
const allRequirementsMet = computed(() => {
  return (
    Object.values(verificationChecks).every((check) => check) &&
    props.user?.user_role &&
    props.user?.user_full_name &&
    props.user?.user_email
  )
})

// Watch for changes and emit status
watch(allRequirementsMet, (newValue) => {
  emit('update:verification', newValue)
})

// Methods
const getDocumentStatus = (documentType: string) => {
  const doc = props.documents.find((d) => d.document_type === documentType)
  if (!doc) return 'danger'

  switch (doc.verification_status) {
    case 'verified':
      return 'success'
    case 'rejected':
      return 'danger'
    default:
      return 'warning'
  }
}

const getDocumentStatusText = (documentType: string) => {
  const doc = props.documents.find((d) => d.document_type === documentType)
  if (!doc) return 'Missing'
  return doc.verification_status_display || 'Pending'
}

const formatGender = (gender?: string) => {
  const genderMap: { [key: string]: string } = {
    M: 'Male',
    F: 'Female',
    m: 'Male',
    f: 'Female',
    male: 'Male',
    female: 'Female',
  }
  return gender ? genderMap[gender] || gender : 'Not provided'
}

const verifyRollNumber = () => {
  // Verify the user role information
  if (props.user?.user_role && props.user?.user_full_name && props.user?.user_email) {
    rollNumberVerified.value = true
    verificationChecks.rollNumberCert = true
    verificationChecks.practiceLicense = true
    verificationChecks.workCertificate = true
  }
}

const completeVerification = () => {
  emit('update:verification', true)
}
</script>

<style scoped>
.advocate-verification {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.role-header {
  text-align: center;
  margin-bottom: 1rem;
}

.role-header h4 {
  margin: 0.5rem 0;
  font-size: 1.25rem;
  font-weight: 600;
}

.role-header p {
  color: #6c757d;
  margin: 0;
}

.requirement-item {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 1rem;
  border: 1px solid #e9ecef;
  border-radius: 0.5rem;
  margin-bottom: 1rem;
}

.requirement-info {
  flex: 1;
}

.requirement-title {
  font-weight: 600;
  display: block;
  margin-bottom: 0.25rem;
}

.requirement-desc {
  font-size: 0.875rem;
  color: #6c757d;
  margin: 0;
}

.verification-fields {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.field-group {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.field-group label {
  font-weight: 500;
  font-size: 0.875rem;
}

.verification-actions {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  align-items: center;
}

.requirements-alert {
  width: 100%;
}

.submitted-info {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  margin-bottom: 1.5rem;
}

.info-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0.75rem;
  background: #f8f9fa;
  border-radius: 6px;
  border: 1px solid #e9ecef;
}

.info-label {
  font-weight: 500;
  color: #495057;
  min-width: 150px;
}

.info-value {
  flex: 1;
  margin: 0 1rem;
  color: #212529;
}

.verification-actions-section {
  margin-top: 1.5rem;
  padding-top: 1rem;
  border-top: 1px solid #e9ecef;
}

.verification-actions-section h6 {
  margin-bottom: 0.75rem;
  font-weight: 600;
  color: #495057;
}

.verification-status {
  margin-left: 1rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.875rem;
  color: #28a745;
}
</style>
