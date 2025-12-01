<template>
  <VaModal v-model="isOpen" title="Question Details" size="large" hide-default-actions @update:modelValue="handleClose">
    <div v-if="question && question.asker_info" class="question-details">
      <!-- Asker Information -->
      <VaCard class="mb-4">
        <VaCardTitle>
          <VaIcon name="person" class="mr-2" />
          Asker Information
        </VaCardTitle>
        <VaCardContent>
          <div class="detail-grid">
            <div class="detail-item">
              <span class="detail-label">Name:</span>
              <span class="detail-value">{{ question.asker_info.full_name }}</span>
            </div>
            <div class="detail-item">
              <span class="detail-label">Email:</span>
              <span class="detail-value">{{ question.asker_info.email }}</span>
            </div>
            <div class="detail-item">
              <span class="detail-label">Verified:</span>
              <VaBadge
                :text="question.asker_info.is_verified ? 'Verified' : 'Not Verified'"
                :color="question.asker_info.is_verified ? 'success' : 'warning'"
              />
            </div>
          </div>
        </VaCardContent>
      </VaCard>

      <!-- Material Information -->
      <VaCard class="mb-4">
        <VaCardTitle>
          <VaIcon name="book" class="mr-2" />
          Learning Material
        </VaCardTitle>
        <VaCardContent>
          <div class="detail-grid">
            <div class="detail-item full-width">
              <span class="detail-label">Title:</span>
              <span class="detail-value">{{ question.material_title }}</span>
            </div>
            <div class="detail-item">
              <span class="detail-label">Material ID:</span>
              <span class="detail-value">{{ question.material }}</span>
            </div>
          </div>
        </VaCardContent>
      </VaCard>

      <!-- Question & Answer -->
      <VaCard class="mb-4">
        <VaCardTitle>
          <VaIcon name="help" class="mr-2" />
          Question & Answer
        </VaCardTitle>
        <VaCardContent>
          <div class="qa-section">
            <div class="question-section">
              <div class="section-header">Question:</div>
              <div class="question-text">{{ question.question_text }}</div>
            </div>

            <VaDivider />

            <div v-if="question.answer_text" class="answer-section">
              <div class="section-header">Answer:</div>
              <div class="answer-text">{{ question.answer_text }}</div>
              <div v-if="question.answerer_info" class="answer-meta">
                <VaAvatar size="small" color="success">
                  <VaIcon name="person" />
                </VaAvatar>
                <span> Answered by {{ question.answerer_info.full_name || question.answerer_info.email }} </span>
                <span class="answered-time">{{ formatDate(question.answered_at) }}</span>
              </div>
            </div>

            <div v-else class="no-answer">
              <VaIcon name="info" color="warning" />
              <span>No answer provided yet</span>
            </div>
          </div>
        </VaCardContent>
      </VaCard>

      <!-- Status & Metadata -->
      <VaCard>
        <VaCardTitle>
          <VaIcon name="info" class="mr-2" />
          Status & Metadata
        </VaCardTitle>
        <VaCardContent>
          <div class="detail-grid">
            <div class="detail-item">
              <span class="detail-label">Status:</span>
              <VaBadge :text="question.status" :color="getStatusColor(question.status)" />
            </div>
            <div class="detail-item">
              <span class="detail-label">Helpful Count:</span>
              <VaChip size="small" color="success">
                <VaIcon name="thumb_up" size="small" class="mr-1" />
                {{ question.helpful_count }}
              </VaChip>
            </div>
            <div class="detail-item">
              <span class="detail-label">Created:</span>
              <span class="detail-value">{{ formatDate(question.created_at) }}</span>
            </div>
            <div class="detail-item">
              <span class="detail-label">Updated:</span>
              <span class="detail-value">{{ formatDate(question.updated_at) }}</span>
            </div>
            <div v-if="question.is_answered_by_uploader" class="detail-item full-width">
              <VaBadge text="Answered by Material Uploader" color="info" />
            </div>
          </div>
        </VaCardContent>
      </VaCard>
    </div>

    <template #footer>
      <div class="modal-actions">
        <VaButton preset="secondary" @click="handleClose">Close</VaButton>
        <VaButton
          v-if="question && question.status === 'open'"
          color="success"
          icon="check"
          @click="$emit('answer', question)"
        >
          Answer
        </VaButton>
        <VaButton
          v-if="question && question.status === 'open'"
          color="danger"
          icon="block"
          @click="$emit('close', question.id)"
        >
          Close Question
        </VaButton>
        <VaButton
          v-if="question && question.status === 'closed'"
          color="primary"
          icon="refresh"
          @click="$emit('reopen', question.id)"
        >
          Reopen
        </VaButton>
      </div>
    </template>
  </VaModal>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { Question } from '../../services/questionService'

interface Props {
  modelValue: boolean
  question: Question | null
}

interface Emits {
  (e: 'update:modelValue', value: boolean): void
  (e: 'answer', question: Question): void
  (e: 'close', id: number): void
  (e: 'reopen', id: number): void
}

const props = defineProps<Props>()
const emit = defineEmits<Emits>()

const isOpen = computed({
  get: () => props.modelValue,
  set: (value) => emit('update:modelValue', value),
})

const handleClose = () => {
  emit('update:modelValue', false)
}

const getStatusColor = (status: string) => {
  switch (status) {
    case 'open':
      return 'warning'
    case 'answered':
      return 'success'
    case 'closed':
      return 'danger'
    default:
      return 'secondary'
  }
}

const formatDate = (dateString: string | null) => {
  if (!dateString) return 'N/A'
  return new Date(dateString).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}
</script>

<style scoped>
.question-details {
  max-height: 70vh;
  overflow-y: auto;
}

.detail-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1rem;
}

.detail-item {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.detail-item.full-width {
  grid-column: 1 / -1;
}

.detail-label {
  font-size: 0.875rem;
  font-weight: 600;
  color: var(--va-text-secondary);
}

.detail-value {
  font-size: 0.9375rem;
  color: var(--va-text-primary);
}

.qa-section {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.question-section,
.answer-section {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.section-header {
  font-size: 0.875rem;
  font-weight: 600;
  color: var(--va-text-secondary);
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.question-text {
  font-size: 1rem;
  line-height: 1.6;
  color: var(--va-text-primary);
  padding: 1rem;
  background: var(--va-background-element);
  border-radius: 8px;
  border-left: 4px solid var(--va-primary);
}

.answer-text {
  font-size: 1rem;
  line-height: 1.6;
  color: var(--va-text-primary);
  padding: 1rem;
  background: var(--va-background-element);
  border-radius: 8px;
  border-left: 4px solid var(--va-success);
}

.answer-meta {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  font-size: 0.875rem;
  color: var(--va-text-secondary);
}

.answered-time {
  margin-left: auto;
}

.no-answer {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 1rem;
  background: var(--va-background-element);
  border-radius: 8px;
  color: var(--va-text-secondary);
  font-style: italic;
}

.modal-actions {
  display: flex;
  gap: 0.75rem;
  justify-content: flex-end;
  flex-wrap: wrap;
}
</style>
