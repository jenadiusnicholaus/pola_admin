<template>
  <div class="verification-page">
    <div class="page-header">
      <VaIcon name="verified_user" size="2.5rem" color="primary" />
      <h1>User Verifications</h1>
      <p>Manage and review user verification requests</p>
    </div>

    <!-- Simple Filter Buttons -->
    <VaCard class="filter-card">
      <VaCardContent>
        <div class="filter-row">
          <div class="filter-buttons">
            <VaButton
              v-for="option in filterOptions"
              :key="option.value"
              :preset="selectedFilter === option.value ? 'primary' : 'secondary'"
              size="small"
              @click="selectedFilter = option.value"
            >
              {{ option.label }}
            </VaButton>
          </div>
          <VaButton color="primary" icon="refresh" size="small"> Refresh </VaButton>
        </div>
      </VaCardContent>
    </VaCard>

    <!-- Verification Cards -->
    <div class="cards-grid">
      <VaCard v-for="verification in mockVerifications" :key="verification.id" class="verification-item" hover>
        <VaCardContent>
          <div class="card-top">
            <div class="user-section">
              <VaAvatar size="large" color="primary">
                <VaIcon name="person" />
              </VaAvatar>
              <div class="user-details">
                <h4>{{ verification.user_name }}</h4>
                <p>{{ verification.user_email }}</p>
                <p>{{ verification.user_role?.display }}</p>
              </div>
            </div>
            <VaBadge :color="getBadgeColor(verification.status)">
              {{ verification.status_display }}
            </VaBadge>
          </div>

          <VaDivider />

          <div class="card-middle">
            <div class="progress-info">
              <span>Progress: {{ verification.progress }}%</span>
              <VaProgressBar :model-value="verification.progress" />
            </div>

            <div class="doc-info">
              <div class="doc-item">
                <span class="doc-number">{{ verification.documents_summary.total }}</span>
                <span class="doc-text">Total Docs</span>
              </div>
              <div class="doc-item">
                <span class="doc-number verified">{{ verification.documents_summary.verified }}</span>
                <span class="doc-text">Verified</span>
              </div>
              <div class="doc-item">
                <span class="doc-number pending">{{ verification.documents_summary.pending }}</span>
                <span class="doc-text">Pending</span>
              </div>
            </div>
          </div>

          <VaDivider />

          <div class="card-actions">
            <VaButton size="small" color="primary" icon="timeline" @click="openStepper(verification)">
              View Stepper
            </VaButton>
            <VaButton size="small" preset="secondary" icon="visibility" @click="openDetails(verification)">
              Details
            </VaButton>
          </div>
        </VaCardContent>
      </VaCard>
    </div>

    <!-- Stepper Modal - Temporarily Disabled -->
    <!-- <VaModal v-model="showStepper" title="Verification Stepper" size="large">
      <div v-if="selectedVerification">
        Stepper component removed temporarily
      </div>
    </VaModal> -->

    <!-- Details Modal -->
    <VaModal v-model="showDetails" title="Verification Details" size="medium">
      <div v-if="selectedVerification" class="details-content">
        <div class="detail-row"><strong>Name:</strong> {{ selectedVerification.user_name }}</div>
        <div class="detail-row"><strong>Email:</strong> {{ selectedVerification.user_email }}</div>
        <div class="detail-row"><strong>Phone:</strong> {{ selectedVerification.user_phone }}</div>
        <div class="detail-row"><strong>Role:</strong> {{ selectedVerification.user_role?.display }}</div>
        <div class="detail-row"><strong>Status:</strong> {{ selectedVerification.status_display }}</div>
        <div class="detail-row"><strong>Progress:</strong> {{ selectedVerification.progress }}%</div>

        <div class="modal-actions">
          <VaButton color="success">Approve</VaButton>
          <VaButton color="danger">Reject</VaButton>
        </div>
      </div>
    </VaModal>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'

const selectedFilter = ref('all')
const showStepper = ref(false)
const showDetails = ref(false)
const selectedVerification = ref<any>(null)

const filterOptions = [
  { label: 'All', value: 'all' },
  { label: 'Pending', value: 'pending' },
  { label: 'Verified', value: 'verified' },
  { label: 'Rejected', value: 'rejected' },
]

