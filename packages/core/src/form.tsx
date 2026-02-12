'use client'

import type { FormHTMLAttributes, ReactNode } from 'react'
import { type FieldValues, FormProvider, type UseFormReturn } from 'react-hook-form'

import type { UseActionFormCoreReturn } from './core-types'

// ---------------------------------------------------------------------------
// Props
// ---------------------------------------------------------------------------

export interface FormProps<TFieldValues extends FieldValues = FieldValues, TResult = unknown>
  extends Omit<FormHTMLAttributes<HTMLFormElement>, 'action' | 'onSubmit'> {
  /**
   * The return value from `useActionForm` (any adapter) or `useActionFormCore`.
   * Provides the form methods and the action integration.
   */
  form: UseActionFormCoreReturn<TFieldValues, TResult, any> & {
    /** formAction is optional – only provided by the Next.js adapter */
    formAction?: (formData: FormData) => Promise<void>
  }

  /**
   * Form content. Fields can use `useFormContext()` to access the RHF API.
   */
  children: ReactNode

  /**
   * Optional callback executed with validated data before the action is called.
   */
  onValid?: (data: TFieldValues) => void | Promise<void>
}

// ---------------------------------------------------------------------------
// <Form /> component
// ---------------------------------------------------------------------------

/**
 * Headless `<Form>` component that connects React Hook Form with a Server Action.
 *
 * It wraps children in a `<FormProvider>` so any nested component can call
 * `useFormContext()`. The `onSubmit` handler is wired automatically.
 *
 * @example
 * ```tsx
 * const form = useActionForm(signupAction)
 *
 * <Form form={form}>
 *   <input {...form.register('email')} />
 *   <button type="submit" disabled={form.formState.isSubmitting}>
 *     Submit
 *   </button>
 * </Form>
 * ```
 */
export function Form<TFieldValues extends FieldValues = FieldValues, TResult = unknown>({
  form,
  children,
  onValid,
  ...rest
}: FormProps<TFieldValues, TResult>) {
  // Destructure the RHF-compatible form methods for the provider
  const { handleSubmit, formAction, optimistic, ...formMethods } = form

  return (
    <FormProvider {...(formMethods as unknown as UseFormReturn<TFieldValues>)}>
      <form {...rest} onSubmit={handleSubmit(onValid)}>
        {children}
      </form>
    </FormProvider>
  )
}
