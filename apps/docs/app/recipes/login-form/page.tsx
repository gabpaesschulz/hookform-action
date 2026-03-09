export default function LoginFormRecipePage() {
  return (
    <div className="max-w-4xl mx-auto px-6 py-16">
      {/* Back */}
      <div className="mb-8">
        <a href="/recipes" className="text-sm text-gray-500 hover:text-gray-300 transition-colors">
          ← Back to Recipes
        </a>
      </div>

      {/* Header */}
      <div className="mb-12">
        <div className="flex items-center gap-3 mb-4">
          <span className="text-xs font-bold bg-red-500/15 text-red-400 border border-red-500/25 rounded-full px-3 py-1">
            Tier 1 · Must-have
          </span>
          <span className="text-gray-500 text-sm font-mono">Recipe #1</span>
        </div>
        <h1 className="text-3xl font-bold mb-3">Login Form</h1>
        <p className="text-lg text-gray-400">
          The foundation pattern. Learn how <code>withZod</code>, <code>useActionForm</code>, and error display all fit
          together before moving to more complex recipes.
        </p>
        <a
          href="/examples/login"
          className="inline-flex items-center gap-1 mt-4 text-sm text-brand-400 hover:text-brand-300 transition-colors"
        >
          See live demo →
        </a>
      </div>

      {/* Why it matters */}
      <section className="mb-12">
        <h2 className="text-xl font-bold mb-3">Why it matters</h2>
        <p className="text-gray-400 leading-relaxed">
          The login form is the first form every developer builds with this library. It establishes the core mental
          model: a typed server action wrapped with <code>withZod</code>, a client component calling{" "}
          <code>useActionForm</code>, and a clean pattern for displaying both client-side validation errors and
          server-side errors on the same fields.
        </p>
        <p className="text-gray-400 leading-relaxed mt-3">
          Getting this right means understanding the difference between <code>isSubmitting</code> and{" "}
          <code>isPending</code>, knowing that <code>withZod</code> auto-attaches the schema for client-side inference,
          and handling the two typical success flows — redirect or in-place success state.
        </p>
      </section>

      {/* Full Example */}
      <section className="mb-12">
        <h2 className="text-xl font-bold mb-6">Full Example</h2>

        <div className="mb-5">
          <span className="text-xs font-mono text-gray-400 bg-gray-800 px-2 py-0.5 rounded border border-gray-700">
            actions.ts
          </span>
          <div className="code-block mt-2 text-gray-300">
            <pre>{`'use server'
import { z } from 'zod'
import { withZod } from 'hookform-action-core/with-zod'

const loginSchema = z.object({
  email: z.string().email('Please enter a valid email'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
})

export const loginAction = withZod(loginSchema, async (data) => {
  // data is fully typed: { email: string; password: string }

  // Simulate a credentials check
  if (data.email === 'wrong@example.com') {
    return { errors: { email: ['Invalid credentials'] } }
  }

  // On success: return { success: true } or call redirect()
  return { success: true }
})`}</pre>
          </div>
        </div>

        <div className="mb-5">
          <span className="text-xs font-mono text-gray-400 bg-gray-800 px-2 py-0.5 rounded border border-gray-700">
            login-form.tsx
          </span>
          <div className="code-block mt-2 text-gray-300">
            <pre>{`'use client'
import { useActionForm } from 'hookform-action'
import { loginAction } from './actions'

export function LoginForm() {
  const {
    register,
    handleSubmit,
    formState: { errors, isPending, isSubmitSuccessful },
  } = useActionForm(loginAction, {
    defaultValues: { email: '', password: '' },
  })

  if (isSubmitSuccessful) {
    return <p className="text-green-400">Login successful! Redirecting...</p>
  }

  return (
    <form onSubmit={handleSubmit()}>
      <div>
        <label htmlFor="email">Email</label>
        <input id="email" type="email" {...register('email')} />
        {errors.email && <p className="text-red-400">{errors.email.message}</p>}
      </div>

      <div>
        <label htmlFor="password">Password</label>
        <input id="password" type="password" {...register('password')} />
        {errors.password && <p className="text-red-400">{errors.password.message}</p>}
      </div>

      <button type="submit" disabled={isPending}>
        {isPending ? 'Signing in…' : 'Sign In'}
      </button>
    </form>
  )
}`}</pre>
          </div>
        </div>

        <div className="bg-blue-500/5 border border-blue-500/20 rounded-lg p-4 text-sm text-gray-400">
          <span className="text-blue-400 font-medium">Next.js redirect variant: </span>
          call <code>redirect(&apos;/dashboard&apos;)</code> from <code>next/navigation</code> inside{" "}
          <code>withZod</code>. The hook treats the thrown redirect as a successful submission —{" "}
          <code>isSubmitSuccessful</code> will be <code>true</code>, but the page will navigate away before you can
          render a success state.
        </div>
      </section>

      {/* Key Concepts */}
      <section className="mb-12">
        <h2 className="text-xl font-bold mb-4">Key Concepts</h2>
        <div className="space-y-3">
          <div className="bg-gray-900 border border-gray-800 rounded-lg p-4">
            <code className="text-brand-400">withZod(schema, handler)</code>
            <p className="text-gray-400 text-sm mt-1">
              Wraps the server action and attaches the Zod schema as <code>action.__schema</code>.{" "}
              <code>useActionForm</code> reads it automatically for client-side validation. On validation failure,
              returns <code>{`{ errors: { field: string[] } }`}</code> without ever calling the handler.
            </p>
          </div>
          <div className="bg-gray-900 border border-gray-800 rounded-lg p-4">
            <code className="text-brand-400">isPending vs isSubmitting</code>
            <p className="text-gray-400 text-sm mt-1">
              <code>isPending</code> reflects React&apos;s <code>useTransition</code> — it stays <code>true</code> for
              the full async round-trip to the server. Use it to disable the submit button. <code>isSubmitting</code> is
              the synchronous RHF snapshot and may not cover the full window in Next.js transitions.
            </p>
          </div>
          <div className="bg-gray-900 border border-gray-800 rounded-lg p-4">
            <code className="text-brand-400">handleSubmit()</code>
            <p className="text-gray-400 text-sm mt-1">
              Called with no arguments to get the submit handler: <code>{"<form onSubmit={handleSubmit()}>"}</code>.
              Optionally pass an <code>onValid</code> callback that runs with typed data before the action is called:{" "}
              <code>{"handleSubmit((data) => console.log(data))"}</code>.
            </p>
          </div>
          <div className="bg-gray-900 border border-gray-800 rounded-lg p-4">
            <code className="text-brand-400">defaultValues</code>
            <p className="text-gray-400 text-sm mt-1">
              Always provide <code>defaultValues</code>. Without them, RHF initialises fields as <code>undefined</code>,
              which causes React&apos;s uncontrolled-to-controlled warning when the user starts typing, and breaks
              dirty-field tracking.
            </p>
          </div>
        </div>
      </section>

      {/* Pitfalls */}
      <section className="mb-12">
        <h2 className="text-xl font-bold mb-4">⚠️ Pitfalls</h2>
        <ul className="space-y-3">
          <li className="flex gap-3 bg-yellow-500/5 border border-yellow-500/20 rounded-lg p-4">
            <span className="text-yellow-400 shrink-0 mt-0.5">⚠</span>
            <div>
              <p className="text-sm font-medium text-gray-200">
                Using <code>isSubmitting</code> to disable the button
              </p>
              <p className="text-sm text-gray-400 mt-1">
                Use <code>isPending</code> instead. In Next.js the action runs inside a transition, and{" "}
                <code>isSubmitting</code> may revert to <code>false</code> before the server response arrives.
              </p>
            </div>
          </li>
          <li className="flex gap-3 bg-yellow-500/5 border border-yellow-500/20 rounded-lg p-4">
            <span className="text-yellow-400 shrink-0 mt-0.5">⚠</span>
            <div>
              <p className="text-sm font-medium text-gray-200">
                Calling <code>redirect()</code> and also returning <code>success: true</code>
              </p>
              <p className="text-sm text-gray-400 mt-1">
                <code>redirect()</code> throws internally — the return statement is unreachable. Choose one: either
                redirect or return a result. Doing both is dead code.
              </p>
            </div>
          </li>
          <li className="flex gap-3 bg-yellow-500/5 border border-yellow-500/20 rounded-lg p-4">
            <span className="text-yellow-400 shrink-0 mt-0.5">⚠</span>
            <div>
              <p className="text-sm font-medium text-gray-200">
                Returning errors outside the <code>{`{ errors: { field: string[] } }`}</code> shape
              </p>
              <p className="text-sm text-gray-400 mt-1">
                The default <code>errorMapper</code> only recognises that exact shape. If your action returns a
                different format, use a custom <code>errorMapper</code> — see{" "}
                <a href="/recipes/custom-error-mapper" className="text-brand-400 hover:underline">
                  Recipe #11
                </a>
                .
              </p>
            </div>
          </li>
        </ul>
      </section>

      {/* Related */}
      <section className="border-t border-gray-800 pt-8">
        <h2 className="text-lg font-semibold mb-4">Related</h2>
        <div className="flex flex-wrap gap-4 text-sm">
          <a href="/recipes/signup-server-errors" className="text-brand-400 hover:text-brand-300 transition-colors">
            → Sign Up with Server Errors
          </a>
          <a href="/recipes/reset-after-success" className="text-brand-400 hover:text-brand-300 transition-colors">
            → Reset After Success
          </a>
          <a href="/examples/login" className="text-brand-400 hover:text-brand-300 transition-colors">
            → Live Example
          </a>
          <a href="/api-reference" className="text-brand-400 hover:text-brand-300 transition-colors">
            → API Reference
          </a>
        </div>
      </section>
    </div>
  );
}
