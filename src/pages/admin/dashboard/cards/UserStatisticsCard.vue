<template>
  <div class="stats-container">
    <div class="stats-header">
      <h2 class="stats-title">Overview</h2>
      <VaButton icon="refresh" preset="plain" size="small" color="#667eea" @click="$emit('refresh')" />
    </div>
    <div v-if="loading" class="flex justify-center py-12">
      <VaProgressCircle indeterminate />
    </div>
    <div v-else class="stats-grid">
      <div class="stat-card">
        <div class="stat-icon-wrapper primary-gradient">
          <VaIcon name="group" color="#ffffff" size="medium" />
        </div>
        <div class="stat-info">
          <div class="stat-value">{{ stats?.total_users || 0 }}</div>
          <div class="stat-label">Total Users</div>
        </div>
      </div>

      <div class="stat-card">
        <div class="stat-icon-wrapper success-gradient">
          <VaIcon name="trending_up" color="#ffffff" size="medium" />
        </div>
        <div class="stat-info">
          <div class="stat-value">{{ stats?.active_users || 0 }}</div>
          <div class="stat-label">Active Users</div>
        </div>
      </div>

      <div class="stat-card">
        <div class="stat-icon-wrapper info-gradient">
          <VaIcon name="verified_user" color="#ffffff" size="medium" />
        </div>
        <div class="stat-info">
          <div class="stat-value">{{ stats?.verified_users || 0 }}</div>
          <div class="stat-label">Verified Users</div>
        </div>
      </div>

      <div class="stat-card">
        <div class="stat-icon-wrapper secondary-gradient">
          <VaIcon name="admin_panel_settings" color="#ffffff" size="medium" />
        </div>
        <div class="stat-info">
          <div class="stat-value">{{ stats?.staff_users || 0 }}</div>
          <div class="stat-label">Staff Members</div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { PropType } from 'vue'

interface AdminUserStats {
  total_users: number
  active_users: number
  verified_users: number
  staff_users: number
}

defineProps({
  stats: {
    type: Object as PropType<AdminUserStats | null>,
    default: null,
  },
  loading: {
    type: Boolean,
    default: false,
  },
})

defineEmits<{
  (event: 'refresh'): void
}>()
</script>

<style scoped>
.stats-container {
  background: white;
  border-radius: 16px;
  padding: 1.5rem;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
  border: 1px solid rgba(0, 0, 0, 0.06);
}

.stats-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.5rem;
}

.stats-title {
  font-size: 1.25rem;
  font-weight: 600;
  color: #1a1a1a;
  margin: 0;
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1.25rem;
}

.stat-card {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 1.25rem;
  background: #fafafa;
  border-radius: 12px;
  transition: all 0.3s ease;
  border: 1px solid transparent;
}

.stat-card:hover {
  background: #f5f5f5;
  border-color: rgba(0, 0, 0, 0.08);
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
}

.stat-icon-wrapper {
  width: 52px;
  height: 52px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.stat-icon-wrapper :deep(.va-icon) {
  color: #ffffff !important;
  opacity: 1 !important;
  font-size: 24px;
}

.primary-gradient {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
}

.success-gradient {
  background: linear-gradient(135deg, #48bb78 0%, #38a169 100%);
}

.info-gradient {
  background: linear-gradient(135deg, #4299e1 0%, #3182ce 100%);
}

.secondary-gradient {
  background: linear-gradient(135deg, #6b7280 0%, #4b5563 100%);
}

.stat-info {
  flex: 1;
  min-width: 0;
}

.stat-value {
  font-size: 2rem;
  font-weight: 700;
  line-height: 1;
  margin-bottom: 0.35rem;
  color: #1a1a1a;
  letter-spacing: -0.02em;
}

.stat-label {
  font-size: 0.875rem;
  color: #6b7280;
  font-weight: 500;
  letter-spacing: 0.01em;
}

@media (max-width: 768px) {
  .stats-grid {
    grid-template-columns: repeat(2, 1fr);
  }

  .stat-value {
    font-size: 1.5rem;
  }
}
</style>
