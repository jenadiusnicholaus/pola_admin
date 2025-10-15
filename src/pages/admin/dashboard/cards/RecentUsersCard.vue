<template>
  <div class="recent-users-card">
    <div class="card-header">
      <h2 class="card-title">Recent Registrations</h2>
      <VaButton preset="plain" size="small" color="#667eea" @click="$emit('viewAll')"> View All → </VaButton>
    </div>
    <div v-if="loading" class="flex justify-center py-12">
      <VaProgressCircle indeterminate />
    </div>
    <div v-else-if="!users || users.length === 0" class="empty-state">
      <VaIcon name="person_outline" size="large" color="#9ca3af" />
      <div class="empty-text">No recent registrations</div>
    </div>
    <div v-else class="users-list">
      <div v-for="user in users" :key="user.id" class="user-row">
        <div class="user-avatar">
          <VaAvatar size="small" :color="getAvatarColor(user.email)">
            {{ getInitials(user.first_name, user.last_name) }}
          </VaAvatar>
        </div>
        <div class="user-details">
          <div class="user-name">{{ user.first_name }} {{ user.last_name }}</div>
          <div class="user-email">{{ user.email }}</div>
        </div>
        <div class="user-meta">
          <span class="user-role" :style="{ color: getRoleColorDark(user.user_role?.role_name) }">
            {{ formatRoleName(user.user_role?.role_name) || 'No Role' }}
          </span>
          <div class="user-date">{{ formatDate(user.date_joined) }}</div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { PropType } from 'vue'
import type { AdminUser } from '../../../../services/adminUserService'

defineProps({
  users: {
    type: Array as PropType<AdminUser[]>,
    default: () => [],
  },
  loading: {
    type: Boolean,
    default: false,
  },
})

defineEmits<{
  (event: 'viewAll'): void
}>()

const getInitials = (firstName: string, lastName: string) => {
  return `${firstName?.charAt(0) || ''}${lastName?.charAt(0) || ''}`.toUpperCase()
}

const getAvatarColor = (email: string) => {
  const colors = ['#667eea', '#48bb78', '#4299e1', '#f6ad55', '#6b7280']
  const index = email.charCodeAt(0) % colors.length
  return colors[index]
}

const getRoleColorDark = (role?: string) => {
  const roleColors: Record<string, string> = {
    citizen: '#667eea',
    law_student: '#4299e1',
    paralegal: '#6b7280',
    lawyer: '#48bb78',
    advocate: '#f6ad55',
    law_firm: '#f56565',
  }
  return roleColors[role || ''] || '#6b7280'
}

const formatRoleName = (role?: string) => {
  if (!role) return ''
  return role
    .split('_')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ')
}

const formatDate = (dateString: string) => {
  const date = new Date(dateString)
  const now = new Date()
  const diffMs = now.getTime() - date.getTime()
  const diffMins = Math.floor(diffMs / 60000)
  const diffHours = Math.floor(diffMs / 3600000)
  const diffDays = Math.floor(diffMs / 86400000)

  if (diffMins < 60) {
    return `${diffMins}m ago`
  } else if (diffHours < 24) {
    return `${diffHours}h ago`
  } else if (diffDays < 7) {
    return `${diffDays}d ago`
  } else {
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
  }
}
</script>

<style scoped>
.recent-users-card {
  background: white;
  border-radius: 16px;
  padding: 1.5rem;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
  border: 1px solid rgba(0, 0, 0, 0.06);
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.5rem;
}

.card-title {
  font-size: 1.25rem;
  font-weight: 600;
  color: #1a1a1a;
  margin: 0;
}

.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 3rem 1rem;
  gap: 0.75rem;
}

.empty-text {
  color: #9ca3af;
  font-size: 0.9rem;
}

.users-list {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.user-row {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 1rem;
  background: #fafafa;
  border-radius: 10px;
  transition: all 0.2s;
  border: 1px solid transparent;
}

.user-row:hover {
  background: #f5f5f5;
  border-color: rgba(0, 0, 0, 0.06);
  transform: translateX(4px);
}

.user-avatar {
  flex-shrink: 0;
}

.user-details {
  flex: 1;
  min-width: 0;
}

.user-name {
  font-weight: 600;
  font-size: 0.9rem;
  color: #1a1a1a;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  margin-bottom: 0.15rem;
}

.user-email {
  font-size: 0.75rem;
  color: #6b7280;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.user-meta {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 0.25rem;
  flex-shrink: 0;
}

.user-role {
  font-size: 0.75rem;
  font-weight: 600;
  padding: 0.25rem 0.5rem;
  background: rgba(102, 126, 234, 0.08);
  border-radius: 6px;
}

.user-date {
  font-size: 0.7rem;
  color: #9ca3af;
  font-weight: 500;
}
</style>
