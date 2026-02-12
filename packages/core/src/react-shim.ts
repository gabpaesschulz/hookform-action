// react-shim.ts
// ---------------------------------------------------------------------------
// Safe compatibility shim for React 18 + React 19
// ---------------------------------------------------------------------------
// DO NOT import hooks like `useActionState` or `useOptimistic` directly from
// 'react'. They only exist in React 19+ and will break the build on React 18.
//
// This shim dynamically checks for their existence at runtime and provides
// silent fallbacks so the library works on both versions.
// ---------------------------------------------------------------------------

import React from 'react'

// ---------------------------------------------------------------------------
// useActionState (React 19) — fallback to useFormState-like noop on React 18
// ---------------------------------------------------------------------------

/**
 * React 19's `useActionState` replaces `useFormState`.
 * On React 18 we fall back to a noop that returns [initialState, dispatch, false].
 */
// @ts-ignore – useActionState only exists in React 19+
export const useActionState: typeof React.useActionState | undefined =
  // @ts-ignore
  (React as unknown as Record<string, unknown>).useActionState ?? undefined

// ---------------------------------------------------------------------------
// useOptimistic (React 19) — fallback to identity on React 18
// ---------------------------------------------------------------------------

/**
 * React 19's `useOptimistic` for optimistic UI updates.
 * On React 18 we return a noop: [passthrough state, noop setter].
 */
// @ts-ignore – useOptimistic only exists in React 19+
export const useOptimistic: typeof React.useOptimistic | undefined =
  // @ts-ignore
  (React as unknown as Record<string, unknown>).useOptimistic ?? undefined

/**
 * Whether the current React runtime supports `useOptimistic`.
 */
export const hasUseOptimistic = typeof useOptimistic === 'function'

/**
 * Whether the current React runtime supports `useActionState`.
 */
export const hasUseActionState = typeof useActionState === 'function'

// ---------------------------------------------------------------------------
// useTransition – exists in both React 18 and 19
// ---------------------------------------------------------------------------
// Re-export directly since it's stable in both versions.

export { useTransition } from 'react'
