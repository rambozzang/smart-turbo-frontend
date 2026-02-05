<script setup lang="ts">
import { ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { useDarkMode } from '../composables/useDarkMode'
import PublicLayout from '../components/PublicLayout.vue'

const { t } = useI18n()
const { isDark } = useDarkMode()

const form = ref({
  name: '',
  email: '',
  subject: '',
  message: ''
})

const submitted = ref(false)

function handleSubmit() {
  console.log('Support request:', form.value)
  submitted.value = true

  setTimeout(() => {
    submitted.value = false
    form.value = {
      name: '',
      email: '',
      subject: '',
      message: ''
    }
  }, 3000)
}
</script>

<template>
  <PublicLayout :show-back-button="true">
    <div :class="{ 'dark-content': isDark }">
    <h1>{{ t('support.title') }}</h1>

    <div class="grid">
      <!-- Contact Info -->
      <div class="info-section">
        <div class="info-group">
          <h2>{{ t('support.contactInfo.title') }}</h2>
          <div class="info-items">
            <div class="info-item">
              <svg class="info-icon" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                <path stroke-linecap="round" stroke-linejoin="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
              <div>
                <p class="info-label">{{ t('support.contactInfo.email') }}</p>
                <a href="mailto:support@smart-turbo.com">support@smart-turbo.com</a>
              </div>
            </div>

            <div class="info-item">
              <svg class="info-icon" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                <path stroke-linecap="round" stroke-linejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <div>
                <p class="info-label">{{ t('support.contactInfo.hours') }}</p>
                <p class="info-value">{{ t('support.contactInfo.hoursValue') }}</p>
              </div>
            </div>

            <div class="info-item">
              <svg class="info-icon" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                <path stroke-linecap="round" stroke-linejoin="round" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                <path stroke-linecap="round" stroke-linejoin="round" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              <div>
                <p class="info-label">{{ t('support.contactInfo.location') }}</p>
                <p class="info-value">{{ t('support.contactInfo.locationValue') }}</p>
              </div>
            </div>
          </div>
        </div>

        <div class="info-group">
          <h2>{{ t('support.faq.title') }}</h2>
          <div class="faq-links">
            <a href="#">{{ t('support.faq.item1') }}</a>
            <a href="#">{{ t('support.faq.item2') }}</a>
            <a href="#">{{ t('support.faq.item3') }}</a>
            <a href="#">{{ t('support.faq.item4') }}</a>
          </div>
        </div>
      </div>

      <!-- Contact Form -->
      <div class="form-section">
        <h2>{{ t('support.form.title') }}</h2>

        <!-- Success Message -->
        <div v-if="submitted" class="success-message">
          <p>{{ t('support.form.success') }}</p>
        </div>

        <form @submit.prevent="handleSubmit" class="contact-form">
          <div class="form-group">
            <label for="name">{{ t('support.form.name') }}</label>
            <input id="name" v-model="form.name" type="text" required />
          </div>

          <div class="form-group">
            <label for="email">{{ t('support.form.email') }}</label>
            <input id="email" v-model="form.email" type="email" required />
          </div>

          <div class="form-group">
            <label for="subject">{{ t('support.form.subject') }}</label>
            <input id="subject" v-model="form.subject" type="text" required />
          </div>

          <div class="form-group">
            <label for="message">{{ t('support.form.message') }}</label>
            <textarea id="message" v-model="form.message" rows="5" required></textarea>
          </div>

          <button type="submit" class="submit-button">
            {{ t('support.form.submit') }}
          </button>
        </form>
      </div>
    </div>
    </div>
  </PublicLayout>
</template>

<style scoped>
h1 {
  font-size: 32px;
  font-weight: 700;
  color: #1e293b;
  margin: 0 0 32px;
  padding-bottom: 16px;
  border-bottom: 3px solid #3b82f6;
}

.dark-content h1 {
  color: #f1f5f9;
}

.grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 48px;
}

.info-section,
.form-section {
  display: flex;
  flex-direction: column;
  gap: 32px;
}

h2 {
  font-size: 20px;
  font-weight: 600;
  color: #334155;
  margin: 0 0 16px;
}

.dark-content h2 {
  color: #cbd5e1;
}

.info-group {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.info-items {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.info-item {
  display: flex;
  gap: 12px;
  align-items: flex-start;
}

.info-icon {
  width: 20px;
  height: 20px;
  color: #3b82f6;
  flex-shrink: 0;
  margin-top: 2px;
}

.dark-content .info-icon {
  color: #60a5fa;
}

.info-label {
  font-size: 14px;
  font-weight: 500;
  color: #334155;
  margin: 0 0 4px;
}

.dark-content .info-label {
  color: #cbd5e1;
}

.info-value {
  font-size: 14px;
  color: #64748b;
  margin: 0;
}

.dark-content .info-value {
  color: #94a3b8;
}

.faq-links {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.faq-links a {
  font-size: 14px;
  color: #3b82f6;
  text-decoration: none;
  transition: color 0.2s;
}

.dark-content .faq-links a {
  color: #60a5fa;
}

.faq-links a:hover {
  color: #2563eb;
  text-decoration: underline;
}

.dark-content .faq-links a:hover {
  color: #93c5fd;
}

.success-message {
  padding: 16px;
  background: #dcfce7;
  border: 1px solid #86efac;
  border-radius: 8px;
  margin-bottom: 16px;
}

.dark-content .success-message {
  background: #064e3b;
  border-color: #065f46;
}

.success-message p {
  font-size: 14px;
  color: #166534;
  margin: 0;
}

.dark-content .success-message p {
  color: #86efac;
}

.contact-form {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

label {
  font-size: 14px;
  font-weight: 500;
  color: #334155;
}

.dark-content label {
  color: #cbd5e1;
}

input,
textarea {
  padding: 12px 16px;
  font-size: 15px;
  color: #1e293b;
  background: white;
  border: 1px solid #cbd5e1;
  border-radius: 8px;
  transition: all 0.2s;
  font-family: inherit;
}

.dark-content input,
.dark-content textarea {
  color: #f1f5f9;
  background: #0f172a;
  border-color: #334155;
}

input:focus,
textarea:focus {
  outline: none;
  border-color: #3b82f6;
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
}

.dark-content input:focus,
.dark-content textarea:focus {
  border-color: #60a5fa;
  box-shadow: 0 0 0 3px rgba(96, 165, 250, 0.2);
}

textarea {
  resize: vertical;
  min-height: 120px;
}

.submit-button {
  padding: 12px 24px;
  background: #3b82f6;
  color: white;
  font-size: 15px;
  font-weight: 600;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s;
}

.submit-button:hover {
  background: #2563eb;
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(59, 130, 246, 0.3);
}

@media (max-width: 768px) {
  h1 {
    font-size: 24px;
  }

  .grid {
    grid-template-columns: 1fr;
    gap: 32px;
  }

  h2 {
    font-size: 18px;
  }
}
</style>
