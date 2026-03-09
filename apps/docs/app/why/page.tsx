export default function WhyPage() {
  return (
    <div className="max-w-4xl mx-auto px-6 py-16">
      <div className="mb-8">
        <a href="/" className="text-sm text-gray-500 hover:text-gray-300 transition-colors">
          ← Back to docs
        </a>
      </div>

      <h1 className="text-4xl font-extrabold mb-4">Manual setup vs hookform-action</h1>
      <p className="text-gray-400 text-lg mb-16 max-w-2xl">
        A concrete comparison of wiring React Hook Form with Server Actions by hand, versus using{" "}
        <code>hookform-action</code> as the integration layer.
      </p>

      {/* ------------------------------------------------------------------ */}
      {/* 1. Comparison table                                                 */}
      {/* ------------------------------------------------------------------ */}
      <section className="mb-20">
        <h2 className="text-2xl font-bold mb-2">Feature comparison</h2>
        <p className="text-gray-500 text-sm mb-6">
          Each row maps to real code you either write yourself or get for free.
        </p>
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left border-collapse">
            <thead>
              <tr className="border-b border-gray-800 text-gray-400">
                <th className="py-3 pr-6 font-semibold">Concern</th>
                <th className="py-3 pr-6 font-semibold text-red-400">Manual</th>
                <th className="py-3 font-semibold text-brand-400">hookform-action</th>
              </tr>
            </thead>
            <tbody className="text-gray-300 divide-y divide-gray-800/60">
              <tr>
                <td className="py-3.5 pr-6 font-medium">Server-side Zod validation</td>
                <td className="py-3.5 pr-6 text-gray-400">
                  Write <code>schema.safeParse()</code> + format errors in every action
                </td>
                <td className="py-3.5 text-gray-300">
                  <code>withZod(schema, handler)</code> — one wrapper, done
                </td>
              </tr>
              <tr>
                <td className="py-3.5 pr-6 font-medium">Error mapping to RHF fields</td>
                <td className="py-3.5 pr-6 text-gray-400">
                  Call <code>setError()</code> for each field after parsing the action result
                </td>
                <td className="py-3.5 text-gray-300">
                  Automatic via <code>defaultErrorMapper</code> — override with <code>errorMapper</code> when needed
                </td>
              </tr>
              <tr>
                <td className="py-3.5 pr-6 font-medium">Client-side validation</td>
                <td className="py-3.5 pr-6 text-gray-400">
                  Pass <code>resolver</code> to <code>useForm</code> and keep schema in sync with server
                </td>
                <td className="py-3.5 text-gray-300">
                  Set <code>validationMode</code> — schema auto-detected from <code>withZod</code>
                </td>
              </tr>
              <tr>
                <td className="py-3.5 pr-6 font-medium">Pending / loading state</td>
                <td className="py-3.5 pr-6 text-gray-400">
                  <code>useTransition</code> + <code>useState</code> wiring around <code>startTransition</code>
                </td>
                <td className="py-3.5 text-gray-300">
                  <code>formState.isPending</code> backed by <code>useTransition</code> internally
                </td>
              </tr>
              <tr>
                <td className="py-3.5 pr-6 font-medium">Optimistic UI</td>
                <td className="py-3.5 pr-6 text-gray-400">
                  <code>useOptimistic</code> + <code>useTransition</code> + manual rollback logic
                </td>
                <td className="py-3.5 text-gray-300">
                  <code>optimisticData</code> option — hook handles pending state and rollback
                </td>
              </tr>
              <tr>
                <td className="py-3.5 pr-6 font-medium">Multi-step persistence</td>
                <td className="py-3.5 pr-6 text-gray-400">
                  Custom <code>useEffect</code> + <code>sessionStorage</code> reads/writes per step
                </td>
                <td className="py-3.5 text-gray-300">
                  <code>persistKey</code> option — debounced, SSR-safe, clears on success
                </td>
              </tr>
              <tr>
                <td className="py-3.5 pr-6 font-medium">FormData support</td>
                <td className="py-3.5 pr-6 text-gray-400">
                  Detect action arity and convert <code>FormData</code> to object manually
                </td>
                <td className="py-3.5 text-gray-300">
                  Detected automatically via action arity — <code>withZod</code> handles conversion
                </td>
              </tr>
              <tr>
                <td className="py-3.5 pr-6 font-medium">Success / error callbacks</td>
                <td className="py-3.5 pr-6 text-gray-400">
                  Inline <code>.then()</code>/<code>.catch()</code> chains after calling the action
                </td>
                <td className="py-3.5 text-gray-300">
                  <code>onSuccess</code> / <code>onError</code> options
                </td>
              </tr>
              <tr>
                <td className="py-3.5 pr-6 font-medium">Debug tooling</td>
                <td className="py-3.5 pr-6 text-gray-400">RHF DevTools (state only)</td>
                <td className="py-3.5 text-gray-300">
                  <code>hookform-action-devtools</code> — full submission history + form state panel
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>

      {/* ------------------------------------------------------------------ */}
      {/* 2. Workflow comparison                                               */}
      {/* ------------------------------------------------------------------ */}
      <section className="mb-20">
        <h2 className="text-2xl font-bold mb-6">Workflow comparison</h2>
        <div className="grid sm:grid-cols-2 gap-6">
          {/* Manual */}
          <div className="border border-red-800/40 bg-red-950/10 rounded-xl p-6">
            <h3 className="text-base font-semibold text-red-400 mb-4">Manual — steps per form</h3>
            <ol className="space-y-3 text-sm text-gray-300 list-decimal list-inside marker:text-red-600">
              <li>Define Zod schema in a shared module</li>
              <li>
                Pass <code>zodResolver(schema)</code> to <code>useForm</code>
              </li>
              <li>
                In the Server Action: call <code>schema.safeParse(data)</code>, format <code>fieldErrors</code>, return
                them
              </li>
              <li>
                In the component: inspect action result, loop over errors, call <code>setError(field, …)</code> for each
              </li>
              <li>
                Wire <code>useTransition</code> around the action call to get <code>isPending</code>
              </li>
              <li>
                If you need optimistic UI: add <code>useOptimistic</code>, compute next state, pass to{" "}
                <code>startTransition</code>, handle rollback
              </li>
              <li>
                If you need persistence: write a <code>useEffect</code> to save/restore from <code>sessionStorage</code>
                , debounce it, clear on unmount
              </li>
            </ol>
            <p className="mt-4 text-xs text-red-400/70">Each new form repeats steps 3–7 from scratch.</p>
          </div>

          {/* hookform-action */}
          <div className="border border-brand-700/40 bg-brand-950/10 rounded-xl p-6">
            <h3 className="text-base font-semibold text-brand-400 mb-4">hookform-action — steps per form</h3>
            <ol className="space-y-3 text-sm text-gray-300 list-decimal list-inside marker:text-brand-600">
              <li>
                Wrap server action with <code>withZod(schema, handler)</code>
              </li>
              <li>
                Call <code>useActionForm(action, options)</code> in the component
              </li>
              <li>
                Use <code>register</code>, <code>handleSubmit()</code>, and <code>formState.errors</code> as you
                normally would with RHF
              </li>
            </ol>
            <p className="mt-4 text-xs text-brand-400/70">
              Steps 4–7 from the manual list become opt-in options: <code>validationMode</code>,{" "}
              <code>optimisticData</code>, <code>persistKey</code>.
            </p>
          </div>
        </div>
      </section>

      {/* ------------------------------------------------------------------ */}
      {/* 3. Side-by-side code                                                */}
      {/* ------------------------------------------------------------------ */}
      <section className="mb-20">
        <h2 className="text-2xl font-bold mb-2">Code comparison — Login form</h2>
        <p className="text-gray-500 text-sm mb-8">
          Same feature set: server validation, automatic error display, pending state.
        </p>

        {/* Server Action */}
        <h3 className="text-base font-semibold text-gray-300 mb-3">
          <span className="text-gray-500">01 /</span> Server Action
        </h3>
        <div className="grid sm:grid-cols-2 gap-4 mb-10">
          <div>
            <p className="text-xs text-red-400 font-medium mb-2 uppercase tracking-widest">Manual</p>
            <div className="code-block text-gray-300 text-xs leading-relaxed">
              <pre>{`// actions.ts
'use server'
import { z } from 'zod'

const schema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
})

export async function loginAction(data: unknown) {
  const parsed = schema.safeParse(data)

  if (!parsed.success) {
    // Must manually format Zod errors
    // every time, in every action
    return {
      errors: parsed.error.flatten().fieldErrors,
    }
  }

  const user = await authenticate(parsed.data)
  if (!user) {
    return { errors: { email: ['Invalid credentials'] } }
  }

  return { success: true }
}`}</pre>
            </div>
          </div>
          <div>
            <p className="text-xs text-brand-400 font-medium mb-2 uppercase tracking-widest">hookform-action</p>
            <div className="code-block text-gray-300 text-xs leading-relaxed">
              <pre>{`// actions.ts
'use server'
import { z } from 'zod'
import { withZod } from 'hookform-action-core/with-zod'

const schema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
})

export const loginAction = withZod(
  schema,
  // handler only runs if validation passes
  // data is fully typed — no casts needed
  async (data) => {
    const user = await authenticate(data)
    if (!user) {
      return { errors: { email: ['Invalid credentials'] } }
    }
    return { success: true }
  }
)`}</pre>
            </div>
          </div>
        </div>

        {/* Client component */}
        <h3 className="text-base font-semibold text-gray-300 mb-3">
          <span className="text-gray-500">02 /</span> Client component
        </h3>
        <div className="grid sm:grid-cols-2 gap-4">
          <div>
            <p className="text-xs text-red-400 font-medium mb-2 uppercase tracking-widest">Manual</p>
            <div className="code-block text-gray-300 text-xs leading-relaxed">
              <pre>{`// LoginForm.tsx
'use client'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useTransition } from 'react'
import { z } from 'zod'
import { loginAction } from './actions'

// Schema must be re-imported/re-defined
// on the client to feed zodResolver
const schema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
})

type Fields = z.infer<typeof schema>

export function LoginForm() {
  const [isPending, startTransition] = useTransition()

  const {
    register,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<Fields>({
    resolver: zodResolver(schema),
    defaultValues: { email: '', password: '' },
  })

  const onSubmit = (values: Fields) => {
    startTransition(async () => {
      const result = await loginAction(values)
      // Must manually walk error keys
      if (result?.errors) {
        for (const [field, messages] of
          Object.entries(result.errors)) {
          setError(field as keyof Fields, {
            message: (messages as string[])[0],
          })
        }
      }
    })
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <input {...register('email')} />
      {errors.email && <p>{errors.email.message}</p>}
      <input {...register('password')} type="password" />
      {errors.password && <p>{errors.password.message}</p>}
      <button disabled={isPending || isSubmitting}>
        {isPending ? 'Signing in…' : 'Sign In'}
      </button>
    </form>
  )
}`}</pre>
            </div>
          </div>
          <div>
            <p className="text-xs text-brand-400 font-medium mb-2 uppercase tracking-widest">hookform-action</p>
            <div className="code-block text-gray-300 text-xs leading-relaxed">
              <pre>{`// LoginForm.tsx
'use client'
import { useActionForm } from 'hookform-action'
import { loginAction } from './actions'

// No resolver — schema is auto-detected
// from the withZod wrapper on the action

export function LoginForm() {
  const {
    register,
    handleSubmit,
    formState: { errors, isPending },
  } = useActionForm(loginAction, {
    defaultValues: { email: '', password: '' },
    // enable real-time validation with
    // the same schema — no extra imports
    validationMode: 'onChange',
  })

  return (
    <form onSubmit={handleSubmit()}>
      <input {...register('email')} />
      {errors.email && <p>{errors.email.message}</p>}
      <input {...register('password')} type="password" />
      {errors.password && <p>{errors.password.message}</p>}
      <button disabled={isPending}>
        {isPending ? 'Signing in…' : 'Sign In'}
      </button>
    </form>
  )
}`}</pre>
            </div>
          </div>
        </div>

        {/* Delta callout */}
        <div className="mt-6 grid sm:grid-cols-3 gap-4 text-center text-sm">
          <div className="bg-gray-900/50 border border-gray-800 rounded-xl p-4">
            <p className="text-2xl font-bold text-red-400 mb-1">~55</p>
            <p className="text-gray-500 text-xs">lines — manual client component</p>
          </div>
          <div className="bg-gray-900/50 border border-gray-800 rounded-xl p-4">
            <p className="text-2xl font-bold text-brand-400 mb-1">~25</p>
            <p className="text-gray-500 text-xs">lines — with hookform-action</p>
          </div>
          <div className="bg-gray-900/50 border border-gray-800 rounded-xl p-4">
            <p className="text-2xl font-bold text-emerald-400 mb-1">−3</p>
            <p className="text-gray-500 text-xs">concepts to keep in sync (resolver, transition, setError loop)</p>
          </div>
        </div>
      </section>

      {/* ------------------------------------------------------------------ */}
      {/* 4. Conclusion                                                        */}
      {/* ------------------------------------------------------------------ */}
      <section className="mb-12">
        <h2 className="text-2xl font-bold mb-4">Bottom line</h2>
        <div className="bg-gray-900/50 border border-gray-800 rounded-xl p-8 space-y-4 text-gray-300 leading-relaxed">
          <p>
            The manual approach works. React Hook Form, Zod, and Server Actions are well-designed primitives and wiring
            them yourself is absolutely viable on a small form.
          </p>
          <p>
            The friction compounds as the app grows: every new form repeats the same <code>safeParse</code> boilerplate
            on the server, the same <code>setError</code> loop on the client, the same <code>useTransition</code>{" "}
            wrapper for pending state. When you add optimistic updates or multi-step persistence the surface area grows
            further.
          </p>
          <p>
            <code>hookform-action</code> doesn&apos;t hide any of those primitives — it codifies the patterns you would
            write anyway into a single hook and a single server wrapper. You keep full access to the underlying{" "}
            <code>useForm</code> instance and can still pass any RHF option. The goal is to remove the repetitive
            plumbing, not to abstract away control.
          </p>
          <div className="pt-2 flex gap-4">
            <a
              href="/examples/login"
              className="inline-flex items-center px-5 py-2.5 bg-brand-600 hover:bg-brand-500 text-white rounded-lg font-medium text-sm transition-colors"
            >
              See it in action →
            </a>
            <a
              href="/api-reference"
              className="inline-flex items-center px-5 py-2.5 border border-gray-700 hover:border-gray-500 text-gray-300 rounded-lg font-medium text-sm transition-colors"
            >
              Full API reference
            </a>
          </div>
        </div>
      </section>
    </div>
  );
}
