import type { FieldValues } from 'react-hook-form'

// ---------------------------------------------------------------------------
// SSR-safe sessionStorage helpers
// ---------------------------------------------------------------------------

function isClient(): boolean {
  return typeof window !== 'undefined' && typeof window.sessionStorage !== 'undefined'
}

/**
 * Load persisted form values from sessionStorage.
 * Returns `null` when running on the server or when no data is stored.
 */
export function loadPersistedValues<TFieldValues extends FieldValues>(
  key: string,
): TFieldValues | null {
  if (!isClient()) return null

  try {
    const raw = window.sessionStorage.getItem(key)
    if (!raw) return null
    return JSON.parse(raw) as TFieldValues
  } catch {
    return null
  }
}

/**
 * Save form values to sessionStorage.
 */
export function savePersistedValues<TFieldValues extends FieldValues>(
  key: string,
  values: TFieldValues,
): void {
  if (!isClient()) return

  try {
    window.sessionStorage.setItem(key, JSON.stringify(values))
  } catch {
    // Storage full or unavailable – silently ignore
  }
}

/**
 * Remove persisted form values from sessionStorage.
 */
export function clearPersistedValues(key: string): void {
  if (!isClient()) return

  try {
    window.sessionStorage.removeItem(key)
  } catch {
    // Silently ignore
  }
}

// ---------------------------------------------------------------------------
// Debounce utility
// ---------------------------------------------------------------------------

/**
 * Creates a debounced version of a function.
 */
export function debounce<TArgs extends unknown[]>(
  fn: (...args: TArgs) => void,
  delay: number,
): (...args: TArgs) => void {
  let timer: ReturnType<typeof setTimeout> | null = null

  return (...args: TArgs) => {
    if (timer) clearTimeout(timer)
    timer = setTimeout(() => {
      fn(...args)
      timer = null
    }, delay)
  }
}
