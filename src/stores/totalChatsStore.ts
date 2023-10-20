import { defineStore } from 'pinia'
import type { Chat } from '@/schema'

export const useTotalChatsStore = defineStore('totalChatsStore', {
  state: () => ({
    date: null as number | null,
    chats: [] as Chat[]
  }),
  persist: true
})
