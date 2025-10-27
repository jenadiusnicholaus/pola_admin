<template>
  <div class="hub-forums-page">
    <VaInnerLoading :loading="hubsStore.loadingHubContent">
      <!-- Page Header -->
      <div class="page-header mb-4 flex justify-between items-start">
        <div>
          <h1 class="page-title">Hubs/Forums Content Management</h1>
          <p class="text-secondary">Manage user-generated content across all hub types</p>
        </div>
        <VaButton color="primary" icon="add" @click="openCreateModal"> Create Content </VaButton>
      </div>

      <!-- Filters Row -->
      <VaCard class="mb-4">
        <VaCardContent>
          <div class="grid grid-cols-12 gap-3">
            <!-- Row 1: Main Filters -->
            <div class="col-span-12 md:col-span-3 lg:col-span-2">
              <VaSelect
                v-model="filters.hubType"
                label="Hub Type"
                :options="hubTypeOptions"
                placeholder="All Hubs"
                clearable
                @update:modelValue="applyFilters"
              />
            </div>

            <div class="col-span-12 md:col-span-3 lg:col-span-2">
              <VaSelect
                v-model="filters.contentType"
                label="Content Type"
                :options="contentTypeOptions"
                placeholder="All Types"
                clearable
                @update:modelValue="applyFilters"
              />
            </div>

            <div class="col-span-12 md:col-span-3 lg:col-span-2">
              <VaSelect
                v-model="filters.uploaderType"
                label="Uploader Type"
                :options="uploaderTypeOptions"
                placeholder="All Uploaders"
                clearable
                @update:modelValue="applyFilters"
              />
            </div>

            <div class="col-span-12 md:col-span-3 lg:col-span-2">
              <VaSelect
                v-model="filters.isActive"
                label="Status"
                :options="statusOptions"
                placeholder="All Status"
                clearable
                @update:modelValue="applyFilters"
              />
            </div>

            <div class="col-span-12 md:col-span-6 lg:col-span-4">
              <VaInput
                v-model="filters.search"
                label="Search"
                placeholder="Search by title or uploader..."
                @update:modelValue="debouncedSearch"
              >
                <template #prepend>
                  <VaIcon name="search" />
                </template>
              </VaInput>
            </div>

            <!-- Row 2: Secondary Actions -->
            <div class="col-span-12 md:col-span-6 lg:col-span-3">
              <VaSelect
                v-model="statisticsDays"
                label="Statistics Period"
                :options="timeRangeOptions"
                @update:modelValue="fetchStatistics"
              />
            </div>

            <div class="col-span-12 md:col-span-6 lg:col-span-3 flex items-end">
              <VaButton class="w-full" :loading="hubsStore.loadingHubContent" @click="refreshData">
                <VaIcon name="refresh" class="mr-1" /> Refresh
              </VaButton>
            </div>
          </div>
        </VaCardContent>
      </VaCard>

      <!-- Statistics Cards -->
      <div class="grid grid-cols-12 gap-3 mb-4">
        <div class="col-span-6 md:col-span-3">
          <VaCard>
            <VaCardContent class="text-center py-3">
              <div class="text-2xl font-bold text-primary">
                {{ hubsStore.hubContentStatistics.total_content || 0 }}
              </div>
              <div class="text-xs text-secondary mt-1">Total Content</div>
            </VaCardContent>
          </VaCard>
        </div>

        <div class="col-span-6 md:col-span-3">
          <VaCard>
            <VaCardContent class="text-center py-3">
              <div class="text-2xl font-bold text-success">
                {{ hubsStore.hubContentStatistics.active_content || 0 }}
              </div>
              <div class="text-xs text-secondary mt-1">Active Content</div>
            </VaCardContent>
          </VaCard>
        </div>

        <div class="col-span-6 md:col-span-3">
          <VaCard>
            <VaCardContent class="text-center py-3">
              <div class="text-2xl font-bold text-info">{{ hubsStore.hubContentStatistics.total_views || 0 }}</div>
              <div class="text-xs text-secondary mt-1">Total Views</div>
            </VaCardContent>
          </VaCard>
        </div>

        <div class="col-span-6 md:col-span-3">
          <VaCard>
            <VaCardContent class="text-center py-3">
              <div class="text-2xl font-bold text-warning">
                {{ formatCurrency(hubsStore.hubContentStatistics.total_revenue || 0) }}
              </div>
              <div class="text-xs text-secondary mt-1">Total Revenue</div>
            </VaCardContent>
          </VaCard>
        </div>
      </div>

      <!-- Bulk Actions Toolbar -->
      <VaCard v-if="selectedContentIds.length > 0" class="mb-4">
        <VaCardContent>
          <div class="flex items-center justify-between">
            <div class="text-sm">
              <strong>{{ selectedContentIds.length }}</strong> item(s) selected
            </div>
            <div class="flex gap-2">
              <VaButton size="small" color="success" @click="bulkActivate">
                <VaIcon name="check_circle" class="mr-1" />
                Activate
              </VaButton>
              <VaButton size="small" color="warning" @click="bulkDeactivate">
                <VaIcon name="cancel" class="mr-1" />
                Deactivate
              </VaButton>
              <VaButton size="small" color="info" @click="bulkPin">
                <VaIcon name="push_pin" class="mr-1" />
                Pin
              </VaButton>
              <VaButton size="small" color="secondary" @click="bulkUnpin">
                <VaIcon name="push_pin" class="mr-1" />
                Unpin
              </VaButton>
              <VaButton size="small" color="danger" @click="confirmBulkDelete">
                <VaIcon name="delete" class="mr-1" />
                Delete
              </VaButton>
            </div>
          </div>
        </VaCardContent>
      </VaCard>

      <!-- Content Table -->
      <VaCard>
        <VaCardContent>
          <VaDataTable
            v-model="selectedContentIds"
            :items="hubsStore.hubContent"
            :columns="columns"
            :loading="hubsStore.loadingHubContent"
            selectable
            select-mode="multiple"
            sticky-header
            :height="600"
            class="compact-table"
          >
            <!-- Hub Type Column -->
            <template #cell(hub_type)="{ rowData }">
              <VaBadge
                :text="formatHubType(rowData.hub_type)"
                :color="getHubTypeColor(rowData.hub_type)"
                class="text-xs"
              />
            </template>

            <!-- Content Type Column -->
            <template #cell(content_type)="{ rowData }">
              <VaBadge :text="formatContentType(rowData.content_type)" color="info" class="text-xs" />
            </template>

            <!-- Title Column -->
            <template #cell(title)="{ rowData }">
              <div class="flex items-center gap-1">
                <VaIcon v-if="rowData.is_pinned" name="push_pin" color="warning" size="small" />
                <span class="truncate max-w-xs">{{ rowData.title }}</span>
              </div>
            </template>

            <!-- Uploader Column -->
            <template #cell(uploader_info)="{ rowData }">
              <div v-if="rowData.uploader_info" class="text-xs">
                <div class="font-medium truncate">{{ rowData.uploader_info.full_name }}</div>
                <div class="text-secondary">{{ rowData.uploader_info.user_role }}</div>
              </div>
            </template>

            <!-- Status Column -->
            <template #cell(is_active)="{ rowData }">
              <VaBadge
                :text="rowData.is_active ? 'Active' : 'Inactive'"
                :color="rowData.is_active ? 'success' : 'danger'"
                class="text-xs"
              />
            </template>

            <!-- Stats Column -->
            <template #cell(stats)="{ rowData }">
              <div class="flex gap-2 text-xs">
                <span :title="`${rowData.views_count || 0} views`">👁️ {{ rowData.views_count || 0 }}</span>
                <span :title="`${rowData.likes_count || 0} likes`">❤️ {{ rowData.likes_count || 0 }}</span>
                <span :title="`${rowData.comments_count || 0} comments`">💬 {{ rowData.comments_count || 0 }}</span>
              </div>
            </template>

            <!-- Actions Column -->
            <template #cell(actions)="{ rowData }">
              <VaButtonDropdown size="small" color="primary" preset="plain" :close-on-content-click="false">
                <template #label>
                  <VaIcon name="more_vert" />
                </template>
                <VaDropdownContent class="p-2">
                  <div class="flex flex-col gap-1" style="min-width: 150px">
                    <VaButton
                      size="small"
                      color="info"
                      preset="plain"
                      icon="comment"
                      class="justify-start"
                      @click="viewComments(rowData)"
                    >
                      Comments ({{ rowData.comments_count || 0 }})
                    </VaButton>
                    <VaButton
                      size="small"
                      color="danger"
                      preset="plain"
                      icon="favorite"
                      class="justify-start"
                      @click="viewLikes(rowData)"
                    >
                      Likes ({{ rowData.likes_count || 0 }})
                    </VaButton>
                    <VaButton
                      size="small"
                      color="warning"
                      preset="plain"
                      icon="bookmark"
                      class="justify-start"
                      @click="viewBookmarks(rowData)"
                    >
                      Bookmarks ({{ rowData.bookmarks_count || 0 }})
                    </VaButton>
                    <VaDivider class="my-1" />
                    <VaButton
                      size="small"
                      color="primary"
                      preset="plain"
                      icon="edit"
                      class="justify-start"
                      @click="openEditModal(rowData)"
                    >
                      Edit
                    </VaButton>
                    <VaButton
                      size="small"
                      :color="rowData.is_pinned ? 'warning' : 'secondary'"
                      preset="plain"
                      icon="push_pin"
                      class="justify-start"
                      @click="togglePin(rowData)"
                    >
                      {{ rowData.is_pinned ? 'Unpin' : 'Pin' }}
                    </VaButton>
                    <VaButton
                      size="small"
                      :color="rowData.is_active ? 'warning' : 'success'"
                      preset="plain"
                      :icon="rowData.is_active ? 'visibility_off' : 'visibility'"
                      class="justify-start"
                      @click="toggleActive(rowData)"
                    >
                      {{ rowData.is_active ? 'Deactivate' : 'Activate' }}
                    </VaButton>
                    <VaDivider class="my-1" />
                    <VaButton
                      size="small"
                      color="danger"
                      preset="plain"
                      icon="delete"
                      class="justify-start"
                      @click="confirmDelete(rowData)"
                    >
                      Delete
                    </VaButton>
                  </div>
                </VaDropdownContent>
              </VaButtonDropdown>
            </template>
          </VaDataTable>
        </VaCardContent>
      </VaCard>

      <!-- Pagination -->
      <div v-if="pagination.count > 0" class="flex justify-center mt-4">
        <VaPagination
          v-model="pagination.currentPage"
          :pages="Math.ceil(pagination.count / pagination.pageSize)"
          :visible-pages="5"
          @update:modelValue="changePage"
        />
      </div>

      <!-- Delete Confirmation Modal -->
      <VaModal v-model="showDeleteModal" title="Confirm Delete" size="small" @ok="executeDelete" @cancel="cancelDelete">
        <p>Are you sure you want to delete this content? This action cannot be undone.</p>
        <p class="font-bold mt-2">{{ contentToDelete?.title }}</p>
      </VaModal>

      <!-- Bulk Delete Confirmation Modal -->
      <VaModal
        v-model="showBulkDeleteModal"
        title="Confirm Bulk Delete"
        size="small"
        @ok="executeBulkDelete"
        @cancel="cancelBulkDelete"
      >
        <p>
          Are you sure you want to delete {{ selectedContentIds.length }} content items? This action cannot be undone.
        </p>
      </VaModal>

      <!-- Comments Modal -->
      <VaModal v-model="showCommentsModal" title="Comments" size="large" hide-default-actions>
        <VaInnerLoading :loading="loadingEngagement">
          <div v-if="selectedContent">
            <div class="mb-4">
              <h3 class="text-lg font-bold">{{ selectedContent.title }}</h3>
              <p class="text-sm text-secondary">Total Comments: {{ engagementData.comments?.count || 0 }}</p>
            </div>

            <div v-if="engagementData.comments?.results?.length > 0" class="space-y-3">
              <VaCard v-for="comment in engagementData.comments.results" :key="comment.id" class="mb-2">
                <VaCardContent>
                  <div class="flex justify-between items-start">
                    <div class="flex-1">
                      <div class="flex items-center gap-2 mb-2">
                        <strong>{{ comment.author?.full_name || 'Anonymous' }}</strong>
                        <VaBadge :text="comment.author?.email" color="secondary" size="small" />
                      </div>
                      <p class="text-sm">{{ comment.comment_text }}</p>
                      <div class="flex gap-3 mt-2 text-xs text-secondary">
                        <span>❤️ {{ comment.likes_count || 0 }} likes</span>
                        <span>{{ formatDate(comment.created_at) }}</span>
                      </div>
                    </div>
                  </div>
                </VaCardContent>
              </VaCard>
            </div>
            <div v-else class="text-center py-8 text-secondary">No comments yet</div>

            <!-- Pagination for comments -->
            <div v-if="engagementData.comments?.count > 20" class="flex justify-center mt-4">
              <VaPagination
                v-model="commentsPagination.currentPage"
                :pages="Math.ceil(engagementData.comments.count / commentsPagination.pageSize)"
                @update:modelValue="loadComments"
              />
            </div>
          </div>
        </VaInnerLoading>
        <template #footer>
          <VaButton @click="showCommentsModal = false">Close</VaButton>
        </template>
      </VaModal>

      <!-- Likes Modal -->
      <VaModal v-model="showLikesModal" title="Likes" size="medium" hide-default-actions>
        <VaInnerLoading :loading="loadingEngagement">
          <div v-if="selectedContent">
            <div class="mb-4">
              <h3 class="text-lg font-bold">{{ selectedContent.title }}</h3>
              <p class="text-sm text-secondary">Total Likes: {{ engagementData.likes?.count || 0 }}</p>
            </div>

            <div v-if="engagementData.likes?.results?.length > 0" class="space-y-2">
              <VaCard v-for="like in engagementData.likes.results" :key="like.id" class="mb-2">
                <VaCardContent>
                  <div class="flex justify-between items-center">
                    <div>
                      <strong>{{ like.user_name || 'Anonymous' }}</strong>
                      <p class="text-xs text-secondary">{{ like.user_email }}</p>
                    </div>
                    <div class="text-xs text-secondary">{{ formatDate(like.created_at) }}</div>
                  </div>
                </VaCardContent>
              </VaCard>
            </div>
            <div v-else class="text-center py-8 text-secondary">No likes yet</div>

            <!-- Pagination for likes -->
            <div v-if="engagementData.likes?.count > 50" class="flex justify-center mt-4">
              <VaPagination
                v-model="likesPagination.currentPage"
                :pages="Math.ceil(engagementData.likes.count / likesPagination.pageSize)"
                @update:modelValue="loadLikes"
              />
            </div>
          </div>
        </VaInnerLoading>
        <template #footer>
          <VaButton @click="showLikesModal = false">Close</VaButton>
        </template>
      </VaModal>

      <!-- Bookmarks Modal -->
      <VaModal v-model="showBookmarksModal" title="Bookmarks" size="medium" hide-default-actions>
        <VaInnerLoading :loading="loadingEngagement">
          <div v-if="selectedContent">
            <div class="mb-4">
              <h3 class="text-lg font-bold">{{ selectedContent.title }}</h3>
              <p class="text-sm text-secondary">Total Bookmarks: {{ engagementData.bookmarks?.count || 0 }}</p>
            </div>

            <div v-if="engagementData.bookmarks?.results?.length > 0" class="space-y-2">
              <VaCard v-for="bookmark in engagementData.bookmarks.results" :key="bookmark.id" class="mb-2">
                <VaCardContent>
                  <div class="flex justify-between items-center">
                    <div>
                      <strong>{{ bookmark.user_name || 'Anonymous' }}</strong>
                      <p class="text-xs text-secondary">{{ bookmark.user_email }}</p>
                    </div>
                    <div class="text-xs text-secondary">{{ formatDate(bookmark.created_at) }}</div>
                  </div>
                </VaCardContent>
              </VaCard>
            </div>
            <div v-else class="text-center py-8 text-secondary">No bookmarks yet</div>

            <!-- Pagination for bookmarks -->
            <div v-if="engagementData.bookmarks?.count > 50" class="flex justify-center mt-4">
              <VaPagination
                v-model="bookmarksPagination.currentPage"
                :pages="Math.ceil(engagementData.bookmarks.count / bookmarksPagination.pageSize)"
                @update:modelValue="loadBookmarks"
              />
            </div>
          </div>
        </VaInnerLoading>
        <template #footer>
          <VaButton @click="showBookmarksModal = false">Close</VaButton>
        </template>
      </VaModal>

      <!-- Edit Content Modal -->
      <VaModal v-model="showEditModal" title="Edit Content" size="large" hide-default-actions>
        <VaInnerLoading :loading="loadingEdit">
          <form @submit.prevent="handleUpdateContent">
            <div class="grid grid-cols-12 gap-4">
              <!-- Title -->
              <div class="col-span-12">
                <VaInput v-model="editForm.title" label="Title *" :rules="[(v) => !!v || 'Title is required']" />
              </div>

              <!-- Description -->
              <div class="col-span-12">
                <VaTextarea
                  v-model="editForm.description"
                  label="Description"
                  :min-rows="3"
                  placeholder="Brief summary..."
                />
              </div>

              <!-- Hub Type -->
              <div class="col-span-12 md:col-span-6">
                <VaSelect
                  v-model="editForm.hub_type"
                  label="Hub Type *"
                  :options="hubTypeOptions"
                  value-by="value"
                  text-by="text"
                  :rules="[(v) => !!v || 'Hub type is required']"
                />
              </div>

              <!-- Content Type -->
              <div class="col-span-12 md:col-span-6">
                <VaSelect
                  v-model="editForm.content_type"
                  label="Content Type *"
                  :options="contentTypeOptions"
                  value-by="value"
                  text-by="text"
                  :rules="[(v) => !!v || 'Content type is required']"
                />
              </div>

              <!-- Language -->
              <div class="col-span-12 md:col-span-6">
                <VaSelect
                  v-model="editForm.language"
                  label="Language"
                  :options="languageOptions"
                  value-by="value"
                  text-by="text"
                  placeholder="Select language"
                />
              </div>

              <!-- Price -->
              <div class="col-span-12 md:col-span-6">
                <VaInput
                  v-model.number="editForm.price"
                  label="Price (TZS)"
                  type="number"
                  min="0"
                  :disabled="isPriceDisabled"
                  placeholder="0"
                />
                <p v-if="isPriceDisabled" class="text-xs text-secondary mt-1">This content type is always free</p>
              </div>

              <!-- Current File Info -->
              <div v-if="editForm.current_file_url" class="col-span-12">
                <VaAlert color="info" border="left">
                  <template #title>Current File</template>
                  <div class="flex items-center justify-between">
                    <span class="text-sm">{{ editForm.current_file_name || 'Attached file' }}</span>
                    <VaButton
                      size="small"
                      preset="plain"
                      icon="download"
                      @click="downloadFile(editForm.current_file_url)"
                    >
                      Download
                    </VaButton>
                  </div>
                </VaAlert>
              </div>

              <!-- File Upload (Optional) -->
              <div class="col-span-12">
                <VaFileUpload
                  v-model="editForm.fileUpload"
                  type="single"
                  file-types=".pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.txt"
                  dropzone
                >
                  <template #default>
                    <div class="text-center py-4">
                      <VaIcon name="cloud_upload" size="large" color="secondary" />
                      <p class="mt-2">Drop file here or click to upload new file</p>
                      <p class="text-xs text-secondary mt-1">Optional: PDF, DOC, DOCX, XLS, PPT, TXT (Max 10MB)</p>
                      <p v-if="editForm.current_file_url" class="text-xs text-warning mt-1">
                        Uploading a new file will replace the current one
                      </p>
                    </div>
                  </template>
                </VaFileUpload>
              </div>

              <!-- Video URL (Optional) -->
              <div class="col-span-12">
                <VaInput
                  v-model="editForm.video_url"
                  label="Video URL (Optional)"
                  placeholder="https://youtube.com/watch?v=... or https://vimeo.com/..."
                />
                <p class="text-xs text-secondary mt-1">Optional: Add a YouTube or Vimeo video link</p>
              </div>

              <!-- Full Content -->
              <div class="col-span-12">
                <VaTextarea
                  v-model="editForm.content"
                  label="Full Content (HTML/Markdown)"
                  :min-rows="6"
                  placeholder="Enter full article content..."
                />
              </div>

              <!-- Status Toggles -->
              <div class="col-span-12">
                <div class="grid grid-cols-12 gap-4">
                  <div class="col-span-12 md:col-span-4">
                    <VaSwitch v-model="editForm.is_pinned" label="Pinned" />
                  </div>
                  <div class="col-span-12 md:col-span-4">
                    <VaSwitch v-model="editForm.is_active" label="Active" />
                  </div>
                  <div class="col-span-12 md:col-span-4">
                    <VaSwitch v-model="editForm.is_approved" label="Approved" />
                  </div>
                  <div class="col-span-12 md:col-span-4">
                    <VaSwitch v-model="editForm.is_downloadable" label="Downloadable" />
                  </div>
                </div>
              </div>

              <!-- Info Box -->
              <div class="col-span-12">
                <VaAlert color="info" border="left">
                  <template #title>Update Information</template>
                  <p class="text-sm">Only the fields you modify will be updated. Other fields will remain unchanged.</p>
                </VaAlert>
              </div>
            </div>
          </form>
        </VaInnerLoading>

        <template #footer>
          <div class="flex gap-2 justify-end">
            <VaButton color="secondary" @click="closeEditModal">Cancel</VaButton>
            <VaButton :loading="loadingEdit" @click="handleUpdateContent">Update Content</VaButton>
          </div>
        </template>
      </VaModal>

      <!-- Create Content Modal -->
      <VaModal v-model="showCreateModal" size="large" title="Create New Content" hide-default-actions>
        <VaInnerLoading :loading="loadingCreate">
          <form @submit.prevent="handleCreateContent">
            <div class="grid grid-cols-12 gap-4">
              <!-- Title -->
              <div class="col-span-12">
                <VaInput
                  v-model="createForm.title"
                  label="Title *"
                  placeholder="Enter content title"
                  :rules="[(v) => !!v || 'Title is required']"
                />
              </div>

              <!-- Description -->
              <div class="col-span-12">
                <VaTextarea
                  v-model="createForm.description"
                  label="Description"
                  :min-rows="3"
                  placeholder="Brief description of the content..."
                />
              </div>

              <!-- Hub Type -->
              <div class="col-span-12 md:col-span-6">
                <VaSelect
                  v-model="createForm.hub_type"
                  label="Hub Type *"
                  :options="hubTypeOptions"
                  value-by="value"
                  text-by="text"
                  :rules="[(v) => !!v || 'Hub type is required']"
                />
              </div>

              <!-- Content Type -->
              <div class="col-span-12 md:col-span-6">
                <VaSelect
                  v-model="createForm.content_type"
                  label="Content Type *"
                  :options="contentTypeOptions"
                  value-by="value"
                  text-by="text"
                  :rules="[(v) => !!v || 'Content type is required']"
                />
              </div>

              <!-- Language -->
              <div class="col-span-12 md:col-span-6">
                <VaSelect
                  v-model="createForm.language"
                  label="Language"
                  :options="languageOptions"
                  value-by="value"
                  text-by="text"
                  placeholder="Select language"
                />
              </div>

              <!-- Price -->
              <div class="col-span-12 md:col-span-6">
                <VaInput
                  v-model.number="createForm.price"
                  label="Price (TZS)"
                  type="number"
                  min="0"
                  :disabled="isCreatePriceDisabled"
                  placeholder="0"
                />
                <p v-if="isCreatePriceDisabled" class="text-xs text-secondary mt-1">This content type is always free</p>
              </div>

              <!-- File Upload (Optional) -->
              <div class="col-span-12">
                <VaFileUpload
                  v-model="createForm.fileUpload"
                  type="single"
                  file-types=".pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.txt"
                  dropzone
                >
                  <template #default>
                    <div class="text-center py-4">
                      <VaIcon name="cloud_upload" size="large" color="secondary" />
                      <p class="mt-2">Drop file here or click to upload</p>
                      <p class="text-xs text-secondary mt-1">Optional: PDF, DOC, DOCX, XLS, PPT, TXT (Max 10MB)</p>
                    </div>
                  </template>
                </VaFileUpload>
              </div>

              <!-- Video URL (Optional) -->
              <div class="col-span-12">
                <VaInput
                  v-model="createForm.video_url"
                  label="Video URL (Optional)"
                  placeholder="https://youtube.com/watch?v=... or https://vimeo.com/..."
                />
                <p class="text-xs text-secondary mt-1">Optional: Add a YouTube or Vimeo video link</p>
              </div>

              <!-- Full Content -->
              <div class="col-span-12">
                <VaTextarea
                  v-model="createForm.content"
                  label="Full Content (HTML/Markdown)"
                  :min-rows="6"
                  placeholder="Enter full article content..."
                />
              </div>

              <!-- Status Toggles -->
              <div class="col-span-12">
                <div class="grid grid-cols-12 gap-4">
                  <div class="col-span-12 md:col-span-3">
                    <VaSwitch v-model="createForm.is_pinned" label="Pinned" />
                  </div>
                  <div class="col-span-12 md:col-span-3">
                    <VaSwitch v-model="createForm.is_active" label="Active" />
                  </div>
                  <div class="col-span-12 md:col-span-3">
                    <VaSwitch v-model="createForm.is_approved" label="Approved" />
                  </div>
                  <div class="col-span-12 md:col-span-3">
                    <VaSwitch v-model="createForm.is_downloadable" label="Downloadable" />
                  </div>
                </div>
              </div>

              <!-- Info Box -->
              <div class="col-span-12">
                <VaAlert color="info" border="left">
                  <template #title>Content Creation</template>
                  <p class="text-sm">
                    Fields marked with * are required. Price is automatically disabled for free content types (news,
                    discussion, announcement, question, article).
                  </p>
                </VaAlert>
              </div>
            </div>
          </form>
        </VaInnerLoading>

        <template #footer>
          <div class="flex gap-2 justify-end">
            <VaButton color="secondary" @click="closeCreateModal">Cancel</VaButton>
            <VaButton color="primary" :loading="loadingCreate" @click="handleCreateContent">Create Content</VaButton>
          </div>
        </template>
      </VaModal>
    </VaInnerLoading>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { useHubsStore } from '../../stores/hubs-store'
