<template>
  <div class="quick-actions-card">
    <h2 class="card-title">Quick Actions</h2>
    <div class="actions-grid">
      <button class="action-btn" @click="$emit('createUser')">
        <div class="action-icon primary-bg">
          <VaIcon name="person_add" color="#ffffff" size="small" />
        </div>
        <span class="action-label">Create User</span>
      </button>

      <button class="action-btn" @click="$emit('manageVerifications')">
        <div class="action-icon success-bg">
          <VaIcon name="verified_user" color="#ffffff" size="small" />
        </div>
        <span class="action-label">Verifications</span>
      </button>

      <button class="action-btn" @click="$emit('managePermissions')">
        <div class="action-icon info-bg">
          <VaIcon name="admin_panel_settings" color="#ffffff" size="small" />
        </div>
        <span class="action-label">Permissions</span>
      </button>

      <button class="action-btn" @click="$emit('viewAllUsers')">
        <div class="action-icon secondary-bg">
          <VaIcon name="group" color="#ffffff" size="small" />
        </div>
        <span class="action-label">All Users</span>
      </button>

      <button class="action-btn" @click="$emit('settings')">
        <div class="action-icon warning-bg">
          <VaIcon name="settings" color="#ffffff" size="small" />
        </div>
        <span class="action-label">Settings</span>
      </button>

      <button class="action-btn" @click="$emit('reports')">
        <div class="action-icon neutral-bg">
          <VaIcon name="assessment" color="#ffffff" size="small" />
        </div>
        <span class="action-label">Reports</span>
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
defineEmits<{
  (event: 'createUser'): void
  (event: 'manageVerifications'): void
  (event: 'managePermissions'): void
  (event: 'viewAllUsers'): void
  (event: 'settings'): void
  (event: 'reports'): void
}>()
</script>

<style scoped>
.quick-actions-card {
  background: white;
  border-radius: 16px;
  padding: 1.5rem;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
  border: 1px solid rgba(0, 0, 0, 0.06);
  height: 100%;
}

.card-title {
  font-size: 1.25rem;
  font-weight: 600;
  color: #1a1a1a;
  margin: 0 0 1.5rem 0;
}

.actions-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(140px, 1fr));
  gap: 1rem;
}

.action-btn {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.75rem;
  padding: 1.25rem;
  background: #fafafa;
  border: 1px solid rgba(0, 0, 0, 0.06);
  border-radius: 12px;
  cursor: pointer;
  transition: all 0.2s;
}

.action-btn:hover {
  background: #f5f5f5;
  border-color: rgba(0, 0, 0, 0.1);
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
}

.action-icon {
  width: 44px;
  height: 44px;
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.action-icon :deep(.va-icon) {
  color: #ffffff !important;
  opacity: 1 !important;
  font-size: 20px;
}

.primary-bg {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
}

.success-bg {
  background: linear-gradient(135deg, #48bb78 0%, #38a169 100%);
}

.info-bg {
  background: linear-gradient(135deg, #4299e1 0%, #3182ce 100%);
}

.secondary-bg {
  background: linear-gradient(135deg, #6b7280 0%, #4b5563 100%);
}

.warning-bg {
  background: linear-gradient(135deg, #f6ad55 0%, #ed8936 100%);
}

.neutral-bg {
  background: linear-gradient(135deg, #a0aec0 0%, #718096 100%);
}

.action-label {
  font-size: 0.85rem;
  font-weight: 500;
  color: #374151;
  text-align: center;
}
</style>
