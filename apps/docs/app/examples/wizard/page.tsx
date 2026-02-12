import { WizardForm } from "./wizard-form";

export default function WizardExamplePage() {
  return (
    <div className="max-w-2xl mx-auto px-6 py-16">
      <div className="mb-8">
        <a href="/" className="text-sm text-gray-500 hover:text-gray-300 transition-colors">
          ← Back to docs
        </a>
      </div>

      <h1 className="text-3xl font-bold mb-2">Multi-Step Wizard Example</h1>
      <p className="text-gray-400 mb-8">
        A 3-step onboarding wizard with <code className="text-brand-400">persistKey</code> enabled — form state is saved
        to sessionStorage automatically with debounce. Refresh the page to see persistence in action.
      </p>

      <div className="bg-gray-900/50 border border-gray-800 rounded-xl p-8">
        <WizardForm />
      </div>

      <div className="mt-10">
        <h2 className="text-xl font-semibold mb-4">How It Works</h2>
        <div className="prose prose-invert prose-sm max-w-none">
          <ul className="space-y-2 text-gray-400">
            <li>
              <strong className="text-gray-200">Persistence:</strong> Pass{" "}
              <code>persistKey: &apos;wizard-onboarding&apos;</code> to enable automatic sessionStorage persistence with
              200ms debounce.
            </li>
            <li>
              <strong className="text-gray-200">Step validation:</strong> Uses RHF&apos;s <code>trigger()</code> to
              validate only the current step&apos;s fields before advancing.
            </li>
            <li>
              <strong className="text-gray-200">Auto-clear:</strong> On successful submission, persisted data is
              automatically removed from sessionStorage.
            </li>
            <li>
              <strong className="text-gray-200">SSR-safe:</strong> The persistence layer checks for <code>window</code>{" "}
              availability before accessing sessionStorage.
            </li>
          </ul>
        </div>

        <h3 className="text-sm font-medium text-gray-400 mt-8 mb-2">Key Code</h3>
        <div className="code-block text-gray-300">
          <pre>{`const {
  register,
  handleSubmit,
  formState: { errors, isSubmitting },
  trigger,
} = useActionForm(wizardAction, {
  defaultValues: {
    firstName: '', lastName: '', email: '',
    company: '', role: '',
    plan: '', agreeToTerms: '',
  },
  persistKey: 'wizard-onboarding',  // ← enables persistence
  persistDebounce: 200,              // ← 200ms debounce
})

// Validate current step before advancing
const nextStep = async () => {
  const fields = fieldsPerStep[currentStep]
  const valid = await trigger(fields)
  if (valid) setStep(s => s + 1)
}`}</pre>
        </div>
      </div>
    </div>
  );
}
