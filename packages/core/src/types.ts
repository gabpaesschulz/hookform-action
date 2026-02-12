import type { DefaultValues, FieldValues, Mode, UseFormReturn } from 'react-hook-form'
import type { ZodSchema } from 'zod'

// ---------------------------------------------------------------------------
// Server Action type – supports both Next.js App Router conventions:
//   1. (data: any) => Promise<TResult>          – JSON / plain-object actions
//   2. (prevState, formData) => Promise<TResult> – classic useFormState actions
// ---------------------------------------------------------------------------

/**
 * A Server Action that receives a single JSON payload and returns a promise.
 */
export type JsonServerAction<TResult = unknown> = (data: unknown) => Promise<TResult>

/**
 * A Server Action that receives the previous state and a FormData.
 * This is the classic Next.js App Router / useFormState signature.
 */
export type FormDataServerAction<TResult = unknown> = (
  prevState: Awaited<TResult> | null,
  formData: FormData,
) => Promise<TResult>

/**
 * Represents a Next.js Server Action function signature.
 * Supports both the classic (prevState, formData) signature and the
 * simpler (data) => Promise signature for JSON-based actions.
 */
export type ServerAction<TResult = unknown> =
  | JsonServerAction<TResult>
  | FormDataServerAction<TResult>

/**
 * A Server Action created with `withZod` that has the schema attached.
 * This allows `useActionForm` to automatically infer the schema for
 * client-side validation.
 */
export type ZodServerAction<
  TSchema extends ZodSchema = ZodSchema,
  TResult = unknown,
> = ServerAction<TResult> & {
  __schema: TSchema
}

// ---------------------------------------------------------------------------
// Infer the result type of a Server Action
// ---------------------------------------------------------------------------

/**
 * Extracts the resolved return type from a Server Action.
 */
export type InferActionResult<TAction> = TAction extends JsonServerAction<infer R>
  ? Awaited<R>
  : TAction extends FormDataServerAction<infer R>
    ? Awaited<R>
    : never

// ---------------------------------------------------------------------------
// Standard field-level error shape returned by Zod `.flatten().fieldErrors`
// ---------------------------------------------------------------------------

/**
 * Record mapping field names to arrays of error messages.
 * This is the shape produced by `ZodError.flatten().fieldErrors`.
 */
export type FieldErrorRecord = Record<string, string[] | undefined>

// ---------------------------------------------------------------------------
// Default action result shape (what most Server Actions return)
// ---------------------------------------------------------------------------

/**
 * Standard result type from a Server Action that uses Zod validation.
 */
export interface ActionResult<TData = unknown> {
  success?: boolean
  errors?: FieldErrorRecord
  data?: TData
  message?: string
}

// ---------------------------------------------------------------------------
// Error mapper – converts the raw action result into RHF-compatible errors
// ---------------------------------------------------------------------------

/**
 * A function that takes the raw action result and extracts field errors.
 * Return `null` or `undefined` if there are no errors.
 */
export type ErrorMapper<TResult> = (result: TResult) => FieldErrorRecord | null | undefined

/**
 * Detect whether a Server Action uses the FormData signature (arity === 2)
 * or the JSON signature (arity <= 1).
 */
export function isFormDataAction<TResult>(
  action: ServerAction<TResult>,
): action is FormDataServerAction<TResult> {
  return action.length >= 2
}

/**
 * Default error mapper that works with the standard Zod flatten format:
 * `{ errors: { field: string[] } }`
 */
export function defaultErrorMapper<TResult>(result: TResult): FieldErrorRecord | null | undefined {
  if (
    result &&
    typeof result === 'object' &&
    'errors' in result &&
    result.errors &&
    typeof result.errors === 'object'
  ) {
    return result.errors as FieldErrorRecord
  }
  return null
}

/**
 * Check whether a Server Action was created with `withZod` and has
 * an attached schema.
 */
export function hasAttachedSchema<TResult>(
  action: ServerAction<TResult>,
): action is ZodServerAction<ZodSchema, TResult> {
  return '__schema' in action && (action as unknown as Record<string, unknown>).__schema != null
}

// ---------------------------------------------------------------------------
// Validation mode for client-side schema validation
// ---------------------------------------------------------------------------

/**
 * Controls when client-side Zod schema validation runs.
 * - `'onSubmit'` – validate only on submit (default, same as v1)
 * - `'onChange'` – validate on every field change
 * - `'onBlur'`  – validate when a field loses focus
 */
export type ClientValidationMode = 'onSubmit' | 'onChange' | 'onBlur'

// ---------------------------------------------------------------------------
// Optimistic UI types
// ---------------------------------------------------------------------------

/**
 * Reducer function for computing the optimistic state.
 * Receives the current data and the form values being submitted,
 * and returns the optimistic state to display immediately.
 */
export type OptimisticReducer<TOptimistic, TFieldValues extends FieldValues = FieldValues> = (
  currentData: TOptimistic,
  formValues: TFieldValues,
) => TOptimistic

/**
 * The optimistic state object returned by `useActionForm` when
 * `optimisticKey` is provided.
 */
