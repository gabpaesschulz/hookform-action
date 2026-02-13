import type { ZodError, ZodSchema } from 'zod'
import type { ActionResult, FieldErrorRecord } from './types'

/** Local alias to avoid `infer as ZodInfer` which breaks DTS rollup (keyword conflict). */
type ZodInfer<T extends ZodSchema> = T['_output']

// ---------------------------------------------------------------------------
// withZod – wraps a handler with Zod schema validation (v2)
// ---------------------------------------------------------------------------

/**
 * Wraps a handler function with Zod schema validation.
 *
 * If validation fails, returns `{ success: false, errors }` where `errors`
 * follows the Zod `.flatten().fieldErrors` format (i.e. `Record<string, string[]>`).
 *
 * If validation succeeds, calls the handler with the parsed (typed) data.
 *
 * **v2:** The returned action now has the schema attached as `__schema`,
 * allowing `useActionForm` to auto-detect it for client-side validation.
 *
 * @example
 * ```ts
 * // In a Server Action file:
 * import { z } from 'zod'
 * import { withZod } from 'hookform-action-core/with-zod'
 *
 * const schema = z.object({
 *   email: z.string().email(),
 *   password: z.string().min(8),
 * })
 *
 * export const loginAction = withZod(schema, async (data) => {
 *   // `data` is fully typed as { email: string; password: string }
 *   const user = await authenticate(data.email, data.password)
 *   return { success: true, data: user }
 * })
 *
 * // In the client component:
 * // useActionForm auto-detects the schema – no need to pass it again!
 * const form = useActionForm(loginAction, {
 *   validationMode: 'onChange', // real-time validation with the same schema
 * })
 * ```
 */
export function withZod<TSchema extends ZodSchema, TResult = ActionResult>(
  schema: TSchema,
  handler: (data: ZodInfer<TSchema>) => Promise<TResult>,
): ((data: unknown) => Promise<TResult | { success: false; errors: FieldErrorRecord }>) & {
  __schema: TSchema
} {
  const action = async (data: unknown) => {
    // If data is FormData, convert to plain object first
    const rawData = data instanceof FormData ? formDataToObject(data) : data

    const parsed = schema.safeParse(rawData)

    if (!parsed.success) {
      const zodError = parsed.error as ZodError
      const flat = zodError.flatten()

      const errors: FieldErrorRecord = {}

      // Field-level errors
      for (const [field, messages] of Object.entries(flat.fieldErrors)) {
        if (messages && messages.length > 0) {
          errors[field] = messages as string[]
        }
      }

      // Include form-level errors under a special key if present
      if (flat.formErrors && flat.formErrors.length > 0) {
        errors._form = flat.formErrors
      }

      return { success: false, errors } as { success: false; errors: FieldErrorRecord }
    }

    return handler(parsed.data)
  }

  // Attach schema for auto-detection by useActionForm
  action.__schema = schema

  return action
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/**
 * Converts a FormData instance into a plain object.
 * Handles multiple values for the same key by creating arrays.
 */
function formDataToObject(formData: FormData): Record<string, unknown> {
  const obj: Record<string, unknown> = {}

  for (const [key, value] of formData.entries()) {
    if (key in obj) {
      const existing = obj[key]
      if (Array.isArray(existing)) {
        existing.push(value)
      } else {
        obj[key] = [existing, value]
      }
    } else {
      obj[key] = value
    }
  }

  return obj
}
