<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import { usePlans } from '../../composables/usePlans'
import { useSubscriptions } from '../../composables/useSubscriptions'
import { useTransactions } from '../../composables/useTransactions'

const router = useRouter()

const { statistics: plansStats, fetchStatistics: fetchPlansStats } = usePlans()
const { statistics: subsStats, fetchStatistics: fetchSubsStats } = useSubscriptions()
const { statistics: transStats, fetchStatistics: fetchTransStats } = useTransactions()

const isLoading = ref(true)

onMounted(async () => {
  await refreshDashboard()
})

const refreshDashboard = async () => {
  isLoading.value = true
  await Promise.all([fetchPlansStats(), fetchSubsStats(), fetchTransStats()])
  isLoading.value = false
}

const navigateTo = (route: string) => {
  router.push(route)
}

// Formatting helpers
const formatNumber = (value: number | undefined): string => {
  if (!value) return '0'
  return value.toLocaleString()
}

const formatCurrency = (value: number | undefined): string => {
  if (!value) return 'TZS 0'
  return `TZS ${value.toLocaleString()}`
}

const getActivePercentage = (): number => {
  if (!subsStats.value?.total_subscriptions || !subsStats.value?.active_subscriptions) return 0
  return Math.round((subsStats.value.active_subscriptions / subsStats.value.total_subscriptions) * 100)
}

const getPlansActivePercentage = (): number => {
  if (!plansStats.value?.total_plans || !plansStats.value?.active_plans) return 0
  return Math.round((plansStats.value.active_plans / plansStats.value.total_plans) * 100)
}
</script>

