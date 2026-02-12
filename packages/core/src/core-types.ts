import type { FieldValues, DefaultValues, Mode, UseFormReturn } from "react-hook-form";
import type { ZodSchema } from "zod";

// ---------------------------------------------------------------------------
// Field-level error shape (Zod `.flatten().fieldErrors` compatible)
// ---------------------------------------------------------------------------

/**
 * Record mapping field names to arrays of error messages.
 * This is the shape produced by `ZodError.flatten().fieldErrors`.
 */
export type FieldErrorRecord = Record<string, string[] | undefined>;

// ---------------------------------------------------------------------------
// Default action result shape
// ---------------------------------------------------------------------------

/**
 * Standard result type from an action that uses Zod validation.
 */
export interface ActionResult<TData = unknown> {
  success?: boolean;
  errors?: FieldErrorRecord;
  data?: TData;
  message?: string;
}

// ---------------------------------------------------------------------------
// Error mapper – converts the raw action result into RHF-compatible errors
// ---------------------------------------------------------------------------

/**
 * A function that takes the raw action result and extracts field errors.
 * Return `null` or `undefined` if there are no errors.
 */
export type ErrorMapper<TResult> = (result: TResult) => FieldErrorRecord | null | undefined;

/**
 * Default error mapper that works with the standard Zod flatten format:
 * `{ errors: { field: string[] } }`
 */
export function defaultErrorMapper<TResult>(result: TResult): FieldErrorRecord | null | undefined {
  if (
    result &&
    typeof result === "object" &&
    "errors" in result &&
    result.errors &&
    typeof result.errors === "object"
  ) {
    return result.errors as FieldErrorRecord;
  }
  return null;
}

// ---------------------------------------------------------------------------
// Validation mode for client-side schema validation
// ---------------------------------------------------------------------------

/**
 * Controls when client-side Zod schema validation runs.
 * - `'onSubmit'` – validate only on submit (default)
 * - `'onChange'` – validate on every field change
 * - `'onBlur'`  – validate when a field loses focus
 */
export type ClientValidationMode = "onSubmit" | "onChange" | "onBlur";

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
) => TOptimistic;

/**
 * The optimistic state object returned by the hook when
 * `optimisticKey` is provided.
 */
export interface OptimisticState<TOptimistic> {
  /** The current optimistic data (updated instantly on submit). */
  data: TOptimistic;
  /** Whether an optimistic update is pending (action in flight). */
  isPending: boolean;
  /** Manually revert to the last confirmed state. */
  rollback: () => void;
}

// ---------------------------------------------------------------------------
// Generic submit function type (framework-agnostic)
// ---------------------------------------------------------------------------

/**
 * A generic async submit function. Adapters (Next.js, standalone, etc.)
 * are responsible for wrapping their specific action into this shape.
 */
export type SubmitFunction<TFieldValues extends FieldValues, TResult> = (data: TFieldValues) => Promise<TResult>;

// ---------------------------------------------------------------------------
// Plugin interface (internal, v3)
// ---------------------------------------------------------------------------

/**
 * Internal plugin interface for extending useActionFormCore behavior.
 * Not part of the public API yet — used for internal composition.
 */
export interface ActionFormPlugin<TFieldValues extends FieldValues = FieldValues, TResult = ActionResult> {
  /** Unique name for debugging */
  name: string;
  /** Called before submit. Return false to prevent submission. */
  onBeforeSubmit?: (data: TFieldValues) => boolean | Promise<boolean>;
  /** Called after a successful submission. */
  onSuccess?: (result: TResult, data: TFieldValues) => void;
  /** Called after a failed submission. */
  onError?: (error: TResult | Error, data: TFieldValues) => void;
  /** Called on mount. Return a cleanup function. */
  onMount?: () => (() => void) | void;
}

// ---------------------------------------------------------------------------
// Core options (framework-agnostic)
// ---------------------------------------------------------------------------

export interface UseActionFormCoreOptions<
  TFieldValues extends FieldValues = FieldValues,
  TResult = ActionResult,
  TOptimistic = undefined,
