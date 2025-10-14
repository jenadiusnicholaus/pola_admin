<template>
  <div class="simple-stepper">
    <h2>Verification Progress</h2>
    <p class="subtitle">
      Current Progress: <strong>{{ currentProgress }}%</strong> -
      <span :class="getProgressStatusClass()">{{ getProgressStatus() }}</span>
    </p>

    <div class="steps">
      <div
        v-for="step in steps"
        :key="step.key"
        :class="[
          'step',
          {
            'step-active': isCurrentStep(step.key),
            'step-completed': isStepCompleted(step.key),
            'step-pending': !isStepCompleted(step.key) && !isCurrentStep(step.key),
          },
        ]"
      >
        <div class="step-number">
          <VaIcon v-if="isStepCompleted(step.key)" name="check_circle" size="1.5rem" color="success" />
          <VaIcon v-else-if="isCurrentStep(step.key)" name="play_circle" size="1.5rem" color="primary" />
          <VaIcon v-else name="radio_button_unchecked" size="1.5rem" color="secondary" />
        </div>
        <div class="step-content">
          <h3>{{ step.title }}</h3>
          <p>{{ step.description }}</p>
        </div>
        <div class="step-status">
          <VaBadge v-if="isStepCompleted(step.key)" color="success" size="small">
            <VaIcon name="check" size="small" /> Completed
          </VaBadge>
          <VaBadge v-else-if="isCurrentStep(step.key)" color="primary" size="small">
            <VaIcon name="sync" size="small" /> In Progress
          </VaBadge>
          <VaBadge v-else color="secondary" size="small"> Pending </VaBadge>
        </div>
      </div>
    </div>

    <div v-if="currentProgress === 100" class="completion-message">
      <VaAlert color="success" border="left" border-color="success">
        <template #icon>
          <VaIcon name="check_circle" size="large" />
        </template>
        <div>
          <h4>Verification Complete!</h4>
          <p>All verification steps have been successfully completed.</p>
        </div>
      </VaAlert>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { VerificationUser } from '../../services/verificationService'

// Props
interface Props {
  userId: string | number
  verification?: VerificationUser | null
}

const props = defineProps<Props>()

// Verification steps definition
const steps = [
  {
    key: 'documents',
    title: 'Document Verification',
    description: 'Review and verify uploaded documents',
  },
  {
    key: 'identity',
    title: 'Identity Verification',
    description: 'Verify personal identity information',
  },
  {
    key: 'contact',
    title: 'Contact Verification',
    description: 'Verify contact information',
  },
  {
    key: 'role_specific',
    title: 'Role-Specific Verification',
    description: 'Complete role-based requirements',
  },
  {
    key: 'final',
    title: 'Final Approval',
    description: 'Final review and approval',
  },
]

// Computed properties
const currentProgress = computed(() => {
  return props.verification?.progress || 0
})

const getCurrentStep = () => {
  return props.verification?.current_step || 'documents'
}

const isCurrentStep = (stepKey: string) => {
  return getCurrentStep() === stepKey
}

const isStepCompleted = (stepKey: string) => {
  const currentStepKey = getCurrentStep()
  const currentStepIndex = steps.findIndex((s) => s.key === currentStepKey)
  const stepIndex = steps.findIndex((s) => s.key === stepKey)

  // If current progress is 100%, all steps are completed
  if (currentProgress.value === 100) {
    return true
  }

  // Step is completed if it's before the current step
  return stepIndex < currentStepIndex
}

const getProgressStatus = () => {
  const progress = currentProgress.value
  if (progress === 100) return 'Completed'
  if (progress >= 80) return 'Almost Complete'
  if (progress >= 60) return 'In Progress'
  if (progress >= 40) return 'Getting Started'
  if (progress > 0) return 'Just Started'
  return 'Not Started'
}

const getProgressStatusClass = () => {
  const progress = currentProgress.value
  if (progress === 100) return 'status-complete'
  if (progress >= 60) return 'status-progress'
  if (progress > 0) return 'status-started'
  return 'status-pending'
}
</script>

<style scoped>
.simple-stepper {
  padding: 2rem;
  background: white;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.simple-stepper h2 {
  margin: 0 0 0.5rem 0;
  color: #1f2937;
  font-size: 1.5rem;
}

.subtitle {
  color: #6b7280;
  margin: 0 0 2rem 0;
}

.subtitle strong {
  color: #1f2937;
  font-size: 1.1rem;
}

.status-complete {
  color: #059669;
  font-weight: 600;
}

.status-progress {
  color: #3b82f6;
  font-weight: 600;
}

.status-started {
  color: #f59e0b;
  font-weight: 600;
}

.status-pending {
  color: #6b7280;
  font-weight: 600;
}

.steps {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  margin-bottom: 2rem;
}

.step {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 1rem;
  border: 2px solid #e5e7eb;
  border-radius: 8px;
  transition:
    border-color 0.3s ease,
    box-shadow 0.3s ease,
    background-color 0.3s ease;
}

.step-active {
  border-color: #3b82f6;
  background-color: #eff6ff;
  box-shadow: 0 2px 8px rgba(59, 130, 246, 0.15);
}

.step-completed {
  border-color: #10b981;
  background-color: #ecfdf5;
}

.step-pending {
  opacity: 0.7;
  background-color: #fafafa;
}

.step-number {
  flex-shrink: 0;
  display: flex;
  align-items: center;
  justify-content: center;
}

.step-content {
  flex: 1;
}

.step-content h3 {
  margin: 0 0 0.25rem 0;
  color: #1f2937;
  font-size: 1rem;
  font-weight: 600;
}

.step-content p {
  margin: 0;
  color: #6b7280;
  font-size: 0.875rem;
}

.step-status {
  margin-left: auto;
  flex-shrink: 0;
}

.completion-message {
  margin-top: 1rem;
}

.completion-message h4 {
  margin: 0 0 0.5rem 0;
  font-size: 1.125rem;
  font-weight: 600;
}

.completion-message p {
  margin: 0;
  font-size: 0.875rem;
}

@media (max-width: 768px) {
  .simple-stepper {
    padding: 1.5rem;
  }

  .step {
    flex-direction: column;
    align-items: flex-start;
    gap: 0.75rem;
  }

  .step-status {
    margin-left: 0;
    align-self: flex-start;
  }

  .step-number {
    align-self: center;
  }
}
</style>
