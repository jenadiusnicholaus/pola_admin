/**
 * Centralized API Configuration
 * All API endpoints are defined here using environment variables
 */

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api/v1'

/**
 * Helper function to replace {id} placeholders in URLs
 */
const buildUrl = (endpoint: string, params?: Record<string, string | number>): string => {
  let url = `${API_BASE_URL}${endpoint}`

  if (params) {
    Object.entries(params).forEach(([key, value]) => {
      url = url.replace(`{${key}}`, String(value))
    })
  }

  return url
}

/**
 * API Endpoints Configuration
 */
export const API_ENDPOINTS = {
  // Authentication
  auth: {
    adminLogin: () => buildUrl(import.meta.env.VITE_AUTH_ADMIN_LOGIN || '/authentication/admin-login/'),
    register: () => buildUrl(import.meta.env.VITE_AUTH_REGISTER || '/authentication/register/'),
    login: () => buildUrl(import.meta.env.VITE_AUTH_LOGIN || '/authentication/login/'),
    refresh: () => buildUrl(import.meta.env.VITE_AUTH_REFRESH || '/authentication/refresh/'),
    logout: () => buildUrl(import.meta.env.VITE_AUTH_LOGOUT || '/authentication/logout/'),
    activate: () => buildUrl(import.meta.env.VITE_AUTH_ACTIVATE || '/authentication/activate-account/'),
    resendOtp: () => buildUrl(import.meta.env.VITE_AUTH_RESEND_OTP || '/authentication/resend-otp/'),
    resetPassword: () => buildUrl(import.meta.env.VITE_AUTH_RESET_PASSWORD || '/authentication/reset-password/'),
    confirmReset: () => buildUrl(import.meta.env.VITE_AUTH_CONFIRM_RESET || '/authentication/confirm-reset-password/'),
  },

  // Admin User Management
  adminUsers: {
    list: () => buildUrl(import.meta.env.VITE_ADMIN_USERS || '/admin/auth/users/'),
    detail: (id: number) =>
      buildUrl(import.meta.env.VITE_ADMIN_USERS || '/admin/auth/users/', { id: String(id) }) + `${id}/`,
    create: () => buildUrl(import.meta.env.VITE_ADMIN_USERS || '/admin/auth/users/'),
    update: (id: number) =>
      buildUrl(import.meta.env.VITE_ADMIN_USERS || '/admin/auth/users/', { id: String(id) }) + `${id}/`,
    delete: (id: number) =>
      buildUrl(import.meta.env.VITE_ADMIN_USERS || '/admin/auth/users/', { id: String(id) }) + `${id}/`,
    stats: () => buildUrl(import.meta.env.VITE_ADMIN_USERS_STATS || '/admin/auth/users/stats/'),
    assignRole: (id: number) =>
      buildUrl(import.meta.env.VITE_ADMIN_USERS_ASSIGN_ROLE || '/admin/auth/users/{id}/assign_role/', {
        id: String(id),
      }),
    toggleActive: (id: number) =>
      buildUrl(import.meta.env.VITE_ADMIN_USERS_TOGGLE_ACTIVE || '/admin/auth/users/{id}/toggle_active/', {
        id: String(id),
      }),
    makeStaff: (id: number) =>
      buildUrl(import.meta.env.VITE_ADMIN_USERS_MAKE_STAFF || '/admin/auth/users/{id}/make_staff/', { id: String(id) }),
    removeStaff: (id: number) =>
      buildUrl(import.meta.env.VITE_ADMIN_USERS_REMOVE_STAFF || '/admin/auth/users/{id}/remove_staff/', {
        id: String(id),
      }),
  },

  // Permission Management
  permissions: {
    list: () => buildUrl(import.meta.env.VITE_ADMIN_PERMISSIONS || '/admin/auth/permissions/'),
    userPermissions: (id: number) =>
      buildUrl(import.meta.env.VITE_ADMIN_PERMISSIONS_USER || '/admin/auth/permissions/user/{id}/', { id: String(id) }),
    assign: () => buildUrl(import.meta.env.VITE_ADMIN_PERMISSIONS_ASSIGN || '/admin/auth/permissions/assign/'),
    revoke: () => buildUrl(import.meta.env.VITE_ADMIN_PERMISSIONS_REVOKE || '/admin/auth/permissions/revoke/'),
  },

  // Verification Management
  verifications: {
    list: () => buildUrl(import.meta.env.VITE_VERIFICATIONS_ALL || '/authentication/verifications/'),
    detail: (id: number) =>
      buildUrl(import.meta.env.VITE_VERIFICATIONS_DETAIL || '/authentication/verifications/{id}/', { id: String(id) }),
    approve: (id: number) =>
      buildUrl(import.meta.env.VITE_VERIFICATIONS_APPROVE || '/authentication/verifications/{id}/approve/', {
        id: String(id),
      }),
    reject: (id: number) =>
      buildUrl(import.meta.env.VITE_VERIFICATIONS_REJECT || '/authentication/verifications/{id}/reject/', {
        id: String(id),
      }),
    verifyStep: (id: number) =>
      buildUrl(import.meta.env.VITE_VERIFICATIONS_VERIFY_STEP || '/authentication/verifications/{id}/verify_step/', {
        id: String(id),
      }),
    requestDocs: (id: number) =>
      buildUrl(
        import.meta.env.VITE_VERIFICATIONS_REQUEST_DOCS || '/authentication/verifications/{id}/request_documents/',
        { id: String(id) },
      ),
    byRole: () => buildUrl(import.meta.env.VITE_VERIFICATIONS_BY_ROLE || '/authentication/verifications/by_role/'),
    pending: () => buildUrl(import.meta.env.VITE_VERIFICATIONS_PENDING || '/authentication/verifications/pending/'),
    statistics: () =>
      buildUrl(import.meta.env.VITE_VERIFICATIONS_STATISTICS || '/authentication/admin-verification/statistics/'),
    pendingDocs: () =>
      buildUrl(
        import.meta.env.VITE_VERIFICATIONS_PENDING_DOCS || '/authentication/admin-verification/pending_documents/',
      ),
    usersNeedingReview: () =>
      buildUrl(
        import.meta.env.VITE_VERIFICATIONS_USERS_NEEDING_REVIEW ||
          '/authentication/admin-verification/users_needing_review/',
      ),
  },

  // Document Management
  documents: {
    list: () => buildUrl(import.meta.env.VITE_DOCUMENTS || '/authentication/documents/'),
    detail: (id: number) =>
      buildUrl(import.meta.env.VITE_DOCUMENTS_DETAIL || '/authentication/documents/{id}/', { id: String(id) }),
    verify: (id: number) =>
      buildUrl(import.meta.env.VITE_DOCUMENTS_VERIFY || '/authentication/documents/{id}/verify/', { id: String(id) }),
    reject: (id: number) =>
      buildUrl(import.meta.env.VITE_DOCUMENTS_REJECT || '/authentication/documents/{id}/reject/', { id: String(id) }),
  },

  // Subscription Management
  subscriptions: {
    plans: {
      list: () => buildUrl(import.meta.env.VITE_SUBSCRIPTIONS_PLANS || '/admin/subscriptions/plans/'),
      detail: (id: number) =>
        buildUrl(import.meta.env.VITE_SUBSCRIPTIONS_PLANS_DETAIL || '/admin/subscriptions/plans/{id}/', {
          id: String(id),
        }),
      stats: () => buildUrl(import.meta.env.VITE_SUBSCRIPTIONS_PLANS_STATS || '/admin/subscriptions/plans/stats/'),
      create: () => buildUrl(import.meta.env.VITE_SUBSCRIPTIONS_PLANS || '/admin/subscriptions/plans/'),
      update: (id: number) =>
        buildUrl(import.meta.env.VITE_SUBSCRIPTIONS_PLANS_DETAIL || '/admin/subscriptions/plans/{id}/', {
          id: String(id),
        }),
      delete: (id: number) =>
        buildUrl(import.meta.env.VITE_SUBSCRIPTIONS_PLANS_DETAIL || '/admin/subscriptions/plans/{id}/', {
          id: String(id),
        }),
    },
    users: {
      list: () => buildUrl(import.meta.env.VITE_SUBSCRIPTIONS_USERS || '/admin/subscriptions/users/'),
      detail: (id: number) =>
        buildUrl(import.meta.env.VITE_SUBSCRIPTIONS_USERS_DETAIL || '/admin/subscriptions/users/{id}/', {
          id: String(id),
        }),
      stats: () => buildUrl(import.meta.env.VITE_SUBSCRIPTIONS_USERS_STATS || '/admin/subscriptions/users/stats/'),
      extend: (id: number) =>
        buildUrl(import.meta.env.VITE_SUBSCRIPTIONS_USERS_EXTEND || '/admin/subscriptions/users/{id}/extend/', {
          id: String(id),
        }),
      cancel: (id: number) =>
        buildUrl(import.meta.env.VITE_SUBSCRIPTIONS_USERS_CANCEL || '/admin/subscriptions/users/{id}/cancel/', {
          id: String(id),
        }),
      activate: (id: number) =>
        buildUrl(import.meta.env.VITE_SUBSCRIPTIONS_USERS_ACTIVATE || '/admin/subscriptions/users/{id}/activate/', {
          id: String(id),
        }),
      create: () =>
        buildUrl(import.meta.env.VITE_SUBSCRIPTIONS_CREATE || '/admin/subscriptions/users/create_for_user/'),
    },
    transactions: {
      list: () => buildUrl(import.meta.env.VITE_SUBSCRIPTIONS_TRANSACTIONS || '/admin/subscriptions/transactions/'),
      detail: (id: number) =>
        buildUrl(import.meta.env.VITE_SUBSCRIPTIONS_TRANSACTIONS_DETAIL || '/admin/subscriptions/transactions/{id}/', {
          id: String(id),
        }),
      stats: () =>
        buildUrl(
          import.meta.env.VITE_SUBSCRIPTIONS_TRANSACTIONS_STATS || '/admin/subscriptions/transactions/statistics/',
        ),
    },
  },

  // Disbursement Transaction Management
  transactions: {
    list: () => buildUrl(import.meta.env.VITE_TRANSACTIONS || '/admin/disbursements/transactions/'),
    detail: (id: number) =>
      buildUrl(import.meta.env.VITE_TRANSACTIONS_DETAIL || '/admin/disbursements/transactions/{id}/', {
        id: String(id),
      }),
    stats: () => buildUrl(import.meta.env.VITE_TRANSACTIONS_STATS || '/admin/disbursements/transactions/stats/'),
    approve: (id: number) =>
      buildUrl(import.meta.env.VITE_TRANSACTIONS_APPROVE || '/admin/disbursements/transactions/{id}/approve/', {
        id: String(id),
      }),
    reject: (id: number) =>
      buildUrl(import.meta.env.VITE_TRANSACTIONS_REJECT || '/admin/disbursements/transactions/{id}/reject/', {
        id: String(id),
      }),
  },

  // Wallet Management
  wallets: {
    list: () => buildUrl(import.meta.env.VITE_WALLETS || '/admin/disbursements/wallets/'),
    detail: (id: number) =>
      buildUrl(import.meta.env.VITE_WALLETS_DETAIL || '/admin/disbursements/wallets/{id}/', { id: String(id) }),
    stats: () => buildUrl(import.meta.env.VITE_WALLETS_STATS || '/admin/disbursements/wallets/stats/'),
  },

  // Disbursement Management
  disbursements: {
    list: () => buildUrl(import.meta.env.VITE_DISBURSEMENTS || '/admin/disbursements/'),
    detail: (id: number) =>
      buildUrl(import.meta.env.VITE_DISBURSEMENTS_DETAIL || '/admin/disbursements/{id}/', { id: String(id) }),
    process: (id: number) =>
      buildUrl(import.meta.env.VITE_DISBURSEMENTS_PROCESS || '/admin/disbursements/{id}/process/', { id: String(id) }),
    cancel: (id: number) =>
      buildUrl(import.meta.env.VITE_DISBURSEMENTS_CANCEL || '/admin/disbursements/{id}/cancel/', { id: String(id) }),
    checkStatus: (id: number) =>
      buildUrl(import.meta.env.VITE_DISBURSEMENTS_CHECK_STATUS || '/admin/disbursements/{id}/check_status/', {
        id: String(id),
      }),
    pending: () => buildUrl(import.meta.env.VITE_DISBURSEMENTS_PENDING || '/admin/disbursements/pending/'),
    statistics: () => buildUrl(import.meta.env.VITE_DISBURSEMENTS_STATISTICS || '/admin/disbursements/statistics/'),
  },

  // Earnings Management
  earnings: {
    consultant: () => buildUrl(import.meta.env.VITE_EARNINGS_CONSULTANT || '/admin/earnings/consultant/'),
    uploader: () => buildUrl(import.meta.env.VITE_EARNINGS_UPLOADER || '/admin/earnings/uploader/'),
    unpaid: () => buildUrl(import.meta.env.VITE_EARNINGS_UNPAID || '/admin/earnings/unpaid/'),
    summary: () => buildUrl(import.meta.env.VITE_EARNINGS_SUMMARY || '/admin/earnings/summary/'),
    bulkPayout: () => buildUrl(import.meta.env.VITE_EARNINGS_BULK_PAYOUT || '/admin/earnings/bulk_payout/'),
  },

  // Consultation Management
  consultations: {
    // Pricing
    pricing: {
      list: () => buildUrl(import.meta.env.VITE_CONSULTATIONS_PRICING || '/admin/consultations/pricing/'),
      detail: (id: number) =>
        buildUrl(import.meta.env.VITE_CONSULTATIONS_PRICING_DETAIL || '/admin/consultations/pricing/{id}/', {
          id: String(id),
        }),
    },
    // Consultants
    consultants: {
      list: () => buildUrl(import.meta.env.VITE_CONSULTATIONS_CONSULTANTS || '/admin/consultations/consultants/'),
      detail: (id: number) =>
        buildUrl(import.meta.env.VITE_CONSULTATIONS_CONSULTANTS_DETAIL || '/admin/consultations/consultants/{id}/', {
          id: String(id),
        }),
      toggleAvailability: (id: number) =>
        buildUrl(
          import.meta.env.VITE_CONSULTATIONS_CONSULTANTS_TOGGLE ||
            '/admin/consultations/consultants/{id}/toggle-availability/',
          { id: String(id) },
        ),
      bookings: (id: number) =>
        buildUrl(
          import.meta.env.VITE_CONSULTATIONS_CONSULTANTS_BOOKINGS || '/admin/consultations/consultants/{id}/bookings/',
          { id: String(id) },
        ),
      earnings: (id: number) =>
        buildUrl(
          import.meta.env.VITE_CONSULTATIONS_CONSULTANTS_EARNINGS || '/admin/consultations/consultants/{id}/earnings/',
          { id: String(id) },
        ),
    },
    // Bookings
    bookings: {
      list: () => buildUrl(import.meta.env.VITE_CONSULTATIONS_BOOKINGS || '/admin/consultations/bookings/'),
      detail: (id: number) =>
        buildUrl(import.meta.env.VITE_CONSULTATIONS_BOOKINGS_DETAIL || '/admin/consultations/bookings/{id}/', {
          id: String(id),
        }),
      updateStatus: (id: number) =>
        buildUrl(
          import.meta.env.VITE_CONSULTATIONS_BOOKINGS_UPDATE_STATUS ||
            '/admin/consultations/bookings/{id}/update-status/',
          { id: String(id) },
        ),
      stats: () =>
        buildUrl(import.meta.env.VITE_CONSULTATIONS_BOOKINGS_STATS || '/admin/consultations/bookings/stats/'),
    },
    // Revenue
    revenue: () => buildUrl(import.meta.env.VITE_CONSULTATIONS_REVENUE || '/admin/consultations/revenue/'),
  },

  // Call Credits Management
  callCredits: {
    // Bundle Management
    bundles: {
      list: () => buildUrl(import.meta.env.VITE_CALL_CREDITS_BUNDLES || '/admin/call-credits/bundles/'),
      detail: (id: number) =>
        buildUrl(import.meta.env.VITE_CALL_CREDITS_BUNDLES_DETAIL || '/admin/call-credits/bundles/{id}/', {
          id: String(id),
        }),
      activate: (id: number) =>
        buildUrl(import.meta.env.VITE_CALL_CREDITS_BUNDLES_ACTIVATE || '/admin/call-credits/bundles/{id}/activate/', {
          id: String(id),
        }),
      purchases: (id: number) =>
        buildUrl(import.meta.env.VITE_CALL_CREDITS_BUNDLES_PURCHASES || '/admin/call-credits/bundles/{id}/purchases/', {
          id: String(id),
        }),
    },
    // User Credits Management
    users: {
      list: () => buildUrl(import.meta.env.VITE_CALL_CREDITS_USERS || '/admin/call-credits/users/'),
      grant: () => buildUrl(import.meta.env.VITE_CALL_CREDITS_USERS_GRANT || '/admin/call-credits/users/grant/'),
      stats: () => buildUrl(import.meta.env.VITE_CALL_CREDITS_USERS_STATS || '/admin/call-credits/users/stats/'),
      usage: () => buildUrl(import.meta.env.VITE_CALL_CREDITS_USERS_USAGE || '/admin/call-credits/users/usage/'),
    },
    // Legacy endpoints (deprecated)
    list: () => buildUrl(import.meta.env.VITE_CALL_CREDITS || '/admin/call-credits/'),
    detail: (id: number) =>
      buildUrl(import.meta.env.VITE_CALL_CREDITS_DETAIL || '/admin/call-credits/{id}/', { id: String(id) }),
    stats: () => buildUrl(import.meta.env.VITE_CALL_CREDITS_STATS || '/admin/call-credits/stats/'),
    add: () => buildUrl(import.meta.env.VITE_CALL_CREDITS_ADD || '/admin/call-credits/add/'),
    deduct: () => buildUrl(import.meta.env.VITE_CALL_CREDITS_DEDUCT || '/admin/call-credits/deduct/'),
  },

  // Analytics
  analytics: {
    dashboard: () => buildUrl(import.meta.env.VITE_ANALYTICS_DASHBOARD || '/admin/analytics/dashboard/'),
    users: () => buildUrl(import.meta.env.VITE_ANALYTICS_USERS || '/admin/analytics/users/'),
    revenue: () => buildUrl(import.meta.env.VITE_ANALYTICS_REVENUE || '/admin/analytics/revenue/'),
    subscriptions: () => buildUrl(import.meta.env.VITE_ANALYTICS_SUBSCRIPTIONS || '/admin/analytics/subscriptions/'),
  },

  // Education Hubs Management
  hubs: {
    // Topics Management
    topics: {
      list: () => buildUrl(import.meta.env.VITE_HUBS_TOPICS || '/admin/hubs/topics/'),
      detail: (id: number) =>
        buildUrl(import.meta.env.VITE_HUBS_TOPICS_DETAIL || '/admin/hubs/topics/{id}/', { id: String(id) }),
      toggle: (id: number) =>
        buildUrl(import.meta.env.VITE_HUBS_TOPICS_TOGGLE || '/admin/hubs/topics/{id}/toggle/', { id: String(id) }),
      reorder: () => buildUrl(import.meta.env.VITE_HUBS_TOPICS_REORDER || '/admin/hubs/topics/reorder/'),
      bulkToggle: () => buildUrl(import.meta.env.VITE_HUBS_TOPICS_BULK_TOGGLE || '/admin/hubs/topics/bulk-toggle/'),
      stats: () => buildUrl(import.meta.env.VITE_HUBS_TOPICS_STATS || '/admin/hubs/topics/stats/'),
    },
    // Subtopics Management
    subtopics: {
      list: () => buildUrl(import.meta.env.VITE_HUBS_SUBTOPICS || '/admin/hubs/subtopics/'),
      detail: (id: number) =>
        buildUrl(import.meta.env.VITE_HUBS_SUBTOPICS_DETAIL || '/admin/hubs/subtopics/{id}/', { id: String(id) }),
      toggle: (id: number) =>
        buildUrl(import.meta.env.VITE_HUBS_SUBTOPICS_TOGGLE || '/admin/hubs/subtopics/{id}/toggle/', {
          id: String(id),
        }),
      reorder: () => buildUrl(import.meta.env.VITE_HUBS_SUBTOPICS_REORDER || '/admin/hubs/subtopics/reorder/'),
      bulkToggle: () =>
        buildUrl(import.meta.env.VITE_HUBS_SUBTOPICS_BULK_TOGGLE || '/admin/hubs/subtopics/bulk-toggle/'),
      stats: () => buildUrl(import.meta.env.VITE_HUBS_SUBTOPICS_STATS || '/admin/hubs/subtopics/stats/'),
      materials: (id: number) =>
        buildUrl(import.meta.env.VITE_HUBS_SUBTOPICS_MATERIALS || '/admin/hubs/subtopics/{id}/materials/', {
          id: String(id),
        }),
    },
    // Materials Management
    materials: {
      detail: (id: number) =>
        buildUrl(import.meta.env.VITE_HUBS_MATERIALS_DETAIL || '/admin/hubs/materials/{id}/', { id: String(id) }),
      approve: (id: number) =>
        buildUrl(import.meta.env.VITE_HUBS_MATERIALS_APPROVE || '/admin/hubs/materials/{id}/approve/', {
          id: String(id),
        }),
      reject: (id: number) =>
        buildUrl(import.meta.env.VITE_HUBS_MATERIALS_REJECT || '/admin/hubs/materials/{id}/reject/', {
          id: String(id),
        }),
      toggle: (id: number) =>
        buildUrl(import.meta.env.VITE_HUBS_MATERIALS_TOGGLE || '/admin/hubs/materials/{id}/toggle/', {
          id: String(id),
        }),
    },
  },
}

export default API_ENDPOINTS
