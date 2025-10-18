<template>
  <div class="check-email-container">
    <div class="check-email-card">
      <!-- Success Icon -->
      <div class="icon-wrapper">
        <VaIcon name="mark_email_read" size="4rem" color="success" />
      </div>

      <!-- Header -->
      <div class="card-header">
        <h1 class="card-title">Check Your Email</h1>
        <p class="card-subtitle">We've sent password reset instructions to your email address.</p>
      </div>

      <!-- Instructions -->
      <div class="instructions">
        <div class="instruction-item">
          <VaIcon name="check_circle" color="success" size="1.25rem" />
          <span>Check your inbox for the reset link</span>
        </div>
        <div class="instruction-item">
          <VaIcon name="schedule" color="primary" size="1.25rem" />
          <span>The link will expire in 24 hours</span>
        </div>
        <div class="instruction-item">
          <VaIcon name="folder_special" color="warning" size="1.25rem" />
          <span>Don't forget to check your spam folder</span>
        </div>
      </div>

      <!-- Actions -->
      <div class="actions">
        <RouterLink :to="{ name: 'login' }" class="action-link">
          <VaButton class="w-full" size="large">
            <VaIcon name="arrow_back" class="mr-2" />
            Back to Login
          </VaButton>
        </RouterLink>
      </div>

      <!-- Help Section -->
      <div class="help-section">
        <p class="help-text">
          Didn't receive the email?
          <a href="#" class="help-link" @click.prevent="resendEmail">Resend email</a>
        </p>
        <p class="help-text">
          Need assistance?
          <a href="#" class="help-link">Contact support</a>
        </p>
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { useToast } from 'vuestic-ui'

const { init } = useToast()

const resendEmail = () => {
  init({
    message: 'Reset link has been resent to your email',
    color: 'success',
  })
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
  margin-bottom: 2.5rem;
}

.card-title {
  font-size: 2rem;
  font-weight: 700;
  color: var(--va-text-primary);
  margin: 0 0 0.75rem 0;
  background: linear-gradient(135deg, #10b981 0%, #059669 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.card-subtitle {
  font-size: 1rem;
  color: var(--va-text-secondary);
  margin: 0;
  line-height: 1.6;
}

.instructions {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  margin-bottom: 2.5rem;
  text-align: left;
  padding: 1.5rem;
  background: var(--va-background-secondary);
  border-radius: 12px;
}

.instruction-item {
  display: flex;
  align-items: center;
  gap: 1rem;
  font-size: 0.9375rem;
  color: var(--va-text-primary);
}

.actions {
  margin-bottom: 2rem;
}

.action-link {
  text-decoration: none;
}

.help-section {
  padding-top: 2rem;
  border-top: 1px solid var(--va-background-border);
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.help-text {
  font-size: 0.875rem;
  color: var(--va-text-secondary);
  margin: 0;
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
  .check-email-card {
    padding: 2rem 1.5rem;
  }

  .card-title {
    font-size: 1.75rem;
  }

  .icon-wrapper {
    width: 80px;
    height: 80px;
  }

  .instructions {
    padding: 1rem;
  }
}
</style>
