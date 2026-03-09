export default function ResetAfterSuccessPage() {
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
          <span className="text-gray-500 text-sm font-mono">Recipe #3</span>
        </div>
        <h1 className="text-3xl font-bold mb-3">Reset After Success</h1>
        <p className="text-lg text-gray-400">
          Three canonical patterns for post-submission UX: redirect, in-place reset with a toast,
          and showing a success state. Choosing the wrong one leads to subtle bugs.
        </p>
      </div>

      {/* Why it matters */}
      <section className="mb-12">
        <h2 className="text-xl font-bold mb-3">Why it matters</h2>
        <p className="text-gray-400 leading-relaxed">
          &quot;The form doesn&apos;t clear after I submit&quot; is one of the most common issues
          raised by developers new to the library. The reason is that{' '}
          <code>isSubmitSuccessful</code> stays <code>true</code> indefinitely, and{' '}
          <code>reset()</code> needs to be called explicitly. These are intentional RHF behaviours —
          but they need to be wired correctly.
        </p>
        <p className="text-gray-400 leading-relaxed mt-3">
          There are three distinct patterns depending on your UX goal. Pick the right one and you
          avoid ghost states, stale data, and infinite success screens.
        </p>
      </section>

      {/* Pattern 1 */}
      <section className="mb-12">
        <h2 className="text-xl font-bold mb-2">Pattern 1 — Redirect after submit</h2>
        <p className="text-gray-400 text-sm mb-5">
          Best for create-and-navigate flows: create a post, place an order, complete onboarding.
          The server calls <code>redirect()</code> and the page navigates away — no client-side
          reset needed.
        </p>

        <div className="mb-5">
          <span className="text-xs font-mono text-gray-400 bg-gray-800 px-2 py-0.5 rounded border border-gray-700">
            actions.ts
          </span>
          <div className="code-block mt-2 text-gray-300">
            <pre>{`'use server'
import { redirect } from 'next/navigation'
import { withZod } from 'hookform-action-core/with-zod'
import { postSchema } from './schema'

export const createPostAction = withZod(postSchema, async (data) => {
  const post = await db.posts.create({ data })
  // redirect() throws internally — the return below is unreachable
  redirect(\`/posts/\${post.id}\`)
})`}</pre>
          </div>
        </div>

        <div className="bg-blue-500/5 border border-blue-500/20 rounded-lg p-4 text-sm text-gray-400">
          <span className="text-blue-400 font-medium">Note: </span>
          After <code>redirect()</code> the hook sets <code>isSubmitSuccessful = true</code>, but
          the page navigates away immediately so this state is never rendered. You do not need to
          handle it on the client.
        </div>
      </section>

      {/* Pattern 2 */}
      <section className="mb-12">
        <h2 className="text-xl font-bold mb-2">Pattern 2 — In-place reset with onSuccess</h2>
        <p className="text-gray-400 text-sm mb-5">
          Best for forms that stay on the same page after submission: comment boxes, subscription
          forms, quick-add widgets. Use <code>onSuccess</code> to call <code>reset()</code> and
          optionally show a toast.
        </p>

        <div className="mb-5">
          <span className="text-xs font-mono text-gray-400 bg-gray-800 px-2 py-0.5 rounded border border-gray-700">
            comment-form.tsx
          </span>
          <div className="code-block mt-2 text-gray-300">
            <pre>{`'use client'
import { useActionForm } from 'hookform-action'
import { addCommentAction } from './actions'

export function CommentForm() {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isPending },
  } = useActionForm(addCommentAction, {
    defaultValues: { text: '' },
    onSuccess: () => {
      reset()             // Clears all fields back to defaultValues
      // toast.success('Comment posted!')  // optional side effect
    },
  })

  return (
    <form onSubmit={handleSubmit()}>
      <textarea {...register('text')} placeholder="Write a comment…" />
      {errors.text && <p className="text-red-400">{errors.text.message}</p>}
      <button type="submit" disabled={isPending}>
        {isPending ? 'Posting…' : 'Post Comment'}
      </button>
    </form>
  )
}`}</pre>
          </div>
        </div>

        <div className="mb-5">
          <span className="text-xs font-mono text-gray-400 bg-gray-800 px-2 py-0.5 rounded border border-gray-700">
            Resetting to different values (e.g. after edit)
          </span>
          <div className="code-block mt-2 text-gray-300">
            <pre>{`onSuccess: (result) => {
  // Pass new values to reset() — useful after an edit form
  // where the server returns the updated record
  reset({
    title: result.data.title,
    body: result.data.body,
  })
}`}</pre>
          </div>
        </div>
      </section>

      {/* Pattern 3 */}
      <section className="mb-12">
        <h2 className="text-xl font-bold mb-2">Pattern 3 — isSubmitSuccessful guard</h2>
        <p className="text-gray-400 text-sm mb-5">
          Best for single-use forms where you want to replace the form with a success message:
          contact forms, RSVP forms, one-time redemptions.
        </p>

        <div className="mb-5">
          <span className="text-xs font-mono text-gray-400 bg-gray-800 px-2 py-0.5 rounded border border-gray-700">
            contact-form.tsx
          </span>
          <div className="code-block mt-2 text-gray-300">
            <pre>{`'use client'
import { useActionForm } from 'hookform-action'
import { sendMessageAction } from './actions'

export function ContactForm() {
  const {
    register,
    handleSubmit,
    formState: { errors, isPending, isSubmitSuccessful },
  } = useActionForm(sendMessageAction, {
    defaultValues: { name: '', email: '', message: '' },
  })

  // Replace the form entirely once submitted
  if (isSubmitSuccessful) {
    return (
      <div className="text-center py-12">
        <p className="text-2xl font-bold text-green-400">Message sent!</p>
        <p className="text-gray-400 mt-2">We'll get back to you within 24 hours.</p>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit()}>
      <input {...register('name')} placeholder="Your name" />
      {errors.name && <p className="text-red-400">{errors.name.message}</p>}
      <input type="email" {...register('email')} placeholder="Email" />
      {errors.email && <p className="text-red-400">{errors.email.message}</p>}
      <textarea {...register('message')} placeholder="Your message" />
      {errors.message && <p className="text-red-400">{errors.message.message}</p>}
      <button type="submit" disabled={isPending}>
        {isPending ? 'Sending…' : 'Send Message'}
      </button>
    </form>
  )
}`}</pre>
          </div>
        </div>
      </section>

      {/* Bonus: Wizard cleanup */}
      <section className="mb-12">
        <h2 className="text-xl font-bold mb-2">Bonus — Clearing persistence after wizard submit</h2>
        <p className="text-gray-400 text-sm mb-5">
          When using <code>persistKey</code>, always call <code>clearPersistedData()</code> in{' '}
          <code>onSuccess</code> to remove the saved draft from <code>sessionStorage</code>.
          Otherwise the user will see stale data if they open the form again.
        </p>

        <div className="code-block text-gray-300">
          <pre>{`const { handleSubmit, clearPersistedData } = useActionForm(wizardAction, {
  defaultValues: { ... },
  persistKey: 'onboarding-wizard',
  onSuccess: () => {
    clearPersistedData()   // ← remove draft from sessionStorage
    router.push('/dashboard')
  },
})`}</pre>
        </div>
      </section>

      {/* Key Concepts */}
      <section className="mb-12">
        <h2 className="text-xl font-bold mb-4">Key Concepts</h2>
        <div className="space-y-3">
          <div className="bg-gray-900 border border-gray-800 rounded-lg p-4">
            <code className="text-brand-400">reset()</code>
            <p className="text-gray-400 text-sm mt-1">
              Resets all fields to <code>defaultValues</code>, clears all errors, and resets RHF
              state (<code>isDirty</code>, <code>isSubmitSuccessful</code>, etc.).{' '}
              <code>reset(newValues)</code> additionally updates the stored default values — useful
              after editing a record.
            </p>
          </div>
          <div className="bg-gray-900 border border-gray-800 rounded-lg p-4">
            <code className="text-brand-400">isSubmitSuccessful</code>
            <p className="text-gray-400 text-sm mt-1">
              Becomes <code>true</code> after a successful action call (no field errors returned)
              and stays <code>true</code> until <code>reset()</code> is called or the component
              unmounts. This is intentional — use it as the guard for your success UI.
            </p>
          </div>
          <div className="bg-gray-900 border border-gray-800 rounded-lg p-4">
            <code className="text-brand-400">onSuccess callback</code>
            <p className="text-gray-400 text-sm mt-1">
              Receives the full action result and fires only when the action succeeds (no field
              errors). The best place to call <code>reset()</code>, show a toast, or trigger a
              router navigation.
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
                Calling <code>reset()</code> in a <code>useEffect</code> watching{' '}
                <code>isSubmitSuccessful</code>
              </p>
              <p className="text-sm text-gray-400 mt-1">
                This creates a double-render cycle. Prefer <code>onSuccess</code> — it fires
                synchronously after the action resolves, before any re-render.
              </p>
            </div>
          </li>
          <li className="flex gap-3 bg-yellow-500/5 border border-yellow-500/20 rounded-lg p-4">
            <span className="text-yellow-400 shrink-0 mt-0.5">⚠</span>
            <div>
              <p className="text-sm font-medium text-gray-200">
                Resetting inside a modal — flash of empty form
              </p>
              <p className="text-sm text-gray-400 mt-1">
                If you <code>reset()</code> and then close the modal in <code>onSuccess</code>, the
                form briefly shows empty before the modal animation completes. Prefer resetting in
                the <code>onClose</code> handler instead, or use a <code>key</code> prop to remount.
              </p>
            </div>
          </li>
          <li className="flex gap-3 bg-yellow-500/5 border border-yellow-500/20 rounded-lg p-4">
            <span className="text-yellow-400 shrink-0 mt-0.5">⚠</span>
            <div>
              <p className="text-sm font-medium text-gray-200">
                <code>reset()</code> without arguments on an edit form
              </p>
              <p className="text-sm text-gray-400 mt-1">
                If <code>defaultValues</code> came from the server and the user just saved new data,
                calling <code>reset()</code> reverts to the old server data. Use{' '}
                <code>reset(result.data)</code> to update the baseline after a successful edit.
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
            href="/recipes/login-form"
            className="text-brand-400 hover:text-brand-300 transition-colors"
          >
            → Login Form
          </a>
          <a
            href="/recipes/modal-form"
            className="text-brand-400 hover:text-brand-300 transition-colors"
          >
            → Modal / Dialog Form
          </a>
          <a
            href="/recipes/multi-step-wizard"
            className="text-brand-400 hover:text-brand-300 transition-colors"
          >
            → Multi-Step Wizard
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
