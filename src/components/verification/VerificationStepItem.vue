<template>
  <div class="verification-step-item">
    <div class="step-marker">
      <div class="step-number">
        <VaIcon v-if="completed" name="check" size="small" color="white" />
        <VaIcon v-else-if="current" name="play_arrow" size="small" color="white" />
        <span v-else class="step-index">{{ index + 1 }}</span>
      </div>
    </div>

    <div class="step-content">
      <h4 class="step-title">{{ step.title }}</h4>
      <p class="step-description">{{ step.description }}</p>

      <!-- Step Details Slot -->
      <div v-if="current || completed" class="step-details">
        <slot name="details"></slot>
      </div>

      <div class="step-status">
        <VaBadge v-if="completed" color="success" size="small"> Completed </VaBadge>
        <VaBadge v-else-if="current" color="primary" size="small"> In Progress </VaBadge>
        <VaBadge v-else color="secondary" size="small"> Pending </VaBadge>
      </div>

      <!-- Step Actions -->
      <div v-if="current && canVerify" class="step-actions">
        <VaButton color="success" size="small" icon="check" :loading="isVerifying" @click="$emit('verify')">
          Verify & Continue
        </VaButton>

        <VaButton color="danger" size="small" icon="close" preset="outline" @click="$emit('reject')">
          Reject Step
        </VaButton>
      </div>
    </div>

    <!-- Connection Line -->
    <div v-if="!isLast" class="connection-line" :class="{ completed: completed }"></div>
  </div>
</template>

<script setup lang="ts">
interface Step {
  key: string
  title: string
  description: string
}

interface Props {
  step: Step
  index: number
  current: boolean
  completed: boolean
  isLast: boolean
  canVerify: boolean
  isVerifying?: boolean
}

defineProps<Props>()

defineEmits<{
  verify: []
  reject: []
}>()
</script>

<style scoped>
.verification-step-item {
  position: relative;
  display: flex;
  align-items: flex-start;
  gap: 1rem;
  padding: 1rem 0;
  transition: all 0.3s ease;
}

.verification-step-item.completed {
  opacity: 0.8;
}

.verification-step-item.current {
  background: rgba(59, 130, 246, 0.05);
  border-radius: 8px;
  padding: 1rem;
  margin: 0 -1rem;
}

.step-marker {
  flex-shrink: 0;
  z-index: 2;
}

.step-number {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 600;
  font-size: 0.9rem;
  transition: all 0.3s ease;
  border: 2px solid transparent;
}

.verification-step-item.completed .step-number {
  background: #22c55e;
  color: white;
  border-color: #22c55e;
}

.verification-step-item.current .step-number {
  background: #3b82f6;
  color: white;
  border-color: #3b82f6;
  animation: pulse 2s infinite;
}

.verification-step-item.pending .step-number {
  background: #e5e7eb;
  color: #6b7280;
  border-color: #d1d5db;
}

.step-index {
  font-size: 0.9rem;
  font-weight: 600;
}

.step-content {
  flex: 1;
  min-width: 0;
}

.step-title {
  margin: 0 0 0.5rem 0;
  font-size: 1.1rem;
  font-weight: 600;
  color: #1f2937;
}

.step-description {
  margin: 0 0 0.75rem 0;
  color: #6b7280;
  font-size: 0.9rem;
  line-height: 1.4;
}

.step-details {
  margin-top: 1rem;
  padding: 1rem;
  background: #f8fafc;
  border-radius: 6px;
  border: 1px solid #e2e8f0;
}

.step-status {
  display: flex;
  gap: 0.5rem;
  margin-top: 0.75rem;
}

.step-actions {
  display: flex;
  gap: 0.75rem;
  margin-top: 1rem;
  padding-top: 0.75rem;
  border-top: 1px solid #e5e7eb;
}

.connection-line {
  position: absolute;
  left: 19px;
  top: 50px;
  width: 2px;
  height: calc(100% - 20px);
  background: #e5e7eb;
  transition: all 0.3s ease;
}

.connection-line.completed {
  background: #22c55e;
}

@keyframes pulse {
  0%,
  100% {
    box-shadow: 0 0 0 0 rgba(59, 130, 246, 0.4);
  }
  50% {
    box-shadow: 0 0 0 6px rgba(59, 130, 246, 0.1);
  }
}

@media (max-width: 768px) {
  .verification-step-item {
    gap: 0.75rem;
  }

  .step-number {
    width: 32px;
    height: 32px;
    font-size: 0.8rem;
  }

  .connection-line {
    left: 15px;
  }
}
</style>