export interface OptimisticState<TOptimistic> {
  /** The current optimistic data (updated instantly on submit). */
  data: TOptimistic
  /** Whether an optimistic update is pending (action in flight). */
  isPending: boolean
  /** Manually revert to the last confirmed state. */
  rollback: () => void
}

// ---------------------------------------------------------------------------
// Options for useActionForm (v2)
// ---------------------------------------------------------------------------

export interface UseActionFormOptions<
  TFieldValues extends FieldValues = FieldValues,
  TResult = ActionResult,
  TOptimistic = undefined,
> {
  /**
   * Default values for the form fields.
   * If `persistKey` is provided and stored data exists, persisted values
   * take precedence.
   */
  defaultValues?: DefaultValues<TFieldValues>

  /**
   * Validation mode passed to React Hook Form.
   * @default 'onSubmit'
   */
  mode?: Mode

  /**
   * When provided, enables transparent sessionStorage persistence.
   * The form state is saved under this key and restored on mount.
   */
  persistKey?: string

  /**
   * Custom function to extract field errors from the action result.
   * By default supports the Zod `.flatten().fieldErrors` format.
   */
  errorMapper?: ErrorMapper<TResult>

  /**
   * Callback fired after a successful submission (no field errors returned).
   */
  onSuccess?: (result: TResult) => void

  /**
   * Callback fired when the action throws or returns field errors.
   */
  onError?: (result: TResult | Error) => void

  /**
   * Debounce interval (ms) for sessionStorage persistence.
   * @default 300
   */
  persistDebounce?: number

  // ---- v2: Client-side Zod validation -------------------------------------

  /**
   * Zod schema for client-side validation.
   * If provided, fields are validated in real-time (based on `validationMode`).
   * If the action was created with `withZod`, the schema is auto-detected.
   */
  schema?: ZodSchema

  /**
   * Controls when client-side Zod schema validation runs.
   * Only takes effect when `schema` is provided (or inferred from `withZod`).
   * @default 'onSubmit'
   */
  validationMode?: ClientValidationMode

  // ---- v2: Optimistic UI --------------------------------------------------

  /**
   * Unique key identifying the optimistic state.
   * When provided (along with `optimisticData`), enables React 19's
   * `useOptimistic` integration.
   */
  optimisticKey?: string

  /**
   * Reducer that computes the optimistic state from the current data and
   * the form values being submitted.
   * Required when `optimisticKey` is set.
   */
  optimisticData?: OptimisticReducer<TOptimistic, TFieldValues>

  /**
   * Initial data for the optimistic state.
   * This is the "confirmed" state before any optimistic updates.
   */
  optimisticInitial?: TOptimistic
}

// ---------------------------------------------------------------------------
// Extended form state added on top of RHF's formState (v2)
// ---------------------------------------------------------------------------

export interface ActionFormState<TResult> {
  /** Whether the form is currently being submitted to the server action. */
  isSubmitting: boolean
  /** Whether the last submission was successful (no field errors). */
  isSubmitSuccessful: boolean
  /** Raw error record returned by the server action (via errorMapper). */
  submitErrors: FieldErrorRecord | null
  /** The full result from the last action invocation, if any. */
  actionResult: TResult | null
  /**
   * `true` while a transition is pending (React 19 `useTransition`).
   * Falls back to `isSubmitting` on React 18.
   */
  isPending: boolean
}

// ---------------------------------------------------------------------------
// Return type of useActionForm (v2)
// ---------------------------------------------------------------------------

export interface UseActionFormReturn<
  TFieldValues extends FieldValues = FieldValues,
  TResult = ActionResult,
  TOptimistic = undefined,
> extends Omit<UseFormReturn<TFieldValues>, 'handleSubmit'> {
  /**
   * Enhanced handleSubmit that submits to the Server Action.
   * Call with no arguments: `onSubmit={handleSubmit()}`.
   * Optionally pass an `onValid` callback that runs before calling the action.
   */
  handleSubmit: (
    onValid?: (data: TFieldValues) => void | Promise<void>,
  ) => (e?: React.BaseSyntheticEvent) => Promise<void>

  /**
   * Extended form state including server action status.
   */
  formState: UseFormReturn<TFieldValues>['formState'] & ActionFormState<TResult>

  /**
   * Manually set a server-side error on a specific field.
   */
  setSubmitError: (field: keyof TFieldValues & string, message: string) => void

  /**
   * Manually persist the current form state to sessionStorage.
   * Only works when `persistKey` is set.
   */
  persist: () => void

  /**
   * Clear persisted data from sessionStorage.
   * Only works when `persistKey` is set.
   */
  clearPersistedData: () => void

  /**
   * The underlying form action compatible with Next.js `<form action={…}>`.
   */
  formAction: (formData: FormData) => Promise<void>

  /**
   * Optimistic state (v2). Only populated when `optimisticKey` is provided.
   * Contains `data`, `isPending`, and `rollback()`.
   */
  optimistic: TOptimistic extends undefined ? undefined : OptimisticState<TOptimistic>
}
