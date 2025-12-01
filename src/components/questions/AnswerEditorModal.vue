<template>
  <VaModal
    v-model="isOpen"
    title="Answer Question"
    size="large"
    ok-text="Submit Answer"
    :ok-disabled="!answerText.trim() || loading"
    :loading="loading"
    @ok="handleSubmit"
    @cancel="handleCancel"
  >
    <div v-if="question && question.asker_info" class="answer-editor">
      <!-- Question Preview -->
      <VaCard class="mb-4">
        <VaCardTitle>Question</VaCardTitle>
        <VaCardContent>
          <div class="question-preview">
            <div class="asker-info">
              <VaAvatar size="small" color="primary">
                <VaIcon name="person" />
              </VaAvatar>
              <div>
                <div class="asker-name">{{ question.asker_info.full_name }}</div>
                <div class="material-title">{{ question.material_title }}</div>
              </div>
            </div>
            <div class="question-text">{{ question.question_text }}</div>
          </div>
        </VaCardContent>
      </VaCard>

      <!-- Answer Input -->
      <VaCard>
        <VaCardTitle>Your Answer</VaCardTitle>
        <VaCardContent>
          <VaTextarea
            v-model="answerText"
            placeholder="Provide a detailed and helpful answer to this legal question..."
            :min-rows="8"
            :max-rows="15"
            :error="!!errorMessage"
            :error-messages="errorMessage ? [errorMessage] : []"
            counter
            @input="clearError"
          />

          <div class="editor-tips">
            <VaIcon name="info" size="small" color="info" />
            <span>
              Tip: Provide clear, accurate legal information. Include relevant laws, precedents, or jurisdictional
              considerations where applicable.
            </span>
          </div>

          <!-- Character Count -->
          <div class="char-count">
            <span :class="{ 'text-danger': answerText.length > 5000 }"> {{ answerText.length }} characters </span>
            <span v-if="answerText.length > 5000" class="text-danger"> (recommended: under 5000) </span>
          </div>
        </VaCardContent>
      </VaCard>
    </div>
  </VaModal>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import type { Question } from '../../services/questionService'

interface Props {
  modelValue: boolean
  question: Question | null
  loading?: boolean
}

interface Emits {
  (e: 'update:modelValue', value: boolean): void
  (e: 'submit', answerText: string): void
}

const props = withDefaults(defineProps<Props>(), {
  loading: false,
})

const emit = defineEmits<Emits>()

const answerText = ref('')
const errorMessage = ref('')

const isOpen = computed({
  get: () => props.modelValue,
  set: (value) => emit('update:modelValue', value),
})

watch(
  () => props.modelValue,
  (newValue) => {
    if (newValue) {
      answerText.value = props.question?.answer_text || ''
      errorMessage.value = ''
    }
  },
)

const clearError = () => {
  errorMessage.value = ''
}

const handleSubmit = () => {
  if (!answerText.value.trim()) {
    errorMessage.value = 'Answer text is required'
    return
  }

  if (answerText.value.length < 10) {
    errorMessage.value = 'Answer must be at least 10 characters long'
    return
  }

  emit('submit', answerText.value)
}

const handleCancel = () => {
  answerText.value = ''
  errorMessage.value = ''
  emit('update:modelValue', false)
}
</script>

<style scoped>
.answer-editor {
  max-height: 70vh;
  overflow-y: auto;
}

.question-preview {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.asker-info {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.asker-name {
  font-weight: 600;
  color: var(--va-text-primary);
}

.material-title {
  font-size: 0.875rem;
  color: var(--va-text-secondary);
}

.question-text {
  padding: 1rem;
  background: var(--va-background-element);
  border-radius: 8px;
  border-left: 4px solid var(--va-primary);
  line-height: 1.6;
  color: var(--va-text-primary);
}

.editor-tips {
  display: flex;
  align-items: flex-start;
  gap: 0.5rem;
  margin-top: 1rem;
  padding: 0.75rem;
  background: rgba(var(--va-info), 0.1);
  border-radius: 6px;
  font-size: 0.875rem;
  color: var(--va-text-secondary);
  line-height: 1.5;
}

.char-count {
  display: flex;
  justify-content: flex-end;
  align-items: center;
  gap: 0.5rem;
  margin-top: 0.5rem;
  font-size: 0.875rem;
  color: var(--va-text-secondary);
}

.text-danger {
  color: var(--va-danger);
}
</style>
