<template>
  <div class="role-card">
    <h2 class="card-title">User Roles</h2>
    <div v-if="loading" class="flex justify-center py-12">
      <VaProgressCircle indeterminate />
    </div>
    <div v-else class="role-list">
      <div v-for="role in roleStats" :key="role.name" class="role-item">
        <div class="role-header">
          <div class="role-info">
            <span class="role-dot" :style="{ backgroundColor: getRoleColor(role.color) }"></span>
            <span class="role-name">{{ role.displayName }}</span>
          </div>
          <span class="role-count">{{ role.count }}</span>
        </div>
        <div class="progress-wrapper">
          <div class="progress-bar">
            <div
              class="progress-fill"
              :style="{ width: role.percentage + '%', backgroundColor: getRoleColor(role.color) }"
            ></div>
          </div>
          <span class="role-percentage">{{ (role.percentage || 0).toFixed(1) }}%</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, PropType } from 'vue'

interface RoleCount {
  citizen: number
  law_student: number
  paralegal: number
  lawyer: number
  advocate: number
  law_firm: number
}

const props = defineProps({
  roleCounts: {
    type: Object as PropType<RoleCount | null>,
    default: null,
  },
  loading: {
    type: Boolean,
    default: false,
  },
})

const roleStats = computed(() => {
  if (!props.roleCounts) return []

  const total = Object.values(props.roleCounts).reduce((sum, count) => sum + count, 0)

  return [
    {
      name: 'citizen',
      displayName: 'Citizens',
      count: props.roleCounts.citizen,
      percentage: total > 0 ? (props.roleCounts.citizen / total) * 100 : 0,
      color: 'primary',
    },
    {
      name: 'lawyer',
      displayName: 'Lawyers',
      count: props.roleCounts.lawyer,
      percentage: total > 0 ? (props.roleCounts.lawyer / total) * 100 : 0,
      color: 'success',
    },
    {
      name: 'advocate',
      displayName: 'Advocates',
      count: props.roleCounts.advocate,
      percentage: total > 0 ? (props.roleCounts.advocate / total) * 100 : 0,
      color: 'warning',
    },
    {
      name: 'law_student',
      displayName: 'Law Students',
      count: props.roleCounts.law_student,
      percentage: total > 0 ? (props.roleCounts.law_student / total) * 100 : 0,
      color: 'info',
    },
    {
      name: 'paralegal',
      displayName: 'Paralegals',
      count: props.roleCounts.paralegal,
      percentage: total > 0 ? (props.roleCounts.paralegal / total) * 100 : 0,
      color: 'danger',
    },
    {
      name: 'law_firm',
      displayName: 'Law Firms',
      count: props.roleCounts.law_firm,
      percentage: total > 0 ? (props.roleCounts.law_firm / total) * 100 : 0,
      color: 'secondary',
    },
  ].sort((a, b) => b.count - a.count)
})

const getRoleColor = (colorName: string) => {
  const colors: Record<string, string> = {
    primary: '#667eea',
    success: '#48bb78',
    warning: '#f6ad55',
    info: '#4299e1',
    danger: '#f56565',
    secondary: '#6b7280',
  }
  return colors[colorName] || colors.primary
}
</script>

<style scoped>
.role-card {
  background: white;
  border-radius: 16px;
  padding: 1.5rem;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
  border: 1px solid rgba(0, 0, 0, 0.06);
  height: 100%;
}

.card-title {
  font-size: 1.25rem;
  font-weight: 600;
  color: #1a1a1a;
  margin: 0 0 1.5rem 0;
}

.role-list {
  display: flex;
  flex-direction: column;
  gap: 1.25rem;
}

.role-item {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.role-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 0.25rem;
}

.role-info {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.role-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  flex-shrink: 0;
}

.role-name {
  font-weight: 500;
  font-size: 0.9rem;
  color: #374151;
}

.role-count {
  font-weight: 700;
  font-size: 1rem;
  color: #1a1a1a;
  letter-spacing: -0.01em;
}

.progress-wrapper {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.progress-bar {
  flex: 1;
  height: 8px;
  background: #e5e7eb;
  border-radius: 10px;
  overflow: hidden;
}

.progress-fill {
  height: 100%;
  border-radius: 10px;
  transition: width 0.6s ease;
}

.role-percentage {
  font-size: 0.75rem;
  color: #6b7280;
  font-weight: 600;
  min-width: 42px;
  text-align: right;
}
</style>
