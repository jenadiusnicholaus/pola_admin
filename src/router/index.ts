import { createRouter, createWebHistory, RouteRecordRaw } from 'vue-router'

import AuthLayout from '../layouts/AuthLayout.vue'
import AppLayout from '../layouts/AppLayout.vue'

import RouteViewComponent from '../layouts/RouterBypass.vue'
import { userAuthGuard } from './guards'

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
        name: 'analytics-dashboard',
        path: 'analytics',
        component: () => import('../pages/admin/AnalyticsDashboardPage.vue'),
      },
      {
        name: 'admin-users',
        path: 'admin-users',
        component: () => import('../pages/users/AdminUsersPage.vue'),
      },
      {
        name: 'admin-verification',
        path: 'admin-verification',
        component: RouteViewComponent,
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
        path: 'subscriptions',
        component: RouteViewComponent,
        children: [
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
        ],
      },
      {
        name: 'call-credits',
        path: 'call-credits',
        component: RouteViewComponent,
        redirect: { name: 'call-credits-analytics' },
        children: [
          {
            name: 'call-credits-analytics',
            path: 'analytics',
            component: () => import('../pages/call-credits/CallCreditsAnalyticsPage.vue'),
          },
          {
            name: 'call-credit-bundles',
            path: 'bundles',
            component: () => import('../pages/call-credits/CallCreditBundlesPage.vue'),
          },
          {
            name: 'user-call-credits',
            path: 'user-credits',
            component: () => import('../pages/call-credits/UserCallCreditsPage.vue'),
          },
        ],
      },
      {
        name: 'consultations',
        path: 'consultations',
        component: RouteViewComponent,
        children: [
          {
            name: 'consultant-requests',
            path: 'requests',
            component: () => import('../pages/consultations/ConsultantRequestsPage.vue'),
          },
          {
            name: 'consultants',
            path: 'consultants',
            component: () => import('../pages/consultations/ConsultantsPage.vue'),
          },
          {
            name: 'bookings',
            path: 'bookings',
            component: () => import('../pages/consultations/BookingsPage.vue'),
          },
        ],
      },
      {
        name: 'questions',
        path: 'questions',
        component: () => import('../pages/questions/QuestionsManagementPage.vue'),
      },
      {
        name: 'documents',
        path: 'documents',
        component: RouteViewComponent,
        children: [
          {
            name: 'materials',
            path: 'materials',
            component: () => import('../pages/documents/MaterialsPage.vue'),
          },
        ],
      },
      {
        name: 'hubs',
        path: 'hubs',
        component: RouteViewComponent,
        children: [
          {
            name: 'legal-education',
            path: 'legal-education',
            component: () => import('../pages/hubs/LegalEducationPage.vue'),
          },
          {
            name: 'subtopics',
            path: 'legal-education/:topicId/subtopics',
            component: () => import('../pages/hubs/SubtopicsPage.vue'),
          },
          {
            name: 'hubs-materials',
            path: 'legal-education/:topicId/subtopics/:subtopicId/materials',
            component: () => import('../pages/hubs/MaterialsPage.vue'),
          },
          {
            name: 'hub-forums',
            path: 'forums',
            component: () => import('../pages/hubs/HubForumsPage.vue'),
          },
        ],
      },
      {
        name: 'disbursements',
        path: 'disbursements',
        component: RouteViewComponent,
        children: [
          {
            path: '',
            redirect: { name: 'disbursements-list' },
          },
          {
            name: 'disbursements-list',
            path: 'list',
            component: () => import('../pages/disbursements/DisbursementsPage.vue'),
          },
          {
            name: 'consultant-earnings',
            path: 'consultant-earnings',
            component: () => import('../pages/disbursements/ConsultantEarningsPage.vue'),
          },
          {
            name: 'uploader-earnings',
            path: 'uploader-earnings',
            component: () => import('../pages/disbursements/UploaderEarningsPage.vue'),
          },
        ],
      },
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
      {
        name: 'billing',
        path: 'billing',
        component: () => import('../pages/billing/BillingPage.vue'),
      },
      {
        name: 'faq',
        path: 'faq',
        component: () => import('../pages/faq/FaqPage.vue'),
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
