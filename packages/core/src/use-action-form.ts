'use client'

import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { type DefaultValues, type FieldPath, type FieldValues, useForm } from 'react-hook-form'
import type { ZodError, ZodSchema } from 'zod'

import { clearPersistedValues, debounce, loadPersistedValues, savePersistedValues } from './persist'
import {
  hasUseOptimistic,
  useOptimistic as useOptimisticReact19,
  useTransition,
} from './react-shim'
import type {
  ActionFormState,
  ActionResult,
  ErrorMapper,
  FieldErrorRecord,
  OptimisticState,
  ServerAction,
  UseActionFormOptions,
  UseActionFormReturn,
} from './types'
import { defaultErrorMapper, hasAttachedSchema, isFormDataAction } from './types'

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
// Internal: client-side Zod validation helper
// ---------------------------------------------------------------------------

function validateWithSchema(
  schema: ZodSchema,
  values: Record<string, unknown>,
): FieldErrorRecord | null {
  const result = schema.safeParse(values)
  if (result.success) return null

  const zodError = result.error as ZodError
  const flat = zodError.flatten()
  const errors: FieldErrorRecord = {}

  for (const [field, messages] of Object.entries(flat.fieldErrors)) {
    if (messages && messages.length > 0) {
      errors[field] = messages as string[]
    }
  }

  return Object.keys(errors).length > 0 ? errors : null
}

// ---------------------------------------------------------------------------
// Internal: noop optimistic fallback for React 18
// ---------------------------------------------------------------------------

function useOptimisticFallback<T>(initial: T): [T, (value: T) => void] {
  const [state, setState] = useState<T>(initial)
  return [state, setState]
}

// ---------------------------------------------------------------------------
// useActionForm – the core hook (v2)
// ---------------------------------------------------------------------------

