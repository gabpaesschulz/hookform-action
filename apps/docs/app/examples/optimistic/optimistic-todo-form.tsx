'use client'

import { useActionForm } from 'hookform-action-core'
import { type Todo, addTodoAction } from './actions'

const initialTodos: Todo[] = [
  { id: '1', text: 'Read hookform-action docs', done: true },
  { id: '2', text: 'Upgrade to React 19', done: false },
  { id: '3', text: 'Add optimistic UI to my app', done: false },
]

export function OptimisticTodoForm() {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isPending },
    optimistic,
  } = useActionForm(addTodoAction, {
    defaultValues: { text: '' },
    optimisticKey: 'todos',
    optimisticInitial: initialTodos,
    optimisticData: (current: Todo[], values) => [
      ...current,
      { id: `temp-${Date.now()}`, text: values.text, done: false },
    ],
  })

  const todos = optimistic?.data ?? initialTodos

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        {todos.map((todo) => (
          <div
            key={todo.id}
            className={`flex items-center gap-3 px-4 py-3 rounded-lg border transition-all ${
              todo.id.startsWith('temp-')
                ? 'border-brand-500/50 bg-brand-500/10 animate-pulse'
                : 'border-gray-700 bg-gray-900/50'
            }`}
          >
            <span className={`text-lg ${todo.done ? 'opacity-50' : ''}`}>
              {todo.done ? '✅' : '⬜'}
            </span>
            <span
              className={`flex-1 ${todo.done ? 'line-through text-gray-500' : 'text-gray-200'} ${
                todo.id.startsWith('temp-') ? 'text-brand-300 italic' : ''
              }`}
            >
              {todo.text}
            </span>
            {todo.id.startsWith('temp-') && (
              <span className="text-xs text-brand-400 font-medium">saving...</span>
            )}
          </div>
        ))}
      </div>

      {optimistic?.isPending && (
        <div className="text-xs text-brand-400 flex items-center gap-2">
          <svg className="animate-spin h-3 w-3" viewBox="0 0 24 24" aria-hidden="true">
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
              fill="none"
            />
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
            />
          </svg>
          Syncing with server...
        </div>
      )}

      <form
        onSubmit={handleSubmit(() => {
          reset({ text: '' })
        })}
        className="flex gap-3"
      >
        <div className="flex-1">
          <input
            placeholder="Add a new todo..."
            className="w-full px-4 py-2.5 bg-gray-900 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent transition-colors"
            {...register('text')}
          />
          {errors.text && <p className="mt-1 text-sm text-red-400">{errors.text.message}</p>}
        </div>
        <button
          type="submit"
          disabled={isPending}
          className="px-6 py-2.5 bg-brand-600 hover:bg-brand-500 disabled:bg-gray-700 disabled:cursor-not-allowed text-white rounded-lg font-medium transition-colors whitespace-nowrap"
        >
          {isPending ? 'Adding...' : 'Add Todo'}
        </button>
      </form>
    </div>
  )
}