const mockVerifications = [
  {
    id: 1,
    user_name: 'John Doe',
    user_email: 'john@example.com',
    user_phone: '+1234567890',
    user_role: { display: 'Advocate' },
    status: 'pending',
    status_display: 'Pending Review',
    current_step_display: 'Document Review',
    progress: 40,
    days_since_registration: 5,
    documents_summary: {
      total: 5,
      verified: 2,
      pending: 3,
    },
  },
  {
    id: 2,
    user_name: 'Jane Smith',
    user_email: 'jane@example.com',
    user_phone: '+1234567891',
    user_role: { display: 'Lawyer' },
    status: 'verified',
    status_display: 'Verified',
    current_step_display: 'Completed',
    progress: 100,
    days_since_registration: 12,
    documents_summary: {
      total: 4,
      verified: 4,
      pending: 0,
    },
  },
  {
    id: 3,
    user_name: 'Mike Johnson',
    user_email: 'mike@example.com',
    user_phone: '+1234567892',
    user_role: { display: 'Paralegal' },
    status: 'rejected',
    status_display: 'Rejected',
    current_step_display: 'Document Issues',
    progress: 20,
    days_since_registration: 8,
    documents_summary: {
      total: 3,
      verified: 0,
      pending: 0,
    },
  },
]

const getBadgeColor = (status: string) => {
  switch (status) {
    case 'verified':
      return 'success'
    case 'pending':
      return 'warning'
    case 'rejected':
      return 'danger'
    default:
      return 'info'
  }
}

const openStepper = (verification: any) => {
  selectedVerification.value = verification
  showStepper.value = true
}

const openDetails = (verification: any) => {
  selectedVerification.value = verification
  showDetails.value = true
}
</script>

<style scoped>
.verification-page {
  padding: 2rem;
  max-width: 1200px;
  margin: 0 auto;
}

.page-header {
  text-align: center;
  margin-bottom: 2rem;
}

.page-header h1 {
  margin: 0.5rem 0;
  font-size: 2rem;
  color: #1a1a1a;
}

.page-header p {
  margin: 0;
  color: #666;
}

.filter-card {
  margin-bottom: 2rem;
}

.filter-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 1rem;
}

.filter-buttons {
  display: flex;
  gap: 0.5rem;
}

.cards-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
  gap: 1.5rem;
}

.verification-item {
  transition: transform 0.2s ease;
}

.verification-item:hover {
  transform: translateY(-2px);
}

.card-top {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 1rem;
}

.user-section {
  display: flex;
  gap: 1rem;
  align-items: center;
}

.user-details h4 {
  margin: 0 0 0.25rem 0;
  font-size: 1.1rem;
  color: #1a1a1a;
}

.user-details p {
  margin: 0.125rem 0;
  font-size: 0.9rem;
  color: #666;
}

.card-middle {
  margin: 1rem 0;
}

.progress-info {
  margin-bottom: 1rem;
}

.progress-info span {
  display: block;
  margin-bottom: 0.5rem;
  font-size: 0.9rem;
  font-weight: 500;
}

.doc-info {
  display: flex;
  justify-content: space-between;
  gap: 1rem;
}

.doc-item {
  text-align: center;
  flex: 1;
}

.doc-number {
  display: block;
  font-size: 1.25rem;
  font-weight: bold;
  color: #1a1a1a;
}

.doc-number.verified {
  color: #22c55e;
}

.doc-number.pending {
  color: #f59e0b;
}

.doc-text {
  display: block;
  font-size: 0.75rem;
  color: #666;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.card-actions {
  display: flex;
  gap: 0.5rem;
  justify-content: center;
}

.details-content {
  padding: 1rem 0;
}

.detail-row {
  display: flex;
  justify-content: space-between;
  padding: 0.5rem 0;
  border-bottom: 1px solid #f0f0f0;
}

.detail-row:last-child {
  border-bottom: none;
}

.modal-actions {
  display: flex;
  gap: 1rem;
  justify-content: center;
  margin-top: 2rem;
  padding-top: 1rem;
  border-top: 1px solid #f0f0f0;
}

@media (max-width: 768px) {
  .verification-page {
    padding: 1rem;
  }

  .cards-grid {
    grid-template-columns: 1fr;
  }

  .filter-row {
    flex-direction: column;
    align-items: stretch;
  }

  .card-actions {
    flex-direction: column;
  }
}
</style>
