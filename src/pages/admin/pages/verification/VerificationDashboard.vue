<template>
  <div class="verification-dashboard">
    <div class="dashboard-header">
      <VaIcon name="dashboard" size="3rem" color="primary" class="header-icon" />
      <h1 class="va-h1">Verification Dashboard</h1>
      <p class="va-text-secondary">Overview of user verification statistics and analytics</p>
    </div>

    <VaAlert v-if="verificationStore.error" color="danger" class="error-alert" @close="verificationStore.clearError">
      {{ verificationStore.error }}
    </VaAlert>

    <div v-if="verificationStore.loading.statistics" class="flex flex-col items-center justify-center py-16 gap-4">
      <VaProgressCircle indeterminate size="large" />
      <p class="va-text-secondary">Loading statistics...</p>
    </div>

    <div v-else class="dashboard-content">
      <!-- Demo Section: Multi-Step Verification Stepper -->

      <!-- Statistics Section (when available) -->
      <div v-if="verificationStore.statistics">
        <!-- Overview Statistics -->
        <div class="stats-grid">
          <VaCard class="stat-card modern-stat-card">
            <VaCardContent>
              <div class="stat-content">
                <div class="stat-icon-wrapper total-users">
                  <VaIcon name="group" size="2rem" />
                </div>
                <div class="stat-info">
                  <div class="stat-number">
                    {{ verificationStore.statistics.overview.total_users }}
                  </div>
                  <p class="stat-label">Total Users</p>
                </div>
              </div>
            </VaCardContent>
          </VaCard>

          <VaCard class="stat-card modern-stat-card">
            <VaCardContent>
              <div class="stat-content">
                <div class="stat-icon-wrapper verified-users">
                  <VaIcon name="check_circle" size="2rem" />
                </div>
                <div class="stat-info">
                  <div class="stat-number">
                    {{ verificationStore.statistics.overview.verified_users }}
                  </div>
                  <p class="stat-label">Verified Users</p>
                </div>
              </div>
            </VaCardContent>
          </VaCard>

          <VaCard class="stat-card modern-stat-card">
            <VaCardContent>
              <div class="stat-content">
                <div class="stat-icon-wrapper pending-verifications">
                  <VaIcon name="pending" size="2rem" />
                </div>
                <div class="stat-info">
                  <div class="stat-number">
                    {{ verificationStore.statistics.overview.pending_verifications }}
                  </div>
                  <p class="stat-label">Pending</p>
                </div>
              </div>
            </VaCardContent>
          </VaCard>

          <VaCard class="stat-card modern-stat-card">
            <VaCardContent>
              <div class="stat-content">
                <div class="stat-icon-wrapper rejected-verifications">
                  <VaIcon name="cancel" size="2rem" />
                </div>
                <div class="stat-info">
                  <div class="stat-number">
                    {{ verificationStore.statistics.overview.rejected_verifications }}
                  </div>
                  <p class="stat-label">Rejected</p>
                </div>
              </div>
            </VaCardContent>
          </VaCard>
        </div>

        <!-- Role Breakdown -->
        <VaCard class="role-breakdown-card">
          <VaCardTitle class="flex items-center gap-3">
            <VaIcon name="work" color="primary" size="large" />
            <div>
              <div class="va-h4">Breakdown by Role</div>
              <div class="va-text-secondary">Verification statistics per user role</div>
            </div>
          </VaCardTitle>
          <VaCardContent>
            <div class="role-stats">
              <VaCard
                v-for="(data, role) in verificationStore.statistics.by_role"
                :key="role"
                outlined
                hover
                class="role-stat-item"
              >
                <VaCardContent>
                  <div class="va-h6 mb-3">
                    {{ String(role).charAt(0).toUpperCase() + String(role).slice(1).replace('_', ' ') }}
                  </div>
                  <div class="role-numbers">
                    <div class="role-stat">
                      <span class="role-count">{{ data.total }}</span>
                      <span class="role-label">Total</span>
                    </div>
                    <div class="role-stat verified">
                      <span class="role-count">{{ data.verified }}</span>
                      <span class="role-label">Verified</span>
                    </div>
                    <div class="role-stat pending">
                      <span class="role-count">{{ data.pending }}</span>
                      <span class="role-label">Pending</span>
                    </div>
                    <div v-if="data.rejected" class="role-stat rejected">
                      <span class="role-count">{{ data.rejected }}</span>
                      <span class="role-label">Rejected</span>
                    </div>
                  </div>
                </VaCardContent>
              </VaCard>
            </div>
          </VaCardContent>
        </VaCard>
      </div>

      <!-- Quick Actions -->
      <VaCard class="quick-actions-card">
        <VaCardTitle class="flex items-center gap-3">
          <VaIcon name="bolt" color="primary" size="large" />
          <div>
            <div class="va-h4">Quick Actions</div>
            <div class="va-text-secondary">Navigate to key verification areas</div>
          </div>
        </VaCardTitle>
        <VaCardContent>
          <div class="action-buttons">
            <VaButton
              size="large"
              color="primary"
              icon="list"
              @click="router.push('/admin-verification/verifications')"
            >
              View All Verifications
            </VaButton>
            <VaButton
              size="large"
              color="warning"
              icon="description"
              @click="router.push('/admin-verification/documents')"
            >
              Review Documents
            </VaButton>
          </div>
        </VaCardContent>
      </VaCard>
    </div>
  </div>
