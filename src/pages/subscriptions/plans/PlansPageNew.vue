<script setup lang="ts">
import { onMounted, ref, computed } from 'vue'
import { usePlans } from '../../../composables/usePlans'

const {
  plans,
  subscriptionStatistics,
  isLoading,
  fetchPlans,
  fetchSubscriptionStatistics,
  createPlan,
  updatePlan,
  toggleActivation,
  deletePlan,
} = usePlans()

const showModal = ref(false)
const isEditMode = ref(false)
const editingPlanId = ref<number | null>(null)

const form = ref({
  name: '',
  description: '',
  price: '',
  plan_type: 'monthly',
  duration_days: 30,
  is_active: true,
})

onMounted(async () => {
  await Promise.all([fetchPlans(), fetchSubscriptionStatistics()])
})

const modalTitle = computed(() => (isEditMode.value ? 'Edit Plan' : 'Create Plan'))

const openCreateModal = () => {
  isEditMode.value = false
  editingPlanId.value = null
  resetForm()
  showModal.value = true
}

const openEditModal = (plan: any) => {
  isEditMode.value = true
  editingPlanId.value = plan.id
  form.value = {
    name: plan.name,
    description: plan.description || '',
    price: plan.price,
    plan_type: plan.plan_type,
    duration_days: plan.duration_days,
    is_active: plan.is_active,
  }
  showModal.value = true
}

const resetForm = () => {
  form.value = {
    name: '',
    description: '',
    price: '',
    plan_type: 'monthly',
    duration_days: 30,
    is_active: true,
  }
}

const handleSave = async () => {
  try {
    if (isEditMode.value && editingPlanId.value) {
      await updatePlan(editingPlanId.value, form.value)
    } else {
      await createPlan(form.value)
    }
    showModal.value = false
    resetForm()
    await Promise.all([fetchPlans(), fetchSubscriptionStatistics()])
  } catch (error) {
    console.error('Failed to save plan:', error)
  }
}

const handleDelete = async (plan: any) => {
  if (confirm(`Are you sure you want to delete the plan "${plan.name}"?`)) {
    await deletePlan(plan.id)
    await Promise.all([fetchPlans(), fetchSubscriptionStatistics()])
  }
}

const handleToggleActive = async (plan: any) => {
  await toggleActivation(plan.id, !plan.is_active)
  await Promise.all([fetchPlans(), fetchSubscriptionStatistics()])
}

