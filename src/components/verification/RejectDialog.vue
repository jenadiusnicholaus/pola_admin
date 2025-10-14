<template>
  <VaModal
    :model-value="modelValue"
    :title="title"
    size="medium"
    @update:modelValue="$emit('update:modelValue', $event)"
  >
    <div class="reject-dialog-content">
      <VaAlert color="warning" class="mb-4">
        <div class="flex items-center gap-3">
          <VaIcon name="warning" />
          <div>
            <p class="font-semibold">{{ warningTitle }}</p>
            <p class="text-sm">{{ warningMessage }}</p>
          </div>
        </div>
      </VaAlert>

      <VaInput
        :model-value="reason"
        label="Reason for Rejection *"
        :placeholder="placeholder"
        type="textarea"
        rows="4"
        class="mb-4"
        :rules="[(v) => !!v || 'Reason is required']"
        @update:modelValue="$emit('update:reason', $event)"
      />

      <div class="flex gap-3 justify-end">
        <VaButton preset="outline" @click="$emit('update:modelValue', false)"> Cancel </VaButton>
        <VaButton color="danger" icon="close" :disabled="!reason.trim()" @click="$emit('confirm')"> Reject </VaButton>
      </div>
    </div>
  </VaModal>
</template>

<script setup lang="ts">
interface Props {
  modelValue: boolean
  title: string
  warningTitle: string
  warningMessage: string
  placeholder: string
  reason: string
}

defineProps<Props>()

defineEmits<{
  'update:modelValue': [value: boolean]
  'update:reason': [value: string]
  confirm: []
}>()
</script>

<style scoped>
.reject-dialog-content {
  padding: 0;
}
</style>
