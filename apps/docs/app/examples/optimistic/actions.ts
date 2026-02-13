'use server'

export interface Todo {
  id: string
  text: string
  done: boolean
}

// Simulated in-memory store
let todos: Todo[] = [
  { id: '1', text: 'Read hookform-action docs', done: true },
  { id: '2', text: 'Upgrade to React 19', done: false },
  { id: '3', text: 'Add optimistic UI to my app', done: false },
]

export async function addTodoAction(raw: unknown) {
  // Simulate network delay
  await new Promise((r) => setTimeout(r, 1500))

  const data = raw as { text: string }

  if (!data.text || data.text.trim().length === 0) {
    return { errors: { text: ['Todo text is required'] }, todos }
  }

  // Simulate random failure for demo purposes
  if (data.text.toLowerCase().includes('fail')) {
    throw new Error('Server error! The optimistic update will be rolled back.')
  }

  const newTodo: Todo = {
    id: crypto.randomUUID(),
    text: data.text.trim(),
    done: false,
  }

  todos = [...todos, newTodo]
  return { todos }
}
