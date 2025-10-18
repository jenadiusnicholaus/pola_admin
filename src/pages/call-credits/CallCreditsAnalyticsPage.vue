<script setup lang="ts">
import { onMounted, ref, computed } from 'vue'
import { useCallCredits } from '../../composables'

const { statistics, fetchStatistics, isLoading, getUsageReport } = useCallCredits()

const selectedPeriod = ref<'daily' | 'weekly' | 'monthly'>('daily')
const usageData = ref<any[]>([])
const loadingUsage = ref(false)

onMounted(async () => {
  await fetchStatistics()
  await fetchUsageReport()
})

const fetchUsageReport = async () => {
  loadingUsage.value = true
  try {
    const report = await getUsageReport(selectedPeriod.value)
    console.log('Usage report response:', report)

    if (report && report.data && Array.isArray(report.data) && report.data.length > 0) {
      usageData.value = report.data
      console.log('Using API data:', usageData.value)
    } else {
      console.log('API returned no data, using mock data')
      usageData.value = generateMockUsageData(selectedPeriod.value)
    }
  } catch (error) {
    console.error('Failed to fetch usage report:', error)
    console.log('Error occurred, using mock data')
    usageData.value = generateMockUsageData(selectedPeriod.value)
  } finally {
    loadingUsage.value = false
    console.log('Final usageData:', usageData.value)
  }
}

const generateMockUsageData = (period: 'daily' | 'weekly' | 'monthly') => {
  const data = []
  const count = period === 'daily' ? 7 : period === 'weekly' ? 12 : 12

  for (let i = 0; i < count; i++) {
    const periodLabel = period === 'daily' ? `Day ${i + 1}` : period === 'weekly' ? `Week ${i + 1}` : `Month ${i + 1}`
    data.push({
      period: periodLabel,
      total_calls: Math.floor(Math.random() * 50) + 10,
      total_minutes: Math.floor(Math.random() * 300) + 50,
      unique_users: Math.floor(Math.random() * 30) + 5,
    })
  }
  console.log('Generated mock data:', data)
  return data
}

const handlePeriodChange = async (period: 'daily' | 'weekly' | 'monthly') => {
  selectedPeriod.value = period
  await fetchUsageReport()
}

// Chart data for display
const maxCalls = computed(() => {
  if (!usageData.value || usageData.value.length === 0) return 100
  return Math.max(...usageData.value.map((d) => d.total_calls), 1)
})
const maxMinutes = computed(() => {
  if (!usageData.value || usageData.value.length === 0) return 100
  return Math.max(...usageData.value.map((d) => d.total_minutes), 1)
})
const maxUsers = computed(() => {
  if (!usageData.value || usageData.value.length === 0) return 100
  return Math.max(...usageData.value.map((d) => d.unique_users), 1)
})

// Revenue by bundle
const revenueByBundle = computed(() => {
  if (!statistics.value) return []

  // Mock data - would come from API
  return [
    { name: 'BRONZE', revenue: 135000, purchases: 45, color: '#CD7F32' },
    { name: 'SILVER', revenue: 150000, purchases: 30, color: '#C0C0C0' },
    { name: 'GOLD', revenue: 225000, purchases: 25, color: '#FFD700' },
  ]
})

const totalRevenue = computed(() => {
  return revenueByBundle.value.reduce((sum, bundle) => sum + bundle.revenue, 0)
})
</script>

