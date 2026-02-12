# ⚡ hookform-action

Seamless integration between **React Hook Form** and **Next.js Server Actions** with Zod validation, automatic type inference, optimistic UI, multi-step persistence, and DevTools.

[![npm version](https://img.shields.io/npm/v/hookform-action?style=flat-square&color=5c7cfa)](https://www.npmjs.com/package/hookform-action)
[![npm downloads](https://img.shields.io/npm/dm/hookform-action?style=flat-square&color=748ffc)](https://www.npmjs.com/package/hookform-action)
[![license](https://img.shields.io/npm/l/hookform-action?style=flat-square)](https://github.com/gabpaesschulz/hookform-action/blob/main/LICENSE)

> This is the **Next.js adapter** (⭐ main install). For non-Next.js apps see [`hookform-action-standalone`](https://www.npmjs.com/package/hookform-action-standalone).

## Installation

```bash
npm install hookform-action react-hook-form zod
# or
pnpm add hookform-action react-hook-form zod
```

## Quick Start

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

## Features

- 🔒 **Full Type Inference** — Types inferred from your action automatically
- ⚡ **Auto Error Mapping** — Zod `.flatten().fieldErrors` mapped to RHF fields out of the box
- 🚀 **Optimistic UI** — Native `useOptimistic` integration with automatic rollback
- 🔍 **Client-Side Validation** — Real-time Zod validation (`onChange`/`onBlur`/`onSubmit`)
- 💾 **Wizard Persistence** — Multi-step form state saved to sessionStorage with debounce
- 🧩 **Headless `<Form>`** — Optional wrapper providing FormContext to children
- 📦 **Tiny Bundle** — ESM + CJS, tree-shakeable, peer deps only
- 🧪 **81+ Tests** — Vitest + React Testing Library

## API

### `useActionForm(action, options?)`

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
```

## Multi-Step Wizard with Persistence

```tsx
const form = useActionForm(wizardAction, {
  defaultValues: { name: "", email: "", plan: "" },
  persistKey: "onboarding-wizard",
  persistDebounce: 200,
});
```

## Related Packages

| Package                                                                                  | Description                          |
| ---------------------------------------------------------------------------------------- | ------------------------------------ |
| [`hookform-action-core`](https://www.npmjs.com/package/hookform-action-core)             | Core library (framework-agnostic)    |
| [`hookform-action-standalone`](https://www.npmjs.com/package/hookform-action-standalone) | Adapter for Vite, Remix, Astro, SPAs |
| [`hookform-action-devtools`](https://www.npmjs.com/package/hookform-action-devtools)     | Floating debug panel (FormDevTool)   |

## Requirements

- Next.js 14+
- React 18+ (React 19 recommended for optimistic UI)
- React Hook Form 7.50+
- Zod 3.22+ (optional)

## License

[MIT](https://github.com/gabpaesschulz/hookform-action/blob/main/LICENSE) © hookform-action contributors
