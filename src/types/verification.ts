// Verification Stepper Types and Interfaces

export interface VerificationStep {
  id: string
  title: string
  description: string
  backendStep?: string // Maps to backend step
  status: 'pending' | 'in_progress' | 'completed' | 'rejected'
  isAdminReview?: boolean // Requires admin action
  requiredDocuments?: string[]
  optional?: boolean
}

export interface VerificationStepperConfig {
  role: UserRole
  steps: VerificationStep[]
}

export type UserRole = 'advocate' | 'lawyer' | 'paralegal' | 'law_firm' | 'law_student' | 'citizen'

export type VerificationStatus = 'pending' | 'verified' | 'rejected'

export type BackendStep = 'documents' | 'identity' | 'contact' | 'role_specific' | 'final'

export interface VerificationData {
  id: number
  status: VerificationStatus
  current_step: BackendStep
  verification_notes: string | null
  rejection_reason: string | null
  progress: number
  user_role: {
    display: string
    value: UserRole
  }
}

export interface ProfileData {
  id: number
  email: string
  first_name: string
  last_name: string
  date_of_birth: string | null
  user_role: {
    display: string
    value: UserRole
  } | null
  gender: 'M' | 'F' | 'O' | null
  profile_picture: string | null
  is_active: boolean
  is_verified: boolean
  contact: {
    phone_number?: string
    alternative_phone?: string
  } | null
  address: {
    street?: string
    city?: string
    region?: string
    district?: string
    ward?: string
  } | null
  verification_status: {
    status: string
    current_step: string
    progress: number
    notes: string | null
    verification_date: string | null
  }
  // Role-specific fields
  roll_number?: string | null
  bar_membership_number?: string | null
  practice_status?: string | null
  years_of_experience?: number | null
  year_established?: number | null
  regional_champter?: string | null
  place_of_work?: string | null
  associated_law_firm?: string | null
  operating_regions?: string[]
  operating_districts?: string[]
  specializations?: string[]
  firm_name?: string | null
  managing_partner?: string | null
  number_of_lawyers?: number | null
  university_name?: string | null
  academic_role?: string | null
  year_of_study?: number | null
  academic_qualification?: string | null
  id_number?: string | null
  date_joined: string
  last_login: string
}

export interface RoleSpecificData {
  // Advocate specific
  roll_number?: string
  regional_chamber?: string
  practice_areas?: string[]
  associated_law_firm?: string
  years_of_experience?: number

  // Lawyer/Paralegal specific
  place_of_work?: string
  operating_regions?: string[]
  bar_membership_number?: string

  // Law Firm specific
  firm_name?: string
  managing_partner?: string
  number_of_lawyers?: number
  year_established?: number

  // Student specific
  university_name?: string
  year_of_study?: number
  academic_role?: 'student' | 'lecturer'

  // Citizen specific
  region?: string
  district?: string
  ward?: string
}

export interface DocumentUpload {
  document_type: string
  file_base64: string
  title: string
  description: string
}

export interface UploadedDocument {
  id: number
  title: string
  document_type: string
  document_type_display: string
  verification_status: 'pending' | 'verified' | 'rejected'
  verification_status_display: string
  file_url: string
  created_at: string
  verification_notes?: string
}

export interface VerificationState {
  currentStep: number
  steps: VerificationStep[]
  verificationData: VerificationData | null
  uploadedDocuments: UploadedDocument[]
  formData: {
    profile: Partial<ProfileData>
    roleSpecific: Partial<RoleSpecificData>
  }
  isLoading: boolean
  errors: Record<string, string[]>
}

// Document type mappings for different roles
export const DOCUMENT_TYPES = {
  advocate: {
    roll_number_cert: 'Roll Number Certificate',
    practice_license: 'Practice License',
    work_certificate: 'Work Certificate',
  },
  lawyer: {
    professional_cert: 'Professional Certificate',
    employment_letter: 'Employment Letter',
  },
  paralegal: {
    professional_cert: 'Professional Certificate',
    employment_letter: 'Employment Letter',
  },
  law_firm: {
    business_license: 'Business License',
    registration_cert: 'Registration Certificate',
  },
  law_student: {
    student_id: 'Student ID Card',
  },
  citizen: {
    national_id: 'National ID',
  },
} as const