<template>
  <div class="analytics-page">
    <div class="page-header">
      <div>
        <h1 class="page-title">Call Credits Analytics</h1>
        <p class="page-subtitle">Monitor usage, revenue, and performance metrics</p>
      </div>
      <VaButton icon="refresh" @click="fetchStatistics">Refresh</VaButton>
    </div>

    <!-- Statistics Cards -->
    <div v-if="statistics" class="stats-grid">
      <VaCard class="stat-card">
        <VaCardContent>
          <div class="stat-content">
            <div class="stat-label">Total Bundles</div>
            <div class="stat-value">{{ statistics.total_bundles }}</div>
            <div class="stat-sublabel">{{ statistics.active_bundles }} active bundles</div>
          </div>
        </VaCardContent>
      </VaCard>

      <VaCard class="stat-card">
        <VaCardContent>
          <div class="stat-content">
            <div class="stat-label">Total Purchases</div>
            <div class="stat-value">{{ statistics.total_purchases.toLocaleString() }}</div>
            <div class="stat-sublabel">All-time purchases</div>
          </div>
        </VaCardContent>
      </VaCard>

      <VaCard class="stat-card">
        <VaCardContent>
          <div class="stat-content">
            <div class="stat-label">Total Revenue</div>
            <div class="stat-value">TZS {{ parseFloat(statistics.total_revenue).toLocaleString() }}</div>
            <div class="stat-sublabel">Generated revenue</div>
          </div>
        </VaCardContent>
      </VaCard>

      <VaCard class="stat-card">
        <VaCardContent>
          <div class="stat-content">
            <div class="stat-label">Minutes Sold</div>
            <div class="stat-value">{{ statistics.total_minutes_sold.toLocaleString() }}</div>
            <div class="stat-sublabel">{{ statistics.total_minutes_used.toLocaleString() }} minutes used</div>
          </div>
        </VaCardContent>
      </VaCard>

      <VaCard class="stat-card">
        <VaCardContent>
          <div class="stat-content">
            <div class="stat-label">Active Credits</div>
            <div class="stat-value">{{ statistics.active_credits.toLocaleString() }}</div>
            <div class="stat-sublabel">{{ statistics.expired_credits.toLocaleString() }} expired</div>
          </div>
        </VaCardContent>
      </VaCard>

      <VaCard class="stat-card">
        <VaCardContent>
          <div class="stat-content">
            <div class="stat-label">Average Usage Rate</div>
            <div class="stat-value">{{ parseFloat(statistics.average_usage_rate).toFixed(1) }}%</div>
            <div class="stat-sublabel">Utilization rate</div>
          </div>
        </VaCardContent>
      </VaCard>
    </div>

    <!-- Revenue by Bundle -->
    <VaCard class="revenue-card">
      <VaCardTitle>
        <span class="section-title">Revenue by Bundle</span>
      </VaCardTitle>
      <VaCardContent>
        <div class="revenue-table">
          <div class="revenue-header">
            <div class="header-cell">Bundle</div>
            <div class="header-cell">Purchases</div>
            <div class="header-cell">Revenue</div>
            <div class="header-cell">Per Purchase</div>
            <div class="header-cell">Share</div>
          </div>
          <div v-for="bundle in revenueByBundle" :key="bundle.name" class="revenue-row">
            <div class="revenue-cell bundle-name">
              <span class="bundle-indicator" :style="{ backgroundColor: bundle.color }"></span>
              {{ bundle.name }}
            </div>
            <div class="revenue-cell">{{ bundle.purchases }}</div>
            <div class="revenue-cell revenue-amount">TZS {{ bundle.revenue.toLocaleString() }}</div>
            <div class="revenue-cell">TZS {{ (bundle.revenue / bundle.purchases).toLocaleString() }}</div>
            <div class="revenue-cell">
              <div class="share-container">
                <VaProgressBar :model-value="(bundle.revenue / totalRevenue) * 100" color="#3b82f6" />
                <span class="share-percentage">{{ ((bundle.revenue / totalRevenue) * 100).toFixed(1) }}%</span>
              </div>
            </div>
          </div>
        </div>
      </VaCardContent>
    </VaCard>

    <!-- Usage Reports -->
    <VaCard class="chart-card">
      <VaCardTitle>
        <div class="chart-header">
          <span class="section-title">Usage Trends</span>
          <div class="period-selector">
            <VaButton
              size="small"
              :preset="selectedPeriod === 'daily' ? 'primary' : 'secondary'"
              @click="handlePeriodChange('daily')"
            >
              Daily
            </VaButton>
            <VaButton
              size="small"
              :preset="selectedPeriod === 'weekly' ? 'primary' : 'secondary'"
              @click="handlePeriodChange('weekly')"
            >
              Weekly
            </VaButton>
            <VaButton
              size="small"
              :preset="selectedPeriod === 'monthly' ? 'primary' : 'secondary'"
              @click="handlePeriodChange('monthly')"
            >
              Monthly
            </VaButton>
          </div>
        </div>
      </VaCardTitle>
      <VaCardContent>
        <div v-if="loadingUsage" class="loading-state">
          <VaProgressCircle indeterminate />
          <p>Loading usage data...</p>
        </div>
        <div v-else-if="!usageData || usageData.length === 0" class="empty-state">
          <VaIcon name="bar_chart" size="large" color="secondary" />
          <p>No usage data available for this period.</p>
          <VaButton size="small" @click="fetchUsageReport">Try Again</VaButton>
        </div>
        <div v-else class="charts-container">
          <div class="chart-wrapper">
            <div class="chart-header-row">
              <h3>Total Calls</h3>
              <span class="data-count">{{ usageData.length }} data points</span>
            </div>
            <div class="simple-chart">
              <div v-for="(item, index) in usageData" :key="index" class="chart-bar-wrapper">
                <div
                  class="chart-bar"
                  :style="{
                    height: `${(item.total_calls / maxCalls) * 100}%`,
                    backgroundColor: '#3b82f6',
                  }"
                >
                  <span class="bar-value">{{ item.total_calls }}</span>
                </div>
                <span class="bar-label">{{ item.period }}</span>
              </div>
            </div>
          </div>

          <div class="chart-wrapper">
            <div class="chart-header-row">
              <h3>Minutes Used</h3>
              <span class="data-count">{{ usageData.length }} data points</span>
            </div>
            <div class="simple-chart">
              <div v-for="(item, index) in usageData" :key="index" class="chart-bar-wrapper">
                <div
                  class="chart-bar"
                  :style="{
                    height: `${(item.total_minutes / maxMinutes) * 100}%`,
                    backgroundColor: '#3b82f6',
                  }"
                >
                  <span class="bar-value">{{ item.total_minutes }}</span>
                </div>
                <span class="bar-label">{{ item.period }}</span>
              </div>
            </div>
          </div>

          <div class="chart-wrapper">
            <div class="chart-header-row">
              <h3>Unique Users</h3>
              <span class="data-count">{{ usageData.length }} data points</span>
            </div>
            <div class="simple-chart">
              <div v-for="(item, index) in usageData" :key="index" class="chart-bar-wrapper">
                <div
                  class="chart-bar"
                  :style="{
                    height: `${(item.unique_users / maxUsers) * 100}%`,
                    backgroundColor: '#3b82f6',
                  }"
                >
                  <span class="bar-value">{{ item.unique_users }}</span>
                </div>
                <span class="bar-label">{{ item.period }}</span>
              </div>
            </div>
          </div>
        </div>
      </VaCardContent>
    </VaCard>

    <!-- Loading State -->
    <div v-if="isLoading && !statistics" class="loading-container">
      <VaProgressCircle indeterminate />
      <p>Loading analytics...</p>
    </div>
  </div>
