<template>
  <div class="analytics-dashboard">
    <h1 class="page-title">Analytics Dashboard</h1>

    <!-- Loading State -->
    <VaInnerLoading :loading="isLoading">
      <!-- KPI Cards Row -->
      <div class="kpi-grid">
        <!-- Total Users -->
        <VaCard class="kpi-card">
          <VaCardContent>
            <div class="kpi-header">
              <VaIcon name="people" color="primary" size="large" />
              <span class="kpi-label">Total Users</span>
            </div>
            <div class="kpi-value">{{ formatNumber(totalUsers) }}</div>
            <div class="kpi-sub">
              <VaIcon
                :name="(dashboard?.users.growth_rate ?? 0) >= 0 ? 'arrow_upward' : 'arrow_downward'"
                :color="(dashboard?.users.growth_rate ?? 0) >= 0 ? 'success' : 'danger'"
                size="small"
              />
              <span :class="(dashboard?.users.growth_rate ?? 0) >= 0 ? 'text-success' : 'text-danger'">
                {{ Math.abs(dashboard?.users.growth_rate || 0).toFixed(1) }}% growth
              </span>
              <span class="text-secondary ml-2">{{ formatNumber(dashboard?.users.new_30d || 0) }} new (30d)</span>
            </div>
          </VaCardContent>
        </VaCard>

        <!-- Revenue (30d) -->
        <VaCard class="kpi-card">
          <VaCardContent>
            <div class="kpi-header">
              <VaIcon name="payments" color="success" size="large" />
              <span class="kpi-label">Revenue (30 days)</span>
            </div>
            <div
              class="kpi-value"
              :title="`Full amount: TSh ${Number(totalRevenue30d).toLocaleString('en-TZ', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`"
            >
              {{ formatCurrency(totalRevenue30d) }}
            </div>
            <div class="kpi-sub">
              <VaIcon
                :name="revenueGrowthRate >= 0 ? 'arrow_upward' : 'arrow_downward'"
                :color="revenueGrowthRate >= 0 ? 'success' : 'danger'"
                size="small"
              />
              <span :class="revenueGrowthRate >= 0 ? 'text-success' : 'text-danger'">
                {{ Math.abs(revenueGrowthRate).toFixed(1) }}% growth
              </span>
            </div>
          </VaCardContent>
        </VaCard>

        <!-- Active Subscriptions -->
        <VaCard class="kpi-card">
          <VaCardContent>
            <div class="kpi-header">
              <VaIcon name="card_membership" color="info" size="large" />
              <span class="kpi-label">Active Subscriptions</span>
            </div>
            <div class="kpi-value">{{ formatNumber(dashboard?.subscriptions.active || 0) }}</div>
            <div class="kpi-sub">
              <span
                class="text-secondary"
                :title="`Full amount: TSh ${Number(dashboard?.subscriptions.revenue_30d || 0).toLocaleString('en-TZ', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`"
              >
                {{ formatCurrency(dashboard?.subscriptions.revenue_30d || '0') }} revenue
              </span>
            </div>
          </VaCardContent>
        </VaCard>

        <!-- Pending Actions -->
        <VaCard class="kpi-card">
          <VaCardContent>
            <div class="kpi-header">
              <VaIcon name="notification_important" color="warning" size="large" />
              <span class="kpi-label">Pending Actions</span>
            </div>
            <div class="kpi-value">{{ formatNumber(pendingDisbursements + pendingApprovals) }}</div>
            <div class="kpi-sub">
              <VaBadge :text="String(pendingDisbursements)" color="warning" />
              <span class="ml-2">Disbursements</span>
              <VaBadge :text="String(pendingApprovals)" color="warning" class="ml-3" />
              <span class="ml-2">Approvals</span>
            </div>
          </VaCardContent>
        </VaCard>
      </div>

      <!-- Revenue Breakdown -->
      <VaCard class="mt-4">
        <VaCardTitle>Revenue Breakdown (30 Days)</VaCardTitle>
        <VaCardContent>
          <div class="revenue-grid">
            <div class="revenue-item">
              <div class="revenue-label">
                <VaIcon name="card_membership" color="#f59e0b" size="small" />
                Subscriptions
              </div>
              <div
                class="revenue-amount"
                :title="`Full amount: TSh ${parseFloat(String(dashboard?.revenue.by_type.subscriptions || '0')).toLocaleString('en-TZ', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`"
              >
                {{ formatCurrency(dashboard?.revenue.by_type.subscriptions || '0') }}
              </div>
            </div>
            <div class="revenue-item">
              <div class="revenue-label">
                <VaIcon name="phone" color="#60a5fa" size="small" />
                Call Credits
              </div>
              <div
                class="revenue-amount"
                :title="`Full amount: TSh ${parseFloat(String(dashboard?.revenue.by_type.call_credits || '0')).toLocaleString('en-TZ', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`"
              >
                {{ formatCurrency(dashboard?.revenue.by_type.call_credits || '0') }}
              </div>
            </div>
            <div class="revenue-item">
              <div class="revenue-label">
                <VaIcon name="support_agent" color="#34d399" size="small" />
                Consultations
              </div>
              <div
                class="revenue-amount"
                :title="`Full amount: TSh ${parseFloat(String(dashboard?.revenue.by_type.consultations || '0')).toLocaleString('en-TZ', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`"
              >
                {{ formatCurrency(dashboard?.revenue.by_type.consultations || '0') }}
              </div>
            </div>
            <div class="revenue-item">
              <div class="revenue-label">
                <VaIcon name="description" color="#a78bfa" size="small" />
                Documents
              </div>
              <div
                class="revenue-amount"
                :title="`Full amount: TSh ${parseFloat(String(dashboard?.revenue.by_type.documents || '0')).toLocaleString('en-TZ', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`"
              >
                {{ formatCurrency(dashboard?.revenue.by_type.documents || '0') }}
              </div>
            </div>
          </div>
        </VaCardContent>
      </VaCard>

      <!-- Stats Grid -->
      <div class="stats-grid mt-4">
        <!-- Consultations -->
        <VaCard>
          <VaCardTitle>Consultations</VaCardTitle>
          <VaCardContent>
            <div class="stat-row">
              <span>Total</span>
              <strong>{{ formatNumber(dashboard?.consultations.total || 0) }}</strong>
            </div>
            <div class="stat-row">
              <span>Completed</span>
              <strong>{{ formatNumber(dashboard?.consultations.completed || 0) }}</strong>
            </div>
            <div class="stat-row">
              <span>Revenue (30d)</span>
              <strong
                :title="`Full amount: TSh ${parseFloat(String(dashboard?.consultations.revenue_30d || '0')).toLocaleString('en-TZ', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`"
              >
                {{ formatCurrency(dashboard?.consultations.revenue_30d || '0') }}
              </strong>
            </div>
          </VaCardContent>
        </VaCard>

        <!-- Documents -->
        <VaCard>
          <VaCardTitle>Learning Materials</VaCardTitle>
          <VaCardContent>
            <div class="stat-row">
              <span>Total</span>
              <strong>{{ formatNumber(dashboard?.documents.total || 0) }}</strong>
            </div>
            <div class="stat-row">
              <span>Approved</span>
              <strong>{{ formatNumber(dashboard?.documents.approved || 0) }}</strong>
            </div>
            <div class="stat-row">
              <span>Pending Approvals</span>
              <VaBadge :text="String(dashboard?.documents.pending_approvals || 0)" color="warning" />
            </div>
          </VaCardContent>
        </VaCard>

        <!-- Call Credits -->
        <VaCard>
          <VaCardTitle>Call Credits</VaCardTitle>
          <VaCardContent>
            <div class="stat-row">
              <span>Purchases (30d)</span>
              <strong>{{ formatNumber(dashboard?.call_credits.purchases_30d || 0) }}</strong>
            </div>
            <div class="stat-row">
              <span>Calls Made (30d)</span>
              <strong>{{ formatNumber(dashboard?.call_credits.total_calls_30d || 0) }}</strong>
            </div>
            <div class="stat-row">
              <span>Revenue (30d)</span>
              <strong
                :title="`Full amount: TSh ${parseFloat(String(dashboard?.call_credits.revenue_30d || '0')).toLocaleString('en-TZ', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`"
              >
                {{ formatCurrency(dashboard?.call_credits.revenue_30d || '0') }}
              </strong>
            </div>
          </VaCardContent>
        </VaCard>

        <!-- User Types -->
        <VaCard>
          <VaCardTitle>Users by Type</VaCardTitle>
          <VaCardContent>
            <div class="stat-row">
              <span>Clients</span>
              <strong>{{ formatNumber(dashboard?.users.by_type.client || 0) }}</strong>
            </div>
            <div class="stat-row">
              <span>Consultants</span>
              <strong>{{ formatNumber(dashboard?.users.by_type.consultant || 0) }}</strong>
            </div>
            <div class="stat-row">
              <span>Students</span>
              <strong>{{ formatNumber(dashboard?.users.by_type.student || 0) }}</strong>
            </div>
            <div class="stat-row">
              <span>Lecturers</span>
              <strong>{{ formatNumber(dashboard?.users.by_type.lecturer || 0) }}</strong>
            </div>
          </VaCardContent>
        </VaCard>
      </div>

      <!-- Platform Health -->
      <VaCard v-if="health" class="mt-4">
        <VaCardTitle>Platform Health</VaCardTitle>
        <VaCardContent>
          <div class="health-grid">
            <div v-if="health.payments" class="health-item">
              <div class="health-label">Payment Success Rate</div>
              <VaProgressBar
                :model-value="health.payments.success_rate || 0"
                :color="(health.payments.success_rate || 0) > 90 ? 'success' : 'warning'"
              />
              <div class="health-value">{{ (health.payments.success_rate || 0).toFixed(1) }}%</div>
              <div class="text-secondary">
                {{ health.payments.failed_count || 0 }} failed / {{ health.payments.total_count || 0 }} total
              </div>
            </div>

            <div v-if="health.disbursements" class="health-item">
              <div class="health-label">Pending Disbursements</div>
              <div
                class="health-value"
                :title="`Full amount: TSh ${parseFloat(String(health.disbursements.pending_amount || '0')).toLocaleString('en-TZ', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`"
              >
                {{ formatCurrency(health.disbursements.pending_amount || '0') }}
              </div>
              <div class="text-secondary">
                {{ health.disbursements.pending_count || 0 }} pending (avg
                {{ health.disbursements.avg_processing_hours || 0 }}h processing)
              </div>
            </div>

            <div v-if="health.consultations" class="health-item">
              <div class="health-label">Consultation Cancellation Rate</div>
              <VaProgressBar
                :model-value="health.consultations.cancellation_rate || 0"
                :color="(health.consultations.cancellation_rate || 0) < 10 ? 'success' : 'warning'"
              />
              <div class="health-value">{{ (health.consultations.cancellation_rate || 0).toFixed(1) }}%</div>
              <div class="text-secondary">Avg rating: {{ (health.consultations.average_rating || 0).toFixed(1) }}</div>
            </div>

            <div v-if="health.approvals" class="health-item">
              <div class="health-label">Pending Approvals</div>
              <div class="health-value">{{ health.approvals.pending_count || 0 }}</div>
              <div class="text-secondary">Oldest: {{ health.approvals.oldest_pending_days || 0 }} days</div>
            </div>
          </div>
        </VaCardContent>
      </VaCard>
    </VaInnerLoading>
  </div>