<template>
  <div class="subscriptions-dashboard">
    <!-- Header with Actions -->
    <div class="dashboard-header">
      <div class="header-content">
        <div class="header-text">
          <h1 class="page-title">Subscription Management</h1>
          <p class="page-subtitle">Monitor and manage your subscription ecosystem</p>
        </div>
        <div class="header-actions">
          <VaButton icon="refresh" preset="secondary" @click="refreshDashboard"> Refresh </VaButton>
          <VaButton icon="download" preset="secondary"> Export Report </VaButton>
        </div>
      </div>
    </div>

    <!-- Loading State -->
    <div v-if="isLoading" class="loading-container">
      <VaProgressCircle indeterminate size="large" />
      <p class="loading-text">Loading dashboard data...</p>
    </div>

    <!-- Dashboard Content -->
    <template v-else>
      <!-- Quick Actions Bar -->
      <div class="quick-actions-bar">
        <VaButton class="action-btn" icon="add_circle" color="primary" @click="navigateTo('/subscriptions/plans')">
          Create Plan
        </VaButton>
        <VaButton
          class="action-btn"
          icon="person_add"
          color="success"
          @click="navigateTo('/subscriptions/subscriptions')"
        >
          New Subscription
        </VaButton>
        <VaButton
          class="action-btn"
          icon="receipt"
          preset="secondary"
          @click="navigateTo('/subscriptions/transactions')"
        >
          Transactions
        </VaButton>
      </div>

      <!-- Key Metrics Overview -->
      <div class="metrics-section">
        <div class="section-header">
          <h2 class="section-title">Key Metrics</h2>
          <span class="section-subtitle">Real-time subscription performance</span>
        </div>

        <div class="metrics-grid">
          <!-- Total Subscriptions -->
          <VaCard class="metric-card clickable" @click="navigateTo('/subscriptions/subscriptions')">
            <VaCardContent>
              <div class="metric-header">
                <div class="metric-icon primary">
                  <VaIcon name="subscriptions" size="medium" />
                </div>
                <VaBadge text="View All" color="primary" />
              </div>
              <div class="metric-body">
                <div class="metric-value">{{ formatNumber(subsStats?.total_subscriptions) }}</div>
                <div class="metric-label">Total Subscriptions</div>
                <div class="metric-trend positive">
                  <VaIcon name="trending_up" size="small" />
                  <span>+12% from last month</span>
                </div>
              </div>
            </VaCardContent>
          </VaCard>

          <!-- Active Subscriptions -->
          <VaCard class="metric-card">
            <VaCardContent>
              <div class="metric-header">
                <div class="metric-icon success">
                  <VaIcon name="check_circle" size="medium" />
                </div>
                <VaBadge :text="`${getActivePercentage()}%`" color="success" />
              </div>
              <div class="metric-body">
                <div class="metric-value">{{ formatNumber(subsStats?.active_subscriptions) }}</div>
                <div class="metric-label">Active Subscriptions</div>
                <div class="metric-description">Currently paying customers</div>
              </div>
            </VaCardContent>
          </VaCard>

          <!-- Expiring Soon -->
          <VaCard class="metric-card clickable" @click="navigateTo('/subscriptions/subscriptions?status=expiring')">
            <VaCardContent>
              <div class="metric-header">
                <div class="metric-icon warning">
                  <VaIcon name="schedule" size="medium" />
                </div>
                <VaBadge text="Action Required" color="warning" />
              </div>
              <div class="metric-body">
                <div class="metric-value">{{ formatNumber(subsStats?.expiring_this_week) }}</div>
                <div class="metric-label">Expiring This Week</div>
                <div class="metric-description">Requires retention action</div>
              </div>
            </VaCardContent>
          </VaCard>

          <!-- Trial Subscriptions -->
          <VaCard class="metric-card">
            <VaCardContent>
              <div class="metric-header">
                <div class="metric-icon info">
                  <VaIcon name="card_giftcard" size="medium" />
                </div>
                <VaBadge text="Trial" color="info" />
              </div>
              <div class="metric-body">
                <div class="metric-value">{{ formatNumber(subsStats?.trial_subscriptions) }}</div>
                <div class="metric-label">Trial Users</div>
                <div class="metric-description">Potential conversions</div>
              </div>
            </VaCardContent>
          </VaCard>
        </div>
      </div>

      <!-- Two Column Layout -->
      <div class="dashboard-grid">
        <!-- Left Column: Financial & Plans -->
        <div class="dashboard-column">
          <!-- Financial Overview -->
          <VaCard class="overview-card">
            <VaCardTitle class="card-title">
              <div class="title-row">
                <div>
                  <VaIcon name="payments" class="title-icon" />
                  <span>Financial Overview</span>
                </div>
                <VaButton
                  size="small"
                  preset="plain"
                  icon="arrow_forward"
                  @click="navigateTo('/subscriptions/transactions')"
                >
                  View All
                </VaButton>
              </div>
            </VaCardTitle>
            <VaCardContent>
              <div class="financial-stats">
                <div class="main-stat">
                  <div class="main-stat-value">{{ formatCurrency(transStats?.total_revenue) }}</div>
                  <div class="main-stat-label">Total Revenue</div>
                </div>

                <div class="sub-stats-grid">
                  <div class="sub-stat">
                    <div class="sub-stat-icon">
                      <VaIcon name="receipt_long" />
                    </div>
                    <div class="sub-stat-content">
                      <div class="sub-stat-value">{{ formatNumber(transStats?.total_transactions) }}</div>
                      <div class="sub-stat-label">Transactions</div>
                    </div>
                  </div>

                  <div class="sub-stat warning">
                    <div class="sub-stat-icon">
                      <VaIcon name="hourglass_empty" />
                    </div>
                    <div class="sub-stat-content">
                      <div class="sub-stat-value">{{ formatNumber(transStats?.pending_transactions) }}</div>
                      <div class="sub-stat-label">Pending</div>
                    </div>
                  </div>

                  <div class="sub-stat danger">
                    <div class="sub-stat-icon">
                      <VaIcon name="replay" />
                    </div>
                    <div class="sub-stat-content">
                      <div class="sub-stat-value">{{ formatCurrency(transStats?.total_refunds) }}</div>
                      <div class="sub-stat-label">Refunds</div>
                    </div>
                  </div>
                </div>
              </div>
            </VaCardContent>
          </VaCard>

          <!-- Plans Overview -->
          <VaCard class="overview-card">
            <VaCardTitle class="card-title">
              <div class="title-row">
                <div>
                  <VaIcon name="format_list_bulleted" class="title-icon" />
                  <span>Plans Overview</span>
                </div>
                <VaButton size="small" preset="plain" icon="arrow_forward" @click="navigateTo('/subscriptions/plans')">
                  Manage
                </VaButton>
              </div>
            </VaCardTitle>
            <VaCardContent>
              <div class="plans-stats">
                <div class="plan-stat-row">
                  <div class="plan-stat">
                    <div class="plan-stat-number">{{ formatNumber(plansStats?.total_plans) }}</div>
                    <div class="plan-stat-label">Total Plans</div>
                  </div>
                  <VaDivider vertical />
                  <div class="plan-stat success">
                    <div class="plan-stat-number">{{ formatNumber(plansStats?.active_plans) }}</div>
                    <div class="plan-stat-label">Active Plans</div>
                  </div>
                </div>
                <VaProgressBar :model-value="getPlansActivePercentage()" color="success" class="plans-progress" />
                <div class="plan-stat-footer">{{ getPlansActivePercentage() }}% of plans are currently active</div>
              </div>
            </VaCardContent>
          </VaCard>
        </div>
      </div>
    </template>
  </div>
