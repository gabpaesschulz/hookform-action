import { ExampleShell } from "../_components/example-shell";

export default function StandaloneRestErrorMapperPage() {
  return (
    <ExampleShell
      title="Standalone REST Error Mapper"
      subtitle="Map arbitrary backend error envelopes to RHF field errors with one option."
      impact="Alto"
      differential="Integrates with legacy API contracts without backend refactors."
      message="Adapte erro legado para RHF sem reescrever a API."
    >
      <div className="code-block text-gray-300 mb-8">
        <pre>{`type ApiError = {
  ok: false;
  errors: Array<{ field: string; message: string }>;
};

const form = useActionForm({
  submit: async (values) => {
    const res = await fetch("/api/users", {
      method: "POST",
      body: JSON.stringify(values),
    });
    return res.json() as Promise<ApiError | { ok: true }>;
  },
  defaultValues: { name: "", email: "" },
  errorMapper: (result) => {
    if (!result || result.ok !== false) return {};
    return Object.fromEntries(result.errors.map((item) => [item.field, [item.message]]));
  },
});`}</pre>
      </div>

      <p className="text-sm text-gray-500">
        Strategic point: this removes one of the most common adoption blockers in enterprise apps.
      </p>
    </ExampleShell>
  );
}