import { useToast } from 'vuestic-ui'

const hubsStore = useHubsStore()
const { init: notify } = useToast()

// Filters
const filters = ref({
  hubType: null as string | null,
  contentType: null as string | null,
  uploaderType: null as string | null,
  isActive: null as boolean | null,
  search: '',
})

const statisticsDays = ref(30)

// Filter Options
const hubTypeOptions = [
  { text: 'Advocates Hub', value: 'advocates' },
  { text: 'Students Hub', value: 'students' },
  { text: 'General Forum', value: 'forum' },
  { text: 'Legal Education', value: 'legal_ed' },
]

const contentTypeOptions = [
  // Post types (usually free, text-based)
  { text: 'Discussion Post', value: 'discussion' },
  { text: 'Question Post', value: 'question' },
  { text: 'Article', value: 'article' },
  { text: 'News', value: 'news' },
  { text: 'Announcement', value: 'announcement' },
  // Document types (can be paid, file-based)
  { text: 'General Document', value: 'document' },
  { text: 'Study Notes', value: 'notes' },
  { text: 'Past Exam Papers', value: 'past_papers' },
  { text: 'Assignments', value: 'assignments' },
  { text: 'Research Paper', value: 'research' },
  { text: 'Case Study', value: 'case_study' },
  { text: 'Tutorial', value: 'tutorial' },
  { text: 'Hub Content', value: 'hub_content' },
  { text: 'Other', value: 'other' },
]