</template>

<style scoped>
.subscriptions-dashboard {
  padding: 0;
  max-width: 1400px;
  margin: 0 auto;
}

/* Header */
.dashboard-header {
  margin-bottom: 2rem;
  background: linear-gradient(135deg, #1f2937 0%, #111827 100%);
  border-radius: 16px;
  padding: 2rem;
  color: white;
  position: relative;
  overflow: hidden;
}

.dashboard-header::before {
  content: '';
  position: absolute;
  top: -50%;
  right: -20%;
  width: 60%;
  height: 200%;
  background: radial-gradient(circle, rgba(245, 158, 11, 0.15) 0%, transparent 70%);
  border-radius: 50%;
}

.header-content {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 2rem;
}

.header-text .page-title {
  font-size: 2rem;
  font-weight: 700;
  margin: 0 0 0.5rem;
  color: white;
}

.header-text .page-subtitle {
  font-size: 1rem;
  margin: 0;
  opacity: 0.9;
  color: white;
}

.header-actions {
  display: flex;
  gap: 1rem;
}

/* Loading State */
.loading-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 6rem 2rem;
  gap: 1.5rem;
}

.loading-text {
  font-size: 1.125rem;
  color: #6b7280;
  margin: 0;
}

/* Quick Actions Bar */
.quick-actions-bar {
  display: flex;
  gap: 1rem;
  margin-bottom: 2rem;
  flex-wrap: wrap;
}

.action-btn {
  flex: 1;
  min-width: 180px;
}

/* Section Headers */
.metrics-section {
  margin-bottom: 3rem;
}

.section-header {
  margin-bottom: 1.5rem;
}

.section-title {
  font-size: 1.5rem;
  font-weight: 700;
  color: #1a1a1a;
  margin: 0 0 0.25rem;
}

.section-subtitle {
  font-size: 0.875rem;
  color: #6b7280;
}

/* Metrics Grid */
.metrics-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(260px, 1fr));
  gap: 1.5rem;
  margin-bottom: 2rem;
}

.metric-card {
  background: white;
  border-radius: 12px;
  border: 1px solid #e5e7eb;
  transition: all 0.3s ease;
}

.metric-card.clickable {
  cursor: pointer;
}

.metric-card.clickable:hover {
  transform: translateY(-4px);
  box-shadow: 0 12px 24px rgba(0, 0, 0, 0.1);
  border-color: #d1d5db;
}

.metric-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 1rem;
}

.metric-icon {
  width: 48px;
  height: 48px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.metric-icon.primary {
  background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%);
  color: white;
}

.metric-icon.success {
  background: linear-gradient(135deg, #10b981 0%, #059669 100%);
  color: white;
}

.metric-icon.warning {
  background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%);
  color: white;
}

.metric-icon.info {
  background: linear-gradient(135deg, #60a5fa 0%, #3b82f6 100%);
  color: white;
}

.metric-icon :deep(.va-icon) {
  color: white !important;
}

.metric-body {
  margin-top: 0.5rem;
}

.metric-value {
  font-size: 2.25rem;
  font-weight: 700;
  color: #1a1a1a;
  line-height: 1.2;
  margin-bottom: 0.5rem;
}

.metric-label {
  font-size: 0.875rem;
  font-weight: 500;
  color: #6b7280;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.metric-description {
  font-size: 0.875rem;
  color: #9ca3af;
  margin-top: 0.25rem;
}

.metric-trend {
  display: flex;
  align-items: center;
  gap: 0.25rem;
  font-size: 0.875rem;
  margin-top: 0.5rem;
}

.metric-trend.positive {
  color: #10b981;
}

/* Dashboard Grid */
.dashboard-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(400px, 1fr));
  gap: 2rem;
  margin-bottom: 2rem;
}

