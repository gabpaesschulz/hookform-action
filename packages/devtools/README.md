# hookform-action-devtools

Floating DevTools panel for **hookform-action** — inspect form state, submission history, and debug optimistic UI in real time.

[![npm version](https://img.shields.io/npm/v/hookform-action-devtools?style=flat-square&color=5c7cfa)](https://www.npmjs.com/package/hookform-action-devtools)
[![npm downloads](https://img.shields.io/npm/dm/hookform-action-devtools?style=flat-square&color=748ffc)](https://www.npmjs.com/package/hookform-action-devtools)
[![license](https://img.shields.io/npm/l/hookform-action-devtools?style=flat-square)](https://github.com/gabpaesschulz/hookform-action/blob/main/LICENSE)

## Installation

```bash
npm install hookform-action-devtools
# or
pnpm add hookform-action-devtools
```

> You also need one of the adapters: [`hookform-action`](https://www.npmjs.com/package/hookform-action) (Next.js) or [`hookform-action-standalone`](https://www.npmjs.com/package/hookform-action-standalone).

## Usage

```tsx
import { useActionForm } from "hookform-action"; // or hookform-action-standalone
import { FormDevTool } from "hookform-action-devtools";

function App() {
  const form = useActionForm(myAction, {
    defaultValues: { email: "", password: "" },
  });

  return (
    <>
      <MyForm form={form} />
      {process.env.NODE_ENV === "development" && <FormDevTool control={form.control} />}
    </>
  );
}
```

## Features

- **State Tab** — Live form values, errors, dirty/touched fields, submit status
- **History Tab** — Every submission with payload, response, and duration
- **Actions Tab** — Debug buttons (reset, clear errors, force submit) + summary stats
- 🎨 Dark theme, inline styles (no CSS dependencies)
- 📦 Tree-shakeable — excluded from production builds when wrapped in `NODE_ENV` check

## Props

| Prop          | Type                                                           | Default          | Description                             |
| ------------- | -------------------------------------------------------------- | ---------------- | --------------------------------------- |
| `control`     | `Control & { _submissionHistory?, _actionFormState? }`         | **required**     | Enhanced `control` from `useActionForm` |
| `position`    | `'bottom-left' \| 'bottom-right' \| 'top-left' \| 'top-right'` | `'bottom-right'` | Position of the toggle button           |
| `defaultOpen` | `boolean`                                                      | `false`          | Whether the panel starts open           |

## Screenshot

The DevTools panel renders as a floating button (🔍) that expands into a resizable panel showing:

```
┌─────────────────────────────────┐
│  ⚡ hookform-action DevTools    │
│  ┌───────┬─────────┬──────────┐ │
│  │ State │ History │ Actions  │ │
│  ├───────┴─────────┴──────────┤ │
│  │ values: { email: "..." }   │ │
│  │ errors: {}                 │ │
│  │ isPending: false           │ │
│  │ isSubmitSuccessful: true   │ │
│  │ submitCount: 3             │ │
│  └────────────────────────────┘ │
└─────────────────────────────────┘
```

## Related Packages

| Package                                                                                  | Description                          |
| ---------------------------------------------------------------------------------------- | ------------------------------------ |
| [`hookform-action`](https://www.npmjs.com/package/hookform-action)                       | Next.js adapter (⭐ main install)    |
| [`hookform-action-core`](https://www.npmjs.com/package/hookform-action-core)             | Core library (framework-agnostic)    |
| [`hookform-action-standalone`](https://www.npmjs.com/package/hookform-action-standalone) | Adapter for Vite, Remix, Astro, SPAs |

## License

[MIT](https://github.com/gabpaesschulz/hookform-action/blob/main/LICENSE) © hookform-action contributors
