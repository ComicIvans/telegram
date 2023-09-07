import { defineStore } from 'pinia'

type User = {
  id: BigInt,
  first_name: string,
  last_name: string,
  username: string,
  photo: string | null,
  selected: boolean,
  tags: string[],
}

export const useUsersStore = defineStore('usersStore', {
  state: () => ({
    date: null as number | null,
    users: [] as User[],
   }),
  persist: true,
})