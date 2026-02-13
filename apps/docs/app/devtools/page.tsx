export default function DevToolsPage() {
  return (
    <div className="max-w-4xl mx-auto px-6 py-16">
      <div className="mb-8">
        <a href="/" className="text-sm text-gray-500 hover:text-gray-300 transition-colors">
          ← Back to docs
        </a>
      </div>

      <div className="inline-flex items-center gap-2 bg-purple-500/10 text-purple-400 border border-purple-500/20 rounded-full px-4 py-1.5 text-sm font-medium mb-6">
        <span>v3</span>
        <span className="text-gray-600">·</span>
        <span>hookform-action-devtools</span>
      </div>

      <h1 className="text-3xl font-bold mb-4">FormDevTool</h1>
      <p className="text-gray-400 mb-10 text-lg">
        A floating debug panel for inspecting form state, submission history, and triggering debug
        actions. Inspired by TanStack Query DevTools.
      </p>

      {/* Installation */}
      <section className="mb-16">
        <h2 className="text-2xl font-bold mb-4 text-brand-400">Installation</h2>
        <div className="code-block mb-4 text-gray-300">
          <pre>{`npm install hookform-action-devtools
# or
pnpm add hookform-action-devtools`}</pre>
        </div>
        <p className="text-gray-400 text-sm">
          Works with both <code>hookform-action</code> (Next.js) and{' '}
          <code>hookform-action-standalone</code> (Vite, Remix, etc.).
        </p>
      </section>

      {/* Quick Start */}
      <section className="mb-16">
        <h2 className="text-2xl font-bold mb-4 text-brand-400">Quick Start</h2>
        <div className="code-block mb-4 text-gray-300">
          <pre>{`import { useActionForm } from 'hookform-action'
// or: import { useActionForm } from 'hookform-action-standalone'
import { FormDevTool } from 'hookform-action-devtools'

export function MyForm() {
  const form = useActionForm(myAction, {
    defaultValues: { email: '', name: '' },
  })

  return (
    <>
      <form onSubmit={form.handleSubmit()}>
        <input {...form.register('email')} />
        <input {...form.register('name')} />
        <button type="submit">Submit</button>
      </form>

      {process.env.NODE_ENV === 'development' && (
        <FormDevTool control={form.control} />
      )}
    </>
  )
}`}</pre>
        </div>
        <p className="text-gray-400 text-sm">
          Wrap <code>&lt;FormDevTool&gt;</code> in a <code>NODE_ENV</code> check so it&apos;s
          tree-shaken out of production builds.
        </p>
      </section>

      {/* Features */}
      <section className="mb-16">
        <h2 className="text-2xl font-bold mb-4 text-brand-400">Features</h2>
        <div className="grid sm:grid-cols-3 gap-6">
          <div className="bg-gray-900/50 border border-gray-800 rounded-xl p-6">
            <div className="text-3xl mb-3">📋</div>
            <h3 className="text-lg font-semibold mb-2">State Tab</h3>
            <p className="text-gray-400 text-sm">
              Live view of form values, validation errors, server errors, submit status (pending,
              submitting, dirty, valid).
            </p>
          </div>
          <div className="bg-gray-900/50 border border-gray-800 rounded-xl p-6">
            <div className="text-3xl mb-3">📜</div>
            <h3 className="text-lg font-semibold mb-2">History Tab</h3>
            <p className="text-gray-400 text-sm">
              Every submission recorded with payload, response, error, duration, and success/failure
              status.
            </p>
          </div>
          <div className="bg-gray-900/50 border border-gray-800 rounded-xl p-6">
            <div className="text-3xl mb-3">⚡</div>
            <h3 className="text-lg font-semibold mb-2">Actions Tab</h3>
            <p className="text-gray-400 text-sm">
              Debug buttons to log values, state, history, and errors to the console. Summary stats
              (total, successful, failed, avg duration).
            </p>
          </div>
        </div>
      </section>

      {/* Props */}
      <section className="mb-16">
        <h2 className="text-2xl font-bold mb-4 text-brand-400">Props</h2>
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="text-gray-400 border-b border-gray-800">
              <tr>
                <th className="py-3 pr-4">Prop</th>
                <th className="py-3 pr-4">Type</th>
                <th className="py-3 pr-4">Default</th>
                <th className="py-3">Description</th>
              </tr>
            </thead>
            <tbody className="text-gray-300">
              <tr className="border-b border-gray-800/50">
                <td className="py-3 pr-4 font-mono text-brand-300">control</td>
                <td className="py-3 pr-4 font-mono text-xs">Control</td>
                <td className="py-3 pr-4 text-gray-500">required</td>
                <td className="py-3 text-gray-400">
                  The <code>control</code> object from <code>useActionForm</code>. Contains enhanced
                  metadata for submission history and action state.
                </td>
              </tr>
              <tr className="border-b border-gray-800/50">
                <td className="py-3 pr-4 font-mono text-brand-300">position</td>
                <td className="py-3 pr-4 font-mono text-xs">{`'bottom-right' | 'bottom-left' | 'top-right' | 'top-left'`}</td>
                <td className="py-3 pr-4 font-mono text-xs">&apos;bottom-right&apos;</td>
                <td className="py-3 text-gray-400">
                  Position of the floating toggle button and panel.
                </td>
              </tr>
              <tr className="border-b border-gray-800/50">
                <td className="py-3 pr-4 font-mono text-brand-300">defaultOpen</td>
                <td className="py-3 pr-4 font-mono text-xs">boolean</td>
                <td className="py-3 pr-4 font-mono text-xs">false</td>
                <td className="py-3 text-gray-400">Whether the panel starts in the open state.</td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>

      {/* Design */}
      <section className="mb-16">
        <h2 className="text-2xl font-bold mb-4 text-brand-400">Design Details</h2>
        <div className="space-y-4 text-gray-400 text-sm">
          <div className="flex items-start gap-3">
            <span className="text-lg">🎨</span>
            <p>
              <strong className="text-gray-200">Inline styles only</strong> — no CSS dependencies,
              no Tailwind, no CSS modules. Works in any setup.
            </p>
          </div>
          <div className="flex items-start gap-3">
            <span className="text-lg">🌳</span>
            <p>
              <strong className="text-gray-200">Tree-shakeable</strong> —{' '}
              <code>sideEffects: false</code>. Not included in production if not imported.
            </p>
          </div>
          <div className="flex items-start gap-3">
            <span className="text-lg">🔄</span>
            <p>
              <strong className="text-gray-200">Live polling</strong> — Refreshes every 1 second
              when the panel is open to capture submission history updates.
            </p>
          </div>
          <div className="flex items-start gap-3">
            <span className="text-lg">🎯</span>
            <p>
              <strong className="text-gray-200">Dark theme</strong> — Designed to look great
              alongside dev tools. Monospace fonts, color-coded badges.
            </p>
          </div>
        </div>
      </section>

      {/* Usage with Standalone */}
      <section className="mb-16">
        <h2 className="text-2xl font-bold mb-4 text-brand-400">With Standalone Adapter</h2>
        <div className="code-block text-gray-300">
          <pre>{`import { useActionForm } from 'hookform-action-standalone'
import { FormDevTool } from 'hookform-action-devtools'

function ContactForm() {
  const form = useActionForm({
    submit: async (data) => {
      const res = await fetch('/api/contact', {
        method: 'POST',
        body: JSON.stringify(data),
        headers: { 'Content-Type': 'application/json' },
      })
      return res.json()
    },
    defaultValues: { name: '', message: '' },
  })

  return (
    <>
      <form onSubmit={form.handleSubmit()}>
        <input {...form.register('name')} placeholder="Name" />
        <textarea {...form.register('message')} placeholder="Message" />
        <button type="submit">Send</button>
      </form>
      <FormDevTool
        control={form.control}
        position="bottom-left"
        defaultOpen
      />
    </>
  )
}`}</pre>
        </div>
      </section>

      <footer className="text-center text-gray-600 text-sm py-8 border-t border-gray-800">
        <p>MIT License · Built with ♥ for the React community</p>
      </footer>
    </div>
  )
}
