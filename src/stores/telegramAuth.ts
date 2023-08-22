import { defineStore } from 'pinia'

export const useTelegramAuthStore = defineStore('telegramAuth', {
  state: () => ({ apiId: null as number | null,
    apiHash: null as string | null,
    stringSession: null as string | null,
   }),
  persist: true,
})