import type { User } from '@/schema'
import { defineStore } from 'pinia'

type StoreUser = User & {
  id: BigInt | null
  photo: string | null
  selected: boolean
  failedTelegram: boolean
  telegramError: string
}

export const useUsersStore = defineStore('usersStore', {
  state: () => ({
    date: null as number | null,
    users: [] as StoreUser[]
  }),
  persist: true
})
