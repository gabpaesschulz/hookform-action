export default function FieldArrayPage() {
  return (
    <div className="max-w-4xl mx-auto px-6 py-16">
      <div className="mb-8">
        <a href="/recipes" className="text-sm text-gray-500 hover:text-gray-300 transition-colors">
          ← Back to Recipes
        </a>
      </div>

      <div className="mb-12">
        <div className="flex items-center gap-3 mb-4">
          <span className="text-xs font-bold bg-yellow-500/15 text-yellow-400 border border-yellow-500/25 rounded-full px-3 py-1">
            Tier 2 · Common
          </span>
          <span className="text-gray-500 text-sm font-mono">Recipe #8</span>
        </div>
        <h1 className="text-3xl font-bold mb-3">Dynamic Fields with useFieldArray</h1>
        <p className="text-lg text-gray-400">
          Add and remove array items at runtime, validate each row independently, and submit the full typed array to
          your server action.
        </p>
      </div>

      {/* Why it matters */}
      <section className="mb-12">
        <h2 className="text-xl font-bold mb-3">Why it matters</h2>
        <p className="text-gray-400 leading-relaxed">
          Dynamic lists — invoice line items, contact addresses, team members, skill tags — are one of the most common
          patterns in real-world forms. React Hook Form&apos;s <code>useFieldArray</code> is the standard solution, but
          integrating it with <code>useActionForm</code> has nuances: the <code>control</code> object must come from the
          hook, arrays don&apos;t play well with <code>FormData</code> actions, and per-item error paths have a specific
          shape.
        </p>
        <p className="text-gray-400 leading-relaxed mt-3">
          This recipe shows a complete address list form with add, remove, per-field errors, and a <code>withZod</code>{" "}
          server action that receives and validates the full typed array.
        </p>
      </section>

      {/* Full Example */}
      <section className="mb-12">
        <h2 className="text-xl font-bold mb-6">Full Example — Address List</h2>

        <div className="mb-5">
          <span className="text-xs font-mono text-gray-400 bg-gray-800 px-2 py-0.5 rounded border border-gray-700">
            actions.ts
          </span>
          <div className="code-block mt-2 text-gray-300">
            <pre>{`'use server'
import { z } from 'zod'
import { withZod } from 'hookform-action-core/with-zod'

const addressSchema = z.object({
  addresses: z
    .array(
      z.object({
        street:  z.string().min(1, 'Street is required'),
        city:    z.string().min(1, 'City is required'),
        country: z.string().min(2, 'Select a country'),
      })
    )
    .min(1, 'Add at least one address'),
})

export const saveAddressesAction = withZod(addressSchema, async (data) => {
  // data.addresses is typed as { street: string; city: string; country: string }[]
  await db.addresses.replaceAll(data.addresses)
  return { success: true }
})`}</pre>
          </div>
        </div>

        <div className="mb-5">
          <span className="text-xs font-mono text-gray-400 bg-gray-800 px-2 py-0.5 rounded border border-gray-700">
            address-form.tsx
          </span>
          <div className="code-block mt-2 text-gray-300">
            <pre>{`'use client'
import { useFieldArray } from 'react-hook-form'   // from RHF, not hookform-action
import { useActionForm } from 'hookform-action'
import { saveAddressesAction } from './actions'

type AddressValues = {
  addresses: { street: string; city: string; country: string }[]
}

const EMPTY_ADDRESS = { street: '', city: '', country: '' }

export function AddressForm() {
  const {
    register,
    control,          // ← pass to useFieldArray
    handleSubmit,
    formState: { errors, isPending, isSubmitSuccessful },
  } = useActionForm<AddressValues>(saveAddressesAction, {
    defaultValues: { addresses: [EMPTY_ADDRESS] },
  })

  // useFieldArray reads and writes through the same RHF control
  const { fields, append, remove, move } = useFieldArray({
    control,
    name: 'addresses',
  })

  if (isSubmitSuccessful) {
    return <p className="text-green-400">Addresses saved!</p>
  }

  return (
    <form onSubmit={handleSubmit()}>
      <div className="space-y-4">
        {fields.map((field, index) => (
          // IMPORTANT: use field.id as key — not the array index
          <div key={field.id} className="border border-gray-800 rounded-lg p-4">
            <div className="flex items-center justify-between mb-3">
              <span className="text-sm font-medium text-gray-400">
                Address {index + 1}
              </span>
              {fields.length > 1 && (
                <button
                  type="button"
                  onClick={() => remove(index)}
                  className="text-sm text-red-400 hover:text-red-300"
                >
                  Remove
                </button>
              )}
            </div>

            <div className="space-y-3">
              <div>
                <label className="text-xs text-gray-500">Street</label>
                <input
                  {...register(\`addresses.\${index}.street\`)}
                  placeholder="123 Main St"
                />
                {errors.addresses?.[index]?.street && (
                  <p className="text-red-400 text-sm mt-1">
                    {errors.addresses[index].street?.message}
                  </p>
                )}
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs text-gray-500">City</label>
                  <input
                    {...register(\`addresses.\${index}.city\`)}
                    placeholder="New York"
                  />
                  {errors.addresses?.[index]?.city && (
                    <p className="text-red-400 text-sm mt-1">
                      {errors.addresses[index].city?.message}
                    </p>
                  )}
                </div>

                <div>
                  <label className="text-xs text-gray-500">Country</label>
                  <select {...register(\`addresses.\${index}.country\`)}>
                    <option value="">Select…</option>
                    <option value="US">United States</option>
                    <option value="GB">United Kingdom</option>
                    <option value="BR">Brazil</option>
                  </select>
                  {errors.addresses?.[index]?.country && (
                    <p className="text-red-400 text-sm mt-1">
                      {errors.addresses[index].country?.message}
                    </p>
                  )}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Array-level error (e.g. "Add at least one address") */}
      {errors.addresses?.root && (
        <p className="text-red-400 text-sm mt-2">{errors.addresses.root.message}</p>
      )}

      <div className="flex gap-3 mt-6">
        <button
          type="button"
          onClick={() => append(EMPTY_ADDRESS)}
          className="text-sm text-brand-400 hover:text-brand-300"
        >
          + Add address
        </button>

        <button type="submit" disabled={isPending} className="ml-auto">
          {isPending ? 'Saving…' : 'Save Addresses'}
        </button>
      </div>
    </form>
  )
}`}</pre>
          </div>
        </div>
      </section>

      {/* Key Concepts */}
      <section className="mb-12">
        <h2 className="text-xl font-bold mb-4">Key Concepts</h2>
        <div className="space-y-3">
          <div className="bg-gray-900 border border-gray-800 rounded-lg p-4">
            <code className="text-brand-400">useFieldArray requires control</code>
            <p className="text-gray-400 text-sm mt-1">
              <code>useFieldArray</code> is from <code>react-hook-form</code> (not this library). It needs the{" "}
              <code>control</code> object from <code>useActionForm</code>. You cannot use it with the standalone{" "}
              <code>register</code> spread pattern.
            </p>
          </div>
          <div className="bg-gray-900 border border-gray-800 rounded-lg p-4">
            <code className="text-brand-400">field.id as key (not index)</code>
            <p className="text-gray-400 text-sm mt-1">
              <code>useFieldArray</code> generates stable IDs for each row. Always use <code>field.id</code> as the
              React <code>key</code>, not the array index. Index-based keys cause incorrect animations and state
              mismatches when rows are removed.
            </p>
          </div>
          <div className="bg-gray-900 border border-gray-800 rounded-lg p-4">
            <code className="text-brand-400">{`register(\`name.\${index}.field\`)`} — dot notation</code>
            <p className="text-gray-400 text-sm mt-1">
              Use template literal dot-notation to register nested array fields. RHF will collect them into a properly
              structured array in <code>getValues()</code> and on submit.
            </p>
          </div>
          <div className="bg-gray-900 border border-gray-800 rounded-lg p-4">
            <code className="text-brand-400">Use withZod (JSON action), not FormData</code>
            <p className="text-gray-400 text-sm mt-1">
              FormData doesn&apos;t natively support nested arrays. Always use <code>withZod</code> (which sends JSON)
              for forms with <code>useFieldArray</code>. If you must use a FormData action, serialize the array manually
              with <code>JSON.stringify</code>.
            </p>
          </div>
        </div>
      </section>

      {/* Pitfalls */}
      <section className="mb-12">
        <h2 className="text-xl font-bold mb-4">⚠️ Pitfalls</h2>
        <ul className="space-y-3">
          <li className="flex gap-3 bg-yellow-500/5 border border-yellow-500/20 rounded-lg p-4">
            <span className="text-yellow-400 shrink-0 mt-0.5">⚠</span>
            <div>
              <p className="text-sm font-medium text-gray-200">
                Using the array index as <code>key</code>
              </p>
              <p className="text-sm text-gray-400 mt-1">
                When you remove item at index 1 from [0, 1, 2], React reuses the DOM node for the new index 1
                (previously index 2). Input values get mixed up. Always use <code>field.id</code>.
              </p>
            </div>
          </li>
          <li className="flex gap-3 bg-yellow-500/5 border border-yellow-500/20 rounded-lg p-4">
            <span className="text-yellow-400 shrink-0 mt-0.5">⚠</span>
            <div>
              <p className="text-sm font-medium text-gray-200">Per-item errors path typo</p>
              <p className="text-sm text-gray-400 mt-1">
                The errors path is <code>errors.addresses?.[index]?.street?.message</code> — note the optional chaining
                at each level. Missing any level causes a runtime error when there are no errors.
              </p>
            </div>
          </li>
          <li className="flex gap-3 bg-yellow-500/5 border border-yellow-500/20 rounded-lg p-4">
            <span className="text-yellow-400 shrink-0 mt-0.5">⚠</span>
            <div>
              <p className="text-sm font-medium text-gray-200">EMPTY_ADDRESS defined inside the component</p>
              <p className="text-sm text-gray-400 mt-1">
                Define the empty item template outside the component (or with <code>useCallback</code> /{" "}
                <code>useMemo</code>). An inline object creates a new reference on every render and can cause unexpected{" "}
                <code>append</code> behaviour.
              </p>
            </div>
          </li>
        </ul>
      </section>

      {/* Related */}
      <section className="border-t border-gray-800 pt-8">
        <h2 className="text-lg font-semibold mb-4">Related</h2>
        <div className="flex flex-wrap gap-4 text-sm">
          <a href="/recipes/nested-fields" className="text-brand-400 hover:text-brand-300 transition-colors">
            → Nested Fields &amp; Sub-components
          </a>
          <a href="/recipes/signup-server-errors" className="text-brand-400 hover:text-brand-300 transition-colors">
            → Sign Up with Server Errors
          </a>
          <a
            href="https://react-hook-form.com/docs/usefieldarray"
            target="_blank"
            rel="noreferrer"
            className="text-brand-400 hover:text-brand-300 transition-colors"
          >
            → RHF useFieldArray docs ↗
          </a>
          <a href="/api-reference" className="text-brand-400 hover:text-brand-300 transition-colors">
            → API Reference
          </a>
        </div>
      </section>
    </div>
  );
}
