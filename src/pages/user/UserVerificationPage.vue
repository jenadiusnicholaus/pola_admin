<template>
  <div class="user-verification-page">
    <!-- Page Header -->
    <div class="page-header">
      <div class="header-content">
        <div class="header-text">
          <h1>Account Verification</h1>
          <p>Complete your account verification to access all platform features</p>
        </div>

        <div v-if="userRole" class="role-badge">
          <VaBadge :text="userRoleDisplay" color="primary" size="large" />
        </div>
      </div>

      <!-- Overall Progress -->
      <div class="overall-progress">
        <div class="progress-info">
          <span class="progress-label">Overall Progress</span>
          <span class="progress-percentage">{{ Math.round(progressPercentage) }}%</span>
        </div>
        <VaProgressBar
          :model-value="progressPercentage"
          :color="progressPercentage === 100 ? 'success' : 'primary'"
          size="large"
        />
      </div>
    </div>

    <!-- Verification Status Alert -->
    <div v-if="verificationData" class="status-alert">
      <VaAlert v-if="verificationData.status === 'verified'" color="success" icon="check_circle" border="left">
        <div class="alert-content">
          <h3>Account Verified!</h3>
          <p>Your account has been successfully verified. You have full access to all features.</p>
        </div>
      </VaAlert>

      <VaAlert v-else-if="verificationData.status === 'rejected'" color="danger" icon="error" border="left">
        <div class="alert-content">
          <h3>Verification Rejected</h3>
          <p>Your verification was rejected. Please review the feedback and resubmit your application.</p>
          <p v-if="verificationData.rejection_reason" class="rejection-reason">
            <strong>Reason:</strong> {{ verificationData.rejection_reason }}
          </p>
        </div>
      </VaAlert>

      <VaAlert v-else color="info" icon="info" border="left">
        <div class="alert-content">
          <h3>Verification in Progress</h3>
          <p>Your verification is currently being processed. Complete all steps below to expedite the process.</p>
        </div>
      </VaAlert>
    </div>

    <!-- Main Content -->
    <div class="main-content">
      <div v-if="isLoadingData && !userRole" class="loading-state">
        <VaProgressCircle indeterminate size="64px" />
        <h3>Loading verification data...</h3>
        <p>Please wait while we fetch your verification information.</p>
      </div>

      <div v-else-if="error" class="error-state">
        <VaAlert color="danger" icon="error">
          <div class="error-content">
            <h3>Unable to Load Verification</h3>
            <p>{{ error }}</p>
            <VaButton preset="secondary" icon="refresh" @click="retryLoad"> Try Again </VaButton>
          </div>
        </VaAlert>
      </div>

      <div v-else-if="userRole" class="stepper-container">
        <VaAlert color="info" icon="info">
          <p>Verification stepper temporarily unavailable. Please check back later.</p>
        </VaAlert>
      </div>

      <div v-else class="no-role-state">
        <VaAlert color="warning" icon="warning">
          <div class="alert-content">
            <h3>Role Required</h3>
            <p>Please select your user role before proceeding with verification.</p>
            <VaButton preset="primary" icon="person" @click="goToRoleSelection"> Select Role </VaButton>
          </div>
        </VaAlert>
      </div>
    </div>

    <!-- Help Section -->
    <div class="help-section">
      <VaCard>
        <VaCardContent>
          <div class="help-content">
            <div class="help-header">
              <VaIcon name="help_center" size="32px" color="info" />
              <div class="help-text">
                <h3>Need Help?</h3>
                <p>Having trouble with the verification process? We're here to help!</p>
              </div>
            </div>

            <div class="help-actions">
              <VaButton preset="secondary" icon="support_agent" @click="contactSupport"> Contact Support </VaButton>

              <VaButton preset="secondary" icon="help" @click="viewGuide"> Verification Guide </VaButton>

              <VaButton preset="secondary" icon="quiz" @click="viewFAQ"> FAQ </VaButton>
            </div>
          </div>
        </VaCardContent>
      </VaCard>
    </div>

    <!-- Success Modal -->
    <VaModal v-model="showSuccessModal" title="Verification Complete!" size="medium" :before-close="closeSuccessModal">
      <div class="success-modal-content">
        <div class="success-icon">
          <VaIcon name="check_circle" size="64px" color="success" />
        </div>

        <div class="success-text">
          <h3>Congratulations!</h3>
          <p>Your account verification has been completed successfully.</p>
          <p>You now have full access to all platform features.</p>
        </div>

        <div class="success-actions">
          <VaButton preset="primary" icon="dashboard" @click="goToDashboard"> Go to Dashboard </VaButton>

          <VaButton preset="secondary" @click="closeSuccessModal"> Continue Exploring </VaButton>
        </div>
      </div>
    </VaModal>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import { storeToRefs } from 'pinia'
import { useUserVerificationStore } from '../../stores/user-verification-store'
import { useUserStore } from '../../stores/user-store'
import type { UserRole } from '../../types/verification'

const router = useRouter()
const verificationStore = useUserVerificationStore()
const userStore = useUserStore()

const { verificationData, isLoading, progressPercentage } = storeToRefs(verificationStore)
const { profile } = storeToRefs(userStore)

const error = ref<string | null>(null)
const showSuccessModal = ref(false)

// Computed property to check if any data is loading
const isLoadingData = computed(() => {
  return isLoading.value || userStore.isLoadingProfile
})

// Get user role from verification data or profile
const userRole = computed((): UserRole | null => {
  if (verificationData.value?.user_role?.value) {
    return verificationData.value.user_role.value
  }
  if (profile.value?.user_role?.value) {
    return profile.value.user_role.value as UserRole
  }
  return null
})

