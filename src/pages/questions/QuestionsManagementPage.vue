<template>
  <div class="questions-management-page">
    <!-- Page Header -->
    <div class="page-header">
      <div>
        <h1 class="page-title">
          <VaIcon name="help" size="large" class="mr-2" />
          Question Management
        </h1>
        <p class="page-subtitle">Review and answer legal questions from users</p>
      </div>
      <VaButton color="primary" icon="refresh" :loading="loading.questions" @click="refreshData"> Refresh </VaButton>
    </div>

    <!-- Statistics Cards -->
    <div v-if="statistics && statistics.total !== undefined" class="statistics-grid">
      <QuestionStatCard
        icon="inbox"
        icon-color="primary"
        icon-bg-color="rgba(var(--va-primary), 0.1)"
        :value="statistics.total"
        label="Total Questions"
        :subtext="statistics.avg_helpful_count ? `${statistics.avg_helpful_count.toFixed(1)} avg helpful votes` : ''"
      />
      <QuestionStatCard
        icon="schedule"
        icon-color="warning"
        icon-bg-color="rgba(var(--va-warning), 0.1)"
        :value="statistics.open || 0"
        label="Open Questions"
        badge="Needs Answer"
        badge-color="warning"
      />
      <QuestionStatCard
        icon="check_circle"
        icon-color="success"
        icon-bg-color="rgba(var(--va-success), 0.1)"
        :value="statistics.answered || 0"
        label="Answered"
        :subtext="
          statistics.total > 0 ? `${((statistics.answered / statistics.total) * 100).toFixed(1)}% answered` : ''
        "
      />
      <QuestionStatCard
        icon="block"
        icon-color="danger"
        icon-bg-color="rgba(var(--va-danger), 0.1)"
        :value="statistics.closed || 0"
        label="Closed"
      />
    </div>

    <!-- Filters -->
    <VaCard class="filters-card">
      <VaCardContent>
        <div class="filters-row">
          <VaInput
            v-model="filters.search"
            placeholder="Search questions..."
            class="filter-item"
            clearable
            @update:modelValue="debouncedSearch"
          >
            <template #prepend>
              <VaIcon name="search" />
            </template>
          </VaInput>

          <VaSelect
            v-model="filters.status"
            label="Status"
            :options="statusOptions"
            class="filter-item"
            clearable
            @update:modelValue="applyFilters"
          />

          <VaCheckbox v-model="filters.unanswered" label="Unanswered Only" @update:modelValue="applyFilters" />

          <VaSelect
            v-model="filters.ordering"
            label="Sort By"
            :options="orderingOptions"
            class="filter-item"
            @update:modelValue="applyFilters"
          />
        </div>
      </VaCardContent>
    </VaCard>

    <!-- Questions Table -->
    <VaCard>
      <VaCardContent>
        <!-- Empty State -->
        <div v-if="!loading.questions && questions.length === 0" class="empty-state">
          <VaIcon name="help_outline" size="large" color="secondary" />
          <h3>No Questions Found</h3>
          <p>There are no questions to display. Check back later or adjust your filters.</p>
        </div>

        <VaDataTable v-else :items="questions" :columns="tableColumns" :loading="loading.questions" striped hoverable>
          <!-- Asker Column -->
          <template #cell(asker)="{ rowData }">
            <div v-if="rowData.asker_info" class="user-cell">
              <VaAvatar size="small" color="primary">
                <VaIcon name="person" />
              </VaAvatar>
              <div class="user-info">
                <div class="user-name">{{ rowData.asker_info.full_name }}</div>
                <div class="user-email">{{ rowData.asker_info.email }}</div>
              </div>
            </div>
            <span v-else>-</span>
          </template>

          <!-- Question Column -->
          <template #cell(question)="{ rowData }">
            <div class="question-cell">
              <div class="question-text">{{ truncateText(rowData.question_text || '', 80) }}</div>
              <div v-if="rowData.material_title" class="material-tag">
                <VaIcon name="book" size="small" />
                {{ rowData.material_title }}
              </div>
            </div>
          </template>

          <!-- Status Column -->
          <template #cell(status)="{ rowData }">
            <VaBadge :text="rowData.status" :color="getStatusColor(rowData.status)" />
          </template>

          <!-- Helpful Count Column -->
          <template #cell(helpful_count)="{ rowData }">
            <VaChip size="small" color="success">
              <VaIcon name="thumb_up" size="small" class="mr-1" />
              {{ rowData.helpful_count }}
            </VaChip>
          </template>

          <!-- Created Column -->
          <template #cell(created_at)="{ rowData }">
            <div class="date-cell">
              <span class="date-text">{{ formatDate(rowData.created_at) }}</span>
              <span v-if="!rowData.answer_text" class="time-ago">{{ getTimeAgo(rowData.created_at) }}</span>
            </div>
          </template>

          <!-- Actions Column -->
          <template #cell(actions)="{ rowData }">
            <div class="actions-cell">
              <VaButton
                size="small"
                preset="plain"
                icon="visibility"
                color="info"
                aria-label="View details"
                @click="viewQuestion(rowData)"
              />
              <VaButton
                v-if="rowData.status === 'open'"
                size="small"
                preset="plain"
                icon="edit"
                color="success"
                aria-label="Answer question"
                @click="openAnswerEditor(rowData)"
              />
              <VaButton
                v-if="rowData.status === 'open'"
                size="small"
                preset="plain"
                icon="block"
                color="danger"
                aria-label="Close question"
                :loading="loading.action"
                @click="confirmCloseQuestion(rowData.id)"
              />
              <VaButton
                v-if="rowData.status === 'closed'"
                size="small"
                preset="plain"
                icon="refresh"
                color="primary"
                aria-label="Reopen question"
                :loading="loading.action"
                @click="handleReopenQuestion(rowData.id)"
              />
            </div>
          </template>
        </VaDataTable>

        <!-- Pagination -->
        <div v-if="pagination.count > 0" class="pagination-wrapper">
          <VaPagination
            v-model="pagination.currentPage"
            :pages="totalPages"
            :visible-pages="5"
            @update:modelValue="handlePageChange"
          />
          <div class="pagination-info">
            <span> Showing {{ getShowingStart() }} to {{ getShowingEnd() }} of {{ pagination.count }} results </span>
          </div>
        </div>
      </VaCardContent>
    </VaCard>

    <!-- Question Detail Modal -->
    <QuestionDetailModal
      v-model="showDetailModal"
      :question="selectedQuestion"
      @answer="openAnswerEditor"
      @close="handleCloseQuestion"
      @reopen="handleReopenQuestion"
    />

    <!-- Answer Editor Modal -->
    <AnswerEditorModal
      v-model="showAnswerModal"
      :question="selectedQuestion"
      :loading="loading.action"
      @submit="handleSubmitAnswer"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useToast } from 'vuestic-ui'
