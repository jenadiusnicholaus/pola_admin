/**
 * Hubs Store (Pinia)
 * State management for Education Hubs (Topics & Subtopics)
 */

import { defineStore } from 'pinia'
import hubsService, {
  type Topic,
  type TopicDetail,
  type Subtopic,
  type Material,
  type TopicStatistics,
  type SubtopicStatistics,
  type TopicFilters,
  type SubtopicFilters,
  type BulkToggleData,
} from '../services/hubsService'

export const useHubsStore = defineStore('hubs', {
  state: () => ({
    // Topics
    topics: [] as Topic[],
    selectedTopic: null as TopicDetail | null,
    topicStatistics: {
      total_topics: 0,
      active_topics: 0,
      inactive_topics: 0,
      total_subtopics: 0,
      total_materials: 0,
      topics_without_subtopics: 0,
      topics_without_materials: 0,
    } as TopicStatistics,

    // Subtopics
    subtopics: [] as Subtopic[],
    selectedSubtopic: null as Subtopic | null,
    subtopicMaterials: [] as Material[],
    subtopicStatistics: {
      total_subtopics: 0,
      active_subtopics: 0,
      inactive_subtopics: 0,
      total_materials: 0,
      subtopics_without_materials: 0,
      avg_materials_per_subtopic: 0,
    } as SubtopicStatistics,

    // Hub Forums/Content
    hubContent: [] as any[],
    hubContentStatistics: {
      total_content: 0,
      active_content: 0,
      inactive_content: 0,
      pinned_content: 0,
      total_likes: 0,
      total_comments: 0,
      total_views: 0,
      total_revenue: 0,
      by_hub_type: {} as Record<string, number>,
      by_content_type: {} as Record<string, number>,
    },
    hubComments: [] as any[],
    selectedHubType: null as string | null,

    // Loading states
    loading: false,
    loadingSubtopics: false,
    loadingMaterials: false,
    loadingHubContent: false,
    loadingHubComments: false,
  }),

  getters: {
    // Get topics by filter
    activeTopics: (state) => state.topics.filter((t) => t.is_active),
    inactiveTopics: (state) => state.topics.filter((t) => !t.is_active),
    topicsWithoutSubtopics: (state) => state.topics.filter((t) => t.subtopics_count === 0),

    // Get subtopics by filter
    activeSubtopics: (state) => state.subtopics.filter((s) => s.is_active),
    inactiveSubtopics: (state) => state.subtopics.filter((s) => !s.is_active),
    subtopicsWithoutMaterials: (state) => state.subtopics.filter((s) => s.materials_count === 0),

    // Get topic by ID
    getTopicById: (state) => (id: number) => state.topics.find((t) => t.id === id),
    getSubtopicById: (state) => (id: number) => state.subtopics.find((s) => s.id === id),
  },

  actions: {
    // ==================== Topics Actions ====================

    /**
     * Fetch all topics with optional filters
     */
    async fetchTopics(filters?: TopicFilters) {
      console.log('📦 [Store] fetchTopics called with filters:', filters)
      this.loading = true
      try {
        console.log('📦 [Store] Calling hubsService.getTopics()...')
        this.topics = await hubsService.getTopics(filters)
        console.log('📦 [Store] hubsService.getTopics() returned:', this.topics)
        console.log('📦 [Store] this.topics.length:', this.topics?.length || 0)
        console.log('📦 [Store] this.topics is Array?', Array.isArray(this.topics))
        return this.topics
      } catch (error) {
        console.error('📦 [Store] Failed to fetch topics:', error)
        throw error
      } finally {
        this.loading = false
        console.log('📦 [Store] fetchTopics completed, loading set to false')
      }
    },

    /**
     * Fetch topic details by ID
     */
    async fetchTopicById(id: number) {
      this.loadingSubtopics = true
      try {
        this.selectedTopic = await hubsService.getTopicById(id)
        this.subtopics = this.selectedTopic.subtopics || []
        return this.selectedTopic
      } catch (error) {
        console.error('Failed to fetch topic:', error)
        throw error
      } finally {
        this.loadingSubtopics = false
      }
    },

    /**
     * Create a new topic
     */
    async createTopic(data: {
      name: string
      name_sw: string
      slug?: string
      description: string
      description_sw: string
      icon: string
      display_order: number
      is_active: boolean
    }) {
      try {
        const newTopic = await hubsService.createTopic(data)
        this.topics.unshift(newTopic)
        await this.fetchStatistics()
        return newTopic
      } catch (error) {
        console.error('Failed to create topic:', error)
        throw error
      }
    },

    /**
     * Update a topic
     */
    async updateTopic(
      id: number,
      data: {
        name: string
        name_sw: string
        slug: string
        description: string
        description_sw: string
        icon: string
        display_order: number
        is_active: boolean
      },
    ) {
      try {
        const updatedTopic = await hubsService.updateTopic(id, data)
        const index = this.topics.findIndex((t) => t.id === id)
        if (index !== -1) {
          this.topics.splice(index, 1, updatedTopic)
        }
        return updatedTopic
      } catch (error) {
        console.error('Failed to update topic:', error)
        throw error
      }
    },

    /**
     * Delete a topic
     */
    async deleteTopic(id: number) {
      try {
        await hubsService.deleteTopic(id)
        const index = this.topics.findIndex((t) => t.id === id)
        if (index !== -1) {
          this.topics.splice(index, 1)
        }
        await this.fetchStatistics()
      } catch (error) {
        console.error('Failed to delete topic:', error)
        throw error
      }
    },

    /**
     * Toggle topic active status
     */
    async toggleTopic(id: number, is_active?: boolean) {
      try {
        await hubsService.toggleTopic(id, is_active)
        await this.fetchTopics()
        await this.fetchStatistics()
      } catch (error) {
        console.error('Failed to toggle topic:', error)
        throw error
      }
    },

    /**
     * Bulk toggle topics
     */
    async bulkToggleTopics(data: BulkToggleData) {
      try {
        await hubsService.bulkToggleTopics(data)
        await this.fetchTopics()
        await this.fetchStatistics()
      } catch (error) {
        console.error('Failed to bulk toggle topics:', error)
        throw error
      }
    },

    /**
     * Fetch topic statistics
     */
    async fetchStatistics() {
      try {
        this.topicStatistics = await hubsService.getTopicStats()
        return this.topicStatistics
      } catch (error) {
        console.error('Failed to fetch statistics:', error)
        throw error
      }
    },

    // ==================== Subtopics Actions ====================

    /**
     * Fetch all subtopics with optional filters
     */
    async fetchSubtopics(filters?: SubtopicFilters) {
      this.loadingSubtopics = true
      try {
        this.subtopics = await hubsService.getSubtopics(filters)
        return this.subtopics
      } catch (error) {
        console.error('Failed to fetch subtopics:', error)
        throw error
      } finally {
        this.loadingSubtopics = false
      }
    },

    /**
     * Create a new subtopic
     */
    async createSubtopic(data: {
      topic: number
      name: string
      name_sw: string
      slug?: string
      description: string
      description_sw: string
      display_order: number
      is_active: boolean
    }) {
      try {
        const newSubtopic = await hubsService.createSubtopic(data)
        this.subtopics.unshift(newSubtopic)
        // Refresh topic details to update counts
        if (this.selectedTopic) {
          await this.fetchTopicById(this.selectedTopic.id)
        }
        await this.fetchStatistics()
        return newSubtopic
      } catch (error) {
        console.error('Failed to create subtopic:', error)
        throw error
      }
    },

    /**
     * Update a subtopic
     */
    async updateSubtopic(
      id: number,
      data: {
        topic: number
        name: string
        name_sw: string
        slug: string
        description: string
        description_sw: string
        display_order: number
        is_active: boolean
      },
    ) {
      try {
        const updatedSubtopic = await hubsService.updateSubtopic(id, data)
        const index = this.subtopics.findIndex((s) => s.id === id)
        if (index !== -1) {
          this.subtopics.splice(index, 1, updatedSubtopic)
        }
        // Refresh topic details
        if (this.selectedTopic) {
          await this.fetchTopicById(this.selectedTopic.id)
        }
        return updatedSubtopic
      } catch (error) {
        console.error('Failed to update subtopic:', error)
        throw error
      }
    },

    /**
     * Delete a subtopic
     */
    async deleteSubtopic(id: number) {
      try {
        await hubsService.deleteSubtopic(id)
        const index = this.subtopics.findIndex((s) => s.id === id)
        if (index !== -1) {
          this.subtopics.splice(index, 1)
        }
        // Refresh topic details
        if (this.selectedTopic) {
          await this.fetchTopicById(this.selectedTopic.id)
        }
        await this.fetchStatistics()
      } catch (error) {
        console.error('Failed to delete subtopic:', error)
        throw error
      }
    },

    /**
     * Toggle subtopic active status
     */
    async toggleSubtopic(id: number, is_active?: boolean) {
      try {
        await hubsService.toggleSubtopic(id, is_active)
        // Refresh topic details
        if (this.selectedTopic) {
          await this.fetchTopicById(this.selectedTopic.id)
        }
      } catch (error) {
        console.error('Failed to toggle subtopic:', error)
        throw error
      }
    },

    /**
     * Fetch materials for a subtopic
     */
    async fetchSubtopicMaterials(id: number, filters?: { is_approved?: boolean; is_active?: boolean }) {
      this.loadingMaterials = true
      try {
        const response = await hubsService.getSubtopicMaterials(id, filters)
        this.subtopicMaterials = response.materials
        // Also set the selected subtopic if we don't have it
        if (!this.selectedSubtopic || this.selectedSubtopic.id !== id) {
          if (Array.isArray(this.subtopics)) {
            const subtopic = this.subtopics.find((s) => s.id === id)
            if (subtopic) {
              this.selectedSubtopic = subtopic
            }
          }
        }
        return response
      } catch (error) {
        console.error('Failed to fetch subtopic materials:', error)
        throw error
      } finally {
        this.loadingMaterials = false
      }
    },

    /**
     * Clear selected topic
     */
    clearSelectedTopic() {
      this.selectedTopic = null
      this.subtopics = []
    },

    /**
     * Fetch subtopic statistics
     */
    async fetchSubtopicStatistics(topicId: number) {
      try {
        this.subtopicStatistics = await hubsService.getSubtopicStats(topicId)
        return this.subtopicStatistics
      } catch (error) {
        console.error('Failed to fetch subtopic statistics:', error)
        throw error
      }
    },

    /**
     * Approve material
     */
    async approveMaterial(materialId: number) {
      try {
        await hubsService.approveMaterial(materialId)
        await this.fetchSubtopicMaterials(this.selectedSubtopic?.id || 0)
      } catch (error) {
        console.error('Failed to approve material:', error)
        throw error
      }
    },

    /**
     * Reject material
     */
    async rejectMaterial(materialId: number, reason?: string) {
      try {
        await hubsService.rejectMaterial(materialId, reason)
        await this.fetchSubtopicMaterials(this.selectedSubtopic?.id || 0)
      } catch (error) {
        console.error('Failed to reject material:', error)
        throw error
      }
    },

    /**
     * Toggle material active status
     */
    async toggleMaterial(materialId: number) {
      try {
        await hubsService.toggleMaterial(materialId)
        await this.fetchSubtopicMaterials(this.selectedSubtopic?.id || 0)
      } catch (error) {
        console.error('Failed to toggle material:', error)
        throw error
      }
    },

    /**
     * Update material
     */
    async updateMaterial(materialId: number, data: any) {
      try {
        const updatedMaterial = await hubsService.updateMaterial(materialId, data)

        // Update the material in the local state
        const index = this.subtopicMaterials.findIndex((m) => m.id === materialId)
        if (index !== -1) {
          this.subtopicMaterials[index] = { ...this.subtopicMaterials[index], ...updatedMaterial }
        }

        return updatedMaterial
      } catch (error) {
        console.error('Failed to update material:', error)
        throw error
      }
    },

    /**
     * Create material for subtopic
     */
    async createMaterial(data: {
      title: string
      description: string
      subtopic: number
      category: string
      price: string | number
      uploader_type: string
      file?: string // base64 encoded file
      language?: string
      content_type?: string
      rich_text_content?: string
      is_downloadable?: boolean
      is_approved?: boolean
      is_active?: boolean
    }) {
      try {
        // Prepare JSON data
        const materialData: any = {
          title: data.title,
          description: data.description,
          subtopic: data.subtopic,
          category: data.category,
          price: typeof data.price === 'string' ? parseFloat(data.price) : data.price,
          uploader_type: data.uploader_type,
        }

        // Add optional fields only if they have values
        if (data.content_type) {
          materialData.content_type = data.content_type
        }

        if (data.language) {
          materialData.language = data.language
        }

        if (data.file) {
          materialData.file = data.file
        }

        if (data.rich_text_content) {
          materialData.rich_text_content = data.rich_text_content
        }

        if (data.is_downloadable !== undefined) {
          materialData.is_downloadable = data.is_downloadable
        }

        if (data.is_approved !== undefined) {
          materialData.is_approved = data.is_approved
        }

        if (data.is_active !== undefined) {
          materialData.is_active = data.is_active
        }

        console.log('Sending material data:', { ...materialData, file: materialData.file ? 'base64...' : undefined })

        const newMaterial = await hubsService.createMaterial(materialData)

        // Refresh materials list for the current subtopic
        if (this.selectedSubtopic?.id) {
          await this.fetchSubtopicMaterials(this.selectedSubtopic.id)
        }

        return newMaterial
      } catch (error) {
        console.error('Failed to create material:', error)
        throw error
      }
    },

    /**
     * Delete material
     */
    async deleteMaterial(materialId: number) {
      try {
        await hubsService.deleteMaterial(materialId)
        const index = this.subtopicMaterials.findIndex((m) => m.id === materialId)
        if (index !== -1) {
          this.subtopicMaterials.splice(index, 1)
        }
      } catch (error) {
        console.error('Failed to delete material:', error)
        throw error
      }
    },

    /**
     * Clear materials
     */
    clearMaterials() {
      this.subtopicMaterials = []
    },

    // ==================== Hub Forums/Content Actions ====================

    /**
     * Fetch hub content statistics
     */
    async fetchContentStatistics(hubType?: string, days?: number) {
      this.loadingHubContent = true
      try {
        this.hubContentStatistics = await hubsService.getContentStatistics(hubType, days)
      } catch (error) {
        console.error('Failed to fetch content statistics:', error)
        throw error
      } finally {
        this.loadingHubContent = false
      }
    },

    /**
     * Fetch hub content list with filters
     */
    async fetchHubContent(filters?: any) {
      this.loadingHubContent = true
      try {
        const response = await hubsService.getContentList(filters)
        this.hubContent = response.results || response
        return response
      } catch (error) {
        console.error('Failed to fetch hub content:', error)
        throw error
      } finally {
        this.loadingHubContent = false
      }
    },

    /**
     * Pin content
     */
    async pinContent(contentId: number) {
      try {
        const updatedContent = await hubsService.pinContent(contentId)
        const index = this.hubContent.findIndex((c) => c.id === contentId)
        if (index !== -1) {
          this.hubContent[index] = { ...this.hubContent[index], ...updatedContent }
        }
        return updatedContent
      } catch (error) {
        console.error('Failed to pin content:', error)
        throw error
      }
    },

    /**
     * Unpin content
     */
    async unpinContent(contentId: number) {
      try {
        const updatedContent = await hubsService.unpinContent(contentId)
        const index = this.hubContent.findIndex((c) => c.id === contentId)
        if (index !== -1) {
          this.hubContent[index] = { ...this.hubContent[index], ...updatedContent }
        }
        return updatedContent
      } catch (error) {
        console.error('Failed to unpin content:', error)
        throw error
      }
    },

    /**
     * Toggle content active status
     */
    async toggleContentActive(contentId: number) {
      try {
        const updatedContent = await hubsService.toggleContent(contentId)
        const index = this.hubContent.findIndex((c) => c.id === contentId)
        if (index !== -1) {
          this.hubContent[index] = { ...this.hubContent[index], ...updatedContent }
        }
        return updatedContent
      } catch (error) {
        console.error('Failed to toggle content:', error)
        throw error
      }
    },

    /**
     * Create new content
     */
    async createHubContent(data: any) {
      try {
        const newContent = await hubsService.createContent(data)
        // Add to local state
        this.hubContent.unshift(newContent.data)
        return newContent
      } catch (error) {
        console.error('Failed to create content:', error)
        throw error
      }
    },

    /**
     * Delete content
     */
    async deleteContent(contentId: number) {
      try {
        await hubsService.deleteContent(contentId)
        const index = this.hubContent.findIndex((c) => c.id === contentId)
        if (index !== -1) {
          this.hubContent.splice(index, 1)
        }
      } catch (error) {
        console.error('Failed to delete content:', error)
        throw error
      }
    },

    /**
     * Update content
     */
    async updateHubContent(contentId: number, updateData: any) {
      try {
        const updatedContent = await hubsService.updateContent(contentId, updateData)
        // Update in local state
        const index = this.hubContent.findIndex((c) => c.id === contentId)
        if (index !== -1) {
          this.hubContent[index] = { ...this.hubContent[index], ...updatedContent.data }
        }
        return updatedContent
      } catch (error) {
        console.error('Failed to update content:', error)
        throw error
      }
    },

    /**
     * Bulk delete content
     */
    async bulkDeleteContent(contentIds: number[]) {
      try {
        await hubsService.bulkDeleteContent(contentIds)
        this.hubContent = this.hubContent.filter((c) => !contentIds.includes(c.id))
      } catch (error) {
        console.error('Failed to bulk delete content:', error)
        throw error
      }
    },

    /**
     * Bulk toggle content active status
     */
    async bulkToggleContent(contentIds: number[], isActive: boolean) {
      try {
        await hubsService.bulkToggleContent(contentIds, isActive)
        // Update local state
        this.hubContent = this.hubContent.map((c) => (contentIds.includes(c.id) ? { ...c, is_active: isActive } : c))
      } catch (error) {
        console.error('Failed to bulk toggle content:', error)
        throw error
      }
    },

    /**
     * Bulk pin/unpin content
     */
    async bulkPinContent(contentIds: number[], isPinned: boolean) {
      try {
        await hubsService.bulkPinContent(contentIds, isPinned)
        // Update local state
        this.hubContent = this.hubContent.map((c) => (contentIds.includes(c.id) ? { ...c, is_pinned: isPinned } : c))
      } catch (error) {
        console.error('Failed to bulk pin content:', error)
        throw error
      }
    },

    /**
     * Fetch comments list
     */
    async fetchComments(filters?: any) {
      this.loadingHubComments = true
      try {
        const response = await hubsService.getCommentsList(filters)
        this.hubComments = response.results || response
        return response
      } catch (error) {
        console.error('Failed to fetch comments:', error)
        throw error
      } finally {
        this.loadingHubComments = false
      }
    },

    /**
     * Delete comment
     */
    async deleteComment(commentId: number) {
      try {
        await hubsService.deleteComment(commentId)
        const index = this.hubComments.findIndex((c) => c.id === commentId)
        if (index !== -1) {
          this.hubComments.splice(index, 1)
        }
      } catch (error) {
        console.error('Failed to delete comment:', error)
        throw error
      }
    },

    /**
     * Bulk delete comments
     */
    async bulkDeleteComments(commentIds: number[]) {
      try {
        await hubsService.bulkDeleteComments(commentIds)
        this.hubComments = this.hubComments.filter((c) => !commentIds.includes(c.id))
      } catch (error) {
        console.error('Failed to bulk delete comments:', error)
        throw error
      }
    },

    // ==================== Content Engagement Actions ====================

    /**
     * Fetch content comments
     */
    async fetchContentComments(contentId: number, params?: any) {
      try {
        return await hubsService.getContentComments(contentId, params)
      } catch (error) {
        console.error('Failed to fetch content comments:', error)
        throw error
      }
    },

    /**
     * Fetch content likes
     */
    async fetchContentLikes(contentId: number, params?: any) {
      try {
        return await hubsService.getContentLikes(contentId, params)
      } catch (error) {
        console.error('Failed to fetch content likes:', error)
        throw error
      }
    },

    /**
     * Fetch content bookmarks
     */
    async fetchContentBookmarks(contentId: number, params?: any) {
      try {
        return await hubsService.getContentBookmarks(contentId, params)
      } catch (error) {
        console.error('Failed to fetch content bookmarks:', error)
        throw error
      }
    },

    /**
     * Fetch content engagement summary
     */
    async fetchContentEngagement(contentId: number) {
      try {
        return await hubsService.getContentEngagement(contentId)
      } catch (error) {
        console.error('Failed to fetch content engagement:', error)
        throw error
      }
    },
  },
})
