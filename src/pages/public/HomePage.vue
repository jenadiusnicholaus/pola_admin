<template>
  <div class="home-page">
    <!-- Hero Section -->
    <section class="hero-section">
      <div class="hero-background">
        <img
          src="https://images.unsplash.com/photo-1589829545856-d10d557cf95f?ixlib=rb-4.0.3&auto=format&fit=crop&w=2070&q=80"
          alt="Legal Professional"
          class="hero-image"
        />
        <div class="hero-overlay"></div>
      </div>
      <div class="hero-container">
        <div class="hero-content">
          <div class="hero-badge">
            <VaIcon name="verified" size="1rem" />
            <span>Tanzania's Leading Legal Platform</span>
          </div>
          <h1 class="hero-title">
            Your Trusted Partner for
            <span class="highlight">Legal Excellence</span>
          </h1>
          <p class="hero-subtitle">
            Access comprehensive legal education, expert consultations, and a vast repository of legal resources.
            Empowering students, professionals, and anyone seeking legal knowledge in Tanzania.
          </p>
          <div class="hero-actions">
            <a href="https://apps.apple.com" target="_blank" class="store-button">
              <img
                src="https://developer.apple.com/assets/elements/badges/download-on-the-app-store.svg"
                alt="Download on the App Store"
                class="store-badge"
              />
            </a>
            <a href="https://play.google.com/store" target="_blank" class="store-button">
              <img
                src="https://upload.wikimedia.org/wikipedia/commons/7/78/Google_Play_Store_badge_EN.svg"
                alt="Get it on Google Play"
                class="store-badge"
              />
            </a>
          </div>
          <div class="hero-stats">
            <div class="stat-item">
              <div class="stat-number">1000+</div>
              <div class="stat-label">Active Users</div>
            </div>
            <div class="stat-divider"></div>
            <div class="stat-item">
              <div class="stat-number">500+</div>
              <div class="stat-label">Legal Documents</div>
            </div>
            <div class="stat-divider"></div>
            <div class="stat-item">
              <div class="stat-number">50+</div>
              <div class="stat-label">Expert Consultants</div>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- Features Section -->
    <section class="features-section">
      <div class="section-container">
        <h2 class="section-title">Our Services</h2>
        <p class="section-subtitle">Comprehensive legal solutions for everyone</p>

        <div class="features-grid">
          <VaCard class="feature-card">
            <VaCardContent>
              <div class="feature-icon">
                <VaIcon name="school" size="3rem" color="primary" />
              </div>
              <h3 class="feature-title">Legal Education</h3>
              <p class="feature-description">
                Access comprehensive legal education resources, study materials, and past examination papers.
              </p>
            </VaCardContent>
          </VaCard>

          <VaCard class="feature-card">
            <VaCardContent>
              <div class="feature-icon">
                <VaIcon name="support_agent" size="3rem" color="success" />
              </div>
              <h3 class="feature-title">Expert Consultation</h3>
              <p class="feature-description">
                Connect with experienced legal professionals for personalized advice and guidance.
              </p>
            </VaCardContent>
          </VaCard>

          <VaCard class="feature-card">
            <VaCardContent>
              <div class="feature-icon">
                <VaIcon name="forum" size="3rem" color="info" />
              </div>
              <h3 class="feature-title">Community Forums</h3>
              <p class="feature-description">
                Join discussions, ask questions, and share knowledge with our legal community.
              </p>
            </VaCardContent>
          </VaCard>

          <VaCard class="feature-card">
            <VaCardContent>
              <div class="feature-icon">
                <VaIcon name="library_books" size="3rem" color="warning" />
              </div>
              <h3 class="feature-title">Document Repository</h3>
              <p class="feature-description">
                Access a vast library of legal documents, templates, and reference materials.
              </p>
            </VaCardContent>
          </VaCard>
        </div>
      </div>
    </section>

    <!-- About Section -->
    <section class="about-section">
      <div class="section-container">
        <div class="about-content">
          <div class="about-text">
            <h2 class="section-title">About Pola Admin</h2>
            <p class="about-description">
              Pola Admin is dedicated to making legal education and resources accessible to everyone in Tanzania. We
              believe that knowledge is power, and everyone should have access to quality legal information.
            </p>
            <p class="about-description">
              Our platform brings together legal professionals, students, and anyone interested in Tanzanian law to
              learn, share, and grow together.
            </p>
            <VaButton to="/about" preset="secondary">Learn More About Us</VaButton>
          </div>
          <div class="about-visual">
            <VaCard class="stats-card">
              <VaCardContent>
                <div class="stat-item">
                  <div class="stat-number">1000+</div>
                  <div class="stat-label">Active Users</div>
                </div>
                <div class="stat-item">
                  <div class="stat-number">500+</div>
                  <div class="stat-label">Legal Documents</div>
                </div>
                <div class="stat-item">
                  <div class="stat-number">50+</div>
                  <div class="stat-label">Expert Consultants</div>
                </div>
              </VaCardContent>
            </VaCard>
          </div>
        </div>
      </div>
    </section>

    <!-- CTA Section -->
    <section class="cta-section">
      <div class="section-container">
        <div class="cta-content">
          <h2 class="cta-title">Ready to Get Started?</h2>
          <p class="cta-subtitle">Join thousands of users who trust Pola Admin for their legal education needs</p>
          <div class="cta-actions">
            <a href="https://apps.apple.com" target="_blank" class="store-button">
              <img
                src="https://developer.apple.com/assets/elements/badges/download-on-the-app-store.svg"
                alt="Download on the App Store"
                class="store-badge cta-badge"
              />
            </a>
            <a href="https://play.google.com/store" target="_blank" class="store-button">
              <img
                src="https://upload.wikimedia.org/wikipedia/commons/7/78/Google_Play_Store_badge_EN.svg"
                alt="Get it on Google Play"
                class="store-badge cta-badge"
              />
            </a>
          </div>
        </div>
      </div>
    </section>
  </div>