const userRoleDisplay = computed(() => {
  if (verificationData.value?.user_role?.display) {
    return verificationData.value.user_role.display
  }
  if (profile.value?.user_role?.display) {
    return profile.value.user_role.display
  }
  return 'User'
})

const closeSuccessModal = () => {
  showSuccessModal.value = false
  return true
}

const goToDashboard = () => {
  router.push('/dashboard')
}

const goToRoleSelection = () => {
  router.push('/profile/role-selection')
}

const contactSupport = () => {
  window.location.href = 'mailto:support@pola.co.tz?subject=Verification Support Request'
}

const viewGuide = () => {
  router.push('/help/verification-guide')
}

const viewFAQ = () => {
  router.push('/faq#verification')
}

const retryLoad = async () => {
  error.value = null

  try {
    // Fetch user profile first
    await userStore.fetchUserProfile()

    // Then initialize verification if we have a role
    if (userRole.value) {
      await verificationStore.initializeVerification(userRole.value)
    }
  } catch (err: any) {
    error.value = err.message || 'Failed to load verification data'
  }
}

// Initialize verification on mount
onMounted(async () => {
  try {
    // Fetch user profile first
    await userStore.fetchUserProfile()

    // Then initialize verification if we have a role
    if (userRole.value) {
      await verificationStore.initializeVerification(userRole.value)
    }
  } catch (err: any) {
    error.value = err.message || 'Failed to load verification data'
  }
})

// Set page title
document.title = 'Account Verification - Pola'
</script>

<style scoped>
.user-verification-page {
  min-height: 100vh;
  background: #f8fafc;
  padding: 2rem;
}

.page-header {
  max-width: 1200px;
  margin: 0 auto 2rem auto;
  background: white;
  border-radius: 12px;
  padding: 2rem;
  box-shadow: 0 1px 3px 0 rgba(0, 0, 0, 0.1);
}

.header-content {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 2rem;
}

.header-text h1 {
  font-size: 2rem;
  font-weight: 700;
  color: #1f2937;
  margin: 0 0 0.5rem 0;
}

.header-text p {
  color: #6b7280;
  font-size: 1.125rem;
  margin: 0;
}

.overall-progress {
  background: #f9fafb;
  padding: 1.5rem;
  border-radius: 8px;
  border: 1px solid #e5e7eb;
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
  color: #3b82f6;
  font-size: 1.125rem;
}

.status-alert {
  max-width: 1200px;
  margin: 0 auto 2rem auto;
}

.alert-content h3 {
  font-size: 1.125rem;
  font-weight: 600;
  margin: 0 0 0.5rem 0;
}

.alert-content p {
  margin: 0 0 0.5rem 0;
}

.alert-content p:last-child {
  margin-bottom: 0;
}

.rejection-reason {
  background: rgba(239, 68, 68, 0.1);
  padding: 0.75rem;
  border-radius: 6px;
  margin-top: 0.5rem !important;
}

.main-content {
  max-width: 1200px;
  margin: 0 auto 2rem auto;
}

.loading-state,
.error-state,
.no-role-state {
  background: white;
  border-radius: 12px;
  padding: 4rem 2rem;
  text-align: center;
  box-shadow: 0 1px 3px 0 rgba(0, 0, 0, 0.1);
}

.loading-state h3 {
  font-size: 1.25rem;
  font-weight: 600;
  color: #374151;
  margin: 1rem 0 0.5rem 0;
}

.loading-state p {
  color: #6b7280;
  margin: 0;
}

.error-content h3 {
  font-size: 1.25rem;
  font-weight: 600;
  margin: 0 0 0.5rem 0;
}

.error-content p {
  margin: 0 0 1rem 0;
}

.stepper-container {
  background: white;
  border-radius: 12px;
  padding: 2rem;
  box-shadow: 0 1px 3px 0 rgba(0, 0, 0, 0.1);
}

.help-section {
  max-width: 1200px;
  margin: 0 auto;
}

.help-content {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.help-header {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.help-text h3 {
  font-size: 1.125rem;
  font-weight: 600;
  color: #374151;
  margin: 0 0 0.25rem 0;
}

.help-text p {
  color: #6b7280;
  margin: 0;
}

.help-actions {
  display: flex;
  gap: 1rem;
  flex-wrap: wrap;
}

.success-modal-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1.5rem;
  text-align: center;
  padding: 1rem;
}

.success-text h3 {
  font-size: 1.25rem;
  font-weight: 600;
  color: #374151;
  margin: 0 0 0.5rem 0;
}

.success-text p {
  color: #6b7280;
  margin: 0 0 0.5rem 0;
}

.success-text p:last-child {
  margin-bottom: 0;
}

.success-actions {
  display: flex;
  gap: 1rem;
  flex-wrap: wrap;
  justify-content: center;
}

/* Responsive Design */
@media (max-width: 768px) {
  .user-verification-page {
    padding: 1rem;
  }

  .page-header {
    padding: 1.5rem;
  }

  .header-content {
    flex-direction: column;
    gap: 1rem;
  }

  .header-text h1 {
    font-size: 1.5rem;
  }

  .header-text p {
    font-size: 1rem;
  }

  .stepper-container {
    padding: 1rem;
  }

  .help-header {
    flex-direction: column;
    text-align: center;
  }

  .help-actions {
    justify-content: center;
  }

  .help-actions > * {
    flex: 1;
    min-width: 140px;
  }

  .success-actions {
    flex-direction: column;
    width: 100%;
  }

  .success-actions > * {
    width: 100%;
  }
}

@media (max-width: 480px) {
  .help-actions {
    flex-direction: column;
  }

  .help-actions > * {
    width: 100%;
  }
}
</style>