const formatCurrency = (value: string | number) => {
  const num = typeof value === 'string' ? parseFloat(value) : value
  return `TSh ${num.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
}

const getPlanTypeBadgeColor = (type: string) => {
  const colors: Record<string, string> = {
    monthly: 'primary',
    yearly: 'success',
    lifetime: 'warning',
  }
  return colors[type] || 'secondary'
}
</script>

<template>
  <div class="plans-page">
    <div class="page-header">
      <div>
        <h1 class="page-title">Subscription Plans</h1>
        <p class="page-subtitle">Create and manage all subscription plans</p>
      </div>
      <VaButton icon="add" color="primary" @click="openCreateModal">Create Plan</VaButton>
    </div>

    <!-- Statistics Cards -->
    <div v-if="subscriptionStatistics" class="stats-grid mb-6">
      <VaCard class="stat-card">
        <VaCardContent>
          <div class="stat-item">
            <VaIcon name="inventory" color="primary" size="2.5rem" />
            <div class="stat-content">
              <div class="stat-value">{{ subscriptionStatistics.total_plans }}</div>
              <div class="stat-label">Total Plans</div>
            </div>
          </div>
        </VaCardContent>
      </VaCard>

      <VaCard class="stat-card">
        <VaCardContent>
          <div class="stat-item">
            <VaIcon name="check_circle" color="success" size="2.5rem" />
            <div class="stat-content">
              <div class="stat-value">{{ subscriptionStatistics.active_plans }}</div>
              <div class="stat-label">Active Plans</div>
            </div>
          </div>
        </VaCardContent>
      </VaCard>

      <VaCard class="stat-card">
        <VaCardContent>
          <div class="stat-item">
            <VaIcon name="people" color="info" size="2.5rem" />
            <div class="stat-content">
              <div class="stat-value">
                {{ subscriptionStatistics.active_subscribers }} / {{ subscriptionStatistics.total_subscribers }}
              </div>
              <div class="stat-label">Active Subscribers</div>
            </div>
          </div>
        </VaCardContent>
      </VaCard>

      <VaCard class="stat-card">
        <VaCardContent>
          <div class="stat-item">
            <VaIcon name="payments" color="warning" size="2.5rem" />
            <div class="stat-content">
              <div class="stat-value">{{ formatCurrency(subscriptionStatistics.total_revenue) }}</div>
              <div class="stat-label">Total Revenue</div>
            </div>
          </div>
        </VaCardContent>
      </VaCard>

      <VaCard class="stat-card">
        <VaCardContent>
          <div class="stat-item">
            <VaIcon name="trending_up" color="success" size="2.5rem" />
            <div class="stat-content">
              <div class="stat-value">{{ (subscriptionStatistics.growth_rate || 0).toFixed(1) }}%</div>
              <div class="stat-label">Growth Rate</div>
            </div>
          </div>
        </VaCardContent>
      </VaCard>

      <VaCard class="stat-card">
        <VaCardContent>
          <div class="stat-item">
            <VaIcon name="trending_down" color="danger" size="2.5rem" />
            <div class="stat-content">
              <div class="stat-value">{{ (subscriptionStatistics.churn_rate || 0).toFixed(1) }}%</div>
              <div class="stat-label">Churn Rate</div>
            </div>
          </div>
        </VaCardContent>
      </VaCard>
    </div>

    <!-- Plans Grid -->
    <div v-if="isLoading" class="loading-container">
      <VaProgressCircle indeterminate />
      <p>Loading plans...</p>
    </div>

    <div v-else-if="plans.length === 0" class="empty-state">
      <VaIcon name="inbox" size="4rem" color="secondary" />
      <h3>No plans yet</h3>
      <p>Create your first subscription plan to get started</p>
      <VaButton icon="add" @click="openCreateModal">Create Your First Plan</VaButton>
    </div>

    <div v-else class="plans-grid">
      <VaCard
        v-for="plan in plans"
        :key="plan.id"
        class="plan-card"
        :class="{ 'plan-card--inactive': !plan.is_active }"
      >
        <VaCardContent>
          <div class="plan-card-header">
            <div class="plan-title-section">
              <h3 class="plan-name">{{ plan.name }}</h3>
              <div class="plan-badges">
                <VaBadge :text="plan.plan_type" :color="getPlanTypeBadgeColor(plan.plan_type)" />
                <VaBadge
                  :text="plan.is_active ? 'Active' : 'Inactive'"
                  :color="plan.is_active ? 'success' : 'danger'"
                />
              </div>
            </div>
            <div class="plan-actions">
              <VaButton preset="plain" icon="edit" size="small" title="Edit Plan" @click="openEditModal(plan)" />
              <VaButton
                preset="plain"
                icon="delete"
                size="small"
                color="danger"
                title="Delete Plan"
                @click="handleDelete(plan)"
              />
            </div>
          </div>

          <p v-if="plan.description" class="plan-description">{{ plan.description }}</p>
          <p v-else class="plan-description plan-description--empty">No description provided</p>

          <div class="plan-price-section">
            <div class="price-amount">
              <span class="currency">TSh</span>
              <span class="price">{{ parseFloat(plan.price).toLocaleString() }}</span>
            </div>
            <div class="price-duration">
              <VaIcon name="schedule" size="1rem" />
              <span>{{ plan.duration_days }} days</span>
            </div>
          </div>

          <div class="plan-stats">
            <div class="stat-row">
              <VaIcon name="people" size="1.125rem" color="primary" />
              <span class="stat-label">Subscribers:</span>
              <span class="stat-value">{{ plan.total_subscribers || 0 }}</span>
            </div>
            <div class="stat-row">
              <VaIcon name="check_circle" size="1.125rem" color="success" />
              <span class="stat-label">Active:</span>
              <span class="stat-value">{{ plan.active_subscribers || 0 }}</span>
            </div>
            <div v-if="plan.total_revenue" class="stat-row">
              <VaIcon name="payments" size="1.125rem" color="warning" />
              <span class="stat-label">Revenue:</span>
              <span class="stat-value">{{ formatCurrency(plan.total_revenue) }}</span>
            </div>
          </div>

          <div class="plan-card-footer">
            <VaButton
              :color="plan.is_active ? 'warning' : 'success'"
              :icon="plan.is_active ? 'toggle_off' : 'toggle_on'"
              size="small"
              @click="handleToggleActive(plan)"
            >
              {{ plan.is_active ? 'Deactivate' : 'Activate' }}
            </VaButton>
          </div>
        </VaCardContent>
      </VaCard>
    </div>

    <!-- Create/Edit Modal -->
    <VaModal v-model="showModal" :title="modalTitle" size="medium" @ok="handleSave">
      <VaForm ref="formRef">
        <VaInput v-model="form.name" label="Plan Name" :rules="[(v) => !!v || 'Name is required']" />

        <VaTextarea v-model="form.description" label="Description" />

        <VaSelect
          v-model="form.plan_type"
          label="Plan Type"
          :options="['monthly', 'yearly', 'lifetime']"
          :rules="[(v) => !!v || 'Plan type is required']"
        />

        <VaInput v-model="form.price" label="Price (TSh)" type="number" :rules="[(v) => !!v || 'Price is required']" />

        <VaInput
          v-model="form.duration_days"
          label="Duration (days)"
          type="number"
          :rules="[(v) => !!v || 'Duration is required']"
        />

        <VaCheckbox v-model="form.is_active" label="Active" />
      </VaForm>
    </VaModal>
  </div>
</template>

<style scoped>
.plans-page {
  padding: 0.5rem 0;
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 2rem;
}

.page-title {
  font-size: 1.75rem;
  font-weight: 700;
  color: #1a1a1a;
  margin: 0 0 0.5rem 0;
}

.page-subtitle {
  font-size: 1rem;
  color: #6b7280;
  margin: 0;
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1.5rem;
  margin-bottom: 2rem;
}

.stat-card {
  transition:
    transform 0.2s ease,
    box-shadow 0.2s ease;
}

.stat-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 8px 16px rgba(0, 0, 0, 0.1);
}

.stat-item {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.stat-content {
  display: flex;
  flex-direction: column;
}

.stat-value {
  font-size: 1.75rem;
  font-weight: 700;
  color: #1a1a1a;
  line-height: 1.2;
}

.stat-label {
  font-size: 0.875rem;
  color: #6b7280;
  margin-top: 0.25rem;
}

.loading-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 4rem 2rem;
  gap: 1rem;
}

.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 4rem 2rem;
  gap: 1rem;
  text-align: center;
}

.empty-state h3 {
  font-size: 1.5rem;
  font-weight: 600;
  color: #1a1a1a;
  margin: 0;
}

.empty-state p {
  color: #6b7280;
  margin: 0;
}

.plans-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
  gap: 1.5rem;
}

.plan-card {
  transition: all 0.3s ease;
  border: 2px solid transparent;
  height: 100%;
}

.plan-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 12px 24px rgba(0, 0, 0, 0.1);
  border-color: #e5e7eb;
}

.plan-card--inactive {
  opacity: 0.7;
  background: #f9fafb;
}

.plan-card-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 1rem;
  padding-bottom: 1rem;
  border-bottom: 1px solid #e5e7eb;
}

.plan-title-section {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.plan-name {
  font-size: 1.25rem;
  font-weight: 700;
  color: #1a1a1a;
  margin: 0;
}

.plan-badges {
  display: flex;
  gap: 0.5rem;
  flex-wrap: wrap;
}

.plan-actions {
  display: flex;
  gap: 0.25rem;
}

.plan-description {
  color: #6b7280;
  font-size: 0.875rem;
  line-height: 1.5;
  margin: 0 0 1.5rem 0;
}

.plan-description--empty {
  font-style: italic;
  opacity: 0.6;
}

.plan-price-section {
  background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%);
  border-radius: 12px;
  padding: 1.5rem;
  margin-bottom: 1.5rem;
  color: white;
}

.price-amount {
  display: flex;
  align-items: baseline;
  gap: 0.5rem;
  margin-bottom: 0.75rem;
}

.currency {
  font-size: 1rem;
  font-weight: 600;
  opacity: 0.9;
}

.price {
  font-size: 2.5rem;
  font-weight: 700;
  line-height: 1;
}

.price-duration {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.875rem;
  opacity: 0.9;
}

.plan-stats {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  margin-bottom: 1.5rem;
  padding: 1rem;
  background: #f0f9ff;
  border-radius: 8px;
}

.stat-row {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.875rem;
}

.stat-row .stat-label {
  color: #6b7280;
  margin: 0;
}

.stat-row .stat-value {
  font-weight: 600;
  color: #1a1a1a;
  margin-left: auto;
  font-size: 0.875rem;
}

.plan-card-footer {
  padding-top: 1rem;
  border-top: 1px solid #e5e7eb;
  display: flex;
  justify-content: flex-end;
}

@media (max-width: 768px) {
  .page-header {
    flex-direction: column;
    gap: 1rem;
  }

  .stats-grid {
    grid-template-columns: repeat(2, 1fr);
  }

  .plans-grid {
    grid-template-columns: 1fr;
  }

  .price {
    font-size: 2rem;
  }
}

@media (min-width: 769px) and (max-width: 1024px) {
  .plans-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (min-width: 1400px) {
  .plans-grid {
    grid-template-columns: repeat(3, 1fr);
  }
}
</style>