const uploaderTypeOptions = [
  { text: 'Student', value: 'student' },
  { text: 'Advocate', value: 'advocate' },
  { text: 'Verified Professional', value: 'verified_professional' },
]

const statusOptions = [
  { text: 'Active', value: true },
  { text: 'Inactive', value: false },
]

const timeRangeOptions = [
  { text: 'Last 7 Days', value: 7 },
  { text: 'Last 30 Days', value: 30 },
  { text: 'Last 90 Days', value: 90 },
  { text: 'All Time', value: null },
]

const languageOptions = [
  { text: 'English', value: 'en' },
  { text: 'Swahili', value: 'sw' },
]

// Computed
const isPriceDisabled = computed(() => {
  const freeTypes = ['news', 'discussion', 'announcement', 'question', 'article']
  return freeTypes.includes(editForm.value.content_type)
})

const isCreatePriceDisabled = computed(() => {
  const freeTypes = ['news', 'discussion', 'announcement', 'question', 'article']
  return freeTypes.includes(createForm.value.content_type)
})

// Table columns
const columns = [
  { key: 'hub_type', label: 'Hub Type', sortable: true },
  { key: 'content_type', label: 'Content Type', sortable: true },
  { key: 'title', label: 'Title', sortable: true },
  { key: 'uploader_info', label: 'Uploader', sortable: false },
  { key: 'is_active', label: 'Status', sortable: true },
  { key: 'stats', label: 'Stats', sortable: false },
  { key: 'actions', label: 'Actions', sortable: false },
]