</template>

<script setup lang="ts">
import { onMounted } from 'vue'

onMounted(() => {
  window.scrollTo(0, 0)
})
</script>

<style lang="scss" scoped>
.home-page {
  width: 100%;
}

.hero-section {
  position: relative;
  height: 100vh;
  min-height: 100vh;
  display: flex;
  align-items: center;
  overflow: hidden;
}

.hero-background {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  z-index: 0;
}

.hero-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.hero-overlay {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: linear-gradient(135deg, rgba(0, 0, 0, 0.8) 0%, rgba(0, 0, 0, 0.6) 100%);
  z-index: 1;
}

.hero-container {
  position: relative;
  z-index: 2;
  max-width: 1400px;
  margin: 0 auto;
  padding: 2rem;
  width: 100%;
}

.hero-content {
  display: flex;
  flex-direction: column;
  gap: 2rem;
  color: white;
  max-width: 900px;
  animation: fadeInUp 1s ease-out;
}

.hero-badge {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  background: rgba(255, 255, 255, 0.15);
  backdrop-filter: blur(10px);
  padding: 0.5rem 1rem;
  border-radius: 2rem;
  border: 1px solid rgba(255, 255, 255, 0.3);
  font-size: 0.875rem;
  font-weight: 600;
  color: white;
  width: fit-content;
  animation: fadeInDown 1s ease-out;
}

.hero-title {
  font-size: 4.5rem;
  font-weight: 800;
  margin: 0;
  line-height: 1.1;
  color: white;
  animation: fadeInUp 1s ease-out 0.2s backwards;

  .highlight {
    background: linear-gradient(135deg, #ffd700 0%, #ffed4e 100%);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
  }
}

.hero-subtitle {
  font-size: 1.25rem;
  opacity: 0.9;
  margin: 0;
  line-height: 1.8;
  color: white;
  animation: fadeInUp 1s ease-out 0.4s backwards;
}

.hero-actions {
  display: flex;
  gap: 1rem;
  flex-wrap: wrap;
  animation: fadeInUp 1s ease-out 0.6s backwards;
}

.store-button {
  display: inline-block;
  transition: all 0.3s ease;

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 8px 24px rgba(0, 0, 0, 0.3);
  }
}

.store-badge {
  height: 3rem;
  width: auto;
  display: block;
}

.cta-badge {
  height: 3.5rem;
}

.cta-button {
  padding: 0.875rem 2rem;
  font-weight: 600;
  letter-spacing: 0.5px;
  transition: all 0.3s ease;

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 8px 24px rgba(0, 0, 0, 0.3);
  }
}

