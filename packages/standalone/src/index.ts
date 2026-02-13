// hookform-action-standalone – public API (v3)
// ---------------------------------------------------------------------------
// Standalone adapter for React apps without Next.js.
// Use with Vite, Remix, Astro, or any React SPA.
// ---------------------------------------------------------------------------

// Standalone adapter hook
export { useActionForm } from './use-action-form'
export type {
  StandaloneSubmitFunction,
  UseStandaloneActionFormOptions,
  UseStandaloneActionFormReturn,
} from './use-action-form'

// Re-export core utilities for convenience
export {
  // Core hook (for advanced use cases)
  useActionFormCore,
  // Form component
  Form,
  type FormProps,
  // withZod
  withZod,
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
} from 'hookform-action-core'
