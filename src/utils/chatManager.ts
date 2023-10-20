import { useTotalChatsStore } from '@/stores/totalChatsStore'
import { useChatsStore } from '@/stores/chatsStore'
import { useUsersStore } from '@/stores/usersStore'
import { useTelegramClientStore } from '@/stores/telegramClient'
import { useTotalUsersStore } from '@/stores/totalUsersStore'
import { useActionsStore } from '@/stores/actionsStore'
import type { AdminChat, User, AdminChatParticipant, FoundUser } from '@/schema'
import { Api } from 'telegram/tl'

const totalChatsStore = useTotalChatsStore()
const chatsStore = useChatsStore()
const usersStore = useUsersStore()
const clientStore = useTelegramClientStore()
const totalUsersStore = useTotalUsersStore()
const actionsStore = useActionsStore()

function keepUserInChat(chat: AdminChat, user: FoundUser) {
  return chat.tags.some((tag) => user.tags.includes(tag))
}

export async function reloadInfo(alsoPhotos = false) {
  if (clientStore.client) {
    for (const chat of chatsStore.chats) {
      const result = await clientStore.client.getEntity(chat.id)
      if (result instanceof Api.Channel || result instanceof Api.Chat) {
        chat.title = result.title
        chat.participants = await getChatParticipants(chat)
      }
    }

    if (alsoPhotos) {
      updateChatsPhotos(true)
      updateUsersPhotos()
    }
    // Sort first by first name, then by last name
    totalUsersStore.users
      .sort((a, b) => {
        if (a.firstName < b.firstName) return -1
        if (a.firstName > b.firstName) return 1
        return 0
      })
      .sort((a, b) => {
        if (a.lastName < b.lastName) return -1
        if (a.lastName > b.lastName) return 1
        return 0
      })
    await reloadActions()
  }
}

export async function updateChatsPhotos(onlySelected: boolean) {
  const chats = onlySelected ? chatsStore.chats : totalChatsStore.chats
  for (const chat of chats) {
    if (chat.id && clientStore.client) {
      const result = await clientStore.client.downloadProfilePhoto(chat.id)
      if (result) {
        const base64 = result.toString('base64')
        if (base64) {
          chat.photo = 'data:image/jpeg;base64,' + base64
        }
      }
    }
  }
}

export async function updateUsersPhotos() {
  for (const user of totalUsersStore.users) {
    if (user.id && clientStore.client) {
      const result = await clientStore.client.downloadProfilePhoto(user.id)
      if (result) {
        const base64 = result.toString('base64')
        if (base64) {
          user.photo = 'data:image/jpeg;base64,' + base64
        }
      }
    }
  }
}

export function addSelections() {
  chatsStore.chats = totalChatsStore.chats
    .filter((chatEntity) => chatEntity.selected)
    .map((chatEntity) => {
      const chat = {
        id: chatEntity.id,
        title: chatEntity.title,
        type: chatEntity.type,
        photo: chatEntity.photo,
        tags: chatEntity.tags,
        participants: [] as bigInt.BigInteger[]
      }
      getChatParticipants(chat).then((participants) => {
        chat.participants = participants
        participants.forEach((participant) => {
          // @ts-ignore
          totalUsersStore.addUserSafe(clientStore.client, participant)
        })
      })
      return chat
    })
  usersStore.users
    .filter((user) => user.selected)
    // @ts-ignore
    .forEach((user) => totalUsersStore.addUserSafe(clientStore.client, user.id, user.tags))
}

async function reloadActions() {
  actionsStore.actions = []
  for (const user of totalUsersStore.users) {
    for (const chat of chatsStore.chats) {
      const tagMatch = chat.tags.some((tag) => user.tags.includes(tag))
      const inParticipants = chat.participants.includes(user.id)
      if (inParticipants && !tagMatch) {
        actionsStore.actions.push({
          chatId: chat.id,
          userId: user.id,
          action: 'remove',
          status: 'info',
          message: ''
        })
      } else if (inParticipants && tagMatch) {
        actionsStore.actions.push({
          chatId: chat.id,
          userId: user.id,
          action: 'none',
          status: 'info',
          message: ''
        })
      } else if (!inParticipants && tagMatch) {
        actionsStore.actions.push({
          chatId: chat.id,
          userId: user.id,
          action: 'add',
          status: 'info',
          message: ''
        })
      } else {
        continue
      }
    }
  }
}

