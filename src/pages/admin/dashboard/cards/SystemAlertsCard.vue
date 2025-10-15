<template>
  <div v-if="alerts.length > 0" class="alerts-container">
    <div v-for="alert in alerts" :key="alert.id" class="alert-card" :class="`alert-${alert.type}`">
      <div class="alert-content">
        <div class="alert-icon">
          <VaIcon :name="getAlertIcon(alert.type)" size="small" />
        </div>
        <div class="alert-text">
          <div class="alert-title">{{ alert.title }}</div>
          <div class="alert-message">{{ alert.message }}</div>
        </div>
      </div>
      <button v-if="alert.closeable" class="alert-close" @click="$emit('closeAlert', alert.id)">
        <VaIcon name="close" size="small" />
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { PropType } from 'vue'

interface Alert {
  id: string
  type: 'info' | 'success' | 'warning' | 'danger'
  title: string
  message: string
  closeable: boolean
}

defineProps({
  alerts: {
    type: Array as PropType<Alert[]>,
    default: () => [],
  },
})

defineEmits<{
  (event: 'closeAlert', id: string): void
}>()

const getAlertIcon = (type: string) => {
  const icons: Record<string, string> = {
    info: 'info',
    success: 'check_circle',
    warning: 'warning',
    danger: 'error',
  }
  return icons[type] || 'info'
}
</script>

<style scoped>
.alerts-container {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  margin-bottom: 0.5rem;
}

.alert-card {
  display: flex;
  align-items: flex-start;
  gap: 1rem;
  padding: 1rem 1.25rem;
  border-radius: 12px;
  border-left: 3px solid;
}

.alert-info {
  background: #eff6ff;
  border-left-color: #667eea;
  color: #1e3a8a;
}

.alert-success {
  background: #f0fdf4;
  border-left-color: #48bb78;
  color: #14532d;
}

.alert-warning {
  background: #fffbeb;
  border-left-color: #f6ad55;
  color: #78350f;
}

.alert-danger {
  background: #fef2f2;
  border-left-color: #f56565;
  color: #7f1d1d;
}

.alert-content {
  display: flex;
  align-items: flex-start;
  gap: 0.75rem;
  flex: 1;
}

.alert-icon {
  flex-shrink: 0;
  margin-top: 0.1rem;
}

.alert-icon :deep(.va-icon) {
  opacity: 1 !important;
  font-size: 20px;
}

.alert-text {
  flex: 1;
}

.alert-title {
  font-weight: 600;
  font-size: 0.9rem;
  margin-bottom: 0.25rem;
}

.alert-message {
  font-size: 0.85rem;
  opacity: 0.9;
  line-height: 1.4;
}

.alert-close {
  background: transparent;
  border: none;
  cursor: pointer;
  padding: 0.25rem;
  border-radius: 6px;
  transition: background 0.2s;
  flex-shrink: 0;
}

.alert-close :deep(.va-icon) {
  opacity: 1 !important;
  font-size: 18px;
}

.alert-close:hover {
  background: rgba(0, 0, 0, 0.05);
}
</style>
