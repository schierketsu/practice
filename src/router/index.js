import { createRouter, createWebHistory } from 'vue-router'
import HomeView from '../views/HomeView.vue'
import CompanyDetailView from '../views/CompanyDetailView.vue'
import InternshipsView from '../views/InternshipsView.vue'

const router = createRouter({
  history: createWebHistory(),
  routes: [
    {
      path: '/',
      redirect: '/практики'
    },
    {
      path: '/практики',
      name: 'home',
      component: HomeView,
      alias: ['/%D0%BF%D1%80%D0%B0%D0%BA%D1%82%D0%B8%D0%BA%D0%B8']
    },
    {
      path: '/стажировки',
      name: 'internships',
      component: InternshipsView,
      alias: ['/%D1%81%D1%82%D0%B0%D0%B6%D0%B8%D1%80%D0%BE%D0%B2%D0%BA%D0%B8']
    },
    {
      path: '/компания/:id',
      name: 'company-detail',
      component: CompanyDetailView,
      props: true
    }
  ]
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
  next()
})

export default router

