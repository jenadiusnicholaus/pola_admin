<template>
  <VaCard class="stat-card">
    <VaCardContent>
      <div class="stat-header">
        <div class="stat-icon" :style="{ backgroundColor: iconBgColor }">
          <VaIcon :name="icon" :color="iconColor" size="large" />
        </div>
        <VaBadge v-if="badge" :text="badge" :color="badgeColor" />
      </div>
      <div class="stat-body">
        <div class="stat-value">{{ value }}</div>
        <div class="stat-label">{{ label }}</div>
        <div v-if="subtext" class="stat-subtext">{{ subtext }}</div>
      </div>
    </VaCardContent>
  </VaCard>
</template>

<script setup lang="ts">
interface Props {
  icon: string
  iconColor?: string
  iconBgColor?: string
  value: string | number
  label: string
  subtext?: string
  badge?: string
  badgeColor?: string
}

withDefaults(defineProps<Props>(), {
  iconColor: 'primary',
  iconBgColor: 'rgba(var(--va-primary), 0.1)',
  subtext: undefined,
  badge: undefined,
  badgeColor: 'primary',
})
</script>

<style scoped>
.stat-card {
  height: 100%;
  transition: transform 0.2s;
}

.stat-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.stat-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 1rem;
}

.stat-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 60px;
  height: 60px;
  border-radius: 12px;
}

.stat-body {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.stat-value {
  font-size: 2rem;
  font-weight: 700;
  color: var(--va-text-primary);
  line-height: 1.2;
}

.stat-label {
  font-size: 0.875rem;
  color: var(--va-text-secondary);
  font-weight: 500;
}

.stat-subtext {
  font-size: 0.75rem;
  color: var(--va-text-secondary);
  margin-top: 0.25rem;
}
</style>