// Selection
const selectedContentIds = ref<number[]>([])

// Pagination
const pagination = ref({
  currentPage: 1,
  pageSize: 20,
  count: 0,
})

// Delete modals
const showDeleteModal = ref(false)
const contentToDelete = ref<any>(null)
const showBulkDeleteModal = ref(false)

// Engagement modals
const showCommentsModal = ref(false)
const showLikesModal = ref(false)
const showBookmarksModal = ref(false)
const selectedContent = ref<any>(null)
const loadingEngagement = ref(false)

// Edit modal
const showEditModal = ref(false)
const loadingEdit = ref(false)
const editForm = ref({
  title: '',
  description: '',
  content: '',
  hub_type: '',
  content_type: '',
  language: '',
  price: 0,
  video_url: '',
  is_pinned: false,
  is_active: true,
  is_approved: true,
  is_downloadable: false,
  fileUpload: [] as any,
  current_file_url: '',
  current_file_name: '',
})
const contentToEdit = ref<any>(null)

// Create modal
const showCreateModal = ref(false)
const loadingCreate = ref(false)
const createForm = ref({
  title: '',
  description: '',
  content: '',
  hub_type: '',
  content_type: '',
  language: 'en',
  price: 0,
  video_url: '',
  is_pinned: false,
  is_active: true,
  is_approved: true,
  is_downloadable: false,
  fileUpload: [] as any,
})

