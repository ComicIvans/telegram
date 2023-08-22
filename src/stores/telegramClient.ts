import { defineStore } from 'pinia'
import { TelegramClient } from 'telegram'

export const useTelegramClientStore = defineStore('telegramClient', {
  state: () => ({ client : null as TelegramClient | null, }),
})