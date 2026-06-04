<template>
  <footer class="public-footer">
    <div class="footer-container">
      <div class="footer-section">
        <div class="footer-brand">
          <VaIcon name="gavel" size="2rem" color="primary" />
          <span class="brand-text">POLA</span>
        </div>
        <p class="footer-description">
          Your trusted platform for legal education, consultation, and resources in Tanzania.
        </p>
      </div>

      <div class="footer-section">
        <h3 class="footer-heading">Quick Links</h3>
        <ul class="footer-links">
          <li><RouterLink to="/">Home</RouterLink></li>
          <li><RouterLink to="/about">About Us</RouterLink></li>
          <li><RouterLink to="/privacy">Privacy Policy</RouterLink></li>
          <li><RouterLink to="/terms">Terms & Policy</RouterLink></li>
          <li><RouterLink to="/refund">Refund Policy</RouterLink></li>
        </ul>
      </div>

      <div class="footer-section">
        <h3 class="footer-heading">Legal</h3>
        <ul class="footer-links">
          <li><RouterLink to="/privacy">Privacy Policy</RouterLink></li>
          <li><RouterLink to="/terms">Terms of Service</RouterLink></li>
          <li><RouterLink to="/refund">Refund Policy</RouterLink></li>
        </ul>
      </div>

      <div class="footer-section">
        <h3 class="footer-heading">Contact</h3>
        <ul class="footer-links">
          <li><VaIcon name="email" size="small" /> support@pola.co.tz</li>
          <li><VaIcon name="phone" size="small" /> +255 XXX XXX XXX</li>
          <li><VaIcon name="location_on" size="small" /> Dar es Salaam, Tanzania</li>
        </ul>
      </div>
    </div>

    <div class="footer-bottom">
      <p>&copy; {{ currentYear }} POLA. All rights reserved.</p>
    </div>
  </footer>
</template>

<script setup lang="ts">
import { computed } from 'vue'

const currentYear = computed(() => new Date().getFullYear())
</script>

<style lang="scss" scoped>
.public-footer {
  background: var(--va-background-element);
  border-top: 1px solid var(--va-background-border);
  margin-top: auto;
}

.footer-container {
  max-width: 1400px;
  margin: 0 auto;
  padding: 3rem 2rem;
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 2rem;
}

.footer-section {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.footer-brand {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  font-weight: 700;
  font-size: 1.5rem;
  color: var(--va-text-primary);

  .brand-text {
    color: var(--va-primary);
  }
}

.footer-description {
  color: var(--va-text-secondary);
  line-height: 1.6;
}

.footer-heading {
  color: var(--va-text-primary);
  font-weight: 600;
  font-size: 1.1rem;
  margin: 0;
}

.footer-links {
  list-style: none;
  padding: 0;
  margin: 0;
  display: flex;
  flex-direction: column;
  gap: 0.75rem;

  li {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    color: var(--va-text-secondary);

    a {
      color: var(--va-text-secondary);
      text-decoration: none;
      transition: color 0.2s;

      &:hover {
        color: var(--va-primary);
      }
    }
  }
}

.footer-bottom {
  border-top: 1px solid var(--va-background-border);
  padding: 1.5rem 2rem;
  text-align: center;
  color: var(--va-text-secondary);
  font-size: 0.9rem;
}

@media (max-width: 768px) {
  .footer-container {
    grid-template-columns: 1fr;
  }
}
</style>
