---
"next-action-form": major
---

## next-action-form v2.0.0

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