</template>

<script setup lang="ts">
import { onMounted } from 'vue'
import { useAnalytics } from '../../composables/useAnalytics'
import { formatNumber, formatCurrency } from '../../utils/formatters'

const {
  dashboard,
  health,
  isLoading,
  totalRevenue30d,
  totalUsers,
  revenueGrowthRate,
  pendingDisbursements,
  pendingApprovals,
  fetchDashboard,
  fetchHealth,
} = useAnalytics()

onMounted(async () => {
  await fetchDashboard()
  await fetchHealth()
})
</script>

<style scoped>
.analytics-dashboard {
  padding: 0.75rem;
}

.page-title {
  font-size: 1.5rem;
  font-weight: 600;
  margin-bottom: 1rem;
  background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

/* Reduce card content padding */
.kpi-card :deep(.va-card__content) {
  padding: 1rem;
}

.analytics-dashboard :deep(.va-card__content) {
  padding: 1rem;
}

.analytics-dashboard :deep(.va-card__title) {
  padding: 0.75rem 1rem;
  font-size: 1rem;
  font-weight: 600;
}

/* Tooltip cursor for elements with title */
[title] {
  cursor: help;
}

.kpi-value[title],
.revenue-amount[title],
.health-value[title] {
  cursor: help;
  transition: opacity 0.2s ease;
}

.kpi-value[title]:hover,
.revenue-amount[title]:hover,
.health-value[title]:hover {
  opacity: 0.8;
}

.kpi-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
  gap: 1rem;
  margin-bottom: 1rem;
}

