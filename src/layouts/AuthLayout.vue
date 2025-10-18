<template>
  <VaLayout v-if="breakpoint.lgUp" class="h-screen auth-layout">
    <template #left>
      <div class="auth-sidebar">
        <div class="sidebar-content">
          <RouterLink class="logo-link" to="/" aria-label="Visit homepage">
            <VuesticLogo :height="32" start="#FFF" />
          </RouterLink>

          <div class="sidebar-info">
            <h2 class="sidebar-title">Admin Dashboard</h2>
            <p class="sidebar-subtitle">Powerful tools for managing your platform with ease and efficiency.</p>

            <div class="features">
              <div class="feature-item">
                <VaIcon name="verified" size="1.5rem" />
                <div>
                  <h3>Secure Authentication</h3>
                  <p>Enterprise-grade security for your data</p>
                </div>
              </div>
              <div class="feature-item">
                <VaIcon name="analytics" size="1.5rem" />
                <div>
                  <h3>Real-time Analytics</h3>
                  <p>Monitor and analyze your metrics</p>
                </div>
              </div>
              <div class="feature-item">
                <VaIcon name="support_agent" size="1.5rem" />
                <div>
                  <h3>24/7 Support</h3>
                  <p>We're here to help you succeed</p>
                </div>
              </div>
            </div>
          </div>

          <div class="sidebar-footer">
            <p>© 2025 Admin Platform. All rights reserved.</p>
          </div>
        </div>
      </div>
    </template>
    <template #content>
      <main class="auth-main">
        <RouterView :key="route.fullPath" />
      </main>
    </template>
  </VaLayout>

  <VaLayout v-else class="h-screen mobile-auth-layout">
    <template #content>
      <div class="mobile-container">
        <main class="mobile-main">
          <div class="mobile-header">
            <RouterLink class="mobile-logo" to="/" aria-label="Visit homepage">
              <VuesticLogo class="mb-4" start="#f59e0b" :height="28" />
            </RouterLink>
          </div>
          <RouterView :key="route.fullPath" />
        </main>
      </div>
    </template>
  </VaLayout>
</template>

<script lang="ts" setup>
import { useRoute } from 'vue-router'
import { useBreakpoint } from 'vuestic-ui'
import VuesticLogo from '../components/VuesticLogo.vue'

const route = useRoute()
const breakpoint = useBreakpoint()
</script>

<style scoped>
.auth-layout {
  background: var(--va-background-secondary);
}

.auth-sidebar {
  width: 35vw;
  min-width: 400px;
  height: 100%;
  background: linear-gradient(135deg, #1f2937 0%, #111827 50%, #0f172a 100%);
  padding: 3rem;
  display: flex;
  flex-direction: column;
  color: white;
  position: relative;
  overflow: hidden;
}

.auth-sidebar::before {
  content: '';
  position: absolute;
  top: -50%;
  right: -50%;
  width: 100%;
  height: 100%;
  background: radial-gradient(circle, rgba(245, 158, 11, 0.15) 0%, transparent 70%);
  border-radius: 50%;
}

.auth-sidebar::after {
  content: '';
  position: absolute;
  bottom: -30%;
  left: -30%;
  width: 80%;
  height: 80%;
  background: radial-gradient(circle, rgba(96, 165, 250, 0.1) 0%, transparent 70%);
  border-radius: 50%;
}

.sidebar-content {
  position: relative;
  z-index: 1;
  display: flex;
  flex-direction: column;
  height: 100%;
}

.logo-link {
  display: inline-block;
  margin-bottom: 4rem;
}

.sidebar-info {
  flex: 1;
}

.sidebar-title {
  font-size: 2.5rem;
  font-weight: 700;
  margin: 0 0 1rem 0;
  line-height: 1.2;
}

.sidebar-subtitle {
  font-size: 1.125rem;
  opacity: 0.9;
  line-height: 1.6;
  margin: 0 0 3rem 0;
}

.features {
  display: flex;
  flex-direction: column;
  gap: 2rem;
}

.feature-item {
  display: flex;
  align-items: flex-start;
  gap: 1rem;
}

.feature-item h3 {
  font-size: 1.125rem;
  font-weight: 600;
  margin: 0 0 0.25rem 0;
}

.feature-item p {
  font-size: 0.9375rem;
  opacity: 0.8;
  margin: 0;
  line-height: 1.5;
}

.sidebar-footer {
  margin-top: auto;
  padding-top: 2rem;
  border-top: 1px solid rgba(255, 255, 255, 0.2);
  opacity: 0.7;
  font-size: 0.875rem;
}

.sidebar-footer p {
  margin: 0;
}

.auth-main {
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 2rem;
  max-width: 100%;
}

.mobile-auth-layout {
  background: var(--va-background-secondary);
}

.mobile-container {
  padding: 1.5rem;
  height: 100%;
  overflow-y: auto;
}

.mobile-main {
  max-width: 480px;
  margin: 0 auto;
}

.mobile-header {
  text-align: center;
  margin-bottom: 2rem;
}

.mobile-logo {
  display: inline-block;
}

@media (max-width: 1024px) {
  .auth-sidebar {
    min-width: 350px;
    padding: 2rem;
  }

  .sidebar-title {
    font-size: 2rem;
  }
}
</style>
