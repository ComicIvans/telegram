import { useChatsStore } from '@/stores/chatsStore'
import { useUsersStore } from '@/stores/usersStore'
import { useTelegramClientStore } from '@/stores/telegramClient'
import { useTotalUsersStore } from '@/stores/totalUsersStore'
import type { Chat } from '@/schema'
import { Api } from 'telegram/tl'

const chatsStore = useChatsStore()
const usersStore = useUsersStore()
const clientStore = useTelegramClientStore()
const totalUsersStore = useTotalUsersStore()

export function updateChatsInfo(
  alsoPhotos = false,
  alsoParticipants = false,
  onlySelected = false
) {
  if (clientStore.client) {
    const chats = onlySelected ? chatsStore.chats.filter((chat) => chat.selected) : chatsStore.chats
    chats.forEach(async (chat) => {
      // @ts-expect-error
      const result = await clientStore.client.getEntity(chat.id)
      if (result) {
        // @ts-ignore
        chat.title = result.title
        // @ts-ignore
        chat.participantsCount = 0
      }
    })
  }
  if (alsoPhotos) getChatsPhotos(onlySelected)
  if (alsoParticipants) getChatsParticipants(onlySelected)
}

export async function getChatsPhotos(onlySelected = false) {
  const chats = onlySelected ? chatsStore.chats.filter((chat) => chat.selected) : chatsStore.chats
  chats.forEach(async (chat) => {
    if (chat.id && clientStore.client) {
      const result = await clientStore.client.downloadProfilePhoto(chat.id)
      if (result) {
        const base64 = result.toString('base64')
        if (base64) {
          chat.photo = 'data:image/jpeg;base64,' + base64
        }
      }
    }
  })
}

export async function addSelectedUsers() {
  const users = usersStore.users.filter((user) => user.selected)
  users.forEach(async (user) => {
    if (user.id && clientStore.client) {
      const result = await clientStore.client.getEntity(user.id)
      if (result instanceof Api.User) {
        const existingUser = totalUsersStore.users.find(
          (user) => user.id.toString() === result.id.toString()
        )
        if (!existingUser) {
          totalUsersStore.users.push({
            id: result.id,
            photo: user.photo,
            firstName: user.firstName,
            lastName: user.lastName,
            // @ts-ignore
            chats: await Promise.all(
              chatsStore.chats.map(async (chat) => {
                const isSelected = chat.selected
                const isInChat = await isUserInChat(result.id, chat.id)
                return isSelected && isInChat ? chat.id : null
              })
            ).then((chatIds) => chatIds.filter((chatId) => chatId !== null))
          })
        }
        console.log(totalUsersStore.users)
      }
    }
  })
}

export function deleteAllUsers() {
  totalUsersStore.users = []
}

async function isUserInChat(
  userId: bigInt.BigInteger,
  chatId: bigInt.BigInteger
): Promise<boolean> {
  try {
    if (!clientStore.client) return false
    const chatMember = await clientStore.client.invoke(
      new Api.channels.GetParticipant({ channel: chatId, participant: userId })
    )
    return true
  } catch (error) {
    if (error instanceof Api.ChatParticipant) {
      return true
    } else {
      return false
    }
  }
}

export async function getChatsParticipants(onlySelected = true) {
  const chats = onlySelected ? chatsStore.chats.filter((chat) => chat.selected) : chatsStore.chats
  console.log(chats)
  chats.forEach(async (chat) => {
    const result = await clientStore.client?.getParticipants(chat.id)
    if (result) {
      const participants = result.map((participant) => {
        return {
          id: participant.id,
          firstName: participant.firstName ? participant.firstName : '',
          lastName: participant.lastName ? participant.lastName : '',
          photo: null
        }
      })
      // @ts-ignore
      chat.participants = participants
    }
  })
}

export async function getChatParticipants(chat: Chat) {
  const result = await clientStore.client?.getParticipants(chat.id)
  if (!result) return
  chat.participants = result.map((participant) => participant.id)
}

export async function test() {
  //console.log(chatsStore.chats)
  //const result = await clientStore.client?.getEntity('-1001537535181')
  //console.log(result)
}