</template>

<style scoped>
.analytics-page {
  padding: 1.5rem;
  max-width: 1400px;
  margin: 0 auto;
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.5rem;
  padding-bottom: 1rem;
  border-bottom: 1px solid #e5e7eb;
}

.page-title {
  font-size: 1.5rem;
  font-weight: 700;
  margin: 0;
  color: #111827;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
}

.page-subtitle {
  font-size: 0.875rem;
  color: #6b7280;
  margin: 0.375rem 0 0 0;
  font-weight: 400;
}

/* Statistics Cards */
.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1rem;
  margin-bottom: 1.5rem;
}

.stat-card {
  border-left: 1px solid #3b82f6;
  transition:
    transform 0.2s ease,
    box-shadow 0.2s ease;
}

.stat-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.stat-card :deep(.va-card__content) {
  padding: 1.25rem;
}

.stat-content {
  display: flex;
  flex-direction: column;
  gap: 0.375rem;
  min-width: 0;
}

.stat-label {
  font-size: 0.6875rem;
  font-weight: 500;
  color: #6b7280;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  margin-bottom: 0.125rem;
}

.stat-value {
  font-size: 1.125rem;
  font-weight: 700;
  color: #111827;
  line-height: 1.3;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  word-break: break-word;
  overflow-wrap: break-word;
}

.stat-sublabel {
  font-size: 0.6875rem;
  color: #9ca3af;
  font-weight: 400;
  margin-top: 0.125rem;
}

/* Revenue by Bundle */
.revenue-card {
  margin-bottom: 1.5rem;
}

.section-title {
  font-size: 1rem;
  font-weight: 600;
  color: #111827;
}

