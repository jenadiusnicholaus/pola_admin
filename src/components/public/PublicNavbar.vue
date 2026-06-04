<template>
  <nav class="public-navbar">
    <div class="navbar-container">
      <div class="navbar-brand">
        <RouterLink to="/" class="brand-link">
          <VaIcon name="gavel" size="2rem" color="primary" />
          <span class="brand-text">Pola Admin</span>
        </RouterLink>
      </div>

      <div class="navbar-menu">
        <RouterLink to="/" class="nav-link">Home</RouterLink>
        <RouterLink to="/about" class="nav-link">About Us</RouterLink>
        <RouterLink to="/privacy" class="nav-link">Privacy Policy</RouterLink>
        <RouterLink to="/terms" class="nav-link">Terms & Policy</RouterLink>
        <RouterLink to="/refund" class="nav-link">Refund Policy</RouterLink>
      </div>

      <div class="navbar-actions"></div>

      <div class="mobile-menu-toggle">
        <VaButton icon="menu" preset="plain" @click="toggleMobileMenu" />
      </div>
    </div>

    <div v-if="isMobileMenuOpen" class="mobile-menu">
      <RouterLink to="/" class="mobile-nav-link" @click="closeMobileMenu">Home</RouterLink>
      <RouterLink to="/about" class="mobile-nav-link" @click="closeMobileMenu">About Us</RouterLink>
      <RouterLink to="/privacy" class="mobile-nav-link" @click="closeMobileMenu">Privacy Policy</RouterLink>
      <RouterLink to="/terms" class="mobile-nav-link" @click="closeMobileMenu">Terms & Policy</RouterLink>
      <RouterLink to="/refund" class="mobile-nav-link" @click="closeMobileMenu">Refund Policy</RouterLink>
      <div class="mobile-actions"></div>
    </div>
  </nav>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { RouterLink } from 'vue-router'

const isMobileMenuOpen = ref(false)

const toggleMobileMenu = () => {
  isMobileMenuOpen.value = !isMobileMenuOpen.value
}

const closeMobileMenu = () => {
  isMobileMenuOpen.value = false
}
</script>

<style lang="scss" scoped>
.public-navbar {
  background: var(--va-background-element);
  border-bottom: 1px solid var(--va-background-border);
  position: sticky;
  top: 0;
  z-index: 1000;
}

.navbar-container {
  max-width: 1400px;
  margin: 0 auto;
  padding: 1rem 2rem;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 2rem;
}

.navbar-brand {
  .brand-link {
    display: flex;
    align-items: center;
    gap: 0.75rem;
    text-decoration: none;
    color: var(--va-text-primary);
    font-weight: 700;
    font-size: 1.5rem;
    transition: color 0.2s;

    &:hover {
      color: var(--va-primary);
    }
  }
}

.navbar-menu {
  display: flex;
  align-items: center;
  gap: 2rem;
  flex: 1;
  justify-content: center;

  .nav-link {
    text-decoration: none;
    color: var(--va-text-secondary);
    font-weight: 500;
    transition: color 0.2s;
    position: relative;

    &:hover,
    &.router-link-active {
      color: var(--va-primary);
    }

    &::after {
      content: '';
      position: absolute;
      bottom: -0.25rem;
      left: 0;
      width: 0;
      height: 2px;
      background: var(--va-primary);
      transition: width 0.2s;
    }

    &:hover::after,
    &.router-link-active::after {
      width: 100%;
    }
  }
}

.navbar-actions {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.mobile-menu-toggle {
  display: none;
}

.mobile-menu {
  display: none;
  flex-direction: column;
  gap: 1rem;
  padding: 1.5rem;
  background: var(--va-background-element);
  border-bottom: 1px solid var(--va-background-border);

  .mobile-nav-link {
    padding: 0.75rem;
    text-decoration: none;
    color: var(--va-text-secondary);
    font-weight: 500;
    border-radius: 0.5rem;
    transition: all 0.2s;

    &:hover,
    &.router-link-active {
      background: var(--va-background-primary);
      color: var(--va-primary);
    }
  }

  .mobile-actions {
    display: flex;
    flex-direction: column;
    gap: 0.75rem;
    margin-top: 1rem;
  }
}

@media (max-width: 768px) {
  .navbar-menu {
    display: none;
  }

  .navbar-actions {
    display: none;
  }

  .mobile-menu-toggle {
    display: flex;
  }

  .mobile-menu {
    display: flex;
  }
}
</style>
