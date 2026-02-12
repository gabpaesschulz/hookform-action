import { act, renderHook, waitFor } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import type { SubmitFunction } from '../core-types'
import { useActionFormCore } from '../use-action-form-core'

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function createSuccessSubmit(): SubmitFunction<any, { success: true; data: string }> {
  return vi.fn(async (_data: any) => ({ success: true as const, data: 'ok' }))
}

function createErrorSubmit(): SubmitFunction<any, { errors: { email: string[] } }> {
  return vi.fn(async (_data: any) => ({
    errors: { email: ['Invalid email address'] },
  }))
}

function createThrowingSubmit(): SubmitFunction<any, { success: true }> {
  return vi.fn(async (_data: any) => {
    throw new Error('Network failure')
  })
}

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe('useActionFormCore', () => {
  beforeEach(() => {
    sessionStorage.clear()
  })

  // ---- Basic rendering ----------------------------------------------------

  it('returns all expected core properties', () => {
    const submit = createSuccessSubmit()
    const { result } = renderHook(() => useActionFormCore(submit))

    expect(result.current.register).toBeDefined()
    expect(result.current.handleSubmit).toBeDefined()
    expect(result.current.formState).toBeDefined()
    expect(result.current.setSubmitError).toBeDefined()
    expect(result.current.persist).toBeDefined()
    expect(result.current.clearPersistedData).toBeDefined()
    expect(result.current.control).toBeDefined()
  })

  it("does NOT have formAction (that's adapter-specific)", () => {
    const submit = createSuccessSubmit()
    const { result } = renderHook(() => useActionFormCore(submit))

    expect((result.current as any).formAction).toBeUndefined()
  })

  it('uses provided defaultValues', () => {
    const submit = createSuccessSubmit()
    const { result } = renderHook(() =>
      useActionFormCore(submit, {
        defaultValues: { email: 'test@example.com' },
      }),
    )

    expect(result.current.getValues('email')).toBe('test@example.com')
  })

  // ---- Successful submission ----------------------------------------------

  it('calls the submit function on handleSubmit', async () => {
    const submit = createSuccessSubmit()
    const { result } = renderHook(() =>
      useActionFormCore(submit, {
        defaultValues: { email: 'test@example.com' },
      }),
    )

    await act(async () => {
      await result.current.handleSubmit()()
    })

    await waitFor(() => {
      expect(submit).toHaveBeenCalledWith({ email: 'test@example.com' })
    })
  })

  it('sets isSubmitSuccessful after success', async () => {
    const submit = createSuccessSubmit()
    const { result } = renderHook(() =>
      useActionFormCore(submit, {
        defaultValues: { name: 'test' },
      }),
    )

    await act(async () => {
      await result.current.handleSubmit()()
    })

    await waitFor(() => {
      expect(result.current.formState.isSubmitSuccessful).toBe(true)
      expect(result.current.formState.actionResult).toEqual({ success: true, data: 'ok' })
    })
  })

  // ---- Error handling -----------------------------------------------------

  it('maps server errors to form fields', async () => {
    const submit = createErrorSubmit()
    const { result } = renderHook(() =>
      useActionFormCore(submit, {
        defaultValues: { email: '' },
      }),
    )

    await act(async () => {
      await result.current.handleSubmit()()
    })

    await waitFor(() => {
      expect(result.current.formState.submitErrors).toEqual({
        email: ['Invalid email address'],
      })
      expect(result.current.formState.isSubmitSuccessful).toBe(false)
    })
  })

  it('handles thrown errors gracefully', async () => {
    const submit = createThrowingSubmit()
    const onError = vi.fn()
    const { result } = renderHook(() =>
      useActionFormCore(submit, {
        defaultValues: { email: '' },
        onError,
      }),
    )

    await act(async () => {
      await result.current.handleSubmit()()
    })

    await waitFor(() => {
      expect(result.current.formState.isSubmitSuccessful).toBe(false)
      expect(onError).toHaveBeenCalled()
    })
  })

  // ---- Callbacks ----------------------------------------------------------

  it('calls onSuccess callback', async () => {
    const submit = createSuccessSubmit()
    const onSuccess = vi.fn()
    const { result } = renderHook(() =>
      useActionFormCore(submit, {
        defaultValues: { name: 'test' },
        onSuccess,
      }),
    )

    await act(async () => {
      await result.current.handleSubmit()()
    })

    await waitFor(() => {
      expect(onSuccess).toHaveBeenCalledWith({ success: true, data: 'ok' })
    })
  })

  it('calls onError callback on field errors', async () => {
    const submit = createErrorSubmit()
    const onError = vi.fn()
    const { result } = renderHook(() =>
      useActionFormCore(submit, {
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

  // ---- Persistence --------------------------------------------------------

  it('persists values to sessionStorage', async () => {
    const submit = createSuccessSubmit()
    const { result } = renderHook(() =>
      useActionFormCore(submit, {
        defaultValues: { email: '' },
        persistKey: 'test-core-form',
        persistDebounce: 0,
      }),
    )

    await act(async () => {
      result.current.persist()
    })

    const stored = sessionStorage.getItem('test-core-form')
    expect(stored).toBeTruthy()
  })

  it('clears persisted data', async () => {
    sessionStorage.setItem('test-core-clear', JSON.stringify({ email: 'old@test.com' }))

    const submit = createSuccessSubmit()
    const { result } = renderHook(() =>
      useActionFormCore(submit, {
        persistKey: 'test-core-clear',
      }),
    )

    await act(async () => {
      result.current.clearPersistedData()
    })

    expect(sessionStorage.getItem('test-core-clear')).toBeNull()
  })

  // ---- setSubmitError -----------------------------------------------------

  it('allows manually setting a server error', async () => {
    const submit = createSuccessSubmit()
    const { result } = renderHook(() =>
      useActionFormCore(submit, {
        defaultValues: { email: '' },
      }),
    )

    act(() => {
      result.current.setSubmitError('email', 'Custom server error')
    })

    await waitFor(() => {
      const emailState = result.current.getFieldState('email')
      expect(emailState.error?.message).toBe('Custom server error')
      expect(emailState.error?.type).toBe('server')
    })
  })

  // ---- DevTools control metadata ------------------------------------------

  it('exposes submission history on control for DevTools', async () => {
    const submit = createSuccessSubmit()
    const { result } = renderHook(() =>
      useActionFormCore(submit, {
        defaultValues: { name: 'test' },
      }),
    )

    // Initially empty
    expect(result.current.control._submissionHistory).toEqual([])

    await act(async () => {
      await result.current.handleSubmit()()
    })

    await waitFor(() => {
      const history = result.current.control._submissionHistory
      expect(history).toBeDefined()
      expect(history?.length).toBe(1)
      expect(history?.[0]?.success).toBe(true)
      expect(history?.[0]?.payload).toEqual({ name: 'test' })
    })
  })

  // ---- Plugin lifecycle ---------------------------------------------------

  it('calls plugin onBeforeSubmit and can prevent submission', async () => {
    const submit = createSuccessSubmit()
    const onBeforeSubmit = vi.fn().mockReturnValue(false)

    const { result } = renderHook(() =>
      useActionFormCore(submit, {
        defaultValues: { name: 'test' },
        plugins: [{ name: 'blocker', onBeforeSubmit }],
      }),
    )

    await act(async () => {
      await result.current.handleSubmit()()
    })

    await waitFor(() => {
      expect(onBeforeSubmit).toHaveBeenCalled()
      expect(submit).not.toHaveBeenCalled()
    })
  })

  it('calls plugin onSuccess after successful submission', async () => {
    const submit = createSuccessSubmit()
    const pluginOnSuccess = vi.fn()

    const { result } = renderHook(() =>
      useActionFormCore(submit, {
        defaultValues: { name: 'test' },
        plugins: [{ name: 'logger', onSuccess: pluginOnSuccess }],
      }),
    )

    await act(async () => {
      await result.current.handleSubmit()()
    })

    await waitFor(() => {
      expect(pluginOnSuccess).toHaveBeenCalledWith({ success: true, data: 'ok' }, { name: 'test' })
    })
  })

  it('calls plugin onMount and cleanup', () => {
    const cleanup = vi.fn()
    const onMount = vi.fn().mockReturnValue(cleanup)
    const submit = createSuccessSubmit()

    const { unmount } = renderHook(() =>
      useActionFormCore(submit, {
        plugins: [{ name: 'mounter', onMount }],
      }),
    )

    expect(onMount).toHaveBeenCalled()

    unmount()

    expect(cleanup).toHaveBeenCalled()
  })
})
