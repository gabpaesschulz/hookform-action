import { act, renderHook, waitFor } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import { z } from 'zod'
import type { JsonServerAction } from '../types'
import { useActionForm } from '../use-action-form'
import { withZod } from '../with-zod'

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

const signupSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
})

/** JSON action that always succeeds */
function createSuccessAction(): JsonServerAction<{ success: true }> {
  return vi.fn(async (_data: unknown) => ({ success: true as const }))
}

// ---------------------------------------------------------------------------
// Tests: Explicit schema validation
// ---------------------------------------------------------------------------

describe('useActionForm – client-side Zod validation (explicit schema)', () => {
  it('validates on submit by default and blocks submission on error', async () => {
    const action = createSuccessAction()

    const { result } = renderHook(() =>
      useActionForm(action, {
        defaultValues: { email: 'invalid', password: 'short' },
        schema: signupSchema,
        validationMode: 'onSubmit',
      }),
    )

    await act(async () => {
      const handler = result.current.handleSubmit()
      await handler()
    })

    await waitFor(() => {
      // Action should NOT have been called because client validation failed
      expect(action).not.toHaveBeenCalled()
      // Errors should be set
      expect(result.current.formState.submitErrors).not.toBeNull()
    })
  })

  it('allows submission when client validation passes', async () => {
    const action = createSuccessAction()

    const { result } = renderHook(() =>
      useActionForm(action, {
        defaultValues: { email: 'valid@test.com', password: '12345678' },
        schema: signupSchema,
        validationMode: 'onSubmit',
      }),
    )

    await act(async () => {
      const handler = result.current.handleSubmit()
      await handler()
    })

    await waitFor(() => {
      expect(action).toHaveBeenCalled()
      expect(result.current.formState.isSubmitSuccessful).toBe(true)
    })
  })

  it('sets specific field errors from client validation', async () => {
    const action = createSuccessAction()

    const { result } = renderHook(() =>
      useActionForm(action, {
        defaultValues: { email: 'bad', password: '12345678' },
        schema: signupSchema,
        validationMode: 'onSubmit',
      }),
    )

    await act(async () => {
      const handler = result.current.handleSubmit()
      await handler()
    })

    await waitFor(() => {
      // Only email should have an error
      const emailState = result.current.getFieldState('email')
      expect(emailState.error?.message).toBe('Invalid email address')
    })
  })

  it('validates onChange when validationMode is onChange', async () => {
    const action = createSuccessAction()

    const { result } = renderHook(() =>
      useActionForm(action, {
        defaultValues: { email: '', password: '' },
        schema: signupSchema,
        validationMode: 'onChange',
      }),
    )

    // Trigger a change with invalid value
    act(() => {
      result.current.setValue('email', 'bad-email', { shouldDirty: true })
    })

    // Wait for the watch subscription to fire
    await waitFor(() => {
      const emailState = result.current.getFieldState('email')
      expect(emailState.error?.message).toBe('Invalid email address')
    })
  })

  it('clears errors when field becomes valid on onChange', async () => {
    const action = createSuccessAction()

    const { result } = renderHook(() =>
      useActionForm(action, {
        defaultValues: { email: '', password: '' },
        schema: signupSchema,
        validationMode: 'onChange',
      }),
    )

    // Set invalid value
    act(() => {
      result.current.setValue('email', 'bad', { shouldDirty: true })
    })

    await waitFor(() => {
      const emailState = result.current.getFieldState('email')
      expect(emailState.error?.message).toBe('Invalid email address')
    })

    // Set valid value
    act(() => {
      result.current.setValue('email', 'valid@test.com', { shouldDirty: true })
    })

    await waitFor(() => {
      const emailState = result.current.getFieldState('email')
      expect(emailState.error).toBeUndefined()
    })
  })
})

// ---------------------------------------------------------------------------
// Tests: Auto-detected schema from withZod
// ---------------------------------------------------------------------------

describe('useActionForm – auto-detected schema from withZod', () => {
  it('withZod attaches __schema to the action', () => {
    const action = withZod(signupSchema, async (_data) => ({ success: true as const }))
    expect(action.__schema).toBe(signupSchema)
  })

  it('auto-detects schema from withZod action and validates on submit', async () => {
    const handler = vi.fn(async (data: unknown) => ({
      success: true as const,
      data,
    }))
    const action = withZod(signupSchema, handler)

    const { result } = renderHook(() =>
      useActionForm(action, {
        defaultValues: { email: 'invalid', password: 'short' },
        // No explicit schema – should auto-detect from action.__schema
        validationMode: 'onSubmit',
      }),
    )

    await act(async () => {
      const handler = result.current.handleSubmit()
      await handler()
    })

    await waitFor(() => {
      // Handler should NOT have been called since client validation fails
      expect(handler).not.toHaveBeenCalled()
      expect(result.current.formState.submitErrors).not.toBeNull()
    })
  })

  it('auto-detected schema validates onChange', async () => {
    const action = withZod(signupSchema, async (_data) => ({
      success: true as const,
    }))

    const { result } = renderHook(() =>
      useActionForm(action, {
        defaultValues: { email: '', password: '' },
        // Auto-detects schema, validates on change
        validationMode: 'onChange',
      }),
    )

    act(() => {
      result.current.setValue('email', 'bad', { shouldDirty: true })
    })

    await waitFor(() => {
      const emailState = result.current.getFieldState('email')
      expect(emailState.error?.message).toBe('Invalid email address')
    })
  })

  it('explicit schema takes priority over auto-detected', async () => {
    const customSchema = z.object({
      email: z.string().email('Custom error message'),
      password: z.string().min(1),
    })

    const action = withZod(signupSchema, async (_data) => ({
      success: true as const,
    }))

    const { result } = renderHook(() =>
      useActionForm(action, {
        defaultValues: { email: 'bad', password: '12345678' },
        schema: customSchema, // This should take priority
        validationMode: 'onSubmit',
      }),
    )

    await act(async () => {
      const handler = result.current.handleSubmit()
      await handler()
    })

    await waitFor(() => {
      const emailState = result.current.getFieldState('email')
      expect(emailState.error?.message).toBe('Custom error message') // From custom schema, not withZod
    })
  })
})

// ---------------------------------------------------------------------------
// Tests: isPending state (useTransition integration)
// ---------------------------------------------------------------------------

describe('useActionForm – isPending / useTransition', () => {
  it('formState includes isPending property', () => {
    const action = createSuccessAction()
    const { result } = renderHook(() =>
      useActionForm(action, {
        defaultValues: { email: '' },
      }),
    )

    expect(result.current.formState.isPending).toBe(false)
  })

  it('isPending resolves to false after successful submission', async () => {
    const action = createSuccessAction()
    const { result } = renderHook(() =>
      useActionForm(action, {
        defaultValues: { email: 'test@test.com', password: '12345678' },
      }),
    )

    await act(async () => {
      const handler = result.current.handleSubmit()
      await handler()
    })

    await waitFor(() => {
      expect(result.current.formState.isPending).toBe(false)
      expect(result.current.formState.isSubmitSuccessful).toBe(true)
    })
  })
})