import { useQuestionStore } from '../../stores/question-store'
import type { Question, QuestionFilters } from '../../services/questionService'
import QuestionStatCard from '../../components/questions/QuestionStatCard.vue'
import QuestionDetailModal from '../../components/questions/QuestionDetailModal.vue'
import AnswerEditorModal from '../../components/questions/AnswerEditorModal.vue'

const store = useQuestionStore()
const { init: showToast } = useToast()

// State
const showDetailModal = ref(false)
const showAnswerModal = ref(false)
const selectedQuestion = ref<Question | null>(null)

// Filters
const filters = ref<QuestionFilters>({
  search: '',
  status: undefined,
  unanswered: false,
  ordering: '-created_at',
})

// Computed
const questions = computed(() => store.questions)
const statistics = computed(() => store.statistics)
const pagination = computed(() => store.pagination)
const loading = computed(() => store.loading)
const totalPages = computed(() => store.totalPages)

// Options
const statusOptions = [
  { text: 'All Status', value: undefined },
  { text: 'Open', value: 'open' },
  { text: 'Answered', value: 'answered' },
  { text: 'Closed', value: 'closed' },
]

const orderingOptions = [
  { text: 'Newest First', value: '-created_at' },
  { text: 'Oldest First', value: 'created_at' },
  { text: 'Most Helpful', value: '-helpful_count' },
  { text: 'Recently Answered', value: '-answered_at' },
]

// Table columns
const tableColumns = [
  { key: 'asker', label: 'Asker', sortable: false },
  { key: 'question', label: 'Question & Material', sortable: false },
  { key: 'status', label: 'Status', sortable: true },
  { key: 'helpful_count', label: 'Helpful', sortable: true },
  { key: 'created_at', label: 'Created', sortable: true },
  { key: 'actions', label: 'Actions', sortable: false },
]

// Methods
const fetchData = async () => {
  try {
    // Fetch questions first (required)
    await store.fetchQuestions(filters.value)

    // Try to fetch statistics (optional, don't block if it fails)
    try {
      await store.fetchStatistics()
    } catch (statsError) {
      console.warn('Failed to load statistics:', statsError)
    }
  } catch (error) {
    console.error('Failed to load questions:', error)
    showToast({
      message: 'Failed to load questions. Please try again.',
      color: 'danger',
    })
  }
}

const refreshData = () => {
  fetchData()
}

const applyFilters = () => {
  store.setPage(1)
  fetchData()
}

let searchTimeout: NodeJS.Timeout
const debouncedSearch = () => {
  clearTimeout(searchTimeout)
  searchTimeout = setTimeout(() => {
    applyFilters()
  }, 500)
}

const handlePageChange = (page: number) => {
  store.setPage(page)
  fetchData()
}

const viewQuestion = (question: Question) => {
  selectedQuestion.value = question
  showDetailModal.value = true
}

const openAnswerEditor = (question: Question) => {
  selectedQuestion.value = question
  showDetailModal.value = false
  showAnswerModal.value = true
}

