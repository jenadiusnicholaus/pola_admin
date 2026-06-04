import axios from 'axios'

const apiBaseUrl = import.meta.env.VITE_API_BASE_URL

export interface DocumentContent {
  id: number
  title: string
  title_sw: string
  slug: string
  category: string
  content: string
  content_sw: string
  is_active: boolean
  is_public: boolean
  display_order: number
  created_at: string
  updated_at: string
}

export interface DocumentContentList {
  count: number
  next: string | null
  previous: string | null
  results: DocumentContent[]
}

const documentContentService = {
  // Get all public documents
  getAllDocuments: async (params?: { category?: string; search?: string }): Promise<DocumentContentList> => {
    const queryParams = new URLSearchParams()
    if (params?.category) queryParams.append('category', params.category)
    if (params?.search) queryParams.append('search', params.search)

    const response = await axios.get(`${apiBaseUrl}/doc-templates/document-content/?${queryParams.toString()}`)
    return response.data
  },

  // Get document by slug
  getDocumentBySlug: async (slug: string): Promise<DocumentContent> => {
    const response = await axios.get(`${apiBaseUrl}/doc-templates/document-content/${slug}/`)
    return response.data
  },

  // Get document by category
  getDocumentsByCategory: async (category: string): Promise<DocumentContentList> => {
    const response = await axios.get(`${apiBaseUrl}/doc-templates/document-content/?category=${category}`)
    return response.data
  },
}

export default documentContentService
