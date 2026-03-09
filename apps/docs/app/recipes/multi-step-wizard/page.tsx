export default function MultiStepWizardPage() {
  return (
    <div className="max-w-4xl mx-auto px-6 py-16">
      <div className="mb-8">
        <a href="/recipes" className="text-sm text-gray-500 hover:text-gray-300 transition-colors">
          ← Back to Recipes
        </a>
      </div>

      <div className="mb-12">
        <div className="flex items-center gap-3 mb-4">
          <span className="text-xs font-bold bg-red-500/15 text-red-400 border border-red-500/25 rounded-full px-3 py-1">
            Tier 1 · Must-have
          </span>
          <span className="text-xs text-brand-400 font-medium">★ Featured</span>
          <span className="text-gray-500 text-sm font-mono">Recipe #5</span>
        </div>
        <h1 className="text-3xl font-bold mb-3">Multi-Step Wizard</h1>
        <p className="text-lg text-gray-400">
          Per-step validation, sessionStorage-backed progress, and safe cleanup on final submit — the most complete
          demonstration of what makes this library different.
        </p>
        <a
          href="/examples/wizard"
          className="inline-flex items-center gap-1 mt-4 text-sm text-brand-400 hover:text-brand-300 transition-colors"
        >
          See live demo →
        </a>
      </div>

      {/* Why it matters */}
      <section className="mb-12">
        <h2 className="text-xl font-bold mb-3">Why it matters</h2>
        <p className="text-gray-400 leading-relaxed">
          Multi-step wizards are notoriously painful to implement: you need to validate only the current step&apos;s
          fields before advancing, persist progress so the user can close the tab and come back, and cleanly submit all
          steps&apos; data in a single action at the end.
        </p>
        <p className="text-gray-400 leading-relaxed mt-3">
          <code>hookform-action</code> solves this with a single hook instance spanning all steps.
          <code>trigger(fields)</code> validates a subset of fields without submitting. <code>persistKey</code>{" "}
          automatically serialises form state to <code>sessionStorage</code> on every change. And{" "}
          <code>clearPersistedData()</code> removes the draft cleanly on success. No external state manager needed.
        </p>
      </section>

      {/* Full Example */}
      <section className="mb-12">
        <h2 className="text-xl font-bold mb-6">Full Example</h2>

        <div className="mb-5">
          <span className="text-xs font-mono text-gray-400 bg-gray-800 px-2 py-0.5 rounded border border-gray-700">
            actions.ts
          </span>
          <div className="code-block mt-2 text-gray-300">
            <pre>{`'use server'
import { z } from 'zod'
import { withZod } from 'hookform-action-core/with-zod'

// Single schema covering all wizard steps
const onboardingSchema = z.object({
  // Step 1: Personal Info
  firstName: z.string().min(2, 'First name must be at least 2 characters'),
  lastName:  z.string().min(2, 'Last name must be at least 2 characters'),
  email:     z.string().email('Enter a valid email address'),
  // Step 2: Company
  company: z.string().min(1, 'Company name is required'),
  role:    z.string().min(1, 'Role is required'),
  // Step 3: Plan
  plan: z.enum(['free', 'pro', 'enterprise'], {
    errorMap: () => ({ message: 'Please select a plan' }),
  }),
})

export const onboardingAction = withZod(onboardingSchema, async (data) => {
  // All fields are available and typed here
  await createAccount(data)
  return { success: true }
})`}</pre>
          </div>
        </div>

        <div className="mb-5">
          <span className="text-xs font-mono text-gray-400 bg-gray-800 px-2 py-0.5 rounded border border-gray-700">
            wizard-form.tsx
          </span>
          <div className="code-block mt-2 text-gray-300">
            <pre>{`'use client'
import { useActionForm } from 'hookform-action'
import { useState } from 'react'
import { onboardingAction } from './actions'

// Map each step index to the fields it owns
const STEP_FIELDS = {
  0: ['firstName', 'lastName', 'email'],
  1: ['company', 'role'],
  2: ['plan'],
} as const

export function OnboardingWizard() {
  const [step, setStep] = useState(0)

  const {
    register,
    handleSubmit,
    trigger,
    clearPersistedData,
    formState: { errors, isPending, isSubmitSuccessful },
  } = useActionForm(onboardingAction, {
    defaultValues: {
      firstName: '', lastName: '', email: '',
      company: '', role: '',
      plan: '',
    },
    // Automatically save progress to sessionStorage
    persistKey: 'onboarding-wizard',
    persistDebounce: 250,
    onSuccess: () => {
      // Remove the draft once the wizard is complete
      clearPersistedData()
    },
  })

  // Validate only the current step's fields before advancing
  const handleNext = async () => {
    const fields = STEP_FIELDS[step as 0 | 1 | 2]
    const valid = await trigger(fields as never[])
    if (valid) setStep((s) => s + 1)
  }

  if (isSubmitSuccessful) {
    return (
      <div className="text-center py-16">
        <p className="text-2xl font-bold text-green-400">🎉 Welcome aboard!</p>
        <p className="text-gray-400 mt-2">Your account is ready.</p>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit()}>
      {/* Progress indicator */}
      <div className="flex gap-2 mb-8">
        {['Personal', 'Company', 'Plan'].map((label, i) => (
          <div key={label} className="flex items-center gap-2 flex-1">
            <div
              className={
                i <= step
                  ? 'w-6 h-6 rounded-full bg-brand-600 text-white text-xs flex items-center justify-center'
                  : 'w-6 h-6 rounded-full bg-gray-800 text-gray-500 text-xs flex items-center justify-center'
              }
            >
              {i + 1}
            </div>
            <span className={i <= step ? 'text-sm text-gray-200' : 'text-sm text-gray-600'}>
              {label}
            </span>
          </div>
        ))}
      </div>

      {/* Step 1 */}
      {step === 0 && (
        <div className="space-y-4">
          <div>
            <label>First Name</label>
            <input {...register('firstName')} />
            {errors.firstName && <p className="text-red-400">{errors.firstName.message}</p>}
          </div>
          <div>
            <label>Last Name</label>
            <input {...register('lastName')} />
            {errors.lastName && <p className="text-red-400">{errors.lastName.message}</p>}
          </div>
          <div>
            <label>Email</label>
            <input type="email" {...register('email')} />
            {errors.email && <p className="text-red-400">{errors.email.message}</p>}
          </div>
        </div>
      )}

      {/* Step 2 */}
      {step === 1 && (
        <div className="space-y-4">
          <div>
            <label>Company</label>
            <input {...register('company')} />
            {errors.company && <p className="text-red-400">{errors.company.message}</p>}
          </div>
          <div>
            <label>Role</label>
            <input {...register('role')} />
            {errors.role && <p className="text-red-400">{errors.role.message}</p>}
          </div>
        </div>
      )}

      {/* Step 3 */}
      {step === 2 && (
        <div className="space-y-3">
          <label>Choose a plan</label>
          {(['free', 'pro', 'enterprise'] as const).map((p) => (
            <label key={p} className="flex items-center gap-2">
              <input type="radio" value={p} {...register('plan')} />
              {p.charAt(0).toUpperCase() + p.slice(1)}
            </label>
          ))}
          {errors.plan && <p className="text-red-400">{errors.plan.message}</p>}
        </div>
      )}

      {/* Navigation */}
      <div className="flex gap-3 mt-8">
        {step > 0 && (
          <button type="button" onClick={() => setStep((s) => s - 1)}>
            Back
          </button>
        )}
        {step < 2 ? (
          <button type="button" onClick={handleNext}>
            Next
          </button>
        ) : (
          <button type="submit" disabled={isPending}>
            {isPending ? 'Creating account…' : 'Complete Setup'}
          </button>
        )}
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
            <code className="text-brand-400">trigger(fields)</code>
            <p className="text-gray-400 text-sm mt-1">
              Runs client-side validation on a specific subset of fields and returns <code>true</code> if all pass. Pass
              only the fields of the current step to avoid surfacing errors from future steps prematurely. Calling{" "}
              <code>trigger()</code> with no arguments validates everything — avoid this between steps.
            </p>
          </div>
          <div className="bg-gray-900 border border-gray-800 rounded-lg p-4">
            <code className="text-brand-400">persistKey + persistDebounce</code>
            <p className="text-gray-400 text-sm mt-1">
              <code>persistKey</code> enables automatic <code>sessionStorage</code> persistence. The form state is saved
              under this key on every change (debounced by <code>persistDebounce</code> ms, default 300) and restored on
              mount. The user can close the browser and return to find their progress intact.
            </p>
          </div>
          <div className="bg-gray-900 border border-gray-800 rounded-lg p-4">
            <code className="text-brand-400">clearPersistedData()</code>
            <p className="text-gray-400 text-sm mt-1">
              Manually removes the persisted state for this form&apos;s <code>persistKey</code>. Always call it in{" "}
              <code>onSuccess</code> after wizard completion — otherwise the next user to open the form (or the current
              user if they start again) will see the completed wizard&apos;s data pre-filled.
            </p>
          </div>
          <div className="bg-gray-900 border border-gray-800 rounded-lg p-4">
            <code className="text-brand-400">Single hook instance across all steps</code>
            <p className="text-gray-400 text-sm mt-1">
              All fields are registered in one <code>useActionForm</code> call. The active step is controlled by plain{" "}
              <code>useState</code>. This means the entire form state is consistent at all times, and the final submit
              sends all fields in one action call.
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
                Calling <code>trigger()</code> without arguments between steps
              </p>
              <p className="text-sm text-gray-400 mt-1">
                This validates all fields — including ones in future steps the user has not seen yet — and shows errors
                prematurely. Always pass the explicit list of fields for the current step.
              </p>
            </div>
          </li>
          <li className="flex gap-3 bg-yellow-500/5 border border-yellow-500/20 rounded-lg p-4">
            <span className="text-yellow-400 shrink-0 mt-0.5">⚠</span>
            <div>
              <p className="text-sm font-medium text-gray-200">
                Using <code>isSubmitSuccessful</code> to advance between steps
              </p>
              <p className="text-sm text-gray-400 mt-1">
                <code>isSubmitSuccessful</code> only becomes <code>true</code> after the final action call succeeds. Use
                it exclusively as the guard for the completion screen. Step navigation is purely local state.
              </p>
            </div>
          </li>
          <li className="flex gap-3 bg-yellow-500/5 border border-yellow-500/20 rounded-lg p-4">
            <span className="text-yellow-400 shrink-0 mt-0.5">⚠</span>
            <div>
              <p className="text-sm font-medium text-gray-200">
                Forgetting <code>clearPersistedData()</code> after submission
              </p>
              <p className="text-sm text-gray-400 mt-1">
                The persistence happens automatically on every change. After success, the persisted data is not removed
                automatically — you must call <code>clearPersistedData()</code> in <code>onSuccess</code>, or the next
                visit to the form will restore the completed wizard.
              </p>
            </div>
          </li>
          <li className="flex gap-3 bg-yellow-500/5 border border-yellow-500/20 rounded-lg p-4">
            <span className="text-yellow-400 shrink-0 mt-0.5">⚠</span>
            <div>
              <p className="text-sm font-medium text-gray-200">The current step is not persisted by default</p>
              <p className="text-sm text-gray-400 mt-1">
                <code>persistKey</code> saves field values, not the step index. If the user returns after a refresh, the
                form starts at step 0 with the field values intact. To also persist the step, store it in{" "}
                <code>sessionStorage</code> alongside the form, or include a hidden <code>currentStep</code> field.
              </p>
            </div>
          </li>
        </ul>
      </section>

      {/* Related */}
      <section className="border-t border-gray-800 pt-8">
        <h2 className="text-lg font-semibold mb-4">Related</h2>
        <div className="flex flex-wrap gap-4 text-sm">
          <a href="/recipes/reset-after-success" className="text-brand-400 hover:text-brand-300 transition-colors">
            → Reset After Success
          </a>
          <a href="/recipes/signup-server-errors" className="text-brand-400 hover:text-brand-300 transition-colors">
            → Sign Up with Server Errors
          </a>
          <a href="/examples/wizard" className="text-brand-400 hover:text-brand-300 transition-colors">
            → Live Wizard Example
          </a>
          <a href="/api-reference" className="text-brand-400 hover:text-brand-300 transition-colors">
            → API Reference
          </a>
        </div>
      </section>
    </div>
  );
}
