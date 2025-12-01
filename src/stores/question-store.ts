/**
 * Question Management Store
 * Pinia store for managing question state
 */

import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type {
  Question,
  QuestionStatistics,
  QuestionFilters,
  AnswerRequest,
  PaginatedResponse,
} from '../services/questionService'
import * as questionService from '../services/questionService'

export const useQuestionStore = defineStore('questions', () => {
  // State
  const questions = ref<Question[]>([])
  const currentQuestion = ref<Question | null>(null)
  const statistics = ref<QuestionStatistics | null>(null)
  const loading = ref({
    questions: false,
    statistics: false,
    action: false,
  })
  const error = ref<string | null>(null)

  // Pagination
  const pagination = ref({
    count: 0,
    currentPage: 1,
    pageSize: 10,
    next: null as string | null,
    previous: null as string | null,
  })

  // Computed
  const totalPages = computed(() => Math.ceil(pagination.value.count / pagination.value.pageSize))
  const hasNextPage = computed(() => !!pagination.value.next)
  const hasPreviousPage = computed(() => !!pagination.value.previous)

  // Actions

  /**
   * Fetch questions with filters
   */
  const fetchQuestions = async (filters: QuestionFilters = {}) => {
    loading.value.questions = true
    error.value = null

    try {
      const response: PaginatedResponse<Question> = await questionService.getAllQuestions({
        ...filters,
        page: pagination.value.currentPage,
        page_size: pagination.value.pageSize,
      })

      questions.value = response.results
      pagination.value.count = response.count
      pagination.value.next = response.next
      pagination.value.previous = response.previous
    } catch (err: any) {
      error.value = err.message || 'Failed to fetch questions'
      throw err
    } finally {
      loading.value.questions = false
    }
  }

  /**
   * Fetch question by ID
   */
  const fetchQuestionById = async (id: number) => {
    loading.value.questions = true
    error.value = null

    try {
      const question = await questionService.getQuestionById(id)
      currentQuestion.value = question
      return question
    } catch (err: any) {
      error.value = err.message || 'Failed to fetch question'
      throw err
    } finally {
      loading.value.questions = false
    }
  }

  /**
   * Fetch question statistics
   */
  const fetchStatistics = async () => {
    loading.value.statistics = true
    error.value = null

    try {
      const stats = await questionService.getQuestionStatistics()
      statistics.value = stats
      return stats
    } catch (err: any) {
      error.value = err.message || 'Failed to fetch statistics'
      throw err
    } finally {
      loading.value.statistics = false
    }
  }

  /**
   * Answer a question
   */
  const answerQuestion = async (id: number, answerData: AnswerRequest) => {
    loading.value.action = true
    error.value = null

    try {
      const response = await questionService.answerQuestion(id, answerData)

      // Update local state
      const index = questions.value.findIndex((q) => q.id === id)
      if (index !== -1) {
        questions.value[index] = response.question
      }

      if (currentQuestion.value?.id === id) {
        currentQuestion.value = response.question
      }

      return response
    } catch (err: any) {
      error.value = err.message || 'Failed to answer question'
      throw err
    } finally {
      loading.value.action = false
    }
  }

  /**
   * Close a question
   */
  const closeQuestion = async (id: number) => {
    loading.value.action = true
    error.value = null

    try {
      const response = await questionService.closeQuestion(id)

      // Update local state
      const index = questions.value.findIndex((q) => q.id === id)
      if (index !== -1) {
        questions.value[index] = response.question
      }

      if (currentQuestion.value?.id === id) {
        currentQuestion.value = response.question
      }

      return response
    } catch (err: any) {
      error.value = err.message || 'Failed to close question'
      throw err
    } finally {
      loading.value.action = false
    }
  }

  /**
   * Reopen a question
   */
  const reopenQuestion = async (id: number) => {
    loading.value.action = true
    error.value = null

    try {
      const response = await questionService.reopenQuestion(id)

      // Update local state
      const index = questions.value.findIndex((q) => q.id === id)
      if (index !== -1) {
        questions.value[index] = response.question
      }

      if (currentQuestion.value?.id === id) {
        currentQuestion.value = response.question
      }

      return response
    } catch (err: any) {
      error.value = err.message || 'Failed to reopen question'
      throw err
    } finally {
      loading.value.action = false
    }
  }

  /**
   * Update question
   */
  const updateQuestion = async (id: number, data: Partial<Question>) => {
    loading.value.action = true
    error.value = null

    try {
      const updatedQuestion = await questionService.updateQuestion(id, data)

      // Update local state
      const index = questions.value.findIndex((q) => q.id === id)
      if (index !== -1) {
        questions.value[index] = updatedQuestion
      }

      if (currentQuestion.value?.id === id) {
        currentQuestion.value = updatedQuestion
      }

      return updatedQuestion
    } catch (err: any) {
      error.value = err.message || 'Failed to update question'
      throw err
    } finally {
      loading.value.action = false
    }
  }

  /**
   * Delete question
   */
  const deleteQuestion = async (id: number) => {
    loading.value.action = true
    error.value = null

    try {
      await questionService.deleteQuestion(id)

      // Remove from local state
      questions.value = questions.value.filter((q) => q.id !== id)

      if (currentQuestion.value?.id === id) {
        currentQuestion.value = null
      }
    } catch (err: any) {
      error.value = err.message || 'Failed to delete question'
      throw err
    } finally {
      loading.value.action = false
    }
  }

  /**
   * Set current page
   */
  const setPage = (page: number) => {
    pagination.value.currentPage = page
  }

  /**
   * Set page size
   */
  const setPageSize = (size: number) => {
    pagination.value.pageSize = size
    pagination.value.currentPage = 1
  }

  /**
   * Reset store
   */
  const reset = () => {
    questions.value = []
    currentQuestion.value = null
    statistics.value = null
    error.value = null
    pagination.value = {
      count: 0,
      currentPage: 1,
      pageSize: 10,
      next: null,
      previous: null,
    }
  }

  return {
    // State
    questions,
    currentQuestion,
    statistics,
    loading,
    error,
    pagination,

    // Computed
    totalPages,
    hasNextPage,
    hasPreviousPage,

    // Actions
    fetchQuestions,
    fetchQuestionById,
    fetchStatistics,
    answerQuestion,
    closeQuestion,
    reopenQuestion,
    updateQuestion,
    deleteQuestion,
    setPage,
    setPageSize,
    reset,
  }
})
