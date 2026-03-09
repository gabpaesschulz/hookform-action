# Advanced Patterns

This guide covers the hard parts — the patterns that go beyond the basic
"register a field and call handleSubmit" flow.
Each section is written for a developer who already understands the basics and
wants to know **exactly how the library behaves** in tricky real-world scenarios.

---

## Table of Contents

| #   | Topic                                                                   | When you need it                              |
| --- | ----------------------------------------------------------------------- | --------------------------------------------- |
| 1   | [Nested Objects](#1-nested-objects)                                     | Address, billing, settings sub-forms          |
| 2   | [Dynamic Lists with useFieldArray](#2-dynamic-lists-with-usefieldarray) | Line items, tags, members, cart               |
| 3   | [Custom Server Error Mapping](#3-custom-server-error-mapping)           | Non-standard API response shapes              |
| 4   | [Business Rule Errors](#4-business-rule-errors)                         | Unique constraints, availability, cross-field |
| 5   | [Reset and Rehydration](#5-reset-and-rehydration)                       | Back button, draft recovery, clear form       |
| 6   | [Loading Initial Data](#6-loading-initial-data)                         | Edit forms, pre-populated data from DB        |
| 7   | [Multi-Step Wizard](#7-multi-step-wizard)                               | Onboarding flows, checkout, multi-page forms  |
| 8   | [Optimistic UI with Rollback](#8-optimistic-ui-with-rollback)           | Like/follow, todo lists, instant feedback     |
| 9   | [Exceptions vs Validation Errors](#9-exceptions-vs-validation-errors)   | Predictable errors vs unexpected crashes      |
| 10  | [File Uploads](#10-file-uploads)                                        | Single file, multiple files, progress         |

---

## 1. Nested Objects

### Why this matters

Real-world forms rarely map to flat field lists. An address has `street`,
`city`, `zip`. A product has `dimensions.width`, `dimensions.height`. A user
profile has `social.twitter`, `social.github`. The library needs to serialize
these properly when sending to the server action, and the Zod schema needs to
reflect the same shape for client-side validation to work.

### Common questions

- "How do I register a nested field — `register('address.city')`?"
- "My Zod schema has `z.object({ address: z.object({...}) })` but the error
  never appears on the field."
- "The server receives `{ 'address.city': 'SP' }` instead of
  `{ address: { city: 'SP' } }`."

### Common mistakes

- **Using `FormData` action with nested objects.** FormData keys are always
  strings; `address.city` is a valid key name, not a path. The library
  serializes dot-paths when building FormData, but the server must parse them
  back — use the JSON action signature (single-argument) when you have nested
  data.
- **Flat Zod schema vs nested TypeScript types.** If your TS type is nested
  but your Zod schema is flat (e.g. `z.string()` for `address`), client-side
  validation will either skip nested fields or fire on the wrong path.
- **`errorMapper` returning flat keys.** The default `errorMapper` expects
  `{ errors: { 'address.city': ['...'] } }`. Zod's `.flatten()` does **not**
  produce deep nested objects — it produces dot-joined keys. This is correct
  and compatible with RHF's `setError('address.city', ...)`.

### What to learn

- RHF uses dot-notation paths for nested fields: `register('address.city')`.
- `withZod` runs `schema.safeParse(data)` then calls `zodError.flatten()`,
  which produces flat dot-joined keys. Those keys map exactly to RHF paths.
- For FormData actions, the library loops `Object.entries` and sets
  `formData.append('address.city', value)`. If you need real nesting on the
  server, prefer the JSON action (single argument).
- TypeScript inference works: `useActionForm<{ address: { city: string } }>`
  makes `register('address.city')` type-safe.

### Content outline

1. Declaring a nested TypeScript shape
2. Matching the Zod schema
3. Registering nested fields with dot-notation
4. How the library serializes nested data (JSON vs FormData)
5. Where server errors land (flat dot-keys → RHF path)
6. Troubleshooting: "error shows on root, not on child field"

### Example

```ts
// schema.ts
import { z } from "zod";

export const checkoutSchema = z.object({
  customer: z.object({
    name: z.string().min(2, "Name is required"),
    email: z.string().email("Invalid email"),
  }),
  shipping: z.object({
    street: z.string().min(5),
    city: z.string().min(2),
    zip: z.string().regex(/^\d{5}(-\d{4})?$/, "Invalid ZIP"),
  }),
});

export type CheckoutFields = z.infer<typeof checkoutSchema>;
```

```ts
// actions.ts
"use server";
import { withZod } from "hookform-action-core/with-zod";
import { checkoutSchema } from "./schema";

export const checkoutAction = withZod(checkoutSchema, async (data) => {
  // data.customer.email – fully typed, already validated
  await processOrder(data);
  return { success: true };
});
```

```tsx
// CheckoutForm.tsx
"use client";
import { useActionForm } from "hookform-action";
import { checkoutAction } from "./actions";

export function CheckoutForm() {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useActionForm(checkoutAction, {
    defaultValues: {
      customer: { name: "", email: "" },
      shipping: { street: "", city: "", zip: "" },
    },
    // schema auto-detected from withZod – no need to pass it again
    validationMode: "onBlur",
  });

  return (
    <form onSubmit={handleSubmit()}>
      {/* Dot-notation path – TypeScript validates the key */}
      <input {...register("customer.name")} placeholder="Full name" />
      {errors.customer?.name && <span>{errors.customer.name.message}</span>}

      <input {...register("shipping.zip")} placeholder="ZIP code" />
      {errors.shipping?.zip && <span>{errors.shipping.zip.message}</span>}

      <button type="submit">Place Order</button>
    </form>
  );
}
```

> **Key insight:** `errors.customer?.name` not `errors['customer.name']`.
> RHF stores nested errors as a real nested object. The dot-path is only used
> in `register()`, `setError()`, and `trigger()`.

---

## 2. Dynamic Lists with `useFieldArray`

### Why this matters

`useFieldArray` is RHF's primitive for fields whose count is unknown at
compile-time: invoice line items, team members, tag lists, ordered steps.
The integration works because `useActionForm` returns the full RHF API —
`useFieldArray` just needs the `control` object from it. The challenge is
that the server action receives an array, Zod must validate it as an array,
and errors must land on the correct `items[0].price` path.

### Common questions

- "Should I call `useFieldArray` separately or does the library have a wrapper?"
- "How do I type the form values so the array is inferred correctly?"
- "Zod gives me an error on `items` as a whole but I need it per-item."
- "After a successful submit, the array keeps the old items — how do I reset?"

### Common mistakes

- **Not including `id` in the item shape.** RHF's `useFieldArray` adds its
  own internal `id` property. If your Zod schema has `id` as required, Zod
  will accept the RHF-injected UUID fine — but if your backend creates the `id`,
  keep it optional in the schema (`.optional()` or omit it).
- **Using `index` as React `key`.** Always use `field.id` (the one returned
  by `useFieldArray`) as the key, not the array index. This prevents
  re-render bugs when items are removed or reordered.
- **Zod `z.array(z.object({...}))` errors not appearing per-field.** Zod
  `.flatten()` produces keys like `'items[0].price'` which RHF resolves
  correctly **only** if you access `errors.items?.[0]?.price`.
- **Resetting the list after submit.** Call `reset()` or `replace([])` from
  `useFieldArray` inside `onSuccess`.

### What to learn

- `useActionForm` is a superset of `useForm` — destructure `control` and pass
  it straight to `useFieldArray`.
- Type the field values with an explicit array: `type Fields = { items: Item[] }`.
- Zod validates the array server-side and client-side with the same schema.
- Access errors as `errors.items?.[index]?.fieldName?.message`.

### Content outline

1. Typing form values with an array field
2. Matching the Zod schema (`z.array(z.object(...))`)
3. Getting `control` from `useActionForm` and passing to `useFieldArray`
4. Rendering dynamic rows with `fields.map`
5. Add / remove / swap operations
6. Accessing per-item errors
7. Resetting or partially clearing the list on success

### Example

```ts
// types-and-schema.ts
import { z } from "zod";

export const invoiceSchema = z.object({
  client: z.string().min(1, "Client is required"),
  items: z
    .array(
      z.object({
        description: z.string().min(1, "Description is required"),
        qty: z.coerce.number().int().positive("Must be > 0"),
        unitPrice: z.coerce.number().positive("Must be > 0"),
      }),
    )
    .min(1, "Add at least one item"),
});

export type InvoiceFields = z.infer<typeof invoiceSchema>;
```

```ts
// actions.ts
"use server";
import { withZod } from "hookform-action-core/with-zod";
import { invoiceSchema } from "./types-and-schema";

export const createInvoiceAction = withZod(invoiceSchema, async (data) => {
  const total = data.items.reduce((acc, i) => acc + i.qty * i.unitPrice, 0);
  await db.invoices.create({ ...data, total });
  return { success: true };
});
```

```tsx
// InvoiceForm.tsx
"use client";
import { useActionForm } from "hookform-action";
import { useFieldArray } from "react-hook-form";
import { createInvoiceAction } from "./actions";
import type { InvoiceFields } from "./types-and-schema";

export function InvoiceForm() {
  const {
    register,
    control,
    handleSubmit,
    formState: { errors },
    reset,
  } = useActionForm<InvoiceFields>(createInvoiceAction, {
    defaultValues: {
      client: "",
      items: [{ description: "", qty: 1, unitPrice: 0 }],
    },
    onSuccess: () => reset(),
  });

  // control comes straight from useActionForm – no bridge needed
  const { fields, append, remove } = useFieldArray({ control, name: "items" });

  return (
    <form onSubmit={handleSubmit()}>
      <input {...register("client")} placeholder="Client name" />
      {errors.client && <span>{errors.client.message}</span>}

      {fields.map((field, index) => (
        // Always use field.id, never index, as React key
        <div key={field.id} style={{ display: "flex", gap: 8 }}>
          <input {...register(`items.${index}.description`)} placeholder="Description" />
          {errors.items?.[index]?.description && <span>{errors.items[index].description.message}</span>}

          <input type="number" {...register(`items.${index}.qty`)} placeholder="Qty" />
          {errors.items?.[index]?.qty && <span>{errors.items[index].qty.message}</span>}

          <input type="number" step="0.01" {...register(`items.${index}.unitPrice`)} placeholder="Unit price" />
          {errors.items?.[index]?.unitPrice && <span>{errors.items[index].unitPrice.message}</span>}

          <button type="button" onClick={() => remove(index)}>
            Remove
          </button>
        </div>
      ))}

      {/* Form-level array error */}
      {errors.items?.root && <span>{errors.items.root.message}</span>}

      <button type="button" onClick={() => append({ description: "", qty: 1, unitPrice: 0 })}>
        Add Item
      </button>

      <button type="submit">Create Invoice</button>
    </form>
  );
}
```

> **Tip:** Use `z.coerce.number()` for qty and price fields. HTML inputs
> always return strings; coercion lets Zod convert them automatically instead
> of producing a type mismatch error.

---

## 3. Custom Server Error Mapping

### Why this matters

The default `errorMapper` understands responses shaped as
`{ errors: Record<string, string[]> }` — the format produced by
`withZod`. But not every team controls the API contract. Legacy backends,
third-party services, and APIs generated from OpenAPI specs return errors in
their own formats: `{ error: string }`, `{ fieldErrors: [...] }`,
`{ violations: [{ field, message }] }`, or HTTP 422 bodies with RFC 7807
`application/problem+json`. Without a custom mapper, none of these surface as
field-level errors.

### Common questions

- "My API returns `{ message: 'email already taken' }` — how do I show that
  on the email field?"
- "The action returns a `violations` array, not an object. How do I convert it?"
- "I want global (form-level) errors, not field errors. Where do they go?"

### Common mistakes

- **Returning the whole result from `errorMapper`.** `errorMapper` must return
  a `FieldErrorRecord` (`Record<string, string[] | undefined>`) or `null` — not
  the raw result. Return `null` to signal "no errors here, treat as success."
- **Forgetting to return `null` on success.** If the action returns
  `{ message: 'OK' }` and your mapper tries to read `.violations`, it returns
  `undefined` — which the library treats as falsy (no errors). This is correct,
  but be explicit.
- **Using a global `_form` key inconsistently.** The library does not reserve
  any key name for form-level errors. By convention, use `_form` or `root`, but
  you must render it manually: `errors._form?.message`.
- **Mapping network errors inside `errorMapper`.** `errorMapper` only runs when
  the action returns normally. Thrown errors go to `onError` — handle them
  there.

### What to learn

- `errorMapper: (result: TResult) => FieldErrorRecord | null | undefined`
- Return `null` → result treated as success.
- Return a populated object → `setError` is called for each key.
- Use `_form` key for form-level (non-field) messages.
- Combine with `onError` for thrown exceptions.

### Content outline

1. The default mapper and its contract
2. Writing a custom mapper for arbitrary shapes
3. The `_form` convention for global errors
4. Rendering form-level errors in the UI
5. Combining `errorMapper` with `onError`
6. Testing your mapper in isolation

### Example

```ts
// Suppose your backend returns:
// { ok: false, violations: [{ field: 'email', message: 'Already taken' }] }
// or
// { ok: false, error: 'Service temporarily unavailable' }

type ApiResponse = {
  ok: boolean;
  violations?: Array<{ field: string; message: string }>;
  error?: string;
};
```

```tsx
// form.tsx
import { useActionForm } from "hookform-action";
import type { ErrorMapper } from "hookform-action-core/core-types";
import { updateProfileAction } from "./actions";
import type { ApiResponse } from "./types";

const apiErrorMapper: ErrorMapper<ApiResponse> = (result) => {
  if (result.ok) return null; // no errors – success path

  const errors: Record<string, string[]> = {};

  // Map field-level violations
  for (const v of result.violations ?? []) {
    errors[v.field] = [v.message];
  }

  // Map a global error under the `_form` key
  if (result.error) {
    errors._form = [result.error];
  }

  return Object.keys(errors).length > 0 ? errors : null;
};

export function ProfileForm() {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useActionForm(updateProfileAction, {
    errorMapper: apiErrorMapper,
    onError: (result) => {
      // Thrown exceptions land here – result is an Error instance
      // when the action throws, or the raw TResult when it returns errors.
      console.error("Submission failed", result);
    },
  });

  return (
    <form onSubmit={handleSubmit()}>
      {/* Form-level error */}
      {errors._form && (
        <div role="alert" className="error-banner">
          {errors._form.message}
        </div>
      )}

      <input {...register("email")} />
      {errors.email && <span>{errors.email.message}</span>}

      <button type="submit">Save</button>
    </form>
  );
}
```

> **Testing tip:** `errorMapper` is a plain function — unit test it
> independently of React with a simple `expect(apiErrorMapper({ ok: false,
violations: [{ field: 'email', message: 'Taken' }] }))
.toEqual({ email: ['Taken'] })`.

---

## 4. Business Rule Errors

### Why this matters

Zod validates _structure_ (type, length, format). But business rules require
database or external lookups: "is this username taken?", "is this coupon still
valid?", "does the user have enough balance?". These errors must come from the
server action and be mapped precisely to the right field. The mechanism is the
same as any server error — but the **timing, granularity, and mental model**
are different enough to deserve their own section.

### Common questions

- "My action checks for duplicate email. Do I need a separate Zod check for
  this?"
- "The business rule spans two fields (`startDate` / `endDate`). Where do I
  attach the error?"
- "I want to show the error on submit, but keep the form open so the user can
  fix it. Is that the default?"

### Common mistakes

- **Running business logic before Zod validation.** Always validate shape with
  Zod first. Querying the database with unvalidated input is a security risk and
  a performance waste.
- **Returning only `message` without `errors`.** The default mapper ignores
  `message`. Either add an `errors` key, or provide a custom `errorMapper`.
- **Calling `router.push()` inside the action after a business rule failure.**
  The action should return a structured error; the client decides navigation.
- **Not making the error message actionable.** "Username taken" is good.
  "Invalid input" is not. The user needs to know exactly what to change.

### What to learn

- Zod validates shape → your handler validates business rules → return errors
  in the same `{ errors: Record<string, string[]> }` format.
- Cross-field errors map to the "responsible" field, or to `_form` if the
  error is truly form-level.
- `setSubmitError` lets the client imperatively attach a server error to a
  field without re-submitting.
- The form stays open with errors after a failed submit — the user can correct
  and resubmit.

### Content outline

1. The two-layer model: structural (Zod) vs business (custom)
2. Returning business errors from the action handler
3. Cross-field business rules (e.g. date range, password confirm)
4. Using `setSubmitError` for interactive validation (e.g. async username check)
5. Showing contextual messages vs error-field highlighting
6. UX patterns: keep-open vs close-on-fail

### Example

```ts
// actions.ts
"use server";
import { withZod } from "hookform-action-core/with-zod";
import { z } from "zod";

const registerSchema = z.object({
  username: z.string().min(3).max(30),
  email: z.string().email(),
  couponCode: z.string().optional(),
  startDate: z.string().datetime(),
  endDate: z.string().datetime(),
});

export const registerAction = withZod(registerSchema, async (data) => {
  // Layer 1 – Zod already passed (we only reach here if shape is valid)

  // Layer 2 – Business rules
  const errors: Record<string, string[]> = {};

  const existingUser = await db.users.findByEmail(data.email);
  if (existingUser) {
    errors.email = ["This email is already registered"];
  }

  const usernameTaken = await db.users.findByUsername(data.username);
  if (usernameTaken) {
    errors.username = ["Username is not available"];
  }

  if (data.couponCode) {
    const coupon = await db.coupons.findValid(data.couponCode);
    if (!coupon) {
      errors.couponCode = ["Coupon is invalid or expired"];
    }
  }

  // Cross-field rule: endDate must be after startDate
  if (new Date(data.endDate) <= new Date(data.startDate)) {
    // Attach to endDate – it's the "responsible" field
    errors.endDate = ["End date must be after start date"];
  }

  if (Object.keys(errors).length > 0) {
    return { errors }; // same shape as withZod validation errors
  }

  await db.users.create(data);
  return { success: true };
});
```

```tsx
// Async field-level check without re-submitting the whole form
"use client";
import { useActionForm } from "hookform-action";
import { registerAction, checkUsernameAction } from "./actions";

export function RegisterForm() {
  const {
    register,
    handleSubmit,
    setSubmitError,
    formState: { errors },
  } = useActionForm(registerAction);

  // Check availability on blur, before submit
  const handleUsernameBlur = async (e: React.FocusEvent<HTMLInputElement>) => {
    const value = e.target.value;
    if (value.length < 3) return;

    const result = await checkUsernameAction(value);
    if (!result.available) {
      // Imperatively set a server error on the field
      setSubmitError("username", "Username is not available");
    }
  };

  return (
    <form onSubmit={handleSubmit()}>
      <input {...register("username")} onBlur={handleUsernameBlur} />
      {errors.username && <span>{errors.username.message}</span>}

      <button type="submit">Register</button>
    </form>
  );
}
```

---

## 5. Reset and Rehydration

### Why this matters

"Reset" covers three distinct behaviors that users often confuse:

1. **Clear the form** — reset to empty or default values after a successful
   submit.
2. **Restore a draft** — bring back what the user typed if they navigated away
   (`persistKey`).
3. **Reload server data** — populate the form with fresh data from the server
   (edit flows).

Getting these wrong causes the classic bugs: the form shows stale data after
edit, the draft is never cleared after submit, or the form is empty when the
user expected a draft.

### Common questions

- "After a successful submit, the form still shows the old data. What do I do?"
- "I call `reset()` inside `onSuccess` but the persisted draft isn't cleared."
- "I set `persistKey` — now when I edit an existing record, the stale draft
  overrides the server data."
- "How do I reset to server-fetched values, not to empty defaults?"

### Common mistakes

- **Calling `reset()` without clearing persisted data.** `reset()` resets RHF's
  in-memory state, but `sessionStorage` is not touched. Call
  `clearPersistedData()` (returned by the hook) alongside `reset()`.
- **Using `persistKey` on edit forms.** Persistence is designed for _new
  record_ flows where losing a draft is painful. Edit forms should always show
  server data, not a stale draft. Either skip `persistKey` entirely on edit
  forms, or scope the key with the record ID so each record has its own
  independent draft.
- **Calling `reset(serverData)` before the component mounts.** `reset` must be
  called inside a `useEffect` when data arrives asynchronously — calling it
  during render has no effect on the next paint.

### What to learn

- `reset()` — resets to `defaultValues` (or a new value if passed).
- `clearPersistedData()` — removes the sessionStorage entry.
- `onSuccess` callback receives the action result — ideal place to reset.
- For edit forms: pass server data as `defaultValues` and avoid `persistKey`,
  or scope the key to the record ID.

### Content outline

1. The three reset scenarios and when each applies
2. Clearing form after successful create
3. Resetting to new server data (edit flow)
4. Clearing persisted drafts on success
5. Scoping `persistKey` to a record ID for edit + persist
6. Using `useEffect` to apply async default values

### Example

```tsx
// Scenario A: Clear after create
export function CreatePostForm() {
  const { register, handleSubmit, reset, clearPersistedData, formState } = useActionForm(createPostAction, {
    defaultValues: { title: "", body: "" },
    persistKey: "create-post-draft",
    onSuccess: () => {
      reset(); // reset RHF state to defaultValues
      clearPersistedData(); // wipe sessionStorage so draft doesn't return
    },
  });

  // ...
}
```

```tsx
// Scenario B: Edit form – no persistKey, reset when server data arrives
type PostFields = { title: string; body: string };

export function EditPostForm({ post }: { post: Post }) {
  const { register, handleSubmit, reset, formState } = useActionForm<PostFields>(updatePostAction, {
    // Pass server data directly – no persistKey needed
    defaultValues: { title: post.title, body: post.body },
  });

  // If `post` prop changes (e.g. route navigation), sync the form
  useEffect(() => {
    reset({ title: post.title, body: post.body });
  }, [post.id, reset]);

  return (
    <form onSubmit={handleSubmit()}>
      <input {...register("title")} />
      <textarea {...register("body")} />
      <button type="submit" disabled={!formState.isDirty}>
        Save Changes
      </button>
    </form>
  );
}
```

```tsx
// Scenario C: Edit form where user might have a draft
// Scope persistKey to record ID – each record keeps its own draft independently
export function EditPostWithDraft({ post }: { post: Post }) {
  const { register, handleSubmit, reset, clearPersistedData } = useActionForm<PostFields>(updatePostAction, {
    defaultValues: { title: post.title, body: post.body },
    // Key is scoped to this specific post
    persistKey: `edit-post-${post.id}`,
    onSuccess: () => {
      clearPersistedData();
      reset({ title: post.title, body: post.body });
    },
  });

  // ...
}
```

> **Gotcha:** The library merges persisted data on top of `defaultValues`
> during initialization (`{ ...defaultValues, ...persisted }`). On edit forms
> without ID-scoped keys, a draft from a _different_ record leaks into the
> current form.

---

## 6. Loading Initial Data

### Why this matters

Edit forms need to show existing data. The challenge is that this data is
often fetched asynchronously — either from a server component that passes it
as props, from a `useEffect` fetch, or from a router loader. The hook's
`defaultValues` are only read once, on mount. If data arrives after mount,
you must call `reset()` to sync.

### Common questions

- "I'm using `async/await` in a Server Component to fetch the post. How do I
  pass it to the form?"
- "My data fetch is in a `useEffect`. When I set `defaultValues` after fetch
  it doesn't update the form."
- "I want to show a loading skeleton while data loads, then populate the form."
- "How do `isLoading` and `defaultValues` interact?"

### Common mistakes

- **Setting `defaultValues` inside the hook as a promise.** RHF's
  `defaultValues` accepts a promise (async default values), but the library
  wraps `useForm` and the merging logic with `persistKey` runs synchronously.
  Pass resolved values, not promises.
- **Not calling `reset()` when async data arrives.** `useEffect(() => {
if (data) reset(data) }, [data])` is the correct pattern.
- **Passing `undefined` fields.** If a field is present in the schema but
  absent from `defaultValues`, RHF treats it as an uncontrolled component. Set
  explicit empty values.
- **Forgetting `disabled` state during loading.** While data is loading, the
  submit button should be disabled to prevent premature submission with empty
  values.

### What to learn

- Preferred pattern in Next.js App Router: fetch in Server Component, pass as
  props — no `useEffect` needed.
- SPA / client-fetch pattern: empty `defaultValues` on mount, `reset(data)`
  when fetch resolves.
- RHF's `formState.isLoading` is `true` while async `defaultValues` promise
  is pending — can be used to show a skeleton.

### Content outline

1. The App Router way: Server Component → Client Component props
2. Client-side fetch with `useEffect` + `reset`
3. Handling loading states (skeleton, disabled submit)
4. What happens to `persistKey` when initial data arrives late
5. Partial population: only some fields have server defaults

### Example

```tsx
// App Router (recommended): fetch in Server Component
// page.tsx (Server Component)
import { EditPostForm } from "./EditPostForm";
import { db } from "@/lib/db";

export default async function EditPostPage({ params }: { params: { id: string } }) {
  const post = await db.posts.findById(params.id);
  if (!post) notFound();

  // Data is available synchronously from the client component's perspective
  return <EditPostForm post={post} />;
}
```

```tsx
// EditPostForm.tsx (Client Component)
"use client";
import { useActionForm } from "hookform-action";
import { updatePostAction } from "./actions";

export function EditPostForm({ post }: { post: Post }) {
  const {
    register,
    handleSubmit,
    formState: { isDirty, isSubmitting },
  } = useActionForm(updatePostAction, {
    // Data is already available on mount – no useEffect needed
    defaultValues: {
      title: post.title,
      slug: post.slug,
      body: post.body,
      published: post.published,
    },
  });

  return (
    <form onSubmit={handleSubmit()}>
      <input {...register("title")} />
      <input {...register("slug")} />
      <textarea {...register("body")} />
      <button type="submit" disabled={!isDirty || isSubmitting}>
        {isSubmitting ? "Saving..." : "Save"}
      </button>
    </form>
  );
}
```

```tsx
// SPA pattern: client-side fetch
"use client";
import { useEffect } from "react";
import { useActionForm } from "hookform-action-standalone";

export function EditPostFormSPA({ postId }: { postId: string }) {
  const {
    register,
    handleSubmit,
    reset,
    formState: { isSubmitting },
  } = useActionForm({
    submit: async (data) => updatePost(postId, data),
    defaultValues: { title: "", body: "" }, // start empty
  });

  useEffect(() => {
    fetchPost(postId).then((post) => {
      // Sync form with fetched data
      reset({ title: post.title, body: post.body });
    });
  }, [postId, reset]);

  return (
    <form onSubmit={handleSubmit()}>
      <input {...register("title")} />
      <button type="submit" disabled={isSubmitting}>
        Save
      </button>
    </form>
  );
}
```

---

## 7. Multi-Step Wizard

### Why this matters

Multi-step flows (onboarding, checkout, application) have several hard
problems at once:

- **Partial validation**: step 1 should only validate step 1 fields.
- **Draft preservation**: a page refresh or accidental navigation should not
  lose progress.
- **Final submit**: the action runs once, with all data from all steps.
- **Back navigation**: going back should show the previously entered values.
- **Server errors that belong to an earlier step**: the user is on step 3 but
  the error is on `email` (step 1) — they must be brought back.

### Common questions

- "How do I validate only the current step's fields before advancing?"
- "Should I have one `useActionForm` for the entire wizard, or one per step?"
- "How do I go back and keep the data I entered in step 2?"
- "The server returned an error on a field in step 1, but I'm showing step 3.
  What do I do?"

### Common mistakes

- **One form per step.** Data is split across multiple React state atoms,
  making the final submit complex. Use **one** `useActionForm` for the entire
  wizard — this is what `persistKey` is designed for.
- **Advancing without validating.** Calling `setStep(step + 1)` directly
  allows garbage data into later steps. Always call `trigger(fields)` first.
- **Not clearing the draft on success.** `persistKey` saves every keystroke.
  After a successful final submit, call `clearPersistedData()` to prevent the
  completed wizard from reappearing.
- **Forgetting that `trigger` validates against the _full_ schema.** If step 1
  validates `firstName` but the full Zod schema also requires `plan`, Zod will
  fail. Use `.pick()` or `.partial()` for per-step trigger checks, or rely
  purely on `trigger` (which validates only the specified fields against the
  schema, reporting only those errors).

### What to learn

- `trigger(['field1', 'field2'])` — validates a subset of fields and reports
  only their errors. Returns `true` if all pass.
- `persistKey` — saves the whole form state across renders and page navigations.
- One `useActionForm` per wizard, `step` controlled by local `useState`.
- On success, call `reset()` and `clearPersistedData()`.
- If a server error lands on an earlier step's field, track which step owns
  which field and `setStep` to that step.

### Content outline

1. Architecture: one form for the whole wizard
2. Declaring all fields in `defaultValues`
3. Per-step validation with `trigger`
4. Draft persistence with `persistKey`
5. Progress indicator tied to step state
6. Handling server errors that belong to earlier steps
7. Success state and cleanup

### Example

```ts
// schema.ts
import { z } from "zod";

export const onboardingSchema = z.object({
  // Step 1
  firstName: z.string().min(2),
  lastName: z.string().min(2),
  email: z.string().email(),
  // Step 2
  company: z.string().min(1),
  role: z.string().min(1),
  // Step 3
  plan: z.enum(["free", "pro", "enterprise"]),
  agreeToTerms: z.literal(true, { errorMap: () => ({ message: "Required" }) }),
});

export type OnboardingFields = z.infer<typeof onboardingSchema>;

// Map each field to the step that owns it – used for error routing
export const FIELD_STEP: Record<keyof OnboardingFields, number> = {
  firstName: 0,
  lastName: 0,
  email: 0,
  company: 1,
  role: 1,
  plan: 2,
  agreeToTerms: 2,
};
```

```tsx
// WizardForm.tsx
"use client";
import { useState } from "react";
import { useActionForm } from "hookform-action";
import { onboardingAction } from "./actions";
import { type OnboardingFields, FIELD_STEP } from "./schema";

const STEPS_FIELDS: (keyof OnboardingFields)[][] = [
  ["firstName", "lastName", "email"],
  ["company", "role"],
  ["plan", "agreeToTerms"],
];

export function WizardForm() {
  const [step, setStep] = useState(0);

  const {
    register,
    handleSubmit,
    trigger,
    setStep: _,
    formState: { errors, isSubmitting, isSubmitSuccessful },
    reset,
    clearPersistedData,
  } = useActionForm<OnboardingFields>(onboardingAction, {
    defaultValues: {
      firstName: "",
      lastName: "",
      email: "",
      company: "",
      role: "",
      plan: "free",
      agreeToTerms: false as unknown as true,
    },
    persistKey: "onboarding-wizard",
    persistDebounce: 200,
    onSuccess: () => {
      reset();
      clearPersistedData();
    },
    onError: (result) => {
      // If server returns errors on earlier-step fields, navigate back
      if (result && typeof result === "object" && "errors" in result) {
        const errorFields = Object.keys((result as { errors: Record<string, unknown> }).errors);
        const earliestStep = Math.min(...errorFields.map((f) => FIELD_STEP[f as keyof OnboardingFields] ?? step));
        if (earliestStep < step) setStep(earliestStep);
      }
    },
  });

  if (isSubmitSuccessful) {
    return <div>🎉 Welcome aboard!</div>;
  }

  const advance = async () => {
    const valid = await trigger(STEPS_FIELDS[step]);
    if (valid) setStep((s) => s + 1);
  };

  return (
    <form onSubmit={handleSubmit()}>
      {/* Step 1 */}
      {step === 0 && (
        <>
          <input {...register("firstName")} placeholder="First name" />
          {errors.firstName && <span>{errors.firstName.message}</span>}

          <input {...register("email")} type="email" placeholder="Email" />
          {errors.email && <span>{errors.email.message}</span>}
        </>
      )}

      {/* Step 2 */}
      {step === 1 && (
        <>
          <input {...register("company")} placeholder="Company" />
          {errors.company && <span>{errors.company.message}</span>}
        </>
      )}

      {/* Step 3 */}
      {step === 2 && (
        <>
          <select {...register("plan")}>
            <option value="free">Free</option>
            <option value="pro">Pro</option>
            <option value="enterprise">Enterprise</option>
          </select>
          {errors.plan && <span>{errors.plan.message}</span>}

          <input type="checkbox" {...register("agreeToTerms")} />
          {errors.agreeToTerms && <span>{errors.agreeToTerms.message}</span>}
        </>
      )}

      <div>
        {step > 0 && (
          <button type="button" onClick={() => setStep((s) => s - 1)}>
            Back
          </button>
        )}
        {step < 2 ? (
          <button type="button" onClick={advance}>
            Next
          </button>
        ) : (
          <button type="submit" disabled={isSubmitting}>
            {isSubmitting ? "Submitting..." : "Finish"}
          </button>
        )}
      </div>
    </form>
  );
}
```

> **Performance note:** `persistKey` debounces writes to `sessionStorage` by
> 200 ms (configurable via `persistDebounce`). For long wizards, lower it to
> 100 ms — 200 ms means a fast typer could lose 1-2 keystrokes on a crash.

---

## 8. Optimistic UI with Rollback

### Why this matters

Optimistic UI makes the UI respond instantly to user actions — before the
server confirms success. A todo item appears in the list the moment the user
clicks "Add", not after 1-2 seconds of waiting. This dramatically improves
perceived performance. The hard part is the rollback: when the server returns
an error or throws, the optimistic item must disappear and the original state
must be restored — automatically, without the developer writing manual undo
logic.

### Common questions

- "What's the difference between `optimisticData` and `optimisticInitial`?"
- "My optimistic item stays in the list even after the server fails."
- "Can I use optimistic UI without React 19?"
- "How do I show which items are 'pending' vs confirmed?"

### Common mistakes

- **Not providing `optimisticInitial`.** The optimistic state starts from
  `optimisticInitial`. If it's `undefined`, `optimistic.data` is `undefined`
  on first render, causing a flash or crash.
- **Computing optimistic state that's too complex to reverse.** The reducer
  should be a pure function that only adds/changes what the user action should
  add/change. Don't call side-effect APIs inside `optimisticData`.
- **Confusing `optimistic.data` with `actionResult`.** `optimistic.data` is
  the _speculative_ state — used only in the UI while `isPending` is true.
  `actionResult` is the _confirmed_ server response. Combine them correctly:
  if `isPending`, show `optimistic.data`; otherwise show `actionResult`.
- **On React 18, expecting true concurrent optimistic updates.** The library
  falls back to a `useState` shim on React 18 — `optimistic.data` updates
  synchronously but the UI doesn't get the concurrent-mode benefits of React
  19's `useOptimistic`. It still works correctly, just without the frame-level
  batching.

### What to learn

- `optimisticKey` — enables the feature (any unique string).
- `optimisticInitial` — the starting state (your server-fetched data).
- `optimisticData` — pure reducer: `(current, formValues) => newState`.
- `optimistic.data` — the speculative state for the UI.
- `optimistic.isPending` — true while the action is in flight.
- `optimistic.rollback()` — manually revert to the last confirmed state.
- Automatic rollback: happens on thrown exception or when `errorMapper` returns
  errors.

### Content outline

1. How `useOptimistic` works under the hood (React 19 vs 18 fallback)
2. Configuring the three options: `optimisticKey`, `optimisticInitial`,
   `optimisticData`
3. Reading the optimistic state in the UI
4. Styling pending items (animated, italic, "saving..." badge)
5. Automatic vs manual rollback
6. What happens when the action throws

### Example

```ts
// actions.ts
"use server";
export type Task = { id: string; title: string; done: boolean };

let tasks: Task[] = [
  { id: "1", title: "Design the schema", done: true },
  { id: "2", title: "Write the action", done: false },
];

export async function addTaskAction(raw: unknown) {
  await new Promise((r) => setTimeout(r, 1500)); // simulate latency

  const { title } = raw as { title: string };
  if (!title?.trim()) return { errors: { title: ["Title is required"] }, tasks };

  // Simulate a random failure to demonstrate rollback
  if (title.toLowerCase() === "fail") {
    throw new Error("Server error – optimistic update will be rolled back");
  }

  const newTask: Task = { id: crypto.randomUUID(), title: title.trim(), done: false };
  tasks = [...tasks, newTask];
  return { tasks };
}
```

```tsx
// TaskList.tsx
"use client";
import { useActionForm } from "hookform-action";
import { type Task, addTaskAction } from "./actions";

type FormFields = { title: string };
type ActionResult = { tasks: Task[]; errors?: { title?: string[] } };

const initialTasks: Task[] = [
  { id: "1", title: "Design the schema", done: true },
  { id: "2", title: "Write the action", done: false },
];

export function TaskList() {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isPending, actionResult },
    optimistic,
  } = useActionForm<FormFields, ActionResult, Task[]>(addTaskAction, {
    defaultValues: { title: "" },
    optimisticKey: "tasks",
    optimisticInitial: initialTasks,
    optimisticData: (current, values) => [...current, { id: `temp-${Date.now()}`, title: values.title, done: false }],
  });

  // Merge strategy:
  //   - While pending: show optimistic list (contains temp item)
  //   - After confirmation: show server-confirmed list
  const confirmedTasks = actionResult?.tasks ?? initialTasks;
  const displayTasks = optimistic?.isPending ? optimistic.data ?? confirmedTasks : confirmedTasks;

  return (
    <div>
      <ul>
        {displayTasks.map((task) => {
          const isPendingItem = task.id.startsWith("temp-");
          return (
            <li
              key={task.id}
              style={{
                opacity: isPendingItem ? 0.6 : 1,
                fontStyle: isPendingItem ? "italic" : "normal",
              }}
            >
              {task.done ? "✅" : "⬜"} {task.title}
              {isPendingItem && <small> (saving...)</small>}
            </li>
          );
        })}
      </ul>

      <form onSubmit={handleSubmit(() => reset({ title: "" }))}>
        <input {...register("title")} placeholder="New task title" />
        {errors.title && <span>{errors.title.message}</span>}
        <button type="submit" disabled={isPending}>
          {isPending ? "Adding..." : "Add Task"}
        </button>
      </form>

      {/* Manual rollback button – useful for undo features */}
      {optimistic?.isPending && (
        <button type="button" onClick={optimistic.rollback}>
          Cancel (Undo)
        </button>
      )}
    </div>
  );
}
```

> **Architecture note:** `optimisticData` is called **before** the action
> runs. `confirmedOptimisticRef` is only updated when the action returns
> without errors. A thrown exception or returned field errors will trigger
> automatic rollback to `confirmedOptimisticRef.current`.

---

## 9. Exceptions vs Validation Errors

### Why this matters

There are two fundamentally different failure modes in a server action:

| Mode                 | Cause                      | How it reaches the client        |
| -------------------- | -------------------------- | -------------------------------- |
| **Validation error** | `{ errors: {...} }` return | `errorMapper` → RHF `setError`   |
| **Exception**        | Action `throw`s            | `onError` callback → raw `Error` |

Conflating these two leads to silent failures, unhandled error states, and
confusing UX. Validation errors should keep the form open and highlighted.
Exceptions should surface a toast, banner, or redirect.

### Common questions

- "My action throws when the DB is down. Why doesn't the error appear on the
  form?"
- "Should I throw or return `{ errors }` when validation fails?"
- "I'm catching the exception in `onError` but I also want to show a message.
  How?"
- "What happens to the optimistic state when the action throws?"

### Common mistakes

- **Throwing for expected validation failures.** Validation failures are
  expected — return a structured error object. Throw only for unexpected
  conditions (network down, DB unavailable, bug in code).
- **Using `errorMapper` to handle thrown errors.** `errorMapper` only runs
  when the action _returns_ a value. If it throws, `onError` is called with an
  `Error` instance — `errorMapper` is never invoked.
- **Not providing `onError` at all.** Without `onError`, thrown exceptions are
  silently swallowed (after rollback and form state reset). The user sees
  nothing — the form just becomes unblocked with no feedback.
- **Calling `setError` inside a `catch` block outside the hook.** Use
  `setSubmitError` (returned by the hook) to imperatively set errors from
  outside the mapper.

### What to learn

- **Return `{ errors }` for validation failures** (duplicates, rule violations,
  malformed data caught server-side).
- **Throw for infrastructure failures** (DB down, auth service unreachable,
  unexpected exceptions).
- `onError(result | Error)` — `result` can be either the raw TResult (when the
  action returns field errors and the mapper fires) or an `Error` instance
  (when the action throws).
- Check `result instanceof Error` in `onError` to distinguish the two cases.
- Optimistic state is automatically rolled back in both cases.

### Content outline

1. The semantic difference: expected vs unexpected failure
2. Server action authoring guide: when to throw vs return
3. How the library routes each failure mode
4. Implementing `onError` for toast / banner / redirect
5. Type narrowing inside `onError`: `result instanceof Error`
6. Global error boundary vs in-form error handling

### Example

```ts
// actions.ts – demonstrating both patterns
"use server";
import { withZod } from "hookform-action-core/with-zod";
import { paymentSchema } from "./schema";

export const processPaymentAction = withZod(paymentSchema, async (data) => {
  // ✅ Expected failure: return structured errors
  const card = await paymentGateway.validate(data.cardNumber);
  if (!card.valid) {
    return { errors: { cardNumber: [card.message] } };
  }

  const fundsCheck = await paymentGateway.checkFunds(data.cardNumber, data.amount);
  if (!fundsCheck.sufficient) {
    return { errors: { amount: ["Insufficient funds"] } };
  }

  // ✅ Infrastructure failure: let it throw naturally
  // The payment gateway throws on network error or service outage.
  // withZod does not catch this – it propagates to onError.
  const charge = await paymentGateway.charge(data);

  return { success: true, transactionId: charge.id };
});
```

```tsx
// PaymentForm.tsx
"use client";
import { toast } from "sonner";
import { useActionForm } from "hookform-action";
import { processPaymentAction } from "./actions";

type PaymentResult = {
  success?: boolean;
  transactionId?: string;
  errors?: Record<string, string[]>;
};

export function PaymentForm() {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    setSubmitError,
  } = useActionForm(processPaymentAction, {
    onSuccess: (result) => {
      toast.success(`Payment confirmed! ID: ${result.transactionId}`);
    },
    onError: (result) => {
      if (result instanceof Error) {
        // Thrown exception – infrastructure failure
        toast.error("Payment service is unavailable. Please try again later.");
        // Optionally set a form-level error for inline display too
        setSubmitError("_form" as never, result.message);
      }
      // If result is not an Error instance, it's a validation failure
      // already handled by errorMapper → RHF setError above.
      // No need to do anything here.
    },
  });

  return (
    <form onSubmit={handleSubmit()}>
      {/* Form-level error banner */}
      {errors._form && (
        <div role="alert" className="error-banner">
          {errors._form.message}
        </div>
      )}

      <input {...register("cardNumber")} placeholder="Card number" />
      {errors.cardNumber && <span>{errors.cardNumber.message}</span>}

      <input type="number" {...register("amount")} placeholder="Amount" />
      {errors.amount && <span>{errors.amount.message}</span>}

      <button type="submit" disabled={isSubmitting}>
        {isSubmitting ? "Processing..." : "Pay Now"}
      </button>
    </form>
  );
}
```

> **Mental model:** think of it as HTTP status codes. A `422 Unprocessable
Entity` is a validation error — return it. A `503 Service Unavailable` is
> an infrastructure failure — throw it.

---

## 10. File Uploads

### Why this matters

File inputs are the most common reason to reach for `FormData` instead of JSON
actions. Files cannot be JSON-serialized. They must travel as `multipart/form-data`.
The library detects whether the action accepts `(prevState, formData)` or
`(data)` and serializes accordingly — but the developer must register the file
input correctly, handle the File object on the server, and deal with the
complexities of size limits, progress, and multiple files.

### Common questions

- "Do I use `register('avatar')` or a custom `onChange`?"
- "Should my action accept `FormData` or can I use a JSON action with files?"
- "How do I access the file on the server inside `withZod`?"
- "How do I show upload progress?"
- "Can I upload multiple files at once?"

### Common mistakes

- **Using a JSON action (`(data: unknown) => Promise<R>`) for file uploads.**
  JSON cannot carry `File` objects. The library auto-converts them to `File`
  inside a `FormData` when calling a FormData-signature action, but it cannot
  serialize `File` to JSON. Use a FormData action for file uploads.
- **Forgetting `encType="multipart/form-data"` on the form element.** Not
  required when using `handleSubmit()` (JavaScript handles the request), but
  required if using `formAction` with progressive enhancement.
- **Using `z.instanceof(File)` in a server-side `withZod` action.**
  `File` is not available on the server in Node.js < 20. Use `z.any()` or
  `z.custom<File>()` in the Zod schema for the file field, and do the runtime
  check manually.
- **No upload progress with server actions.** Server Actions in Next.js use the
  Fetch API under the hood — `onUploadProgress` is not available. For progress,
  use a pre-signed URL approach (S3, Cloudflare R2) or a dedicated upload
  service.

### What to learn

- Use a FormData action (two-argument signature) for file uploads.
- `register('avatar')` works — RHF stores `FileList` for file inputs.
- The library serializes `File` and `FileList` into `FormData.append` calls.
- Validate file type and size server-side (or with a custom `validate` in RHF).
- For multiple files, use `accept` attribute and `multiple` on the input.
- For progress, consider pre-signed URLs instead of Server Actions.

### Content outline

1. Why files require FormData (not JSON)
2. How the library serializes File / FileList to FormData
3. Registering a file input with `register`
4. Server-side: reading the file from FormData
5. Client-side file validation (type, size) before submit
6. Multiple file uploads
7. Upload progress: limitations and alternatives (pre-signed URLs)
8. Displaying previews with `URL.createObjectURL`

### Example

```ts
// actions.ts (FormData action signature)
"use server";
import { z } from "zod";
import { put } from "@vercel/blob"; // or any storage SDK

// Note: z.custom<File> is used for server-side – File may not be available
// in all Node.js versions. Validate type/size manually.
const uploadSchema = z.object({
  name: z.string().min(1, "Name is required"),
  // For the file field: use z.any() and validate manually
  avatar: z.any(),
});

export async function uploadAvatarAction(prevState: unknown, formData: FormData) {
  const name = formData.get("name");
  const avatar = formData.get("avatar");

  // Manual Zod validation on the non-file fields
  const parsed = uploadSchema.safeParse({ name, avatar });
  if (!parsed.success) {
    return { errors: parsed.error.flatten().fieldErrors };
  }

  if (!(avatar instanceof File) || avatar.size === 0) {
    return { errors: { avatar: ["Please select a file"] } };
  }

  // File size limit: 5 MB
  const MAX_SIZE = 5 * 1024 * 1024;
  if (avatar.size > MAX_SIZE) {
    return { errors: { avatar: ["File must be smaller than 5 MB"] } };
  }

  // Allowed types
  const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp"];
  if (!ALLOWED_TYPES.includes(avatar.type)) {
    return { errors: { avatar: ["Only JPEG, PNG, and WebP are allowed"] } };
  }

  const blob = await put(`avatars/${name}-${Date.now()}`, avatar, {
    access: "public",
  });

  return { success: true, url: blob.url };
}
```

```tsx
// AvatarUploadForm.tsx
"use client";
import { useState } from "react";
import { useActionForm } from "hookform-action";
import { uploadAvatarAction } from "./actions";

type UploadFields = { name: string; avatar: FileList };
type UploadResult = { success?: boolean; url?: string; errors?: Record<string, string[]> };

export function AvatarUploadForm() {
  const [preview, setPreview] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting, isSubmitSuccessful },
    watch,
  } = useActionForm<UploadFields, UploadResult>(uploadAvatarAction, {
    defaultValues: { name: "" },
  });

  // Live preview using URL.createObjectURL
  const avatarFiles = watch("avatar");
  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setPreview(URL.createObjectURL(file));
    }
  };

  if (isSubmitSuccessful) {
    return <p>✅ Avatar uploaded!</p>;
  }

  return (
    <form onSubmit={handleSubmit()} encType="multipart/form-data">
      <input {...register("name")} placeholder="Your name" />
      {errors.name && <span>{errors.name.message}</span>}

      <input
        type="file"
        accept="image/jpeg,image/png,image/webp"
        {...register("avatar", {
          // Client-side validation before hitting the server
          validate: {
            maxSize: (files: FileList) =>
              !files[0] || files[0].size <= 5 * 1024 * 1024 ? true : "File must be smaller than 5 MB",
            acceptedTypes: (files: FileList) =>
              !files[0] || ["image/jpeg", "image/png", "image/webp"].includes(files[0].type)
                ? true
                : "Only JPEG, PNG, and WebP are allowed",
          },
          onChange: handleAvatarChange,
        })}
      />
      {errors.avatar && <span>{errors.avatar.message as string}</span>}

      {preview && (
        <img src={preview} alt="Preview" style={{ width: 80, height: 80, borderRadius: "50%", objectFit: "cover" }} />
      )}

      <button type="submit" disabled={isSubmitting}>
        {isSubmitting ? "Uploading..." : "Upload Avatar"}
      </button>
    </form>
  );
}
```

```tsx
// Multiple file uploads
<input
  type="file"
  multiple
  accept="image/*"
  {...register("photos", {
    validate: {
      maxFiles: (files: FileList) => (files.length <= 5 ? true : "Maximum 5 photos allowed"),
    },
  })}
/>
```

> **Upload progress:** Server Actions in Next.js don't expose upload progress
> events. If you need a progress bar, upload directly to S3/R2 using a
> pre-signed URL (fetch the URL from a server action, then `PUT` the file
> directly from the browser using the Fetch API with a `ReadableStream`), and
> only save the resulting URL via a second server action.

---

## Quick Reference

### Error flow summary

```
User submits
    │
    ├─► Client Zod validation (if schema + validationMode != 'onSubmit')
    │       └── fails → setError on field, no network call
    │
    ├─► handleSubmit (RHF validation gate)
    │       └── fails → setError on field, no network call
    │
    ├─► executeAction
    │       ├── Client Zod (onSubmit mode)
    │       │       └── fails → setError, no network call
    │       │
    │       ├── Optimistic update applied
    │       │
    │       ├── Action called
    │       │       ├── Returns → errorMapper(result)
    │       │       │       ├── null/undefined → onSuccess
    │       │       │       └── { field: [...] } → setError per field
    │       │       │               └── onError(result)  [result is TResult]
    │       │       │               └── optimistic ROLLBACK
    │       │       └── Throws → onError(error)  [error is Error]
    │       │               └── optimistic ROLLBACK
```

### When to use which option

| Scenario                                      | Option                                                   |
| --------------------------------------------- | -------------------------------------------------------- |
| Show errors from a non-standard API           | `errorMapper`                                            |
| Imperatively attach a server error to a field | `setSubmitError`                                         |
| Save progress across page navigations         | `persistKey`                                             |
| Clear saved progress after success            | `clearPersistedData()`                                   |
| Validate a subset of fields (wizard)          | `trigger(['field1', 'field2'])`                          |
| Instant UI feedback before server confirms    | `optimisticKey` + `optimisticData` + `optimisticInitial` |
| React to infrastructure failures (throw)      | `onError`                                                |
| React to successful submission                | `onSuccess`                                              |
| Pre-populate an edit form                     | `defaultValues` + `reset(serverData)` in `useEffect`     |
| Upload files                                  | Two-argument FormData action                             |

### Type imports cheatsheet

```ts
import type {
  ErrorMapper, // (result: TResult) => FieldErrorRecord | null
  FieldErrorRecord, // Record<string, string[] | undefined>
  ActionResult, // { success?: boolean; errors?: FieldErrorRecord; data?: T }
  OptimisticState, // { data: T; isPending: boolean; rollback: () => void }
  OptimisticReducer, // (current: T, formValues: F) => T
} from "hookform-action-core/core-types";
```
