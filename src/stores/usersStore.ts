import type { User } from '@/schema'
import { defineStore } from 'pinia'

export const useUsersStore = defineStore('usersStore', {
  state: () => ({
    date: null as number | null,
    users: [] as User[]
  }),
  persist: true
})
