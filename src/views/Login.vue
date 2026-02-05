<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'
import { useDarkMode } from '../composables/useDarkMode'
import { useAuthStore } from '../stores/auth'
import LanguageSwitcher from '../components/LanguageSwitcher.vue'
import SmartTurboLogo from '../components/SmartTurboLogo.vue'

const router = useRouter()
const { t } = useI18n()
const { isDark, toggleDarkMode } = useDarkMode()
const authStore = useAuthStore()

const username = ref('')
const password = ref('')
const showPassword = ref(false)
const rememberMe = ref(false)
const error = ref('')
const isLoading = ref(false)

onMounted(() => {
  // Auto-redirect if already logged in
  if (authStore.isAuthenticated) {
    router.push('/')
  }
})

async function handleLogin() {
  if (!username.value || !password.value) {
    return
  }

  error.value = ''
  isLoading.value = true

  try {
    await authStore.login(username.value, password.value)

    if (rememberMe.value) {
      localStorage.setItem('remember_me', 'true')
    }

    router.push('/')
  } catch (err: any) {
    error.value = err.response?.data?.error || t('login.error.invalidCredentials')
  } finally {
    isLoading.value = false
  }
}

function handleKeydown(e: KeyboardEvent) {
  if (e.key === 'Enter') {
    handleLogin()
  }
}
</script>

<template>
  <div class="login-page">
    <!-- Top Right Controls -->
    <div class="absolute top-6 right-6 z-10 flex items-center gap-3">
      <button
        @click="toggleDarkMode"
        class="p-2 bg-white/10 hover:bg-white/20 border border-white/20 transition-all"
        :title="isDark ? 'Light Mode' : 'Dark Mode'"
      >
        <svg v-if="isDark" class="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
          <path stroke-linecap="round" stroke-linejoin="round" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
        </svg>
        <svg v-else class="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
          <path stroke-linecap="round" stroke-linejoin="round" d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
        </svg>
      </button>
      <LanguageSwitcher />
    </div>

    <!-- Background Pattern -->
    <div class="login-bg">
      <div class="bg-gradient"></div>
      <div class="bg-pattern"></div>
      <div class="bg-glow"></div>
    </div>

    <!-- Login Container -->
    <div class="login-container">
      <!-- Left Panel - Branding -->
      <div class="login-branding">
        <div class="branding-content">
          <div class="logo-section">
            <div class="logo-icon">
              <SmartTurboLogo :size="64" :animated="true" />
            </div>
            <h1 class="logo-text">{{ t('login.branding.title') }}</h1>
          </div>

          <div class="tagline">
            <h2>{{ t('login.branding.tagline') }}</h2>
            <p>{{ t('login.branding.description') }}</p>
          </div>

          <div class="features">
            <div class="feature-item">
              <span class="feature-icon">✓</span>
              <span>{{ t('login.features.distributed') }}</span>
            </div>
            <div class="feature-item">
              <span class="feature-icon">✓</span>
              <span>{{ t('login.features.realtime') }}</span>
            </div>
            <div class="feature-item">
              <span class="feature-icon">✓</span>
              <span>{{ t('login.features.analytics') }}</span>
            </div>
            <div class="feature-item">
              <span class="feature-icon">✓</span>
              <span>{{ t('login.features.cicd') }}</span>
            </div>
          </div>

          <div class="trust-badges">
            <span class="badge">K6</span>
            <span class="badge">Cloud</span>
            <span class="badge">Enterprise</span>
          </div>
        </div>
      </div>

      <!-- Right Panel - Login Form -->
      <div class="login-form-panel">
        <div class="login-form-wrapper">
          <div class="form-header">
            <h2>{{ t('login.form.welcome') }}</h2>
            <p>{{ t('login.form.subtitle') }}</p>
          </div>

          <form @submit.prevent="handleLogin" class="login-form" @keydown="handleKeydown">
            <!-- Error Message -->
            <div v-if="error" class="error-message">
              <span class="error-icon">!</span>
              {{ error }}
            </div>

            <!-- Username Field -->
            <div class="form-group">
              <label for="username">{{ t('login.form.username') }}</label>
              <div class="input-wrapper">
                <span class="input-icon">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
                    <circle cx="12" cy="7" r="4"/>
                  </svg>
                </span>
                <input
                  id="username"
                  v-model="username"
                  type="text"
                  :placeholder="t('login.form.usernamePlaceholder')"
                  autocomplete="username"
                  :disabled="isLoading"
                />
              </div>
            </div>

            <!-- Password Field -->
            <div class="form-group">
              <label for="password">{{ t('login.form.password') }}</label>
              <div class="input-wrapper">
                <span class="input-icon">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
                    <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
                  </svg>
                </span>
                <input
                  id="password"
                  v-model="password"
                  :type="showPassword ? 'text' : 'password'"
                  :placeholder="t('login.form.passwordPlaceholder')"
                  autocomplete="current-password"
                  :disabled="isLoading"
                />
                <button
                  type="button"
                  class="password-toggle"
                  @click="showPassword = !showPassword"
                  tabindex="-1"
                  :aria-label="showPassword ? t('login.form.hidePassword') : t('login.form.showPassword')"
                >
                  <svg v-if="!showPassword" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
                    <circle cx="12" cy="12" r="3"/>
                  </svg>
                  <svg v-else width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/>
                    <line x1="1" y1="1" x2="23" y2="23"/>
                  </svg>
                </button>
              </div>
            </div>

            <!-- Remember Me & Forgot Password -->
            <div class="form-options">
              <label class="remember-me">
                <input type="checkbox" v-model="rememberMe" />
                <span>{{ t('login.form.rememberMe') }}</span>
              </label>
            </div>

            <!-- Submit Button -->
            <button
              type="submit"
              class="login-button"
              :disabled="isLoading || !username || !password"
            >
              <span v-if="isLoading" class="spinner"></span>
              <span v-else>{{ t('login.form.signIn') }}</span>
            </button>
          </form>

          <!-- Demo Credentials Hint -->
          <div class="demo-hint">
            <span class="hint-icon">i</span>
            <span>{{ t('login.demo.hint') }}: <strong>admin</strong> / <strong>admin123</strong> or <strong>demo</strong> / <strong>demo123</strong></span>
          </div>

          <!-- Footer -->
          <div class="form-footer">
            <p>&copy; 2026 Smart Turbo. {{ t('login.footer.rights') }}</p>
            <div class="footer-links">
              <RouterLink to="/privacy">{{ t('login.footer.privacy') }}</RouterLink>
              <RouterLink to="/terms">{{ t('login.footer.terms') }}</RouterLink>
              <RouterLink to="/support">{{ t('login.footer.support') }}</RouterLink>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.login-page {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
  overflow: hidden;
  background: #0f172a;
}