.dashboard-column {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

/* Overview Cards */
.overview-card {
  background: white;
  border-radius: 12px;
  border: 1px solid #e5e7eb;
}

.card-title {
  padding: 1.5rem 1.5rem 0;
}

.title-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.title-row > div {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 1.125rem;
  font-weight: 600;
  color: #1a1a1a;
}

.title-icon {
  color: #667eea;
}

/* Financial Stats */
.financial-stats {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.main-stat {
  text-align: center;
  padding: 1rem;
  background: linear-gradient(135deg, #f0fdf4 0%, #dcfce7 100%);
  border-radius: 12px;
}

.main-stat-value {
  font-size: 2.5rem;
  font-weight: 700;
  color: #16a34a;
  line-height: 1;
  margin-bottom: 0.5rem;
}

.main-stat-label {
  font-size: 0.875rem;
  font-weight: 500;
  color: #15803d;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.sub-stats-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 1rem;
}

.sub-stat {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 1rem;
  background: #f9fafb;
  border-radius: 8px;
}

.sub-stat.warning {
  background: #fef3c7;
}

.sub-stat.danger {
  background: #fee2e2;
}

.sub-stat-icon {
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: white;
  border-radius: 8px;
  color: #667eea;
}

.sub-stat.warning .sub-stat-icon {
  color: #f59e0b;
}

.sub-stat.danger .sub-stat-icon {
  color: #ef4444;
}

.sub-stat-content {
  flex: 1;
}

.sub-stat-value {
  font-size: 1.25rem;
  font-weight: 700;
  color: #1a1a1a;
  line-height: 1;
}

.sub-stat-label {
  font-size: 0.75rem;
  color: #6b7280;
  margin-top: 0.25rem;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

/* Plans Stats */
.plans-stats {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.plan-stat-row {
  display: flex;
  align-items: center;
  gap: 2rem;
}

.plan-stat {
  flex: 1;
  text-align: center;
  padding: 1rem;
}

.plan-stat-number {
  font-size: 2rem;
  font-weight: 700;
  color: #1a1a1a;
  line-height: 1;
}

.plan-stat.success .plan-stat-number {
  color: #10b981;
}

.plan-stat-label {
  font-size: 0.875rem;
  color: #6b7280;
  margin-top: 0.5rem;
}

.plans-progress {
  margin: 0.5rem 0;
}

.plan-stat-footer {
  text-align: center;
  font-size: 0.875rem;
  color: #6b7280;
  padding: 0.5rem;
}

/* Wallets Stats */
.wallets-card {
  background: linear-gradient(135deg, #ffffff 0%, #f9fafb 100%);
}

.wallets-stats {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.wallet-stat-item {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.wallet-stat-item.highlight {
  background: linear-gradient(135deg, #f0fdf4 0%, #dcfce7 100%);
  padding: 1.5rem;
  border-radius: 12px;
  margin: -0.5rem;
}

.wallet-stat-header {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.wallet-stat-label {
  font-size: 0.875rem;
  font-weight: 500;
  color: #6b7280;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.wallet-stat-value {
  font-size: 1.75rem;
  font-weight: 700;
  color: #1a1a1a;
}

.wallet-stat-value.large {
  font-size: 2.5rem;
  color: #16a34a;
}

.wallet-secondary-stats {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1rem;
}

.wallet-secondary-stat {
  padding: 1rem;
  background: white;
  border-radius: 8px;
  border: 1px solid #e5e7eb;
}

.wallet-secondary-label {
  font-size: 0.75rem;
  color: #6b7280;
  margin-bottom: 0.5rem;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.wallet-secondary-value {
  font-size: 1.25rem;
  font-weight: 700;
  color: #1a1a1a;
}

.frozen-alert {
  margin-top: 0.5rem;
}

/* Responsive Design */
@media (max-width: 1024px) {
  .dashboard-grid {
    grid-template-columns: 1fr;
  }

  .sub-stats-grid {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 768px) {
  .dashboard-header {
    padding: 1.5rem;
  }

  .header-content {
    flex-direction: column;
    align-items: flex-start;
  }

  .header-text .page-title {
    font-size: 1.5rem;
  }

  .header-actions {
    width: 100%;
  }

  .header-actions button {
    flex: 1;
  }

  .metrics-grid {
    grid-template-columns: 1fr;
  }

  .quick-actions-bar {
    flex-direction: column;
  }

  .action-btn {
    min-width: 100%;
  }

  .plan-stat-row {
    flex-direction: column;
    gap: 1rem;
  }

  .wallet-secondary-stats {
    grid-template-columns: 1fr;
  }
}
</style>
