<template>
  <div class="user-profile-page">
    <!-- Loading State -->
    <div v-if="isLoadingProfile" class="loading-container">
      <VaProgressCircle indeterminate size="64px" />
      <p class="loading-text">Loading your profile...</p>
    </div>

    <!-- Error State -->
    <div v-else-if="profileError" class="error-container">
      <VaAlert color="danger" icon="error" border="left">
        <div class="error-content">
          <h3>Unable to Load Profile</h3>
          <p>{{ profileError }}</p>
          <VaButton icon="refresh" preset="secondary" @click="retryLoadProfile"> Try Again </VaButton>
        </div>
      </VaAlert>
    </div>

    <!-- Profile Content -->
    <div v-else-if="profile" class="profile-content">
      <!-- Profile Header -->
      <VaCard class="profile-header-card">
        <VaCardContent>
          <div class="profile-header">
            <div class="profile-picture-section">
              <VaAvatar :src="profile.profile_picture || undefined" size="large" class="profile-avatar">
                <template v-if="!profile.profile_picture">
                  {{ getInitials(profile.first_name, profile.last_name) }}
                </template>
              </VaAvatar>
              <VaButton
                preset="plain"
                icon="photo_camera"
                size="small"
                class="change-photo-btn"
                @click="changeProfilePicture"
              >
                Change Photo
              </VaButton>
            </div>

            <div class="profile-info">
              <h1 class="profile-name">{{ profile.first_name }} {{ profile.last_name }}</h1>
              <p class="profile-email">{{ profile.email }}</p>

              <div class="profile-badges">
                <VaBadge v-if="profile.user_role" :text="profile.user_role.display" color="primary" />
                <VaBadge
                  :text="profile.is_verified ? 'Verified' : 'Not Verified'"
                  :color="profile.is_verified ? 'success' : 'warning'"
                />
                <VaBadge v-if="profile.is_active" text="Active" color="info" />
              </div>

              <!-- Verification Status -->
              <div class="verification-status-section">
                <div class="status-header">
                  <VaIcon name="verified_user" size="small" />
                  <span class="status-label">Verification Status:</span>
                  <span class="status-value">{{ profile.verification_status.status }}</span>
                </div>
                <VaProgressBar
                  :model-value="profile.verification_status.progress"
                  :color="getProgressColor(profile.verification_status.progress)"
                  size="small"
                  class="status-progress"
                />
                <p class="status-step">Current Step: {{ profile.verification_status.current_step }}</p>
                <VaButton v-if="!profile.is_verified" size="small" color="primary" @click="goToVerification">
                  Continue Verification
                </VaButton>
              </div>
            </div>
          </div>
        </VaCardContent>
      </VaCard>

      <!-- Profile Details Tabs -->
      <VaCard class="profile-details-card">
        <VaCardContent>
          <!-- Custom Tab Navigation -->
          <div class="custom-tabs-navigation">
            <VaButton
              :color="activeTab === 'personal' ? 'primary' : 'secondary'"
              :preset="activeTab === 'personal' ? undefined : 'secondary'"
              class="tab-button"
              @click="activeTab = 'personal'"
            >
              <VaIcon name="person" size="small" class="tab-icon" />
              Personal Information
            </VaButton>
            <VaButton
              :color="activeTab === 'contact' ? 'primary' : 'secondary'"
              :preset="activeTab === 'contact' ? undefined : 'secondary'"
              class="tab-button"
              @click="activeTab = 'contact'"
            >
              <VaIcon name="contact_phone" size="small" class="tab-icon" />
              Contact & Address
            </VaButton>
            <VaButton
              v-if="profile.user_role"
              :color="activeTab === 'professional' ? 'primary' : 'secondary'"
              :preset="activeTab === 'professional' ? undefined : 'secondary'"
              class="tab-button"
              @click="activeTab = 'professional'"
            >
              <VaIcon name="work" size="small" class="tab-icon" />
              Professional Details
            </VaButton>
            <VaButton
              :color="activeTab === 'security' ? 'primary' : 'secondary'"
              :preset="activeTab === 'security' ? undefined : 'secondary'"
              class="tab-button"
              @click="activeTab = 'security'"
            >
              <VaIcon name="security" size="small" class="tab-icon" />
              Security
            </VaButton>
          </div>

          <!-- Tab Content -->
          <div class="tab-content-wrapper">
            <!-- Personal Information Content -->
            <div v-if="activeTab === 'personal'" class="tab-content-panel">
              <div class="tab-content">
                <h3 class="section-title">Personal Information</h3>

                <div class="info-grid">
                  <div class="info-item">
                    <label>First Name</label>
                    <p>{{ profile.first_name || 'Not provided' }}</p>
                  </div>
                  <div class="info-item">
                    <label>Last Name</label>
                    <p>{{ profile.last_name || 'Not provided' }}</p>
                  </div>
                  <div class="info-item">
                    <label>Date of Birth</label>
                    <p>{{ formatDate(profile.date_of_birth) }}</p>
                  </div>
                  <div class="info-item">
                    <label>Gender</label>
                    <p>{{ getGenderDisplay(profile.gender) }}</p>
                  </div>
                  <div class="info-item">
                    <label>ID Number</label>
                    <p>{{ profile.id_number || 'Not provided' }}</p>
                  </div>
                  <div class="info-item">
                    <label>Member Since</label>
                    <p>{{ formatDate(profile.date_joined) }}</p>
                  </div>
                </div>

                <VaButton preset="secondary" icon="edit" class="edit-btn" @click="editPersonalInfo">
                  Edit Personal Information
                </VaButton>
              </div>
            </div>

            <!-- Contact & Address Content -->
            <div v-if="activeTab === 'contact'" class="tab-content-panel">
              <div class="tab-content">
                <h3 class="section-title">Contact Information</h3>

                <div class="info-grid">
                  <div class="info-item">
                    <label>Email</label>
                    <p>{{ profile.email }}</p>
                  </div>
                  <div v-if="profile.contact?.phone_number" class="info-item">
                    <label>Phone Number</label>
                    <p>{{ profile.contact.phone_number }}</p>
                  </div>
                  <div v-if="profile.contact?.alternative_phone" class="info-item">
                    <label>Alternative Phone</label>
                    <p>{{ profile.contact.alternative_phone }}</p>
                  </div>
                </div>

                <h3 class="section-title">Address</h3>

                <div v-if="profile.address" class="info-grid">
                  <div v-if="profile.address.street" class="info-item">
                    <label>Street</label>
                    <p>{{ profile.address.street }}</p>
                  </div>
                  <div v-if="profile.address.city" class="info-item">
                    <label>City</label>
                    <p>{{ profile.address.city }}</p>
                  </div>
                  <div v-if="profile.address.region" class="info-item">
                    <label>Region</label>
                    <p>{{ profile.address.region }}</p>
                  </div>
                  <div v-if="profile.address.district" class="info-item">
                    <label>District</label>
                    <p>{{ profile.address.district }}</p>
                  </div>
                  <div v-if="profile.address.ward" class="info-item">
                    <label>Ward</label>
                    <p>{{ profile.address.ward }}</p>
                  </div>
                </div>
                <p v-else class="no-data">No address information provided</p>

                <VaButton preset="secondary" icon="edit" class="edit-btn" @click="editContactInfo">
                  Edit Contact & Address
                </VaButton>
              </div>
            </div>

            <!-- Professional Details Content -->
            <div v-if="activeTab === 'professional' && profile.user_role" class="tab-content-panel">
              <div class="tab-content">
                <h3 class="section-title">Professional Details</h3>

                <div class="info-grid">
                  <div class="info-item">
                    <label>Role</label>
                    <p>{{ profile.user_role.display }}</p>
                  </div>

                  <!-- Advocate/Lawyer Specific -->
                  <template v-if="profile.user_role.value === 'advocate' || profile.user_role.value === 'lawyer'">
                    <div v-if="profile.roll_number" class="info-item">
                      <label>Roll Number</label>
                      <p>{{ profile.roll_number }}</p>
                    </div>
                    <div v-if="profile.bar_membership_number" class="info-item">
                      <label>Bar Membership Number</label>
                      <p>{{ profile.bar_membership_number }}</p>
                    </div>
                    <div v-if="profile.practice_status" class="info-item">
                      <label>Practice Status</label>
                      <p>{{ profile.practice_status }}</p>
                    </div>
                    <div v-if="profile.years_of_experience" class="info-item">
                      <label>Years of Experience</label>
                      <p>{{ profile.years_of_experience }} years</p>
                    </div>
                    <div v-if="profile.regional_champter" class="info-item">
                      <label>Regional Chapter</label>
                      <p>{{ profile.regional_champter }}</p>
                    </div>
                    <div v-if="profile.associated_law_firm" class="info-item">
                      <label>Associated Law Firm</label>
                      <p>{{ profile.associated_law_firm }}</p>
                    </div>
                  </template>

                  <!-- Law Firm Specific -->
                  <template v-if="profile.user_role.value === 'law_firm'">
                    <div v-if="profile.firm_name" class="info-item">
                      <label>Firm Name</label>
                      <p>{{ profile.firm_name }}</p>
                    </div>
                    <div v-if="profile.managing_partner" class="info-item">
                      <label>Managing Partner</label>
                      <p>{{ profile.managing_partner }}</p>
                    </div>
                    <div v-if="profile.number_of_lawyers" class="info-item">
                      <label>Number of Lawyers</label>
                      <p>{{ profile.number_of_lawyers }}</p>
                    </div>
                    <div v-if="profile.year_established" class="info-item">
                      <label>Year Established</label>
                      <p>{{ profile.year_established }}</p>
                    </div>
                  </template>

                  <!-- Student Specific -->
                  <template v-if="profile.user_role.value === 'law_student'">
                    <div v-if="profile.university_name" class="info-item">
                      <label>University</label>
                      <p>{{ profile.university_name }}</p>
                    </div>
                    <div v-if="profile.year_of_study" class="info-item">
                      <label>Year of Study</label>
                      <p>{{ profile.year_of_study }}</p>
                    </div>
                    <div v-if="profile.academic_role" class="info-item">
                      <label>Academic Role</label>
                      <p>{{ profile.academic_role }}</p>
                    </div>
                    <div v-if="profile.academic_qualification" class="info-item">
                      <label>Academic Qualification</label>
                      <p>{{ profile.academic_qualification }}</p>
                    </div>
                  </template>

                  <div v-if="profile.place_of_work" class="info-item">
                    <label>Place of Work</label>
                    <p>{{ profile.place_of_work }}</p>
                  </div>
                </div>

                <!-- Operating Regions -->
                <div v-if="profile.operating_regions && profile.operating_regions.length > 0" class="list-section">
                  <label>Operating Regions</label>
                  <div class="chip-list">
                    <VaChip
                      v-for="region in profile.operating_regions"
                      :key="region"
                      size="small"
                      color="primary"
                      outline
                    >
                      {{ region }}
                    </VaChip>
                  </div>
                </div>

                <!-- Operating Districts -->
                <div v-if="profile.operating_districts && profile.operating_districts.length > 0" class="list-section">
                  <label>Operating Districts</label>
                  <div class="chip-list">
                    <VaChip
                      v-for="district in profile.operating_districts"
                      :key="district"
                      size="small"
                      color="info"
                      outline
                    >
                      {{ district }}
                    </VaChip>
                  </div>
                </div>

                <!-- Specializations -->
                <div v-if="profile.specializations && profile.specializations.length > 0" class="list-section">
                  <label>Specializations</label>
                  <div class="chip-list">
                    <VaChip v-for="spec in profile.specializations" :key="spec" size="small" color="success" outline>
                      {{ spec }}
                    </VaChip>
                  </div>
                </div>

                <VaButton preset="secondary" icon="edit" class="edit-btn" @click="editProfessionalInfo">
                  Edit Professional Details
                </VaButton>
              </div>
            </div>

            <!-- Security Content -->
            <div v-if="activeTab === 'security'" class="tab-content-panel">
              <div class="tab-content">
                <h3 class="section-title">Security Settings</h3>

                <div class="security-section">
                  <div class="security-item">
                    <div class="security-info">
                      <VaIcon name="lock" size="large" color="primary" />
                      <div>
                        <h4>Password</h4>
                        <p>Last changed: {{ formatDate(profile.last_login) }}</p>
                      </div>
                    </div>
                    <VaButton preset="secondary" @click="changePassword"> Change Password </VaButton>
                  </div>

                  <div class="security-item">
                    <div class="security-info">
                      <VaIcon name="email" size="large" color="primary" />
                      <div>
                        <h4>Email Address</h4>
                        <p>{{ profile.email }}</p>
                      </div>
                    </div>
                    <VaButton preset="secondary" @click="changeEmail"> Change Email </VaButton>
                  </div>

                  <div class="security-item">
                    <div class="security-info">
                      <VaIcon name="security" size="large" color="primary" />
                      <div>
                        <h4>Two-Factor Authentication</h4>
                        <p>{{ is2FAEnabled ? 'Enabled' : 'Disabled' }}</p>
                      </div>
                    </div>
                    <VaButton :preset="is2FAEnabled ? 'secondary' : 'primary'" @click="toggle2FA">
                      {{ is2FAEnabled ? 'Disable' : 'Enable' }} 2FA
                    </VaButton>
                  </div>

                  <div class="security-item">
                    <div class="security-info">
                      <VaIcon name="history" size="large" color="info" />
                      <div>
                        <h4>Last Login</h4>
                        <p>{{ formatDateTime(profile.last_login) }}</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </VaCardContent>
      </VaCard>

      <!-- Account Actions -->
      <VaCard class="account-actions-card">
        <VaCardContent>
          <h3 class="section-title">Account Actions</h3>
          <div class="action-buttons">
            <VaButton preset="secondary" icon="download" @click="downloadData"> Download My Data </VaButton>
            <VaButton preset="secondary" icon="logout" @click="logout"> Logout </VaButton>
            <VaButton color="danger" preset="outline" icon="delete_forever" @click="deleteAccount">
              Delete Account
            </VaButton>
          </div>
        </VaCardContent>
      </VaCard>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { storeToRefs } from 'pinia'
