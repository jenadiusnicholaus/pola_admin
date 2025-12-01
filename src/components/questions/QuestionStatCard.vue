<template>
  <VaCard class="question-stat-card">
    <VaCardContent class="stat-content">
      <div class="stat-icon" :style="{ backgroundColor: iconBgColor }">
        <VaIcon :name="icon" :color="iconColor" size="large" />
      </div>
      <div class="stat-details">
        <div class="stat-value">{{ value }}</div>
        <div class="stat-label">{{ label }}</div>
        <div v-if="subtext" class="stat-subtext">{{ subtext }}</div>
      </div>
      <VaBadge v-if="badge" :text="badge" :color="badgeColor" class="stat-badge" />
    </VaCardContent>
  </VaCard>
</template>

<script setup lang="ts">
interface Props {
  icon: string
  iconColor?: string
  iconBgColor?: string
  value: number | string
  label: string
  subtext?: string
  badge?: string
  badgeColor?: string
}

withDefaults(defineProps<Props>(), {
  iconColor: 'primary',
  iconBgColor: 'rgba(var(--va-primary), 0.1)',
  badgeColor: 'primary',
})
</script>

<style scoped>
.question-stat-card {
  height: 100%;
  transition:
    transform 0.2s,
    box-shadow 0.2s;
}

.question-stat-card:hover {
  transform: translateY(-2px);
  box-shadow: var(--va-box-shadow);
}

.stat-content {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 1.5rem;
  position: relative;
}

.stat-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 60px;
  height: 60px;
  border-radius: 12px;
  flex-shrink: 0;
}

.stat-details {
  flex: 1;
  min-width: 0;
}

.stat-value {
  font-size: 2rem;
  font-weight: 700;
  line-height: 1;
  margin-bottom: 0.25rem;
  color: var(--va-text-primary);
}

.stat-label {
  font-size: 0.875rem;
  font-weight: 500;
  color: var(--va-text-secondary);
  margin-bottom: 0.25rem;
}

.stat-subtext {
  font-size: 0.75rem;
  color: var(--va-text-secondary);
}

.stat-badge {
  position: absolute;
  top: 1rem;
  right: 1rem;
}
</style>
