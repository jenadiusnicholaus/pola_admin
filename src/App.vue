<template>
  <RouterView />
  <GlobalLoading />
</template>

<script setup lang="ts">
import GlobalLoading from './components/GlobalLoading.vue'
</script>

<style lang="scss">
#app {
  font-family: 'Inter', Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}

body {
  margin: 0;
  min-width: 20rem;
}
</style>