/**
 * `useActionForm` bridges React Hook Form with a Next.js Server Action.
 *
 * **v2 additions:**
 * - Uses `useTransition` for `isPending` state (React 18 & 19)
 * - Integrates with React 19's `useOptimistic` for instant UI updates
 * - Supports client-side Zod schema validation (`schema` + `validationMode`)
 * - Auto-detects schema from actions created with `withZod`
 *
 * @example
 * ```tsx
 * 'use client'
 * import { useActionForm } from 'hookform-action-core'
 * import { signupAction } from './actions'
 * import { signupSchema } from './schema'
 *
 * export function SignupForm() {
 *   const { register, handleSubmit, formState: { errors, isSubmitting, isPending } } =
 *     useActionForm(signupAction, {
 *       schema: signupSchema,
 *       validationMode: 'onChange',
 *     })
 *
 *   return (
 *     <form onSubmit={handleSubmit()}>
 *       <input {...register('email')} />
 *       {errors.email && <span>{errors.email.message}</span>}
 *       <button disabled={isPending}>Submit</button>
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
  const {
    defaultValues: optionDefaults,
    mode = 'onSubmit',
    persistKey,
    errorMapper = defaultErrorMapper as ErrorMapper<TResult>,
    onSuccess,
    onError,
    persistDebounce = 300,
    schema: optionsSchema,
    validationMode = 'onSubmit',
    optimisticKey,
    optimisticData,
    optimisticInitial,
  } = options

  // ----- Resolve Zod schema (explicit or auto-detected from withZod) -------

  const resolvedSchema = useMemo(
    () => resolveSchema(action, optionsSchema),
    [action, optionsSchema],
  )

  // ----- Resolve initial values (persisted > options) ----------------------

  // biome-ignore lint/correctness/useExhaustiveDependencies: intentionally run once on mount
  const resolvedDefaults = useMemo<DefaultValues<TFieldValues> | undefined>(() => {
    if (persistKey) {
      const persisted = loadPersistedValues<TFieldValues>(persistKey)
      if (persisted) {
        return {
          ...(optionDefaults as Record<string, unknown> | undefined),
          ...persisted,
        } as DefaultValues<TFieldValues>
      }
    }
    return optionDefaults
  }, [])

  // ----- React Hook Form ---------------------------------------------------

  const form = useForm<TFieldValues>({
    defaultValues: resolvedDefaults,
    mode,
  })

  // ----- useTransition (React 18 & 19) ------------------------------------

  const [isTransitioning, startTransition] = useTransition()

  // ----- Action state ------------------------------------------------------

  const [actionState, setActionState] = useState<ActionFormState<TResult>>({
    isSubmitting: false,
    isSubmitSuccessful: false,
    submitErrors: null,
    actionResult: null,
    isPending: false,
  })

  // Keep a ref to the latest action result so callbacks read fresh state
  const resultRef = useRef<TResult | null>(null)
  // Track the previous server state for the action
  const prevStateRef = useRef<Awaited<TResult> | null>(null)

  // ----- Optimistic UI (React 19 only) -------------------------------------

  const hasOptimistic = optimisticKey != null && optimisticData != null

  // We use the React 19 useOptimistic when available, otherwise a simple state fallback.
  const useOptimisticHook =
    hasUseOptimistic && useOptimisticReact19 ? useOptimisticReact19 : useOptimisticFallback

  const [optimisticState, setOptimistic] = useOptimisticHook(optimisticInitial as TOptimistic)

  // Track confirmed state for rollback
  const confirmedOptimisticRef = useRef<TOptimistic>(optimisticInitial as TOptimistic)

  const rollbackOptimistic = useCallback(() => {
    setOptimistic(confirmedOptimisticRef.current)
  }, [setOptimistic])

  // ----- Persistence -------------------------------------------------------

  const debouncedSave = useMemo(() => {
    if (!persistKey) return null
    return debounce((values: TFieldValues) => {
      savePersistedValues(persistKey, values)
    }, persistDebounce)
  }, [persistKey, persistDebounce])

  // Watch all fields and persist on change
  useEffect(() => {
    if (!persistKey || !debouncedSave) return

    const subscription = form.watch((values) => {
      debouncedSave(values as TFieldValues)
    })

    return () => subscription.unsubscribe()
  }, [persistKey, debouncedSave, form])

  // ----- Client-side Zod validation (onChange / onBlur) ---------------------

  useEffect(() => {
    if (!resolvedSchema || validationMode === 'onSubmit') return

    const subscription = form.watch((values, { name, type }) => {
      if (!name) return

      // For onBlur mode, only validate if the event type is blur
      // (RHF watch fires on all changes, so we validate on onChange mode always)
      if (validationMode === 'onChange' || type === 'blur') {
        // Validate the single changed field
        const fieldResult = resolvedSchema.safeParse(values)
        if (fieldResult.success) {
          // Clear any existing errors for this field
          form.clearErrors(name as FieldPath<TFieldValues>)
        } else {
          const zodError = fieldResult.error as ZodError
          const flat = zodError.flatten()
          const fieldErrors = flat.fieldErrors[name]

          if (fieldErrors && fieldErrors.length > 0) {
            form.setError(name as FieldPath<TFieldValues>, {
              type: 'validation',
              message: fieldErrors[0],
            })
          } else {
            form.clearErrors(name as FieldPath<TFieldValues>)
          }
        }
      }
    })

    return () => subscription.unsubscribe()
  }, [resolvedSchema, validationMode, form])

  // ----- Manual persist / clear --------------------------------------------

  const persist = useCallback(() => {
    if (!persistKey) return
    savePersistedValues(persistKey, form.getValues())
  }, [persistKey, form])

  const clearPersisted = useCallback(() => {
    if (!persistKey) return
    clearPersistedValues(persistKey)
  }, [persistKey])

  // ----- Set a server error on a field -------------------------------------

  const setSubmitError = useCallback(
    (field: keyof TFieldValues & string, message: string) => {
      form.setError(field as never, { type: 'server', message })
    },
    [form],
  )

  // ----- Map server errors to RHF ------------------------------------------

  const applyServerErrors = useCallback(
    (errors: FieldErrorRecord) => {
      for (const [field, messages] of Object.entries(errors)) {
        if (messages && messages.length > 0) {
          form.setError(field as never, {
            type: 'server',
            message: messages[0],
          })
        }
      }
    },
    [form],
  )

  // ----- Detect action arity ------------------------------------------------

  /** true when the action expects (prevState, formData) — arity >= 2 */
  const actionIsFormData = useMemo(() => isFormDataAction(action), [action])

  // ----- Core submit logic (shared between formAction & handleSubmit) ------

  const executeAction = useCallback(
    async (data: TFieldValues | FormData, isFormDataSubmission: boolean) => {
      // Client-side schema validation (for onSubmit mode)
      if (resolvedSchema && validationMode === 'onSubmit' && !(data instanceof FormData)) {
        const clientErrors = validateWithSchema(resolvedSchema, data as Record<string, unknown>)
        if (clientErrors) {
          applyServerErrors(clientErrors)
          setActionState({
            isSubmitting: false,
            isSubmitSuccessful: false,
            submitErrors: clientErrors,
            actionResult: null,
            isPending: false,
          })
          return
        }
      }

      setActionState((prev) => ({
        ...prev,
        isSubmitting: true,
        isPending: true,
        submitErrors: null,
      }))

      // Apply optimistic update before the action runs
      if (hasOptimistic && optimisticData && !(data instanceof FormData)) {
        const optimisticResult = optimisticData(
          confirmedOptimisticRef.current,
          data as TFieldValues,
        )
        setOptimistic(optimisticResult)
      }

      try {
        let result: TResult

        if (isFormDataSubmission && data instanceof FormData) {
          if (actionIsFormData) {
            result = await (
              action as (prev: Awaited<TResult> | null, fd: FormData) => Promise<TResult>
            )(prevStateRef.current, data)
          } else {
            // Convert FormData to plain object for JSON actions
            const obj: Record<string, unknown> = {}
            for (const [key, value] of data.entries()) {
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
            result = await (action as (d: unknown) => Promise<TResult>)(obj)
          }
        } else if (actionIsFormData) {
          // Build FormData from validated values for (prevState, formData) actions
          const formData = new FormData()
          for (const [key, value] of Object.entries(data as Record<string, unknown>)) {
            if (value instanceof File) {
              formData.append(key, value)
            } else if (value instanceof FileList) {
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
          result = await (
            action as (prev: Awaited<TResult> | null, fd: FormData) => Promise<TResult>
          )(prevStateRef.current, formData)
        } else {
          result = await (action as (d: unknown) => Promise<TResult>)(data)
        }

        resultRef.current = result
        prevStateRef.current = result as Awaited<TResult>

        const fieldErrors = errorMapper(result)

        if (fieldErrors && Object.keys(fieldErrors).length > 0) {
          applyServerErrors(fieldErrors)

          // Rollback optimistic on error
          if (hasOptimistic) {
            rollbackOptimistic()
          }

          setActionState({
            isSubmitting: false,
            isSubmitSuccessful: false,
            submitErrors: fieldErrors,
            actionResult: result,
            isPending: false,
          })
          onError?.(result)
        } else {
          // Success – update confirmed optimistic state
          if (hasOptimistic && optimisticData && !(data instanceof FormData)) {
            confirmedOptimisticRef.current = optimisticData(
              confirmedOptimisticRef.current,
              data as TFieldValues,
            )
          }

          // Clear persisted data
          if (persistKey) clearPersistedValues(persistKey)

          setActionState({
            isSubmitting: false,
            isSubmitSuccessful: true,
            submitErrors: null,
            actionResult: result,
            isPending: false,
          })
          onSuccess?.(result)
        }
      } catch (error) {
        // Rollback optimistic on throw
        if (hasOptimistic) {
          rollbackOptimistic()
        }

        setActionState((prev) => ({
          ...prev,
          isSubmitting: false,
          isSubmitSuccessful: false,
          isPending: false,
        }))
        onError?.(error instanceof Error ? error : new Error(String(error)))
      }
    },
    [
      action,
      actionIsFormData,
      errorMapper,
      applyServerErrors,
      onSuccess,
      onError,
      persistKey,
      resolvedSchema,
      validationMode,
      hasOptimistic,
      optimisticData,
      setOptimistic,
      rollbackOptimistic,
    ],
  )

  // ----- Form action (for Next.js <form action={…}>) -----------------------

  const formAction = useCallback(
    async (formData: FormData) => {
      // @ts-ignore – React 19 supports async transitions; React 18 ignores the promise
      startTransition(async () => {
        await executeAction(formData, true)
      })
    },
    [executeAction, startTransition],
  )

  // ----- handleSubmit wrapper ----------------------------------------------

  const handleSubmit = useCallback(
    (onValid?: (data: TFieldValues) => void | Promise<void>) => {
      return form.handleSubmit(async (data) => {
        // Run optional client-side callback first
        if (onValid) await onValid(data)

        // @ts-ignore – React 19 supports async transitions; React 18 ignores the promise
        startTransition(async () => {
          await executeAction(data, false)
        })
      })
    },
    [form, executeAction, startTransition],
  )

  // ----- Compose return value ----------------------------------------------

  const composedFormState = useMemo(
    () => ({
      ...form.formState,
      ...actionState,
      // RHF's own isSubmitting OR our action isSubmitting
      isSubmitting: form.formState.isSubmitting || actionState.isSubmitting,
      // isPending combines transition state with action state
      isPending: isTransitioning || actionState.isPending,
    }),
    [form.formState, actionState, isTransitioning],
  )

  // ----- Compose optimistic return -----------------------------------------

  const optimisticReturn = useMemo(() => {
    if (!hasOptimistic) return undefined
    return {
      data: optimisticState,
      isPending: isTransitioning || actionState.isPending,
      rollback: rollbackOptimistic,
    } as OptimisticState<TOptimistic>
  }, [hasOptimistic, optimisticState, isTransitioning, actionState.isPending, rollbackOptimistic])

  return {
    ...form,
    handleSubmit,
    formState: composedFormState,
    setSubmitError,
    persist,
    clearPersistedData: clearPersisted,
    formAction,
    optimistic: optimisticReturn,
  } as UseActionFormReturn<TFieldValues, TResult, TOptimistic>
}
