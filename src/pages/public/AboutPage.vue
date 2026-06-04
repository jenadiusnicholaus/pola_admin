<template>
  <div class="about-page">
    <div class="page-container">
      <div class="page-header">
        <h1 class="page-title">About Us</h1>
        <p class="page-subtitle">Learn more about Pola Admin and our mission</p>
      </div>

      <div class="about-content">
        <VaCard class="about-card">
          <VaCardContent>
            <h2 class="section-title">Our Mission</h2>
            <p class="about-text">
              Pola Admin is dedicated to making legal education and resources accessible to everyone in Tanzania. We
              believe that knowledge is power, and everyone should have access to quality legal information regardless
              of their background or location.
            </p>
            <p class="about-text">
              Our platform brings together legal professionals, students, and anyone interested in Tanzanian law to
              learn, share, and grow together in a supportive community environment.
            </p>
          </VaCardContent>
        </VaCard>

        <VaCard class="about-card">
          <VaCardContent>
            <h2 class="section-title">What We Offer</h2>
            <div class="offerings-grid">
              <div class="offering-item">
                <VaIcon name="school" size="2rem" color="primary" />
                <h3 class="offering-title">Legal Education</h3>
                <p class="offering-description">
                  Comprehensive study materials, past examination papers, and educational resources for law students.
                </p>
              </div>
              <div class="offering-item">
                <VaIcon name="support_agent" size="2rem" color="success" />
                <h3 class="offering-title">Expert Consultation</h3>
                <p class="offering-description">
                  Connect with experienced legal professionals for personalized advice and guidance on legal matters.
                </p>
              </div>
              <div class="offering-item">
                <VaIcon name="forum" size="2rem" color="info" />
                <h3 class="offering-title">Community Forums</h3>
                <p class="offering-description">
                  Engage in discussions, ask questions, and share knowledge with our vibrant legal community.
                </p>
              </div>
              <div class="offering-item">
                <VaIcon name="library_books" size="2rem" color="warning" />
                <h3 class="offering-title">Document Repository</h3>
                <p class="offering-description">
                  Access a vast library of legal documents, templates, and reference materials.
                </p>
              </div>
            </div>
          </VaCardContent>
        </VaCard>

        <VaCard class="about-card">
          <VaCardContent>
            <h2 class="section-title">Our Values</h2>
            <div class="values-list">
              <div class="value-item">
                <VaIcon name="verified" size="1.5rem" color="primary" />
                <div>
                  <h3 class="value-title">Accessibility</h3>
                  <p class="value-description">
                    Making legal education and resources accessible to everyone, everywhere.
                  </p>
                </div>
              </div>
              <div class="value-item">
                <VaIcon name="groups" size="1.5rem" color="success" />
                <div>
                  <h3 class="value-title">Community</h3>
                  <p class="value-description">Building a supportive community of legal professionals and learners.</p>
                </div>
              </div>
              <div class="value-item">
                <VaIcon name="lightbulb" size="1.5rem" color="info" />
                <div>
                  <h3 class="value-title">Innovation</h3>
                  <p class="value-description">
                    Leveraging technology to improve access to legal information and services.
                  </p>
                </div>
              </div>
              <div class="value-item">
                <VaIcon name="shield" size="1.5rem" color="warning" />
                <div>
                  <h3 class="value-title">Integrity</h3>
                  <p class="value-description">
                    Maintaining the highest standards of professionalism and ethical conduct.
                  </p>
                </div>
              </div>
            </div>
          </VaCardContent>
        </VaCard>

        <VaCard class="about-card">
          <VaCardContent>
            <h2 class="section-title">Contact Us</h2>
            <p class="about-text">Have questions or want to learn more? We'd love to hear from you!</p>
            <div class="contact-info">
              <div class="contact-item">
                <VaIcon name="email" size="1.5rem" color="primary" />
                <span>support@pola.co.tz</span>
              </div>
              <div class="contact-item">
                <VaIcon name="phone" size="1.5rem" color="primary" />
                <span>+255 XXX XXX XXX</span>
              </div>
              <div class="contact-item">
                <VaIcon name="location_on" size="1.5rem" color="primary" />
                <span>Dar es Salaam, Tanzania</span>
              </div>
            </div>
          </VaCardContent>
        </VaCard>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { onMounted } from 'vue'

onMounted(() => {
  window.scrollTo(0, 0)
})
</script>

<style lang="scss" scoped>
.about-page {
  padding: 3rem 2rem;
}

.page-container {
  max-width: 1200px;
  margin: 0 auto;
}

.page-header {
  text-align: center;
  margin-bottom: 3rem;
}

.page-title {
  font-size: 3rem;
  font-weight: 700;
  color: var(--va-text-primary);
  margin: 0 0 1rem;
}

.page-subtitle {
  font-size: 1.25rem;
  color: var(--va-text-secondary);
  margin: 0;
}

.about-content {
  display: flex;
  flex-direction: column;
  gap: 2rem;
}

.about-card {
  transition: box-shadow 0.3s;

  &:hover {
    box-shadow: 0 8px 24px rgba(0, 0, 0, 0.12);
  }
}

.section-title {
  font-size: 2rem;
  font-weight: 600;
  color: var(--va-text-primary);
  margin: 0 0 1.5rem;
}

.about-text {
  color: var(--va-text-secondary);
  line-height: 1.8;
  margin-bottom: 1rem;

  &:last-child {
    margin-bottom: 0;
  }
}

.offerings-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 2rem;
}

.offering-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  gap: 1rem;
  padding: 1.5rem;
  border: 1px solid var(--va-background-border);
  border-radius: 0.5rem;
  transition: all 0.3s;

  &:hover {
    border-color: var(--va-primary);
    transform: translateY(-0.25rem);
  }
}

.offering-title {
  font-size: 1.25rem;
  font-weight: 600;
  color: var(--va-text-primary);
  margin: 0;
}

.offering-description {
  color: var(--va-text-secondary);
  line-height: 1.6;
  margin: 0;
}

.values-list {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.value-item {
  display: flex;
  gap: 1rem;
  align-items: flex-start;
}

.value-title {
  font-size: 1.25rem;
  font-weight: 600;
  color: var(--va-text-primary);
  margin: 0 0 0.5rem;
}

.value-description {
  color: var(--va-text-secondary);
  line-height: 1.6;
  margin: 0;
}

.contact-info {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  margin-top: 1.5rem;
}

.contact-item {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  color: var(--va-text-secondary);
}

@media (max-width: 768px) {
  .page-title {
    font-size: 2rem;
  }

  .page-subtitle {
    font-size: 1rem;
  }

  .section-title {
    font-size: 1.5rem;
  }

  .offerings-grid {
    grid-template-columns: 1fr;
  }
}
</style>
