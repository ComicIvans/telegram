import { defineStore } from 'pinia'

type User = {
  id: BigInt | null,
  first_name: string,
  last_name: string,
  username: string,
  phone: string,
  photo: string | null,
  selected: boolean,
  failedTelegram: boolean,
  tags: string[],
}

export const useUsersStore = defineStore('usersStore', {
  state: () => ({
    date: null as number | null,
    users: [] as User[],
   }),
  persist: true,
})