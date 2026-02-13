export default function ApiReferencePage() {
  return (
    <div className="max-w-4xl mx-auto px-6 py-16">
      <div className="mb-8">
        <a href="/" className="text-sm text-gray-500 hover:text-gray-300 transition-colors">
          ← Back to docs
        </a>
      </div>

      <h1 className="text-3xl font-bold mb-8">API Reference</h1>

      {/* useActionForm – Next.js */}
      <section className="mb-16">
        <h2 className="text-2xl font-bold mb-4 text-brand-400">useActionForm (Next.js)</h2>
        <p className="text-gray-400 mb-2">
          <code>
            import {'{'} useActionForm {'}'} from &apos;hookform-action&apos;
          </code>
        </p>
        <p className="text-gray-400 mb-6">Bridges React Hook Form with a Next.js Server Action.</p>

        <div className="code-block mb-6 text-gray-300">
          <pre>{`function useActionForm<TFieldValues, TResult>(
  action: ServerAction<TResult>,
  options?: UseActionFormOptions<TFieldValues, TResult>
): UseActionFormReturn<TFieldValues, TResult>`}</pre>
        </div>

        <h3 className="text-lg font-semibold mb-3">Options</h3>
        <div className="overflow-x-auto mb-8">
          <table className="w-full text-sm text-left">
            <thead className="text-gray-400 border-b border-gray-800">
              <tr>
                <th className="py-3 pr-4">Option</th>
                <th className="py-3 pr-4">Type</th>
                <th className="py-3 pr-4">Default</th>
                <th className="py-3">Description</th>
              </tr>
            </thead>
            <tbody className="text-gray-300">
              <tr className="border-b border-gray-800/50">
                <td className="py-3 pr-4 font-mono text-brand-300">defaultValues</td>
                <td className="py-3 pr-4 font-mono text-xs">DefaultValues&lt;T&gt;</td>
                <td className="py-3 pr-4 text-gray-500">—</td>
                <td className="py-3 text-gray-400">Initial form values.</td>
              </tr>
              <tr className="border-b border-gray-800/50">
                <td className="py-3 pr-4 font-mono text-brand-300">mode</td>
                <td className="py-3 pr-4 font-mono text-xs">Mode</td>
                <td className="py-3 pr-4 font-mono text-xs">&apos;onSubmit&apos;</td>
                <td className="py-3 text-gray-400">RHF validation mode.</td>
              </tr>
              <tr className="border-b border-gray-800/50">
                <td className="py-3 pr-4 font-mono text-brand-300">persistKey</td>
                <td className="py-3 pr-4 font-mono text-xs">string</td>
                <td className="py-3 pr-4 text-gray-500">—</td>
                <td className="py-3 text-gray-400">Enables sessionStorage persistence.</td>
              </tr>
              <tr className="border-b border-gray-800/50">
                <td className="py-3 pr-4 font-mono text-brand-300">persistDebounce</td>
                <td className="py-3 pr-4 font-mono text-xs">number</td>
                <td className="py-3 pr-4 font-mono text-xs">300</td>
                <td className="py-3 text-gray-400">Debounce interval (ms) for persistence.</td>
              </tr>
              <tr className="border-b border-gray-800/50">
                <td className="py-3 pr-4 font-mono text-brand-300">errorMapper</td>
                <td className="py-3 pr-4 font-mono text-xs">ErrorMapper&lt;T&gt;</td>
                <td className="py-3 pr-4 font-mono text-xs">defaultErrorMapper</td>
                <td className="py-3 text-gray-400">Custom error extractor.</td>
              </tr>
              <tr className="border-b border-gray-800/50">
                <td className="py-3 pr-4 font-mono text-brand-300">onSuccess</td>
                <td className="py-3 pr-4 font-mono text-xs">(result) =&gt; void</td>
                <td className="py-3 pr-4 text-gray-500">—</td>
                <td className="py-3 text-gray-400">Called after successful submission.</td>
              </tr>
              <tr className="border-b border-gray-800/50">
                <td className="py-3 pr-4 font-mono text-brand-300">onError</td>
                <td className="py-3 pr-4 font-mono text-xs">(result | Error) =&gt; void</td>
                <td className="py-3 pr-4 text-gray-500">—</td>
                <td className="py-3 text-gray-400">Called on error.</td>
              </tr>
              <tr className="border-b border-gray-800/50">
                <td className="py-3 pr-4 font-mono text-brand-300">schema</td>
                <td className="py-3 pr-4 font-mono text-xs">ZodSchema</td>
                <td className="py-3 pr-4 text-gray-500">—</td>
                <td className="py-3 text-gray-400">
                  Zod schema for client-side validation. Auto-detected from withZod.
                </td>
              </tr>
              <tr className="border-b border-gray-800/50">
                <td className="py-3 pr-4 font-mono text-brand-300">validationMode</td>
                <td className="py-3 pr-4 font-mono text-xs">ClientValidationMode</td>
                <td className="py-3 pr-4 font-mono text-xs">&apos;onSubmit&apos;</td>
                <td className="py-3 text-gray-400">
                  &apos;onChange&apos; | &apos;onBlur&apos; | &apos;onSubmit&apos;.
                </td>
              </tr>
              <tr className="border-b border-gray-800/50">
                <td className="py-3 pr-4 font-mono text-brand-300">optimisticKey</td>
                <td className="py-3 pr-4 font-mono text-xs">string</td>
                <td className="py-3 pr-4 text-gray-500">—</td>
                <td className="py-3 text-gray-400">Enables optimistic UI.</td>
              </tr>
              <tr className="border-b border-gray-800/50">
                <td className="py-3 pr-4 font-mono text-brand-300">optimisticData</td>
                <td className="py-3 pr-4 font-mono text-xs">(current, formData) =&gt; T</td>
                <td className="py-3 pr-4 text-gray-500">—</td>
                <td className="py-3 text-gray-400">Reducer for optimistic state.</td>
              </tr>
              <tr className="border-b border-gray-800/50">
                <td className="py-3 pr-4 font-mono text-brand-300">optimisticInitial</td>
                <td className="py-3 pr-4 font-mono text-xs">T</td>
                <td className="py-3 pr-4 text-gray-500">—</td>
                <td className="py-3 text-gray-400">Initial data for optimistic state.</td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>

      {/* useActionForm – Standalone */}
      <section className="mb-16">
        <h2 className="text-2xl font-bold mb-4 text-emerald-400">useActionForm (Standalone)</h2>
        <p className="text-gray-400 mb-2">
          <code>
            import {'{'} useActionForm {'}'} from &apos;hookform-action-standalone&apos;
          </code>
        </p>
        <p className="text-gray-400 mb-6">
          <span className="text-emerald-400 text-xs font-medium mr-1">v3</span>
          Same API, but takes an options object with <code>submit</code> instead of a Server Action.
        </p>

        <div className="code-block mb-6 text-gray-300">
          <pre>{`function useActionForm<TFieldValues, TResult>(
  options: UseStandaloneActionFormOptions<TFieldValues, TResult>
): UseStandaloneActionFormReturn<TFieldValues, TResult>`}</pre>
        </div>

        <h3 className="text-lg font-semibold mb-3">Additional Options</h3>
        <div className="overflow-x-auto mb-8">
          <table className="w-full text-sm text-left">
            <thead className="text-gray-400 border-b border-gray-800">
              <tr>
                <th className="py-3 pr-4">Option</th>
                <th className="py-3 pr-4">Type</th>
                <th className="py-3">Description</th>
              </tr>
            </thead>
            <tbody className="text-gray-300">
              <tr className="border-b border-gray-800/50 bg-emerald-500/5">
                <td className="py-3 pr-4 font-mono text-emerald-300">submit</td>
                <td className="py-3 pr-4 font-mono text-xs">
                  (data: T) =&gt; Promise&lt;TResult&gt;
                </td>
                <td className="py-3 text-gray-400">
                  <strong>Required.</strong> The async function that handles form submission.
                  Replaces the Server Action argument.
                </td>
              </tr>
            </tbody>
          </table>
        </div>
        <p className="text-gray-400 text-sm">
          All other options (<code>defaultValues</code>, <code>schema</code>,{' '}
          <code>validationMode</code>,<code>persistKey</code>, <code>optimisticKey</code>, etc.) are
          identical to the Next.js version. The return type is the same except there is no{' '}
          <code>formAction</code> property.
        </p>
      </section>

      {/* useActionFormCore */}
      <section className="mb-16">
        <h2 className="text-2xl font-bold mb-4 text-cyan-400">useActionFormCore</h2>
        <p className="text-gray-400 mb-2">
          <code>
            import {'{'} useActionFormCore {'}'} from &apos;hookform-action-core/core&apos;
          </code>
        </p>
        <p className="text-gray-400 mb-6">
          <span className="text-cyan-400 text-xs font-medium mr-1">v3</span>
          Framework-agnostic core hook. Adapters (Next.js, standalone) wrap this. Use directly only
          for building custom adapters.
        </p>

        <div className="code-block mb-6 text-gray-300">
          <pre>{`function useActionFormCore<TFieldValues, TResult>(
  submit: SubmitFunction<TFieldValues, TResult>,
  options?: UseActionFormCoreOptions<TFieldValues, TResult>
): UseActionFormCoreReturn<TFieldValues, TResult>`}</pre>
        </div>
      </section>

      {/* Return Value */}
      <section className="mb-16">
        <h2 className="text-2xl font-bold mb-4 text-brand-400">Return Value</h2>
        <p className="text-gray-400 text-sm mb-4">
          Returns everything from React Hook Form&apos;s <code>useForm</code>, plus:
        </p>
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="text-gray-400 border-b border-gray-800">
              <tr>
                <th className="py-3 pr-4">Property</th>
                <th className="py-3 pr-4">Type</th>
                <th className="py-3">Description</th>
              </tr>
            </thead>
            <tbody className="text-gray-300">
              <tr className="border-b border-gray-800/50">
                <td className="py-3 pr-4 font-mono text-brand-300">handleSubmit</td>
                <td className="py-3 pr-4 font-mono text-xs">(onValid?) =&gt; handler</td>
                <td className="py-3 text-gray-400">Enhanced submit handler.</td>
              </tr>
              <tr className="border-b border-gray-800/50">
                <td className="py-3 pr-4 font-mono text-brand-300">formState.isSubmitting</td>
                <td className="py-3 pr-4 font-mono text-xs">boolean</td>
                <td className="py-3 text-gray-400">True while action is running.</td>
              </tr>
              <tr className="border-b border-gray-800/50">
                <td className="py-3 pr-4 font-mono text-brand-300">formState.isPending</td>
                <td className="py-3 pr-4 font-mono text-xs">boolean</td>
                <td className="py-3 text-gray-400">True during transition.</td>
              </tr>
              <tr className="border-b border-gray-800/50">
                <td className="py-3 pr-4 font-mono text-brand-300">formState.isSubmitSuccessful</td>
                <td className="py-3 pr-4 font-mono text-xs">boolean</td>
                <td className="py-3 text-gray-400">True after success.</td>
              </tr>
              <tr className="border-b border-gray-800/50">
                <td className="py-3 pr-4 font-mono text-brand-300">formState.submitErrors</td>
                <td className="py-3 pr-4 font-mono text-xs">FieldErrorRecord | null</td>
                <td className="py-3 text-gray-400">Raw server error record.</td>
              </tr>
              <tr className="border-b border-gray-800/50">
                <td className="py-3 pr-4 font-mono text-brand-300">formState.actionResult</td>
                <td className="py-3 pr-4 font-mono text-xs">TResult | null</td>
                <td className="py-3 text-gray-400">Full result from last action.</td>
              </tr>
              <tr className="border-b border-gray-800/50">
                <td className="py-3 pr-4 font-mono text-brand-300">setSubmitError</td>
                <td className="py-3 pr-4 font-mono text-xs">(field, msg) =&gt; void</td>
                <td className="py-3 text-gray-400">Manually set a server error on a field.</td>
              </tr>
              <tr className="border-b border-gray-800/50">
                <td className="py-3 pr-4 font-mono text-brand-300">persist</td>
                <td className="py-3 pr-4 font-mono text-xs">() =&gt; void</td>
                <td className="py-3 text-gray-400">Manually persist to sessionStorage.</td>
              </tr>
              <tr className="border-b border-gray-800/50">
                <td className="py-3 pr-4 font-mono text-brand-300">clearPersistedData</td>
                <td className="py-3 pr-4 font-mono text-xs">() =&gt; void</td>
                <td className="py-3 text-gray-400">Clear persisted data.</td>
              </tr>
              <tr className="border-b border-gray-800/50">
                <td className="py-3 pr-4 font-mono text-brand-300">formAction</td>
                <td className="py-3 pr-4 font-mono text-xs">(FormData) =&gt; Promise</td>
                <td className="py-3 text-gray-400">
                  Next.js only. Direct form action for{' '}
                  <code>&lt;form action=&#123;…&#125;&gt;</code>.
                </td>
              </tr>
              <tr className="border-b border-gray-800/50">
                <td className="py-3 pr-4 font-mono text-brand-300">optimistic</td>
                <td className="py-3 pr-4 font-mono text-xs">
                  OptimisticState&lt;T&gt; | undefined
                </td>
                <td className="py-3 text-gray-400">
                  Optimistic state with data, isPending, rollback().
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>

      {/* Form component */}
      <section className="mb-16">
        <h2 className="text-2xl font-bold mb-4 text-brand-400">&lt;Form /&gt;</h2>
        <p className="text-gray-400 mb-6">
          Headless wrapper providing RHF FormContext. Works with both adapters.
        </p>

        <div className="code-block mb-6 text-gray-300">
          <pre>{`<Form
  form={formReturn}
  onValid={(data) => console.log(data)}
  className="space-y-4"
>
  <input {...form.register('email')} />
  <button type="submit">Submit</button>
</Form>`}</pre>
        </div>

        <h3 className="text-lg font-semibold mb-3">Props</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="text-gray-400 border-b border-gray-800">
              <tr>
                <th className="py-3 pr-4">Prop</th>
                <th className="py-3 pr-4">Type</th>
                <th className="py-3">Description</th>
              </tr>
            </thead>
            <tbody className="text-gray-300">
              <tr className="border-b border-gray-800/50">
                <td className="py-3 pr-4 font-mono text-brand-300">form</td>
                <td className="py-3 pr-4 font-mono text-xs">
                  UseActionFormReturn | UseActionFormCoreReturn
                </td>
                <td className="py-3 text-gray-400">
                  Return value from useActionForm (any adapter).
                </td>
              </tr>
              <tr className="border-b border-gray-800/50">
                <td className="py-3 pr-4 font-mono text-brand-300">onValid</td>
                <td className="py-3 pr-4 font-mono text-xs">(data) =&gt; void</td>
                <td className="py-3 text-gray-400">Optional callback before action is called.</td>
              </tr>
              <tr className="border-b border-gray-800/50">
                <td className="py-3 pr-4 font-mono text-brand-300">...rest</td>
                <td className="py-3 pr-4 font-mono text-xs">HTMLFormAttributes</td>
                <td className="py-3 text-gray-400">All standard &lt;form&gt; attributes.</td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>

      {/* Utilities */}
      <section className="mb-16">
        <h2 className="text-2xl font-bold mb-4 text-brand-400">Utilities</h2>

        <h3 className="text-lg font-semibold mb-3">Persistence Helpers</h3>
        <div className="code-block mb-4 text-gray-300">
          <pre>{`import {
  loadPersistedValues,
  savePersistedValues,
  clearPersistedValues,
} from 'hookform-action-core'

const data = loadPersistedValues<MyForm>('my-key')
savePersistedValues('my-key', { email: 'a@b.com' })
clearPersistedValues('my-key')`}</pre>
        </div>

        <h3 className="text-lg font-semibold mb-3 mt-8">withZod</h3>
        <p className="text-gray-400 text-sm mb-4">
          Wraps a Server Action with Zod validation. The schema is auto-detected on the client.
        </p>
        <div className="code-block text-gray-300">
          <pre>{`import { withZod } from 'hookform-action-core/with-zod'
// or: import { withZod } from 'hookform-action-core/zod'

const action = withZod(schema, async (data) => {
  // data is fully typed
  return { success: true }
})`}</pre>
        </div>

        <h3 className="text-lg font-semibold mb-3 mt-8">defaultErrorMapper</h3>
        <div className="code-block text-gray-300">
          <pre>{`import { defaultErrorMapper } from 'hookform-action-core'

const customMapper = (result) => {
  const zodErrors = defaultErrorMapper(result)
  if (zodErrors) return zodErrors
  // Handle custom format...
  return null
}`}</pre>
        </div>
      </section>

      {/* Plugin system (internal) */}
      <section className="mb-16">
        <h2 className="text-2xl font-bold mb-4 text-cyan-400">Plugin System (Internal)</h2>
        <p className="text-gray-400 mb-6">
          <span className="text-cyan-400 text-xs font-medium mr-1">v3</span>
          Internal plugin architecture for extending useActionFormCore. Not yet part of the public
          API.
        </p>

        <div className="code-block mb-6 text-gray-300">
          <pre>{`interface ActionFormPlugin<TFieldValues, TResult> {
  name: string
  onBeforeSubmit?: (data) => boolean | Promise<boolean>
  onSuccess?: (result, data) => void
  onError?: (error, data) => void
  onMount?: () => (() => void) | void
}`}</pre>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="text-gray-400 border-b border-gray-800">
              <tr>
                <th className="py-3 pr-4">Lifecycle</th>
                <th className="py-3">When it runs</th>
              </tr>
            </thead>
            <tbody className="text-gray-300">
              <tr className="border-b border-gray-800/50">
                <td className="py-3 pr-4 font-mono text-cyan-300">onBeforeSubmit</td>
                <td className="py-3 text-gray-400">
                  Before submit. Return <code>false</code> to block submission.
                </td>
              </tr>
              <tr className="border-b border-gray-800/50">
                <td className="py-3 pr-4 font-mono text-cyan-300">onSuccess</td>
                <td className="py-3 text-gray-400">
                  After successful submission (no field errors).
                </td>
              </tr>
              <tr className="border-b border-gray-800/50">
                <td className="py-3 pr-4 font-mono text-cyan-300">onError</td>
                <td className="py-3 text-gray-400">After failed submission or thrown error.</td>
              </tr>
              <tr className="border-b border-gray-800/50">
                <td className="py-3 pr-4 font-mono text-cyan-300">onMount</td>
                <td className="py-3 text-gray-400">
                  On mount. Return cleanup function for unmount.
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>

      {/* Packages */}
      <section className="mb-16">
        <h2 className="text-2xl font-bold mb-4 text-brand-400">Packages</h2>
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="text-gray-400 border-b border-gray-800">
              <tr>
                <th className="py-3 pr-4">Package</th>
                <th className="py-3 pr-4">Version</th>
                <th className="py-3">Purpose</th>
              </tr>
            </thead>
            <tbody className="text-gray-300">
              <tr className="border-b border-gray-800/50">
                <td className="py-3 pr-4 font-mono text-brand-300">hookform-action-core</td>
                <td className="py-3 pr-4 font-mono text-xs">3.0.0</td>
                <td className="py-3 text-gray-400">Core + Next.js adapter (backward-compatible)</td>
              </tr>
              <tr className="border-b border-gray-800/50">
                <td className="py-3 pr-4 font-mono text-emerald-300">hookform-action</td>
                <td className="py-3 pr-4 font-mono text-xs">3.0.0</td>
                <td className="py-3 text-gray-400">Standalone Next.js adapter package</td>
              </tr>
              <tr className="border-b border-gray-800/50">
                <td className="py-3 pr-4 font-mono text-emerald-300">hookform-action-standalone</td>
                <td className="py-3 pr-4 font-mono text-xs">3.0.0</td>
                <td className="py-3 text-gray-400">Adapter for Vite, Remix, Astro, SPAs</td>
              </tr>
              <tr className="border-b border-gray-800/50">
                <td className="py-3 pr-4 font-mono text-purple-300">hookform-action-devtools</td>
                <td className="py-3 pr-4 font-mono text-xs">3.0.0</td>
                <td className="py-3 text-gray-400">Floating debug panel (FormDevTool)</td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>

      <footer className="text-center text-gray-600 text-sm py-8 border-t border-gray-800">
        <p>MIT License · Built with ♥ for the React community</p>
      </footer>
    </div>
  )
}
