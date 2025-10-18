<script lang="ts" setup>
import { ref, onMounted, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useToast } from 'vuestic-ui'
import { adminUserService } from '../../../services/adminUserService'
import type { AdminUser, AdminUserStats } from '../../../services/adminUserService'
import RecentUsersCard from './cards/RecentUsersCard.vue'

const router = useRouter()
const { init: notify } = useToast()

const stats = ref<AdminUserStats | null>(null)
const recentUsers = ref<AdminUser[]>([])
const isLoading = ref(false)

// Quick access items with neutral icons
const quickLinks = [
  {
    title: 'Analytics',
    description: 'View detailed statistics and insights',
    icon: 'bar_chart',
    route: '/admin/analytics',
    color: '#6B7280',
  },
  {
    title: 'Users',
    description: 'Manage user accounts and permissions',
    icon: 'people',
    route: '/admin-users',
    color: '#6B7280',
  },
  {
    title: 'Verifications',
    description: 'Review pending user verifications',
    icon: 'verified_user',
    route: '/user/verifications',
    color: '#6B7280',
    badge: computed(() => stats.value?.total_users || 0),
  },
  {
    title: 'Subscriptions',
    description: 'Monitor active subscriptions',
    icon: 'card_membership',
    route: '/subscriptions',
    color: '#6B7280',
  },
  {
    title: 'Transactions',
    description: 'View payment transactions',
    icon: 'payments',
    route: '/subscriptions/transactions',
    color: '#6B7280',
  },
  {
    title: 'Disbursements',
    description: 'Manage consultant payments',
    icon: 'account_balance_wallet',
    route: '/disbursements',
    color: '#6B7280',
  },
]

const fetchDashboardData = async () => {
  isLoading.value = true
  try {
    // Fetch recent users only
    const usersResponse = await adminUserService.getAllUsers({
      page: 1,
      page_size: 8,
    })
    recentUsers.value = usersResponse.results

    // Fetch minimal stats for badges
    const statsData = await adminUserService.getUserStats()
    stats.value = statsData
  } catch (error) {
    notify({
      message: 'Failed to load dashboard data',
      color: 'danger',
    })
  } finally {
    isLoading.value = false
  }
}

const navigateTo = (route: string) => {
  router.push(route)
}

const handleViewAllUsers = () => {
  router.push('/admin-users')
}

onMounted(() => {
  fetchDashboardData()
})
</script>

<template>
  <div class="dashboard-container">
    <!-- Header -->
    <div class="dashboard-header">
      <div>
        <h1 class="dashboard-title">Admin Dashboard</h1>
        <p class="dashboard-subtitle">Quick access to key administrative functions</p>
      </div>
    </div>

    <!-- Quick Links Grid -->
    <div class="quick-links-grid">
      <VaCard v-for="link in quickLinks" :key="link.route" class="quick-link-card" @click="navigateTo(link.route)">
        <VaCardContent class="quick-link-content">
          <div class="quick-link-icon">
            <VaIcon :name="link.icon" :color="link.color" size="large" />
          </div>
          <div class="quick-link-info">
            <div class="quick-link-title">
              {{ link.title }}
              <VaBadge v-if="link.badge" :text="String(link.badge.value)" color="#6B7280" class="ml-2" />
            </div>
            <div class="quick-link-description">{{ link.description }}</div>
          </div>
          <VaIcon name="arrow_forward" color="#9CA3AF" size="small" class="quick-link-arrow" />
        </VaCardContent>
      </VaCard>
    </div>

    <!-- Recent Activity -->
    <VaCard class="recent-section">
      <VaCardTitle>
        <div class="section-header">
          <div>
            <h2 class="section-title">Recent Users</h2>
            <p class="section-subtitle">Latest registered accounts</p>
          </div>
          <VaButton preset="plain" @click="handleViewAllUsers">
            View All
            <VaIcon name="arrow_forward" size="small" class="ml-1" />
          </VaButton>
        </div>
      </VaCardTitle>
      <VaCardContent>
        <RecentUsersCard :users="recentUsers" :loading="isLoading" @viewAll="handleViewAllUsers" />
      </VaCardContent>
    </VaCard>
  </div>
</template>

<style scoped>
.dashboard-container {
  display: flex;
  flex-direction: column;
  gap: 2rem;
  padding: 0.5rem 0;
}

.dashboard-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
}

.dashboard-title {
  font-size: 1.75rem;
  font-weight: 700;
  color: #111827;
  margin: 0;
  letter-spacing: -0.025em;
}

.dashboard-subtitle {
  font-size: 0.875rem;
  color: #6b7280;
  margin: 0.5rem 0 0 0;
}

.quick-links-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
  gap: 1rem;
}

.quick-link-card {
  cursor: pointer;
  transition: all 0.2s ease;
  border: 1px solid #e5e7eb;
}

.quick-link-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
  border-color: #d1d5db;
}

.quick-link-content {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 1.25rem !important;
}

.quick-link-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 48px;
  height: 48px;
  background: #f3f4f6;
  border-radius: 12px;
  flex-shrink: 0;
}

.quick-link-info {
  flex: 1;
  min-width: 0;
}

.quick-link-title {
  font-size: 0.9375rem;
  font-weight: 600;
  color: #111827;
  margin-bottom: 0.25rem;
  display: flex;
  align-items: center;
}

.quick-link-description {
  font-size: 0.8125rem;
  color: #6b7280;
  line-height: 1.4;
}

.quick-link-arrow {
  flex-shrink: 0;
  opacity: 0.5;
  transition: opacity 0.2s ease;
}

.quick-link-card:hover .quick-link-arrow {
  opacity: 1;
}

.recent-section {
  border: 1px solid #e5e7eb;
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  width: 100%;
}

.section-title {
  font-size: 1.125rem;
  font-weight: 600;
  color: #111827;
  margin: 0;
}

.section-subtitle {
  font-size: 0.8125rem;
  color: #6b7280;
  margin: 0.25rem 0 0 0;
}

@media (max-width: 768px) {
  .quick-links-grid {
    grid-template-columns: 1fr;
  }

  .dashboard-title {
    font-size: 1.5rem;
  }

  .section-header {
    flex-direction: column;
    gap: 1rem;
  }
}
</style>
