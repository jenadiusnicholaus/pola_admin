<template>
  <div class="recover-container">
    <VaForm ref="passwordForm" class="recover-form" @submit.prevent="submit">
      <div class="form-header">
        <div class="icon-wrapper">
          <VaIcon name="lock_reset" size="3rem" color="primary" />
        </div>
        <h1 class="form-title">Forgot Password?</h1>
        <p class="form-subtitle">Enter your email address and we'll send you a 6-digit code to reset your password.</p>
      </div>

      <div class="form-body">
        <VaInput
          v-model="email"
          :rules="[(v) => !!v || 'Email field is required', (v) => /.+@.+\..+/.test(v) || 'Email should be valid']"
          class="form-input"
          label="Email Address"
          type="email"
          placeholder="Enter your registered email"
          :disabled="loading"
        >
          <template #prependInner>
            <VaIcon name="email" color="secondary" />
          </template>
        </VaInput>

        <VaButton type="submit" class="submit-btn" size="large" :loading="loading" :disabled="loading">
          <VaIcon name="send" class="mr-2" />
          Send Reset Code
        </VaButton>

        <RouterLink :to="{ name: 'login' }" class="back-link">
          <VaButton preset="secondary" class="w-full" size="large">
            <VaIcon name="arrow_back" class="mr-2" />
            Back to Login
          </VaButton>
        </RouterLink>
      </div>
    </VaForm>
  </div>
</template>

<script lang="ts" setup>
import { ref } from 'vue'
import { useForm, useToast } from 'vuestic-ui'
import { useRouter } from 'vue-router'
import { passwordResetService } from '../../services/passwordResetService'

const email = ref('')
const loading = ref(false)
const form = useForm('passwordForm')
const router = useRouter()
const { init } = useToast()

const submit = async () => {
  if (!form.validate()) return
  loading.value = true
  try {
    const result = await passwordResetService.requestReset(email.value)
    sessionStorage.setItem('pola_reset_email', email.value.trim().toLowerCase())
    sessionStorage.removeItem('pola_reset_debug_otp')
    init({ message: result.message || 'Reset code sent if the account exists.', color: 'success' })
    router.push({ name: 'recover-password-email' })
  } catch (error: any) {
    const message =
      error?.response?.data?.detail ||
      error?.response?.data?.message ||
      'Failed to request password reset. Please try again.'
    init({ message, color: 'danger' })
  } finally {
    loading.value = false
  }
}
</script>

<style scoped>
.recover-container {
  width: 100%;
  max-width: 480px;
  margin: 0 auto;
}

.recover-form {
  background: var(--va-background-element);
  border-radius: 16px;
  padding: 3rem;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
}

.form-header {
  text-align: center;
  margin-bottom: 2.5rem;
}

.icon-wrapper {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 80px;
  height: 80px;
  border-radius: 50%;
  background: linear-gradient(135deg, rgba(245, 158, 11, 0.1) 0%, rgba(217, 119, 6, 0.1) 100%);
  margin: 0 auto 1.5rem;
}

.form-title {
  font-size: 2rem;
  font-weight: 700;
  color: var(--va-text-primary);
  margin: 0 0 0.75rem 0;
  background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.form-subtitle {
  font-size: 0.9375rem;
  color: var(--va-text-secondary);
  margin: 0;
  line-height: 1.6;
}

.form-body {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.submit-btn {
  width: 100%;
}

.back-link {
  text-decoration: none;
}
</style>