/* Background Effects */
.login-bg {
  position: absolute;
  inset: 0;
  z-index: 0;
}

.bg-gradient {
  position: absolute;
  inset: 0;
  background: linear-gradient(135deg,
    rgba(59, 130, 246, 0.1) 0%,
    rgba(139, 92, 246, 0.05) 50%,
    rgba(6, 182, 212, 0.1) 100%
  );
}

.bg-pattern {
  position: absolute;
  inset: 0;
  background-image:
    radial-gradient(circle at 25% 25%, rgba(59, 130, 246, 0.1) 0%, transparent 50%),
    radial-gradient(circle at 75% 75%, rgba(139, 92, 246, 0.1) 0%, transparent 50%);
}

.bg-glow {
  position: absolute;
  top: -50%;
  left: -50%;
  width: 200%;
  height: 200%;
  background: radial-gradient(circle at 30% 30%, rgba(59, 130, 246, 0.15) 0%, transparent 40%);
  animation: glow-rotate 30s linear infinite;
}

@keyframes glow-rotate {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}

/* Login Container */
.login-container {
  position: relative;
  z-index: 1;
  display: flex;
  width: 100%;
  max-width: 1100px;
  min-height: 700px;
  margin: 20px;
  background: #1e293b;
  border: 1px solid #334155;
  border-radius: 24px;
  box-shadow:
    0 25px 50px -12px rgba(0, 0, 0, 0.25),
    0 0 0 1px rgba(255, 255, 255, 0.05);
  overflow: hidden;
}

