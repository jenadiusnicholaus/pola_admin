<template>
  <div class="recover-container">
    <VaForm ref="passwordForm" class="recover-form" @submit.prevent="submit">
      <!-- Header -->
      <div class="form-header">
        <div class="icon-wrapper">
          <VaIcon name="lock_reset" size="3rem" color="primary" />
        </div>
        <h1 class="form-title">Forgot Password?</h1>
        <p class="form-subtitle">
          No worries! Enter your email address and we'll send you a link to reset your password.
        </p>
      </div>

      <!-- Form Body -->
      <div class="form-body">
        <VaInput
          v-model="email"
          :rules="[(v) => !!v || 'Email field is required', (v) => /.+@.+\..+/.test(v) || 'Email should be valid']"
          class="form-input"
          label="Email Address"
          type="email"
          placeholder="Enter your registered email"
        >
          <template #prependInner>
            <VaIcon name="email" color="secondary" />
          </template>
        </VaInput>

        <!-- Submit Button -->
        <VaButton type="submit" class="submit-btn" size="large">
          <VaIcon name="send" class="mr-2" />
          Send Reset Link
        </VaButton>

        <!-- Back to Login -->
        <RouterLink :to="{ name: 'login' }" class="back-link">
          <VaButton preset="secondary" class="w-full" size="large">
            <VaIcon name="arrow_back" class="mr-2" />
            Back to Login
          </VaButton>
        </RouterLink>
      </div>

      <!-- Help Text -->
      <div class="help-text">
        <VaIcon name="info" size="1rem" color="secondary" />
        <span>
          Remember your password?
          <RouterLink :to="{ name: 'login' }" class="help-link">Sign in here</RouterLink>
        </span>
      </div>
    </VaForm>
  </div>
</template>

<script lang="ts" setup>
import { ref } from 'vue'
import { useForm } from 'vuestic-ui'
import { useRouter } from 'vue-router'

const email = ref('')
const form = useForm('passwordForm')
const router = useRouter()

const submit = () => {
  if (form.validate()) {
    router.push({ name: 'recover-password-email' })
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
  font-weight: 400;
}

.form-body {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
  margin-bottom: 2rem;
}

.form-input {
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

.back-link {
  text-decoration: none;
}

.help-text {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  padding-top: 1.5rem;
  border-top: 1px solid var(--va-background-border);
  font-size: 0.875rem;
  color: var(--va-text-secondary);
}

.help-link {
  color: var(--va-primary);
  font-weight: 600;
  text-decoration: none;
}

.help-link:hover {
  text-decoration: underline;
}

@media (max-width: 768px) {
  .recover-form {
    padding: 2rem 1.5rem;
  }

  .form-title {
    font-size: 1.75rem;
  }

  .icon-wrapper {
    width: 64px;
    height: 64px;
  }
}
</style>
