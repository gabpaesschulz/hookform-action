import { ValidationForm } from './validation-form'

export const dynamic = 'force-dynamic'

export default function ValidationExamplePage() {
  return (
    <div className="max-w-lg mx-auto px-6 py-16">
      <div className="mb-8">
        <a href="/" className="text-sm text-gray-500 hover:text-gray-300 transition-colors">
          ← Back to docs
        </a>
      </div>

      <div className="flex items-center gap-3 mb-2">
        <h1 className="text-3xl font-bold">Client-Side Validation Example</h1>
        <span className="text-xs font-medium bg-cyan-500/20 text-cyan-400 px-2 py-0.5 rounded-full">
          v2
        </span>
      </div>
      <p className="text-gray-400 mb-8">
        A signup form with <code className="text-brand-400">onChange</code> client-side Zod
        validation. The same schema used on the server validates fields instantly in the browser —
        no duplicate validation logic needed.
      </p>

      <div className="bg-gray-900/50 border border-gray-800 rounded-xl p-8">
        <ValidationForm />
      </div>

      <div className="mt-10">
        <h2 className="text-xl font-semibold mb-4">How It Works</h2>

        <div className="space-y-4 text-sm text-gray-400">
          <div className="flex gap-3 items-start">
            <span className="text-brand-400 font-bold mt-0.5">1.</span>
            <p>
              <code className="text-gray-300">withZod(schema, action)</code> wraps the server action
              and attaches the Zod schema via <code className="text-gray-300">__schema</code>.
            </p>
          </div>
          <div className="flex gap-3 items-start">
            <span className="text-brand-400 font-bold mt-0.5">2.</span>
            <p>
              <code className="text-gray-300">useActionForm</code> auto-detects the attached schema
              and subscribes to field changes with{' '}
              <code className="text-gray-300">form.watch()</code>.
            </p>
          </div>
          <div className="flex gap-3 items-start">
            <span className="text-brand-400 font-bold mt-0.5">3.</span>
            <p>
              In <code className="text-gray-300">onChange</code> mode, every keystroke runs a
              partial <code className="text-gray-300">safeParse</code> and sets/clears field errors
              instantly.
            </p>
          </div>
          <div className="flex gap-3 items-start">
            <span className="text-brand-400 font-bold mt-0.5">4.</span>
            <p>
              On submit, client validation runs first. Only if all fields pass does the server
              action execute, saving a round-trip for obvious errors.
            </p>
          </div>
          <div className="flex gap-3 items-start">
            <span className="text-brand-400 font-bold mt-0.5">5.</span>
            <p>
              Server-side errors (like &quot;username taken&quot;) still come through and are merged
              into RHF&#39;s error state seamlessly.
            </p>
          </div>
        </div>

        <h3 className="text-sm font-medium text-gray-400 mt-8 mb-2">Source Code</h3>
        <div className="code-block text-gray-300">
          <pre>{`'use client'
import { useActionForm } from 'hookform-action'
import { signupAction, signupSchema } from './actions'

export function SignupForm() {
  // Same Zod schema used on both client and server
  const { register, handleSubmit, formState: { errors, isPending } } =
    useActionForm(signupAction, {
      defaultValues: { username: '', email: '', password: '' },
      schema: signupSchema,        // enables client-side validation
      validationMode: 'onChange',   // 'onBlur' | 'onSubmit' also available
    })

  return (
    <form onSubmit={handleSubmit()}>
      <input {...register('username')} />
      {errors.username && <span>{errors.username.message}</span>}

      <input {...register('email')} />
      {errors.email && <span>{errors.email.message}</span>}

      <input {...register('password')} type="password" />
      {errors.password && <span>{errors.password.message}</span>}

      <button disabled={isPending}>Create Account</button>
    </form>
  )
}`}</pre>
        </div>
      </div>
    </div>
  )
}
