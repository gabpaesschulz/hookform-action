export default function OptimisticUIPage() {
  return (
    <div className="max-w-4xl mx-auto px-6 py-16">
      <div className="mb-8">
        <a href="/recipes" className="text-sm text-gray-500 hover:text-gray-300 transition-colors">
          ← Back to Recipes
        </a>
      </div>

      <div className="mb-12">
        <div className="flex items-center gap-3 mb-4">
          <span className="text-xs font-bold bg-yellow-500/15 text-yellow-400 border border-yellow-500/25 rounded-full px-3 py-1">
            Tier 2 · Common
          </span>
          <span className="text-xs text-cyan-400 font-medium">⚡ Advanced feature</span>
          <span className="text-gray-500 text-sm font-mono">Recipe #6</span>
        </div>
        <h1 className="text-3xl font-bold mb-3">Optimistic UI Updates</h1>
        <p className="text-lg text-gray-400">
          Show the result of a submission instantly — before the server responds — and roll back
          automatically if something goes wrong.
        </p>
        <a
          href="/examples/optimistic"
          className="inline-flex items-center gap-1 mt-4 text-sm text-cyan-400 hover:text-cyan-300 transition-colors"
        >
          See live demo →
        </a>
      </div>

      {/* Why it matters */}
      <section className="mb-12">
        <h2 className="text-xl font-bold mb-3">Why it matters</h2>
        <p className="text-gray-400 leading-relaxed">
          Optimistic UI is the difference between a form that feels fast and one that feels slow.
          Instead of waiting 500ms for the server to respond before updating the list, you project
          the expected result immediately and confirm (or roll back) once the server replies.
        </p>
        <p className="text-gray-400 leading-relaxed mt-3">
          <code>hookform-action</code> implements this via React&apos;s <code>useOptimistic</code>{' '}
          (React 19) with a fallback for React 18. You provide an <code>optimisticData</code>{' '}
          reducer that produces the projected state from the current data and the form values. The
          hook handles the transition, confirmation, and rollback automatically.
        </p>
      </section>

      {/* Full Example */}
      <section className="mb-12">
        <h2 className="text-xl font-bold mb-6">Full Example — Optimistic Todo List</h2>

        <div className="mb-5">
          <span className="text-xs font-mono text-gray-400 bg-gray-800 px-2 py-0.5 rounded border border-gray-700">
            actions.ts
          </span>
          <div className="code-block mt-2 text-gray-300">
            <pre>{`'use server'

export interface Todo {
  id: string
  text: string
  done: boolean
}

// In-memory store for demo purposes
let todos: Todo[] = [
  { id: '1', text: 'Read the docs', done: true },
  { id: '2', text: 'Build something', done: false },
]

export async function addTodoAction(raw: unknown) {
  // Simulate network latency
  await new Promise((r) => setTimeout(r, 1200))

  const data = raw as { text: string }

  if (!data.text?.trim()) {
    return { errors: { text: ['Todo text is required'] }, todos }
  }

  // Type 'fail' to simulate a server error and trigger rollback
  if (data.text.toLowerCase().includes('fail')) {
    throw new Error('Server error — optimistic update will be rolled back.')
  }

  const newTodo: Todo = {
    id: crypto.randomUUID(),
    text: data.text.trim(),
    done: false,
  }

  todos = [...todos, newTodo]
  return { todos }
}`}</pre>
          </div>
        </div>

        <div className="mb-5">
          <span className="text-xs font-mono text-gray-400 bg-gray-800 px-2 py-0.5 rounded border border-gray-700">
            todo-form.tsx
          </span>
          <div className="code-block mt-2 text-gray-300">
            <pre>{`'use client'
import { useActionForm } from 'hookform-action'
import { type Todo, addTodoAction } from './actions'

type AddTodoResult = { todos: Todo[]; errors?: { text?: string[] } }

const initialTodos: Todo[] = [
  { id: '1', text: 'Read the docs', done: true },
  { id: '2', text: 'Build something', done: false },
]

export function TodoForm() {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isPending, actionResult },
    optimistic,
  } = useActionForm<{ text: string }, AddTodoResult, Todo[]>(addTodoAction, {
    defaultValues: { text: '' },

    // ── Optimistic UI configuration ─────────────────────────────
    optimisticKey: 'todos',

    // Initial "confirmed" data before any submissions
    optimisticInitial: initialTodos,

    // Reducer: given the current list and the submitted values,
    // return the projected list to show immediately
    optimisticData: (current, values) => [
      ...current,
      { id: \`temp-\${Date.now()}\`, text: values.text, done: false },
    ],
    // ────────────────────────────────────────────────────────────

    onSuccess: () => reset(),
  })

  // Decide which data to render:
  //   • While the action is in flight → show the optimistic (projected) list
  //   • After the action resolves   → show the confirmed list from the server
  const confirmedTodos = actionResult?.todos ?? initialTodos
  const todos = optimistic?.isPending
    ? (optimistic.data ?? confirmedTodos)
    : confirmedTodos

  return (
    <div>
      <ul>
        {todos.map((todo) => (
          <li
            key={todo.id}
            className={
              todo.id.startsWith('temp-')
                ? 'opacity-60 italic text-brand-300'  // optimistic item style
                : 'text-gray-200'
            }
          >
            {todo.done ? '✅' : '⬜'} {todo.text}
            {todo.id.startsWith('temp-') && ' (saving…)'}
          </li>
        ))}
      </ul>

      <form onSubmit={handleSubmit()} className="mt-4 flex gap-2">
        <input
          {...register('text')}
          placeholder="New todo…"
          disabled={isPending}
        />
        {errors.text && <p className="text-red-400">{errors.text.message}</p>}
        <button type="submit" disabled={isPending}>Add</button>
      </form>
    </div>
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
            <code className="text-brand-400">optimisticData (reducer)</code>
            <p className="text-gray-400 text-sm mt-1">
              A pure function <code>(currentData, formValues) =&gt; newData</code> that computes the
              projected state. It runs synchronously on submit — before the server responds. Keep it
              fast and side-effect-free.
            </p>
          </div>
          <div className="bg-gray-900 border border-gray-800 rounded-lg p-4">
            <code className="text-brand-400">optimistic.data vs actionResult</code>
            <p className="text-gray-400 text-sm mt-1">
              <code>optimistic.data</code> is the projected state (may contain temporary items with
              fake IDs). <code>actionResult</code> is the confirmed state returned by the server.
              Use the pattern shown above: prefer <code>optimistic.data</code> while{' '}
              <code>optimistic.isPending</code> is true, then switch to <code>actionResult</code>.
            </p>
          </div>
          <div className="bg-gray-900 border border-gray-800 rounded-lg p-4">
            <code className="text-brand-400">Automatic rollback on error</code>
            <p className="text-gray-400 text-sm mt-1">
              When the action throws, the hook automatically reverts <code>optimistic.data</code> to
              the last confirmed state. You can also trigger a manual rollback via{' '}
              <code>optimistic.rollback()</code> for business-logic-driven reversals.
            </p>
          </div>
          <div className="bg-gray-900 border border-gray-800 rounded-lg p-4">
            <code className="text-brand-400">React 18 / React 19 compatibility</code>
            <p className="text-gray-400 text-sm mt-1">
              On React 19 the hook uses the native <code>useOptimistic</code> API. On React 18 it
              uses a local state fallback. The behaviour is identical — you don&apos;t need to
              change any code when upgrading React.
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
                Rendering <code>optimistic.data</code> after the action resolves
              </p>
              <p className="text-sm text-gray-400 mt-1">
                After the action succeeds, <code>optimistic.data</code> still contains the projected
                state with temporary IDs. Always switch to <code>actionResult</code> once{' '}
                <code>optimistic.isPending</code> is <code>false</code>.
              </p>
            </div>
          </li>
          <li className="flex gap-3 bg-yellow-500/5 border border-yellow-500/20 rounded-lg p-4">
            <span className="text-yellow-400 shrink-0 mt-0.5">⚠</span>
            <div>
              <p className="text-sm font-medium text-gray-200">
                Inline object literal for <code>optimisticInitial</code>
              </p>
              <p className="text-sm text-gray-400 mt-1">
                Define <code>optimisticInitial</code> outside the component or use{' '}
                <code>useMemo</code>. An inline array literal creates a new reference on every
                render and resets the optimistic state unexpectedly.
              </p>
            </div>
          </li>
          <li className="flex gap-3 bg-yellow-500/5 border border-yellow-500/20 rounded-lg p-4">
            <span className="text-yellow-400 shrink-0 mt-0.5">⚠</span>
            <div>
              <p className="text-sm font-medium text-gray-200">
                Forgetting <code>reset()</code> in <code>onSuccess</code>
              </p>
              <p className="text-sm text-gray-400 mt-1">
                After a successful add, the text input stays filled. Call <code>reset()</code> in{' '}
                <code>onSuccess</code> to clear the input so the user can type the next item
                immediately.
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
            href="/recipes/reset-after-success"
            className="text-brand-400 hover:text-brand-300 transition-colors"
          >
            → Reset After Success
          </a>
          <a
            href="/examples/optimistic"
            className="text-brand-400 hover:text-brand-300 transition-colors"
          >
            → Live Optimistic Example
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
