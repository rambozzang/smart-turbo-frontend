<script setup lang="ts">
import { useI18n } from 'vue-i18n'
import { useDarkMode } from '../composables/useDarkMode'
import PublicLayout from '../components/PublicLayout.vue'

const { t } = useI18n()
const { isDark } = useDarkMode()
</script>

<template>
  <PublicLayout :show-back-button="true">
    <div :class="{ 'dark-content': isDark }">
    <h1>{{ t('terms.title') }}</h1>

    <p class="last-updated">
      {{ t('terms.lastUpdated') }}: 2026-02-02
    </p>

    <section>
      <h2>{{ t('terms.acceptance.title') }}</h2>
      <p>{{ t('terms.acceptance.content') }}</p>
    </section>

    <section>
      <h2>{{ t('terms.serviceDescription.title') }}</h2>
      <p>{{ t('terms.serviceDescription.content') }}</p>
      <ul>
        <li>{{ t('terms.serviceDescription.item1') }}</li>
        <li>{{ t('terms.serviceDescription.item2') }}</li>
        <li>{{ t('terms.serviceDescription.item3') }}</li>
        <li>{{ t('terms.serviceDescription.item4') }}</li>
      </ul>
    </section>

    <section>
      <h2>{{ t('terms.userResponsibilities.title') }}</h2>
      <ul>
        <li>{{ t('terms.userResponsibilities.item1') }}</li>
        <li>{{ t('terms.userResponsibilities.item2') }}</li>
        <li>{{ t('terms.userResponsibilities.item3') }}</li>
        <li>{{ t('terms.userResponsibilities.item4') }}</li>
      </ul>
    </section>

    <section>
      <h2>{{ t('terms.limitations.title') }}</h2>
      <p>{{ t('terms.limitations.content') }}</p>
    </section>

    <section>
      <h2>{{ t('terms.termination.title') }}</h2>
      <p>{{ t('terms.termination.content') }}</p>
    </section>

    <section>
      <h2>{{ t('terms.changes.title') }}</h2>
      <p>{{ t('terms.changes.content') }}</p>
    </section>

    <section>
      <h2>{{ t('terms.contact.title') }}</h2>
      <p>
        {{ t('terms.contact.content') }}:
        <a href="mailto:legal@smart-turbo.com">legal@smart-turbo.com</a>
      </p>
    </section>
    </div>
  </PublicLayout>
</template>

<style scoped>
h1 {
  font-size: 32px;
  font-weight: 700;
  color: #1e293b;
  margin: 0 0 24px;
  padding-bottom: 16px;
  border-bottom: 3px solid #3b82f6;
}

.dark-content h1 {
  color: #f1f5f9;
}

.last-updated {
  font-size: 13px;
  color: #94a3b8;
  margin-bottom: 32px;
}

.dark-content .last-updated {
  color: #64748b;
}

section {
  margin-bottom: 40px;
}

section:last-child {
  margin-bottom: 0;
}

h2 {
  font-size: 22px;
  font-weight: 600;
  color: #334155;
  margin: 0 0 16px;
}

.dark-content h2 {
  color: #cbd5e1;
}

p {
  font-size: 16px;
  color: #475569;
  line-height: 1.75;
  margin: 0 0 16px;
}

.dark-content p {
  color: #94a3b8;
}

p:last-child {
  margin-bottom: 0;
}

ul {
  margin: 0;
  padding-left: 24px;
  list-style-type: disc;
}

li {
  font-size: 16px;
  color: #475569;
  line-height: 1.75;
  margin-bottom: 12px;
}

.dark-content li {
  color: #94a3b8;
}

li:last-child {
  margin-bottom: 0;
}

a {
  color: #3b82f6;
  text-decoration: none;
  font-weight: 500;
  transition: color 0.2s;
}

.dark-content a {
  color: #60a5fa;
}

a:hover {
  color: #2563eb;
  text-decoration: underline;
}

.dark-content a:hover {
  color: #93c5fd;
}

@media (max-width: 768px) {
  h1 {
    font-size: 24px;
  }

  h2 {
    font-size: 18px;
  }

  p, li {
    font-size: 15px;
  }
}
</style>
