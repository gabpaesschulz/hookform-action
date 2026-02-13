'use client'

import { useCallback } from 'react'
import type { FieldValues } from 'react-hook-form'

import {
  type ActionResult,
  type SubmitFunction,
  type UseActionFormCoreOptions,
  type UseActionFormCoreReturn,
  useActionFormCore,
} from 'hookform-action-core'

// ---------------------------------------------------------------------------
// Standalone-specific types
// ---------------------------------------------------------------------------

/**
 * A generic async submit function provided by the user.
 * In standalone mode there are no Server Actions — the user provides
 * a plain async function (e.g. wrapping fetch, axios, etc.).
 */
export type StandaloneSubmitFunction<TFieldValues extends FieldValues, TResult> = (
  data: TFieldValues,
) => Promise<TResult>

/**
 * Options for `useActionForm` in standalone mode.
 * Identical to the core options but with `submit` as a required top-level option.
 */
export interface UseStandaloneActionFormOptions<
  TFieldValues extends FieldValues = FieldValues,
  TResult = ActionResult,
  TOptimistic = undefined,
> extends UseActionFormCoreOptions<TFieldValues, TResult, TOptimistic> {
  /**
   * The async function that handles form submission.
   *
   * @example
   * ```ts
   * submit: async (data) => {
   *   const res = await fetch('/api/submit', {
   *     method: 'POST',
   *     body: JSON.stringify(data),
   *     headers: { 'Content-Type': 'application/json' },
   *   })
   *   return res.json()
   * }
   * ```
   */
  submit: StandaloneSubmitFunction<TFieldValues, TResult>
}

/**
 * Return type of `useActionForm` in standalone mode.
 * Same as core return (no `formAction` since there are no Server Actions).
 */
export type UseStandaloneActionFormReturn<
  TFieldValues extends FieldValues = FieldValues,
  TResult = ActionResult,
  TOptimistic = undefined,
> = UseActionFormCoreReturn<TFieldValues, TResult, TOptimistic>

// ---------------------------------------------------------------------------
// useActionForm – Standalone adapter (v3)
// ---------------------------------------------------------------------------

/**
 * `useActionForm` for standalone React apps (Vite, Remix, Astro, SPAs).
 *
 * Provides the same API as the Next.js version but instead of a Server Action,
 * you pass a plain `submit` function.
 *
 * @example
 * ```tsx
 * import { useActionForm } from 'hookform-action-standalone'
 * import { z } from 'zod'
 *
 * const schema = z.object({
 *   email: z.string().email(),
 *   password: z.string().min(8),
 * })
 *
 * function LoginForm() {
 *   const { register, handleSubmit, formState } = useActionForm({
 *     submit: async (data) => {
 *       const res = await fetch('/api/login', {
 *         method: 'POST',
 *         body: JSON.stringify(data),
 *         headers: { 'Content-Type': 'application/json' },
 *       })
 *       return res.json()
 *     },
 *     schema,
 *     validationMode: 'onChange',
 *   })
 *
 *   return (
 *     <form onSubmit={handleSubmit()}>
 *       <input {...register('email')} />
 *       <input {...register('password')} type="password" />
 *       <button disabled={formState.isPending}>Login</button>
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
  options: UseStandaloneActionFormOptions<TFieldValues, TResult, TOptimistic>,
): UseStandaloneActionFormReturn<TFieldValues, TResult, TOptimistic> {
  const { submit, ...coreOptions } = options

  // The submit function is already in the right shape for the core
  const submitFn: SubmitFunction<TFieldValues, TResult> = useCallback(
    async (data: TFieldValues) => {
      return submit(data)
    },
    [submit],
  )

  return useActionFormCore<TFieldValues, TResult, TOptimistic>(submitFn, coreOptions)
}