import { useUserStore } from '../../stores/user-store'
import { useToast } from 'vuestic-ui'

const router = useRouter()
const userStore = useUserStore()
const { init: showToast } = useToast()

const { profile, isLoadingProfile, profileError } = storeToRefs(userStore)
const { is2FAEnabled } = storeToRefs(userStore)

const activeTab = ref('personal')

// Utility Functions
const getInitials = (firstName?: string, lastName?: string): string => {
  const first = firstName?.charAt(0) || ''
  const last = lastName?.charAt(0) || ''
  return `${first}${last}`.toUpperCase() || 'U'
}

const formatDate = (dateString?: string | null): string => {
  if (!dateString) return 'Not provided'

  try {
    const date = new Date(dateString)
    // Check if date is valid
    if (isNaN(date.getTime())) {
      return 'Invalid date'
    }

    return date.toLocaleDateString('en-GB', {
      year: 'numeric',
      month: 'short',
      day: '2-digit',
    })
  } catch (error) {
    console.error('Error formatting date:', error)
    return 'Invalid date'
  }
}

const formatDateTime = (dateString?: string | null): string => {
  if (!dateString) return 'Never'

  try {
    const date = new Date(dateString)
    // Check if date is valid
    if (isNaN(date.getTime())) {
      return 'Invalid date'
    }

    return date.toLocaleString('en-GB', {
      year: 'numeric',
      month: 'short',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      hour12: false,
    })
  } catch (error) {
    console.error('Error formatting datetime:', error)
    return 'Invalid date'
  }
}

