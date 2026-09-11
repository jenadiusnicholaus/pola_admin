/**
 * Verification Requirements admin API
 * Manages document requirements per user role for the verification flow.
 */
import axios from 'axios'

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api/v1'
const buildUrl = (path: string) => `${API_BASE_URL}${path}`

export type DocumentType =
  | 'roll_number_cert'
  | 'practice_license'
  | 'work_certificate'
  | 'professional_cert'
  | 'employment_letter'
  | 'organization_cert'
  | 'business_license'
  | 'registration_cert'
  | 'firm_documents'
  | 'id_document'
  | 'academic'
  | 'other'

export const DOCUMENT_TYPES: { value: DocumentType; label: string }[] = [
  { value: 'roll_number_cert', label: 'Roll Number Certificate' },
  { value: 'practice_license', label: 'Practice License' },
  { value: 'work_certificate', label: 'Work Certificate' },
  { value: 'professional_cert', label: 'Professional Certificate' },
  { value: 'employment_letter', label: 'Employment Letter' },
  { value: 'organization_cert', label: 'Organization Certificate' },
  { value: 'business_license', label: 'Business License' },
  { value: 'registration_cert', label: 'Registration Certificate' },
  { value: 'firm_documents', label: 'Firm Documents' },
  { value: 'id_document', label: 'ID Document' },
  { value: 'academic', label: 'Academic Certificate' },
  { value: 'other', label: 'Other' },
]

export const ROLE_OPTIONS: { value: number; label: string; slug: string }[] = [
  { value: 1, label: 'Advocate', slug: 'advocate' },
  { value: 2, label: 'Lawyer', slug: 'lawyer' },
  { value: 3, label: 'Paralegal', slug: 'paralegal' },
  { value: 4, label: 'Student', slug: 'student' },
  { value: 5, label: 'Organization', slug: 'organization' },
  { value: 6, label: 'General Public', slug: 'general_public' },
]

export interface VerificationRequirement {
  id: number
  role: number
  role_display?: string
  document_type: DocumentType
  document_type_display?: string
  label: string
  is_required: boolean
  sort_order: number
  description: string
  created_at: string
  updated_at: string
}

export interface Paginated<T> {
  count: number
  next: string | null
  previous: string | null
  results: T[]
}

export interface RequirementFilters {
  role?: number | string
  is_required?: boolean
}

export const verificationRequirementsService = {
  async list(filters: RequirementFilters = {}) {
    const q = new URLSearchParams()
    Object.entries(filters).forEach(([k, v]) => {
      if (v !== undefined && v !== null && v !== '') q.set(k, String(v))
    })
    const { data } = await axios.get<Paginated<VerificationRequirement> | VerificationRequirement[]>(
      buildUrl(`/authentication/verification-requirements/?${q.toString()}`),
    )
    return data
  },

  async getByRole(roleSlug: string) {
    const { data } = await axios.get<VerificationRequirement[]>(
      buildUrl(`/authentication/verification-requirements/by-role/${roleSlug}/`),
    )
    return data
  },

  async retrieve(id: number) {
    const { data } = await axios.get<VerificationRequirement>(
      buildUrl(`/authentication/verification-requirements/${id}/`),
    )
    return data
  },

  async create(payload: {
    role: number
    document_type: DocumentType
    label: string
    is_required: boolean
    sort_order: number
    description?: string
  }) {
    const { data } = await axios.post<VerificationRequirement>(
      buildUrl('/authentication/verification-requirements/'),
      payload,
    )
    return data
  },

  async update(id: number, payload: Partial<VerificationRequirement>) {
    const { data } = await axios.patch<VerificationRequirement>(
      buildUrl(`/authentication/verification-requirements/${id}/`),
      payload,
    )
    return data
  },

  async remove(id: number) {
    await axios.delete(buildUrl(`/authentication/verification-requirements/${id}/`))
  },
}
