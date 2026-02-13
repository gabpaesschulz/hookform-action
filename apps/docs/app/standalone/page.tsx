export default function StandalonePage() {
  return (
    <div className="max-w-4xl mx-auto px-6 py-16">
      <div className="mb-8">
        <a href="/" className="text-sm text-gray-500 hover:text-gray-300 transition-colors">
          ← Back to docs
        </a>
      </div>

      <div className="inline-flex items-center gap-2 bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 rounded-full px-4 py-1.5 text-sm font-medium mb-6">
        <span>v3</span>
        <span className="text-gray-600">·</span>
        <span>hookform-action-standalone</span>
      </div>

      <h1 className="text-3xl font-bold mb-4">Standalone Adapter</h1>
      <p className="text-gray-400 mb-10 text-lg">
        Use <code>hookform-action</code> in <strong>any React app</strong> — Vite, Remix, Astro, or
        plain SPAs. No Next.js or Server Actions required.
      </p>

      {/* Installation */}
      <section className="mb-16">
        <h2 className="text-2xl font-bold mb-4 text-brand-400">Installation</h2>
        <div className="code-block mb-4 text-gray-300">
          <pre>{`npm install hookform-action-standalone react-hook-form zod
# or
pnpm add hookform-action-standalone react-hook-form zod`}</pre>
        </div>
        <p className="text-gray-400 text-sm">
          <code>hookform-action-standalone</code> depends on <code>hookform-action-core</code>{' '}
          (core) as a regular dependency — it&apos;s installed automatically.
        </p>
      </section>

      {/* Basic Usage */}
      <section className="mb-16">
        <h2 className="text-2xl font-bold mb-4 text-brand-400">Basic Usage</h2>
        <p className="text-gray-400 mb-4">
          Instead of passing a Server Action as the first argument, pass an options object with a
          <code> submit</code> function:
        </p>
        <div className="code-block mb-4 text-gray-300">
          <pre>{`import { useActionForm } from 'hookform-action-standalone'
import { z } from 'zod'

const schema = z.object({
  email: z.string().email('Invalid email'),
  password: z.string().min(8, 'Minimum 8 characters'),
})

export function LoginForm() {
  const {
    register,
    handleSubmit,
    formState: { errors, isPending, isSubmitSuccessful },
  } = useActionForm({
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

  if (isSubmitSuccessful) {
    return <p className="text-green-500">✓ Logged in!</p>
  }

  return (
    <form onSubmit={handleSubmit()}>
      <input {...register('email')} placeholder="Email" />
      {errors.email && <span>{errors.email.message}</span>}

      <input {...register('password')} type="password" placeholder="Password" />
      {errors.password && <span>{errors.password.message}</span>}

      <button disabled={isPending}>
        {isPending ? 'Signing in...' : 'Sign In'}
      </button>
    </form>
  )
}`}</pre>
        </div>
      </section>

      {/* API Comparison */}
      <section className="mb-16">
        <h2 className="text-2xl font-bold mb-4 text-brand-400">Next.js vs Standalone</h2>
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="text-gray-400 border-b border-gray-800">
              <tr>
                <th className="py-3 pr-4">Feature</th>
                <th className="py-3 pr-4">Next.js Adapter</th>
                <th className="py-3">Standalone Adapter</th>
              </tr>
            </thead>
            <tbody className="text-gray-300">
              <tr className="border-b border-gray-800/50">
                <td className="py-3 pr-4 font-mono text-brand-300">Import</td>
                <td className="py-3 pr-4 font-mono text-xs">hookform-action</td>
                <td className="py-3 font-mono text-xs">hookform-action-standalone</td>
              </tr>
              <tr className="border-b border-gray-800/50">
                <td className="py-3 pr-4 font-mono text-brand-300">Signature</td>
                <td className="py-3 pr-4 font-mono text-xs">useActionForm(action, options)</td>
                <td className="py-3 font-mono text-xs">
                  {'useActionForm({ submit, ...options })'}
                </td>
              </tr>
              <tr className="border-b border-gray-800/50">
                <td className="py-3 pr-4 font-mono text-brand-300">formAction</td>
                <td className="py-3 pr-4">✅ Provided</td>
                <td className="py-3">❌ Not applicable</td>
              </tr>
              <tr className="border-b border-gray-800/50">
                <td className="py-3 pr-4 font-mono text-brand-300">FormData</td>
                <td className="py-3 pr-4">Auto-converts</td>
                <td className="py-3">Not needed</td>
              </tr>
              <tr className="border-b border-gray-800/50">
                <td className="py-3 pr-4 font-mono text-brand-300">Error mapping</td>
                <td className="py-3 pr-4">✅ Identical</td>
                <td className="py-3">✅ Identical</td>
              </tr>
              <tr className="border-b border-gray-800/50">
                <td className="py-3 pr-4 font-mono text-brand-300">Optimistic UI</td>
                <td className="py-3 pr-4">✅ Identical</td>
                <td className="py-3">✅ Identical</td>
              </tr>
              <tr className="border-b border-gray-800/50">
                <td className="py-3 pr-4 font-mono text-brand-300">Persistence</td>
                <td className="py-3 pr-4">✅ Identical</td>
                <td className="py-3">✅ Identical</td>
              </tr>
              <tr className="border-b border-gray-800/50">
                <td className="py-3 pr-4 font-mono text-brand-300">Client validation</td>
                <td className="py-3 pr-4">✅ Identical</td>
                <td className="py-3">✅ Identical</td>
              </tr>
              <tr className="border-b border-gray-800/50">
                <td className="py-3 pr-4 font-mono text-brand-300">DevTools</td>
                <td className="py-3 pr-4">✅ Compatible</td>
                <td className="py-3">✅ Compatible</td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>

      {/* Vite Setup */}
      <section className="mb-16">
        <h2 className="text-2xl font-bold mb-4 text-brand-400">Vite Setup</h2>
        <div className="code-block mb-4 text-gray-300">
          <pre>{`# Create a Vite + React + TypeScript project
npm create vite@latest my-app -- --template react-ts
cd my-app
npm install hookform-action-standalone react-hook-form zod
npm install hookform-action-devtools   # optional`}</pre>
        </div>
        <p className="text-gray-400 text-sm">
          No additional Vite configuration needed. The library ships ESM + CJS and works out of the
          box.
        </p>
      </section>

      {/* Advanced: with Optimistic UI */}
      <section className="mb-16">
        <h2 className="text-2xl font-bold mb-4 text-brand-400">Optimistic UI Example</h2>
        <div className="code-block text-gray-300">
          <pre>{`import { useActionForm } from 'hookform-action-standalone'

function EditTodo({ todo }: { todo: Todo }) {
  const { register, handleSubmit, optimistic } = useActionForm({
    submit: async (data) => {
      const res = await fetch(\`/api/todos/\${todo.id}\`, {
        method: 'PATCH',
        body: JSON.stringify(data),
        headers: { 'Content-Type': 'application/json' },
      })
      return res.json()
    },
    defaultValues: { title: todo.title },
    optimisticKey: \`todo-\${todo.id}\`,
    optimisticInitial: todo,
    optimisticData: (current, values) => ({ ...current, ...values }),
  })

  return (
    <form onSubmit={handleSubmit()}>
      <h2>{optimistic?.data?.title}</h2>
      <input {...register('title')} />
      <button type="submit">Save</button>
    </form>
  )
}`}</pre>
        </div>
      </section>

      {/* Bundle comparison */}
      <section className="mb-16">
        <h2 className="text-2xl font-bold mb-4 text-brand-400">Bundle Size</h2>
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="text-gray-400 border-b border-gray-800">
              <tr>
                <th className="py-3 pr-4">Package</th>
                <th className="py-3 pr-4">ESM (minified)</th>
                <th className="py-3">Peer deps</th>
              </tr>
            </thead>
            <tbody className="text-gray-300">
              <tr className="border-b border-gray-800/50">
                <td className="py-3 pr-4 font-mono text-brand-300">hookform-action-core (core)</td>
                <td className="py-3 pr-4">~4 KB</td>
                <td className="py-3">react, react-hook-form, zod</td>
              </tr>
              <tr className="border-b border-gray-800/50">
                <td className="py-3 pr-4 font-mono text-emerald-300">hookform-action-standalone</td>
                <td className="py-3 pr-4">~1 KB (adapter only)</td>
                <td className="py-3">react, react-hook-form, zod</td>
              </tr>
              <tr className="border-b border-gray-800/50">
                <td className="py-3 pr-4 font-mono text-purple-300">hookform-action-devtools</td>
                <td className="py-3 pr-4">~3 KB</td>
                <td className="py-3">react, react-hook-form</td>
              </tr>
            </tbody>
          </table>
        </div>
        <p className="text-gray-400 text-sm mt-4">
          All packages are tree-shakeable (<code>sideEffects: false</code>). DevTools is only
          included when imported — typically behind a <code>process.env.NODE_ENV</code> guard.
        </p>
      </section>

      <footer className="text-center text-gray-600 text-sm py-8 border-t border-gray-800">
        <p>MIT License · Built with ♥ for the React community</p>
      </footer>
    </div>
  )
}
