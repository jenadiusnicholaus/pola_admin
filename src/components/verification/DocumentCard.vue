<template>
  <div
    class="document-admin-card"
    :class="{
      'verified-document': document.verification_status === 'verified',
      'pending-document': document.verification_status === 'pending',
      'rejected-document': document.verification_status === 'rejected',
    }"
  >
    <div class="document-admin-header">
      <div class="document-info">
        <VaIcon :name="getDocumentTypeIcon(document.document_type)" size="medium" class="document-icon" />
        <div class="document-details">
          <h6 class="document-title">{{ document.title }}</h6>
          <p class="document-type">{{ document.document_type_display }}</p>
          <p class="document-date">{{ formatDate(document.created_at) }}</p>
        </div>
      </div>
      <VaBadge :color="getStatusColor(document.verification_status)" size="medium" class="status-badge">
        {{ document.verification_status_display }}
      </VaBadge>
    </div>

    <div class="document-admin-actions">
      <VaButton size="small" preset="outline" icon="visibility" color="info" @click="$emit('view', document)">
        View
      </VaButton>

      <VaButton
        v-if="document.verification_status === 'pending' || document.verification_status === 'rejected'"
        size="small"
        color="success"
        icon="check"
        :loading="isApproving"
        @click="$emit('approve', document)"
      >
        Approve
      </VaButton>

      <VaButton
        v-if="document.verification_status === 'pending'"
        size="small"
        color="danger"
        icon="close"
        preset="outline"
        @click="$emit('reject', document)"
      >
        Reject
      </VaButton>
    </div>
  </div>
</template>

<script setup lang="ts">
interface Props {
  document: any
  isApproving?: boolean
}

defineProps<Props>()

defineEmits<{
  view: [document: any]
  approve: [document: any]
  reject: [document: any]
}>()

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
  return new Date(dateString).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  })
}
</script>

<style scoped>
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
</style>
