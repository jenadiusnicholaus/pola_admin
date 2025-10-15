<script lang="ts" setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useToast } from 'vuestic-ui'
import { adminUserService } from '../../../services/adminUserService'
import type { AdminUser, AdminUserStats } from '../../../services/adminUserService'
import UserStatisticsCard from './cards/UserStatisticsCard.vue'
import RoleDistributionCard from './cards/RoleDistributionCard.vue'
import RecentUsersCard from './cards/RecentUsersCard.vue'
import QuickActionsCard from './cards/QuickActionsCard.vue'
import SystemAlertsCard from './cards/SystemAlertsCard.vue'

const router = useRouter()
const { init: notify } = useToast()

const stats = ref<AdminUserStats | null>(null)
const recentUsers = ref<AdminUser[]>([])
const roleCounts = ref<any>(null)
const isLoading = ref(false)
const alerts = ref([
  {
    id: '1',
    type: 'info' as const,
    title: 'Welcome to Admin Dashboard',
    message: 'Manage users, verifications, and permissions from here.',
    closeable: true,
  },
])

const fetchDashboardData = async () => {
  isLoading.value = true
  try {
    // Fetch user statistics
    const statsData = await adminUserService.getUserStats()
    stats.value = statsData

    // Fetch recent users (last 5)
    const usersResponse = await adminUserService.getAllUsers({
      page: 1,
      page_size: 5,
    })
    recentUsers.value = usersResponse.results

    // Calculate role distribution
    const allUsersResponse = await adminUserService.getAllUsers({
      page: 1,
      page_size: 1000, // Get enough to calculate distribution
    })

    const counts = {
      citizen: 0,
      law_student: 0,
      paralegal: 0,
      lawyer: 0,
      advocate: 0,
      law_firm: 0,
    }

    allUsersResponse.results.forEach((user: AdminUser) => {
      const role = user.user_role?.role_name
      if (role && role in counts) {
        counts[role as keyof typeof counts]++
      }
    })

    roleCounts.value = counts
  } catch (error) {
    notify({
      message: 'Failed to load dashboard data',
      color: 'danger',
    })
  } finally {
    isLoading.value = false
  }
}

const handleRefreshStats = () => {
  fetchDashboardData()
}

const handleViewAllUsers = () => {
  router.push('/admin-users')
}

const handleCreateUser = () => {
  router.push('/admin-users')
}

const handleManageVerifications = () => {
  router.push('/user/verifications')
}

const handleManagePermissions = () => {
  router.push('/admin-users')
}

const handleSettings = () => {
  router.push('/settings')
}

const handleReports = () => {
  notify({
    message: 'Reports feature coming soon',
    color: 'info',
  })
}

const handleCloseAlert = (id: string) => {
  alerts.value = alerts.value.filter((alert) => alert.id !== id)
}

onMounted(() => {
  fetchDashboardData()
})
</script>

<template>
  <div class="dashboard-container">
    <h1 class="dashboard-title">Dashboard</h1>

    <!-- System Alerts -->
    <SystemAlertsCard :alerts="alerts" @closeAlert="handleCloseAlert" />

    <!-- User Statistics -->
    <UserStatisticsCard :stats="stats" :loading="isLoading" @refresh="handleRefreshStats" />

    <!-- Two Column Layout -->
    <div class="dashboard-grid">
      <!-- Role Distribution -->
      <RoleDistributionCard :role-counts="roleCounts" :loading="isLoading" />

      <!-- Quick Actions -->
      <QuickActionsCard
        @createUser="handleCreateUser"
        @manageVerifications="handleManageVerifications"
        @managePermissions="handleManagePermissions"
        @viewAllUsers="handleViewAllUsers"
        @settings="handleSettings"
        @reports="handleReports"
      />
    </div>

    <!-- Recent Users -->
    <RecentUsersCard :users="recentUsers" :loading="isLoading" @viewAll="handleViewAllUsers" />
  </div>
</template>

<style scoped>
.dashboard-container {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
  padding: 0.5rem 0;
}

.dashboard-title {
  font-size: 1.75rem;
  font-weight: 700;
  color: #1a1a1a;
  margin: 0 0 0.5rem 0;
  letter-spacing: -0.02em;
}

.dashboard-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(400px, 1fr));
  gap: 1.5rem;
}

@media (max-width: 768px) {
  .dashboard-grid {
    grid-template-columns: 1fr;
  }

  .dashboard-title {
    font-size: 1.5rem;
  }
}
</style>