.kpi-card {
  border-radius: 12px;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  border: 1px solid var(--va-background-border);
  background: linear-gradient(135deg, var(--va-background-element) 0%, var(--va-background) 100%);
}

.kpi-card:hover {
  transform: translateY(-2px);
  box-shadow:
    0 8px 16px rgba(0, 0, 0, 0.1),
    0 2px 4px rgba(0, 0, 0, 0.06);
  border-color: var(--va-primary);
}

.kpi-header {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin-bottom: 0.5rem;
}

.kpi-label {
  font-size: 0.75rem;
  font-weight: 600;
  color: var(--va-text-secondary);
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.kpi-value {
  font-size: clamp(1.5rem, 4vw, 2rem);
  font-weight: 700;
  margin-bottom: 0.5rem;
  background: linear-gradient(135deg, var(--va-primary) 0%, var(--va-info) 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  word-break: break-word;
  line-height: 1.2;
  overflow-wrap: break-word;
  max-width: 100%;
}

.kpi-sub {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 0.5rem;
  font-size: 0.8125rem;
}

.revenue-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
  gap: 1rem;
  padding: 0.5rem 0;
}

.revenue-item {
  text-align: center;
  padding: 0.875rem;
  background: var(--va-background-element);
  border-radius: 10px;
  transition: all 0.3s ease;
  border: 1px solid transparent;
}

.revenue-item:hover {
  transform: scale(1.03);
  border-color: var(--va-primary);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
}

.revenue-label {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  font-size: 0.8125rem;
  font-weight: 500;
  color: var(--va-text-secondary);
  margin-bottom: 0.5rem;
}

.revenue-amount {
  font-size: clamp(1.125rem, 3.5vw, 1.5rem);
  font-weight: 700;
  color: var(--va-primary);
  word-break: break-word;
  overflow-wrap: break-word;
  line-height: 1.3;
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(260px, 1fr));
  gap: 1rem;
}