// Engagement data
const engagementData = ref<{
  comments: any
  likes: any
  bookmarks: any
}>({
  comments: null,
  likes: null,
  bookmarks: null,
})

// Engagement pagination
const commentsPagination = ref({ currentPage: 1, pageSize: 20 })
const likesPagination = ref({ currentPage: 1, pageSize: 50 })
const bookmarksPagination = ref({ currentPage: 1, pageSize: 50 })

// Debounce timer for search
let searchTimeout: ReturnType<typeof setTimeout>

// Methods
const fetchStatistics = async () => {
  try {
    await hubsStore.fetchContentStatistics(filters.value.hubType || undefined, statisticsDays.value)
  } catch (error) {
    notify({
      message: 'Failed to fetch statistics',
      color: 'danger',
    })
  }
}

const fetchContent = async () => {
  try {
    const params: any = {
      page: pagination.value.currentPage,
      page_size: pagination.value.pageSize,
    }

    if (filters.value.hubType) params.hub_type = filters.value.hubType
    if (filters.value.contentType) params.content_type = filters.value.contentType
    if (filters.value.uploaderType) params.uploader_type = filters.value.uploaderType
    if (filters.value.isActive !== null) params.is_active = filters.value.isActive
    if (filters.value.search) params.search = filters.value.search

    const response = await hubsStore.fetchHubContent(params)
    pagination.value.count = response.count || 0
  } catch (error) {
    notify({
      message: 'Failed to fetch content',
      color: 'danger',
    })
  }
}

