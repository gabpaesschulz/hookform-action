import { OptimisticTodoForm } from './optimistic-todo-form'

export const dynamic = 'force-dynamic'

export default function OptimisticExamplePage() {
  return (
    <div className="max-w-lg mx-auto px-6 py-16">
      <div className="mb-8">
        <a href="/" className="text-sm text-gray-500 hover:text-gray-300 transition-colors">
          ← Back to docs
        </a>
      </div>

      <div className="flex items-center gap-3 mb-2">
        <h1 className="text-3xl font-bold">Optimistic UI Example</h1>
        <span className="text-xs font-medium bg-cyan-500/20 text-cyan-400 px-2 py-0.5 rounded-full">
          v2
        </span>
      </div>
      <p className="text-gray-400 mb-8">
        A todo list demonstrating <code className="text-brand-400">optimistic UI</code> updates. New
        items appear instantly while the server action runs in the background. Try typing
        &quot;fail&quot; in a todo to see automatic rollback on server error.
      </p>

      <div className="bg-gray-900/50 border border-gray-800 rounded-xl p-8">
        <OptimisticTodoForm />
      </div>

      <div className="mt-10">
        <h2 className="text-xl font-semibold mb-4">How It Works</h2>

        <div className="space-y-4 text-sm text-gray-400">
          <div className="flex gap-3 items-start">
            <span className="text-brand-400 font-bold mt-0.5">1.</span>
            <p>
              <code className="text-gray-300">optimisticData</code> generates the predicted next
              state immediately when the form is submitted — before the server responds.
            </p>
          </div>
          <div className="flex gap-3 items-start">
            <span className="text-brand-400 font-bold mt-0.5">2.</span>
            <p>
              The UI renders <code className="text-gray-300">optimistic.data</code> which reflects
              the optimistic state, so the new todo appears instantly.
            </p>
          </div>
          <div className="flex gap-3 items-start">
            <span className="text-brand-400 font-bold mt-0.5">3.</span>
            <p>
              <code className="text-gray-300">optimistic.isPending</code> is true while the server
              action is still running, allowing loading indicators.
            </p>
          </div>
          <div className="flex gap-3 items-start">
            <span className="text-brand-400 font-bold mt-0.5">4.</span>
            <p>
              If the action throws an error, <code className="text-gray-300">rollback()</code> is
              called automatically and the optimistic state reverts.
            </p>
          </div>
        </div>

        <h3 className="text-sm font-medium text-gray-400 mt-8 mb-2">Source Code</h3>
        <div className="code-block text-gray-300">
          <pre>{`'use client'
import { useActionForm } from 'hookform-action'
import { addTodoAction, type Todo } from './actions'

export function OptimisticTodoForm() {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isPending },
    optimistic,
  } = useActionForm(addTodoAction, {
    defaultValues: { text: '' },

    // ✨ v2 Optimistic UI
    optimisticKey: 'todos',
    optimisticInitial: initialTodos,
    optimisticData: (current: Todo[], values) => [
      ...current,
      { id: \`temp-\${Date.now()}\`, text: values.text, done: false },
    ],
  })

  const todos = optimistic?.data ?? initialTodos

  return (
    <form onSubmit={handleSubmit(() => reset({ text: '' }))}>
      {todos.map(todo => (
        <div key={todo.id}>{todo.text}</div>
      ))}
      <input {...register('text')} />
      <button disabled={isPending}>
        {isPending ? 'Adding...' : 'Add Todo'}
      </button>
    </form>
  )
}`}</pre>
        </div>
      </div>
    </div>
  )
}
