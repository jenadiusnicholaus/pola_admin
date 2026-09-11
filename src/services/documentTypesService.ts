/**
 * Document Types admin API
 * Manages dynamic document types used by verification requirements.
 */
import axios from 'axios'

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api/v1'
const buildUrl = (path: string) => `${API_BASE_URL}${path}`

export interface DocumentType {
  id: number
  code: string
  label: string
  description: string
  is_active: boolean
  created_at: string
  updated_at: string
}

export const documentTypesService = {
  async list() {
    const { data } = await axios.get<DocumentType[]>(buildUrl('/authentication/document-types/'))
    return data
  },

  async retrieve(id: number) {
    const { data } = await axios.get<DocumentType>(buildUrl(`/authentication/document-types/${id}/`))
    return data
  },

  async create(payload: { code: string; label: string; description?: string; is_active?: boolean }) {
    const { data } = await axios.post<DocumentType>(buildUrl('/authentication/document-types/'), payload)
    return data
  },

  async update(id: number, payload: Partial<DocumentType>) {
    const { data } = await axios.patch<DocumentType>(buildUrl(`/authentication/document-types/${id}/`), payload)
    return data
  },

  async remove(id: number) {
    await axios.delete(buildUrl(`/authentication/document-types/${id}/`))
  },
}
