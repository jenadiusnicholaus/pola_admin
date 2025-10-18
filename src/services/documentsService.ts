/**
 * Documents Service
 * Handles learning materials management and approval
 */

import { subscriptionApiClient, buildUrl } from './subscriptionApiClient'

// Types
export interface LearningMaterial {
  id: number
  title: string
  description: string
  category: string
  category_display: string
  uploader: number
  uploader_email: string
  uploader_name: string
  uploader_type: string
  price: string
  currency: string
  file_url: string
  file_size: number
  downloads_count: number
  status: 'pending' | 'approved' | 'rejected'
  admin_note?: string
  created_at: string
  updated_at: string
  approved_at?: string
  rejected_at?: string
}

export interface DocumentFilters {
  category?: string
  status?: string
  uploader_type?: string
  email?: string
  start_date?: string
  end_date?: string
  page?: number
  page_size?: number
}

export interface DocumentStatistics {
  total_materials: number
  pending_materials: number
  approved_materials: number
  rejected_materials: number
  total_downloads: number
  total_revenue: number
  materials_by_category: Record<string, number>
}

export interface CreateMaterialData {
  title: string
  description: string
  category: string
  uploader_type: string
  price: number | string
  currency?: string
  file: File
}

export interface ApproveRejectData {
  admin_note?: string
}

export interface UpdatePriceData {
  price: number | string
  reason?: string
}

export const documentsService = {
  /**
   * Get all learning materials with filters
   */
  getMaterials: async (filters: DocumentFilters = {}): Promise<{ results: LearningMaterial[]; count: number }> => {
    const params = new URLSearchParams()
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        params.append(key, String(value))
      }
    })
    const response = await subscriptionApiClient.get(buildUrl(`/admin/documents/materials/?${params.toString()}`))
    return response.data
  },

  /**
   * Get material by ID
   */
  getMaterialById: async (id: number): Promise<LearningMaterial> => {
    const response = await subscriptionApiClient.get(buildUrl(`/admin/documents/materials/${id}/`))
    return response.data
  },

  /**
   * Create learning material
   */
  createMaterial: async (data: CreateMaterialData): Promise<LearningMaterial> => {
    const formData = new FormData()
    Object.entries(data).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        formData.append(key, value)
      }
    })
    const response = await subscriptionApiClient.post(buildUrl('/admin/documents/materials/'), formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    })
    return response.data
  },

  /**
   * Update learning material
   */
  updateMaterial: async (id: number, data: Partial<CreateMaterialData>): Promise<LearningMaterial> => {
    const formData = new FormData()
    Object.entries(data).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        formData.append(key, typeof value === 'number' ? value.toString() : value)
      }
    })
    const response = await subscriptionApiClient.patch(buildUrl(`/admin/documents/materials/${id}/`), formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    })
    return response.data
  },

  /**
   * Delete learning material
   */
  deleteMaterial: async (id: number): Promise<void> => {
    await subscriptionApiClient.delete(buildUrl(`/admin/documents/materials/${id}/`))
  },

  /**
   * Approve learning material
   */
  approveMaterial: async (id: number, data: ApproveRejectData = {}): Promise<LearningMaterial> => {
    const response = await subscriptionApiClient.post(buildUrl(`/admin/documents/materials/${id}/approve/`), data)
    return response.data
  },

  /**
   * Reject learning material
   */
  rejectMaterial: async (id: number, data: ApproveRejectData): Promise<LearningMaterial> => {
    const response = await subscriptionApiClient.post(buildUrl(`/admin/documents/materials/${id}/reject/`), data)
    return response.data
  },

  /**
   * Update material price
   */
  updatePrice: async (id: number, data: UpdatePriceData): Promise<LearningMaterial> => {
    const response = await subscriptionApiClient.post(buildUrl(`/admin/documents/materials/${id}/update-price/`), data)
    return response.data
  },

  /**
   * Get document statistics
   * GET /api/v1/admin/documents/materials/stats/
   */
  getStatistics: async (): Promise<DocumentStatistics> => {
    const response = await subscriptionApiClient.get(buildUrl('/admin/documents/materials/stats/'))
    return response.data
  },

  /**
   * Get document revenue
   */
  getRevenue: async (filters: DocumentFilters = {}): Promise<any> => {
    const params = new URLSearchParams()
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        params.append(key, String(value))
      }
    })
    const response = await subscriptionApiClient.get(buildUrl(`/admin/documents/revenue/?${params.toString()}`))
    return response.data
  },
}

export default documentsService
