# hookform-action-standalone

Standalone React adapter for **hookform-action** — use the same API without Next.js. Works with **Vite**, **Remix**, **Astro**, or any React SPA.

[![npm version](https://img.shields.io/npm/v/hookform-action-standalone?style=flat-square&color=5c7cfa)](https://www.npmjs.com/package/hookform-action-standalone)
[![npm downloads](https://img.shields.io/npm/dm/hookform-action-standalone?style=flat-square&color=748ffc)](https://www.npmjs.com/package/hookform-action-standalone)
[![license](https://img.shields.io/npm/l/hookform-action-standalone?style=flat-square)](https://github.com/gabpaesschulz/hookform-action/blob/main/LICENSE)

> **Using Next.js?** Install [`hookform-action`](https://www.npmjs.com/package/hookform-action) instead for native Server Actions support.

## Installation

```bash
npm install hookform-action-standalone react-hook-form zod
# or
pnpm add hookform-action-standalone react-hook-form zod
```

## Quick Start

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

## API

### `useActionForm(options)`

| Option              | Type                         | Default      | Description                        |
| ------------------- | ---------------------------- | ------------ | ---------------------------------- |
| `submit`            | `(data) => Promise<TResult>` | **required** | Your async submit function         |
| `defaultValues`     | `DefaultValues<T>`           | —            | Initial form values                |
| `mode`              | `Mode`                       | `'onSubmit'` | RHF validation mode                |
| `schema`            | `ZodSchema`                  | —            | Client-side Zod schema             |
| `validationMode`    | `ClientValidationMode`       | `'onSubmit'` | When to run client validation      |
| `persistKey`        | `string`                     | —            | Enables sessionStorage persistence |
| `persistDebounce`   | `number`                     | `300`        | Debounce interval (ms)             |
| `errorMapper`       | `(result) => errors`         | Zod format   | Custom error extractor             |
| `onSuccess`         | `(result) => void`           | —            | Success callback                   |
| `onError`           | `(result \| Error) => void`  | —            | Error callback                     |
| `optimisticKey`     | `string`                     | —            | Enables optimistic UI              |
| `optimisticData`    | `(current, formData) => T`   | —            | Reducer for optimistic state       |
| `optimisticInitial` | `T`                          | —            | Initial data for optimistic state  |

### Return Value

Everything from RHF's `useForm`, plus:

| Property                       | Description                        |
| ------------------------------ | ---------------------------------- |
| `handleSubmit(onValid?)`       | Enhanced submit handler            |
| `formState.isPending`          | True while submit is in flight     |
| `formState.isSubmitSuccessful` | True after success                 |
| `formState.submitErrors`       | Raw server error record            |
| `formState.actionResult`       | Full submit result                 |
| `setSubmitError(field, msg)`   | Manually set a server error        |
| `persist()`                    | Manually persist to sessionStorage |
| `clearPersistedData()`         | Clear persisted data               |
| `optimistic`                   | `data`, `isPending`, `rollback()`  |

## Differences from `hookform-action`

| Feature               | `hookform-action` (Next.js) | `hookform-action-standalone`    |
| --------------------- | --------------------------- | ------------------------------- |
| Submit mechanism      | Server Actions              | `submit` function (fetch, etc.) |
| `formAction`          | ✅                          | —                               |
| Framework requirement | Next.js 14+                 | Any React app                   |
| `useActionState`      | ✅ (React 19)               | Uses internal state management  |

## Multi-Step Wizard with Persistence

```tsx
const form = useActionForm({
  submit: async (data) => saveWizardData(data),
  defaultValues: { name: "", email: "", plan: "" },
  persistKey: "onboarding-wizard",
  persistDebounce: 200,
});
```

## Related Packages

| Package                                                                              | Description                        |
| ------------------------------------------------------------------------------------ | ---------------------------------- |
| [`hookform-action`](https://www.npmjs.com/package/hookform-action)                   | Next.js adapter (⭐ main install)  |
| [`hookform-action-core`](https://www.npmjs.com/package/hookform-action-core)         | Core library (framework-agnostic)  |
| [`hookform-action-devtools`](https://www.npmjs.com/package/hookform-action-devtools) | Floating debug panel (FormDevTool) |

## Requirements

- React 18+ (React 19 recommended for optimistic UI)
- React Hook Form 7.50+
- Zod 3.22+ (optional)

## License

[MIT](https://github.com/gabpaesschulz/hookform-action/blob/main/LICENSE) © hookform-action contributors
