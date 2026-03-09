import { ExampleShell } from '../_components/example-shell'
import { WizardForm } from '../wizard/wizard-form'

export const dynamic = 'force-dynamic'

export default function NextWizardOnboardingPersistPage() {
  return (
    <ExampleShell
      title="Next Wizard Onboarding Persist"
      subtitle="Multi-step onboarding with persisted progress and step-level validation."
      impact="Alto"
      differential="Built-in persistence and restore behavior for wizard UX."
      message="Usuario retoma o fluxo sem perder dados."
    >
      <div className="bg-gray-900/50 border border-gray-800 rounded-xl p-8 mb-10">
        <WizardForm />
      </div>

      <div className="code-block text-gray-300">
        <pre>{`const form = useActionForm(wizardAction, {
  defaultValues: {
    firstName: "",
    lastName: "",
    email: "",
    company: "",
    role: "",
    plan: "",
    agreeToTerms: "",
  },
  persistKey: "wizard-onboarding",
  persistDebounce: 200,
});`}</pre>
      </div>
    </ExampleShell>
  )
}