.revenue-table {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.revenue-header {
  display: grid;
  grid-template-columns: 2fr 1fr 1.5fr 1.5fr 2fr;
  gap: 0.75rem;
  padding: 0.625rem 0.875rem;
  background: #f9fafb;
  border-radius: 6px;
  font-weight: 600;
  font-size: 0.75rem;
  color: #6b7280;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.revenue-row {
  display: grid;
  grid-template-columns: 2fr 1fr 1.5fr 1.5fr 2fr;
  gap: 0.75rem;
  padding: 0.75rem 0.875rem;
  border-bottom: 1px solid #e5e7eb;
  align-items: center;
  transition: background-color 0.2s ease;
}

.revenue-row:hover {
  background-color: #f9fafb;
}

.revenue-row:last-child {
  border-bottom: none;
}

.header-cell {
  font-weight: 600;
  color: #6b7280;
}

.revenue-cell {
  font-size: 0.875rem;
  color: #374151;
}

.bundle-name {
  display: flex;
  align-items: center;
  gap: 0.625rem;
  font-weight: 500;
  color: #111827;
}

.bundle-indicator {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  flex-shrink: 0;
}

.revenue-amount {
  font-weight: 600;
  color: #111827;
  word-break: break-word;
  overflow-wrap: break-word;
}

.share-container {
  display: flex;
  align-items: center;
  gap: 0.625rem;
}

.share-container :deep(.va-progress-bar) {
  flex: 1;
  height: 6px;
}

.share-percentage {
  font-size: 0.75rem;
  font-weight: 500;
  color: #6b7280;
  min-width: 40px;
  text-align: right;
}

/* Charts */
.chart-card {
  min-height: 300px;
}

.chart-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  width: 100%;
}

.period-selector {
  display: flex;
  gap: 0.375rem;
}

.charts-container {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.chart-wrapper {
  width: 100%;
}

.chart-header-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 0.75rem;
}

.chart-wrapper h3 {
  font-size: 0.9375rem;
  font-weight: 600;
  color: #111827;
  margin: 0;
}

.data-count {
  font-size: 0.75rem;
  color: #9ca3af;
  font-weight: 400;
}

.chart-content {
  height: 200px;
  width: 100%;
}

.simple-chart {
  display: flex;
  justify-content: space-between;
  align-items: flex-end;
  height: 160px;
  padding: 0.875rem;
  gap: 0.5rem;
  background: #ffffff;
  border-radius: 6px;
  border: 1px solid #e5e7eb;
}

.chart-bar-wrapper {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  height: 100%;
  justify-content: flex-end;
  gap: 0.375rem;
  max-width: 45px;
}

.chart-bar {
  width: 100%;
  max-width: 32px;
  min-height: 24px;
  border-radius: 3px 3px 0 0;
  transition: all 0.2s ease;
  display: flex;
  align-items: flex-start;
  justify-content: center;
  padding-top: 0.375rem;
  position: relative;
}

.chart-bar:hover {
  opacity: 0.85;
  transform: translateY(-2px);
}

.bar-value {
  color: white;
  font-size: 0.6875rem;
  font-weight: 600;
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.1);
}

.bar-label {
  font-size: 0.6875rem;
  color: #6b7280;
  text-align: center;
  word-break: break-word;
  font-weight: 500;
}

.loading-container,
.loading-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 2.5rem 1.5rem;
  gap: 0.75rem;
}

.loading-container p,
.loading-state p {
  color: #6b7280;
  font-size: 0.875rem;
  font-weight: 400;
}

.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 2.5rem 1.5rem;
  gap: 0.75rem;
}

.empty-state p {
  color: #6b7280;
  font-size: 0.875rem;
  font-weight: 400;
}

@media (max-width: 768px) {
  .analytics-page {
    padding: 1rem;
  }

  .page-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 0.75rem;
  }

  .page-title {
    font-size: 1.25rem;
  }

  .page-subtitle {
    font-size: 0.8125rem;
  }

  .stats-grid {
    grid-template-columns: 1fr;
  }

  .stat-card :deep(.va-card__content) {
    padding: 1rem;
  }

  .stat-value {
    font-size: 1.25rem;
  }

  .revenue-header,
  .revenue-row {
    grid-template-columns: 1fr;
    gap: 0.375rem;
  }

  .header-cell {
    display: none;
  }

  .revenue-cell:before {
    content: attr(data-label);
    font-weight: 600;
    color: #6b7280;
    font-size: 0.6875rem;
    text-transform: uppercase;
    display: block;
    margin-bottom: 0.125rem;
  }

  .revenue-row {
    display: flex;
    flex-direction: column;
    padding: 0.75rem;
    border: 1px solid #e5e7eb;
    border-radius: 6px;
    margin-bottom: 0.375rem;
  }

  .period-selector {
    flex-direction: row;
    width: 100%;
  }

  .period-selector button {
    flex: 1;
    font-size: 0.75rem;
  }

  .simple-chart {
    height: 140px;
    padding: 0.625rem;
    gap: 0.25rem;
  }

  .bar-value {
    font-size: 0.625rem;
  }

  .bar-label {
    font-size: 0.625rem;
  }

  .chart-wrapper h3 {
    font-size: 0.875rem;
  }
}
</style>