const applyFilters = () => {
  pagination.value.currentPage = 1
  fetchContent()
}

const debouncedSearch = () => {
  clearTimeout(searchTimeout)
  searchTimeout = setTimeout(() => {
    applyFilters()
  }, 500)
}

const changePage = (page: number) => {
  pagination.value.currentPage = page
  fetchContent()
}

const refreshData = () => {
  fetchStatistics()
  fetchContent()
}

// Action methods
const togglePin = async (content: any) => {
  try {
    if (content.is_pinned) {
      await hubsStore.unpinContent(content.id)
      notify({
        message: 'Content unpinned successfully',
        color: 'success',
      })
    } else {
      await hubsStore.pinContent(content.id)
      notify({
        message: 'Content pinned successfully',
        color: 'success',
      })
    }
  } catch (error) {
    notify({
      message: `Failed to ${content.is_pinned ? 'unpin' : 'pin'} content`,
      color: 'danger',
    })
  }
}

const toggleActive = async (content: any) => {
  try {
    await hubsStore.toggleContentActive(content.id)
    notify({
      message: `Content ${content.is_active ? 'deactivated' : 'activated'} successfully`,
      color: 'success',
    })
  } catch (error) {
    notify({
      message: 'Failed to toggle content status',
      color: 'danger',
    })
  }
}

const confirmDelete = (content: any) => {
  contentToDelete.value = content
  showDeleteModal.value = true
}

const executeDelete = async () => {
  try {
    await hubsStore.deleteContent(contentToDelete.value.id)
    notify({
      message: 'Content deleted successfully',
      color: 'success',
    })
    showDeleteModal.value = false
    contentToDelete.value = null
  } catch (error) {
    notify({
      message: 'Failed to delete content',
      color: 'danger',
    })
  }
}

const cancelDelete = () => {
  showDeleteModal.value = false
  contentToDelete.value = null
}

// Bulk actions
const bulkActivate = async () => {
  try {
    await hubsStore.bulkToggleContent(selectedContentIds.value, true)
    notify({
      message: `${selectedContentIds.value.length} items activated successfully`,
      color: 'success',
    })
    selectedContentIds.value = []
  } catch (error) {
    notify({
      message: 'Failed to activate content',
      color: 'danger',
    })
  }
}

const bulkDeactivate = async () => {
  try {
    await hubsStore.bulkToggleContent(selectedContentIds.value, false)
    notify({
      message: `${selectedContentIds.value.length} items deactivated successfully`,
      color: 'success',
    })
    selectedContentIds.value = []
  } catch (error) {
    notify({
      message: 'Failed to deactivate content',
      color: 'danger',
    })
  }
}

const bulkPin = async () => {
  try {
    await hubsStore.bulkPinContent(selectedContentIds.value, true)
    notify({
      message: `${selectedContentIds.value.length} items pinned successfully`,
      color: 'success',
    })
    selectedContentIds.value = []
  } catch (error) {
    notify({
      message: 'Failed to pin content',
      color: 'danger',
    })
  }
}

