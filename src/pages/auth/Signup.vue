<template>
  <div class="signup-container">
    <VaForm ref="form" class="signup-form" @submit.prevent="submit">
      <!-- Header -->
      <div class="form-header">
        <h1 class="form-title">Create Account</h1>
        <p class="form-subtitle">Join us and start managing your platform</p>
      </div>

      <!-- Form Fields -->
      <div class="form-body">
        <VaInput
          v-model="formData.email"
          :rules="[(v) => !!v || 'Email field is required', (v) => /.+@.+\..+/.test(v) || 'Email should be valid']"
          class="form-input"
          label="Email Address"
          type="email"
          placeholder="admin@example.com"
        >
          <template #prependInner>
            <VaIcon name="email" color="secondary" />
          </template>
        </VaInput>

        <VaValue v-slot="isPasswordVisible" :default-value="false">
          <VaInput
            ref="password1"
            v-model="formData.password"
            :rules="passwordRules"
            :type="isPasswordVisible.value ? 'text' : 'password'"
            class="form-input"
            label="Password"
            placeholder="Create a strong password"
            messages="Password should be 8+ characters: letters, numbers, and special characters."
            @clickAppendInner.stop="isPasswordVisible.value = !isPasswordVisible.value"
          >
            <template #prependInner>
              <VaIcon name="lock" color="secondary" />
            </template>
            <template #appendInner>
              <VaIcon
                :name="isPasswordVisible.value ? 'visibility_off' : 'visibility'"
                class="cursor-pointer"
                color="secondary"
              />
            </template>
          </VaInput>

          <VaInput
            ref="password2"
            v-model="formData.repeatPassword"
            :rules="[
              (v) => !!v || 'Repeat Password field is required',
              (v) => v === formData.password || 'Passwords don\'t match',
            ]"
            :type="isPasswordVisible.value ? 'text' : 'password'"
            class="form-input"
            label="Confirm Password"
            placeholder="Re-enter your password"
            @clickAppendInner.stop="isPasswordVisible.value = !isPasswordVisible.value"
          >
            <template #prependInner>
              <VaIcon name="verified_user" color="secondary" />
            </template>
            <template #appendInner>
              <VaIcon
                :name="isPasswordVisible.value ? 'visibility_off' : 'visibility'"
                class="cursor-pointer"
                color="secondary"
              />
            </template>
          </VaInput>
        </VaValue>

        <!-- Password Strength Indicator -->
        <div v-if="formData.password" class="password-strength">
          <div class="strength-bar">
            <div class="strength-fill" :class="passwordStrengthClass" :style="{ width: passwordStrengthWidth }"></div>
          </div>
          <p class="strength-text" :class="passwordStrengthClass">
            {{ passwordStrengthText }}
          </p>
        </div>

        <!-- Submit Button -->
        <VaButton type="submit" class="submit-btn" size="large">
          <VaIcon name="person_add" class="mr-2" />
          Create Account
        </VaButton>

        <!-- Divider -->
        <div class="divider">
          <span class="divider-text">Already have an account?</span>
        </div>

        <!-- Login Link -->
        <RouterLink :to="{ name: 'login' }" class="login-link">
          <VaButton preset="secondary" class="w-full" size="large">
            <VaIcon name="login" class="mr-2" />
            Sign In
          </VaButton>
        </RouterLink>
      </div>
    </VaForm>
  </div>
</template>

<script lang="ts" setup>
import { reactive, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useForm, useToast } from 'vuestic-ui'

const { validate } = useForm('form')
const { push } = useRouter()
const { init } = useToast()

const formData = reactive({
  email: '',
  password: '',
  repeatPassword: '',
})

const submit = () => {
  if (validate()) {
    init({
      message: 'Account created successfully! Welcome aboard.',
      color: 'success',
    })
    push({ name: 'dashboard' })
  }
}