> {
  /**
   * Default values for the form fields.
   * If `persistKey` is provided and stored data exists, persisted values
   * take precedence.
   */
  defaultValues?: DefaultValues<TFieldValues>;

  /**
   * Validation mode passed to React Hook Form.
   * @default 'onSubmit'
   */
  mode?: Mode;

  /**
   * When provided, enables transparent sessionStorage persistence.
   * The form state is saved under this key and restored on mount.
   */
  persistKey?: string;

  /**
   * Custom function to extract field errors from the action result.
   * By default supports the Zod `.flatten().fieldErrors` format.
   */
  errorMapper?: ErrorMapper<TResult>;

  /**
   * Callback fired after a successful submission (no field errors returned).
   */
  onSuccess?: (result: TResult) => void;

  /**
   * Callback fired when the action throws or returns field errors.
   */
  onError?: (result: TResult | Error) => void;

  /**
   * Debounce interval (ms) for sessionStorage persistence.
   * @default 300
   */
  persistDebounce?: number;

  // ---- Client-side Zod validation -----------------------------------------

  /**
   * Zod schema for client-side validation.
   * If provided, fields are validated in real-time (based on `validationMode`).
   */
  schema?: ZodSchema;

  /**
   * Controls when client-side Zod schema validation runs.
   * Only takes effect when `schema` is provided.
   * @default 'onSubmit'
   */
  validationMode?: ClientValidationMode;

  // ---- Optimistic UI ------------------------------------------------------

  /**
   * Unique key identifying the optimistic state.
   * When provided (along with `optimisticData`), enables optimistic updates.
   */
  optimisticKey?: string;

  /**
   * Reducer that computes the optimistic state from the current data and
   * the form values being submitted.
   * Required when `optimisticKey` is set.
   */
  optimisticData?: OptimisticReducer<TOptimistic, TFieldValues>;

  /**
   * Initial data for the optimistic state.
   * This is the "confirmed" state before any optimistic updates.
   */
  optimisticInitial?: TOptimistic;

  // ---- Internal plugins (v3) ----------------------------------------------

  /**
   * Internal plugin array. Not part of the public API yet.
   * @internal
   */
  plugins?: ActionFormPlugin<TFieldValues, TResult>[];
}

// ---------------------------------------------------------------------------
// Core form state
// ---------------------------------------------------------------------------

export interface ActionFormState<TResult> {
  /** Whether the form is currently being submitted. */
  isSubmitting: boolean;
  /** Whether the last submission was successful (no field errors). */
  isSubmitSuccessful: boolean;
  /** Raw error record returned by the action (via errorMapper). */
  submitErrors: FieldErrorRecord | null;
  /** The full result from the last action invocation, if any. */
  actionResult: TResult | null;
  /**
   * `true` while a transition is pending.
   */
  isPending: boolean;
}

// ---------------------------------------------------------------------------
// Core return type
// ---------------------------------------------------------------------------

export interface UseActionFormCoreReturn<
  TFieldValues extends FieldValues = FieldValues,
  TResult = ActionResult,
  TOptimistic = undefined,
> extends Omit<UseFormReturn<TFieldValues>, "handleSubmit"> {
  /**
   * Enhanced handleSubmit that submits via the provided submit function.
   * Call with no arguments: `onSubmit={handleSubmit()}`.
   * Optionally pass an `onValid` callback that runs before submission.
   */
  handleSubmit: (
    onValid?: (data: TFieldValues) => void | Promise<void>,
  ) => (e?: React.BaseSyntheticEvent) => Promise<void>;

  /**
   * Extended form state including action status.
   */
  formState: UseFormReturn<TFieldValues>["formState"] & ActionFormState<TResult>;

  /**
   * Manually set a server-side error on a specific field.
   */
  setSubmitError: (field: keyof TFieldValues & string, message: string) => void;

  /**
   * Manually persist the current form state to sessionStorage.
   * Only works when `persistKey` is set.
   */
  persist: () => void;

  /**
   * Clear persisted data from sessionStorage.
   * Only works when `persistKey` is set.
   */
  clearPersistedData: () => void;

  /**
   * Optimistic state. Only populated when `optimisticKey` is provided.
   * Contains `data`, `isPending`, and `rollback()`.
   */
  optimistic: TOptimistic extends undefined ? undefined : OptimisticState<TOptimistic>;

  /**
   * A control object that exposes internals for DevTools.
   * @internal
   */
  control: UseFormReturn<TFieldValues>["control"] & {
    /** Submission history for DevTools inspection. */
    _submissionHistory?: SubmissionRecord<TResult>[];
    /** The core action form state. */
    _actionFormState?: ActionFormState<TResult>;
  };
}

// ---------------------------------------------------------------------------
// DevTools: submission history record
// ---------------------------------------------------------------------------

export interface SubmissionRecord<TResult> {
  /** Unique ID for this submission */
  id: string;
  /** Timestamp of submission */
  timestamp: number;
  /** The payload sent */
  payload: Record<string, unknown>;
  /** The response from the action */
  response: TResult | null;
  /** Error, if any */
  error: Error | null;
  /** Duration in ms */
  duration: number;
  /** Whether the submission was successful */
  success: boolean;
}
