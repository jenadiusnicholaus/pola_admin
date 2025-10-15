<template>
  <div class="admin-auth-status">
    <VaDropdown v-if="adminAuthStore.isLoggedIn" class="admin-dropdown">
      <template #anchor>
        <VaButton color="primary" icon="admin_panel_settings" class="admin-button">
          Admin: {{ adminAuthStore.userFullName }}
        </VaButton>
      </template>

      <VaDropdownContent>
        <VaList>
          <VaListItem>
            <VaListItemSection>
              <VaListItemLabel>
                {{ adminAuthStore.user?.email }}
              </VaListItemLabel>
            </VaListItemSection>
          </VaListItem>

          <VaListItem @click="handleLogout">
            <VaListItemSection icon="logout">
              <VaListItemLabel>Logout</VaListItemLabel>
            </VaListItemSection>
          </VaListItem>
        </VaList>
      </VaDropdownContent>
    </VaDropdown>

    <VaButton v-else color="secondary" class="login-button" @click="$router.push('/auth/admin-login')">
      Admin Login
    </VaButton>
  </div>
</template>

<script setup lang="ts">
import { onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAdminAuthStore } from '../../stores/user-store'

const router = useRouter()
const adminAuthStore = useAdminAuthStore()

const handleLogout = () => {
  adminAuthStore.logout()
  router.push('/auth/admin-login')
}

onMounted(async () => {
  await adminAuthStore.checkAuth()
})
</script>

<style scoped>
.admin-auth-status {
  display: flex;
  align-items: center;
}

.admin-button {
  font-size: 0.9rem;
}

.login-button {
  font-size: 0.9rem;
}
</style>