.hero-stats {
  display: flex;
  align-items: center;
  gap: 2rem;
  padding-top: 2rem;
  border-top: 1px solid rgba(255, 255, 255, 0.2);
  animation: fadeInUp 1s ease-out 0.8s backwards;
}

.stat-item {
  text-align: center;
}

.stat-number {
  font-size: 2rem;
  font-weight: 700;
  color: white;
  line-height: 1;
  margin-bottom: 0.25rem;
}

.stat-label {
  font-size: 0.875rem;
  color: rgba(255, 255, 255, 0.8);
  font-weight: 500;
}

.stat-divider {
  width: 1px;
  height: 3rem;
  background: rgba(255, 255, 255, 0.3);
}

@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translateY(30px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@keyframes fadeInDown {
  from {
    opacity: 0;
    transform: translateY(-30px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.features-section,
.about-section {
  padding: 5rem 2rem;
}

.section-container {
  max-width: 1400px;
  margin: 0 auto;
}

.section-title {
  font-size: 2.5rem;
  font-weight: 700;
  color: var(--va-text-primary);
  text-align: center;
  margin: 0 0 1rem;
}

.section-subtitle {
  font-size: 1.25rem;
  color: var(--va-text-secondary);
  text-align: center;
  margin: 0 0 3rem;
}

.features-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 2rem;
}

.feature-card {
  transition:
    transform 0.3s,
    box-shadow 0.3s;

  &:hover {
    transform: translateY(-0.5rem);
    box-shadow: 0 8px 24px rgba(0, 0, 0, 0.12);
  }
}

.feature-icon {
  display: flex;
  justify-content: center;
  margin-bottom: 1.5rem;
}

.feature-title {
  font-size: 1.5rem;
  font-weight: 600;
  color: var(--va-text-primary);
  text-align: center;
  margin: 0 0 1rem;
}

.feature-description {
  color: var(--va-text-secondary);
  text-align: center;
  line-height: 1.6;
  margin: 0;
}

.about-content {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 4rem;
  align-items: center;
}

.about-text {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.about-description {
  color: var(--va-text-secondary);
  line-height: 1.8;
  margin: 0;
}

.about-visual {
  display: flex;
  justify-content: center;
}

.stats-card {
  width: 100%;
  max-width: 400px;
}

.stat-item {
  text-align: center;
  padding: 1.5rem;

  &:not(:last-child) {
    border-bottom: 1px solid var(--va-background-border);
  }
}

.stat-number {
  font-size: 2.5rem;
  font-weight: 700;
  color: var(--va-primary);
  margin-bottom: 0.5rem;
}

.stat-label {
  color: var(--va-text-secondary);
  font-size: 1.1rem;
}

.cta-section {
  background: linear-gradient(135deg, var(--va-background-primary) 0%, var(--va-background-element) 100%);
  padding: 5rem 2rem;
  text-align: center;
}

.cta-content {
  max-width: 800px;
  margin: 0 auto;
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.cta-title {
  font-size: 2.5rem;
  font-weight: 700;
  color: var(--va-text-primary);
  margin: 0;
}

.cta-subtitle {
  font-size: 1.25rem;
  color: var(--va-text-secondary);
  margin: 0;
}

.cta-actions {
  display: flex;
  gap: 1rem;
  justify-content: center;
  flex-wrap: wrap;
}

@media (max-width: 768px) {
  .about-content {
    grid-template-columns: 1fr;
    gap: 2rem;
  }

  .hero-title,
  .section-title,
  .cta-title {
    font-size: 2rem;
  }

  .hero-subtitle,
  .section-subtitle,
  .cta-subtitle {
    font-size: 1rem;
  }

  .hero-section {
    height: auto;
    min-height: 100vh;
    padding: 6rem 2rem;
  }

  .hero-title {
    font-size: 2.5rem;

    .highlight {
      display: inline;
    }
  }

  .hero-subtitle {
    font-size: 1.125rem;
  }

  .hero-stats {
    flex-direction: column;
    gap: 1.5rem;
  }

  .stat-divider {
    width: 3rem;
    height: 1px;
  }

  .hero-actions {
    flex-direction: column;
    width: 100%;
  }

  .cta-button {
    width: 100%;
    justify-content: center;
  }

  .features-section,
  .about-section,
  .cta-section {
    padding: 3rem 2rem;
  }
}
</style>
