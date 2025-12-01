/**
 * Question Management Service
 * Handles all admin operations for legal questions
 */

import makeRequest from './makeRequest'
import type IRequestParams from '../models/models'

// ==================== Types ====================

export interface UserInfo {
  id: number
  email: string
  full_name: string
  user_role: number
  is_verified: boolean
  avatar_url: string | null
}

export interface Question {
  id: number
  material: number
  material_title: string
  asker_info: UserInfo
  question_text: string
  answer_text: string
  answerer_info: UserInfo | null
  answered_at: string | null
  status: 'open' | 'answered' | 'closed'
  is_answered_by_uploader: boolean
  helpful_count: number
  created_at: string
  updated_at: string
}

export interface QuestionStatistics {
  total: number
  open: number
  answered: number
  closed: number
  avg_helpful_count: number
}

export interface QuestionFilters {
  status?: 'open' | 'answered' | 'closed'
  material_id?: number
  unanswered?: boolean
  search?: string
  ordering?: string
  page?: number
  page_size?: number
}

export interface AnswerRequest {
  answer_text: string
}

export interface PaginatedResponse<T> {
  count: number
  next: string | null
  previous: string | null
  results: T[]
}

// ==================== Helper Functions ====================

const getBaseUrl = () => import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api/v1'

const getEndpoint = (key: string) => {
  const endpoint = import.meta.env[key]
  if (!endpoint) {
    console.error(`Environment variable ${key} is not defined`)
    return ''
  }
  return endpoint
}

const endpoints = {
  list: () => `${getBaseUrl()}${getEndpoint('VITE_ADMIN_QUESTIONS_LIST')}`,
  detail: (id: number) => `${getBaseUrl()}${getEndpoint('VITE_ADMIN_QUESTIONS_DETAIL').replace('{id}', String(id))}`,
  answer: (id: number) => `${getBaseUrl()}${getEndpoint('VITE_ADMIN_QUESTIONS_ANSWER').replace('{id}', String(id))}`,
  close: (id: number) => `${getBaseUrl()}${getEndpoint('VITE_ADMIN_QUESTIONS_CLOSE').replace('{id}', String(id))}`,
  reopen: (id: number) => `${getBaseUrl()}${getEndpoint('VITE_ADMIN_QUESTIONS_REOPEN').replace('{id}', String(id))}`,
  stats: () => `${getBaseUrl()}${getEndpoint('VITE_ADMIN_QUESTIONS_STATS')}`,
  update: (id: number) => `${getBaseUrl()}${getEndpoint('VITE_ADMIN_QUESTIONS_UPDATE').replace('{id}', String(id))}`,
  delete: (id: number) => `${getBaseUrl()}${getEndpoint('VITE_ADMIN_QUESTIONS_DELETE').replace('{id}', String(id))}`,
}

// ==================== Service Methods ====================

/**
 * Get all questions with filters and pagination
 */
export const getAllQuestions = async (filters: QuestionFilters = {}): Promise<PaginatedResponse<Question>> => {
  const params: IRequestParams = {
    url: endpoints.list(),
    method: 'GET',
    params: filters,
  }

  const response = await makeRequest(params)
  return response.data
}

/**
 * Get question by ID
 */
export const getQuestionById = async (id: number): Promise<Question> => {
  const params: IRequestParams = {
    url: endpoints.detail(id),
    method: 'GET',
  }

  const response = await makeRequest(params)
  return response.data
}

/**
 * Answer a question
 */
export const answerQuestion = async (
  id: number,
  data: AnswerRequest,
): Promise<{ message: string; question: Question }> => {
  const params: IRequestParams = {
    url: endpoints.answer(id),
    method: 'POST',
    data,
  }

  const response = await makeRequest(params)
  return response.data
}

/**
 * Close a question
 */
export const closeQuestion = async (id: number): Promise<{ message: string; question: Question }> => {
  const params: IRequestParams = {
    url: endpoints.close(id),
    method: 'POST',
  }

  const response = await makeRequest(params)
  return response.data
}

/**
 * Reopen a question
 */
export const reopenQuestion = async (id: number): Promise<{ message: string; question: Question }> => {
  const params: IRequestParams = {
    url: endpoints.reopen(id),
    method: 'POST',
  }

  const response = await makeRequest(params)
  return response.data
}

/**
 * Get question statistics
 */
export const getQuestionStatistics = async (): Promise<QuestionStatistics> => {
  const params: IRequestParams = {
    url: endpoints.stats(),
    method: 'GET',
  }

  const response = await makeRequest(params)
  return response.data
}

/**
 * Update question (full edit)
 */
export const updateQuestion = async (id: number, data: Partial<Question>): Promise<Question> => {
  const params: IRequestParams = {
    url: endpoints.update(id),
    method: 'PATCH',
    data,
  }

  const response = await makeRequest(params)
  return response.data
}

/**
 * Delete question
 */
export const deleteQuestion = async (id: number): Promise<void> => {
  const params: IRequestParams = {
    url: endpoints.delete(id),
    method: 'DELETE',
  }

  await makeRequest(params)
}

export default {
  getAllQuestions,
  getQuestionById,
  answerQuestion,
  closeQuestion,
  reopenQuestion,
  getQuestionStatistics,
  updateQuestion,
  deleteQuestion,
}
