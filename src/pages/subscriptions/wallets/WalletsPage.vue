<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { useWallets } from '../../../composables/useWallets'

const { wallets, isLoading, fetchWallets, freezeWallet, unfreezeWallet } = useWallets()

const filters = ref<any>({
  email: '',
  is_active: undefined,
})

onMounted(() => {
  fetchWallets()
})

const columns = [
  { key: 'user', label: 'User', sortable: false },
  { key: 'balance', label: 'Balance', sortable: true },
  { key: 'earnings', label: 'Total Earnings', sortable: true },
  { key: 'withdrawn', label: 'Withdrawn', sortable: true },
  { key: 'available', label: 'Available', sortable: true },
  { key: 'is_active', label: 'Status', sortable: true },
  { key: 'created_at', label: 'Created', sortable: true },
  { key: 'actions', label: 'Actions', width: '150px' },
]

const handleFreeze = async (wallet: any) => {
  if (confirm('Freeze this wallet?')) {
    await freezeWallet(wallet.id, { reason: 'Admin freeze' })
    await fetchWallets(filters.value)
  }
}

const handleUnfreeze = async (wallet: any) => {
  if (confirm('Unfreeze this wallet?')) {
    await unfreezeWallet(wallet.id)
    await fetchWallets(filters.value)
  }
}
</script>

<template>
  <div class="wallets-page">
    <div class="page-header">
      <div>
        <h1 class="page-title">Wallets</h1>
        <p class="page-subtitle">Manage user wallets and balances</p>
      </div>
    </div>

    <!-- Filters -->
    <VaCard class="filters-card">
      <VaCardContent>
        <div class="filters-grid">
          <VaInput v-model="filters.email" label="Search by Email" placeholder="user@example.com" />
          <VaSelect
            v-model="filters.is_active"
            label="Status"
            :options="[
              { text: 'Active', value: true },
              { text: 'Frozen', value: false },
            ]"
            text-by="text"
            value-by="value"
            clearable
          />
          <VaButton icon="search" @click="fetchWallets(filters)">Search</VaButton>
          <VaButton icon="refresh" preset="secondary" @click="fetchWallets()">Reset</VaButton>
        </div>
      </VaCardContent>
    </VaCard>

    <!-- Wallets Table -->
    <VaCard>
      <VaCardContent>
        <VaDataTable :items="wallets" :columns="columns" :loading="isLoading" striped hoverable>
          <template #cell(user)="{ rowData }">
            <div>
              <div class="user-email">{{ rowData.user_email }}</div>
              <div class="user-id">User ID: {{ rowData.user }}</div>
            </div>
          </template>

          <template #cell(balance)="{ rowData }">
            <div class="money-cell">
              <div class="amount">{{ rowData.balance_details.formatted }}</div>
            </div>
          </template>

          <template #cell(earnings)="{ rowData }">
            <div class="money-cell earnings">
              <div class="amount">{{ rowData.earnings_details.formatted }}</div>
            </div>
          </template>

          <template #cell(withdrawn)="{ rowData }">
            <div class="money-cell withdrawn">
              <div class="amount">{{ rowData.withdrawn_details.formatted }}</div>
            </div>
          </template>

          <template #cell(available)="{ rowData }">
            <VaChip :color="rowData.available_for_withdrawal > 0 ? 'success' : 'secondary'" size="small">
              {{ rowData.currency }} {{ rowData.available_for_withdrawal.toLocaleString() }}
            </VaChip>
          </template>

          <template #cell(is_active)="{ rowData }">
            <VaBadge
              :text="rowData.is_active ? 'Active' : 'Frozen'"
              :color="rowData.is_active ? 'success' : 'danger'"
            />
          </template>

          <template #cell(created_at)="{ rowData }">
            {{ new Date(rowData.created_at).toLocaleDateString() }}
          </template>

          <template #cell(actions)="{ rowData }">
            <div class="actions-cell">
              <VaButton
                v-if="rowData.is_active"
                preset="plain"
                icon="block"
                size="small"
                color="danger"
                title="Freeze Wallet"
                @click="handleFreeze(rowData)"
              />
              <VaButton
                v-else
                preset="plain"
                icon="check_circle"
                size="small"
                color="success"
                title="Unfreeze Wallet"
                @click="handleUnfreeze(rowData)"
              />
            </div>
          </template>
        </VaDataTable>
      </VaCardContent>
    </VaCard>
  </div>
</template>

<style scoped>
.wallets-page {
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

.user-email {
  font-weight: 600;
  color: #1a1a1a;
  font-size: 0.9rem;
}

.user-id {
  font-size: 0.75rem;
  color: #9ca3af;
  margin-top: 0.125rem;
}

.money-cell {
  display: flex;
  flex-direction: column;
}

.money-cell .amount {
  font-weight: 600;
  color: #1a1a1a;
  font-size: 0.9rem;
}

.money-cell.earnings .amount {
  color: #10b981;
}

.money-cell.withdrawn .amount {
  color: #ef4444;
}

.actions-cell {
  display: flex;
  gap: 0.5rem;
}

@media (max-width: 768px) {
  .filters-grid {
    grid-template-columns: 1fr;
  }
}
</style>
