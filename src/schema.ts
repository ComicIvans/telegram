import { z } from 'zod'

export const UserSchema = z.object({
  firstName: z.string(),
  lastName: z.string(),
  phone: z.string(),
  username: z.string(),
  tags: z.array(z.string())
})

export type User = z.infer<typeof UserSchema>

export type Chat = {
  id: bigInt.BigInteger
  title: string
  type: 'Grupo' | 'Canal' | 'Desconocido'
  photo: string | null
  canAddUsersAsAdmin: boolean
  canAddUsersAsUser: boolean
  participants: bigInt.BigInteger[] | null
  selected: boolean
  tags: string[]
}
