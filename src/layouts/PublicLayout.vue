<template>
  <div class="public-layout">
    <PublicNavbar />
    <main class="public-content">
      <RouterView />
    </main>
    <PublicFooter />
  </div>
</template>

<script setup lang="ts">
import PublicNavbar from '../components/public/PublicNavbar.vue'
import PublicFooter from '../components/public/PublicFooter.vue'
</script>

<style lang="scss" scoped>
.public-layout {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
}

.public-content {
  flex: 1;
  width: 100%;
}
</style>