const bulkUnpin = async () => {
  try {
    await hubsStore.bulkPinContent(selectedContentIds.value, false)
    notify({
      message: `${selectedContentIds.value.length} items unpinned successfully`,
      color: 'success',
    })
    selectedContentIds.value = []
  } catch (error) {
    notify({
      message: 'Failed to unpin content',
      color: 'danger',
    })
  }
}

const confirmBulkDelete = () => {
  showBulkDeleteModal.value = true
}

const executeBulkDelete = async () => {
  try {
    await hubsStore.bulkDeleteContent(selectedContentIds.value)
    notify({
      message: `${selectedContentIds.value.length} items deleted successfully`,
      color: 'success',
    })
    selectedContentIds.value = []
    showBulkDeleteModal.value = false
  } catch (error) {
    notify({
      message: 'Failed to delete content',
      color: 'danger',
    })
  }
}

const cancelBulkDelete = () => {
  showBulkDeleteModal.value = false
}

// Engagement viewing methods
const viewComments = async (content: any) => {
  selectedContent.value = content
  commentsPagination.value.currentPage = 1
  showCommentsModal.value = true
  await loadComments()
}

const viewLikes = async (content: any) => {
  selectedContent.value = content
  likesPagination.value.currentPage = 1
  showLikesModal.value = true
  await loadLikes()
}

const viewBookmarks = async (content: any) => {
  selectedContent.value = content
  bookmarksPagination.value.currentPage = 1
  showBookmarksModal.value = true
  await loadBookmarks()
}

const loadComments = async () => {
  if (!selectedContent.value) return

  loadingEngagement.value = true
  try {
    const response = await hubsStore.fetchContentComments(selectedContent.value.id, {
      page: commentsPagination.value.currentPage,
      page_size: commentsPagination.value.pageSize,
    })
    engagementData.value.comments = response
  } catch (error) {
    notify({
      message: 'Failed to load comments',
      color: 'danger',
    })
  } finally {
    loadingEngagement.value = false
  }
}

const loadLikes = async () => {
  if (!selectedContent.value) return

  loadingEngagement.value = true
  try {
    const response = await hubsStore.fetchContentLikes(selectedContent.value.id, {
      page: likesPagination.value.currentPage,
      page_size: likesPagination.value.pageSize,
    })
    engagementData.value.likes = response
  } catch (error) {
    notify({
      message: 'Failed to load likes',
      color: 'danger',
    })
  } finally {
    loadingEngagement.value = false
  }
}

const loadBookmarks = async () => {
  if (!selectedContent.value) return

  loadingEngagement.value = true
  try {
    const response = await hubsStore.fetchContentBookmarks(selectedContent.value.id, {
      page: bookmarksPagination.value.currentPage,
      page_size: bookmarksPagination.value.pageSize,
    })
    engagementData.value.bookmarks = response
  } catch (error) {
    notify({
      message: 'Failed to load bookmarks',
      color: 'danger',
    })
  } finally {
    loadingEngagement.value = false
  }
}

// Edit content methods
const openEditModal = (content: any) => {
  contentToEdit.value = content
  // Populate form with current values
  editForm.value = {
    title: content.title || '',
    description: content.description || '',
    content: content.content || '',
    hub_type: content.hub_type || '',
    content_type: content.content_type || '',
    language: content.language || 'en',
    price: parseFloat(content.price) || 0,
    video_url: content.video_url || '',
    is_pinned: content.is_pinned || false,
    is_active: content.is_active !== undefined ? content.is_active : true,
    is_approved: content.is_approved !== undefined ? content.is_approved : true,
    is_downloadable: content.is_downloadable || false,
    fileUpload: [] as any,
    current_file_url: content.file || '',
    current_file_name: content.file_name || '',
  }
  showEditModal.value = true
}

const closeEditModal = () => {
  showEditModal.value = false
  resetEditForm()
}

const resetEditForm = () => {
  editForm.value = {
    title: '',
    description: '',
    content: '',
    hub_type: '',
    content_type: '',
    language: '',
    price: 0,
    video_url: '',
    is_pinned: false,
    is_active: true,
    is_approved: true,
    is_downloadable: false,
    fileUpload: [] as any,
    current_file_url: '',
    current_file_name: '',
  }
  contentToEdit.value = null
}

const handleUpdateContent = async () => {
  if (!contentToEdit.value) return

  // Validation
  if (!editForm.value.title || !editForm.value.hub_type || !editForm.value.content_type) {
    notify({
      message: 'Please fill in all required fields',
      color: 'warning',
    })
    return
  }

  // Validate video URL if provided
  if (editForm.value.video_url && editForm.value.video_url.trim()) {
    const urlPattern = /^(https?:\/\/)?(www\.)?(youtube\.com|youtu\.be|vimeo\.com)\/.+/i
    if (!urlPattern.test(editForm.value.video_url.trim())) {
      notify({
        message: 'Please enter a valid YouTube or Vimeo URL',
        color: 'warning',
      })
      return
    }
  }

  loadingEdit.value = true
  try {
    // Build update payload - only include fields that might have changed
    const updatePayload: any = {
      title: editForm.value.title,
      description: editForm.value.description || '',
      hub_type: editForm.value.hub_type,
      content_type: editForm.value.content_type,
      is_pinned: editForm.value.is_pinned,
      is_active: editForm.value.is_active,
      is_approved: editForm.value.is_approved,
      is_downloadable: editForm.value.is_downloadable,
    }

    // Add optional fields if they have values
    if (editForm.value.content) updatePayload.content = editForm.value.content
    if (editForm.value.video_url && editForm.value.video_url.trim()) {
      updatePayload.video_url = editForm.value.video_url.trim()
    }
    if (editForm.value.language) updatePayload.language = editForm.value.language

    // Add price only if not a free content type
    if (!isPriceDisabled.value) {
      updatePayload.price = editForm.value.price || 0
    }

    // Handle file upload (optional) - convert to base64
    if (editForm.value.fileUpload && editForm.value.fileUpload.length > 0) {
      try {
        const file = editForm.value.fileUpload[0]
        const base64File = await convertFileToBase64(file)
        updatePayload.file = base64File
      } catch (error) {
        console.error('File conversion error:', error)
        notify({
          message: 'Failed to process file. Please try again.',
          color: 'warning',
        })
        loadingEdit.value = false
        return
      }
    }

    await hubsStore.updateHubContent(contentToEdit.value.id, updatePayload)

    notify({
      message: 'Content updated successfully',
      color: 'success',
    })

    closeEditModal()
    // Refresh the content list
    await fetchContent()
  } catch (error: any) {
    console.error('Update error:', error)
    notify({
      message: error.response?.data?.message || 'Failed to update content',
      color: 'danger',
    })
  } finally {
    loadingEdit.value = false
  }
}

