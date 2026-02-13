import { LoginForm } from './login-form'

export const dynamic = 'force-dynamic'

export default function LoginExamplePage() {
  return (
    <div className="max-w-lg mx-auto px-6 py-16">
      <div className="mb-8">
        <a href="/" className="text-sm text-gray-500 hover:text-gray-300 transition-colors">
          ← Back to docs
        </a>
      </div>

      <h1 className="text-3xl font-bold mb-2">Login Form Example</h1>
      <p className="text-gray-400 mb-8">
        A simple login form using <code className="text-brand-400">useActionForm</code> with
        automatic Zod error mapping from the server action.
      </p>

      <div className="bg-gray-900/50 border border-gray-800 rounded-xl p-8">
        <LoginForm />
      </div>

      <div className="mt-10">
        <h2 className="text-xl font-semibold mb-4">Source Code</h2>

        <h3 className="text-sm font-medium text-gray-400 mb-2">Server Action</h3>
        <div className="code-block mb-6 text-gray-300">
          <pre>{`'use server'
import { z } from 'zod'

const loginSchema = z.object({
  email: z.string().email('Please enter a valid email'),
  password: z.string().min(8, 'Min 8 characters'),
})

export async function loginAction(data: z.infer<typeof loginSchema>) {
  await new Promise(r => setTimeout(r, 1000)) // simulate delay

  const parsed = loginSchema.safeParse(data)
  if (!parsed.success) {
    return { errors: parsed.error.flatten().fieldErrors }
  }

  if (parsed.data.email === 'taken@example.com') {
    return { errors: { email: ['Already registered'] } }
  }

  return { success: true }
}`}</pre>
        </div>

        <h3 className="text-sm font-medium text-gray-400 mb-2">Client Component</h3>
        <div className="code-block text-gray-300">
          <pre>{`'use client'
import { useActionForm } from 'hookform-action'
import { loginAction } from './actions'

export function LoginForm() {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting, isSubmitSuccessful },
  } = useActionForm(loginAction, {
    defaultValues: { email: '', password: '' },
  })

  if (isSubmitSuccessful) return <p>✓ Logged in!</p>

  return (
    <form onSubmit={handleSubmit()}>
      <input {...register('email')} />
      {errors.email && <span>{errors.email.message}</span>}

      <input {...register('password')} type="password" />
      {errors.password && <span>{errors.password.message}</span>}

      <button disabled={isSubmitting}>
        {isSubmitting ? 'Signing in...' : 'Sign In'}
      </button>
    </form>
  )
}`}</pre>
        </div>
      </div>
    </div>
  )
}
