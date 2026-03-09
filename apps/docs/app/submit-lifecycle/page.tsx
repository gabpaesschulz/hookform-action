export default function SubmitLifecyclePage() {
  return (
    <div className="max-w-5xl mx-auto px-6 py-16">
      <div className="mb-8">
        <a href="/" className="text-sm text-gray-500 hover:text-gray-300 transition-colors">
          ← Back to docs
        </a>
      </div>

      <h1 className="text-3xl font-bold mb-3">Submit Lifecycle</h1>
      <p className="text-gray-400 max-w-3xl mb-10">
        A practical mental model for <code>isSubmitting</code>, <code>isPending</code>,{' '}
        <code>isSubmitSuccessful</code>, <code>submitErrors</code>, and <code>actionResult</code>.
      </p>

      {/* 1. Simple explanation */}
      <section className="mb-14">
        <h2 className="text-2xl font-bold mb-4 text-brand-400">1) Simple Explanation</h2>
        <p className="text-gray-400 mb-5">
          Think of <code>hookform-action</code> as RHF + an action lifecycle layer.
        </p>
        <ol className="space-y-3 text-gray-300 list-decimal list-inside">
          <li>
            <span className="font-medium text-gray-200">Idle</span>: no request in flight.
          </li>
          <li>
            <span className="font-medium text-gray-200">Submit starts</span>:{' '}
            <code>isSubmitting = true</code>, <code>isPending = true</code>,{' '}
            <code>submitErrors = null</code>.
          </li>
          <li>
            <span className="font-medium text-gray-200">Success</span>:{' '}
            <code>isPending = false</code>, <code>isSubmitting = false</code>,{' '}
            <code>isSubmitSuccessful = true</code>, <code>submitErrors = null</code>,{' '}
            <code>actionResult = result</code>.
          </li>
          <li>
            <span className="font-medium text-gray-200">Field error result</span>:{' '}
            <code>isPending = false</code>, <code>isSubmitting = false</code>,{' '}
            <code>isSubmitSuccessful = false</code>, <code>submitErrors = ...</code>,{' '}
            <code>actionResult = result</code>.
          </li>
          <li>
            <span className="font-medium text-gray-200">Thrown error (network/exception)</span>:{' '}
            <code>isPending = false</code>, <code>isSubmitting = false</code>,{' '}
            <code>isSubmitSuccessful = false</code>. Handle this path in <code>onError</code>.
          </li>
        </ol>
      </section>

      {/* 2. State table */}
      <section className="mb-14">
        <h2 className="text-2xl font-bold mb-4 text-brand-400">2) State Table</h2>
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="text-gray-400 border-b border-gray-800">
              <tr>
                <th className="py-3 pr-4">State</th>
                <th className="py-3 pr-4">What it means</th>
                <th className="py-3 pr-4">When it changes</th>
                <th className="py-3">Use it for</th>
              </tr>
            </thead>
            <tbody className="text-gray-300">
              <tr className="border-b border-gray-800/50">
                <td className="py-3 pr-4 font-mono text-brand-300">formState.isSubmitting</td>
                <td className="py-3 pr-4 text-gray-400">
                  Submit is running (RHF + action internal state).
                </td>
                <td className="py-3 pr-4 text-gray-400">
                  True at submit start, false on finish/failure.
                </td>
                <td className="py-3 text-gray-400">Legacy compatibility and debugging.</td>
              </tr>
              <tr className="border-b border-gray-800/50 bg-brand-500/5">
                <td className="py-3 pr-4 font-mono text-brand-300">formState.isPending</td>
                <td className="py-3 pr-4 text-gray-400">Transition + request pending window.</td>
                <td className="py-3 pr-4 text-gray-400">
                  Derived from <code>useTransition</code> plus internal pending state.
                </td>
                <td className="py-3 text-gray-400">
                  <strong>Disable button and show loading.</strong>
                </td>
              </tr>
              <tr className="border-b border-gray-800/50">
                <td className="py-3 pr-4 font-mono text-brand-300">formState.isSubmitSuccessful</td>
                <td className="py-3 pr-4 text-gray-400">
                  Last completed submit ended without field errors.
                </td>
                <td className="py-3 pr-4 text-gray-400">
                  True on success, false on validation errors or thrown errors.
                </td>
                <td className="py-3 text-gray-400">Post-submit success logic.</td>
              </tr>
              <tr className="border-b border-gray-800/50">
                <td className="py-3 pr-4 font-mono text-brand-300">formState.submitErrors</td>
                <td className="py-3 pr-4 text-gray-400">Structured field-level error record.</td>
                <td className="py-3 pr-4 text-gray-400">
                  Set on client/server validation errors, cleared at new submit start.
                </td>
                <td className="py-3 text-gray-400">Render field/server validation feedback.</td>
              </tr>
              <tr className="border-b border-gray-800/50">
                <td className="py-3 pr-4 font-mono text-brand-300">formState.actionResult</td>
                <td className="py-3 pr-4 text-gray-400">
                  Full result object from last completed action response.
                </td>
                <td className="py-3 pr-4 text-gray-400">
                  Updated on success and field-error responses.
                </td>
                <td className="py-3 text-gray-400">Read confirmed payload with success guards.</td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>

      {/* 3. Correct usage examples */}
      <section className="mb-14">
        <h2 className="text-2xl font-bold mb-4 text-brand-400">3) Correct Usage</h2>
        <h3 className="text-lg font-semibold mb-2">Disable + loading with isPending</h3>
        <div className="code-block mb-6 text-gray-300">
          <pre>{`const {
  handleSubmit,
  formState: { isPending },
} = useActionForm(action, { defaultValues })

return (
  <form onSubmit={handleSubmit()}>
    <button type="submit" disabled={isPending}>
      {isPending ? 'Saving...' : 'Save'}
    </button>
  </form>
)`}</pre>
        </div>

        <h3 className="text-lg font-semibold mb-2">Post-submit success logic</h3>
        <div className="code-block mb-6 text-gray-300">
          <pre>{`const {
  formState: { isPending, isSubmitSuccessful },
} = useActionForm(action, { defaultValues })

useEffect(() => {
  if (!isPending && isSubmitSuccessful) {
    toast.success('Saved')
    // router.push('/dashboard')
  }
}, [isPending, isSubmitSuccessful])`}</pre>
        </div>

        <h3 className="text-lg font-semibold mb-2">Validation errors vs confirmed result</h3>
        <div className="code-block text-gray-300">
          <pre>{`const {
  formState: { submitErrors, actionResult, isSubmitSuccessful, isPending },
} = useActionForm(action, { defaultValues })

const hasFieldErrors = !!submitErrors
const confirmedData =
  !isPending && isSubmitSuccessful ? actionResult : null`}</pre>
        </div>
      </section>

      {/* 4. Misinterpretations */}
      <section className="mb-14">
        <h2 className="text-2xl font-bold mb-4 text-brand-400">4) Common Misinterpretations</h2>
        <ul className="space-y-3">
          <li className="bg-yellow-500/5 border border-yellow-500/20 rounded-lg p-4 text-sm text-gray-300">
            Using <code>isSubmitting</code> for button lock/loading. Prefer <code>isPending</code>.
          </li>
          <li className="bg-yellow-500/5 border border-yellow-500/20 rounded-lg p-4 text-sm text-gray-300">
            Treating <code>actionResult</code> as automatic success. It can also hold an
            error-shaped result.
          </li>
          <li className="bg-yellow-500/5 border border-yellow-500/20 rounded-lg p-4 text-sm text-gray-300">
            Running success side-effects only with <code>isSubmitSuccessful</code>. Gate with{' '}
            <code>!isPending</code> too.
          </li>
          <li className="bg-yellow-500/5 border border-yellow-500/20 rounded-lg p-4 text-sm text-gray-300">
            Expecting <code>submitErrors</code> for thrown exceptions. Thrown errors belong to{' '}
            <code>onError</code>.
          </li>
        </ul>
      </section>

      {/* 5. Documentation recommendations */}
      <section className="mb-14">
        <h2 className="text-2xl font-bold mb-4 text-brand-400">5) Recommended Docs Snippets</h2>
        <div className="grid sm:grid-cols-2 gap-4 text-sm">
          <div className="bg-gray-900/50 border border-gray-800 rounded-lg p-4">
            <p className="font-semibold text-gray-200 mb-2">Submit Button Snippet</p>
            <p className="text-gray-400">
              Always show <code>disabled</code> and loading from <code>isPending</code>.
            </p>
          </div>
          <div className="bg-gray-900/50 border border-gray-800 rounded-lg p-4">
            <p className="font-semibold text-gray-200 mb-2">Success Effect Snippet</p>
            <p className="text-gray-400">
              Use <code>!isPending && isSubmitSuccessful</code> to trigger post-submit effects.
            </p>
          </div>
          <div className="bg-gray-900/50 border border-gray-800 rounded-lg p-4">
            <p className="font-semibold text-gray-200 mb-2">Validation Errors Snippet</p>
            <p className="text-gray-400">
              Show <code>submitErrors</code> for field-level API errors and keep RHF{' '}
              <code>errors</code> in sync.
            </p>
          </div>
          <div className="bg-gray-900/50 border border-gray-800 rounded-lg p-4">
            <p className="font-semibold text-gray-200 mb-2">Result Guard Snippet</p>
            <p className="text-gray-400">
              Read <code>actionResult</code> only behind explicit success guards.
            </p>
          </div>
        </div>
      </section>

      <section className="border-t border-gray-800 pt-8">
        <h2 className="text-xl font-bold mb-3 text-brand-400">
          How this maps to RHF + transitions + Server Actions
        </h2>
        <p className="text-gray-400 leading-relaxed">
          RHF still owns base form mechanics (<code>register</code>, <code>errors</code>,
          touched/dirty state). hookform-action wraps submit execution, runs inside{' '}
          <code>startTransition</code>, then composes the final form state (`isPending =
          transitionPending || internalPending`). In Next.js mode, the adapter also bridges{' '}
          <code>FormData</code>/<code>prevState</code> signatures before passing control to the same
          core lifecycle.
        </p>
      </section>
    </div>
  )
}
