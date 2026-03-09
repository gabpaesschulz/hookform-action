export default function CustomErrorMapperPage() {
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
          <span className="text-gray-500 text-sm font-mono">Recipe #11</span>
        </div>
        <h1 className="text-3xl font-bold mb-3">Custom Error Mapper</h1>
        <p className="text-lg text-gray-400">
          When your API returns errors in a format different from the default{' '}
          <code>{'{ errors: { field: string[] } }'}</code>, use a custom <code>errorMapper</code> to
          translate them into React Hook Form field errors automatically.
        </p>
      </div>

      {/* Why it matters */}
      <section className="mb-12">
        <h2 className="text-xl font-bold mb-3">Why it matters</h2>
        <p className="text-gray-400 leading-relaxed">
          APIs designed before this library existed — Laravel backends, Rails APIs, external REST
          services, tRPC procedures — rarely return errors in the{' '}
          <code>{'{ errors: { field: string[] } }'}</code> format that{' '}
          <code>defaultErrorMapper</code> expects. Without a custom mapper, the hook cannot
          automatically set field errors and you end up writing manual <code>setSubmitError</code>{' '}
          calls all over your form components.
        </p>
        <p className="text-gray-400 leading-relaxed mt-3">
          The <code>errorMapper</code> option is a pure function defined once per form (or shared
          across forms hitting the same API). It receives the raw action result and returns a{' '}
          <code>FieldErrorRecord</code> that the hook applies to the correct fields automatically.
        </p>
      </section>

      {/* Full Example */}
      <section className="mb-12">
        <h2 className="text-xl font-bold mb-6">Full Example — Laravel-style errors</h2>

        <div className="mb-5">
          <div className="bg-gray-900 border border-gray-800 rounded-lg p-4 mb-4">
            <p className="text-sm text-gray-400 mb-2">
              <span className="text-gray-200 font-medium">The external API returns:</span>
            </p>
            <pre className="text-gray-300 text-sm">{`{
  "message": "The given data was invalid.",
  "errors": {
    "email": ["The email has already been taken.", "Must be a valid email."],
    "password": ["The password must be at least 8 characters."]
  }
}`}</pre>
            <p className="text-sm text-gray-500 mt-2">
              (Laravel-style — the <code>errors</code> values are arrays of strings, which happens
              to match the default format. The next example shows a stricter mismatch.)
            </p>
          </div>
        </div>

        <div className="mb-5">
          <span className="text-xs font-mono text-gray-400 bg-gray-800 px-2 py-0.5 rounded border border-gray-700">
            Example 1 — Laravel / Rails (arrays of strings)
          </span>
          <div className="code-block mt-2 text-gray-300">
            <pre>{`'use client'
import { useActionForm } from 'hookform-action-standalone'
import type { FieldErrorRecord } from 'hookform-action-core'
import { submitRegistrationForm } from './api'

// This API shape matches the default exactly — no custom mapper needed!
// { errors: { field: string[] } }
export function RegistrationForm() {
  const { register, handleSubmit, formState: { errors, isPending } } =
    useActionForm({
      submit: submitRegistrationForm,
      defaultValues: { email: '', password: '', name: '' },
      // defaultErrorMapper handles this format automatically
    })
  // ...
}`}</pre>
          </div>
        </div>

        <div className="mb-5">
          <div className="bg-gray-900 border border-gray-800 rounded-lg p-4 mb-4">
            <p className="text-sm text-gray-400 mb-2">
              <span className="text-gray-200 font-medium">
                A non-standard API (object-per-error format):
              </span>
            </p>
            <pre className="text-gray-300 text-sm">{`{
  "fieldErrors": {
    "email": [{ "message": "Already taken", "code": "DUPLICATE" }],
    "name":  [{ "message": "Too short", "code": "MIN_LENGTH" }]
  },
  "globalError": "Validation failed"
}`}</pre>
          </div>
        </div>

        <div className="mb-5">
          <span className="text-xs font-mono text-gray-400 bg-gray-800 px-2 py-0.5 rounded border border-gray-700">
            error-mapper.ts — Shared mapper for this API
          </span>
          <div className="code-block mt-2 text-gray-300">
            <pre>{`import type { FieldErrorRecord } from 'hookform-action-core'

interface ApiError {
  fieldErrors?: Record<string, Array<{ message: string; code: string }>>
  globalError?: string
}

// Define outside components for stability (no re-renders)
export function apiErrorMapper(result: unknown): FieldErrorRecord | null {
  if (!result || typeof result !== 'object') return null
  const r = result as ApiError

  if (!r.fieldErrors) return null

  const mapped: FieldErrorRecord = {}
  for (const [field, errs] of Object.entries(r.fieldErrors)) {
    // Extract just the message strings
    mapped[field] = errs.map((e) => e.message)
  }

  return Object.keys(mapped).length > 0 ? mapped : null
}`}</pre>
          </div>
        </div>

        <div className="mb-5">
          <span className="text-xs font-mono text-gray-400 bg-gray-800 px-2 py-0.5 rounded border border-gray-700">
            registration-form.tsx — Using the custom mapper
          </span>
          <div className="code-block mt-2 text-gray-300">
            <pre>{`'use client'
import { useActionForm } from 'hookform-action-standalone'
import { apiErrorMapper } from './error-mapper'
import { submitRegistrationForm } from './api'

interface ApiResult {
  fieldErrors?: Record<string, Array<{ message: string; code: string }>>
  globalError?: string
  userId?: string
}

export function RegistrationForm() {
  const {
    register,
    handleSubmit,
    formState: { errors, isPending, isSubmitSuccessful, actionResult },
  } = useActionForm<{ email: string; name: string; password: string }, ApiResult>({
    submit: submitRegistrationForm,
    defaultValues: { email: '', name: '', password: '' },

    // Plug in the custom mapper — runs after every action call
    errorMapper: apiErrorMapper,

    onError: (result) => {
      // Still fires even with custom mapper, good for toasts
      if (result instanceof Error) {
        console.error('Network error:', result.message)
      } else if (result.globalError) {
        // toast.error(result.globalError)
      }
    },
  })

  return (
    <form onSubmit={handleSubmit()}>
      <div>
        <label>Email</label>
        <input type="email" {...register('email')} />
        {/* Errors from apiErrorMapper appear here automatically */}
        {errors.email && <p className="text-red-400">{errors.email.message}</p>}
      </div>

      <div>
        <label>Name</label>
        <input {...register('name')} />
        {errors.name && <p className="text-red-400">{errors.name.message}</p>}
      </div>

      <div>
        <label>Password</label>
        <input type="password" {...register('password')} />
        {errors.password && <p className="text-red-400">{errors.password.message}</p>}
      </div>

      {/* Show global error from actionResult */}
      {actionResult?.globalError && (
        <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-3 text-sm text-red-400">
          {actionResult.globalError}
        </div>
      )}

      <button type="submit" disabled={isPending}>
        {isPending ? 'Registering…' : 'Create Account'}
      </button>
    </form>
  )
}`}</pre>
          </div>
        </div>
      </section>

      {/* Key Concepts */}
      <section className="mb-12">
        <h2 className="text-xl font-bold mb-4">Key Concepts</h2>
        <div className="space-y-3">
          <div className="bg-gray-900 border border-gray-800 rounded-lg p-4">
            <code className="text-brand-400">
              errorMapper: (result) =&gt; FieldErrorRecord | null
            </code>
            <p className="text-gray-400 text-sm mt-1">
              A pure function that receives the raw action result (typed as <code>TResult</code>)
              and returns a <code>FieldErrorRecord</code> — a{' '}
              <code>Record&lt;string, string[] | undefined&gt;</code>. Return <code>null</code> or{' '}
              <code>undefined</code> when there are no errors. The hook calls <code>setError</code>{' '}
              on each field automatically.
            </p>
          </div>
          <div className="bg-gray-900 border border-gray-800 rounded-lg p-4">
            <code className="text-brand-400">Define mapper outside the component</code>
            <p className="text-gray-400 text-sm mt-1">
              The <code>errorMapper</code> is compared by reference between renders. An inline arrow
              function creates a new reference every time, causing the hook to re-run unnecessarily.
              Define it at module scope or wrap with <code>useCallback</code>.
            </p>
          </div>
          <div className="bg-gray-900 border border-gray-800 rounded-lg p-4">
            <code className="text-brand-400">Global errors via actionResult</code>
            <p className="text-gray-400 text-sm mt-1">
              Errors that cannot be mapped to a specific field (e.g. &quot;service
              unavailable&quot;) should be read from <code>formState.actionResult</code> and
              rendered separately — not through the field error system.
            </p>
          </div>
          <div className="bg-gray-900 border border-gray-800 rounded-lg p-4">
            <code className="text-brand-400">Composing with defaultErrorMapper</code>
            <p className="text-gray-400 text-sm mt-1">
              You can import and call <code>defaultErrorMapper</code> inside your custom mapper as a
              fallback for fields that already match the default format, and only override the
              fields that don&apos;t.
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
                Returning an empty object <code>{'{}'}</code> instead of <code>null</code>
              </p>
              <p className="text-sm text-gray-400 mt-1">
                The hook checks if the returned object is truthy and has keys. An empty object{' '}
                <code>{'{}'}</code> is truthy, but all its field lookups return{' '}
                <code>undefined</code>. Return <code>null</code> or <code>undefined</code>{' '}
                explicitly when there are no errors to map.
              </p>
            </div>
          </li>
          <li className="flex gap-3 bg-yellow-500/5 border border-yellow-500/20 rounded-lg p-4">
            <span className="text-yellow-400 shrink-0 mt-0.5">⚠</span>
            <div>
              <p className="text-sm font-medium text-gray-200">
                Inline arrow function as <code>errorMapper</code>
              </p>
              <p className="text-sm text-gray-400 mt-1">
                <code>{'errorMapper: (r) => ...'}</code> creates a new function on every render.
                Since the hook uses it as a dependency, this can cause performance issues. Always
                define the mapper at module scope.
              </p>
            </div>
          </li>
          <li className="flex gap-3 bg-yellow-500/5 border border-yellow-500/20 rounded-lg p-4">
            <span className="text-yellow-400 shrink-0 mt-0.5">⚠</span>
            <div>
              <p className="text-sm font-medium text-gray-200">
                Mapper receives the result even on success
              </p>
              <p className="text-sm text-gray-400 mt-1">
                <code>errorMapper</code> is called after every action invocation, including
                successful ones. Always add a guard (e.g. check for the presence of an error key)
                and return <code>null</code> for success responses.
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
            href="/recipes/signup-server-errors"
            className="text-brand-400 hover:text-brand-300 transition-colors"
          >
            → Sign Up with Server Errors
          </a>
          <a
            href="/recipes/standalone-fetch"
            className="text-brand-400 hover:text-brand-300 transition-colors"
          >
            → Standalone — Fetch &amp; Custom APIs
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