const passwordRules: ((v: string) => boolean | string)[] = [
  (v) => !!v || 'Password field is required',
  (v) => (v && v.length >= 8) || 'Password must be at least 8 characters long',
  (v) => (v && /[A-Za-z]/.test(v)) || 'Password must contain at least one letter',
  (v) => (v && /\d/.test(v)) || 'Password must contain at least one number',
  (v) => (v && /[!@#$%^&*(),.?":{}|<>]/.test(v)) || 'Password must contain at least one special character',
]

// Password strength calculation
const passwordStrength = computed(() => {
  const password = formData.password
  if (!password) return 0

  let strength = 0
  if (password.length >= 8) strength++
  if (password.length >= 12) strength++
  if (/[a-z]/.test(password) && /[A-Z]/.test(password)) strength++
  if (/\d/.test(password)) strength++
  if (/[!@#$%^&*(),.?":{}|<>]/.test(password)) strength++

  return strength
})

const passwordStrengthClass = computed(() => {
  const strength = passwordStrength.value
  if (strength <= 1) return 'weak'
  if (strength <= 3) return 'medium'
  return 'strong'
})

const passwordStrengthWidth = computed(() => {
  return `${(passwordStrength.value / 5) * 100}%`
})

const passwordStrengthText = computed(() => {
  const strength = passwordStrength.value
  if (strength <= 1) return 'Weak password'
  if (strength <= 3) return 'Medium password'
  return 'Strong password'
})
</script>

<style scoped>
.signup-container {
  width: 100%;
  max-width: 480px;
  margin: 0 auto;
}

.signup-form {
  background: var(--va-background-element);
  border-radius: 16px;
  padding: 3rem;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
}

.form-header {
  text-align: center;
  margin-bottom: 2.5rem;
}

.form-title {
  font-size: 2rem;
  font-weight: 700;
  color: var(--va-text-primary);
  margin: 0 0 0.5rem 0;
  background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.form-subtitle {
  font-size: 1rem;
  color: var(--va-text-secondary);
  margin: 0;
  font-weight: 400;
}

.form-body {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.form-input {
  margin: 0;
}

.password-strength {
  margin: -0.5rem 0 0 0;
}

.strength-bar {
  height: 4px;
  background: var(--va-background-border);
  border-radius: 2px;
  overflow: hidden;
  margin-bottom: 0.5rem;
}

.strength-fill {
  height: 100%;
  transition:
    width 0.3s,
    background-color 0.3s;
  border-radius: 2px;
}

.strength-fill.weak {
  background: #ef4444;
}

.strength-fill.medium {
  background: #f59e0b;
}

.strength-fill.strong {
  background: #10b981;
}

.strength-text {
  font-size: 0.875rem;
  font-weight: 600;
  margin: 0;
}

.strength-text.weak {
  color: #ef4444;
}

.strength-text.medium {
  color: #f59e0b;
}

.strength-text.strong {
  color: #10b981;
}

.submit-btn {
  width: 100%;
  font-weight: 600;
  background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%);
  border: none;
  transition:
    transform 0.2s,
    box-shadow 0.2s;
}

.submit-btn:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 8px 16px rgba(245, 158, 11, 0.3);
}

.submit-btn:active:not(:disabled) {
  transform: translateY(0);
}

.divider {
  position: relative;
  text-align: center;
  margin: 0.5rem 0;
}

.divider::before {
  content: '';
  position: absolute;
  top: 50%;
  left: 0;
  right: 0;
  height: 1px;
  background: var(--va-background-border);
}

.divider-text {
  position: relative;
  display: inline-block;
  padding: 0 1rem;
  background: var(--va-background-element);
  color: var(--va-text-secondary);
  font-size: 0.875rem;
  font-weight: 500;
}

.login-link {
  text-decoration: none;
}

@media (max-width: 768px) {
  .signup-form {
    padding: 2rem 1.5rem;
  }

  .form-title {
    font-size: 1.75rem;
  }
}
</style>
