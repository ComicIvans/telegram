import type { type } from 'os'
import { defineStore } from 'pinia'

type Chat = {
  id: BigInt,
  title: string,
  type: 'Grupo' | 'Canal' |'Desconocido',
  photo: string | null,
  canAddUsersAsAdmin: boolean,
  canAddUsersAsUser: boolean,
  selected: boolean,
  tags: string[],
}

export const useChatsStore = defineStore('chatsStore', {
  state: () => ({
    date: null as number | null,
    chats: [] as Chat[],
   }),
  persist: true,
})