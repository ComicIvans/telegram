import { defineStore } from 'pinia'

type User = {
  id: bigInt.BigInteger
  photo: string | null
  firstName: string
  lastName: string
  chats: bigInt.BigInteger[]
}

export const useTotalUsersStore = defineStore('totalUsersStore', {
  state: () => ({
    users: [] as User[]
  })
})
