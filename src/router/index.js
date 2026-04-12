import { createRouter, createWebHistory } from 'vue-router'
import HomeView from '../views/HomeView.vue'
import CompanyDetailView from '../views/CompanyDetailView.vue'
import LoginView from '../views/LoginView.vue'
import RegisterView from '../views/RegisterView.vue'
import ProfileLayout from '../views/ProfileLayout.vue'
import ProfileSettingsView from '../views/ProfileSettingsView.vue'
import AdminUsersView from '../views/admin/AdminUsersView.vue'
import AdminCompaniesView from '../views/admin/AdminCompaniesView.vue'
import AdminReviewsView from '../views/admin/AdminReviewsView.vue'
import AdminUniversitiesView from '../views/admin/AdminUniversitiesView.vue'
import AdminTechnologiesView from '../views/admin/AdminTechnologiesView.vue'
import { useAuthStore } from '../stores/auth'
import { COMPANY_SEARCH_RETURN_KEY } from '../lib/navigationKeys'

const router = createRouter({
  history: createWebHistory(),
  routes: [
    {
      path: '/',
      redirect: '/практики',
    },
    {
      path: '/практики',
      name: 'home',
      component: HomeView,
      alias: ['/%D0%BF%D1%80%D0%B0%D0%BA%D1%82%D0%B8%D0%BA%D0%B8'],
    },
    {
      path: '/стажировки',
      redirect: '/практики',
      alias: ['/%D1%81%D1%82%D0%B0%D0%B6%D0%B8%D1%80%D0%BE%D0%B2%D0%BA%D0%B8'],
    },
    {
      path: '/компания/:id',
      name: 'company-detail',
      component: CompanyDetailView,
      props: true,
    },
    {
      path: '/вход',
      name: 'login',
      component: LoginView,
      meta: { guestOnly: true },
      alias: ['/login'],
    },
    {
      path: '/регистрация',
      name: 'register',
      component: RegisterView,
      meta: { guestOnly: true },
      alias: ['/register'],
    },
    {
      path: '/профиль',
      component: ProfileLayout,
      meta: { requiresAuth: true },
      children: [
        {
          path: '',
          name: 'profile-settings',
          component: ProfileSettingsView,
        },
        {
          path: 'пользователи',
          name: 'admin-users',
          component: AdminUsersView,
          meta: { requiresAdmin: true },
        },
        {
          path: 'компании',
          name: 'admin-companies',
          component: AdminCompaniesView,
          meta: { requiresAdmin: true },
        },
        {
          path: 'вузы',
          name: 'admin-universities',
          component: AdminUniversitiesView,
          meta: { requiresAdmin: true },
        },
        {
          path: 'технологии',
          name: 'admin-technologies',
          component: AdminTechnologiesView,
          meta: { requiresAdmin: true },
        },
        {
          path: 'отклики',
          name: 'admin-reviews',
          component: AdminReviewsView,
          meta: { requiresAdmin: true },
        },
      ],
    },
    {
      path: '/админ',
      redirect: '/профиль/пользователи',
    },
    {
      path: '/админ/:pathMatch(.*)',
      redirect: (to) => `/профиль/${to.params.pathMatch}`,
    },
  ],
})

router.beforeEach(async (to, from, next) => {
  if (to.path.includes('%')) {
    try {
      const decodedPath = decodeURIComponent(to.path)
      if (decodedPath !== to.path) {
        next(decodedPath)
        return
      }
    } catch (e) {
      console.error('Error decoding path:', e)
    }
  }

  if (to.name === 'company-detail' && from.name === 'home') {
    sessionStorage.setItem(COMPANY_SEARCH_RETURN_KEY, from.fullPath)
  }
  if (to.name === 'home' && from.name === 'company-detail') {
    sessionStorage.removeItem(COMPANY_SEARCH_RETURN_KEY)
  }

  const auth = useAuthStore()
  // Токен уже в localStorage, а /me ещё не успел (сеть, порядок загрузки) — повторяем restore.
  if (auth.token && !auth.user) {
    await auth.restoreSession()
  }

  if (to.meta.requiresAuth && !auth.isAuthenticated) {
    next({ path: '/вход', query: { redirect: to.fullPath } })
    return
  }
  const needsAdmin = to.matched.some((r) => r.meta.requiresAdmin)
  if (needsAdmin && !auth.isAdmin) {
    next({ path: '/профиль' })
    return
  }
  if (to.path === '/профиль' && auth.isAuthenticated && auth.isAdmin) {
    next({ path: '/профиль/пользователи', replace: true })
    return
  }
  if (to.meta.guestOnly && auth.isAuthenticated) {
    next({ path: '/практики' })
    return
  }
  next()
})

export default router
