<template>
  <div class="admin-login-container">
    <div class="admin-login-card">
      <div class="login-header">
        <h2>Admin Login</h2>
        <p>Access the verification management system</p>
      </div>

      <form class="login-form" @submit.prevent="handleSubmit">
        <div class="form-group">
          <label for="email">Email</label>
          <VaInput
            id="email"
            v-model="formData.email"
            type="email"
            placeholder="Enter your admin email"
            :error="!!error"
            required
          />
        </div>

        <div class="form-group">
          <label for="password">Password</label>
          <VaInput
            id="password"
            v-model="formData.password"
            type="password"
            placeholder="Enter your password"
            :error="!!error"
            required
          />
        </div>

        <VaAlert v-if="error" color="danger" class="error-alert">
          {{ error }}
        </VaAlert>

        <VaButton type="submit" :loading="loading" :disabled="loading" class="login-button" size="large">
          {{ loading ? 'Logging in...' : 'Login' }}
        </VaButton>
      </form>

      <div class="login-footer">
        <RouterLink to="/auth/login" class="back-link"> ← Back to User Login </RouterLink>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive } from 'vue'
import { useRouter } from 'vue-router'
import { useAdminAuthStore } from '../../stores/user-store'

const router = useRouter()
const adminAuthStore = useAdminAuthStore()

const formData = reactive({
  email: '',
  password: '',
})

const loading = ref(false)
const error = ref('')

const handleSubmit = async () => {
  loading.value = true
  error.value = ''

  try {
    await adminAuthStore.login(formData.email, formData.password)
    router.push({ name: 'verification-dashboard' })
  } catch (err: any) {
    error.value = err.message || 'Login failed'
  } finally {
    loading.value = false
  }
}
</script>

<style scoped>
.admin-login-container {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  padding: 1rem;
}

.admin-login-card {
  background: white;
  border-radius: 1rem;
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.1);
  padding: 2rem;
  width: 100%;
  max-width: 400px;
}

.login-header {
  text-align: center;
  margin-bottom: 2rem;
}

.login-header h2 {
  color: #2c3e50;
  margin-bottom: 0.5rem;
  font-size: 1.75rem;
}

.login-header p {
  color: #7f8c8d;
  margin: 0;
}

.login-form {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.form-group label {
  font-weight: 500;
  color: #2c3e50;
}

.login-button {
  margin-top: 1rem;
}

.error-alert {
  margin-top: 1rem;
}

.login-footer {
  text-align: center;
  margin-top: 2rem;
  padding-top: 1rem;
  border-top: 1px solid #ecf0f1;
}

.back-link {
  color: #3498db;
  text-decoration: none;
  font-size: 0.9rem;
}

.back-link:hover {
  text-decoration: underline;
}
</style>
