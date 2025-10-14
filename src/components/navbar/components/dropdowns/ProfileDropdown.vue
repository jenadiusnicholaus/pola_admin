<template>
  <div class="profile-dropdown-wrapper">
    <VaDropdown v-model="isShown" :offset="[9, 0]" class="profile-dropdown" stick-to-edges>
      <template #anchor>
        <VaButton preset="secondary" color="textPrimary">
          <span class="profile-dropdown__anchor min-w-max">
            <slot />
            <VaAvatar :size="32" :src="profile?.profile_picture || undefined" color="primary">
              <template v-if="!profile?.profile_picture">
                {{ getInitials() }}
              </template>
            </VaAvatar>
          </span>
        </VaButton>
      </template>
      <VaDropdownContent
        class="profile-dropdown__content md:w-60 px-0 py-4 w-full"
        :style="{ '--hover-color': hoverColor }"
      >
        <!-- User Info Header -->
        <div v-if="profile" class="profile-info-header px-4 mb-3">
          <p class="user-name">{{ userFullName }}</p>
          <p class="user-email">{{ profile.email }}</p>
          <VaBadge
            v-if="profile.verification_status"
            :text="profile.verification_status.status"
            :color="profile.is_verified ? 'success' : 'warning'"
            size="small"
            class="mt-1"
          />
        </div>
        <VaListSeparator class="mx-3 my-2" />

        <VaList v-for="group in options" :key="group.name">
          <header v-if="group.name" class="uppercase text-[var(--va-secondary)] opacity-80 font-bold text-xs px-4">
            {{ t(`user.${group.name}`) }}
          </header>
          <VaListItem
            v-for="item in group.list"
            :key="item.name"
            class="menu-item px-4 text-base cursor-pointer h-8"
            v-bind="resolveLinkAttribute(item)"
          >
            <VaIcon :name="item.icon" class="pr-1" color="secondary" />
            {{ t(`user.${item.name}`) }}
          </VaListItem>
          <VaListSeparator v-if="group.separator" class="mx-3 my-2" />
        </VaList>
      </VaDropdownContent>
    </VaDropdown>
  </div>
</template>

<script lang="ts" setup>
import { ref, computed, onMounted } from 'vue'
import { useI18n } from 'vue-i18n'
import { useColors } from 'vuestic-ui'
import { storeToRefs } from 'pinia'
import { useUserStore } from '../../../../stores/user-store'

const { colors, setHSLAColor } = useColors()
const hoverColor = computed(() => setHSLAColor(colors.focus, { a: 0.1 }))

const { t } = useI18n()
const userStore = useUserStore()
const { profile } = storeToRefs(userStore)

const userFullName = computed(() => {
  if (profile.value) {
    return `${profile.value.first_name} ${profile.value.last_name}`.trim()
  }
  return 'User'
})

const getInitials = () => {
  if (profile.value) {
    const first = profile.value.first_name?.charAt(0) || ''
    const last = profile.value.last_name?.charAt(0) || ''
    return `${first}${last}`.toUpperCase() || 'U'
  }
  return 'U'
}

type ProfileListItem = {
  name: string
  to?: string
  href?: string
  icon: string
}

type ProfileOptions = {
  name: string
  separator: boolean
  list: ProfileListItem[]
}

withDefaults(
  defineProps<{
    options?: ProfileOptions[]
  }>(),
  {
    options: () => [
      {
        name: 'account',
        separator: true,
        list: [
          {
            name: 'profile',
            to: 'user-profile',
            icon: 'mso-account_circle',
          },
          {
            name: 'verification',
            to: 'user-verification',
            icon: 'mso-verified_user',
          },
          {
            name: 'settings',
            to: 'settings',
            icon: 'mso-settings',
          },
          {
            name: 'billing',
            to: 'billing',
            icon: 'mso-receipt_long',
          },
        ],
      },
      {
        name: 'explore',
        separator: true,
        list: [
          {
            name: 'faq',
            to: 'faq',
            icon: 'mso-quiz',
          },
          {
            name: 'helpAndSupport',
            href: 'https://discord.gg/u7fQdqQt8c',
            icon: 'mso-error',
          },
        ],
      },
      {
        name: '',
        separator: false,
        list: [
          {
            name: 'logout',
            to: 'login',
            icon: 'mso-logout',
          },
        ],
      },
    ],
  },
)

const isShown = ref(false)

const resolveLinkAttribute = (item: ProfileListItem) => {
  return item.to ? { to: { name: item.to } } : item.href ? { href: item.href, target: '_blank' } : {}
}

// Fetch profile when component mounts
onMounted(async () => {
  if (!profile.value) {
    try {
      await userStore.fetchUserProfile()
    } catch (error) {
      console.error('Failed to load profile in navbar:', error)
    }
  }
})
</script>

<style lang="scss">
.profile-dropdown {
  cursor: pointer;

  &__content {
    .menu-item:hover {
      background: var(--hover-color);
    }
  }

  &__anchor {
    display: inline-block;
  }
}

.profile-info-header {
  .user-name {
    font-size: 0.95rem;
    font-weight: 600;
    color: var(--va-text-primary);
    margin: 0 0 0.25rem 0;
  }

  .user-email {
    font-size: 0.8rem;
    color: var(--va-text-secondary);
    margin: 0;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }
}
</style>
