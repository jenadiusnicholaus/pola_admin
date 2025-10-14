<script setup lang="ts">
import { ref, watch } from 'vue'
import { useForm } from 'vuestic-ui'
import { validators } from '../../../services/utils'
import type { AdminUser } from '../../../services/adminUserService'

const props = defineProps<{
  modelValue: boolean
  user: AdminUser | null
  isEdit: boolean
}>()

const emit = defineEmits<{
  (event: 'update:modelValue', value: boolean): void
  (event: 'save', data: any): void
}>()

const { validate } = useForm('admin-user-form')

const formData = ref({
  email: '',
  password: '',
  confirmPassword: '',
  first_name: '',
  last_name: '',
  user_role: '',
  date_of_birth: '',
  is_staff: false,
})

const availableRoles = [
  { value: 'citizen', text: 'Citizen / Mwananchi' },
  { value: 'law_student', text: 'Law Student' },
  { value: 'paralegal', text: 'Paralegal' },
  { value: 'lawyer', text: 'Lawyer / Mwanasheria' },
  { value: 'advocate', text: 'Advocate' },
  { value: 'law_firm', text: 'Law Firm' },
]

watch(
  () => props.user,
  (newUser) => {
    if (newUser) {
      formData.value = {
        email: newUser.email || '',
        password: '',
        confirmPassword: '',
        first_name: newUser.first_name || '',
        last_name: newUser.last_name || '',
        user_role: newUser.user_role?.role_name || '',
        date_of_birth: newUser.date_of_birth || '',
        is_staff: newUser.is_staff || false,
      }
    } else {
      formData.value = {
        email: '',
        password: '',
        confirmPassword: '',
        first_name: '',
        last_name: '',
        user_role: '',
        date_of_birth: '',
        is_staff: false,
      }
    }
  },
  { immediate: true },
)

const passwordMatchRule = () => {
  if (!props.isEdit || formData.value.password) {
    return formData.value.password === formData.value.confirmPassword || 'Passwords must match'
  }
  return true
}

const handleSave = () => {
  if (validate()) {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { confirmPassword, password, ...cleanData } = formData.value

    // In edit mode, send cleanData without password fields
    // In create mode, add password back
    if (props.isEdit) {
      emit('save', cleanData)
    } else {
      emit('save', { ...cleanData, password: formData.value.password })
    }
  }
}

const close = () => {
  emit('update:modelValue', false)
}
</script>

<template>
  <VaModal
    :model-value="modelValue"
    size="medium"
    mobile-fullscreen
    @update:modelValue="emit('update:modelValue', $event)"
  >
    <template #header>
      <h2 class="va-h5">{{ isEdit ? 'Edit User' : 'Create New User' }}</h2>
    </template>

    <VaForm ref="admin-user-form" class="flex flex-col gap-4">
      <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
        <VaInput
          v-model="formData.first_name"
          label="First Name"
          placeholder="Enter first name"
          :rules="[validators.required]"
          required-mark
        />

        <VaInput
          v-model="formData.last_name"
          label="Last Name"
          placeholder="Enter last name"
          :rules="[validators.required]"
          required-mark
        />
      </div>

      <VaInput
        v-model="formData.email"
        label="Email"
        type="email"
        placeholder="Enter email address"
        :rules="[validators.required, validators.email]"
        required-mark
      />

      <div v-if="!isEdit" class="grid grid-cols-1 md:grid-cols-2 gap-4">
        <VaInput
          v-model="formData.password"
          label="Password"
          type="password"
          placeholder="Enter password"
          :rules="[validators.required]"
          required-mark
        />

        <VaInput
          v-model="formData.confirmPassword"
          label="Confirm Password"
          type="password"
          placeholder="Confirm password"
          :rules="[validators.required, passwordMatchRule]"
          required-mark
        />
      </div>

      <VaSelect
        v-model="formData.user_role"
        label="User Role"
        :options="availableRoles"
        placeholder="Select a role"
        text-by="text"
        value-by="value"
      />

      <VaInput v-model="formData.date_of_birth" label="Date of Birth" type="date" placeholder="Select date of birth" />

      <VaCheckbox v-model="formData.is_staff" label="Staff Member / Admin" class="mb-2">
        <template #label>
          <span class="ml-2">Staff Member / Admin</span>
          <span class="text-sm text-gray-500 ml-2">(Grant administrative privileges)</span>
        </template>
      </VaCheckbox>

      <VaDivider />

      <div class="flex gap-2 justify-end">
        <VaButton preset="secondary" @click="close">Cancel</VaButton>
        <VaButton @click="handleSave">{{ isEdit ? 'Update' : 'Create' }} User</VaButton>
      </div>
    </VaForm>
  </VaModal>
</template>
