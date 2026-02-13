# @next-action-form/next

## 5.0.0

### Major Changes

- 44e3630: Initial V3 release. Introduces Hexagonal Architecture, React 19 support, and Standalone adapter.

### Minor Changes

- 212c2cd: read.me inclusion

### Patch Changes

- Add individual README.md files to each package for npm display.
- Updated dependencies
- Updated dependencies [212c2cd]
- Updated dependencies [44e3630]
  - hookform-action-core@5.0.0

## 4.0.0

### Major Changes

- Initial V3 release. Introduces Hexagonal Architecture, React 19 support, and Standalone adapter.
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

### Patch Changes

- Updated dependencies
- Updated dependencies [2337d6b]
- Updated dependencies [2337d6b]
  - next-action-form@4.0.0
