<template>
  <div class="check-email-container">
    <VaForm ref="confirmForm" class="check-email-card" @submit.prevent="submit">
      <div class="icon-wrapper">
        <VaIcon name="mark_email_read" size="4rem" color="success" />
      </div>

      <div class="card-header">
        <h1 class="card-title">Enter Reset Code</h1>
        <p class="card-subtitle">
          We sent a 6-digit code to <strong>{{ email || 'your email' }}</strong
          >.
        </p>
      </div>

      <div class="form-fields">
        <VaInput
          v-model="otp"
          label="6-digit OTP"
          placeholder="Enter code"
          :rules="[(v) => !!v || 'OTP is required', (v) => /^\d{6}$/.test(v) || 'Enter a 6-digit code']"
          :disabled="loading"
        />
        <VaInput
          v-model="newPassword"
          type="password"
          label="New Password"
          :rules="[(v) => !!v || 'Password is required', (v) => v.length >= 8 || 'At least 8 characters']"
          :disabled="loading"
        />
        <VaInput
          v-model="confirmPassword"
          type="password"
          label="Confirm Password"
          :rules="[(v) => !!v || 'Confirm your password', (v) => v === newPassword || 'Passwords do not match']"
          :disabled="loading"
        />
      </div>

      <div class="actions">
        <VaButton type="submit" class="w-full" size="large" :loading="loading" :disabled="loading">
          Reset Password
        </VaButton>
        <RouterLink :to="{ name: 'login' }" class="action-link">
          <VaButton preset="secondary" class="w-full" size="large">Back to Login</VaButton>
        </RouterLink>
      </div>

      <div class="help-section">
        <p class="help-text">
          Didn't receive the code?
          <a href="#" class="help-link" @click.prevent="resendEmail">Resend code</a>
        </p>
      </div>
    </VaForm>
  </div>
</template>

<script lang="ts" setup>
import { onMounted, ref } from 'vue'
import { useForm, useToast } from 'vuestic-ui'
import { useRouter } from 'vue-router'
import { passwordResetService } from '../../services/passwordResetService'

const email = ref('')
const otp = ref('')
const newPassword = ref('')
const confirmPassword = ref('')
const loading = ref(false)
const form = useForm('confirmForm')
const router = useRouter()
const { init } = useToast()

onMounted(() => {
  email.value = sessionStorage.getItem('pola_reset_email') || ''
  sessionStorage.removeItem('pola_reset_debug_otp')
  if (!email.value) {
    init({ message: 'Start from the forgot password page.', color: 'warning' })
    router.replace({ name: 'recover-password' })
  }
})

const submit = async () => {
  if (!form.validate() || !email.value) return
  loading.value = true
  try {
    const result = await passwordResetService.confirmReset({
      email: email.value,
      otp: otp.value,
      new_password: newPassword.value,
      new_password_confirm: confirmPassword.value,
    })
    sessionStorage.removeItem('pola_reset_email')
    sessionStorage.removeItem('pola_reset_debug_otp')
    init({ message: result.message || 'Password reset successful.', color: 'success' })
    router.push({ name: 'login' })
  } catch (error: any) {
    const data = error?.response?.data
    let message = 'Failed to reset password.'
    if (typeof data?.detail === 'string') message = data.detail
    else if (data?.new_password_confirm?.[0]) message = data.new_password_confirm[0]
    else if (data?.otp?.[0]) message = data.otp[0]
    init({ message, color: 'danger' })
  } finally {
    loading.value = false
  }
}

const resendEmail = async () => {
  if (!email.value) return
  try {
    await passwordResetService.requestReset(email.value)
    otp.value = ''
    sessionStorage.removeItem('pola_reset_debug_otp')
    init({ message: 'Reset code has been resent.', color: 'success' })
  } catch {
    init({ message: 'Could not resend code. Try again shortly.', color: 'danger' })
  }
}
</script>

<style scoped>
.check-email-container {
  width: 100%;
  max-width: 520px;
  margin: 0 auto;
}

.check-email-card {
  background: var(--va-background-element);
  border-radius: 16px;
  padding: 3rem;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
  text-align: center;
}

.icon-wrapper {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 100px;
  height: 100px;
  border-radius: 50%;
  background: linear-gradient(135deg, rgba(16, 185, 129, 0.1) 0%, rgba(5, 150, 105, 0.1) 100%);
  margin: 0 auto 2rem;
}

.card-header {
  margin-bottom: 2rem;
}

.card-title {
  font-size: 2rem;
  font-weight: 700;
  margin: 0 0 0.75rem;
}

.card-subtitle {
  color: var(--va-text-secondary);
  margin: 0;
}

.form-fields {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  text-align: left;
  margin-bottom: 1.5rem;
}

.actions {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.action-link {
  text-decoration: none;
}

.help-section {
  margin-top: 1.5rem;
}

.help-text {
  color: var(--va-text-secondary);
  font-size: 0.9rem;
}

.help-link {
  color: var(--va-primary);
  font-weight: 600;
  text-decoration: none;
}
</style>