.stat-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.5rem 0;
  border-bottom: 1px solid var(--va-background-border);
  gap: 1rem;
}

.stat-row:last-child {
  border-bottom: none;
}

.stat-row span:first-child {
  font-weight: 500;
  color: var(--va-text-secondary);
  font-size: 0.875rem;
}

.stat-row strong {
  font-weight: 700;
  font-size: 1rem;
  word-break: break-word;
  text-align: right;
  flex-shrink: 0;
}

.health-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
  gap: 1rem;
}

.health-item {
  padding: 1rem;
  background: linear-gradient(135deg, var(--va-background-element) 0%, var(--va-background) 100%);
  border-radius: 10px;
  border: 1px solid var(--va-background-border);
  transition: all 0.3s ease;
}

.health-item:hover {
  border-color: var(--va-primary);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
}

.health-label {
  font-size: 0.75rem;
  font-weight: 600;
  margin-bottom: 0.75rem;
  color: var(--va-text-secondary);
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.health-value {
  font-size: clamp(1.125rem, 3.5vw, 1.5rem);
  font-weight: 700;
  margin-top: 0.5rem;
  margin-bottom: 0.5rem;
  word-break: break-word;
  line-height: 1.3;
}

.text-success {
  color: var(--va-success);
}

.text-danger {
  color: var(--va-danger);
}

.text-secondary {
  color: var(--va-text-secondary);
  font-size: 0.875rem;
}

.ml-2 {
  margin-left: 0.5rem;
}

.ml-3 {
  margin-left: 0.75rem;
}

.mt-4 {
  margin-top: 1rem;
}
</style>