/* Left Panel - Branding */
.login-branding {
  flex: 1;
  background: linear-gradient(135deg, #3b82f6 0%, #8b5cf6 50%, #a855f7 100%);
  padding: 60px;
  display: flex;
  flex-direction: column;
  justify-content: center;
  position: relative;
  overflow: hidden;
}

.login-branding::before {
  content: '';
  position: absolute;
  inset: 0;
  background: url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.05'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E");
}

.branding-content {
  position: relative;
  z-index: 1;
  color: white;
}

.logo-section {
  display: flex;
  align-items: center;
  gap: 16px;
  margin-bottom: 48px;
}

.logo-icon {
  filter: drop-shadow(0 8px 12px rgba(0, 0, 0, 0.3));
  transition: transform 0.3s ease;
}

.logo-section:hover .logo-icon {
  transform: scale(1.05);
}

.logo-text {
  font-size: 28px;
  font-weight: 700;
  letter-spacing: -0.5px;
}

.tagline h2 {
  font-size: 32px;
  font-weight: 700;
  line-height: 1.2;
  margin: 0 0 16px;
}

.tagline p {
  font-size: 16px;
  opacity: 0.9;
  line-height: 1.6;
  margin: 0 0 40px;
}

.features {
  display: flex;
  flex-direction: column;
  gap: 16px;
  margin-bottom: 48px;
}

.feature-item {
  display: flex;
  align-items: center;
  gap: 12px;
  font-size: 15px;
  font-weight: 500;
}

.feature-icon {
  width: 24px;
  height: 24px;
  background: rgba(255, 255, 255, 0.2);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 12px;
}

.trust-badges {
  display: flex;
  gap: 12px;
}

.trust-badges .badge {
  padding: 6px 14px;
  background: rgba(255, 255, 255, 0.15);
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 20px;
  font-size: 12px;
  font-weight: 600;
  letter-spacing: 0.5px;
}

/* Right Panel - Form */
.login-form-panel {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 60px;
  background: #0f172a;
}

.login-form-wrapper {
  width: 100%;
  max-width: 400px;
}

.form-header {
  text-align: center;
  margin-bottom: 32px;
}

.form-header h2 {
  font-size: 28px;
  font-weight: 700;
  color: #f1f5f9;
  margin: 0 0 8px;
}

.form-header p {
  font-size: 15px;
  color: #94a3b8;
  margin: 0;
}

.login-form {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.error-message {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 12px 16px;
  background: rgba(239, 68, 68, 0.1);
  border: 1px solid rgba(239, 68, 68, 0.3);
  border-radius: 10px;
  color: #ef4444;
  font-size: 14px;
}

.error-icon {
  width: 20px;
  height: 20px;
  background: #ef4444;
  color: white;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 12px;
  font-weight: 700;
  flex-shrink: 0;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.form-group label {
  font-size: 14px;
  font-weight: 500;
  color: #cbd5e1;
}

.input-wrapper {
  position: relative;
  display: flex;
  align-items: center;
}

.input-icon {
  position: absolute;
  left: 14px;
  color: #64748b;
  pointer-events: none;
  display: flex;
  align-items: center;
}

.input-wrapper input {
  width: 100%;
  padding: 14px 14px 14px 48px;
  font-size: 15px;
  color: #f1f5f9;
  background: #1e293b;
  border: 1px solid #334155;
  border-radius: 10px;
  transition: all 0.2s ease;
}

.input-wrapper input:focus {
  outline: none;
  border-color: #3b82f6;
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
}

.input-wrapper input::placeholder {
  color: #64748b;
}

.input-wrapper input:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.password-toggle {
  position: absolute;
  right: 14px;
  background: none;
  border: none;
  color: #64748b;
  cursor: pointer;
  padding: 4px;
  display: flex;
  align-items: center;
  transition: color 0.2s;
}

.password-toggle:hover {
  color: #cbd5e1;
}

.form-options {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.remember-me {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 14px;
  color: #cbd5e1;
  cursor: pointer;
}

.remember-me input {
  width: 16px;
  height: 16px;
  accent-color: #3b82f6;
}

.login-button {
  width: 100%;
  padding: 14px;
  font-size: 16px;
  font-weight: 600;
  color: white;
  background: linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%);
  border: none;
  border-radius: 10px;
  cursor: pointer;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
}

.login-button:hover:not(:disabled) {
  transform: translateY(-1px);
  box-shadow: 0 8px 20px rgba(59, 130, 246, 0.4);
}

.login-button:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.spinner {
  width: 20px;
  height: 20px;
  border: 2px solid rgba(255, 255, 255, 0.3);
  border-top-color: white;
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

.demo-hint {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 12px;
  margin-top: 24px;
  background: rgba(59, 130, 246, 0.1);
  border: 1px solid rgba(59, 130, 246, 0.2);
  border-radius: 10px;
  font-size: 13px;
  color: #60a5fa;
}

.hint-icon {
  width: 18px;
  height: 18px;
  background: #3b82f6;
  color: white;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 11px;
  font-weight: 700;
}

.form-footer {
  margin-top: 32px;
  text-align: center;
}

.form-footer p {
  font-size: 12px;
  color: #64748b;
  margin: 0 0 8px;
}

.footer-links {
  display: flex;
  justify-content: center;
  gap: 16px;
}

.footer-links a {
  font-size: 12px;
  color: #64748b;
  text-decoration: none;
  transition: color 0.2s;
}

.footer-links a:hover {
  color: #3b82f6;
}

/* Dark mode compatibility */
.dark .login-page {
  background: #0f172a;
}

.dark .login-container {
  background: #1e293b;
  border-color: #334155;
}

.dark .login-form-panel {
  background: #0f172a;
}

.dark .input-wrapper input {
  background: #1e293b;
  border-color: #334155;
  color: #f1f5f9;
}

/* Responsive */
@media (max-width: 900px) {
  .login-container {
    flex-direction: column;
    max-width: 500px;
    min-height: auto;
  }

  .login-branding {
    padding: 40px;
  }

  .tagline h2 {
    font-size: 24px;
  }

  .features {
    display: none;
  }

  .login-form-panel {
    padding: 40px;
  }
}

@media (max-width: 480px) {
  .login-container {
    margin: 0;
    border-radius: 0;
    min-height: 100vh;
  }

  .login-branding {
    padding: 30px;
  }

  .login-form-panel {
    padding: 30px;
  }
}
</style>
