import { ExampleShell } from '../_components/example-shell'
import { ValidationForm } from '../validation/validation-form'

export const dynamic = 'force-dynamic'

export default function NextSchemaOnceSignupPage() {
  return (
    <ExampleShell
      title="Next Schema Once Signup"
      subtitle="Use withZod once and let the hook infer validation + types across client and server."
      impact="Alto"
      differential="Single schema lifecycle with no duplicated contract."
      message="Schema unica, validação em ambos os lados."
    >
      <div className="bg-gray-900/50 border border-gray-800 rounded-xl p-8 mb-10">
        <ValidationForm />
      </div>

      <div className="code-block text-gray-300">
        <pre>{`export const signupAction = withZod(signupSchema, async (data) => {
  // data is inferred from schema
  return await createUser(data);
});

const form = useActionForm(signupAction, {
  defaultValues: { username: "", email: "", password: "" },
  validationMode: "onChange",
});`}</pre>
      </div>
    </ExampleShell>
  )
}
