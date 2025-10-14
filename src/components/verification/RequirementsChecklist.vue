<template>
  <div class="verification-checklist">
    <h5 class="checklist-title">{{ title }}</h5>
    <div class="requirements-list">
      <div v-for="item in items" :key="item.key || item.type" class="requirement-item">
        <VaIcon
          :name="item.verified || item.passed ? 'check_circle' : 'cancel'"
          :color="item.verified || item.passed ? 'success' : 'danger'"
          size="small"
        />
        <span :class="{ 'text-success': item.verified || item.passed, 'text-danger': !(item.verified || item.passed) }">
          {{ item.label }}<template v-if="item.value">: {{ item.value }}</template>
        </span>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
interface RequirementItem {
  key?: string
  type?: string
  label: string
  value?: string
  verified?: boolean
  passed?: boolean
}

interface Props {
  title: string
  items: RequirementItem[]
}

defineProps<Props>()
</script>

<style scoped>
.verification-checklist {
  margin-bottom: 1rem;
}

.checklist-title {
  font-size: 0.875rem;
  font-weight: 600;
  color: #374151;
  margin: 0 0 0.75rem 0;
}

.requirements-list {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.requirement-item {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.875rem;
  padding: 0.25rem 0;
}

.text-success {
  color: #059669;
}

.text-danger {
  color: #dc2626;
}
</style>
