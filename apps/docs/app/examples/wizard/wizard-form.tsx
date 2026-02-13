'use client'

import { useActionForm } from 'hookform-action-core'
import { useState } from 'react'
import { wizardAction } from './actions'

const STEPS = ['Personal Info', 'Company', 'Plan & Confirm'] as const

export function WizardForm() {
  const [step, setStep] = useState(0)

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting, isSubmitSuccessful },
    trigger,
    getValues,
  } = useActionForm(wizardAction, {
    defaultValues: {
      firstName: '',
      lastName: '',
      email: '',
      company: '',
      role: '',
      plan: '',
      agreeToTerms: '',
    },
    persistKey: 'wizard-onboarding',
    persistDebounce: 200,
  })

  if (isSubmitSuccessful) {
    return (
      <div className="bg-green-900/30 border border-green-700 rounded-xl p-8 text-center">
        <p className="text-green-400 text-2xl font-bold mb-2">🎉 Welcome aboard!</p>
        <p className="text-gray-400">
          Your account has been created. The wizard state was cleared from sessionStorage.
        </p>
      </div>
    )
  }

  const nextStep = async () => {
    // Validate current step fields before advancing
    const fieldsPerStep: Record<number, string[]> = {
      0: ['firstName', 'lastName', 'email'],
      1: ['company', 'role'],
      2: ['plan', 'agreeToTerms'],
    }
    const valid = await trigger(fieldsPerStep[step] as never[])
    if (valid) setStep((s) => Math.min(s + 1, STEPS.length - 1))
  }

  const prevStep = () => setStep((s) => Math.max(s - 1, 0))

  const inputClass =
    'w-full px-4 py-2.5 bg-gray-900 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent transition-colors'

  return (
    <div>
      {/* Step indicators */}
      <div className="flex items-center gap-2 mb-8">
        {STEPS.map((label, i) => (
          <div key={label} className="flex items-center gap-2 flex-1">
            <div
              className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold transition-colors ${
                i <= step ? 'bg-brand-600 text-white' : 'bg-gray-800 text-gray-500'
              }`}
            >
              {i + 1}
            </div>
            <span
              className={`text-xs font-medium hidden sm:inline ${i <= step ? 'text-gray-200' : 'text-gray-600'}`}
            >
              {label}
            </span>
            {i < STEPS.length - 1 && (
              <div className={`flex-1 h-0.5 ${i < step ? 'bg-brand-600' : 'bg-gray-800'}`} />
            )}
          </div>
        ))}
      </div>

      <form onSubmit={handleSubmit()} className="space-y-5">
        {/* Step 1: Personal Info */}
        {step === 0 && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1.5">
                  First Name
                  <input placeholder="John" className={inputClass} {...register('firstName')} />
                </label>
                {errors.firstName && (
                  <p className="mt-1 text-sm text-red-400">{errors.firstName.message}</p>
                )}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1.5">
                  Last Name
                  <input placeholder="Doe" className={inputClass} {...register('lastName')} />
                </label>
                {errors.lastName && (
                  <p className="mt-1 text-sm text-red-400">{errors.lastName.message}</p>
                )}
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1.5">
                Email
                <input
                  type="email"
                  placeholder="john@company.com"
                  className={inputClass}
                  {...register('email')}
                />
              </label>
              {errors.email && <p className="mt-1 text-sm text-red-400">{errors.email.message}</p>}
            </div>
          </div>
        )}

        {/* Step 2: Company */}
        {step === 1 && (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1.5">
                Company
                <input placeholder="Acme Inc." className={inputClass} {...register('company')} />
              </label>
              {errors.company && (
                <p className="mt-1 text-sm text-red-400">{errors.company.message}</p>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1.5">
                Role
                <input
                  placeholder="Frontend Developer"
                  className={inputClass}
                  {...register('role')}
                />
              </label>
              {errors.role && <p className="mt-1 text-sm text-red-400">{errors.role.message}</p>}
            </div>
          </div>
        )}

        {/* Step 3: Plan */}
        {step === 2 && (
          <div className="space-y-4">
            <div>
              <p className="block text-sm font-medium text-gray-300 mb-3">Choose a Plan</p>
              <div className="grid grid-cols-3 gap-3">
                {(['free', 'pro', 'enterprise'] as const).map((plan) => (
                  <label
                    key={plan}
                    className={`relative flex flex-col items-center p-4 border rounded-lg cursor-pointer transition-colors ${
                      getValues('plan') === plan
                        ? 'border-brand-500 bg-brand-500/10'
                        : 'border-gray-700 hover:border-gray-600'
                    }`}
                  >
                    <input type="radio" value={plan} className="sr-only" {...register('plan')} />
                    <span className="text-lg font-semibold capitalize">{plan}</span>
                    <span className="text-xs text-gray-500 mt-1">
                      {plan === 'free' ? '$0/mo' : plan === 'pro' ? '$29/mo' : 'Custom'}
                    </span>
                  </label>
                ))}
              </div>
              {errors.plan && <p className="mt-1 text-sm text-red-400">{errors.plan.message}</p>}
            </div>
            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                value="true"
                className="w-4 h-4 rounded border-gray-600 bg-gray-900 text-brand-500 focus:ring-brand-500"
                {...register('agreeToTerms')}
              />
              <span className="text-sm text-gray-300">
                I agree to the Terms of Service and Privacy Policy
              </span>
            </label>
            {errors.agreeToTerms && (
              <p className="text-sm text-red-400">{errors.agreeToTerms.message}</p>
            )}
          </div>
        )}

        {/* Navigation */}
        <div className="flex justify-between pt-4">
          {step > 0 ? (
            <button
              type="button"
              onClick={prevStep}
              className="px-5 py-2.5 border border-gray-700 text-gray-300 rounded-lg hover:border-gray-500 transition-colors"
            >
              ← Back
            </button>
          ) : (
            <div />
          )}

          {step < STEPS.length - 1 ? (
            <button
              type="button"
              onClick={nextStep}
              className="px-5 py-2.5 bg-brand-600 hover:bg-brand-500 text-white rounded-lg font-medium transition-colors"
            >
              Next →
            </button>
          ) : (
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-5 py-2.5 bg-green-600 hover:bg-green-500 disabled:bg-gray-700 disabled:cursor-not-allowed text-white rounded-lg font-medium transition-colors"
            >
              {isSubmitting ? (
                <span className="inline-flex items-center gap-2">
                  <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" aria-hidden="true">
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                      fill="none"
                    />
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                    />
                  </svg>
                  Submitting...
                </span>
              ) : (
                'Complete Setup ✓'
              )}
            </button>
          )}
        </div>
      </form>

      <p className="text-xs text-gray-600 text-center mt-6">
        💾 Form state is persisted to sessionStorage. Refresh the page to see it restored.
      </p>
    </div>
  )
}
