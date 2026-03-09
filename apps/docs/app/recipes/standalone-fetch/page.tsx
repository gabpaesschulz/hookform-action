export default function StandaloneFetchPage() {
  return (
    <div className="max-w-4xl mx-auto px-6 py-16">
      <div className="mb-8">
        <a href="/recipes" className="text-sm text-gray-500 hover:text-gray-300 transition-colors">
          ← Back to Recipes
        </a>
      </div>

      <div className="mb-12">
        <div className="flex items-center gap-3 mb-4">
          <span className="text-xs font-bold bg-gray-700/50 text-gray-400 border border-gray-600/50 rounded-full px-3 py-1">
            Tier 3 · Specialized
          </span>
          <span className="text-xs text-emerald-400 font-medium">🚀 Standalone</span>
          <span className="text-gray-500 text-sm font-mono">Recipe #12</span>
        </div>
        <h1 className="text-3xl font-bold mb-3">Standalone — Vite, Remix &amp; Custom APIs</h1>
        <p className="text-lg text-gray-400">
          Use <code>hookform-action-standalone</code> with any async function — <code>fetch</code>,{' '}
          <code>axios</code>, tRPC, or a custom client — in apps that don&apos;t use Next.js Server
          Actions.
        </p>
        <a
          href="/standalone"
          className="inline-flex items-center gap-1 mt-4 text-sm text-emerald-400 hover:text-emerald-300 transition-colors"
        >
          Standalone Guide →
        </a>
      </div>

      {/* Why it matters */}
      <section className="mb-12">
        <h2 className="text-xl font-bold mb-3">Why it matters</h2>
        <p className="text-gray-400 leading-relaxed">
          Not every React app uses Next.js or Server Actions. Vite SPAs, Remix apps, Astro islands,
          and React Native projects all need the same ergonomics — typed validation, automatic error
          mapping, optimistic UI — but with a plain async function as the submit handler.
        </p>
        <p className="text-gray-400 leading-relaxed mt-3">
          The standalone adapter exposes exactly the same hook API. The only difference is: instead
          of passing a Server Action as the first argument, you pass an options object with a{' '}
          <code>submit</code> function. Everything else — <code>schema</code>,{' '}
          <code>optimisticData</code>, <code>persistKey</code>, <code>onSuccess</code>,{' '}
          <code>errorMapper</code> — works identically.
        </p>
      </section>

      {/* Full Example */}
      <section className="mb-12">
        <h2 className="text-xl font-bold mb-6">Full Example — Login Form (Vite SPA)</h2>

        <div className="mb-5">
          <span className="text-xs font-mono text-gray-400 bg-gray-800 px-2 py-0.5 rounded border border-gray-700">
            api.ts — Typed fetch wrapper
          </span>
          <div className="code-block mt-2 text-gray-300">
            <pre>{`// A reusable fetch wrapper that returns a typed result
// (replace with axios, ky, or your preferred client)

export interface LoginResult {
  success?: boolean
  token?: string
  errors?: {
    email?: string[]
    password?: string[]
  }
  message?: string
}

export async function loginApi(data: {
  email: string
  password: string
}): Promise<LoginResult> {
  const res = await fetch('/api/auth/login', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      // Add auth headers here if needed: Authorization: \`Bearer \${token}\`
    },
    body: JSON.stringify(data),
  })

  // Treat non-2xx as a structured error result, not a thrown error
  if (!res.ok) {
    const body = await res.json().catch(() => ({}))
    return {
      errors: body.errors ?? { email: ['Login failed. Please try again.'] },
      message: body.message,
    }
  }

  return res.json()
}`}</pre>
          </div>
        </div>

        <div className="mb-5">
          <span className="text-xs font-mono text-gray-400 bg-gray-800 px-2 py-0.5 rounded border border-gray-700">
            login-form.tsx — Standalone hook usage
          </span>
          <div className="code-block mt-2 text-gray-300">
            <pre>{`import { useActionForm } from 'hookform-action-standalone'
import { z } from 'zod'
import { loginApi, type LoginResult } from './api'

// Client-side validation schema (same as in Next.js)
const loginSchema = z.object({
  email:    z.string().email('Enter a valid email'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
})

export function LoginForm() {
  const {
    register,
    handleSubmit,
    formState: { errors, isPending, isSubmitSuccessful },
  } = useActionForm<{ email: string; password: string }, LoginResult>({
    // Key difference from Next.js: pass an options object with 'submit'
    submit: loginApi,

    defaultValues: { email: '', password: '' },
    schema: loginSchema,
    validationMode: 'onChange',

    onSuccess: (result) => {
      if (result.token) {
        localStorage.setItem('token', result.token)
        window.location.href = '/dashboard'
      }
    },
    onError: (result) => {
      if (result instanceof Error) {
        // toast.error('Network error. Please check your connection.')
      }
    },
  })

  if (isSubmitSuccessful) {
    return <p className="text-green-400">Signed in! Redirecting…</p>
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

        <div className="mb-5">
          <span className="text-xs font-mono text-gray-400 bg-gray-800 px-2 py-0.5 rounded border border-gray-700">
            Bonus — axios variant
          </span>
          <div className="code-block mt-2 text-gray-300">
            <pre>{`import axios from 'axios'

// The submit function can throw — the hook catches it and fires onError
export async function loginApi(data: { email: string; password: string }) {
  try {
    const { data: result } = await axios.post('/api/auth/login', data)
    return result
  } catch (err) {
    if (axios.isAxiosError(err) && err.response) {
      // Return structured errors instead of throwing
      return err.response.data
    }
    throw err  // Re-throw for unexpected errors (network timeout, etc.)
  }
}`}</pre>
          </div>
        </div>
      </section>

      {/* API diff table */}
      <section className="mb-12">
        <h2 className="text-xl font-bold mb-4">Next.js vs Standalone — API Diff</h2>
        <div className="overflow-x-auto">
          <table className="w-full text-sm border-collapse">
            <thead>
              <tr className="border-b border-gray-800">
                <th className="text-left py-2 pr-4 text-gray-400 font-medium">Feature</th>
                <th className="text-left py-2 pr-4 text-brand-400 font-medium">
                  hookform-action (Next.js)
                </th>
                <th className="text-left py-2 text-emerald-400 font-medium">
                  hookform-action-standalone
                </th>
              </tr>
            </thead>
            <tbody className="text-gray-400">
              <tr className="border-b border-gray-800/50">
                <td className="py-2 pr-4 font-mono text-xs">Import</td>
                <td className="py-2 pr-4 font-mono text-xs">hookform-action</td>
                <td className="py-2 font-mono text-xs">hookform-action-standalone</td>
              </tr>
              <tr className="border-b border-gray-800/50">
                <td className="py-2 pr-4 font-mono text-xs">Hook signature</td>
                <td className="py-2 pr-4 font-mono text-xs">useActionForm(action, options?)</td>
                <td className="py-2 font-mono text-xs">
                  useActionForm(&#123; submit, ...options &#125;)
                </td>
              </tr>
              <tr className="border-b border-gray-800/50">
                <td className="py-2 pr-4 font-mono text-xs">formAction</td>
                <td className="py-2 pr-4">✅ Available</td>
                <td className="py-2">❌ Not available</td>
              </tr>
              <tr className="border-b border-gray-800/50">
                <td className="py-2 pr-4 font-mono text-xs">schema / withZod</td>
                <td className="py-2 pr-4">✅ Auto-detected from action</td>
                <td className="py-2">✅ Pass schema option</td>
              </tr>
              <tr className="border-b border-gray-800/50">
                <td className="py-2 pr-4 font-mono text-xs">persistKey</td>
                <td className="py-2 pr-4">✅</td>
                <td className="py-2">✅</td>
              </tr>
              <tr className="border-b border-gray-800/50">
                <td className="py-2 pr-4 font-mono text-xs">optimisticData</td>
                <td className="py-2 pr-4">✅</td>
                <td className="py-2">✅</td>
              </tr>
              <tr>
                <td className="py-2 pr-4 font-mono text-xs">errorMapper</td>
                <td className="py-2 pr-4">✅</td>
                <td className="py-2">✅</td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>

      {/* Key Concepts */}
      <section className="mb-12">
        <h2 className="text-xl font-bold mb-4">Key Concepts</h2>
        <div className="space-y-3">
          <div className="bg-gray-900 border border-gray-800 rounded-lg p-4">
            <code className="text-brand-400">submit: async (data) =&gt; TResult</code>
            <p className="text-gray-400 text-sm mt-1">
              Any async function that receives the validated form data and returns a result. It can
              call <code>fetch</code>, <code>axios</code>, a tRPC procedure, a GraphQL mutation, or
              any other async operation. If it throws, the hook catches it and fires{' '}
              <code>onError</code>.
            </p>
          </div>
          <div className="bg-gray-900 border border-gray-800 rounded-lg p-4">
            <code className="text-brand-400">Structured errors vs thrown errors</code>
            <p className="text-gray-400 text-sm mt-1">
              For HTTP 4xx errors, return a structured result (with <code>errors</code>) instead of
              throwing. This allows the <code>errorMapper</code> to set field errors correctly. Only
              throw for unexpected errors (5xx, network failures) — those trigger{' '}
              <code>onError</code> with an <code>Error</code> instance.
            </p>
          </div>
          <div className="bg-gray-900 border border-gray-800 rounded-lg p-4">
            <code className="text-brand-400">withZod is not used server-side in standalone</code>
            <p className="text-gray-400 text-sm mt-1">
              <code>withZod</code> is a wrapper for Next.js Server Actions. In standalone mode, pass
              the schema via the <code>schema</code> option for client-side validation only.
              Server-side validation must be implemented inside your <code>submit</code> function or
              API handler.
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
              <p className="text-sm font-medium text-gray-200">Throwing on HTTP 4xx errors</p>
              <p className="text-sm text-gray-400 mt-1">
                If your fetch wrapper throws on 4xx, the hook receives an <code>Error</code> — not a
                structured result. The <code>errorMapper</code> won&apos;t fire for thrown errors.
                Return a structured object instead so field errors can be set automatically.
              </p>
            </div>
          </li>
          <li className="flex gap-3 bg-yellow-500/5 border border-yellow-500/20 rounded-lg p-4">
            <span className="text-yellow-400 shrink-0 mt-0.5">⚠</span>
            <div>
              <p className="text-sm font-medium text-gray-200">
                No <code>formAction</code> in standalone
              </p>
              <p className="text-sm text-gray-400 mt-1">
                The standalone adapter does not expose <code>formAction</code> — there is no support
                for the <code>{'<form action={...}>'}</code> pattern without JavaScript. Progressive
                enhancement requires the Next.js adapter.
              </p>
            </div>
          </li>
          <li className="flex gap-3 bg-yellow-500/5 border border-yellow-500/20 rounded-lg p-4">
            <span className="text-yellow-400 shrink-0 mt-0.5">⚠</span>
            <div>
              <p className="text-sm font-medium text-gray-200">
                Inline <code>submit</code> function
              </p>
              <p className="text-sm text-gray-400 mt-1">
                Defining <code>submit</code> as an inline arrow function inside the component
                creates a new reference on every render. Extract it to module scope or wrap with{' '}
                <code>useCallback</code> to avoid re-initialising the hook.
              </p>
            </div>
          </li>
        </ul>
      </section>

      {/* Related */}
      <section className="border-t border-gray-800 pt-8">
        <h2 className="text-lg font-semibold mb-4">Related</h2>
        <div className="flex flex-wrap gap-4 text-sm">
          <a
            href="/standalone"
            className="text-emerald-400 hover:text-emerald-300 transition-colors"
          >
            → Standalone Guide
          </a>
          <a
            href="/recipes/custom-error-mapper"
            className="text-brand-400 hover:text-brand-300 transition-colors"
          >
            → Custom Error Mapper
          </a>
          <a
            href="/recipes/login-form"
            className="text-brand-400 hover:text-brand-300 transition-colors"
          >
            → Login Form (Next.js)
          </a>
          <a
            href="/api-reference"
            className="text-brand-400 hover:text-brand-300 transition-colors"
          >
            → API Reference
          </a>
        </div>
      </section>
    </div>
  )
}
