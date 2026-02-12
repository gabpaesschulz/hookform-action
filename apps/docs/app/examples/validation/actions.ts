'use server'

import { z } from 'zod'

export const signupSchema = z.object({
  username: z
    .string()
    .min(3, 'Username must be at least 3 characters')
    .max(20, 'Username must be at most 20 characters')
    .regex(/^[a-zA-Z0-9_]+$/, 'Only letters, numbers, and underscores'),
  email: z.string().email('Please enter a valid email address'),
  password: z
    .string()
    .min(8, 'Password must be at least 8 characters')
    .regex(/[A-Z]/, 'Must contain an uppercase letter')
    .regex(/[0-9]/, 'Must contain a number'),
})

export async function signupAction(data: z.infer<typeof signupSchema>) {
  // Simulate network delay
  await new Promise((r) => setTimeout(r, 1000))

  // Server-side validation (defense in depth)
  const parsed = signupSchema.safeParse(data)
  if (!parsed.success) {
    return { errors: parsed.error.flatten().fieldErrors }
  }

  // Simulate server-side uniqueness check
  if (parsed.data.username === 'admin') {
    return { errors: { username: ['This username is already taken'] } }
  }

  if (parsed.data.email === 'taken@example.com') {
    return { errors: { email: ['This email is already registered'] } }
  }

  return { success: true }
}
