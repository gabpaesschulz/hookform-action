<p align="center">
  <h1 align="center">⚡ hookform-action</h1>
  <p align="center">
    Seamless integration between <strong>React Hook Form</strong> and <strong>any React framework</strong><br />
    with Zod validation, automatic type inference, optimistic UI, multi-step persistence, and DevTools.
  </p>
</p>

<p align="center">
  <a href="https://www.npmjs.com/package/hookform-action-core"><img src="https://img.shields.io/npm/v/hookform-action-core?style=flat-square&color=5c7cfa" alt="npm version" /></a>
  <a href="https://www.npmjs.com/package/hookform-action-core"><img src="https://img.shields.io/npm/dm/hookform-action-core?style=flat-square&color=748ffc" alt="npm downloads" /></a>
  <a href="https://github.com/gabpaesschulz/hookform-action/actions"><img src="https://img.shields.io/github/actions/workflow/status/gabpaesschulz/hookform-action/ci.yml?style=flat-square" alt="CI" /></a>
  <a href="https://github.com/gabpaesschulz/hookform-action/blob/main/LICENSE"><img src="https://img.shields.io/npm/l/hookform-action-core?style=flat-square" alt="license" /></a>
</p>

---

## The Problem

Connecting React Hook Form with server-side actions requires tons of boilerplate: manual FormData conversion, error mapping, state management, and type juggling.

**hookform-action** solves this in one hook — for **Next.js Server Actions**, **Vite SPAs**, **Remix**, **Astro**, or any React app.

## Packages

| Package                                             | Description                          |
| --------------------------------------------------- | ------------------------------------ |
| [`hookform-action-core`](packages/core)             | Core library (framework-agnostic)    |
| [`hookform-action`](packages/next)                  | Next.js adapter (⭐ main install)    |
| [`hookform-action-standalone`](packages/standalone) | Adapter for Vite, Remix, Astro, SPAs |
| [`hookform-action-devtools`](packages/devtools)     | Floating debug panel (FormDevTool)   |

## What's New in v3

- 🌍 **Framework-Agnostic Core** — Core decoupled from Next.js. Use with any React framework
- 🚀 **Standalone Adapter** — `hookform-action-standalone` for Vite, Remix, Astro, or any React SPA
- 🔍 **DevTools Panel** — `hookform-action-devtools` for real-time form state inspection
- 🧩 **Internal Plugin System** — Lifecycle hooks (`onBeforeSubmit`, `onSuccess`, `onError`, `onMount`)
- 🔄 **Zero Breaking Changes** — Existing `hookform-action` imports work identically

## Features

- 🔒 **Full Type Inference** — Types inferred from your action automatically
- ⚡ **Auto Error Mapping** — Zod `.flatten().fieldErrors` mapped to RHF fields out of the box
- 🚀 **Optimistic UI** — Native `useOptimistic` integration with automatic rollback
- 🔍 **Client-Side Validation** — Real-time Zod validation (`onChange`/`onBlur`/`onSubmit`)
- 💾 **Wizard Persistence** — Multi-step form state saved to sessionStorage with debounce
- 🧩 **Headless `<Form>`** — Optional wrapper providing FormContext to children
- 📦 **Tiny Bundle** — ESM + CJS, tree-shakeable, peer deps only
- 🧪 **81+ Tests** — Vitest + React Testing Library

## Installation

### Next.js (Server Actions)

```bash
npm install hookform-action react-hook-form zod
```

### Vite / Remix / Astro (Standalone)

```bash
npm install hookform-action-standalone react-hook-form zod
```

### DevTools (optional)

```bash
npm install hookform-action-devtools
```

## Quick Start — Next.js

### 1. Create a Server Action

```ts
// app/actions.ts
"use server";
import { z } from "zod";
import { withZod } from "hookform-action-core/with-zod";

const schema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
});

export const loginAction = withZod(schema, async (data) => {
  // data is typed as { email: string; password: string }
  return { success: true };
});
```

### 2. Use the Hook

```tsx
// app/login-form.tsx
"use client";
import { useActionForm } from "hookform-action";
import { loginAction } from "./actions";

export function LoginForm() {
  const {
    register,
    handleSubmit,
    formState: { errors, isPending },
  } = useActionForm(loginAction, {
    defaultValues: { email: "", password: "" },
    validationMode: "onChange",
  });

  return (
    <form onSubmit={handleSubmit()}>
      <input {...register("email")} />
      {errors.email && <span>{errors.email.message}</span>}

      <input {...register("password")} type="password" />
      {errors.password && <span>{errors.password.message}</span>}

      <button disabled={isPending}>{isPending ? "Signing in..." : "Sign In"}</button>
    </form>
  );
}
```

## Quick Start — Standalone (Vite, Remix, etc.)

```tsx
import { useActionForm } from "hookform-action-standalone";
import { z } from "zod";

const schema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
});

export function LoginForm() {
  const {
    register,
    handleSubmit,
    formState: { errors, isPending },
  } = useActionForm({
    submit: async (data) => {
      const res = await fetch("/api/login", {
        method: "POST",
        body: JSON.stringify(data),
        headers: { "Content-Type": "application/json" },
      });
      return res.json();
    },
    schema,
    validationMode: "onChange",
    defaultValues: { email: "", password: "" },
  });

  return (
    <form onSubmit={handleSubmit()}>
      <input {...register("email")} />
      {errors.email && <span>{errors.email.message}</span>}

      <input {...register("password")} type="password" />
      {errors.password && <span>{errors.password.message}</span>}

      <button disabled={isPending}>{isPending ? "Signing in..." : "Sign In"}</button>
    </form>
  );
}
```

## DevTools

