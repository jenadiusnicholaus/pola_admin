<template>
  <div class="documents-status-summary">
    <div class="status-summary-grid">
      <div class="status-item provided-status">
        <VaIcon name="check_circle" color="success" size="small" />
        <span class="status-count">{{ providedCount }}</span>
        <span class="status-label">Provided</span>
      </div>
      <div class="status-item missing-status">
        <VaIcon name="cancel" color="danger" size="small" />
        <span class="status-count">{{ missingCount }}</span>
        <span class="status-label">Missing</span>
      </div>
      <div class="status-item total-status">
        <VaIcon name="description" color="info" size="small" />
        <span class="status-count">{{ totalCount }}</span>
        <span class="status-label">Total Required</span>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
interface Props {
  providedCount: number
  missingCount: number
  totalCount: number
}

defineProps<Props>()
</script>

<style scoped>
.documents-status-summary {
  margin: 1rem 0;
  padding: 1rem;
  background: #f1f5f9;
  border-radius: 6px;
  border: 1px solid #e2e8f0;
}

.status-summary-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 1rem;
}

.status-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  padding: 0.75rem;
  background: white;
  border-radius: 4px;
  border: 1px solid #e5e7eb;
}

.status-count {
  font-size: 1.25rem;
  font-weight: 700;
  margin: 0.25rem 0;
}

.status-label {
  font-size: 0.75rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.provided-status .status-count {
  color: #059669;
}

.missing-status .status-count {
  color: #dc2626;
}

.total-status .status-count {
  color: #2563eb;
}

@media (max-width: 768px) {
  .status-summary-grid {
    grid-template-columns: 1fr;
    gap: 0.75rem;
  }

  .status-item {
    padding: 0.5rem;
  }
}
</style>