export async function addUser(user: User) {
  if (clientStore.client) {
    const result = await clientStore.client.getEntity(user.id!)
    if (result instanceof Api.User) {
      if (!totalUsersStore.uniqueIds.has(user.id!.toString())) {
        totalUsersStore.uniqueIds.add(user.id!.toString())
        totalUsersStore.users.push({
          id: result.id,
          photo: user.photo,
          firstName: user.firstName ?? result.firstName ?? '',
          lastName: user.lastName ?? result.lastName ?? '',
          username: result.username ?? user.username ?? '',
          phone: result.phone ?? user.phone ?? '',
          tags: user.tags,
          // @ts-ignore
          chats: await Promise.all(
            chatsStore.chats.map(async (chat) => {
              const isInChat = await isUserInChat(result.id, chat.id)
              return isInChat ? chat.id.toString() : null
            })
          ).then((chatIds) => chatIds.filter((chatId) => chatId !== null))
        })
      }
    }
  }
}

export async function addUserFromId(id: bigInt.BigInteger | string) {
  if (clientStore.client) {
    const result = await clientStore.client.getEntity(id)
    if (result instanceof Api.User) {
      if (!totalUsersStore.uniqueIds.has(id.toString())) {
        totalUsersStore.uniqueIds.add(id.toString())
        totalUsersStore.users.push({
          id: result.id,
          photo: null,
          firstName: result.firstName ?? '',
          lastName: result.lastName ?? '',
          username: result.username ?? '',
          phone: result.phone ?? '',
          tags: [],
          // @ts-ignore
          chats: await Promise.all(
            chatsStore.chats.map(async (chat) => {
              const isInChat = await isUserInChat(result.id, chat.id)
              return isInChat ? chat.id.toString() : null
            })
          ).then((chatIds) => chatIds.filter((chatId) => chatId !== null))
        })
      }
    }
  }
}

export function deleteSelections() {
  totalUsersStore.users = []
  totalUsersStore.uniqueIds = new Set<string>()
  chatsStore.chats = []
}

export async function confirmActions() {
  const me = await clientStore.client?.getEntity('me')
  let inviteLink: string | undefined
  for (const chat of chatsStore.chats) {
    const actions = actionsStore.actions.filter(
      (action) => action.chatId.toString() === chat.id.toString()
    )
    for (const action of actions) {
      if (action.action === 'add') {
        try {
          const result = await clientStore.client?.invoke(
            new Api.channels.InviteToChannel({
              channel: chat.id,
              users: [action.userId]
            })
          )
        } catch (error) {
          if (!inviteLink) {
            const invite = await clientStore.client?.invoke(
              new Api.messages.GetExportedChatInvites({
                peer: chat.id,
                adminId: me?.id,
                limit: 1,
                revoked: false
              })
            )
            if (invite && invite.count > 0) {
              // @ts-ignore
              inviteLink = invite.invites[0].link
            }
          }
          try {
            await clientStore.client?.sendMessage(action.userId, { message: inviteLink })
          } catch (error) {
            const errUser = totalUsersStore.users.find(
              (user) => user.id.toString() === action.userId.toString()
            )
            console.log(`Could not send invite link to ${errUser?.firstName} ${errUser?.lastName}`)
          }
        }
      }
    }
  }
}

export async function isUserInChat(
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
      // If chat is a basic group, this won't work
      return false
    }
  }
}

async function getChatParticipants(chat: AdminChat) {
  try {
    const result = await clientStore.client?.getParticipants(chat.id)
    if (!result) return []
    return result.map((participant) => participant.id)
  } catch (error) {
    return []
  }
}

export async function test() {
  // console.log(totalUsersStore.users)
  // console.log(chatsStore.chats)
  // const chat = await clientStore.client?.getEntity('-4000852379')
  // console.log(chat)
  // console.log('a')
  // if (!chat) return
  // for await (const user of clientStore.client?.iterParticipants(chat, {
  //   filter: '246078128'
  // })) {
  //   console.log('Name: ', user.firstName)
  // }
}
