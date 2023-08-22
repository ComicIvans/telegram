import { createRouter, createWebHistory } from 'vue-router'
import { useTelegramClientStore } from '../stores/telegramClient'

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
  const store = useTelegramClientStore()
  if (to.path !== '/auth' && (!store.client || !store.client.checkAuthorization())) {
    next('/auth')
  } else {
    next()
  }
})

export default router