Add a floating debug panel to inspect form state, submission history, and errors:

```tsx
import { FormDevTool } from "hookform-action-devtools";

function App() {
  const form = useActionForm(/* ... */);
  return (
    <>
      <MyForm form={form} />
      {process.env.NODE_ENV === "development" && <FormDevTool control={form.control} />}
    </>
  );
}
```

Features:

- **State Tab** — Live form values, errors, submit status
- **History Tab** — Every submission with payload, response, duration
- **Actions Tab** — Debug buttons + summary stats
- Inline styles (no CSS deps), tree-shakeable, dark theme

## Client-Side Zod Validation

```tsx
const form = useActionForm(action, {
  schema: myZodSchema,
  validationMode: "onChange", // 'onChange' | 'onBlur' | 'onSubmit'
});
```

With `withZod`, the schema is auto-detected — just set `validationMode`:

```tsx
const form = useActionForm(withZodAction, {
  validationMode: "onChange", // schema auto-detected!
});
```

## Optimistic UI

```tsx
const { optimistic, register, handleSubmit } = useActionForm(updateAction, {
  defaultValues: { title: "" },
  optimisticKey: "todo-1",
  optimisticInitial: { id: "1", title: "Buy groceries", completed: false },
  optimisticData: (currentData, formValues) => ({
    ...currentData,
    title: formValues.title,
  }),
});

// optimistic.data   → instant UI state
// optimistic.isPending → true while action is in flight
// optimistic.rollback() → manually revert
```

## Multi-Step Wizard with Persistence

```tsx
const form = useActionForm(wizardAction, {
  defaultValues: { name: "", email: "", plan: "" },
  persistKey: "onboarding-wizard",
  persistDebounce: 200,
});
```

## Architecture

```
┌────────────────────────────────────────────────┐
│        hookform-action-core (core)             │
│   useActionFormCore · withZod · Form · persist │
├────────────────────┬───────────────────────────┤
│   hookform-action  │  hookform-action          │
│    (Next.js)       │    -standalone            │
│  (Server Actions)  │  (fetch / REST / gRPC)    │
└────────────────────┴───────────────────────────┘
          ┌──────────────────────┐
          │ hookform-action      │
          │     -devtools        │
          │  (FormDevTool panel) │
          └──────────────────────┘
```

## API Reference

### `useActionForm(action, options?)` — Next.js

| Option              | Type                        | Default      | Description                        |
| ------------------- | --------------------------- | ------------ | ---------------------------------- |
| `defaultValues`     | `DefaultValues<T>`          | —            | Initial form values                |
| `mode`              | `Mode`                      | `'onSubmit'` | RHF validation mode                |
| `persistKey`        | `string`                    | —            | Enables sessionStorage persistence |
| `persistDebounce`   | `number`                    | `300`        | Debounce interval (ms)             |
| `errorMapper`       | `(result) => errors`        | Zod format   | Custom error extractor             |
| `onSuccess`         | `(result) => void`          | —            | Success callback                   |
| `onError`           | `(result \| Error) => void` | —            | Error callback                     |
| `schema`            | `ZodSchema`                 | —            | Client-side Zod schema             |
| `validationMode`    | `ClientValidationMode`      | `'onSubmit'` | When to run client validation      |
| `optimisticKey`     | `string`                    | —            | Enables optimistic UI              |
| `optimisticData`    | `(current, formData) => T`  | —            | Reducer for optimistic state       |
| `optimisticInitial` | `T`                         | —            | Initial data for optimistic state  |

### `useActionForm({ submit, ...options })` — Standalone

Same options as Next.js, plus `submit: (data) => Promise<TResult>` (required).

### Return Value

Everything from RHF's `useForm`, plus:

| Property                       | Description                                         |
| ------------------------------ | --------------------------------------------------- |
| `handleSubmit(onValid?)`       | Enhanced submit handler                             |
| `formState.isSubmitting`       | True while action is running                        |
| `formState.isPending`          | True during transition                              |
| `formState.isSubmitSuccessful` | True after success                                  |
| `formState.submitErrors`       | Raw server error record                             |
| `formState.actionResult`       | Full action result                                  |
| `setSubmitError(field, msg)`   | Manually set a server error                         |
| `persist()`                    | Manually persist to sessionStorage                  |
| `clearPersistedData()`         | Clear persisted data                                |
| `formAction`                   | Direct FormData action (Next.js only)               |
| `optimistic`                   | Optimistic state: `data`, `isPending`, `rollback()` |

## Migration Guide

### v2 → v3

**Zero breaking changes.** All v2 imports work identically.

New capabilities:

1. Use `hookform-action-standalone` for non-Next.js apps
2. Add `hookform-action-devtools` for debugging
3. Access `useActionFormCore` for building custom adapters

### v1 → v2

1. **Replace `isSubmitting` with `isPending`** in button states (recommended):

   ```diff
   - <button disabled={isSubmitting}>
   + <button disabled={isPending}>
   ```

2. **Add `schema` for client-side validation** (optional):
   ```diff
     const form = useActionForm(myAction, {
       defaultValues: { email: '' },
   +   schema: mySchema,
   +   validationMode: 'onChange',
     })
   ```

## Requirements

- React 18+ (React 19 recommended for optimistic UI)
- React Hook Form 7.50+
- Zod 3.22+ (optional)
- Next.js 14+ (for `hookform-action`)

## Development

```bash
# Clone and install
git clone https://github.com/gabpaesschulz/hookform-action.git
cd hookform-action
pnpm install

# Dev (core + docs)
pnpm dev

# Test
pnpm test

# Build all packages
pnpm build

# Create a changeset
pnpm changeset
```

## License

[MIT](LICENSE) © hookform-action contributors
