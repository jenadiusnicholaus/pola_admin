<script setup lang="ts">
import { ref, watch } from 'vue'
import type { AdminUser } from '../../../services/adminUserService'

const props = defineProps<{
  modelValue: boolean
  user: AdminUser | null
}>()

const emit = defineEmits<{
  (event: 'update:modelValue', value: boolean): void
  (event: 'assign', roleName: string): void
}>()

const selectedRole = ref<string>('')

const availableRoles = [
  { value: 'citizen', label: 'Citizen / Mwananchi' },
  { value: 'law_student', label: 'Law Student' },
  { value: 'paralegal', label: 'Paralegal' },
  { value: 'lawyer', label: 'Lawyer / Mwanasheria' },
  { value: 'advocate', label: 'Advocate' },
  { value: 'law_firm', label: 'Law Firm' },
]

watch(
  () => props.user,
  (newUser) => {
    if (newUser?.user_role?.role_name) {
      selectedRole.value = newUser.user_role.role_name
    } else {
      selectedRole.value = ''
    }
  },
  { immediate: true },
)

const handleAssign = () => {
  if (selectedRole.value) {
    emit('assign', selectedRole.value)
  }
}

const close = () => {
  emit('update:modelValue', false)
}
</script>

<template>
  <VaModal :model-value="modelValue" size="small" @update:modelValue="emit('update:modelValue', $event)">
    <template #header>
      <h2 class="va-h5">Assign Role</h2>
    </template>

    <div class="flex flex-col gap-4">
      <div v-if="user">
        <p class="text-sm text-secondary mb-2">
          Assigning role to: <strong>{{ user.first_name }} {{ user.last_name }}</strong>
        </p>
        <p class="text-sm text-secondary">Current role: {{ user.user_role?.get_role_display || 'No Role' }}</p>
      </div>

      <VaSelect
        v-model="selectedRole"
        label="Select Role"
        :options="availableRoles"
        text-by="label"
        value-by="value"
        placeholder="Choose a role"
      />

      <VaDivider />

      <div class="flex gap-2 justify-end">
        <VaButton preset="secondary" @click="close">Cancel</VaButton>
        <VaButton :disabled="!selectedRole" @click="handleAssign">Assign Role</VaButton>
      </div>
    </div>
  </VaModal>
</template>
