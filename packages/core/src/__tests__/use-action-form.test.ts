import { act, renderHook, waitFor } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import type { FormDataServerAction, JsonServerAction } from '../types'
import { useActionForm } from '../use-action-form'

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/** Classic FormData action (arity 2) */
function createSuccessAction(): FormDataServerAction<{ success: true; data: string }> {
  return vi.fn(async (_prev: unknown, _fd: FormData) => ({ success: true as const, data: 'ok' }))
}

/** Classic FormData action that returns errors (arity 2) */
function createErrorAction(): FormDataServerAction<{
  errors: { email: string[]; name?: string[] }
}> {
  return vi.fn(async (_prev: unknown, _fd: FormData) => ({
    errors: { email: ['Invalid email address'], name: ['Name is required'] },
  }))
}

/** Classic FormData action that throws (arity 2) */
function createThrowingAction(): FormDataServerAction<{ success: true }> {
  return vi.fn(async (_prev: unknown, _fd: FormData) => {
    throw new Error('Network failure')
  })
}

/** JSON action (arity 1) – success */
function createJsonSuccessAction(): JsonServerAction<{ success: true; data: string }> {
  return vi.fn(async (_data: unknown) => ({ success: true as const, data: 'json-ok' }))
}

/** JSON action (arity 1) – returns errors */
function createJsonErrorAction(): JsonServerAction<{
  errors: { email: string[] }
}> {
  return vi.fn(async (_data: unknown) => ({
    errors: { email: ['Invalid email from JSON action'] },
  }))
}

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe('useActionForm', () => {
  beforeEach(() => {
    sessionStorage.clear()
  })

  // ---- Basic rendering ----------------------------------------------------

  it('returns all expected properties', () => {
    const action = createSuccessAction()
    const { result } = renderHook(() => useActionForm(action))

    expect(result.current.register).toBeDefined()
    expect(result.current.handleSubmit).toBeDefined()
    expect(result.current.formState).toBeDefined()
    expect(result.current.setSubmitError).toBeDefined()
    expect(result.current.persist).toBeDefined()
    expect(result.current.clearPersistedData).toBeDefined()
    expect(result.current.formAction).toBeDefined()
  })

  it('uses provided defaultValues', () => {
    const action = createSuccessAction()
    const { result } = renderHook(() =>
      useActionForm(action, {
        defaultValues: { email: 'test@example.com' },
      }),
    )

    expect(result.current.getValues('email')).toBe('test@example.com')
  })

  // ---- Successful submission ----------------------------------------------

  it('submits successfully and updates action state', async () => {
    const action = createSuccessAction()
    const onSuccess = vi.fn()

    const { result } = renderHook(() =>
      useActionForm(action, {
        defaultValues: { email: 'user@test.com' },
        onSuccess,
      }),
    )

    await act(async () => {
      const handler = result.current.handleSubmit()
      await handler()
    })

    await waitFor(() => {
      expect(result.current.formState.isSubmitSuccessful).toBe(true)
      expect(result.current.formState.submitErrors).toBeNull()
      expect(result.current.formState.actionResult).toEqual({
        success: true,
        data: 'ok',
      })
      expect(onSuccess).toHaveBeenCalledWith({ success: true, data: 'ok' })
    })
  })

  // ---- Error mapping ------------------------------------------------------

  it('maps server errors to RHF fields automatically', async () => {
    const action = createErrorAction()
    const onError = vi.fn()

    const { result } = renderHook(() =>
      useActionForm(action, {
        defaultValues: { email: '', name: '' },
        onError,
      }),
    )

    await act(async () => {
      const handler = result.current.handleSubmit()
      await handler()
    })

    await waitFor(() => {
      expect(result.current.formState.isSubmitSuccessful).toBe(false)
      expect(result.current.formState.submitErrors).toEqual({
        email: ['Invalid email address'],
        name: ['Name is required'],
      })
      // Use getFieldState to check RHF errors (avoids proxy subscription issue in tests)
      const emailState = result.current.getFieldState('email')
      const nameState = result.current.getFieldState('name')
      expect(emailState.error?.message).toBe('Invalid email address')
      expect(nameState.error?.message).toBe('Name is required')
      expect(onError).toHaveBeenCalled()
    })
  })

  // ---- setSubmitError -----------------------------------------------------

  it('allows manually setting a server error', async () => {
    const action = createSuccessAction()
    const { result } = renderHook(() => useActionForm(action, { defaultValues: { email: '' } }))

    act(() => {
      result.current.setSubmitError('email', 'Already taken')
    })

    await waitFor(() => {
      const emailState = result.current.getFieldState('email')
      expect(emailState.error?.message).toBe('Already taken')
      expect(emailState.error?.type).toBe('server')
    })
  })

  // ---- Throwing action ----------------------------------------------------

  it('handles action that throws an error', async () => {
    const action = createThrowingAction()
    const onError = vi.fn()

    const { result } = renderHook(() =>
      useActionForm(action, {
        defaultValues: { email: '' },
        onError,
      }),
    )

    await act(async () => {
      const handler = result.current.handleSubmit()
      await handler()
    })

    await waitFor(() => {
      expect(result.current.formState.isSubmitSuccessful).toBe(false)
      expect(result.current.formState.isSubmitting).toBe(false)
      expect(onError).toHaveBeenCalledWith(expect.any(Error))
    })
  })

  // ---- Custom error mapper ------------------------------------------------

  it('supports custom error mapper', async () => {
    const action: FormDataServerAction<{ validationErrors: { field: string; msg: string }[] }> =
      vi.fn(async (_prev: unknown, _fd: FormData) => ({
        validationErrors: [{ field: 'email', msg: 'Bad email' }],
      }))

    const { result } = renderHook(() =>
      useActionForm(action, {
        defaultValues: { email: '' },
        errorMapper: (res) => {
          if ('validationErrors' in res && Array.isArray(res.validationErrors)) {
            const errors: Record<string, string[]> = {}
            for (const err of res.validationErrors) {
              errors[err.field] = [err.msg]
            }
            return errors
          }
          return null
        },
      }),
    )

    await act(async () => {
      const handler = result.current.handleSubmit()
      await handler()
    })

    await waitFor(() => {
      const emailState = result.current.getFieldState('email')
      expect(emailState.error?.message).toBe('Bad email')
    })
  })

  // ---- onValid callback ---------------------------------------------------

  it('calls onValid callback before submitting', async () => {
    const action = createSuccessAction()
    const onValid = vi.fn()

    const { result } = renderHook(() =>
      useActionForm(action, { defaultValues: { email: 'a@b.com' } }),
    )

    await act(async () => {
      const handler = result.current.handleSubmit(onValid)
      await handler()
    })

    expect(onValid).toHaveBeenCalledWith({ email: 'a@b.com' })
    expect(action).toHaveBeenCalled()
  })

  // ---- formAction ---------------------------------------------------------

  it('formAction submits directly with FormData', async () => {
    const action = createSuccessAction()
    const { result } = renderHook(() => useActionForm(action))

    const fd = new FormData()
    fd.append('email', 'direct@test.com')

    await act(async () => {
      await result.current.formAction(fd)
    })

    await waitFor(() => {
      expect(action).toHaveBeenCalledWith(null, fd)
      expect(result.current.formState.isSubmitSuccessful).toBe(true)
    })
  })

  // =========================================================================
  // JSON action tests (arity 1)
  // =========================================================================

  describe('JSON actions (arity 1)', () => {
    it('submits successfully with a JSON action', async () => {
      const action = createJsonSuccessAction()
      const onSuccess = vi.fn()

      const { result } = renderHook(() =>
        useActionForm(action, {
          defaultValues: { email: 'json@test.com' },
          onSuccess,
        }),
      )

      await act(async () => {
        const handler = result.current.handleSubmit()
        await handler()
      })

      await waitFor(() => {
        expect(result.current.formState.isSubmitSuccessful).toBe(true)
        expect(result.current.formState.actionResult).toEqual({
          success: true,
          data: 'json-ok',
        })
        expect(onSuccess).toHaveBeenCalledWith({ success: true, data: 'json-ok' })
        // The action should have been called with a plain object, NOT FormData
        expect(action).toHaveBeenCalledWith({ email: 'json@test.com' })
      })
    })

    it('maps errors from a JSON action to RHF fields', async () => {
      const action = createJsonErrorAction()
      const onError = vi.fn()

      const { result } = renderHook(() =>
        useActionForm(action, {
          defaultValues: { email: '' },
          onError,
        }),
      )

      await act(async () => {
        const handler = result.current.handleSubmit()
        await handler()
      })

      await waitFor(() => {
        expect(result.current.formState.isSubmitSuccessful).toBe(false)
        expect(result.current.formState.submitErrors).toEqual({
          email: ['Invalid email from JSON action'],
        })
        const emailState = result.current.getFieldState('email')
        expect(emailState.error?.message).toBe('Invalid email from JSON action')
        expect(onError).toHaveBeenCalled()
      })
    })

    it('formAction converts FormData to object for JSON actions', async () => {
      const action = createJsonSuccessAction()
      const { result } = renderHook(() => useActionForm(action))

      const fd = new FormData()
      fd.append('email', 'fd-to-json@test.com')

      await act(async () => {
        await result.current.formAction(fd)
      })

      await waitFor(() => {
        // JSON action should receive a plain object, not FormData
        expect(action).toHaveBeenCalledWith({ email: 'fd-to-json@test.com' })
        expect(result.current.formState.isSubmitSuccessful).toBe(true)
      })
    })
  })
})
