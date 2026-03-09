export default function SignupServerErrorsPage() {
  return (
    <div className="max-w-4xl mx-auto px-6 py-16">
      <div className="mb-8">
        <a href="/recipes" className="text-sm text-gray-500 hover:text-gray-300 transition-colors">
          ← Back to Recipes
        </a>
      </div>

      <div className="mb-12">
        <div className="flex items-center gap-3 mb-4">
          <span className="text-xs font-bold bg-red-500/15 text-red-400 border border-red-500/25 rounded-full px-3 py-1">
            Tier 1 · Must-have
          </span>
          <span className="text-gray-500 text-sm font-mono">Recipe #2</span>
        </div>
        <h1 className="text-3xl font-bold mb-3">Sign Up with Server Validation Errors</h1>
        <p className="text-lg text-gray-400">
          How to return business-logic errors from a server action — duplicate email, taken username, and more — and
          have them appear on the correct fields automatically.
        </p>
      </div>

      {/* Why it matters */}
      <section className="mb-12">
        <h2 className="text-xl font-bold mb-3">Why it matters</h2>
        <p className="text-gray-400 leading-relaxed">
          The login form teaches the happy path. This recipe teaches what actually happens in production: the user
          submits valid data, but the server rejects it because the email is already registered or the username is
          taken. These are business-logic errors that Zod&apos;s schema can&apos;t know about.
        </p>
        <p className="text-gray-400 leading-relaxed mt-3">
          <code>hookform-action</code> has a built-in contract for this: return{" "}
          <code>{`{ errors: { field: string[] } }`}</code> from the action and the hook maps it directly to the
          corresponding React Hook Form fields — no extra wiring needed. This recipe also shows{" "}
          <code>setSubmitError</code> for errors set outside the action, and the <code>onError</code> callback for side
          effects like toasts.
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

const signupSchema = z.object({
  email: z.string().email('Invalid email address'),
  username: z.string().min(3, 'Username must be at least 3 characters'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
})

export const signupAction = withZod(signupSchema, async (data) => {
  // data is typed: { email: string; username: string; password: string }

  // Simulate DB uniqueness checks
  if (data.email === 'taken@example.com') {
    return { errors: { email: ['This email is already registered'] } }
  }

  if (data.username === 'admin') {
    return { errors: { username: ['This username is not available'] } }
  }

  // Multiple field errors at once
  if (data.email.endsWith('@disposable.com')) {
    return {
      errors: {
        email: ['Disposable email addresses are not allowed'],
        username: ['Please use your real name'],
      },
    }
  }

  return { success: true }
})`}</pre>
          </div>
        </div>

        <div className="mb-5">
          <span className="text-xs font-mono text-gray-400 bg-gray-800 px-2 py-0.5 rounded border border-gray-700">
            signup-form.tsx
          </span>
          <div className="code-block mt-2 text-gray-300">
            <pre>{`'use client'
import { useActionForm } from 'hookform-action'
import type { InferActionResult } from 'hookform-action'
import { signupAction } from './actions'

// Infer the exact return type of the action for type-safe access
type SignupResult = InferActionResult<typeof signupAction>

export function SignupForm() {
  const {
    register,
    handleSubmit,
    setSubmitError,
    formState: { errors, isPending, isSubmitSuccessful, actionResult },
  } = useActionForm(signupAction, {
    defaultValues: { email: '', username: '', password: '' },
    onSuccess: (result: SignupResult) => {
      // result.success === true here
      console.log('Account created!')
    },
    onError: (result: SignupResult | Error) => {
      // Fires when field errors are returned OR the action throws
      // Good place for analytics, toast notifications, etc.
      if (result instanceof Error) {
        console.error('Unexpected error:', result.message)
      }
    },
  })

  if (isSubmitSuccessful) {
    return (
      <div className="text-green-400">
        <p>Account created! Check your email to verify.</p>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit()}>
      <div>
        <label htmlFor="email">Email</label>
        <input id="email" type="email" {...register('email')} />
        {/* Shows both Zod client errors AND server errors from the action */}
        {errors.email && <p className="text-red-400">{errors.email.message}</p>}
      </div>

      <div>
        <label htmlFor="username">Username</label>
        <input id="username" {...register('username')} />
        {errors.username && <p className="text-red-400">{errors.username.message}</p>}
      </div>

      <div>
        <label htmlFor="password">Password</label>
        <input id="password" type="password" {...register('password')} />
        {errors.password && <p className="text-red-400">{errors.password.message}</p>}
      </div>

      {/* Optional: surface a global error if the action returns one */}
      {actionResult && 'message' in actionResult && actionResult.message && (
        <p className="text-red-400 text-sm">{actionResult.message}</p>
      )}

      <button type="submit" disabled={isPending}>
        {isPending ? 'Creating account…' : 'Sign Up'}
      </button>
    </form>
  )
}`}</pre>
          </div>
        </div>

        <div className="mb-5">
          <span className="text-xs font-mono text-gray-400 bg-gray-800 px-2 py-0.5 rounded border border-gray-700">
            Using setSubmitError manually
          </span>
          <div className="code-block mt-2 text-gray-300">
            <pre>{`// Sometimes you need to set a server error outside the action response,
// for example after a network check or in an event handler:

const { setSubmitError } = useActionForm(signupAction, { ... })

// Set an error on a specific field programmatically:
setSubmitError('email', 'This email was flagged as invalid by our provider')`}</pre>
          </div>
        </div>
      </section>

      {/* Key Concepts */}
      <section className="mb-12">
        <h2 className="text-xl font-bold mb-4">Key Concepts</h2>
        <div className="space-y-3">
          <div className="bg-gray-900 border border-gray-800 rounded-lg p-4">
            <code className="text-brand-400">{`{ errors: { field: string[] } }`}</code>
            <p className="text-gray-400 text-sm mt-1">
              The default error contract. Return this shape from any action and <code>defaultErrorMapper</code>{" "}
              automatically sets the corresponding RHF field errors. The key is the field name, the value is an array of
              message strings (only the first message is shown by RHF by default).
            </p>
          </div>
          <div className="bg-gray-900 border border-gray-800 rounded-lg p-4">
            <code className="text-brand-400">formState.actionResult</code>
            <p className="text-gray-400 text-sm mt-1">
              The raw return value of the last action call, preserved with full type safety via{" "}
              <code>InferActionResult&lt;typeof action&gt;</code>. Use it to surface global messages or access non-error
              data from the response.
            </p>
          </div>
          <div className="bg-gray-900 border border-gray-800 rounded-lg p-4">
            <code className="text-brand-400">setSubmitError(field, message)</code>
            <p className="text-gray-400 text-sm mt-1">
              Programmatically sets a field error as if it came from the server. Useful for client-side checks that
              happen outside the normal submit flow, such as async email-availability lookups on blur.
            </p>
          </div>
          <div className="bg-gray-900 border border-gray-800 rounded-lg p-4">
            <code className="text-brand-400">onError callback</code>
            <p className="text-gray-400 text-sm mt-1">
              Fires when the action returns field errors <em>or</em> throws an exception. Use it for side effects —
              toast notifications, error logging, analytics — without polluting the action or the component&apos;s
              render logic.
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
              <p className="text-sm font-medium text-gray-200">Server errors don&apos;t clear when the user retypes</p>
              <p className="text-sm text-gray-400 mt-1">
                This is intentional RHF behaviour. A server error set via the error mapper persists until the next
                submit (or until you call <code>clearErrors(field)</code> manually). To clear on input, use{" "}
                <code>validationMode: &apos;onChange&apos;</code> with a client-side schema.
              </p>
            </div>
          </li>
          <li className="flex gap-3 bg-yellow-500/5 border border-yellow-500/20 rounded-lg p-4">
            <span className="text-yellow-400 shrink-0 mt-0.5">⚠</span>
            <div>
              <p className="text-sm font-medium text-gray-200">Distinguishing field errors from global errors</p>
              <p className="text-sm text-gray-400 mt-1">
                The <code>errors</code> object only contains field-level errors from RHF. To display a global error
                message (e.g. &quot;Service unavailable&quot;), read it from <code>actionResult</code> and render it
                separately outside the field markup.
              </p>
            </div>
          </li>
          <li className="flex gap-3 bg-yellow-500/5 border border-yellow-500/20 rounded-lg p-4">
            <span className="text-yellow-400 shrink-0 mt-0.5">⚠</span>
            <div>
              <p className="text-sm font-medium text-gray-200">
                <code>withZod</code> already returns field errors — don&apos;t double-validate
              </p>
              <p className="text-sm text-gray-400 mt-1">
                If the schema fails, <code>withZod</code> short-circuits and returns <code>{`{ errors }`}</code> before
                your handler runs. Do not call <code>schema.safeParse</code> again inside the handler.
              </p>
            </div>
          </li>
        </ul>
      </section>

      {/* Related */}
      <section className="border-t border-gray-800 pt-8">
        <h2 className="text-lg font-semibold mb-4">Related</h2>
        <div className="flex flex-wrap gap-4 text-sm">
          <a href="/recipes/login-form" className="text-brand-400 hover:text-brand-300 transition-colors">
            → Login Form
          </a>
          <a href="/recipes/custom-error-mapper" className="text-brand-400 hover:text-brand-300 transition-colors">
            → Custom Error Mapper
          </a>
          <a href="/examples/validation" className="text-brand-400 hover:text-brand-300 transition-colors">
            → Live Validation Example
          </a>
          <a href="/api-reference" className="text-brand-400 hover:text-brand-300 transition-colors">
            → API Reference
          </a>
        </div>
      </section>
    </div>
  );
}
