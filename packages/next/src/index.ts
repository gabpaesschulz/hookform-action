// hookform-action – public API (v3)
// ---------------------------------------------------------------------------
// Next.js adapter. Re-exports the core API plus the Next-specific
// useActionForm that handles Server Actions, FormData, and formAction.
// ---------------------------------------------------------------------------

// Next.js-specific adapter hook
export { useActionForm } from './use-action-form'

// Re-export everything from core for convenience
export {
  // Core hook (for advanced use cases)
  useActionFormCore,
  // Form component
  Form,
  type FormProps,
  // Types
  defaultErrorMapper,
  type FieldErrorRecord,
  type ActionResult,
  type ErrorMapper,
  type UseActionFormCoreOptions,
  type ActionFormState,
  type UseActionFormCoreReturn,
  type ClientValidationMode,
  type OptimisticReducer,
  type OptimisticState,
  type SubmitFunction,
  type ActionFormPlugin,
  type SubmissionRecord,
  // Persistence
  loadPersistedValues,
  savePersistedValues,
  clearPersistedValues,
  // React shim
  hasUseOptimistic,
  hasUseActionState,
  // withZod
  withZod,
  // V2 compat types
  isFormDataAction,
  hasAttachedSchema,
  type ServerAction,
  type JsonServerAction,
  type FormDataServerAction,
  type ZodServerAction,
  type InferActionResult,
  type UseActionFormOptions,
  type UseActionFormReturn,
} from 'hookform-action-core'
