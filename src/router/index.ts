import { createRouter, createWebHistory } from 'vue-router'
import DashboardHome from '../views/DashboardHome.vue'
import TestList from '../views/TestList.vue'
import TestCreate from '../views/TestCreate.vue'
import TestResults from '../views/TestResults.vue'
import LiveMonitor from '../views/LiveMonitor.vue'
import TestComparison from '../views/TestComparison.vue'
import Analytics from '../views/Analytics.vue'
import Templates from '../views/Templates.vue'
import Schedules from '../views/Schedules.vue'
import Reports from '../views/Reports.vue'
import Monitoring from '../views/Monitoring.vue'
import Trends from '../views/Trends.vue'
import Integrations from '../views/Integrations.vue'
import ApiKeys from '../views/ApiKeys.vue'
import Settings from '../views/Settings.vue'
import Login from '../views/Login.vue'
import Privacy from '../views/Privacy.vue'
import Terms from '../views/Terms.vue'
import Support from '../views/Support.vue'
import ScenarioBuilder from '../views/ScenarioBuilder.vue'
import DataParameterization from '../views/DataParameterization.vue'
import UserManagement from '../views/UserManagement.vue'
import NotificationSettings from '../views/NotificationSettings.vue'
import DistributedTesting from '../views/DistributedTesting.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/login',
      name: 'login',
      component: Login,
      meta: { requiresGuest: true, hideLayout: true }
    },
    {
      path: '/',
      name: 'home',
      component: DashboardHome,
      meta: { requiresAuth: true }
    },
    {
      path: '/tests',
      name: 'tests',
      component: TestList,
      meta: { requiresAuth: true }
    },
    {
      path: '/tests/new',
      name: 'test-create',
      component: TestCreate,
      meta: { requiresAuth: true }
    },
    {
      path: '/tests/scenario',
      name: 'scenario-builder',
      component: ScenarioBuilder,
      meta: { requiresAuth: true }
    },
    {
      path: '/data',
      name: 'data-parameterization',
      component: DataParameterization,
      meta: { requiresAuth: true }
    },
    {
      path: '/results/:id',
      name: 'test-results',
      component: TestResults,
      meta: { requiresAuth: true }
    },
    {
      path: '/live/:id',
      name: 'live-monitor',
      component: LiveMonitor,
      meta: { requiresAuth: true }
    },
    {
      path: '/comparison',
      name: 'test-comparison',
      component: TestComparison,
      meta: { requiresAuth: true }
    },
    {
      path: '/analytics',
      name: 'analytics',
      component: Analytics,
      meta: { requiresAuth: true }
    },
    {
      path: '/templates',
      name: 'templates',
      component: Templates,
      meta: { requiresAuth: true }
    },
    {
      path: '/schedules',
      name: 'schedules',
      component: Schedules,
      meta: { requiresAuth: true }
    },
    {
      path: '/reports',
      name: 'reports',
      component: Reports,
      meta: { requiresAuth: true }
    },
    {
      path: '/monitoring',
      name: 'monitoring',
      component: Monitoring,
      meta: { requiresAuth: true }
    },
    {
      path: '/trends',
      name: 'trends',
      component: Trends,
      meta: { requiresAuth: true }
    },
    {
      path: '/integrations',
      name: 'integrations',
      component: Integrations,
      meta: { requiresAuth: true }
    },
    {
      path: '/api-keys',
      name: 'api-keys',
      component: ApiKeys,
      meta: { requiresAuth: true }
    },
    {
      path: '/settings',
      name: 'settings',
      component: Settings,
      meta: { requiresAuth: true }
    },
    {
      path: '/notifications',
      name: 'notifications',
      component: NotificationSettings,
      meta: { requiresAuth: true }
    },
    {
      path: '/distributed',
      name: 'distributed-testing',
      component: DistributedTesting,
      meta: { requiresAuth: true }
    },
    {
      path: '/users',
      name: 'users',
      component: UserManagement,
      meta: { requiresAuth: true, requiresAdmin: true }
    },
    {
      path: '/privacy',
      name: 'privacy',
      component: Privacy,
      meta: { hideLayout: true }
    },
    {
      path: '/terms',
      name: 'terms',
      component: Terms,
      meta: { hideLayout: true }
    },
    {
      path: '/support',
      name: 'support',
      component: Support,
      meta: { hideLayout: true }
    }
  ]
})

// Navigation guard
router.beforeEach(async (to, _from, next) => {
  const isAuthenticated = !!localStorage.getItem('auth_token')

  if (to.meta.requiresAuth && !isAuthenticated) {
    next('/login')
  } else if (to.meta.requiresGuest && isAuthenticated) {
    next('/')
  } else if (to.meta.requiresAdmin) {
    // Check if user has admin or manager role
    const { useAuthStore } = await import('../stores/auth')
    const authStore = useAuthStore()

    if (!authStore.user) {
      await authStore.verifyToken()
    }

    if (!authStore.canManageUsers) {
      next('/')
    } else {
      next()
    }
  } else {
    next()
  }
})

export default router
