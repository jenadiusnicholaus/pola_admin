<template>
  <div class="max-w-7xl mx-auto">
    <RouterView :key="route.fullPath" />
  </div>
</template>

<script setup lang="ts">
import { useRoute } from 'vue-router'

const route = useRoute()
</script>
