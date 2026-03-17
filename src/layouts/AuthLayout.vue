<template>
  <VaLayout v-if="breakpoint.lgUp" class="h-screen auth-layout">
    <template #left>
      <div class="auth-sidebar">
        <div class="sidebar-content">
          <RouterLink class="logo-link" to="/" aria-label="Visit homepage">
            <img src="/auth_logo.png" alt="Pola Logo" style="height: 160px; width: auto" />
          </RouterLink>

          <div class="sidebar-info">
            <img src="/pola_auth_image.png" alt="Pola Dashboard Features" class="auth-feature-image" />
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
              <img src="/auth_logo.png" alt="Pola Logo" style="height: 100px; width: auto" />
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

const route = useRoute()
const breakpoint = useBreakpoint()
</script>

<style scoped>
.auth-layout {
  background: var(--va-background-secondary);
}

.auth-sidebar {
  width: 40vw;
  min-width: 450px;
  height: 100%;
  background: linear-gradient(135deg, #1f2937 0%, #111827 50%, #0f172a 100%);
  padding: 2rem 0; /* Vertical padding only for logo/footer */
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
  align-items: center;
  text-align: center;
  height: 100%;
}

.logo-link {
  display: inline-block;
  margin-bottom: 4rem;
}

.sidebar-info {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  padding: 0;
  overflow: hidden;
}

.auth-feature-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
  object-position: center;
}

.sidebar-footer {
  margin-top: auto;
  padding-top: 2rem;
  border-top: 1px solid rgba(255, 255, 255, 0.2);
  opacity: 0.7;
  font-size: 0.875rem;

  width: 100%;
  text-align: center;
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
