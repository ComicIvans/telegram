import { createRouter, createWebHistory } from 'vue-router'
import { useTelegramSessionStore } from '@/stores/telegramSession'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      redirect: '/dashboard'
    },
    {
      path: '/dashboard',
      component: () => import('../views/HomeView.vue')
    },
    {
      path: '/auth',
      component: () => import('../views/LoginView.vue'),
    }
  ]
})

router.beforeEach((to, from, next) => {
  const store = useTelegramSessionStore()
  if (to.path !== '/auth' && !store.stringSession) {
    next('/auth')
  } else {
    next()
  }
})

export default router