const handleSubmitAnswer = async (answerText: string) => {
  if (!selectedQuestion.value) return

  try {
    await store.answerQuestion(selectedQuestion.value.id, { answer_text: answerText })
    showToast({
      message: 'Answer submitted successfully',
      color: 'success',
    })
    showAnswerModal.value = false
    fetchData()
  } catch (error: any) {
    showToast({
      message: error.message || 'Failed to submit answer',
      color: 'danger',
    })
  }
}

const confirmCloseQuestion = (id: number) => {
  if (confirm('Are you sure you want to close this question? This action marks it as closed.')) {
    handleCloseQuestion(id)
  }
}

const handleCloseQuestion = async (id: number) => {
  try {
    await store.closeQuestion(id)
    showToast({
      message: 'Question closed successfully',
      color: 'warning',
    })
    showDetailModal.value = false
    fetchData()
  } catch (error: any) {
    showToast({
      message: error.message || 'Failed to close question',
      color: 'danger',
    })
  }
}

const handleReopenQuestion = async (id: number) => {
  try {
    await store.reopenQuestion(id)
    showToast({
      message: 'Question reopened successfully',
      color: 'success',
    })
    showDetailModal.value = false
    fetchData()
  } catch (error: any) {
    showToast({
      message: error.message || 'Failed to reopen question',
      color: 'danger',
    })
  }
}

const getStatusColor = (status: string) => {
  switch (status) {
    case 'open':
      return 'warning'
    case 'answered':
      return 'success'
    case 'closed':
      return 'danger'
    default:
      return 'secondary'
  }
}

const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  })
}

const getTimeAgo = (dateString: string) => {
  const date = new Date(dateString)
  const now = new Date()
  const diffMs = now.getTime() - date.getTime()
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24))

  if (diffDays === 0) return 'Today'
  if (diffDays === 1) return '1 day ago'
  if (diffDays < 7) return `${diffDays} days ago`
  if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`
  return `${Math.floor(diffDays / 30)} months ago`
}

const truncateText = (text: string, maxLength: number) => {
  if (text.length <= maxLength) return text
  return text.substring(0, maxLength) + '...'
}

const getShowingStart = () => {
  return (pagination.value.currentPage - 1) * pagination.value.pageSize + 1
}

const getShowingEnd = () => {
  const end = pagination.value.currentPage * pagination.value.pageSize
  return Math.min(end, pagination.value.count)
}

onMounted(() => {
  fetchData()
})
</script>

<style scoped>
.questions-management-page {
  padding: 1.5rem;
  max-width: 1400px;
  margin: 0 auto;
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 2rem;
}

.page-title {
  display: flex;
  align-items: center;
  font-size: 2rem;
  font-weight: 700;
  margin: 0 0 0.5rem 0;
  color: var(--va-text-primary);
}

.page-subtitle {
  color: var(--va-text-secondary);
  margin: 0;
}

.statistics-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 1.5rem;
  margin-bottom: 2rem;
}

.filters-card {
  margin-bottom: 1.5rem;
}

.filters-row {
  display: grid;
  grid-template-columns: 2fr 1fr auto 1fr;
  gap: 1rem;
  align-items: center;
}

.filter-item {
  min-width: 0;
}

.user-cell {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.user-info {
  display: flex;
  flex-direction: column;
  gap: 0.125rem;
  min-width: 0;
}

.user-name {
  font-weight: 600;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.user-email {
  font-size: 0.875rem;
  color: var(--va-text-secondary);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.question-cell {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.question-text {
  line-height: 1.4;
  color: var(--va-text-primary);
}

.material-tag {
  display: flex;
  align-items: center;
  gap: 0.25rem;
  font-size: 0.875rem;
  color: var(--va-text-secondary);
}

.date-cell {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.date-text {
  font-size: 0.875rem;
  color: var(--va-text-secondary);
}

.time-ago {
  font-size: 0.75rem;
  color: var(--va-danger);
  font-weight: 500;
}

.actions-cell {
  display: flex;
  gap: 0.25rem;
}

.pagination-wrapper {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 1.5rem;
  padding-top: 1rem;
  border-top: 1px solid var(--va-background-border);
}

.pagination-info {
  font-size: 0.875rem;
  color: var(--va-text-secondary);
}

.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 4rem 2rem;
  text-align: center;
  color: var(--va-text-secondary);
}

.empty-state h3 {
  margin: 1rem 0 0.5rem;
  color: var(--va-text-primary);
}

.empty-state p {
  margin: 0;
  max-width: 400px;
}

@media (max-width: 768px) {
  .questions-management-page {
    padding: 1rem;
  }

  .page-header {
    flex-direction: column;
    gap: 1rem;
  }

  .statistics-grid {
    grid-template-columns: 1fr;
  }

  .filters-row {
    grid-template-columns: 1fr;
  }

  .pagination-wrapper {
    flex-direction: column;
    gap: 1rem;
  }
}
</style>
