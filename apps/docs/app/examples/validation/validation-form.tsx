'use client'

import { useActionForm } from 'hookform-action-core'
import { signupAction, signupSchema } from './actions'

export function ValidationForm() {
  const {
    register,
    handleSubmit,
    formState: { errors, isPending, isSubmitSuccessful },
  } = useActionForm(signupAction, {
    defaultValues: { username: '', email: '', password: '' },
    // Pass the schema for client-side validation on every change
    schema: signupSchema,
    validationMode: 'onChange',
  })

  if (isSubmitSuccessful) {
    return (
      <div className="bg-green-900/30 border border-green-700 rounded-xl p-6 text-center">
        <p className="text-green-400 text-lg font-medium">✓ Account created!</p>
        <p className="text-gray-400 text-sm mt-2">
          Client-side validation passed, then the server action ran successfully.
        </p>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit()} className="space-y-5">
      <div>
        <label htmlFor="username" className="block text-sm font-medium text-gray-300 mb-1.5">
          Username
        </label>
        <input
          id="username"
          type="text"
          placeholder="my_username"
          className={`w-full px-4 py-2.5 bg-gray-900 border rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:border-transparent transition-colors ${
            errors.username
              ? 'border-red-500 focus:ring-red-500'
              : 'border-gray-700 focus:ring-brand-500'
          }`}
          {...register('username')}
        />
        {errors.username && (
          <p className="mt-1.5 text-sm text-red-400">{errors.username.message}</p>
        )}
        {!errors.username && (
          <p className="mt-1.5 text-xs text-gray-500">
            3–20 characters, letters, numbers, underscores
          </p>
        )}
      </div>

      <div>
        <label htmlFor="email" className="block text-sm font-medium text-gray-300 mb-1.5">
          Email
        </label>
        <input
          id="email"
          type="email"
          placeholder="you@example.com"
          className={`w-full px-4 py-2.5 bg-gray-900 border rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:border-transparent transition-colors ${
            errors.email
              ? 'border-red-500 focus:ring-red-500'
              : 'border-gray-700 focus:ring-brand-500'
          }`}
          {...register('email')}
        />
        {errors.email && <p className="mt-1.5 text-sm text-red-400">{errors.email.message}</p>}
      </div>

      <div>
        <label htmlFor="password" className="block text-sm font-medium text-gray-300 mb-1.5">
          Password
        </label>
        <input
          id="password"
          type="password"
          placeholder="••••••••"
          className={`w-full px-4 py-2.5 bg-gray-900 border rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:border-transparent transition-colors ${
            errors.password
              ? 'border-red-500 focus:ring-red-500'
              : 'border-gray-700 focus:ring-brand-500'
          }`}
          {...register('password')}
        />
        {errors.password && (
          <p className="mt-1.5 text-sm text-red-400">{errors.password.message}</p>
        )}
        {!errors.password && (
          <p className="mt-1.5 text-xs text-gray-500">8+ characters, one uppercase, one number</p>
        )}
      </div>

      <button
        type="submit"
        disabled={isPending}
        className="w-full py-2.5 bg-brand-600 hover:bg-brand-500 disabled:bg-gray-700 disabled:cursor-not-allowed text-white rounded-lg font-medium transition-colors"
      >
        {isPending ? (
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
            Creating account...
          </span>
        ) : (
          'Create Account'
        )}
      </button>

      <p className="text-xs text-gray-500 text-center">
        Try <code className="text-gray-400">admin</code> as username or{' '}
        <code className="text-gray-400">taken@example.com</code> as email to see server-side errors
        (after client validation passes).
      </p>
    </form>
  )
}
