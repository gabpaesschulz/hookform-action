import { ExampleShell } from '../_components/example-shell'

export default function MigrationManualToHookformActionPage() {
  return (
    <ExampleShell
      title="Migration: Manual Wiring -> hookform-action"
      subtitle="Before/after comparison that makes DX gains obvious for maintainers."
      impact="Muito alto"
      differential="Concrete reduction in boilerplate and failure points."
      message="Less glue code is the easiest adoption argument."
    >
      <div className="grid lg:grid-cols-2 gap-5">
        <div>
          <h2 className="text-lg font-semibold mb-3 text-red-300">Before (manual wiring)</h2>
          <div className="code-block text-gray-300">
            <pre>{`const form = useForm<LoginValues>();
const [isPending, startTransition] = useTransition();

const onSubmit = form.handleSubmit(async (values) => {
  const parsed = schema.safeParse(values);
  if (!parsed.success) {
    mapZodToSetError(parsed.error.flatten().fieldErrors, form.setError);
    return;
  }

  startTransition(async () => {
    const result = await loginAction(parsed.data);
    mapApiErrorsToSetError(result, form.setError);
  });
});`}</pre>
          </div>
        </div>

        <div>
          <h2 className="text-lg font-semibold mb-3 text-emerald-300">After (hookform-action)</h2>
          <div className="code-block text-gray-300">
            <pre>{`const form = useActionForm(loginAction, {
  defaultValues: { email: "", password: "" },
  validationMode: "onChange",
});

return (
  <form onSubmit={form.handleSubmit()}>
    <input {...form.register("email")} />
    <input type="password" {...form.register("password")} />
    <button disabled={form.formState.isPending}>Sign In</button>
  </form>
);`}</pre>
          </div>
        </div>
      </div>
    </ExampleShell>
  )
}