const getGenderDisplay = (gender?: string | null): string => {
  if (!gender) return 'Not specified'
  const genderMap: Record<string, string> = {
    M: 'Male',
    F: 'Female',
    O: 'Other',
  }
  return genderMap[gender] || gender
}

const getProgressColor = (progress: number): string => {
  if (progress >= 100) return 'success'
  if (progress >= 75) return 'info'
  if (progress >= 50) return 'primary'
  if (progress >= 25) return 'warning'
  return 'danger'
}

// Action Handlers
const retryLoadProfile = async () => {
  try {
    await userStore.fetchUserProfile()
  } catch (error) {
    console.error('Failed to reload profile:', error)
  }
}

const changeProfilePicture = () => {
  showToast({
    message: 'Profile picture upload feature coming soon!',
    color: 'info',
  })
}

const goToVerification = () => {
  router.push('/user/verification')
}

const editPersonalInfo = () => {
  router.push('/user/profile/edit/personal')
}

const editContactInfo = () => {
  router.push('/user/profile/edit/contact')
}

const editProfessionalInfo = () => {
  router.push('/user/profile/edit/professional')
}

const changePassword = () => {
  router.push('/settings/change-password')
}

const changeEmail = () => {
  router.push('/settings/change-email')
}

const toggle2FA = () => {
  userStore.toggle2FA()
  showToast({
    message: `Two-Factor Authentication ${is2FAEnabled.value ? 'enabled' : 'disabled'}`,
    color: 'success',
  })
}

