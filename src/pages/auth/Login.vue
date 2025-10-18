<template>
  <div class="login-container">
    <VaForm ref="form" class="login-form" @submit.prevent="submit">
      <!-- Header -->
      <div class="form-header">
        <h1 class="form-title">Welcome Back</h1>
        <p class="form-subtitle">Sign in to your admin account</p>
      </div>

      <!-- Form Fields -->
      <div class="form-body">
        <VaInput
          v-model="formData.email"
          :rules="[validators.required, validators.email]"
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
            v-model="formData.password"
            :rules="[validators.required]"
            :type="isPasswordVisible.value ? 'text' : 'password'"
            class="form-input"
            label="Password"
            placeholder="Enter your password"
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
        </VaValue>

        <!-- Options Row -->
        <div class="form-options">
          <VaCheckbox v-model="formData.keepLoggedIn" label="Remember me" />
          <RouterLink :to="{ name: 'recover-password' }" class="forgot-link"> Forgot password? </RouterLink>
        </div>

        <!-- Error Alert -->
        <VaAlert v-if="error" color="danger" class="error-alert" border="top" border-color="danger">
          <template #icon>
            <VaIcon name="error" />
          </template>
          {{ error }}
        </VaAlert>

        <!-- Submit Button -->
        <VaButton type="submit" class="submit-btn" size="large" :loading="loading" :disabled="loading">
          <VaIcon v-if="!loading" name="login" class="mr-2" />
          {{ loading ? 'Signing in...' : 'Sign In' }}
        </VaButton>

        <!-- Divider -->
        <div class="divider">
          <span class="divider-text">New to the platform?</span>
        </div>

        <!-- Sign Up Link -->
        <RouterLink :to="{ name: 'signup' }" class="signup-link">
          <VaButton preset="secondary" class="w-full" size="large">
            <VaIcon name="person_add" class="mr-2" />
            Create Account
          </VaButton>
        </RouterLink>
      </div>
    </VaForm>
  </div>
</template>

<script lang="ts" setup>
import { reactive, ref } from 'vue'
import { useRouter } from 'vue-router'
import { useForm, useToast } from 'vuestic-ui'
import { validators } from '../../services/utils'
import { useAdminAuthStore } from '../../stores/user-store'

const { validate } = useForm('form')
const { push } = useRouter()
const { init } = useToast()
const adminAuthStore = useAdminAuthStore()

const loading = ref(false)
const error = ref('')

const formData = reactive({
  email: '',
  password: '',
  keepLoggedIn: false,
})

const submit = async () => {
  if (!validate()) {
    return
  }

  loading.value = true
  error.value = ''

  try {
    // Admin login
    await adminAuthStore.login(formData.email, formData.password)
    init({ message: 'Welcome back! Login successful', color: 'success' })
    push({ name: 'verification-dashboard' })
  } catch (err: any) {
    error.value = err.message || 'Invalid email or password. Please try again.'
    init({ message: error.value, color: 'danger' })
  } finally {
    loading.value = false
  }
}
</script>

<style scoped>
.login-container {
  width: 100%;
  max-width: 480px;
  margin: 0 auto;
}

.login-form {
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

.form-options {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin: -0.5rem 0 0 0;
}

.forgot-link {
  font-size: 0.875rem;
  font-weight: 600;
  color: var(--va-primary);
  text-decoration: none;
  transition: opacity 0.2s;
}

.forgot-link:hover {
  opacity: 0.8;
  text-decoration: underline;
}

.error-alert {
  margin: 0;
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

.signup-link {
  text-decoration: none;
}

@media (max-width: 768px) {
  .login-form {
    padding: 2rem 1.5rem;
  }

  .form-title {
    font-size: 1.75rem;
  }

  .form-options {
    flex-direction: column;
    align-items: flex-start;
    gap: 0.75rem;
  }
}
</style>
