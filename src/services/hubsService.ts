/**
 * Hubs Service
 * Handles Legal Education Topics, Subtopics, and Materials management
 * Based on: /api/v1/admin/hubs/
 */

import makeRequest from './makeRequest'
import type IRequestParams from '../models/models'
import API_ENDPOINTS from './apiConfig'

// Types
export interface Topic {
  id: number
  name: string
  name_sw: string
  slug: string
  description: string
  description_sw: string
  icon: string
  display_order: number
  is_active: boolean
  subtopics_count: number
  materials_count: number
  created_at: string
  updated_at: string
}

export interface TopicDetail extends Topic {
  active_subtopics_count: number
  subtopics: Subtopic[]
}

export interface Subtopic {
  id: number
  topic: number
  topic_name?: string
  topic_name_sw?: string
  topic_slug?: string
  name: string
  name_sw: string
  slug: string
  description: string
  description_sw: string
  display_order: number
  is_active: boolean
  materials_count: number
  active_materials_count?: number
  approved_materials_count?: number
  created_at: string
  updated_at: string
}

export interface Material {
  id: number
  title: string
  description?: string
  uploader: {
    id: number
    email: string
    first_name: string
    last_name: string
    role_name: string
    is_active: boolean
  }
  uploader_type: string
  uploader_type_display: string
  category: string
  category_display: string
  file: string | null
  file_size: number
  file_size_mb: number
  price: string
  downloads_count: number
  total_revenue: string
  uploader_earnings: string
  is_active: boolean
  is_approved: boolean | null
  created_at: string
  updated_at: string
}

export interface TopicStatistics {
  total_topics: number
  active_topics: number
  inactive_topics: number
  total_subtopics: number
  total_materials: number
  topics_without_subtopics: number
  topics_without_materials: number
}

export interface SubtopicStatistics {
  total_subtopics: number
  active_subtopics: number
  inactive_subtopics: number
  total_materials: number
  subtopics_without_materials: number
  avg_materials_per_subtopic: number
}

export interface TopicFilters {
  is_active?: boolean
  search?: string
  no_subtopics?: boolean
  no_materials?: boolean
}

export interface SubtopicFilters {
  topic_id?: number
  is_active?: boolean
  search?: string
  no_materials?: boolean
}

export interface ReorderItem {
  id: number
  display_order: number
}

export interface BulkToggleData {
  ids: number[]
  is_active: boolean
}

