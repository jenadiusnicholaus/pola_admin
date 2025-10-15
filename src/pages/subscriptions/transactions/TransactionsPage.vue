<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { useTransactions } from '../../../composables/useTransactions'

const { transactions, isLoading, fetchTransactions, processRefund } = useTransactions()

const filters = ref({
  status: '',
  type: '',
})

onMounted(() => {
  fetchTransactions()
})

const columns = [
  { key: 'reference_number', label: 'Reference', sortable: true },
  { key: 'user', label: 'User', sortable: false },
  { key: 'type', label: 'Type', sortable: true },
  { key: 'amount', label: 'Amount', sortable: true },
  { key: 'status', label: 'Status', sortable: true },
  { key: 'created_at', label: 'Date', sortable: true },
  { key: 'actions', label: 'Actions', width: '120px' },
]

const getStatusColor = (status: string) => {
  const colors: Record<string, string> = {
    completed: 'success',
    pending: 'warning',
    failed: 'danger',
    cancelled: 'secondary',
  }
  return colors[status] || 'secondary'
}

const handleRefund = async (transaction: any) => {
  if (confirm('Process refund for this transaction?')) {
    try {
      await processRefund(transaction.id, {
        reason: 'Admin refund request',
      })
      await fetchTransactions()
    } catch (error) {
      console.error('Refund failed:', error)
    }
  }
}
</script>

<template>
  <div class="transactions-page">
    <div class="page-header">
      <div>
        <h1 class="page-title">Transactions</h1>
        <p class="page-subtitle">View and manage all transactions and refunds</p>
      </div>
    </div>

    <!-- Filters -->
    <VaCard class="filters-card">
      <VaCardContent>
        <div class="filters-grid">
          <VaSelect
            v-model="filters.status"
            label="Status"
            :options="['completed', 'pending', 'failed', 'cancelled']"
            clearable
          />
          <VaSelect
            v-model="filters.type"
            label="Type"
            :options="['subscription', 'refund', 'wallet_topup', 'wallet_deduction']"
            clearable
          />
          <VaButton icon="search" @click="fetchTransactions(filters)">Search</VaButton>
          <VaButton icon="refresh" preset="secondary" @click="fetchTransactions()">Reset</VaButton>
        </div>
      </VaCardContent>
    </VaCard>

    <!-- Transactions Table -->
    <VaCard>
      <VaCardContent>
        <VaDataTable :items="transactions" :columns="columns" :loading="isLoading" striped hoverable>
          <template #cell(user)="{ rowData }">
            <div>
              <div class="user-name">{{ rowData.user.first_name }} {{ rowData.user.last_name }}</div>
              <div class="user-email">{{ rowData.user.email }}</div>
            </div>
          </template>

          <template #cell(amount)="{ rowData }">
            <span class="amount-cell">{{ parseFloat(rowData.amount).toLocaleString() }} {{ rowData.currency }}</span>
          </template>

          <template #cell(type)="{ rowData }">
            <VaChip size="small" :color="rowData.type === 'refund' ? 'warning' : 'primary'">
              {{ rowData.type }}
            </VaChip>
          </template>

          <template #cell(status)="{ rowData }">
            <VaBadge :text="rowData.status" :color="getStatusColor(rowData.status)" />
          </template>

          <template #cell(created_at)="{ rowData }">
            {{ new Date(rowData.created_at).toLocaleDateString() }}
          </template>

          <template #cell(actions)="{ rowData }">
            <VaButton
              v-if="rowData.status === 'completed' && rowData.type === 'subscription'"
              preset="plain"
              icon="replay"
              size="small"
              color="warning"
              title="Process Refund"
              @click="handleRefund(rowData)"
            />
          </template>
        </VaDataTable>
      </VaCardContent>
    </VaCard>
  </div>
</template>

<style scoped>
.transactions-page {
  padding: 0.5rem 0;
}

.page-header {
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

.filters-card {
  margin-bottom: 1.5rem;
}

.filters-grid {
  display: grid;
  grid-template-columns: 1fr 1fr auto auto;
  gap: 1rem;
  align-items: end;
}

.user-name {
  font-weight: 600;
  color: #1a1a1a;
}

.user-email {
  font-size: 0.875rem;
  color: #6b7280;
}

.amount-cell {
  font-weight: 600;
  color: #48bb78;
}

@media (max-width: 768px) {
  .filters-grid {
    grid-template-columns: 1fr;
  }
}
</style>
