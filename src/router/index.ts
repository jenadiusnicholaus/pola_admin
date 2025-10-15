import { createRouter, createWebHistory, RouteRecordRaw } from 'vue-router'

import AuthLayout from '../layouts/AuthLayout.vue'
import AppLayout from '../layouts/AppLayout.vue'

import RouteViewComponent from '../layouts/RouterBypass.vue'
import { adminAuthGuard, userAuthGuard } from './guards'

const routes: Array<RouteRecordRaw> = [
  {
    path: '/:pathMatch(.*)*',
    redirect: { name: 'dashboard' },
  },
  {
    name: 'admin',
    path: '/',
    component: AppLayout,
    redirect: { name: 'dashboard' },
    beforeEnter: userAuthGuard,
    children: [
      {
        name: 'dashboard',
        path: 'dashboard',
        component: () => import('../pages/admin/dashboard/Dashboard.vue'),
      },
      {
        name: 'settings',
        path: 'settings',
        component: () => import('../pages/settings/Settings.vue'),
      },
      {
        name: 'preferences',
        path: 'preferences',
        component: () => import('../pages/preferences/Preferences.vue'),
      },
      {
        name: 'admin-users',
        path: 'admin-users',
        component: () => import('../pages/users/AdminUsersPage.vue'),
        beforeEnter: adminAuthGuard,
      },
      {
        name: 'projects',
        path: 'projects',
        component: () => import('../pages/projects/ProjectsPage.vue'),
      },
      {
        name: 'payments',
        path: '/payments',
        component: RouteViewComponent,
        children: [
          {
            name: 'billing',
            path: 'billing',
            component: () => import('../pages/billing/BillingPage.vue'),
          },
          {
            name: 'pricing-plans',
            path: 'pricing-plans',
            component: () => import('../pages/pricing-plans/PricingPlans.vue'),
          },
        ],
      },
      {
        name: 'faq',
        path: '/faq',
        component: () => import('../pages/faq/FaqPage.vue'),
      },
      {
        name: 'user',
        path: '/user',
        component: RouteViewComponent,
        children: [
          {
            name: 'user-profile',
            path: 'profile',
            component: () => import('../pages/user/UserProfile.vue'),
          },
          {
            name: 'user-verification',
            path: 'verification',
            component: () => import('../pages/user/UserVerificationPage.vue'),
          },
        ],
      },
      {
        name: 'admin-verification',
        path: '/admin-verification',
        component: RouteViewComponent,
        beforeEnter: adminAuthGuard,
        children: [
          {
            name: 'verification-dashboard',
            path: 'v-dashboard',
            component: () => import('../pages/admin/pages/verification/VerificationDashboard.vue'),
          },
          {
            name: 'verification-list',
            path: 'verifications',
            component: () => import('../pages/admin/pages/verification/VerificationList.vue'),
          },
          {
            name: 'verification-details',
            path: 'verifications/:id',
            component: () => import('../pages/admin/pages/verification/VerificationDetails.vue'),
          },
          {
            name: 'document-review',
            path: 'documents',
            component: () => import('../pages/admin/pages/verification/DocumentReview.vue'),
          },
        ],
      },
      {
        name: 'subscriptions',
        path: '/subscriptions',
        component: RouteViewComponent,
        children: [
          {
            name: 'subscriptions-dashboard',
            path: 'dashboard',
            component: () => import('../pages/subscriptions/SubscriptionsDashboard.vue'),
          },
          {
            name: 'plans',
            path: 'plans',
            component: () => import('../pages/subscriptions/plans/PlansPage.vue'),
          },
          {
            name: 'subscriptions-list',
            path: 'subscriptions',
            component: () => import('../pages/subscriptions/subscriptions/SubscriptionsPage.vue'),
          },
          {
            name: 'transactions',
            path: 'transactions',
            component: () => import('../pages/subscriptions/transactions/TransactionsPage.vue'),
          },
          {
            name: 'wallets',
            path: 'wallets',
            component: () => import('../pages/subscriptions/wallets/WalletsPage.vue'),
          },
        ],
      },
    ],
  },
  {
    path: '/auth',
    component: AuthLayout,
    children: [
      {
        name: 'login',
        path: 'login',
        component: () => import('../pages/auth/Login.vue'),
      },
      {
        name: 'signup',
        path: 'signup',
        component: () => import('../pages/auth/Signup.vue'),
      },
      {
        name: 'recover-password',
        path: 'recover-password',
        component: () => import('../pages/auth/RecoverPassword.vue'),
      },
      {
        name: 'recover-password-email',
        path: 'recover-password-email',
        component: () => import('../pages/auth/CheckTheEmail.vue'),
      },
      {
        path: '',
        redirect: { name: 'login' },
      },
    ],
  },
  {
    name: '404',
    path: '/404',
    component: () => import('../pages/404.vue'),
  },
]

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  scrollBehavior(to, from, savedPosition) {
    if (savedPosition) {
      return savedPosition
    }
    // For some reason using documentation example doesn't scroll on page navigation.
    if (to.hash) {
      return { el: to.hash, behavior: 'smooth' }
    } else {
      window.scrollTo(0, 0)
    }
  },
  routes,
})

export default router
