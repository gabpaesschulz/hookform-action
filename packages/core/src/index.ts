// hookform-action-core – public API (v3)
// ---------------------------------------------------------------------------
// The core package is framework-agnostic. It provides the base hook,
// types, utilities, and the React version shim.
// ---------------------------------------------------------------------------

// Core hook (framework-agnostic)
export { useActionFormCore } from './use-action-form-core'

// Core types
export {
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
} from './core-types'

// Form component (works with any adapter)
export { Form } from './form'
export type { FormProps } from './form'

// Persistence utilities
export { loadPersistedValues, savePersistedValues, clearPersistedValues, debounce } from './persist'

// React version detection utilities
export { hasUseOptimistic, hasUseActionState, useTransition } from './react-shim'

// withZod utility (framework-agnostic)
export { withZod } from './with-zod'

// ---------------------------------------------------------------------------
// V2 backward-compat re-exports
// ---------------------------------------------------------------------------
export {
  isFormDataAction,
  hasAttachedSchema,
  type ServerAction,
  type JsonServerAction,
  type FormDataServerAction,
  type ZodServerAction,
  type InferActionResult,
  type UseActionFormOptions,
  type UseActionFormReturn,
} from './types'

// Legacy: useActionForm (Next.js-coupled version for backward compat)
export { useActionForm } from './use-action-form'
