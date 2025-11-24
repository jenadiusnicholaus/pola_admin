<template>
  <VaModal
    v-model="isOpen"
    title="Request Details"
    size="large"
    :ok-text="showActions ? 'Approve' : 'Close'"
    :cancel-text="showActions ? 'Reject' : undefined"
    :hide-default-actions="!showActions"
    @ok="handleApprove"
    @cancel="handleReject"
  >
    <div v-if="request" class="request-details">
      <!-- User Information -->
      <VaCard class="mb-4">
        <VaCardTitle>
          <VaIcon name="person" class="mr-2" />
          User Information
        </VaCardTitle>
        <VaCardContent>
          <div class="detail-grid">
            <div class="detail-item">
              <span class="detail-label">Full Name:</span>
              <span class="detail-value">{{ request.user_details.full_name }}</span>
            </div>
            <div class="detail-item">
              <span class="detail-label">Email:</span>
              <span class="detail-value">{{ request.user_details.email }}</span>
            </div>
            <div class="detail-item">
              <span class="detail-label">Phone:</span>
              <span class="detail-value">{{ request.user_details.phone }}</span>
            </div>
            <div class="detail-item">
              <span class="detail-label">Consultant Type:</span>
              <VaBadge :text="request.consultant_type_display" color="info" />
            </div>
            <div v-if="request.professional_info.years_of_experience" class="detail-item">
              <span class="detail-label">Experience:</span>
              <span class="detail-value">{{ request.professional_info.years_of_experience }} years</span>
            </div>
            <div v-if="request.professional_info.roll_number" class="detail-item">
              <span class="detail-label">Roll Number:</span>
              <span class="detail-value">{{ request.professional_info.roll_number }}</span>
            </div>
          </div>
        </VaCardContent>
      </VaCard>

      <!-- Professional Information -->
      <VaCard class="mb-4">
        <VaCardTitle>
          <VaIcon name="work" class="mr-2" />
          Professional Information
        </VaCardTitle>
        <VaCardContent>
          <div class="detail-grid">
            <div class="detail-item">
              <span class="detail-label">Status:</span>
              <VaBadge :text="request.status_display" color="primary" />
            </div>
            <div class="detail-item">
              <span class="detail-label">Mobile Consultation:</span>
              <VaIcon
                :name="request.offers_mobile_consultations ? 'check_circle' : 'cancel'"
                :color="request.offers_mobile_consultations ? 'success' : 'danger'"
              />
            </div>
            <div class="detail-item">
              <span class="detail-label">Physical Consultation:</span>
              <VaIcon
                :name="request.offers_physical_consultations ? 'check_circle' : 'cancel'"
                :color="request.offers_physical_consultations ? 'success' : 'danger'"
              />
            </div>
            <div v-if="request.preferred_consultation_city" class="detail-item full-width">
              <span class="detail-label">Preferred City:</span>
              <span class="detail-value">{{ request.preferred_consultation_city }}</span>
            </div>
            <div v-if="request.professional_info.specializations?.length" class="detail-item full-width">
              <span class="detail-label">Specializations:</span>
              <div class="specializations">
                <VaChip v-for="spec in request.professional_info.specializations" :key="spec" size="small">
                  {{ spec }}
                </VaChip>
              </div>
            </div>
          </div>
        </VaCardContent>
      </VaCard>

      <!-- Documents -->
      <VaCard class="mb-4">
        <VaCardTitle>
          <VaIcon name="folder" class="mr-2" />
          Documents
        </VaCardTitle>
        <VaCardContent>
          <div class="documents-list">
            <div v-if="request.license_document" class="document-item">
              <VaIcon name="description" color="primary" />
              <span>Professional License</span>
              <VaButton size="small" icon="visibility" @click="viewDocument(request.license_document)"> View </VaButton>
            </div>
            <div v-if="request.id_document" class="document-item">
              <VaIcon name="badge" color="info" />
              <span>ID Document</span>
              <VaButton size="small" icon="visibility" @click="viewDocument(request.id_document)"> View </VaButton>
            </div>
            <div v-if="request.cv_document" class="document-item">
              <VaIcon name="article" color="success" />
              <span>CV/Resume</span>
              <VaButton size="small" icon="visibility" @click="viewDocument(request.cv_document)"> View </VaButton>
            </div>
          </div>
        </VaCardContent>
      </VaCard>

      <!-- Status & Review -->
      <VaCard>
        <VaCardTitle>
          <VaIcon name="info" class="mr-2" />
          Status & Review
        </VaCardTitle>
        <VaCardContent>
          <div class="detail-grid">
            <div class="detail-item">
              <span class="detail-label">Status:</span>
              <VaBadge :text="request.status" :color="getStatusColor(request.status)" />
            </div>
            <div class="detail-item">
              <span class="detail-label">Created:</span>
              <span class="detail-value">{{ formatDate(request.created_at) }}</span>
            </div>
            <div v-if="request.reviewed_by" class="detail-item">
              <span class="detail-label">Reviewed By:</span>
              <span class="detail-value">Admin ID: {{ request.reviewed_by }}</span>
            </div>
            <div v-if="request.reviewed_at" class="detail-item">
              <span class="detail-label">Reviewed At:</span>
              <span class="detail-value">{{ formatDate(request.reviewed_at) }}</span>
            </div>
            <div v-if="request.admin_notes" class="detail-item full-width">
              <span class="detail-label">Admin Notes:</span>
              <VaAlert color="warning" border="left">
                {{ request.admin_notes }}
              </VaAlert>
            </div>
          </div>
        </VaCardContent>
      </VaCard>
    </div>

    <template v-if="!showActions" #footer>
      <VaButton @click="isOpen = false">Close</VaButton>
    </template>
  </VaModal>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { ConsultantRequest } from '../../services/consultantRequestsService'

interface Props {
  modelValue: boolean
  request: ConsultantRequest | null
}

interface Emits {
  (e: 'update:modelValue', value: boolean): void
  (e: 'approve'): void
  (e: 'reject'): void
}

const props = defineProps<Props>()
const emit = defineEmits<Emits>()

const isOpen = computed({
  get: () => props.modelValue,
  set: (value) => emit('update:modelValue', value),
})

const showActions = computed(() => {
  return props.request?.status === 'pending'
})

const getStatusColor = (status: string) => {
  switch (status) {
    case 'pending':
      return 'warning'
    case 'approved':
      return 'success'
    case 'rejected':
      return 'danger'
    default:
      return 'secondary'
  }
}

const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

const viewDocument = (url: string) => {
  window.open(url, '_blank')
}

const handleApprove = () => {
  emit('approve')
}

const handleReject = () => {
  emit('reject')
}
</script>

<style scoped>
.request-details {
  max-height: 70vh;
  overflow-y: auto;
}

.detail-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 1rem;
}

.detail-item {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.detail-item.full-width {
  grid-column: 1 / -1;
}

.detail-label {
  font-size: 0.875rem;
  font-weight: 600;
  color: var(--va-text-secondary);
}

.detail-value {
  font-size: 0.95rem;
  color: var(--va-text-primary);
}

.specializations {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
}

.documents-list {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.document-item {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.75rem;
  background: var(--va-background-element);
  border-radius: 8px;
}

.document-item span {
  flex: 1;
  font-weight: 500;
}
</style>
