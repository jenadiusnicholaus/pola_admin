<template>
  <Teleport to="body">
    <Transition name="fade">
      <div v-if="isLoading" class="global-loading-overlay">
        <div class="loading-content">
          <VaProgressCircle indeterminate :size="60" :thickness="0.15" color="primary" />
          <p class="loading-text">Loading...</p>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup lang="ts">
import { storeToRefs } from 'pinia'
import { useGlobalStore } from '../stores/global-store'

const globalStore = useGlobalStore()
const { isLoading } = storeToRefs(globalStore)
</script>

<style scoped>
.global-loading-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.5);
  backdrop-filter: blur(4px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 9999;
}

.loading-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1rem;
  background: var(--va-background-element);
  padding: 2rem 3rem;
  border-radius: 12px;
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.3);
}

.loading-text {
  margin: 0;
  font-size: 1rem;
  font-weight: 500;
  color: var(--va-text-primary);
}

/* Fade transition */
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.2s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
