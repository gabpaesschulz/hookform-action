'use server'

import { withZod } from 'hookform-action-core/with-zod'
import { signupSchema } from './schema'

export const signupAction = withZod(signupSchema, async (data) => {
  // Simulate network delay
  await new Promise((r) => setTimeout(r, 1000))

  // Simulate server-side uniqueness check
  if (data.username === 'admin') {
    return { errors: { username: ['This username is already taken'] } }
  }

  if (data.email === 'taken@example.com') {
    return { errors: { email: ['This email is already registered'] } }
  }

  return { success: true }
})