const downloadData = () => {
  showToast({
    message: 'Preparing your data for download...',
    color: 'info',
  })
  // TODO: Implement data download
}

const logout = () => {
  // TODO: Implement logout
  showToast({
    message: 'Logging out...',
    color: 'info',
  })
  router.push('/auth/login')
}

const deleteAccount = () => {
  showToast({
    message: 'Account deletion requires confirmation. Feature coming soon.',
    color: 'warning',
  })
}

// Lifecycle
onMounted(async () => {
  if (!profile.value) {
    await userStore.fetchUserProfile()
  }
})

// Set page title
document.title = 'My Profile - Pola'
</script>

<style scoped>
.user-profile-page {
  min-height: 100vh;
  background: #f8fafc;
  padding: 2rem;
}

.loading-container,
.error-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 400px;
  gap: 1rem;
}

.loading-text {
  font-size: 1.1rem;
  color: #64748b;
}

.error-content {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.error-content h3 {
  margin: 0;
}

.profile-content {
  max-width: 1200px;
  margin: 0 auto;
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

/* Profile Header */
.profile-header-card {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
}

.profile-header {
  display: flex;
  gap: 2rem;
  align-items: flex-start;
}

.profile-picture-section {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.75rem;
}

.profile-avatar {
  width: 120px !important;
  height: 120px !important;
  font-size: 2.5rem;
  background: rgba(255, 255, 255, 0.2);
  border: 4px solid white;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
}

.change-photo-btn {
  color: white !important;
  font-size: 0.875rem;
}

.profile-info {
  flex: 1;
}

.profile-name {
  font-size: 2rem;
  font-weight: 700;
  margin: 0 0 0.5rem 0;
  color: white;
}

.profile-email {
  font-size: 1.1rem;
  margin: 0 0 1rem 0;
  opacity: 0.9;
}

.profile-badges {
  display: flex;
  gap: 0.5rem;
  flex-wrap: wrap;
  margin-bottom: 1.5rem;
}

.verification-status-section {
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(10px);
  padding: 1rem;
  border-radius: 8px;
  margin-top: 1rem;
}

.status-header {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin-bottom: 0.75rem;
}

.status-label {
  font-weight: 600;
}

.status-value {
  font-weight: 700;
  margin-left: auto;
}

.status-progress {
  margin-bottom: 0.5rem;
}

.status-step {
  font-size: 0.875rem;
  margin: 0.5rem 0;
  opacity: 0.9;
}

/* Tabs */
.custom-tabs-navigation {
  display: flex;
  gap: 0.5rem;
  flex-wrap: wrap;
  margin-bottom: 2rem;
  padding-bottom: 1rem;
  border-bottom: 2px solid #e2e8f0;
}

.tab-button {
  flex: 1;
  min-width: 150px;
  justify-content: center;
  transition: all 0.2s ease;
}

.tab-button:hover {
  transform: translateY(-1px);
}

.tab-icon {
  margin-right: 0.5rem;
}

.tab-content-wrapper {
  min-height: 400px;
}

.tab-content-panel {
  animation: fadeIn 0.3s ease-in-out;
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.tab-content {
  padding: 1.5rem 0;
}

.section-title {
  font-size: 1.25rem;
  font-weight: 600;
  color: #1e293b;
  margin: 0 0 1.5rem 0;
  padding-bottom: 0.75rem;
  border-bottom: 2px solid #e2e8f0;
}

/* Info Grid */
.info-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
  gap: 1.5rem;
  margin-bottom: 2rem;
}

.info-item label {
  display: block;
  font-size: 0.875rem;
  font-weight: 600;
  color: #64748b;
  margin-bottom: 0.25rem;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.info-item p {
  font-size: 1rem;
  color: #1e293b;
  margin: 0;
  font-weight: 500;
}

.no-data {
  color: #94a3b8;
  font-style: italic;
}

/* List Sections */
.list-section {
  margin-bottom: 1.5rem;
}

.list-section label {
  display: block;
  font-size: 0.875rem;
  font-weight: 600;
  color: #64748b;
  margin-bottom: 0.75rem;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.chip-list {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
}

/* Security Section */
.security-section {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.security-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1.5rem;
  background: #f8fafc;
  border-radius: 8px;
  border: 1px solid #e2e8f0;
}

.security-info {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.security-info h4 {
  margin: 0 0 0.25rem 0;
  font-size: 1rem;
  font-weight: 600;
  color: #1e293b;
}

.security-info p {
  margin: 0;
  font-size: 0.875rem;
  color: #64748b;
}

/* Account Actions */
.action-buttons {
  display: flex;
  gap: 1rem;
  flex-wrap: wrap;
}

.edit-btn {
  margin-top: 1rem;
}

/* Responsive */
@media (max-width: 768px) {
  .user-profile-page {
    padding: 1rem;
  }

  .profile-header {
    flex-direction: column;
    align-items: center;
    text-align: center;
  }

  .profile-name {
    font-size: 1.5rem;
  }

  .info-grid {
    grid-template-columns: 1fr;
  }

  .security-item {
    flex-direction: column;
    gap: 1rem;
    align-items: flex-start;
  }

  .action-buttons {
    flex-direction: column;
  }

  .action-buttons button {
    width: 100%;
  }
}
</style>