export const hubsService = {
  // ==================== Topics Management ====================

  /**
   * Get all topics with filters
   * Endpoint: GET /api/v1/admin/hubs/topics/
   */
  getTopics: async (filters: TopicFilters = {}): Promise<Topic[]> => {
    console.log('🌐 [hubsService] getTopics called with filters:', filters)

    const queryParams = new URLSearchParams()
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        queryParams.append(key, String(value))
      }
    })

    const url = queryParams.toString()
      ? `${API_ENDPOINTS.hubs.topics.list()}?${queryParams.toString()}`
      : API_ENDPOINTS.hubs.topics.list()

    console.log('🌐 [hubsService] Full URL:', url)

    const params: IRequestParams = {
      url,
      method: 'GET',
    }

    console.log('🌐 [hubsService] Making request...')
    const response = await makeRequest(params)
    console.log('🌐 [hubsService] Response received:', response)
    console.log('🌐 [hubsService] Response data:', response.data)
    console.log('🌐 [hubsService] Response data type:', typeof response.data)
    console.log('🌐 [hubsService] Response data is Array?', Array.isArray(response.data))

    // Handle Django REST Framework paginated response
    if (response.data && typeof response.data === 'object' && 'results' in response.data) {
      console.log('🌐 [hubsService] Detected paginated response')
      console.log('🌐 [hubsService] results:', response.data.results)
      console.log('🌐 [hubsService] results.length:', response.data.results?.length || 0)
      return response.data.results as Topic[]
    }

    // Handle direct array response
    if (Array.isArray(response.data)) {
      console.log('🌐 [hubsService] Detected direct array response')
      console.log('🌐 [hubsService] array.length:', response.data.length)
      return response.data
    }

    // Fallback: return empty array if format is unexpected
    console.warn('⚠️ [hubsService] Unexpected response format from getTopics:', response.data)
    return []
  },

  /**
   * Get topic details by ID
   * Endpoint: GET /api/v1/admin/hubs/topics/{id}/
   */
  getTopicById: async (id: number): Promise<TopicDetail> => {
    const params: IRequestParams = {
      url: API_ENDPOINTS.hubs.topics.detail(id),
      method: 'GET',
    }
    const response = await makeRequest(params)
    return response.data
  },

  /**
   * Create a new topic
   * Endpoint: POST /api/v1/admin/hubs/topics/
   */
  createTopic: async (data: {
    name: string
    name_sw: string
    slug?: string
    description: string
    description_sw: string
    icon: string
    display_order: number
    is_active: boolean
  }): Promise<Topic> => {
    const params: IRequestParams = {
      url: API_ENDPOINTS.hubs.topics.list(),
      method: 'POST',
      data,
    }
    const response = await makeRequest(params)
    return response.data
  },

  /**
   * Update a topic (full update)
   * Endpoint: PUT /api/v1/admin/hubs/topics/{id}/
   */
  updateTopic: async (
    id: number,
    data: {
      name: string
      name_sw: string
      slug: string
      description: string
      description_sw: string
      icon: string
      display_order: number
      is_active: boolean
    },
  ): Promise<Topic> => {
    const params: IRequestParams = {
      url: API_ENDPOINTS.hubs.topics.detail(id),
      method: 'PUT',
      data,
    }
    const response = await makeRequest(params)
    return response.data
  },

  /**
   * Update a topic (partial update)
   * Endpoint: PATCH /api/v1/admin/hubs/topics/{id}/
   */
  patchTopic: async (id: number, data: Partial<Topic>): Promise<Topic> => {
    const params: IRequestParams = {
      url: API_ENDPOINTS.hubs.topics.detail(id),
      method: 'PATCH',
      data,
    }
    const response = await makeRequest(params)
    return response.data
  },

  /**
   * Delete a topic
   * Endpoint: DELETE /api/v1/admin/hubs/topics/{id}/
   */
  deleteTopic: async (id: number): Promise<void> => {
    const params: IRequestParams = {
      url: API_ENDPOINTS.hubs.topics.detail(id),
      method: 'DELETE',
    }
    await makeRequest(params)
  },

  /**
   * Toggle topic active status
   * Endpoint: POST /api/v1/admin/hubs/topics/{id}/toggle/
   */
  toggleTopic: async (id: number, is_active?: boolean): Promise<any> => {
    const params: IRequestParams = {
      url: API_ENDPOINTS.hubs.topics.toggle(id),
      method: 'POST',
      data: is_active !== undefined ? { is_active } : {},
    }
    const response = await makeRequest(params)
    return response.data
  },

  /**
   * Reorder topics
   * Endpoint: POST /api/v1/admin/hubs/topics/reorder/
   */
  reorderTopics: async (items: ReorderItem[]): Promise<any> => {
    const params: IRequestParams = {
      url: API_ENDPOINTS.hubs.topics.reorder(),
      method: 'POST',
      data: { items },
    }
    const response = await makeRequest(params)
    return response.data
  },

  /**
   * Bulk toggle topics active status
   * Endpoint: POST /api/v1/admin/hubs/topics/bulk-toggle/
   */
  bulkToggleTopics: async (data: BulkToggleData): Promise<any> => {
    const params: IRequestParams = {
      url: API_ENDPOINTS.hubs.topics.bulkToggle(),
      method: 'POST',
      data,
    }
    const response = await makeRequest(params)
    return response.data
  },

  /**
   * Get topic statistics
   * Endpoint: GET /api/v1/admin/hubs/topics/stats/
   */
  getTopicStats: async (): Promise<TopicStatistics> => {
    const params: IRequestParams = {
      url: API_ENDPOINTS.hubs.topics.stats(),
      method: 'GET',
    }
    const response = await makeRequest(params)
    return response.data
  },

  // ==================== Subtopics Management ====================

  /**
   * Get all subtopics with filters
   * Endpoint: GET /api/v1/admin/hubs/subtopics/
   */
  getSubtopics: async (filters: SubtopicFilters = {}): Promise<Subtopic[]> => {
    const queryParams = new URLSearchParams()
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        queryParams.append(key, String(value))
      }
    })

    const url = queryParams.toString()
      ? `${API_ENDPOINTS.hubs.subtopics.list()}?${queryParams.toString()}`
      : API_ENDPOINTS.hubs.subtopics.list()

    const params: IRequestParams = {
      url,
      method: 'GET',
    }
    const response = await makeRequest(params)

    // Handle Django REST Framework paginated response
    if (response.data && typeof response.data === 'object' && 'results' in response.data) {
      return response.data.results as Subtopic[]
    }

    // Handle direct array response
    if (Array.isArray(response.data)) {
      return response.data
    }

    // Fallback: return empty array if format is unexpected
    console.warn('⚠️ [hubsService] Unexpected response format from getSubtopics:', response.data)
    return []
  },

  /**
   * Get subtopic details by ID
   * Endpoint: GET /api/v1/admin/hubs/subtopics/{id}/
   */
  getSubtopicById: async (id: number): Promise<Subtopic> => {
    const params: IRequestParams = {
      url: API_ENDPOINTS.hubs.subtopics.detail(id),
      method: 'GET',
    }
    const response = await makeRequest(params)
    return response.data
  },

  /**
   * Create a new subtopic
   * Endpoint: POST /api/v1/admin/hubs/subtopics/
   */
  createSubtopic: async (data: {
    topic: number
    name: string
    name_sw: string
    slug?: string
    description: string
    description_sw: string
    display_order: number
    is_active: boolean
  }): Promise<Subtopic> => {
    const params: IRequestParams = {
      url: API_ENDPOINTS.hubs.subtopics.list(),
      method: 'POST',
      data,
    }
    const response = await makeRequest(params)
    return response.data
  },

  /**
   * Update a subtopic (full update)
   * Endpoint: PUT /api/v1/admin/hubs/subtopics/{id}/
   */
  updateSubtopic: async (
    id: number,
    data: {
      topic: number
      name: string
      name_sw: string
      slug: string
      description: string
      description_sw: string
      display_order: number
      is_active: boolean
    },
  ): Promise<Subtopic> => {
    const params: IRequestParams = {
      url: API_ENDPOINTS.hubs.subtopics.detail(id),
      method: 'PUT',
      data,
    }
    const response = await makeRequest(params)
    return response.data
  },

  /**
   * Update a subtopic (partial update)
   * Endpoint: PATCH /api/v1/admin/hubs/subtopics/{id}/
   */
  patchSubtopic: async (id: number, data: Partial<Subtopic>): Promise<Subtopic> => {
    const params: IRequestParams = {
      url: API_ENDPOINTS.hubs.subtopics.detail(id),
      method: 'PATCH',
      data,
    }
    const response = await makeRequest(params)
    return response.data
  },

  /**
   * Delete a subtopic
   * Endpoint: DELETE /api/v1/admin/hubs/subtopics/{id}/
   */
  deleteSubtopic: async (id: number): Promise<void> => {
    const params: IRequestParams = {
      url: API_ENDPOINTS.hubs.subtopics.detail(id),
      method: 'DELETE',
    }
    await makeRequest(params)
  },

  /**
   * Toggle subtopic active status
   * Endpoint: POST /api/v1/admin/hubs/subtopics/{id}/toggle/
   */
  toggleSubtopic: async (id: number, is_active?: boolean): Promise<any> => {
    const params: IRequestParams = {
      url: API_ENDPOINTS.hubs.subtopics.toggle(id),
      method: 'POST',
      data: is_active !== undefined ? { is_active } : {},
    }
    const response = await makeRequest(params)
    return response.data
  },

  /**
   * Reorder subtopics
   * Endpoint: POST /api/v1/admin/hubs/subtopics/reorder/
   */
  reorderSubtopics: async (items: ReorderItem[]): Promise<any> => {
    const params: IRequestParams = {
      url: API_ENDPOINTS.hubs.subtopics.reorder(),
      method: 'POST',
      data: { items },
    }
    const response = await makeRequest(params)
    return response.data
  },

  /**
   * Bulk toggle subtopics active status
   * Endpoint: POST /api/v1/admin/hubs/subtopics/bulk-toggle/
   */
  bulkToggleSubtopics: async (data: BulkToggleData): Promise<any> => {
    const params: IRequestParams = {
      url: API_ENDPOINTS.hubs.subtopics.bulkToggle(),
      method: 'POST',
      data,
    }
    const response = await makeRequest(params)
    return response.data
  },

  /**
   * Get subtopic materials
   * Endpoint: GET /api/v1/admin/hubs/subtopics/{id}/materials/
   */
  getSubtopicMaterials: async (
    id: number,
    filters?: { is_approved?: boolean; is_active?: boolean },
  ): Promise<{
    subtopic_id: number
    subtopic_name: string
    topic_name: string
    materials_count: number
    materials: Material[]
  }> => {
    const queryParams = new URLSearchParams()
    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          queryParams.append(key, String(value))
        }
      })
    }

    const url = queryParams.toString()
      ? `${API_ENDPOINTS.hubs.subtopics.materials(id)}?${queryParams.toString()}`
      : API_ENDPOINTS.hubs.subtopics.materials(id)

    const params: IRequestParams = {
      url,
      method: 'GET',
    }
    const response = await makeRequest(params)
    return response.data
  },

  /**
   * Get subtopic statistics
   * Endpoint: GET /api/v1/admin/hubs/subtopics/stats/
   */
  getSubtopicStats: async (topicId?: number): Promise<SubtopicStatistics> => {
    const baseUrl = API_ENDPOINTS.hubs.subtopics.stats()
    const url = topicId ? `${baseUrl}?topic_id=${topicId}` : baseUrl

    const params: IRequestParams = {
      url,
      method: 'GET',
    }
    const response = await makeRequest(params)
    return response.data
  },

  /**
   * Approve material
   * Endpoint: POST /api/v1/admin/hubs/materials/{id}/approve/
   */
  approveMaterial: async (id: number): Promise<void> => {
    const params: IRequestParams = {
      url: API_ENDPOINTS.hubs.materials.approve(id),
      method: 'POST',
    }
    await makeRequest(params)
  },

  /**
   * Reject material
   * Endpoint: POST /api/v1/admin/hubs/materials/{id}/reject/
   */
  rejectMaterial: async (id: number, reason?: string): Promise<void> => {
    const params: IRequestParams = {
      url: API_ENDPOINTS.hubs.materials.reject(id),
      method: 'POST',
      data: reason ? { reason } : undefined,
    }
    await makeRequest(params)
  },

  /**
   * Toggle material active status
   * Endpoint: POST /api/v1/admin/hubs/materials/{id}/toggle/
   */
  toggleMaterial: async (id: number): Promise<void> => {
    const params: IRequestParams = {
      url: API_ENDPOINTS.hubs.materials.toggle(id),
      method: 'POST',
    }
    await makeRequest(params)
  },

  /**
   * Delete material
   * Endpoint: DELETE /api/v1/admin/hubs/materials/{id}/
   */
  deleteMaterial: async (id: number): Promise<void> => {
    const params: IRequestParams = {
      url: API_ENDPOINTS.hubs.materials.detail(id),
      method: 'DELETE',
    }
    await makeRequest(params)
  },
}

export default hubsService
