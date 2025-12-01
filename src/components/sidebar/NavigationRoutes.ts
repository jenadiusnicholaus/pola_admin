export interface INavigationRoute {
  name: string
  displayName: string
  meta: { icon: string }
  children?: INavigationRoute[]
}

export default {
  root: {
    name: '/',
    displayName: 'navigationRoutes.home',
  },
  routes: [
    {
      name: 'dashboard',
      displayName: 'menu.dashboard',
      meta: {
        icon: 'vuestic-iconset-dashboard',
      },
    },
    // {
    //   name: 'projects',
    //   displayName: 'menu.projects',
    //   meta: {
    //     icon: 'folder_shared',
    //   },
    // },
    // {
    //   name: 'payments',
    //   displayName: 'menu.payments',
    //   meta: {
    //     icon: 'credit_card',
    //   },
    //   children: [
    //     {
    //       name: 'payment-methods',
    //       displayName: 'menu.payment-methods',
    //     },
    //     {
    //       name: 'pricing-plans',
    //       displayName: 'menu.pricing-plans',
    //     },
    //     {
    //       name: 'billing',
    //       displayName: 'menu.billing',
    //     },
    //   ],
    // },
    // {
    //   name: 'auth',
    //   displayName: 'menu.auth',
    //   meta: {
    //     icon: 'login',
    //   },
    //   children: [
    //     {
    //       name: 'login',
    //       displayName: 'menu.login',
    //     },
    //     {
    //       name: 'signup',
    //       displayName: 'menu.signup',
    //     },
    //     {
    //       name: 'recover-password',
    //       displayName: 'menu.recover-password',
    //     },
    //   ],
    // },

    // {
    //   name: 'faq',
    //   displayName: 'menu.faq',
    //   meta: {
    //     icon: 'quiz',
    //   },
    // },
    // {
    //   name: '404',
    //   displayName: 'menu.404',
    //   meta: {
    //     icon: 'vuestic-iconset-files',
    //   },
    // },
    // {
    //   name: 'preferences',
    //   displayName: 'menu.preferences',
    //   meta: {
    //     icon: 'manage_accounts',
    //   },
    // },
    // {
    //   name: 'settings',
    //   displayName: 'menu.settings',
    //   meta: {
    //     icon: 'settings',
    //   },
    // },
    {
      name: 'analytics-dashboard',
      displayName: 'menu.analytics',
      meta: {
        icon: 'analytics',
      },
    },
    {
      name: 'admin-users',
      displayName: 'menu.admin-users',
      meta: {
        icon: 'admin_panel_settings',
      },
    },
    {
      name: 'admin-verification',
      displayName: 'menu.admin-verification',
      meta: {
        icon: 'verified_user',
      },
      children: [
        {
          name: 'verification-dashboard',
          displayName: 'menu.verification-dashboard',
        },
        {
          name: 'verification-list',
          displayName: 'menu.verification-list',
        },
        {
          name: 'document-review',
          displayName: 'menu.document-review',
        },
      ],
    },
    {
      name: 'subscriptions',
      displayName: 'menu.subscriptions',
      meta: {
        icon: 'subscriptions',
      },
      children: [
        {
          name: 'plans',
          displayName: 'menu.plans',
        },
        {
          name: 'subscriptions-list',
          displayName: 'menu.user-subscriptions',
        },
        {
          name: 'transactions',
          displayName: 'menu.transactions',
        },
      ],
    },
    {
      name: 'call-credits',
      displayName: 'menu.call-credits',
      meta: {
        icon: 'call',
      },
      children: [
        {
          name: 'call-credits-analytics',
          displayName: 'menu.analytics',
        },
        {
          name: 'call-credit-bundles',
          displayName: 'menu.bundles',
        },
        {
          name: 'user-call-credits',
          displayName: 'menu.user-credits',
        },
      ],
    },
    {
      name: 'consultations',
      displayName: 'menu.consultations',
      meta: {
        icon: 'groups',
      },
      children: [
        {
          name: 'consultant-requests',
          displayName: 'menu.consultant-requests',
        },
        {
          name: 'consultants',
          displayName: 'menu.consultants',
        },
        {
          name: 'bookings',
          displayName: 'menu.bookings',
        },
      ],
    },
    {
      name: 'questions',
      displayName: 'menu.questions',
      meta: {
        icon: 'help',
      },
    },
    {
      name: 'documents',
      displayName: 'menu.documents',
      meta: {
        icon: 'description',
      },
      children: [
        {
          name: 'materials',
          displayName: 'menu.materials',
        },
      ],
    },
    {
      name: 'hubs',
      displayName: 'menu.hubs',
      meta: {
        icon: 'hub',
      },
      children: [
        {
          name: 'legal-education',
          displayName: 'menu.legalEducation',
        },
        {
          name: 'hub-forums',
          displayName: 'menu.hubForums',
        },
      ],
    },
    {
      name: 'disbursements',
      displayName: 'menu.disbursements',
      meta: {
        icon: 'payments',
      },
      children: [
        {
          name: 'disbursements-list',
          displayName: 'menu.disbursementsList',
        },
        {
          name: 'consultant-earnings',
          displayName: 'menu.consultantEarnings',
        },
        {
          name: 'uploader-earnings',
          displayName: 'menu.uploaderEarnings',
        },
      ],
    },
  ] as INavigationRoute[],
}
