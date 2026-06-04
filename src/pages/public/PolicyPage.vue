<template>
  <div class="policy-page">
    <div class="page-container">
      <div class="page-header">
        <h1 class="page-title">{{ document?.title || 'Loading...' }}</h1>
        <p class="page-subtitle">{{ document?.title_sw || '' }}</p>
      </div>

      <div v-if="loading" class="loading-container">
        <VaProgressCircle indeterminate size="large" />
        <p>Loading content...</p>
      </div>

      <div v-else-if="error" class="error-container">
        <VaIcon name="error_outline" size="4rem" color="danger" />
        <h2 class="error-title">Failed to Load Content</h2>
        <p class="error-message">{{ error }}</p>
        <VaButton @click="loadContent">Retry</VaButton>
      </div>

      <VaCard v-else-if="document" class="content-card">
        <VaCardContent>
          <div class="content-wrapper" v-html="renderedContent"></div>
        </VaCardContent>
      </VaCard>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { marked } from 'marked'
import documentContentService from '../../services/documentContentService'
import type { DocumentContent } from '../../services/documentContentService'

const route = useRoute()
const document = ref<DocumentContent | null>(null)
const loading = ref(true)
const error = ref<string | null>(null)

const renderedContent = computed(() => {
  if (!document.value) return ''
  const content = document.value.content || ''
  return marked(content)
})

const loadContent = async () => {
  loading.value = true
  error.value = null

  try {
    // Determine slug based on route name
    let slug = ''
    if (route.name === 'privacy') {
      slug = 'privacy-policy'
    } else if (route.name === 'terms') {
      slug = 'terms-and-conditions'
    } else if (route.name === 'refund') {
      slug = 'refund-policy'
    } else if (route.params.slug) {
      slug = route.params.slug as string
    }

    if (!slug) {
      throw new Error('No slug provided')
    }
    document.value = await documentContentService.getDocumentBySlug(slug)
  } catch (err: any) {
    error.value = err.message || 'Failed to load document content'
    console.error('Error loading document:', err)
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  window.scrollTo(0, 0)
  loadContent()
})
</script>

<style lang="scss" scoped>
.policy-page {
  padding: 3rem 2rem;
}

.page-container {
  max-width: 1000px;
  margin: 0 auto;
}

.page-header {
  text-align: center;
  margin-bottom: 3rem;
}

.page-title {
  font-size: 2.5rem;
  font-weight: 700;
  color: var(--va-text-primary);
  margin: 0 0 0.5rem;
}

.page-subtitle {
  font-size: 1.25rem;
  color: var(--va-text-secondary);
  margin: 0;
}

.loading-container,
.error-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1.5rem;
  padding: 4rem 2rem;
  text-align: center;
}

.error-title {
  font-size: 1.5rem;
  font-weight: 600;
  color: var(--va-text-primary);
  margin: 0;
}

.error-message {
  color: var(--va-text-secondary);
  margin: 0;
}

.content-card {
  transition: box-shadow 0.3s;

  &:hover {
    box-shadow: 0 8px 24px rgba(0, 0, 0, 0.12);
  }
}

.content-wrapper {
  line-height: 1.8;
  color: var(--va-text-primary);

  :deep(h1) {
    font-size: 2rem;
    font-weight: 700;
    margin: 2rem 0 1rem;
    color: var(--va-text-primary);
  }

  :deep(h2) {
    font-size: 1.75rem;
    font-weight: 600;
    margin: 1.75rem 0 1rem;
    color: var(--va-text-primary);
  }

  :deep(h3) {
    font-size: 1.5rem;
    font-weight: 600;
    margin: 1.5rem 0 1rem;
    color: var(--va-text-primary);
  }

  :deep(h4) {
    font-size: 1.25rem;
    font-weight: 600;
    margin: 1.25rem 0 1rem;
    color: var(--va-text-primary);
  }

  :deep(p) {
    margin: 1rem 0;
    color: var(--va-text-secondary);
  }

  :deep(ul),
  :deep(ol) {
    margin: 1rem 0;
    padding-left: 2rem;
    color: var(--va-text-secondary);
  }

  :deep(li) {
    margin: 0.5rem 0;
  }

  :deep(a) {
    color: var(--va-primary);
    text-decoration: none;
    transition: color 0.2s;

    &:hover {
      color: var(--va-info);
      text-decoration: underline;
    }
  }

  :deep(strong) {
    font-weight: 600;
    color: var(--va-text-primary);
  }

  :deep(code) {
    background: var(--va-background-primary);
    padding: 0.2rem 0.4rem;
    border-radius: 0.25rem;
    font-family: monospace;
    font-size: 0.9em;
  }

  :deep(pre) {
    background: var(--va-background-primary);
    padding: 1rem;
    border-radius: 0.5rem;
    overflow-x: auto;
    margin: 1rem 0;

    code {
      background: none;
      padding: 0;
    }
  }

  :deep(blockquote) {
    border-left: 4px solid var(--va-primary);
    padding-left: 1rem;
    margin: 1rem 0;
    color: var(--va-text-secondary);
    font-style: italic;
  }

  :deep(table) {
    width: 100%;
    border-collapse: collapse;
    margin: 1rem 0;
  }

  :deep(th),
  :deep(td) {
    border: 1px solid var(--va-background-border);
    padding: 0.75rem;
    text-align: left;
  }

  :deep(th) {
    background: var(--va-background-primary);
    font-weight: 600;
  }

  :deep(hr) {
    border: none;
    border-top: 1px solid var(--va-background-border);
    margin: 2rem 0;
  }
}

@media (max-width: 768px) {
  .page-title {
    font-size: 1.75rem;
  }

  .page-subtitle {
    font-size: 1rem;
  }

  :deep(h1) {
    font-size: 1.5rem;
  }

  :deep(h2) {
    font-size: 1.25rem;
  }

  :deep(h3) {
    font-size: 1.1rem;
  }
}
</style>
