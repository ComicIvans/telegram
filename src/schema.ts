import { z } from 'zod'

export const UserSchema = z.object({
  first_name: z.string(),
  last_name: z.string(),
  phone: z.string(),
  username: z.string(),
  tags: z.array(z.string())
})

export type User = z.infer<typeof UserSchema>
