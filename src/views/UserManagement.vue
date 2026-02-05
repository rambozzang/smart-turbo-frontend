<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useI18n } from 'vue-i18n'
import { useAuthStore } from '../stores/auth'
import { userApi, type CreateUserRequest, type UpdateUserRequest, type User } from '../api/users'

const { t } = useI18n()
const authStore = useAuthStore()

const users = ref<User[]>([])
const stats = ref({ totalUsers: 0, activeUsers: 0, usersByRole: {} as Record<string, number> })
const isLoading = ref(false)
const currentPage = ref(0)
const totalPages = ref(0)

const showModal = ref(false)
const showDeleteModal = ref(false)
const modalMode = ref<'create' | 'edit'>('create')
const selectedUser = ref<User | null>(null)

const form = ref({
  username: '',
  email: '',
  password: '',
  fullName: '',
  role: 'TESTER' as 'ADMIN' | 'MANAGER' | 'TESTER' | 'VIEWER',
  status: 'ACTIVE' as 'ACTIVE' | 'INACTIVE' | 'LOCKED'
})

const formErrors = ref<Record<string, string>>({})

async function fetchUsers() {
  isLoading.value = true
  try {
    const response = await userApi.getAllUsers(currentPage.value, 20)
    users.value = response.content
    totalPages.value = response.totalPages
  } catch (err) {
    console.error('Failed to fetch users:', err)
  } finally {
    isLoading.value = false
  }
}

async function fetchStats() {
  try {
    stats.value = await userApi.getUserStats()
  } catch (err) {
    console.error('Failed to fetch stats:', err)
  }
}

function openCreateModal() {
  modalMode.value = 'create'
  form.value = { username: '', email: '', password: '', fullName: '', role: 'TESTER', status: 'ACTIVE' }
  formErrors.value = {}
  showModal.value = true
}

function openEditModal(user: User) {
  modalMode.value = 'edit'
  selectedUser.value = user
  form.value = { username: user.username, email: user.email, password: '', fullName: user.fullName || '', role: user.role, status: user.status }
  formErrors.value = {}
  showModal.value = true
}

function openDeleteModal(user: User) {
  selectedUser.value = user
  showDeleteModal.value = true
}

function validateForm(): boolean {
  formErrors.value = {}
  if (modalMode.value === 'create') {
    if (!form.value.username) formErrors.value.username = t('users.form.errors.usernameRequired')
    if (!form.value.email) formErrors.value.email = t('users.form.errors.emailRequired')
    if (!form.value.password) formErrors.value.password = t('users.form.errors.passwordRequired')
    else if (form.value.password.length < 8) formErrors.value.password = t('users.form.errors.passwordTooShort')
  }
  if (modalMode.value === 'edit' && !form.value.email) {
    formErrors.value.email = t('users.form.errors.emailRequired')
  }
  return Object.keys(formErrors.value).length === 0
}

async function handleSubmit() {
  if (!validateForm()) return
  isLoading.value = true
  try {
    if (modalMode.value === 'create') {
      const request: CreateUserRequest = {
        username: form.value.username,
        email: form.value.email,
        password: form.value.password,
        fullName: form.value.fullName || undefined,
        role: form.value.role
      }
      await userApi.createUser(request)
    } else if (selectedUser.value) {
      const request: UpdateUserRequest = {
        email: form.value.email,
        fullName: form.value.fullName || undefined,
        role: form.value.role,
        status: form.value.status
      }
      await userApi.updateUser(selectedUser.value.id, request)
    }
    showModal.value = false
    await fetchUsers()
    await fetchStats()
  } catch (err: any) {
    formErrors.value.general = err.response?.data?.message || err.message
  } finally {
    isLoading.value = false
  }
}

async function handleDelete() {
  if (!selectedUser.value) return
  isLoading.value = true
  try {
    await userApi.deleteUser(selectedUser.value.id)
    showDeleteModal.value = false
    await fetchUsers()
    await fetchStats()
  } catch (err) {
    console.error('Failed to delete user:', err)
  } finally {
    isLoading.value = false
  }
}

