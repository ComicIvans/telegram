import { defineStore } from 'pinia'

export const useActionsStore = defineStore('actionsStore', {
  state: () => ({
    actions: [] as {
      chatId: bigInt.BigInteger
      userId: bigInt.BigInteger
      action: string
      status: string
      message: string
    }[]
  })
})
