'use client'

import { useCallback, useMemo } from 'react'
import type { FieldValues } from 'react-hook-form'
import type { ZodSchema } from 'zod'

import {
  type ActionResult,
  type SubmitFunction,
  hasAttachedSchema,
  useActionFormCore,
} from 'hookform-action-core'

import type {
  FormDataServerAction,
  ServerAction,
  UseActionFormOptions,
  UseActionFormReturn,
} from 'hookform-action-core'

import { isFormDataAction } from 'hookform-action-core'
import { useTransition } from 'hookform-action-core'

// ---------------------------------------------------------------------------
// Internal: resolve Zod schema from options or attached action
// ---------------------------------------------------------------------------

function resolveSchema<TResult>(
  action: ServerAction<TResult>,
  optionsSchema?: ZodSchema,
): ZodSchema | undefined {
  if (optionsSchema) return optionsSchema
  if (hasAttachedSchema(action)) return action.__schema
  return undefined
}

// ---------------------------------------------------------------------------
// useActionForm – Next.js adapter (v3)
// ---------------------------------------------------------------------------

/**
 * `useActionForm` bridges React Hook Form with a Next.js Server Action.
 *
 * This is the Next.js-specific adapter. It wraps `useActionFormCore` and
 * handles FormData conversion, prevState tracking, and the `formAction`
 * callback for `<form action={…}>`.
 *
 * **The API is 100% backward-compatible with v2.**
 *
 * @example
 * ```tsx
 * 'use client'
 * import { useActionForm } from 'hookform-action'
 * import { signupAction } from './actions'
 *
 * export function SignupForm() {
 *   const { register, handleSubmit, formState } =
 *     useActionForm(signupAction, {
 *       schema: signupSchema,
 *       validationMode: 'onChange',
 *     })
 *
 *   return (
 *     <form onSubmit={handleSubmit()}>
 *       <input {...register('email')} />
 *       <button disabled={formState.isPending}>Submit</button>
 *     </form>
 *   )
 * }
 * ```
 */
export function useActionForm<
  TFieldValues extends FieldValues = FieldValues,
  TResult = ActionResult,
  TOptimistic = undefined,
>(
  action: ServerAction<TResult>,
  options: UseActionFormOptions<TFieldValues, TResult, TOptimistic> = {},
): UseActionFormReturn<TFieldValues, TResult, TOptimistic> {
  const { schema: optionsSchema, ...restOptions } = options

  // Auto-detect schema from withZod-wrapped actions
  const resolvedSchema = useMemo(
    () => resolveSchema(action, optionsSchema),
    [action, optionsSchema],
  )

  // Detect whether the action uses the FormData signature
  const actionIsFormData = useMemo(() => isFormDataAction(action), [action])

  // Track previous state for FormData actions
  const prevStateRef = useMemo(() => ({ current: null as Awaited<TResult> | null }), [])

  // Create the submit function that bridges Server Actions to the core
  const submit: SubmitFunction<TFieldValues, TResult> = useCallback(
    async (data: TFieldValues) => {
      let result: TResult

      if (actionIsFormData) {
        // Build FormData from validated values for (prevState, formData) actions
        const formData = new FormData()
        for (const [key, value] of Object.entries(data as Record<string, unknown>)) {
          if (value instanceof File) {
            formData.append(key, value)
          } else if (typeof FileList !== 'undefined' && value instanceof FileList) {
            for (let i = 0; i < value.length; i++) {
              formData.append(key, value[i] as File)
            }
          } else if (Array.isArray(value)) {
            for (const item of value) {
              formData.append(key, String(item))
            }
          } else if (value !== null && value !== undefined) {
            formData.append(key, String(value))
          }
        }
        result = await (action as FormDataServerAction<TResult>)(prevStateRef.current, formData)
      } else {
        result = await (action as (d: TFieldValues) => Promise<TResult>)(data)
      }

      prevStateRef.current = result as Awaited<TResult>
      return result
    },
    [action, actionIsFormData, prevStateRef],
  )

  // Use the core hook with the bridged submit
  const coreResult = useActionFormCore<TFieldValues, TResult, TOptimistic>(submit, {
    ...restOptions,
    schema: resolvedSchema,
  })

  // Create formAction for <form action={…}> support
  const [, startTransition] = useTransition()

  const formAction = useCallback(
    async (formData: FormData) => {
      // @ts-ignore – React 19 supports async transitions
      startTransition(async () => {
        let result: TResult

        if (actionIsFormData) {
          result = await (action as FormDataServerAction<TResult>)(prevStateRef.current, formData)
        } else {
          // Convert FormData to plain object for JSON actions
          const obj: Record<string, unknown> = {}
          for (const [key, value] of formData.entries()) {
            if (key in obj) {
              const existing = obj[key]
              if (Array.isArray(existing)) {
                existing.push(value)
              } else {
                obj[key] = [existing, value]
              }
            } else {
              obj[key] = value
            }
          }
          result = await (action as (d: Record<string, unknown>) => Promise<TResult>)(obj)
        }

        prevStateRef.current = result as Awaited<TResult>
      })
    },
    [action, actionIsFormData, startTransition, prevStateRef],
  )

  return {
    ...coreResult,
    formAction,
  } as UseActionFormReturn<TFieldValues, TResult, TOptimistic>
}