function getRoleColor(role: string) {
  const colors: Record<string, string> = {
    ADMIN: '#ef4444',
    MANAGER: '#f59e0b',
    TESTER: '#10b981',
    VIEWER: '#6b7280'
  }
  return colors[role] || '#6b7280'
}

function getStatusColor(status: string) {
  const colors: Record<string, string> = {
    ACTIVE: '#10b981',
    INACTIVE: '#6b7280',
    LOCKED: '#ef4444'
  }
  return colors[status] || '#6b7280'
}

function formatDate(dateString: string | null) {
  if (!dateString) return '-'
  return new Date(dateString).toLocaleString()
}

function goToPage(page: number) {
  currentPage.value = page
  fetchUsers()
}

onMounted(() => {
  fetchUsers()
  fetchStats()
})
</script>

<template>
  <div class="user-management">
    <div class="header">
      <div>
        <h1>{{ t('users.title') }}</h1>
        <p>{{ t('users.subtitle') }}</p>
      </div>
      <button v-if="authStore.canManageUsers" @click="openCreateModal" class="btn-primary">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M12 5v14m-7-7h14"/>
        </svg>
        {{ t('users.actions.createUser') }}
      </button>
    </div>

    <div class="stats-grid">
      <div class="stat-card">
        <div class="stat-icon" style="background: linear-gradient(135deg, #3b82f6, #8b5cf6);">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
            <circle cx="9" cy="7" r="4"/>
            <path d="M23 21v-2a4 4 0 0 0-3-3.87m-4-12a4 4 0 0 1 0 7.75"/>
          </svg>
        </div>
        <div class="stat-content">
          <div class="stat-value">{{ stats.totalUsers }}</div>
          <div class="stat-label">{{ t('users.stats.totalUsers') }}</div>
        </div>
      </div>

      <div class="stat-card">
        <div class="stat-icon" style="background: linear-gradient(135deg, #10b981, #06b6d4);">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M22 12h-4l-3 9L9 3l-3 9H2"/>
          </svg>
        </div>
        <div class="stat-content">
          <div class="stat-value">{{ stats.activeUsers }}</div>
          <div class="stat-label">{{ t('users.stats.activeUsers') }}</div>
        </div>
      </div>

      <div class="stat-card">
        <div class="stat-icon" style="background: linear-gradient(135deg, #f59e0b, #ef4444);">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <circle cx="12" cy="12" r="10"/>
            <path d="M12 6v6l4 2"/>
          </svg>
        </div>
        <div class="stat-content">
          <div class="stat-value">{{ stats.usersByRole?.ADMIN || 0 }}</div>
          <div class="stat-label">{{ t('users.stats.admins') }}</div>
        </div>
      </div>

      <div class="stat-card">
        <div class="stat-icon" style="background: linear-gradient(135deg, #8b5cf6, #ec4899);">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M12 2L2 7l10 5 10-5-10-5z"/>
            <path d="M2 17l10 5 10-5M2 12l10 5 10-5"/>
          </svg>
        </div>
        <div class="stat-content">
          <div class="stat-value">{{ stats.usersByRole?.MANAGER || 0 }}</div>
          <div class="stat-label">{{ t('users.stats.managers') }}</div>
        </div>
      </div>
    </div>

    <div class="table-container">
      <table class="users-table">
        <thead>
          <tr>
            <th>{{ t('users.table.username') }}</th>
            <th>{{ t('users.table.email') }}</th>
            <th>{{ t('users.table.fullName') }}</th>
            <th>{{ t('users.table.role') }}</th>
            <th>{{ t('users.table.status') }}</th>
            <th>{{ t('users.table.lastLogin') }}</th>
            <th v-if="authStore.canManageUsers">{{ t('users.table.actions') }}</th>
          </tr>
        </thead>
        <tbody>
          <tr v-if="isLoading">
            <td :colspan="authStore.canManageUsers ? 7 : 6" class="loading-cell">
              <div class="spinner"></div>
              {{ t('common.loading') }}
            </td>
          </tr>
          <tr v-else-if="users.length === 0">
            <td :colspan="authStore.canManageUsers ? 7 : 6" class="empty-cell">
              {{ t('users.empty') }}
            </td>
          </tr>
          <tr v-else v-for="user in users" :key="user.id">
            <td>
              <div class="user-cell">
                <div class="user-avatar">{{ user.username[0].toUpperCase() }}</div>
                <strong>{{ user.username }}</strong>
              </div>
            </td>
            <td>{{ user.email }}</td>
            <td>{{ user.fullName || '-' }}</td>
            <td>
              <span class="badge" :style="{ background: getRoleColor(user.role) }">
                {{ t('users.roles.' + user.role.toLowerCase()) }}
              </span>
            </td>
            <td>
              <span class="badge" :style="{ background: getStatusColor(user.status) }">
                {{ t('users.status.' + user.status.toLowerCase()) }}
              </span>
            </td>
            <td>{{ formatDate(user.lastLoginAt) }}</td>
            <td v-if="authStore.canManageUsers">
              <div class="action-buttons">
                <button @click="openEditModal(user)" class="btn-icon" :title="t('users.actions.edit')">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
                    <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
                  </svg>
                </button>
                <button 
                  v-if="authStore.isAdmin && user.id !== authStore.user?.id"
                  @click="openDeleteModal(user)" 
                  class="btn-icon btn-danger" 
                  :title="t('users.actions.delete')"
                >
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <polyline points="3 6 5 6 21 6"/>
                    <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>
                  </svg>
                </button>
              </div>
            </td>
          </tr>
        </tbody>
      </table>

      <div v-if="totalPages > 1" class="pagination">
        <button @click="goToPage(currentPage - 1)" :disabled="currentPage === 0" class="btn-pagination">
          {{ t('common.previous') }}
        </button>
        <span class="pagination-info">
          {{ t('common.page') }} {{ currentPage + 1 }} {{ t('common.of') }} {{ totalPages }}
        </span>
        <button @click="goToPage(currentPage + 1)" :disabled="currentPage >= totalPages - 1" class="btn-pagination">
          {{ t('common.next') }}
        </button>
      </div>
    </div>

    <div v-if="showModal" class="modal-overlay" @click.self="showModal = false">
      <div class="modal">
        <div class="modal-header">
          <h2>{{ modalMode === 'create' ? t('users.modal.createTitle') : t('users.modal.editTitle') }}</h2>
          <button @click="showModal = false" class="modal-close">&times;</button>
        </div>

        <form @submit.prevent="handleSubmit" class="modal-body">
          <div v-if="formErrors.general" class="error-message">{{ formErrors.general }}</div>

          <div v-if="modalMode === 'create'" class="form-group">
            <label>{{ t('users.form.username') }} *</label>
            <input v-model="form.username" type="text" :class="{ error: formErrors.username }" />
            <span v-if="formErrors.username" class="error-text">{{ formErrors.username }}</span>
          </div>

          <div class="form-group">
            <label>{{ t('users.form.email') }} *</label>
            <input v-model="form.email" type="email" :class="{ error: formErrors.email }" />
            <span v-if="formErrors.email" class="error-text">{{ formErrors.email }}</span>
          </div>

          <div v-if="modalMode === 'create'" class="form-group">
            <label>{{ t('users.form.password') }} *</label>
            <input v-model="form.password" type="password" :class="{ error: formErrors.password }" />
            <span v-if="formErrors.password" class="error-text">{{ formErrors.password }}</span>
          </div>

          <div class="form-group">
            <label>{{ t('users.form.fullName') }}</label>
            <input v-model="form.fullName" type="text" />
          </div>

          <div class="form-group">
            <label>{{ t('users.form.role') }} *</label>
            <select v-model="form.role">
              <option value="ADMIN">{{ t('users.roles.admin') }}</option>
              <option value="MANAGER">{{ t('users.roles.manager') }}</option>
              <option value="TESTER">{{ t('users.roles.tester') }}</option>
              <option value="VIEWER">{{ t('users.roles.viewer') }}</option>
            </select>
          </div>

          <div v-if="modalMode === 'edit'" class="form-group">
            <label>{{ t('users.form.status') }} *</label>
            <select v-model="form.status">
              <option value="ACTIVE">{{ t('users.status.active') }}</option>
              <option value="INACTIVE">{{ t('users.status.inactive') }}</option>
              <option value="LOCKED">{{ t('users.status.locked') }}</option>
            </select>
          </div>
        </form>

        <div class="modal-footer">
          <button @click="showModal = false" class="btn-secondary">{{ t('common.cancel') }}</button>
          <button @click="handleSubmit" class="btn-primary" :disabled="isLoading">
            <span v-if="isLoading" class="spinner-sm"></span>
            {{ modalMode === 'create' ? t('common.create') : t('common.save') }}
          </button>
        </div>
      </div>
    </div>

    <div v-if="showDeleteModal" class="modal-overlay" @click.self="showDeleteModal = false">
      <div class="modal modal-sm">
        <div class="modal-header">
          <h2>{{ t('users.delete.title') }}</h2>
          <button @click="showDeleteModal = false" class="modal-close">&times;</button>
        </div>

        <div class="modal-body">
          <p>{{ t('users.delete.confirm', { username: selectedUser?.username }) }}</p>
        </div>

        <div class="modal-footer">
          <button @click="showDeleteModal = false" class="btn-secondary">{{ t('common.cancel') }}</button>
          <button @click="handleDelete" class="btn-danger" :disabled="isLoading">
            <span v-if="isLoading" class="spinner-sm"></span>
            {{ t('common.delete') }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.user-management { padding: 24px; }
.header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 32px; }
.header h1 { font-size: 28px; font-weight: 700; color: var(--text-primary); margin: 0 0 4px; }
.header p { color: var(--text-secondary); margin: 0; }
.stats-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(240px, 1fr)); gap: 20px; margin-bottom: 32px; }
.stat-card { display: flex; align-items: center; gap: 16px; padding: 20px; background: var(--bg-secondary); border: 1px solid var(--border-color); border-radius: 12px; transition: all 0.2s ease; }
.stat-card:hover { transform: translateY(-2px); box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1); }
.stat-icon { width: 56px; height: 56px; display: flex; align-items: center; justify-content: center; border-radius: 12px; color: white; }
.stat-content { flex: 1; }
.stat-value { font-size: 32px; font-weight: 700; color: var(--text-primary); line-height: 1; margin-bottom: 4px; }
.stat-label { font-size: 14px; color: var(--text-secondary); }
.table-container { background: var(--bg-secondary); border: 1px solid var(--border-color); border-radius: 12px; overflow: hidden; }
.users-table { width: 100%; border-collapse: collapse; }
.users-table thead { background: var(--bg-tertiary); }
.users-table th { padding: 16px; text-align: left; font-size: 13px; font-weight: 600; color: var(--text-secondary); text-transform: uppercase; letter-spacing: 0.5px; }
.users-table td { padding: 16px; border-top: 1px solid var(--border-color); color: var(--text-primary); }
.user-cell { display: flex; align-items: center; gap: 12px; }
.user-avatar { width: 32px; height: 32px; display: flex; align-items: center; justify-content: center; background: linear-gradient(135deg, #3b82f6, #8b5cf6); color: white; border-radius: 50%; font-weight: 600; font-size: 14px; }
.badge { display: inline-block; padding: 4px 12px; border-radius: 12px; font-size: 12px; font-weight: 600; color: white; }
.action-buttons { display: flex; gap: 8px; }
.btn-icon { padding: 6px; background: var(--bg-tertiary); border: 1px solid var(--border-color); border-radius: 6px; cursor: pointer; color: var(--text-secondary); transition: all 0.2s; }
.btn-icon:hover { background: var(--bg-primary); color: var(--text-primary); }
.btn-icon.btn-danger:hover { background: #ef4444; border-color: #ef4444; color: white; }
.loading-cell, .empty-cell { text-align: center; padding: 40px; color: var(--text-secondary); }
.loading-cell { display: flex; align-items: center; justify-content: center; gap: 12px; }
.pagination { display: flex; align-items: center; justify-content: center; gap: 16px; padding: 16px; border-top: 1px solid var(--border-color); }
.btn-pagination { padding: 8px 16px; background: var(--bg-tertiary); border: 1px solid var(--border-color); border-radius: 8px; cursor: pointer; color: var(--text-primary); transition: all 0.2s; }
.btn-pagination:hover:not(:disabled) { background: var(--bg-primary); }
.btn-pagination:disabled { opacity: 0.5; cursor: not-allowed; }
.pagination-info { color: var(--text-secondary); font-size: 14px; }
.btn-primary { display: flex; align-items: center; gap: 8px; padding: 10px 20px; background: linear-gradient(135deg, #3b82f6, #8b5cf6); color: white; border: none; border-radius: 8px; font-weight: 600; cursor: pointer; transition: all 0.2s; }
.btn-primary:hover { transform: translateY(-1px); box-shadow: 0 4px 12px rgba(59, 130, 246, 0.3); }
.btn-secondary { padding: 10px 20px; background: var(--bg-tertiary); border: 1px solid var(--border-color); border-radius: 8px; cursor: pointer; color: var(--text-primary); transition: all 0.2s; }
.btn-secondary:hover { background: var(--bg-primary); }
.btn-danger { padding: 10px 20px; background: #ef4444; color: white; border: none; border-radius: 8px; cursor: pointer; transition: all 0.2s; }
.btn-danger:hover { background: #dc2626; }
.modal-overlay { position: fixed; inset: 0; background: rgba(0, 0, 0, 0.5); display: flex; align-items: center; justify-content: center; z-index: 1000; backdrop-filter: blur(4px); }
.modal { width: 90%; max-width: 500px; background: var(--bg-secondary); border: 1px solid var(--border-color); border-radius: 16px; box-shadow: 0 20px 50px rgba(0, 0, 0, 0.3); }
.modal-sm { max-width: 400px; }
.modal-header { display: flex; align-items: center; justify-content: space-between; padding: 24px; border-bottom: 1px solid var(--border-color); }
.modal-header h2 { font-size: 20px; font-weight: 600; color: var(--text-primary); margin: 0; }
.modal-close { width: 32px; height: 32px; display: flex; align-items: center; justify-content: center; background: none; border: none; font-size: 24px; color: var(--text-secondary); cursor: pointer; transition: all 0.2s; }
.modal-close:hover { color: var(--text-primary); }
.modal-body { padding: 24px; }
.modal-body p { color: var(--text-secondary); margin: 0; }
.modal-footer { display: flex; gap: 12px; justify-content: flex-end; padding: 24px; border-top: 1px solid var(--border-color); }
.form-group { margin-bottom: 20px; }
.form-group label { display: block; font-size: 14px; font-weight: 500; color: var(--text-primary); margin-bottom: 8px; }
.form-group input, .form-group select { width: 100%; padding: 10px 14px; background: var(--bg-primary); border: 1px solid var(--border-color); border-radius: 8px; color: var(--text-primary); font-size: 14px; transition: all 0.2s; }
.form-group input:focus, .form-group select:focus { outline: none; border-color: #3b82f6; box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1); }
.form-group input.error { border-color: #ef4444; }
.error-text { display: block; margin-top: 4px; font-size: 12px; color: #ef4444; }
.error-message { padding: 12px; background: rgba(239, 68, 68, 0.1); border: 1px solid rgba(239, 68, 68, 0.3); border-radius: 8px; color: #ef4444; font-size: 14px; margin-bottom: 16px; }
.spinner { width: 20px; height: 20px; border: 2px solid rgba(59, 130, 246, 0.3); border-top-color: #3b82f6; border-radius: 50%; animation: spin 0.8s linear infinite; }
.spinner-sm { width: 16px; height: 16px; border: 2px solid rgba(255, 255, 255, 0.3); border-top-color: white; border-radius: 50%; animation: spin 0.8s linear infinite; display: inline-block; margin-right: 8px; }
@keyframes spin { to { transform: rotate(360deg); } }
</style>
