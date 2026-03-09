export default function NestedFieldsPage() {
  return (
    <div className="max-w-4xl mx-auto px-6 py-16">
      <div className="mb-8">
        <a href="/recipes" className="text-sm text-gray-500 hover:text-gray-300 transition-colors">
          ← Back to Recipes
        </a>
      </div>

      <div className="mb-12">
        <div className="flex items-center gap-3 mb-4">
          <span className="text-xs font-bold bg-gray-700/50 text-gray-400 border border-gray-600/50 rounded-full px-3 py-1">
            Tier 3 · Specialized
          </span>
          <span className="text-gray-500 text-sm font-mono">Recipe #10</span>
        </div>
        <h1 className="text-3xl font-bold mb-3">Nested Fields &amp; Sub-components</h1>
        <p className="text-lg text-gray-400">
          Compose large forms from smaller, focused components using <code>useFormContext</code> —
          without passing <code>register</code>, <code>errors</code>, or <code>control</code> as
          props through every level.
        </p>
      </div>

      {/* Why it matters */}
      <section className="mb-12">
        <h2 className="text-xl font-bold mb-3">Why it matters</h2>
        <p className="text-gray-400 leading-relaxed">
          Large forms — checkout, onboarding, profile settings — are easier to maintain when split
          into focused sub-components. But React Hook Form&apos;s <code>register</code>,{' '}
          <code>control</code>, and <code>formState</code> normally need to be prop-drilled down the
          tree, which creates tight coupling and verbose component signatures.
        </p>
        <p className="text-gray-400 leading-relaxed mt-3">
          The <code>{'<Form>'}</code> component from <code>hookform-action</code> wraps its children
          in React Hook Form&apos;s <code>FormProvider</code> automatically. Any component inside
          the tree can call <code>useFormContext()</code> to access the full RHF API without any
          prop passing.
        </p>
      </section>

      {/* Full Example */}
      <section className="mb-12">
        <h2 className="text-xl font-bold mb-6">Full Example — Checkout Form</h2>

        <div className="mb-5">
          <span className="text-xs font-mono text-gray-400 bg-gray-800 px-2 py-0.5 rounded border border-gray-700">
            actions.ts
          </span>
          <div className="code-block mt-2 text-gray-300">
            <pre>{`'use server'
import { z } from 'zod'
import { withZod } from 'hookform-action-core/with-zod'

export const checkoutSchema = z.object({
  customer: z.object({
    name:  z.string().min(1, 'Name is required'),
    email: z.string().email('Enter a valid email'),
  }),
  shipping: z.object({
    street:  z.string().min(1, 'Street is required'),
    city:    z.string().min(1, 'City is required'),
    country: z.string().min(2, 'Select a country'),
  }),
})

export type CheckoutValues = z.infer<typeof checkoutSchema>

export const checkoutAction = withZod(checkoutSchema, async (data) => {
  await processOrder(data)
  return { success: true }
})`}</pre>
          </div>
        </div>

        <div className="mb-5">
          <span className="text-xs font-mono text-gray-400 bg-gray-800 px-2 py-0.5 rounded border border-gray-700">
            checkout-form.tsx — Root component
          </span>
          <div className="code-block mt-2 text-gray-300">
            <pre>{`'use client'
import { useActionForm } from 'hookform-action'
import { Form } from 'hookform-action-core'  // or from 'hookform-action'
import { checkoutAction } from './actions'
import type { CheckoutValues } from './actions'
import { CustomerSection } from './CustomerSection'
import { ShippingSection } from './ShippingSection'

export function CheckoutForm() {
  // useActionForm returns the full RHF API plus action integration
  const form = useActionForm<CheckoutValues>(checkoutAction, {
    defaultValues: {
      customer: { name: '', email: '' },
      shipping: { street: '', city: '', country: '' },
    },
  })

  return (
    // <Form> automatically wraps children in <FormProvider>
    // Sub-components can use useFormContext() without any prop passing
    <Form form={form}>
      <CustomerSection />
      <ShippingSection />

      <button
        type="submit"
        disabled={form.formState.isPending}
        className="w-full py-3 bg-brand-600 hover:bg-brand-500 text-white rounded-lg font-medium"
      >
        {form.formState.isPending ? 'Processing…' : 'Place Order'}
      </button>
    </Form>
  )
}`}</pre>
          </div>
        </div>

        <div className="mb-5">
          <span className="text-xs font-mono text-gray-400 bg-gray-800 px-2 py-0.5 rounded border border-gray-700">
            CustomerSection.tsx — Sub-component
          </span>
          <div className="code-block mt-2 text-gray-300">
            <pre>{`'use client'
import { useFormContext } from 'react-hook-form'
import type { CheckoutValues } from './actions'

export function CustomerSection() {
  // No props needed — reads form context from the parent <Form>
  const {
    register,
    formState: { errors },
  } = useFormContext<CheckoutValues>()

  return (
    <section className="mb-6">
      <h3 className="text-lg font-semibold mb-4">Customer Info</h3>

      <div className="space-y-4">
        <div>
          <label htmlFor="name" className="text-sm text-gray-400">Full Name</label>
          <input
            id="name"
            {...register('customer.name')}   // dot-notation for nested path
            placeholder="Jane Doe"
          />
          {errors.customer?.name && (
            <p className="text-red-400 text-sm">{errors.customer.name.message}</p>
          )}
        </div>

        <div>
          <label htmlFor="email" className="text-sm text-gray-400">Email</label>
          <input
            id="email"
            type="email"
            {...register('customer.email')}
            placeholder="jane@example.com"
          />
          {errors.customer?.email && (
            <p className="text-red-400 text-sm">{errors.customer.email.message}</p>
          )}
        </div>
      </div>
    </section>
  )
}`}</pre>
          </div>
        </div>

        <div className="mb-5">
          <span className="text-xs font-mono text-gray-400 bg-gray-800 px-2 py-0.5 rounded border border-gray-700">
            ShippingSection.tsx — Sub-component with Controller
          </span>
          <div className="code-block mt-2 text-gray-300">
            <pre>{`'use client'
import { Controller, useFormContext } from 'react-hook-form'
import type { CheckoutValues } from './actions'

export function ShippingSection() {
  const {
    register,
    control,    // ← needed for Controller / useFieldArray in sub-components
    formState: { errors },
  } = useFormContext<CheckoutValues>()

  return (
    <section className="mb-6">
      <h3 className="text-lg font-semibold mb-4">Shipping Address</h3>

      <div className="space-y-4">
        <div>
          <label className="text-sm text-gray-400">Street</label>
          <input {...register('shipping.street')} placeholder="123 Main St" />
          {errors.shipping?.street && (
            <p className="text-red-400 text-sm">{errors.shipping.street.message}</p>
          )}
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="text-sm text-gray-400">City</label>
            <input {...register('shipping.city')} placeholder="New York" />
            {errors.shipping?.city && (
              <p className="text-red-400 text-sm">{errors.shipping.city.message}</p>
            )}
          </div>

          <div>
            <label className="text-sm text-gray-400">Country</label>
            {/* Controller example — for custom select components */}
            <Controller
              name="shipping.country"
              control={control}
              render={({ field }) => (
                <select {...field}>
                  <option value="">Select…</option>
                  <option value="US">United States</option>
                  <option value="BR">Brazil</option>
                </select>
              )}
            />
            {errors.shipping?.country && (
              <p className="text-red-400 text-sm">{errors.shipping.country.message}</p>
            )}
          </div>
        </div>
      </div>
    </section>
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
            <code className="text-brand-400">{'<Form form={form}>'} — automatic FormProvider</code>
            <p className="text-gray-400 text-sm mt-1">
              The <code>{'<Form>'}</code> component from <code>hookform-action</code> wraps children
              in RHF&apos;s <code>FormProvider</code> automatically. You do not need to add{' '}
              <code>FormProvider</code> yourself. All sub-components in the tree can call{' '}
              <code>useFormContext()</code>.
            </p>
          </div>
          <div className="bg-gray-900 border border-gray-800 rounded-lg p-4">
            <code className="text-brand-400">useFormContext&lt;TFieldValues&gt;()</code>
            <p className="text-gray-400 text-sm mt-1">
              Pass the form&apos;s type parameter to get typed access to <code>register</code>,{' '}
              <code>errors</code>, and <code>control</code>. Without the generic, you get{' '}
              <code>FieldValues</code> (essentially <code>any</code>
              ).
            </p>
          </div>
          <div className="bg-gray-900 border border-gray-800 rounded-lg p-4">
            <code className="text-brand-400">Dot-notation for nested paths</code>
            <p className="text-gray-400 text-sm mt-1">
              Register deeply nested fields with dot notation:{' '}
              <code>register(&apos;customer.name&apos;)</code>. RHF will collect these into a
              properly structured object. The Zod schema&apos;s shape must match exactly.
            </p>
          </div>
          <div className="bg-gray-900 border border-gray-800 rounded-lg p-4">
            <code className="text-brand-400">control in sub-components</code>
            <p className="text-gray-400 text-sm mt-1">
              <code>control</code> is needed for <code>Controller</code> and{' '}
              <code>useFieldArray</code> inside sub-components. Get it from{' '}
              <code>useFormContext()</code> — not passed as a prop from the parent.
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
                Double-wrapping with <code>FormProvider</code>
              </p>
              <p className="text-sm text-gray-400 mt-1">
                <code>{'<Form>'}</code> already includes a <code>FormProvider</code>. Adding another
                one around it creates nested contexts and causes <code>useFormContext()</code> to
                read from the innermost (empty) provider.
              </p>
            </div>
          </li>
          <li className="flex gap-3 bg-yellow-500/5 border border-yellow-500/20 rounded-lg p-4">
            <span className="text-yellow-400 shrink-0 mt-0.5">⚠</span>
            <div>
              <p className="text-sm font-medium text-gray-200">
                Sub-components using <code>useFormContext</code> outside <code>{'<Form>'}</code>
              </p>
              <p className="text-sm text-gray-400 mt-1">
                If a sub-component is rendered outside the <code>{'<Form>'}</code> tree (e.g. in a
                portal, a story, or a test), <code>useFormContext()</code> will return{' '}
                <code>undefined</code> and throw. Wrap test cases in a mock{' '}
                <code>FormProvider</code>.
              </p>
            </div>
          </li>
          <li className="flex gap-3 bg-yellow-500/5 border border-yellow-500/20 rounded-lg p-4">
            <span className="text-yellow-400 shrink-0 mt-0.5">⚠</span>
            <div>
              <p className="text-sm font-medium text-gray-200">
                Mismatched dot-notation path and schema shape
              </p>
              <p className="text-sm text-gray-400 mt-1">
                If you register <code>customer.name</code> but the Zod schema expects{' '}
                <code>customerName</code> (flat), the field will not validate correctly and the
                error path will not match. Keep the schema and the <code>register</code> paths in
                sync.
              </p>
            </div>
          </li>
        </ul>
      </section>

      {/* Related */}
      <section className="border-t border-gray-800 pt-8">
        <h2 className="text-lg font-semibold mb-4">Related</h2>
        <div className="flex flex-wrap gap-4 text-sm">
          <a
            href="/recipes/field-array"
            className="text-brand-400 hover:text-brand-300 transition-colors"
          >
            → Dynamic Fields with useFieldArray
          </a>
          <a
            href="/recipes/multi-step-wizard"
            className="text-brand-400 hover:text-brand-300 transition-colors"
          >
            → Multi-Step Wizard
          </a>
          <a
            href="https://react-hook-form.com/docs/useformcontext"
            target="_blank"
            rel="noreferrer"
            className="text-brand-400 hover:text-brand-300 transition-colors"
          >
            → RHF useFormContext docs ↗
          </a>
          <a
            href="/api-reference"
            className="text-brand-400 hover:text-brand-300 transition-colors"
          >
            → API Reference
          </a>
        </div>
      </section>
    </div>
  )
}
