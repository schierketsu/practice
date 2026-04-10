import { createRouter, createWebHistory } from 'vue-router'
import HomeView from '../views/HomeView.vue'
import CompanyDetailView from '../views/CompanyDetailView.vue'
import InternshipsView from '../views/InternshipsView.vue'
import LoginView from '../views/LoginView.vue'
import RegisterView from '../views/RegisterView.vue'
import ProfileView from '../views/ProfileView.vue'
import AdminLayout from '../views/admin/AdminLayout.vue'
import AdminUsersView from '../views/admin/AdminUsersView.vue'
import AdminCompaniesView from '../views/admin/AdminCompaniesView.vue'
import AdminReviewsView from '../views/admin/AdminReviewsView.vue'
import { useAuthStore } from '../stores/auth'

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
      name: 'internships',
      component: InternshipsView,
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
      name: 'profile',
      component: ProfileView,
      meta: { requiresAuth: true },
    },
    {
      path: '/админ',
      component: AdminLayout,
      meta: { requiresAuth: true, requiresAdmin: true },
      children: [
        { path: '', redirect: { name: 'admin-users' } },
        {
          path: 'пользователи',
          name: 'admin-users',
          component: AdminUsersView,
        },
        {
          path: 'компании',
          name: 'admin-companies',
          component: AdminCompaniesView,
        },
        {
          path: 'отклики',
          name: 'admin-reviews',
          component: AdminReviewsView,
        },
      ],
    },
  ],
})

router.beforeEach((to, from, next) => {
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

  const auth = useAuthStore()
  if (to.meta.requiresAuth && !auth.isAuthenticated) {
    next({ path: '/вход', query: { redirect: to.fullPath } })
    return
  }
  if (to.meta.requiresAdmin && !auth.isAdmin) {
    next({ path: '/практики' })
    return
  }
  if (to.meta.guestOnly && auth.isAuthenticated) {
    next({ path: '/практики' })
    return
  }
  next()
})

export default router
