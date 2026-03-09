import { ExampleShell } from '../_components/example-shell'
import { LoginForm } from '../login/login-form'

export const dynamic = 'force-dynamic'

export default function NextQuickstartLoginPage() {
  return (
    <ExampleShell
      title="Next Quickstart Login"
      subtitle="RHF + Server Action + automatic error mapping in a single flow."
      impact="Muito alto"
      differential="First-value path for Next.js users."
      message="Conecte RHF ao servidor sem boilerplate manual."
    >
      <div className="bg-gray-900/50 border border-gray-800 rounded-xl p-8 mb-10">
        <LoginForm />
      </div>

      <h2 className="text-xl font-semibold mb-3">Why this sells the library</h2>
      <p className="text-gray-400 mb-6">
        This is the shortest path from install to success. It proves pending state, server
        validation, and field-level error mapping in one place.
      </p>

      <div className="code-block text-gray-300">
        <pre>{`const form = useActionForm(loginAction, {
  defaultValues: { email: "", password: "" },
});

<form onSubmit={form.handleSubmit()}>
  <input {...form.register("email")} />
  <input {...form.register("password")} type="password" />
  <button disabled={form.formState.isSubmitting}>Sign In</button>
</form>`}</pre>
      </div>
    </ExampleShell>
  )
}
