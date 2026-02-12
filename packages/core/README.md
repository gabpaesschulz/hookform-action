# hookform-action-core

Framework-agnostic core for **hookform-action** — provides the foundational hooks, Zod integration, persistence helpers, and type system shared by all adapters.

[![npm version](https://img.shields.io/npm/v/hookform-action-core?style=flat-square&color=5c7cfa)](https://www.npmjs.com/package/hookform-action-core)
[![npm downloads](https://img.shields.io/npm/dm/hookform-action-core?style=flat-square&color=748ffc)](https://www.npmjs.com/package/hookform-action-core)
[![license](https://img.shields.io/npm/l/hookform-action-core?style=flat-square)](https://github.com/gabpaesschulz/hookform-action/blob/main/LICENSE)

> **Most users should install an adapter instead:**
>
> - [`hookform-action`](https://www.npmjs.com/package/hookform-action) — for **Next.js** Server Actions
> - [`hookform-action-standalone`](https://www.npmjs.com/package/hookform-action-standalone) — for **Vite**, **Remix**, **Astro**, or any React SPA

## When to Use This Package Directly

Install `hookform-action-core` when you:

- Need `withZod` to create typed server actions (`hookform-action-core/with-zod`)
- Are building a **custom adapter** on top of `useActionFormCore`
- Want to import shared types (`hookform-action-core/core-types`)

## Installation

```bash
npm install hookform-action-core react-hook-form zod
# or
pnpm add hookform-action-core react-hook-form zod
```

## Exports

| Entry Point                       | Description                                                   |
| --------------------------------- | ------------------------------------------------------------- |
| `hookform-action-core`            | Main entry — `useActionFormCore`, `Form`, persistence helpers |
| `hookform-action-core/with-zod`   | `withZod(schema, handler)` — typed Zod-validated actions      |
| `hookform-action-core/zod`        | Alias for `./with-zod`                                        |
| `hookform-action-core/core`       | `useActionFormCore` hook only                                 |
| `hookform-action-core/core-types` | Shared TypeScript types                                       |

## `withZod(schema, handler)`

Wraps a server action with Zod validation. Returns flattened field errors on failure, or your handler's return value on success.

```ts
"use server";
import { z } from "zod";
import { withZod } from "hookform-action-core/with-zod";

const schema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
});

export const loginAction = withZod(schema, async (data) => {
  // data is fully typed as { email: string; password: string }
  return { success: true };
});
```

## `useActionFormCore(options)`

Low-level hook for building custom adapters. It integrates React Hook Form with your submission logic, error mapping, client-side validation, persistence, and optimistic UI.

```ts
import { useActionFormCore } from "hookform-action-core/core";
```

See the [Next.js adapter](https://github.com/gabpaesschulz/hookform-action/blob/main/packages/next/src/use-action-form.ts) or the [standalone adapter](https://github.com/gabpaesschulz/hookform-action/blob/main/packages/standalone/src/use-action-form.ts) for implementation examples.

## `Form` Component

Headless `<Form>` wrapper that provides `FormContext` to child components:

```tsx
import { Form } from "hookform-action-core";

<Form form={form}>
  <MyFields />
</Form>;
```

## Persistence Helpers

Built-in sessionStorage persistence for multi-step wizards:

```ts
import { persistToSessionStorage, loadFromSessionStorage, clearSessionStorage } from "hookform-action-core";
```

## Architecture

```
┌─────────────────────────────────────────────┐
│        hookform-action-core (this pkg)       │
│   useActionFormCore · withZod · Form · persist │
├────────────────────┬────────────────────────┤
│   hookform-action  │  hookform-action       │
│    (Next.js)       │    -standalone         │
└────────────────────┴────────────────────────┘
```

## Related Packages

| Package                                                                                  | Description                          |
| ---------------------------------------------------------------------------------------- | ------------------------------------ |
| [`hookform-action`](https://www.npmjs.com/package/hookform-action)                       | Next.js adapter (⭐ main install)    |
| [`hookform-action-standalone`](https://www.npmjs.com/package/hookform-action-standalone) | Adapter for Vite, Remix, Astro, SPAs |
| [`hookform-action-devtools`](https://www.npmjs.com/package/hookform-action-devtools)     | Floating debug panel (FormDevTool)   |

## License

[MIT](https://github.com/gabpaesschulz/hookform-action/blob/main/LICENSE) © hookform-action contributors