</template>

<script setup lang="ts">
import { onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useVerificationStore } from '../../../../stores/verification-store'
// import SimpleWorkingVerificationStepper from '../../../../components/verification/SimpleWorkingVerificationStepper.vue'

const router = useRouter()
const verificationStore = useVerificationStore()
// const showStepper = ref(false)

onMounted(async () => {
  try {
    await verificationStore.fetchStatistics()
  } catch (error) {
    console.error('Failed to load dashboard:', error)
  }
})
</script>

<style scoped>
.verification-dashboard {
  @apply p-8 max-w-7xl mx-auto;
  background: var(--va-background-secondary);
  min-height: 100vh;
}

.dashboard-header {
  @apply text-center mb-8 flex flex-col items-center gap-4;
}

.header-icon {
  @apply mb-2;
}

.error-alert {
  @apply mb-8;
}

.dashboard-content {
  @apply flex flex-col gap-8;
}

.stats-grid {
  @apply grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6;
}

.modern-stat-card {
  @apply transition-all duration-300;
  background: white;
  border: 1px solid rgba(0, 0, 0, 0.06);
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
}

.modern-stat-card:hover {
  transform: translateY(-2px);
  border-color: rgba(0, 0, 0, 0.1);
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.12);
}

.stat-content {
  @apply flex items-center gap-4;
}

.stat-icon-wrapper {
  @apply w-12 h-12 rounded-lg flex items-center justify-center;
  background: rgba(0, 0, 0, 0.04);
}

.stat-icon-wrapper.total-users {
  background: rgba(59, 130, 246, 0.1);
  color: #3b82f6;
}

.stat-icon-wrapper.verified-users {
  background: rgba(34, 197, 94, 0.1);
  color: #22c55e;
}

.stat-icon-wrapper.pending-verifications {
  background: rgba(245, 158, 11, 0.1);
  color: #f59e0b;
}

.stat-icon-wrapper.rejected-verifications {
  background: rgba(239, 68, 68, 0.1);
  color: #ef4444;
}

.stat-info {
  @apply flex-1;
}

.stat-number {
  @apply text-3xl font-bold mb-1;
  color: #1f2937;
}

.stat-label {
  @apply text-sm font-medium m-0;
  color: #6b7280;
}

.role-breakdown-card {
  box-shadow: var(--va-box-shadow);
}

.role-stats {
  @apply grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4;
}

.role-stat-item {
  @apply transition-all duration-300 hover:scale-105;
}

.role-numbers {
  @apply grid grid-cols-2 gap-3;
}

.role-stat {
  @apply text-center p-2 rounded-lg;
  background: rgba(0, 0, 0, 0.02);
  border: 1px solid rgba(0, 0, 0, 0.05);
}

.role-count {
  @apply block text-lg font-bold;
  color: #1f2937;
}

.role-label {
  @apply block text-xs font-medium mt-1;
  color: #6b7280;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.role-stat.verified .role-count {
  color: #22c55e;
}

.role-stat.pending .role-count {
  color: #f59e0b;
}

.role-stat.rejected .role-count {
  color: #ef4444;
}

.quick-actions-card {
  box-shadow: var(--va-box-shadow);
}

.action-buttons {
  @apply flex gap-4 flex-wrap;
}

.demo-stepper-section {
  @apply my-8;
}

.stepper-demo {
  @apply mt-4;
}

@media (max-width: 768px) {
  .verification-dashboard {
    @apply p-4;
  }

  .stats-grid {
    @apply grid-cols-1;
  }

  .role-stats {
    @apply grid-cols-1;
  }

  .action-buttons {
    @apply flex-col;
  }
}
</style>
