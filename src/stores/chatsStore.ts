import { defineStore } from 'pinia'
import type { Chat } from '@/schema'

export const useChatsStore = defineStore('chatsStore', {
  state: () => ({
    date: null as number | null,
    chats: [] as Chat[]
  }),
  persist: true
})
