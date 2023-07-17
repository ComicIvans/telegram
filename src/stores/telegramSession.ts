import { ref, computed } from 'vue'
import { defineStore } from 'pinia'

export const useTelegramSessionStore = defineStore('telegramSession', {
  state: () => ({ apiId: null as number | null,
    apiHash: null as string | null,
    stringSession: null as string | null, }),
  persist: true,
})