// Step configurations for each role
export const ROLE_STEP_CONFIGS: Record<UserRole, VerificationStep[]> = {
  advocate: [
    {
      id: 'profile',
      title: 'Complete Profile',
      description: 'Provide your basic information and professional details',
      backendStep: 'contact',
      status: 'pending',
      requiredDocuments: [],
    },
    {
      id: 'documents',
      title: 'Upload Documents',
      description: 'Upload your roll number certificate, practice license, and work certificate',
      backendStep: 'documents',
      status: 'pending',
      requiredDocuments: ['roll_number_cert', 'practice_license', 'work_certificate'],
    },
    {
      id: 'identity',
      title: 'Verify Identity',
      description: 'Confirm your identity with national ID or passport',
      backendStep: 'identity',
      status: 'pending',
      requiredDocuments: [],
    },
    {
      id: 'professional',
      title: 'Professional Details',
      description: 'Provide practice area, regional chamber, and firm details',
      backendStep: 'role_specific',
      status: 'pending',
      requiredDocuments: [],
    },
    {
      id: 'review',
      title: 'Admin Review',
      description: 'Your application is under review by our team',
      backendStep: 'final',
      status: 'pending',
      isAdminReview: true,
    },
    {
      id: 'complete',
      title: 'Verification Complete',
      description: 'Your account is verified and ready to use',
      status: 'pending',
    },
  ],

  lawyer: [
    {
      id: 'profile',
      title: 'Complete Profile',
      description: 'Provide your basic information',
      backendStep: 'contact',
      status: 'pending',
    },
    {
      id: 'documents',
      title: 'Upload Documents',
      description: 'Upload professional certificate and employment letter',
      backendStep: 'documents',
      status: 'pending',
      requiredDocuments: ['professional_cert', 'employment_letter'],
    },
    {
      id: 'employment',
      title: 'Employment Details',
      description: 'Provide workplace and experience information',
      backendStep: 'role_specific',
      status: 'pending',
    },
    {
      id: 'review',
      title: 'Admin Review',
      description: 'Your application is under review',
      backendStep: 'final',
      status: 'pending',
      isAdminReview: true,
    },
    {
      id: 'complete',
      title: 'Verification Complete',
      description: 'Your account is verified',
      status: 'pending',
    },
  ],

  paralegal: [
    {
      id: 'profile',
      title: 'Complete Profile',
      description: 'Provide your basic information',
      backendStep: 'contact',
      status: 'pending',
    },
    {
      id: 'documents',
      title: 'Upload Documents',
      description: 'Upload professional certificate and employment letter',
      backendStep: 'documents',
      status: 'pending',
      requiredDocuments: ['professional_cert', 'employment_letter'],
    },
    {
      id: 'employment',
      title: 'Employment Details',
      description: 'Provide workplace and experience information',
      backendStep: 'role_specific',
      status: 'pending',
    },
    {
      id: 'review',
      title: 'Admin Review',
      description: 'Your application is under review',
      backendStep: 'final',
      status: 'pending',
      isAdminReview: true,
    },
    {
      id: 'complete',
      title: 'Verification Complete',
      description: 'Your account is verified',
      status: 'pending',
    },
  ],

  law_firm: [
    {
      id: 'firm-info',
      title: 'Firm Information',
      description: 'Provide firm name, establishment year, and contact details',
      backendStep: 'contact',
      status: 'pending',
    },
    {
      id: 'documents',
      title: 'Upload Documents',
      description: 'Upload business license and registration certificate',
      backendStep: 'documents',
      status: 'pending',
      requiredDocuments: ['business_license', 'registration_cert'],
    },
    {
      id: 'firm-details',
      title: 'Firm Details',
      description: 'Managing partner, number of lawyers, practice areas',
      backendStep: 'role_specific',
      status: 'pending',
    },
    {
      id: 'review',
      title: 'Admin Review',
      description: 'Your firm registration is under review',
      backendStep: 'final',
      status: 'pending',
      isAdminReview: true,
    },
    {
      id: 'complete',
      title: 'Verification Complete',
      description: 'Your firm is verified',
      status: 'pending',
    },
  ],

  law_student: [
    {
      id: 'profile',
      title: 'Student Profile',
      description: 'Provide university and academic details',
      backendStep: 'contact',
      status: 'pending',
    },
    {
      id: 'academic',
      title: 'Academic Information',
      description: 'University name, year of study, and student ID',
      backendStep: 'role_specific',
      status: 'pending',
    },
    {
      id: 'documents',
      title: 'Upload Student ID (Optional)',
      description: 'Upload student ID card for faster verification',
      backendStep: 'documents',
      status: 'pending',
      optional: true,
    },
    {
      id: 'review',
      title: 'Quick Review',
      description: 'Your profile is being verified',
      backendStep: 'final',
      status: 'pending',
      isAdminReview: true,
    },
    {
      id: 'complete',
      title: 'Ready to Go',
      description: 'Your student account is active',
      status: 'pending',
    },
  ],

  citizen: [
    {
      id: 'profile',
      title: 'Basic Information',
      description: 'Provide your name and contact details',
      backendStep: 'contact',
      status: 'pending',
    },
    {
      id: 'location',
      title: 'Location',
      description: 'Select your region, district, and ward',
      backendStep: 'role_specific',
      status: 'pending',
    },
    {
      id: 'identity',
      title: 'Identity (Optional)',
      description: 'Upload ID for enhanced features',
      backendStep: 'documents',
      status: 'pending',
      optional: true,
    },
    {
      id: 'complete',
      title: 'Account Ready',
      description: 'Your citizen account is active',
      backendStep: 'final',
      status: 'pending',
    },
  ],
}