// Create modal methods
const openCreateModal = () => {
  resetCreateForm()
  showCreateModal.value = true
}

const closeCreateModal = () => {
  showCreateModal.value = false
  resetCreateForm()
}

const resetCreateForm = () => {
  createForm.value = {
    title: '',
    description: '',
    content: '',
    hub_type: '',
    content_type: '',
    language: 'en',
    price: 0,
    video_url: '',
    is_pinned: false,
    is_active: true,
    is_approved: true,
    is_downloadable: false,
    fileUpload: [] as any,
  }
}

const handleCreateContent = async () => {
  // Validation
  if (!createForm.value.title || !createForm.value.hub_type || !createForm.value.content_type) {
    notify({
      message: 'Please fill in all required fields (Title, Hub Type, Content Type)',
      color: 'warning',
    })
    return
  }

  // Validate video URL if provided
  if (createForm.value.video_url && createForm.value.video_url.trim()) {
    const urlPattern = /^(https?:\/\/)?(www\.)?(youtube\.com|youtu\.be|vimeo\.com)\/.+/i
    if (!urlPattern.test(createForm.value.video_url.trim())) {
      notify({
        message: 'Please enter a valid YouTube or Vimeo URL',
        color: 'warning',
      })
      return
    }
  }

  loadingCreate.value = true
  try {
    // Build create payload
    const createPayload: any = {
      title: createForm.value.title,
      hub_type: createForm.value.hub_type,
      content_type: createForm.value.content_type,
      is_pinned: createForm.value.is_pinned,
      is_active: createForm.value.is_active,
      is_approved: createForm.value.is_approved,
      is_downloadable: createForm.value.is_downloadable,
    }

    // Add optional fields if they have values
    if (createForm.value.description) createPayload.description = createForm.value.description
    if (createForm.value.content) createPayload.content = createForm.value.content
    if (createForm.value.video_url && createForm.value.video_url.trim()) {
      createPayload.video_url = createForm.value.video_url.trim()
    }
    if (createForm.value.language) createPayload.language = createForm.value.language

    // Add price only if not a free content type
    if (!isCreatePriceDisabled.value && createForm.value.price) {
      createPayload.price = createForm.value.price
    }

    // Handle file upload (optional) - convert to base64
    if (createForm.value.fileUpload && createForm.value.fileUpload.length > 0) {
      try {
        const file = createForm.value.fileUpload[0]
        const base64File = await convertFileToBase64(file)
        createPayload.file = base64File
      } catch (error) {
        console.error('File conversion error:', error)
        notify({
          message: 'Failed to process file. Please try again.',
          color: 'warning',
        })
        loadingCreate.value = false
        return
      }
    }

    await hubsStore.createHubContent(createPayload)

    notify({
      message: 'Content created successfully',
      color: 'success',
    })

    closeCreateModal()
    // Refresh the content list
    await fetchContent()
    await fetchStatistics()
  } catch (error: any) {
    console.error('Create error:', error)
    notify({
      message: error.response?.data?.message || 'Failed to create content',
      color: 'danger',
    })
  } finally {
    loadingCreate.value = false
  }
}

// File handling helpers
const convertFileToBase64 = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.readAsDataURL(file)
    reader.onload = () => resolve(reader.result as string)
    reader.onerror = (error) => reject(error)
  })
}

const downloadFile = (url: string) => {
  window.open(url, '_blank')
}

// Formatting helpers
const formatHubType = (type: string) => {
  const types: Record<string, string> = {
    advocates: 'Advocates',
    students: 'Students',
    forum: 'Forum',
    legal_ed: 'Legal Ed',
  }
  return types[type] || type
}

const getHubTypeColor = (type: string) => {
  const colors: Record<string, string> = {
    advocates: 'primary',
    students: 'success',
    forum: 'info',
    legal_ed: 'warning',
  }
  return colors[type] || 'secondary'
}

const formatContentType = (type: string) => {
  return type
    .split('_')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ')
}

const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat('en-KE', {
    style: 'currency',
    currency: 'KES',
  }).format(amount || 0)
}

const formatDate = (dateString: string) => {
  if (!dateString) return 'N/A'
  const date = new Date(dateString)
  return new Intl.DateTimeFormat('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(date)
}

// Lifecycle
onMounted(() => {
  fetchStatistics()
  fetchContent()
})
</script>

<style scoped>
.hub-forums-page {
  padding: 1rem;
}

.page-header {
  margin-bottom: 1.5rem;
}

.page-title {
  font-size: 1.75rem;
  font-weight: 700;
  margin-bottom: 0.5rem;
}

/* Compact table styling */
:deep(.compact-table) {
  font-size: 0.875rem;
}

:deep(.compact-table .va-data-table__table-tr) {
  height: auto !important;
  min-height: 40px;
}

:deep(.compact-table .va-data-table__table-td) {
  padding: 0.5rem !important;
  white-space: nowrap;
}

:deep(.compact-table .va-badge) {
  font-size: 0.75rem;
  padding: 0.25rem 0.5rem;
}

/* Ensure title column can wrap */
:deep(.compact-table .va-data-table__table-td:has(.truncate)) {
  white-space: normal;
  max-width: 300px;
}

.truncate {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.max-w-xs {
  max-width: 20rem;
}
</style>
