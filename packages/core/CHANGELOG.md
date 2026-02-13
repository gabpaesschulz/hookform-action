# next-action-form

## 5.0.0

### Major Changes

- 44e3630: Initial V3 release. Introduces Hexagonal Architecture, React 19 support, and Standalone adapter.

### Minor Changes

- 212c2cd: read.me inclusion

### Patch Changes

- Add individual README.md files to each package for npm display.

## 4.0.0

### Major Changes

- Initial V3 release. Introduces Hexagonal Architecture, React 19 support, and Standalone adapter.
- 2337d6b: ## next-action-form v2.0.0

  ### 🚀 New Features

  - **React 19 support** – Uses `useActionState` and `useOptimistic` when available, with automatic React 18 fallback
  - **`isPending` via `useTransition`** – New `formState.isPending` flag powered by React's `useTransition` for reliable pending state
  - **Optimistic UI** – Built-in `useOptimistic` integration via `optimisticKey`, `optimisticData`, and `optimisticInitial` options. Returns `optimistic.data`, `optimistic.isPending`, and `optimistic.rollback()`
  - **Client-side Zod validation** – Pass a `schema` option (or use auto-detection from `withZod`) with `validationMode: 'onChange' | 'onBlur' | 'onSubmit'` for instant client-side validation before the server action runs
  - **Schema auto-detection** – `withZod()` now attaches the Zod schema to the action (`__schema`), enabling automatic client-side validation without passing `schema` separately
  - **Detection helpers** – New exports: `hasUseOptimistic`, `hasUseActionState`, `hasAttachedSchema()`

  ### 💥 Breaking Changes

  - `UseActionFormReturn` now has a third generic parameter `TOptimistic`
  - `formState` now includes `isPending: boolean`
  - `withZod()` return type includes `__schema` property

  ### 📦 Migration from v1

  1. Update your import – no API changes required for basic usage
  2. Replace `formState.isSubmitting` checks with `formState.isPending` for more reliable pending state
  3. Optionally add `schema` or `validationMode` for client-side validation
  4. Optionally add `optimisticKey` + `optimisticData` for optimistic UI

- 2337d6b: ## next-action-form v3.0.0

  ### 🌍 Framework-Agnostic Core

  The core logic has been decoupled from Next.js. `useActionFormCore` is a new framework-agnostic hook that accepts a generic `(data) => Promise<TResult>` submit function — no Server Actions, no FormData, no Next.js dependency.

  ### 🚀 New Packages

  - **`@next-action-form/standalone`** — Adapter for Vite, Remix, Astro, or any React SPA. Uses a `submit` function instead of a Server Action.
  - **`@next-action-form/next`** — Standalone Next.js adapter package (same API as the root `next-action-form` package).
  - **`@next-action-form/devtools`** — Floating debug panel (`<FormDevTool />`) for inspecting form state, submission history, and triggering debug actions. Inspired by TanStack Query DevTools.

  ### 🧩 Internal Plugin System

  New `ActionFormPlugin` interface with lifecycle hooks:

  - `onBeforeSubmit(data)` — runs before submit, return `false` to block
  - `onSuccess(result, data)` — runs after successful submission
  - `onError(error, data)` — runs after failed submission
  - `onMount()` — runs on mount, return cleanup function

  Plugins are passed via the `plugins` option in `useActionFormCore`. Not yet part of the public API.

  ### 📊 Submission History Tracking

  Every submission is recorded with id, timestamp, payload, response, error, duration, and success status. Accessible via `control._submissionHistory` for DevTools integration.

  ### 🔄 Zero Breaking Changes

  - All existing `next-action-form` v2 imports work identically
  - The `next` peer dependency is now optional (only needed for Server Actions)
  - The `<Form>` component now accepts both `UseActionFormReturn` and `UseActionFormCoreReturn`

  ### 📦 New Exports

  - `useActionFormCore` — framework-agnostic core hook
  - `SubmitFunction` — generic submit function type
  - `ActionFormPlugin` — plugin interface
  - `SubmissionRecord` — submission history record type
  - `UseActionFormCoreOptions` / `UseActionFormCoreReturn` — core option and return types
  - `./core` — new entry point for core-only imports
  - `./core-types` — new entry point for core type-only imports
  - `./zod` — alias for `./with-zod`
