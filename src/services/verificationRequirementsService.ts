/**
 * Verification Requirements admin API
 * Manages document requirements per user role for the verification flow.
 */
import axios from 'axios'

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api/v1'
const buildUrl = (path: string) => `${API_BASE_URL}${path}`

/** Fallback document types used before API data is loaded */
export const DOCUMENT_TYPE_FALLBACKS: { value: string; label: string }[] = [
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
  /** Legacy field — kept for backward compatibility */
  document_type?: string
  document_type_display?: string
  /** New FK-based fields */
  document_type_ref?: number
  document_type_code?: string
  document_type_label?: string
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
    document_type_ref: number
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
