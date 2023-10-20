import { defineStore } from 'pinia'
import type { FoundUser } from '@/schema'
import type { Api, TelegramClient } from 'telegram'
import { userUpdatesStatus } from '@/usersUpdateStatus'
import { useChatsStore } from '@/stores/chatsStore'
import { isUserInChat } from '@/utils/chatManager'

const chatsStore = useChatsStore()

export const useTotalUsersStore = defineStore('totalUsersStore', {
  state: () => ({
    users: [] as FoundUser[],
    uniqueIds: new Set<string>(),
    allowDelete: true
  }),
  actions: {
    addUserSafe(client: TelegramClient, userId: bigInt.BigInteger, tags?: string[]) {
      if (this.uniqueIds.has(userId.toString())) return

      this.uniqueIds.add(userId.toString())

      const statusIndex = userUpdatesStatus.value.length
      userUpdatesStatus.value.push(false)
      ;(async () => {
        const result = (await client.getEntity(userId)) as Api.User
        this.users.push({
          id: result.id,
          photo: null,
          firstName: result.firstName ?? '',
          lastName: result.lastName ?? '',
          username: result.username ?? '',
          phone: result.phone ?? '',
          tags: tags ?? [],
          // @ts-ignore
          chats: await Promise.all(
            chatsStore.chats.map(async (chat) => {
              const isInChat = await isUserInChat(result.id, chat.id)
              return isInChat ? chat.id.toString() : null
            })
          ).then((chatIds) => chatIds.filter((chatId) => chatId !== null))
        })
        userUpdatesStatus.value[statusIndex] = true
      })()
    }
  }
})
