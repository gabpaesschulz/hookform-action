export default function HomePage() {
  return (
    <div className="max-w-4xl mx-auto px-6 py-24">
      {/* Hero */}
      <section className="text-center mb-20">
        <div className="inline-flex items-center gap-2 bg-brand-500/10 text-brand-400 border border-brand-500/20 rounded-full px-4 py-1.5 text-sm font-medium mb-6">
          <span>v3.0.0</span>
          <span className="text-gray-600">·</span>
          <span>Framework-Agnostic</span>
        </div>
        <h1 className="text-5xl sm:text-6xl font-extrabold tracking-tight mb-6">
          React Hook Form{' '}
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-400 to-cyan-400">
            for every React stack
          </span>
        </h1>
        <p className="text-xl text-gray-400 max-w-2xl mx-auto mb-10">
          From Next.js Server Actions to Vite SPAs — automatic Zod error mapping, optimistic UI,
          client-side validation, multi-step persistence, and a beautiful DevTools panel.
        </p>
        <div className="flex justify-center gap-4">
          <a
            href="/examples/login"
            className="inline-flex items-center px-6 py-3 bg-brand-600 hover:bg-brand-500 text-white rounded-lg font-medium transition-colors"
          >
            See Examples
          </a>
          <a
            href="/standalone"
            className="inline-flex items-center px-6 py-3 border border-emerald-700 hover:border-emerald-500 text-emerald-300 rounded-lg font-medium transition-colors"
          >
            Standalone Guide
          </a>
          <a
            href="/api-reference"
            className="inline-flex items-center px-6 py-3 border border-gray-700 hover:border-gray-500 text-gray-300 rounded-lg font-medium transition-colors"
          >
            API Reference
          </a>
        </div>
      </section>

      {/* Install */}
      <section className="mb-20">
        <h2 className="text-2xl font-bold mb-4 text-center">Quick Start</h2>
        <div className="grid sm:grid-cols-2 gap-4">
          <div>
            <p className="text-sm text-gray-400 mb-2 text-center">Next.js (Server Actions)</p>
            <div className="code-block text-center">
              <code className="text-green-400">
                npm install hookform-action react-hook-form zod
              </code>
            </div>
          </div>
          <div>
            <p className="text-sm text-gray-400 mb-2 text-center">
              Vite / Remix / Astro (Standalone)
            </p>
            <div className="code-block text-center">
              <code className="text-green-400">
                npm install hookform-action-standalone react-hook-form zod
              </code>
            </div>
          </div>
        </div>
      </section>

      {/* v3 Highlights */}
      <section className="mb-20">
        <h2 className="text-2xl font-bold mb-6 text-center">What&apos;s New in v3</h2>
        <div className="grid sm:grid-cols-2 gap-6">
          <div className="bg-gradient-to-br from-emerald-500/10 to-cyan-500/10 border border-emerald-500/20 rounded-xl p-6">
            <div className="text-3xl mb-3">🌍</div>
            <h3 className="text-lg font-semibold mb-2">Framework-Agnostic Core</h3>
            <p className="text-gray-400 text-sm">
              The core logic no longer depends on Next.js. Use{' '}
              <code>hookform-action-standalone</code> with Vite, Remix, Astro, or any React app.
            </p>
          </div>
          <div className="bg-gradient-to-br from-purple-500/10 to-pink-500/10 border border-purple-500/20 rounded-xl p-6">
            <div className="text-3xl mb-3">🔍</div>
            <h3 className="text-lg font-semibold mb-2">DevTools Panel</h3>
            <p className="text-gray-400 text-sm">
              <code>hookform-action-devtools</code> — a floating debug panel showing form state,
              submission history, and debug actions. Inspired by TanStack Query DevTools.
            </p>
          </div>
          <div className="bg-gradient-to-br from-brand-500/10 to-cyan-500/10 border border-brand-500/20 rounded-xl p-6">
            <div className="text-3xl mb-3">🧩</div>
            <h3 className="text-lg font-semibold mb-2">Plugin System (Internal)</h3>
            <p className="text-gray-400 text-sm">
              An internal plugin architecture with lifecycle hooks (<code>onBeforeSubmit</code>,
              <code>onSuccess</code>, <code>onError</code>, <code>onMount</code>) powering future
              extensibility.
            </p>
          </div>
          <div className="bg-gradient-to-br from-brand-500/10 to-cyan-500/10 border border-brand-500/20 rounded-xl p-6">
            <div className="text-3xl mb-3">🔄</div>
            <h3 className="text-lg font-semibold mb-2">Zero Breaking Changes</h3>
            <p className="text-gray-400 text-sm">
              Existing <code>hookform-action</code> v2 imports work exactly the same. The Next.js
              adapter is 100% backward-compatible.
            </p>
          </div>
        </div>
      </section>

      {/* Architecture diagram */}
      <section className="mb-20">
        <h2 className="text-2xl font-bold mb-6 text-center">Architecture</h2>
        <div className="code-block text-gray-300 text-center leading-loose">
          <pre>{`┌─────────────────────────────────────────────┐
│        hookform-action-core (core)           │
│   useActionFormCore · withZod · Form · persist │
├────────────────────┬────────────────────────┤
│  hookform-action   │  hookform-action       │
│    (Next.js)       │    -standalone         │
│  (Server Actions)  │  (fetch / REST / gRPC)  │
└────────────────────┴────────────────────────┘
          ┌──────────────────────┐
          │ hookform-action    │
          │     -devtools      │
          │  (FormDevTool panel) │
          └──────────────────────┘`}</pre>
        </div>
      </section>

      {/* Features */}
      <section className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-20">
        {[
          {
            icon: '🔒',
            title: 'Type-Safe',
            desc: 'Full TypeScript inference from your action — zero manual typing.',
          },
          {
            icon: '⚡',
            title: 'Auto Error Mapping',
            desc: 'Zod validation errors mapped to RHF fields automatically.',
          },
          {
            icon: '💾',
            title: 'Wizard Persistence',
            desc: 'Multi-step forms with sessionStorage persistence, debounced and SSR-safe.',
          },
          {
            icon: '🚀',
            title: 'Optimistic UI',
            desc: 'Native useOptimistic integration. Instant UI updates with automatic rollback.',
          },
          {
            icon: '📦',
            title: 'Tiny Bundle',
            desc: 'ESM + CJS via tsup. Tree-shakeable. React, RHF, and Zod are peer deps.',
          },
          {
            icon: '🧪',
            title: 'Fully Tested',
            desc: '81+ tests covering core, adapters, plugins, persistence, and optimistic UI.',
          },
        ].map((f) => (
          <div
            key={f.title}
            className="bg-gray-900/50 border border-gray-800 rounded-xl p-6 hover:border-gray-700 transition-colors"
          >
            <div className="text-3xl mb-3">{f.icon}</div>
            <h3 className="text-lg font-semibold mb-2">{f.title}</h3>
            <p className="text-gray-400 text-sm">{f.desc}</p>
          </div>
        ))}
      </section>

      {/* Usage – Next.js */}
      <section className="mb-20">
        <h2 className="text-2xl font-bold mb-2 text-center">Usage — Next.js</h2>
        <p className="text-gray-400 text-sm text-center mb-6">
          Works exactly like v2. No changes required.
        </p>
        <div className="code-block text-gray-300 leading-relaxed">
          <pre>{`// actions.ts — Server Action
'use server'
import { z } from 'zod'
import { withZod } from 'hookform-action-core/with-zod'

const schema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
})

export const loginAction = withZod(schema, async (data) => {
  return { success: true }
})

// LoginForm.tsx — Client Component
'use client'
import { useActionForm } from 'hookform-action'
import { loginAction } from './actions'

export function LoginForm() {
  const { register, handleSubmit, formState: { errors, isPending } } =
    useActionForm(loginAction, {
      defaultValues: { email: '', password: '' },
      validationMode: 'onChange',
    })

  return (
    <form onSubmit={handleSubmit()}>
      <input {...register('email')} placeholder="Email" />
      {errors.email && <span>{errors.email.message}</span>}
      <input {...register('password')} type="password" />
      {errors.password && <span>{errors.password.message}</span>}
      <button disabled={isPending}>
        {isPending ? 'Signing in...' : 'Sign In'}
      </button>
    </form>
  )
}`}</pre>
        </div>
      </section>

      {/* Usage – Standalone */}
      <section className="mb-20">
        <h2 className="text-2xl font-bold mb-2 text-center">Usage — Vite / Standalone</h2>
        <p className="text-gray-400 text-sm text-center mb-6">
          Same API, pass <code>submit</code> instead of a Server Action.
        </p>
        <div className="code-block text-gray-300 leading-relaxed">
          <pre>{`import { useActionForm } from 'hookform-action-standalone'
import { z } from 'zod'

const schema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
})

export function LoginForm() {
  const { register, handleSubmit, formState: { errors, isPending } } =
    useActionForm({
      submit: async (data) => {
        const res = await fetch('/api/login', {
          method: 'POST',
          body: JSON.stringify(data),
          headers: { 'Content-Type': 'application/json' },
        })
        return res.json()
      },
      schema,
      validationMode: 'onChange',
      defaultValues: { email: '', password: '' },
    })

  return (
    <form onSubmit={handleSubmit()}>
      <input {...register('email')} placeholder="Email" />
      {errors.email && <span>{errors.email.message}</span>}
      <input {...register('password')} type="password" />
      {errors.password && <span>{errors.password.message}</span>}
      <button disabled={isPending}>
        {isPending ? 'Signing in...' : 'Sign In'}
      </button>
    </form>
  )
}`}</pre>
        </div>
      </section>

      {/* DevTools */}
      <section className="mb-20">
        <h2 className="text-2xl font-bold mb-2 text-center">DevTools</h2>
        <p className="text-gray-400 text-sm text-center mb-6">
          Add a floating panel to inspect form state in development.
        </p>
        <div className="code-block text-gray-300 leading-relaxed">
          <pre>{`import { FormDevTool } from 'hookform-action-devtools'

function App() {
  const form = useActionForm(/* ... */)
  return (
    <>
      <MyForm form={form} />
      {process.env.NODE_ENV === 'development' && (
        <FormDevTool control={form.control} />
      )}
    </>
  )
}`}</pre>
        </div>
      </section>

      {/* Footer */}
      <footer className="text-center text-gray-600 text-sm py-8 border-t border-gray-800">
        <p>MIT License · Built with ♥ for the React community</p>
      </footer>
    </div>
  )
}
