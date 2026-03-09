<p align="center">
  <h1 align="center">⚡ hookform-action</h1>
  <p align="center">
    The missing layer between <strong>React Hook Form</strong> and your server.<br />
    Typed submit flows, automatic Zod error mapping, optimistic UI with rollback, persistence, and DevTools &mdash;<br />
    for <strong>Next.js Server Actions</strong>, <strong>Vite</strong>, <strong>Remix</strong>, <strong>Astro</strong>, or any React app.
  </p>
  <p align="center">
    <a href="https://hookform-action-docs.vercel.app/"><strong>📚 Documentation</strong></a>
    &nbsp;&middot;&nbsp;
    <a href="#quick-start--nextjs">Quick Start</a>
    &nbsp;&middot;&nbsp;
    <a href="#choose-your-path">Choose Your Path</a>
    &nbsp;&middot;&nbsp;
    <a href="#examples-that-show-real-value">Examples</a>
    &nbsp;&middot;&nbsp;
    <a href="#faq--troubleshooting">FAQ</a>
    &nbsp;&middot;&nbsp;
    <a href="#api-reference">API Reference</a>
    &nbsp;&middot;&nbsp;
    <a href="#packages">Packages</a>
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

React Hook Form handles form state beautifully, but the moment you connect it to a server — a Next.js Server Action, a REST endpoint, a Remix action — you end up writing the same boilerplate every single time:

- Manually serialize form values to `FormData` or JSON
- Wire `useTransition` or `useFormState` to track pending state
- Parse Zod errors from the server response and map them back to individual fields
- Handle `prevState` for progressive enhancement
- Roll back UI state on failure

That is hundreds of lines of plumbing that has nothing to do with your actual business logic.

**hookform-action gives you one typed hook that handles all of it.**

---

## Why hookform-action?

| Concern                | Without hookform-action                    | With hookform-action                |
| ---------------------- | ------------------------------------------ | ----------------------------------- |
| Type safety            | Manual casts from `FormData`               | Full inference from your Zod schema |
| Error mapping          | Parse JSON → iterate fields → `setError()` | Automatic, zero config              |
| Pending state          | `useTransition` + manual boolean           | `formState.isPending`               |
| Optimistic UI          | Custom `useOptimistic` wiring              | `optimisticKey` + `optimisticData`  |
| Client validation      | Duplicate schema setup                     | Auto-detected from `withZod`        |
| Multi-step persistence | Roll your own sessionStorage               | `persistKey` + `persistDebounce`    |
| Debugging              | `console.log` everywhere                   | `<FormDevTool />` panel             |

---

## Before & After

### Without hookform-action

```tsx
// ❌ Manual wiring — ~60 lines to do what one hook does
"use client";
import { useForm } from "react-hook-form";
import { useTransition } from "react";

export function LoginForm() {
  const [isPending, startTransition] = useTransition();
  const {
    register,
    handleSubmit,
    setError,
    formState: { errors },
  } = useForm();

  const onSubmit = (values) => {
    startTransition(async () => {
      const formData = new FormData();
      Object.entries(values).forEach(([k, v]) => formData.append(k, String(v)));

      const result = await loginAction(null, formData);

      if (!result.success && result.errors) {
        Object.entries(result.errors).forEach(([field, messages]) => {
          setError(field, { message: messages[0] });
        });
      }
    });
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <input {...register("email")} />
      {errors.email && <span>{errors.email.message}</span>}
      <button disabled={isPending}>Sign in</button>
    </form>
  );
}
```

### With hookform-action

```tsx
// ✅ One hook, fully typed, zero boilerplate
"use client";
import { useActionForm } from "hookform-action";
import { loginAction } from "./actions";

export function LoginForm() {
  const {
    register,
    handleSubmit,
    formState: { errors, isPending },
  } = useActionForm(loginAction, { validationMode: "onChange" });

  return (
    <form onSubmit={handleSubmit()}>
      <input {...register("email")} />
      {errors.email && <span>{errors.email.message}</span>}
      <button disabled={isPending}>Sign in</button>
    </form>
  );
}
```

---

## Packages

hookform-action is a monorepo. Install the adapter that matches your stack.

