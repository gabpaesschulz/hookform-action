'use server'

import { z } from 'zod'

const wizardSchema = z.object({
  // Step 1
  firstName: z.string().min(2, 'First name must be at least 2 characters'),
  lastName: z.string().min(2, 'Last name must be at least 2 characters'),
  email: z.string().email('Please enter a valid email'),
  // Step 2
  company: z.string().min(1, 'Company is required'),
  role: z.string().min(1, 'Role is required'),
  // Step 3
  plan: z.enum(['free', 'pro', 'enterprise'], {
    errorMap: () => ({ message: 'Please select a plan' }),
  }),
  agreeToTerms: z.literal('true', {
    errorMap: () => ({ message: 'You must agree to the terms' }),
  }),
})

export async function wizardAction(data: z.infer<typeof wizardSchema>) {
  await new Promise((r) => setTimeout(r, 1500))

  const parsed = wizardSchema.safeParse(data)

  if (!parsed.success) {
    return { errors: parsed.error.flatten().fieldErrors }
  }

  // Simulate: email already in use
  if (parsed.data.email === 'taken@example.com') {
    return { errors: { email: ['This email is already registered'] } }
  }

  return { success: true, data: parsed.data }
}
