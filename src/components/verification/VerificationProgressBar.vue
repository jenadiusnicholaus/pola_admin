<template>
  <div class="progress-overview">
    <div class="progress-bar-section">
      <div class="progress-info">
        <span class="progress-label">Overall Progress</span>
        <span class="progress-percentage">{{ progress }}%</span>
      </div>
      <VaProgressBar :model-value="progress" :color="progressColor" size="large" class="main-progress-bar" />
    </div>
    <div class="current-step-info">
      <VaChip :color="stepColor" size="small">
        {{ currentStepDisplay }}
      </VaChip>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'

interface Props {
  progress: number
  currentStepDisplay: string
}

const props = defineProps<Props>()

const progressColor = computed(() => {
  if (props.progress >= 100) return 'success'
  if (props.progress >= 80) return 'info'
  if (props.progress >= 60) return 'primary'
  if (props.progress >= 40) return 'warning'
  return 'danger'
})

const stepColor = computed(() => {
  if (props.progress >= 100) return 'success'
  if (props.progress >= 80) return 'primary'
  if (props.progress >= 60) return 'info'
  if (props.progress >= 40) return 'warning'
  return 'secondary'
})
</script>

<style scoped>
.progress-overview {
  background: #f8fafc;
  border-radius: 8px;
  padding: 1.5rem;
  margin-bottom: 2rem;
  border: 1px solid rgba(0, 0, 0, 0.05);
}

.progress-bar-section {
  margin-bottom: 1rem;
}

.progress-info {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 0.75rem;
}

.progress-label {
  font-weight: 600;
  color: #374151;
}

.progress-percentage {
  font-weight: 700;
  color: #1f2937;
  font-size: 1.1rem;
}

.main-progress-bar {
  border-radius: 6px;
  overflow: hidden;
}

.current-step-info {
  display: flex;
  justify-content: center;
}
</style>