| Package                                             | Install                            | Description                                                           |
| --------------------------------------------------- | ---------------------------------- | --------------------------------------------------------------------- |
| [`hookform-action`](packages/next)                  | `npm i hookform-action`            | **Next.js adapter** — Server Actions, FormData, `prevState`           |
| [`hookform-action-standalone`](packages/standalone) | `npm i hookform-action-standalone` | **Standalone adapter** — fetch, axios, Remix, Vite, Astro             |
| [`hookform-action-core`](packages/core)             | internal                           | Framework-agnostic core — `useActionFormCore`, `withZod`, persistence |
| [`hookform-action-devtools`](packages/devtools)     | `npm i hookform-action-devtools`   | Floating debug panel — form state, submission history                 |

> **Zod and react-hook-form are peer dependencies.** Install them alongside any adapter:
>
> ```bash
> npm install hookform-action react-hook-form zod
> ```

---

## Choose Your Path

Pick the shortest adoption route for your stack:

| You are using | Install | Start here |
| --- | --- | --- |
| Next.js App Router + Server Actions | `npm i hookform-action react-hook-form zod` | [Quick Start - Next.js](#quick-start--nextjs) |
| Vite / Remix / Astro / SPA | `npm i hookform-action-standalone react-hook-form zod` | [Quick Start - Standalone](#quick-start--standalone-vite-remix-astro) |
| Custom adapter / framework integration | `npm i hookform-action-core react-hook-form zod` | [How It Works](#how-it-works) |

---

## Examples that show real value

These are the examples that convert fastest for new users:

- Login / registration with server validation + field error mapping
- Client-side validation with a shared schema (no duplication)
- Optimistic UI with rollback on action failure
- Multi-step wizard with draft persistence

Live docs pages:

- https://hookform-action-docs.vercel.app/examples
- https://hookform-action-docs.vercel.app/recipes

---

## What you stop writing

- ❌ Manual `FormData` → typed object conversion
- ❌ `.flatten().fieldErrors` → `setError()` mapping
- ❌ Duplicate Zod passes for client-side validation
- ❌ `useTransition` / `startTransition` wiring
- ❌ `useOptimistic` setup and rollback logic
- ❌ `sessionStorage` wiring for multi-step wizards

## What you get

- ✅ **Full type inference** — types flow from your Zod schema through `withZod` into the hook with no manual generics
- ✅ **Auto error mapping** — server-side Zod errors (`flatten().fieldErrors`) are automatically applied to RHF fields
- ✅ **Client-side validation** — real-time validation using the same schema, with `onChange`, `onBlur`, or `onSubmit` modes
- ✅ **Optimistic UI** — native `useOptimistic` (React 19) with automatic rollback and a React 18 fallback
- ✅ **Wizard persistence** — multi-step form state survives page refreshes via sessionStorage with debounce
- ✅ **Headless `<Form>`** — optional context provider that distributes form state to any child component
- ✅ **DevTools** — floating panel with live state, submission history, and debug actions; zero CSS dependencies
- ✅ **Plugin system** — lifecycle hooks (`onBeforeSubmit`, `onSuccess`, `onError`, `onMount`) for custom integrations
- ✅ **Tiny footprint** — ESM + CJS, tree-shakeable, only peer deps; no runtime bloat
- ✅ **81+ tests** — Vitest + React Testing Library

---

## Quick Start — Next.js

### 1. Install

```bash
npm install hookform-action react-hook-form zod
```

### 2. Create a Server Action

```ts
// app/login/actions.ts
"use server";
import { z } from "zod";
import { withZod } from "hookform-action-core/with-zod";

const schema = z.object({
  email: z.string().email("Invalid email"),
  password: z.string().min(8, "At least 8 characters"),
});

export const loginAction = withZod(schema, async (data) => {
  // `data` is fully typed as { email: string; password: string }
  const user = await db.authenticate(data.email, data.password);
  if (!user) return { success: false, errors: { email: ["Invalid credentials"] } };
  return { success: true };
});
```

> `withZod` validates on the server, maps Zod errors to the flat `{ errors: Record<string, string[]> }` shape, and attaches the schema to the action so the hook can auto-detect it for client-side validation.

### 3. Use the Hook

```tsx
// app/login/login-form.tsx
"use client";
import { useActionForm } from "hookform-action";
import { loginAction } from "./actions";

export function LoginForm() {
  const {
    register,
    handleSubmit,
    formState: { errors, isPending, isSubmitSuccessful },
  } = useActionForm(loginAction, {
    defaultValues: { email: "", password: "" },
    validationMode: "onChange", // schema auto-detected from withZod
    onSuccess: () => redirect("/dashboard"),
  });

  return (
    <form onSubmit={handleSubmit()}>
      <div>
        <input {...register("email")} placeholder="Email" />
        {errors.email && <p>{errors.email.message}</p>}
      </div>

      <div>
        <input {...register("password")} type="password" placeholder="Password" />
        {errors.password && <p>{errors.password.message}</p>}
      </div>

      <button type="submit" disabled={isPending}>
        {isPending ? "Signing in…" : "Sign In"}
      </button>
    </form>
  );
}
```

---

## Quick Start — Standalone (Vite, Remix, Astro)

```bash
npm install hookform-action-standalone react-hook-form zod
```

```tsx
// components/contact-form.tsx
import { useActionForm } from "hookform-action-standalone";
import { z } from "zod";

const schema = z.object({
  email: z.string().email(),
  message: z.string().min(10),
});

export function ContactForm() {
  const {
    register,
    handleSubmit,
    formState: { errors, isPending, isSubmitSuccessful },
  } = useActionForm({
    submit: async (data) => {
      const res = await fetch("/api/contact", {
        method: "POST",
        body: JSON.stringify(data),
        headers: { "Content-Type": "application/json" },
      });
      return res.json();
    },
    schema,
    validationMode: "onBlur",
    defaultValues: { email: "", message: "" },
  });

  if (isSubmitSuccessful) return <p>Message sent!</p>;

  return (
    <form onSubmit={handleSubmit()}>
      <input {...register("email")} placeholder="Email" />
      {errors.email && <p>{errors.email.message}</p>}

      <textarea {...register("message")} placeholder="Your message" />
      {errors.message && <p>{errors.message.message}</p>}

      <button type="submit" disabled={isPending}>
        {isPending ? "Sending…" : "Send"}
      </button>
    </form>
  );
}
```

The standalone adapter is **identical to the Next.js API** — the only difference is that you pass a `submit` function instead of a Server Action.

---

## Mental Model

```
Your Zod schema
      │
      ▼
 withZod(schema, handler)          ← server-side: validates input, types handler
      │
      │  returns { success, errors } or handler's return value
      ▼
 useActionForm(action, options)    ← client-side: bridges RHF ↔ your action
      │
      ├── manages form state (RHF)
      ├── runs client-side Zod validation (onChange / onBlur / onSubmit)
      ├── serializes values → calls your action
      ├── maps server errors → RHF fields (auto)
      ├── drives isPending via useTransition
      ├── updates optimistic state (React 19 useOptimistic)
      └── persists to sessionStorage (wizard mode)
```

**The key insight:** your schema is the single source of truth. Write it once, attach it with `withZod`, and the hook picks it up automatically — no duplication, no manual error parsing, no type gymnastics.

---

## When to Use / When Not to Use

### ✅ Good fit

- Forms that submit to a server and need to display field-level errors
- Next.js App Router with Server Actions
- Vite / Remix / Astro apps submitting to a REST or RPC endpoint
- Multi-step onboarding wizards where state must survive navigation
- Any form that benefits from instant optimistic feedback

### ⚠️ Might be overkill

- Simple single-field inline edits with no validation requirements
- Forms that only run on the client with no server round-trip
- Projects that already have a custom RHF + server error pipeline they are happy with

### ❌ Not designed for

- Non-React environments
- Uncontrolled `<form action="...">` submissions without JavaScript (use the `formAction` prop for progressive enhancement instead)

---

## Common Use Cases

<details>
<summary><strong>Login / Registration</strong></summary>

```tsx
const form = useActionForm(registerAction, {
  defaultValues: { email: "", password: "", confirmPassword: "" },
  validationMode: "onBlur",
  onSuccess: () => router.push("/onboarding"),
});
```

</details>

<details>
<summary><strong>Optimistic List Item Update</strong></summary>

```tsx
const { register, handleSubmit, optimistic } = useActionForm(updateTodoAction, {
  defaultValues: { title: "" },
  optimisticKey: `todo-${todo.id}`,
  optimisticInitial: todo,
  optimisticData: (current, values) => ({ ...current, title: values.title }),
});

// Render optimistic.data immediately — no waiting for the server
return <span>{optimistic.data.title}</span>;
```

</details>

<details>
<summary><strong>Multi-Step Wizard</strong></summary>

```tsx
// Step 1 — values persist to sessionStorage automatically
const step1 = useActionForm(noopAction, {
  defaultValues: { name: "", company: "" },
  persistKey: "onboarding",
});

// Step 2 — resumes from persisted state on reload
const step2 = useActionForm(submitOnboardingAction, {
  defaultValues: { plan: "", billing: "" },
  persistKey: "onboarding",
  onSuccess: () => step1.clearPersistedData(),
});
```

</details>

<details>
<summary><strong>Custom Error Handling</strong></summary>

```tsx
const form = useActionForm(myAction, {
  // Override the default Zod error mapper for non-standard API shapes
  errorMapper: (result) => result?.validationErrors ?? null,
  onError: (err) => toast.error(err instanceof Error ? err.message : "Something went wrong"),
});
```

</details>

<details>
<summary><strong>DevTools</strong></summary>

```tsx
import { FormDevTool } from "hookform-action-devtools";

export function MyPage() {
  const form = useActionForm(myAction, {
    defaultValues: {
      /* ... */
    },
  });

  return (
    <>
      <MyForm form={form} />
      {process.env.NODE_ENV === "development" && <FormDevTool control={form.control} position="bottom-right" />}
    </>
  );
}
```

The DevTools panel shows:

- **State tab** — live field values, errors, and submission status
- **History tab** — every submission with its payload, response, and duration
- **Actions tab** — manual debug triggers and aggregate stats

</details>

---

## How It Works

hookform-action is built in three layers.

### Layer 1 — `withZod` (server)

A thin wrapper that runs Zod validation before your handler. On failure it returns `{ success: false, errors: Record<string, string[]> }` — the exact shape the hook expects. On success it calls your handler with fully typed data and attaches the schema as `action.__schema` so the hook can reuse it on the client without duplication.

### Layer 2 — `useActionFormCore` (framework-agnostic)

The engine. It accepts a single `submit: (data: T) => Promise<TResult>` function and handles:

- Initialising React Hook Form with persisted or default values
- Running client-side schema validation before submission
- Calling `submit`, setting `isPending` via `useTransition`
- Parsing the result with `errorMapper` and applying errors to RHF fields
- Updating the `useOptimistic` state (React 19) or the fallback `useState` (React 18)
- Debounce-writing form values to sessionStorage when `persistKey` is set
- Running plugin lifecycle callbacks

### Layer 3 — Adapters (`hookform-action` / `hookform-action-standalone`)

Thin wrappers around the core. The Next.js adapter handles `FormData` serialization and `prevState` tracking. The standalone adapter forwards the user's `submit` function directly. Both expose an identical public API.

---

## API Reference

### `useActionForm(action, options?)` — Next.js

```ts
import { useActionForm } from "hookform-action";
```

**Options**

| Option              | Type                                   | Default      | Description                                       |
| ------------------- | -------------------------------------- | ------------ | ------------------------------------------------- |
| `defaultValues`     | `DefaultValues<T>`                     | —            | Initial field values                              |
| `mode`              | `Mode`                                 | `'onSubmit'` | RHF internal validation mode                      |
| `schema`            | `ZodSchema`                            | auto         | Client-side schema (auto-detected from `withZod`) |
| `validationMode`    | `'onChange' \| 'onBlur' \| 'onSubmit'` | `'onSubmit'` | When to run client validation                     |
| `persistKey`        | `string`                               | —            | sessionStorage key for wizard persistence         |
| `persistDebounce`   | `number`                               | `300`        | Write debounce in ms                              |
| `errorMapper`       | `(result) => FieldErrorRecord \| null` | Zod format   | Custom server error extractor                     |
| `onSuccess`         | `(result) => void`                     | —            | Called after a successful submission              |
| `onError`           | `(result \| Error) => void`            | —            | Called after a failed submission                  |
| `optimisticKey`     | `string`                               | —            | Enables optimistic UI                             |
| `optimisticInitial` | `T`                                    | —            | Initial optimistic state                          |
| `optimisticData`    | `(current: T, values) => T`            | —            | Reducer for optimistic state                      |
| `plugins`           | `Plugin[]`                             | `[]`         | Lifecycle plugin array                            |

### `useActionForm({ submit, ...options })` — Standalone

```ts
import { useActionForm } from "hookform-action-standalone";
```

Identical options, with one addition:

| Option   | Type                            | Required | Description                                |
| -------- | ------------------------------- | -------- | ------------------------------------------ |
| `submit` | `(data: T) => Promise<TResult>` | ✅       | The async function that handles submission |

### Return Value

Everything from RHF's `useForm`, plus:

| Property                       | Type                       | Description                                           |
| ------------------------------ | -------------------------- | ----------------------------------------------------- |
| `handleSubmit(onValid?)`       | `() => FormEventHandler`   | Enhanced submit handler                               |
| `formState.isPending`          | `boolean`                  | `true` while transition/request is pending            |
| `formState.isSubmitting`       | `boolean`                  | submit-in-progress flag (RHF + internal action state) |
| `formState.isSubmitSuccessful` | `boolean`                  | `true` when the last completed submit succeeded       |
| `formState.submitErrors`       | `FieldErrorRecord \| null` | structured field errors from validation/error mapping |
| `formState.actionResult`       | `TResult \| null`          | full result from the last completed action response   |
| `setSubmitError(field, msg)`   | `fn`                       | Manually set a field error                            |
| `persist()`                    | `fn`                       | Manually flush state to sessionStorage                |
| `clearPersistedData()`         | `fn`                       | Remove persisted state for this form                  |
| `formAction`                   | `(FormData) => void`       | Direct `<form action={...}>` handler _(Next.js only)_ |
| `optimistic.data`              | `TOptimistic`              | Current optimistic state                              |
| `optimistic.isPending`         | `boolean`                  | `true` while optimistic update is unconfirmed         |
| `optimistic.rollback()`        | `fn`                       | Revert to last confirmed state                        |

### Submit Lifecycle (Cheat Sheet)

Use this mental model for action-driven forms:

1. `handleSubmit()` starts the transition and async submit.
2. `isPending` turns `true` and should drive UI locking/loading.
3. Submission ends in one of three outcomes:
   - **success**: `isSubmitSuccessful = true`, `submitErrors = null`, `actionResult = result`
   - **field errors**: `isSubmitSuccessful = false`, `submitErrors = {...}`, `actionResult = result`
   - **thrown error**: `isSubmitSuccessful = false`, handle with `onError`

**Which state should I use?**

| Goal                            | State(s) to use                          |
| ------------------------------- | ---------------------------------------- |
| Disable submit button           | `formState.isPending`                    |
| Show loading spinner/text       | `formState.isPending`                    |
| Run success side-effects        | `!formState.isPending && formState.isSubmitSuccessful` |
| Render field/server validation  | `formState.submitErrors` + `formState.errors` |
| Read confirmed response payload | `formState.actionResult` guarded by success checks |

**Correct pattern**

```tsx
const { handleSubmit, formState } = useActionForm(action, { defaultValues });
const { isPending, isSubmitSuccessful, submitErrors, actionResult } = formState;

<button disabled={isPending}>
  {isPending ? "Saving..." : "Save"}
</button>;

useEffect(() => {
  if (!isPending && isSubmitSuccessful) {
    // toast / redirect / reset
  }
}, [isPending, isSubmitSuccessful]);
```

**Common mistakes**

- Using `isSubmitting` for button/loader instead of `isPending`
- Treating `actionResult` as "success only" data
- Triggering post-submit logic from `isSubmitSuccessful` without checking `!isPending`
- Expecting thrown exceptions inside `submitErrors` (use `onError` for that path)

For a full timeline and examples, see [`apps/docs/app/submit-lifecycle/page.tsx`](apps/docs/app/submit-lifecycle/page.tsx).

### `withZod(schema, handler)`

```ts
import { withZod } from "hookform-action-core/with-zod";
```

| Argument  | Type                                                 | Description                       |
| --------- | ---------------------------------------------------- | --------------------------------- |
| `schema`  | `ZodSchema`                                          | Zod schema to validate against    |
| `handler` | `(data: z.infer<typeof schema>) => Promise<TResult>` | Called with typed, validated data |

Returns a Server Action with `__schema` attached for client-side auto-detection.

---

## Migration Guide

### v3 → v4

**No breaking changes.** All existing imports and options remain identical.

What's new in v4:

- Package versions consolidated under the v4 line
- Documentation IA updated for faster adoption and support deflection
- Expanded examples + recipes + troubleshooting guides
- Canonical API naming standardized (`validationMode`, `optimisticData`, `submitErrors`, `actionResult`)

Legacy aliases are still supported for backward compatibility:

| Legacy name | Canonical name |
| --- | --- |
| `clientValidation` | `validationMode` |
| `optimisticReducer` / `optimisticDefault` | `optimisticData` / `optimisticInitial` |
| `formState.serverErrors` / `formState.lastResult` | `formState.submitErrors` / `formState.actionResult` |
| `setServerError` | `setSubmitError` |
| `clearPersisted` | `clearPersistedData` |

### v2 → v3

**No breaking changes.** All existing imports and options remain identical.

What's new in v3:

- Use `hookform-action-standalone` for Vite, Remix, and Astro apps
- Add `hookform-action-devtools` for a floating debug panel in development
- Use `useActionFormCore` directly to build custom adapters for any framework
- Add `plugins` to hook into the form submission lifecycle

### v1 → v2

**1. Prefer `isPending` over `isSubmitting` for button states**

```diff
- <button disabled={formState.isSubmitting}>Submit</button>
+ <button disabled={formState.isPending}>Submit</button>
```

`isSubmitting` remains available, but `isPending` reflects the `useTransition` state and is more accurate during concurrent React renders.

**2. Enable client-side validation** _(optional)_

```diff
  const form = useActionForm(myAction, {
    defaultValues: { email: "" },
+   schema: mySchema,
+   validationMode: "onChange",
  });
```

If your action was created with `withZod`, the schema is auto-detected — you only need to set `validationMode`.

---

## Requirements

| Dependency      | Minimum | Notes                                                 |
| --------------- | ------- | ----------------------------------------------------- |
| React           | 18.0    | React 19 recommended for native `useOptimistic`       |
| React Hook Form | 7.50    | —                                                     |
| Zod             | 3.22    | Peer dependency; optional if not using `withZod`      |
| Next.js         | 14.0    | Required only for `hookform-action` (Next.js adapter) |

---

## Compatibility Matrix

| Package | Current line | Purpose |
| --- | --- | --- |
| `hookform-action` | `4.x` | Next.js adapter (Server Actions) |
| `hookform-action-standalone` | `4.x` | Non-Next React apps |
| `hookform-action-core` | `4.x` | Framework-agnostic core |
| `hookform-action-devtools` | `4.x` | Optional dev debug panel |

---

## FAQ / Troubleshooting

For support-heavy questions and symptom-based debugging:

- FAQ: https://hookform-action-docs.vercel.app/faq
- Troubleshooting: https://hookform-action-docs.vercel.app/troubleshooting

Most common adoption blockers covered there:

- Action runs but field errors do not render
- `isPending` vs `isSubmitting` confusion
- `persistKey` restoring stale drafts
- Optimistic state not appearing or not rolling back
- File upload + FormData integration pitfalls

---

## Development

```bash
# Clone and install dependencies
git clone https://github.com/gabpaesschulz/hookform-action.git
cd hookform-action
pnpm install

# Start the dev server (core + docs)
pnpm dev

# Run all tests
pnpm test

# Build all packages
pnpm build

# Create a changeset before opening a PR
pnpm changeset
```

The repository is a [Turborepo](https://turbo.build/repo) monorepo with [pnpm workspaces](https://pnpm.io/workspaces). Each package under `packages/` is independently versioned and published.

---

## License

[MIT](LICENSE) © hookform-action contributors
