import { ExampleShell } from '../_components/example-shell'

export default function StandaloneQuickstartLoginPage() {
  return (
    <ExampleShell
      title="Standalone Quickstart Login"
      subtitle="Same mental model as Next adapter, but with an explicit submit function."
      impact="Muito alto"
      differential="Fast proof that hookform-action is not Next-only."
      message="Troque para submit() e mantenha a mesma DX."
    >
      <h2 className="text-xl font-semibold mb-3">Recipe</h2>
      <p className="text-gray-400 mb-6">
        This example is intentionally copy-paste ready for Vite, Remix, Astro, or any React SPA.
      </p>

      <div className="code-block text-gray-300 mb-8">
        <pre>{`import { useActionForm } from "hookform-action-standalone";
import { z } from "zod";

const schema = z.object({
  email: z.string().email("Invalid email"),
  password: z.string().min(8, "Min 8 chars"),
});

export function LoginForm() {
  const form = useActionForm({
    submit: async (values) => {
      const res = await fetch("/api/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(values),
      });
      return res.json();
    },
    schema,
    validationMode: "onChange",
    defaultValues: { email: "", password: "" },
  });

  return (
    <form onSubmit={form.handleSubmit()}>
      <input {...form.register("email")} />
      <input type="password" {...form.register("password")} />
      <button disabled={form.formState.isPending}>Sign In</button>
    </form>
  );
}`}</pre>
      </div>

      <p className="text-sm text-gray-500">
        Strategic point: this removes framework lock-in objections during evaluation.
      </p>
    </ExampleShell>
  )
}
