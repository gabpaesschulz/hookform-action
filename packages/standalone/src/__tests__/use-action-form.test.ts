import { act, renderHook, waitFor } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { useActionForm } from '../use-action-form'

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function createFetchSubmit() {
  return vi.fn(async (data: Record<string, unknown>) => {
    // Simulate a successful API call
    return { success: true, data }
  })
}

function createFetchErrorSubmit() {
  return vi.fn(async (_data: Record<string, unknown>) => {
    return { errors: { email: ['Email already exists'] } }
  })
}

function createThrowingFetchSubmit() {
  return vi.fn(async (_data: Record<string, unknown>) => {
    throw new Error('Network error')
  })
}

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe('hookform-action-standalone – useActionForm', () => {
  beforeEach(() => {
    sessionStorage.clear()
  })

  it('returns all expected properties', () => {
    const { result } = renderHook(() =>
      useActionForm({
        submit: createFetchSubmit(),
        defaultValues: { email: '' },
      }),
    )

    expect(result.current.register).toBeDefined()
    expect(result.current.handleSubmit).toBeDefined()
    expect(result.current.formState).toBeDefined()
    expect(result.current.setSubmitError).toBeDefined()
    expect(result.current.persist).toBeDefined()
    expect(result.current.clearPersistedData).toBeDefined()
  })

  it('does NOT have formAction (standalone has no Server Actions)', () => {
    const { result } = renderHook(() =>
      useActionForm({
        submit: createFetchSubmit(),
      }),
    )

    expect((result.current as Record<string, unknown>).formAction).toBeUndefined()
  })

  it('uses defaultValues', () => {
    const { result } = renderHook(() =>
      useActionForm({
        submit: createFetchSubmit(),
        defaultValues: { email: 'hello@world.com' },
      }),
    )

    expect(result.current.getValues('email')).toBe('hello@world.com')
  })

  it('calls the submit function on form submit', async () => {
    const submit = createFetchSubmit()
    const { result } = renderHook(() =>
      useActionForm({
        submit,
        defaultValues: { email: 'test@test.com' },
      }),
    )

    await act(async () => {
      await result.current.handleSubmit()()
    })

    await waitFor(() => {
      expect(submit).toHaveBeenCalledWith({ email: 'test@test.com' })
    })
  })

  it('sets isSubmitSuccessful after success', async () => {
    const submit = createFetchSubmit()
    const { result } = renderHook(() =>
      useActionForm({
        submit,
        defaultValues: { name: 'Vite user' },
      }),
    )

    await act(async () => {
      await result.current.handleSubmit()()
    })

    await waitFor(() => {
      expect(result.current.formState.isSubmitSuccessful).toBe(true)
    })
  })

  it('maps server errors to form fields', async () => {
    const submit = createFetchErrorSubmit()
    const { result } = renderHook(() =>
      useActionForm({
        submit,
        defaultValues: { email: '' },
      }),
    )

    await act(async () => {
      await result.current.handleSubmit()()
    })

    await waitFor(() => {
      expect(result.current.formState.submitErrors).toEqual({
        email: ['Email already exists'],
      })
    })
  })

  it('handles thrown errors', async () => {
    const onError = vi.fn()
    const { result } = renderHook(() =>
      useActionForm({
        submit: createThrowingFetchSubmit(),
        defaultValues: { email: '' },
        onError,
      }),
    )

    await act(async () => {
      await result.current.handleSubmit()()
    })

    await waitFor(() => {
      expect(onError).toHaveBeenCalled()
    })
  })

  it('calls onSuccess callback', async () => {
    const submit = createFetchSubmit()
    const onSuccess = vi.fn()
    const { result } = renderHook(() =>
      useActionForm({
        submit,
        defaultValues: { email: 'test@test.com' },
        onSuccess,
      }),
    )

    await act(async () => {
      await result.current.handleSubmit()()
    })

    await waitFor(() => {
      expect(onSuccess).toHaveBeenCalled()
    })
  })

  it('supports persistKey', async () => {
    const submit = createFetchSubmit()
    const { result } = renderHook(() =>
      useActionForm({
        submit,
        defaultValues: { email: 'persist@test.com' },
        persistKey: 'standalone-test',
        persistDebounce: 0,
      }),
    )

    await act(async () => {
      result.current.persist()
    })

    const stored = sessionStorage.getItem('standalone-test')
    expect(stored).toBeTruthy()
    expect(JSON.parse(stored as string).email).toBe('persist@test.com')
  })

  it('works with optimistic updates', async () => {
    const submit = createFetchSubmit()
    const { result } = renderHook(() =>
      useActionForm({
        submit,
        defaultValues: { title: 'New Todo' },
        optimisticKey: 'todo-1',
        optimisticData: (
          current: Record<string, unknown>,
          formValues: Record<string, unknown>,
        ) => ({
          ...current,
          title: formValues.title,
        }),
        optimisticInitial: { title: 'Old Todo' },
      }),
    )

    expect(result.current.optimistic).toBeDefined()
    expect(result.current.optimistic?.data).toEqual({ title: 'Old Todo' })
  })
})
