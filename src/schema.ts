import { z } from 'zod'

export const UserSchema = z.object({
  firstName: z.string(),
  lastName: z.string(),
  phone: z.string(),
  username: z.string(),
  tags: z.array(z.string())
})

export type BasicUser = z.infer<typeof UserSchema>

export type User = BasicUser & {
  id: bigInt.BigInteger | null
  photo: string | null
  selected: boolean
  failedTelegram: boolean
  telegramError: string
}

export type FoundUser = BasicUser & {
  id: bigInt.BigInteger
  photo: string | null
  chats: bigInt.BigInteger[]
}

export type Chat = {
  id: bigInt.BigInteger
  title: string
  type: 'Grupo' | 'Canal' | 'Desconocido'
  photo: string | null
  isAdmin: boolean
  selected: boolean
  tags: string[]
}

type ChatAction = 'none' | 'add' | 'remove'
type ChatStatus = 'info' | 'warning' | 'error' | 'success' | 'loading'

export type AdminChatParticipant = {
  id: string
  action?: ChatAction
  status: ChatStatus
}

export type AdminChat = {
  id: bigInt.BigInteger
  title: string
  type: 'Grupo' | 'Canal' | 'Desconocido'
  photo: string | null
  participants: bigInt.BigInteger[]
  tags: string[]
}
