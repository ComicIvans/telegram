import { defineStore } from 'pinia'
import type { AdminChat } from '@/schema'

export const useChatsStore = defineStore('chatsStore', {
  state: () => ({
    chats: [] as AdminChat[]
  })
})
