/**
 * Sheria za Nchi / Tanzania Statutes admin API
 */
import axios from 'axios'

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api/v1'
const buildUrl = (path: string) => `${API_BASE_URL}${path}`

export interface StatuteCategory {
  id: number
  name: string
  name_sw: string
  slug: string
  description: string
  description_sw: string
  sort_order: number
  is_active: boolean
  deleted_at: string | null
  statutes_count: number
  created_at: string
  updated_at: string
}

export interface Statute {
  id: number
  title: string
  title_sw: string
  description: string
  description_sw: string
  file: string | null
  file_url: string
  file_size: number
  file_size_mb: number
  categories: { id: number; name: string; name_sw: string; slug: string }[]
  sort_order: number
  is_active: boolean
  deleted_at: string | null
  created_at: string
  updated_at: string
}

export interface Paginated<T> {
  count: number
  next: string | null
  previous: string | null
  results: T[]
}

export const statutesService = {
  async listCategories(params: Record<string, string | number | boolean | undefined> = {}) {
    const q = new URLSearchParams()
    Object.entries(params).forEach(([k, v]) => {
      if (v !== undefined && v !== null && v !== '') q.set(k, String(v))
    })
    const { data } = await axios.get<Paginated<StatuteCategory> | StatuteCategory[]>(
      buildUrl(`/statutes/categories/?${q.toString()}`),
    )
    return data
  },

  async createCategory(payload: Partial<StatuteCategory>) {
    const { data } = await axios.post<StatuteCategory>(buildUrl('/statutes/categories/'), payload)
    return data
  },

  async updateCategory(id: number, payload: Partial<StatuteCategory>) {
    const { data } = await axios.patch<StatuteCategory>(buildUrl(`/statutes/categories/${id}/`), payload)
    return data
  },

  async deleteCategory(id: number) {
    await axios.delete(buildUrl(`/statutes/categories/${id}/`))
  },

  async restoreCategory(id: number) {
    const { data } = await axios.post<StatuteCategory>(buildUrl(`/statutes/categories/${id}/restore/`))
    return data
  },

  async toggleCategory(id: number) {
    const { data } = await axios.post<StatuteCategory>(buildUrl(`/statutes/categories/${id}/toggle_active/`))
    return data
  },

  async listStatutes(params: Record<string, string | number | boolean | undefined> = {}) {
    const q = new URLSearchParams()
    Object.entries(params).forEach(([k, v]) => {
      if (v !== undefined && v !== null && v !== '') q.set(k, String(v))
    })
    const { data } = await axios.get<Paginated<Statute> | Statute[]>(buildUrl(`/statutes/laws/?${q.toString()}`))
    return data
  },

  async createStatute(formData: FormData) {
    const { data } = await axios.post<Statute>(buildUrl('/statutes/laws/'), formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    })
    return data
  },

  async updateStatute(id: number, formData: FormData) {
    const { data } = await axios.patch<Statute>(buildUrl(`/statutes/laws/${id}/`), formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    })
    return data
  },

  async deleteStatute(id: number) {
    await axios.delete(buildUrl(`/statutes/laws/${id}/`))
  },

  async restoreStatute(id: number) {
    const { data } = await axios.post<Statute>(buildUrl(`/statutes/laws/${id}/restore/`))
    return data
  },

  async toggleStatute(id: number) {
    const { data } = await axios.post<Statute>(buildUrl(`/statutes/laws/${id}/toggle_active/`))
    return data
  },
}
