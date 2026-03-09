import { ExampleShell } from "../_components/example-shell";

export default function CrossAdapterParityPage() {
  return (
    <ExampleShell
      title="Cross Adapter Parity: Next vs Standalone"
      subtitle="Side-by-side comparison to prove portability and reduce migration risk."
      impact="Medio"
      differential="Same API surface, different submit transport."
      message="Mude de adapter com diff pequeno."
    >
      <div className="grid lg:grid-cols-2 gap-5">
        <div>
          <h2 className="text-lg font-semibold mb-3">Next.js Adapter</h2>
          <div className="code-block text-gray-300">
            <pre>{`import { useActionForm } from "hookform-action";

const form = useActionForm(loginAction, {
  defaultValues: { email: "", password: "" },
  validationMode: "onChange",
});`}</pre>
          </div>
        </div>

        <div>
          <h2 className="text-lg font-semibold mb-3">Standalone Adapter</h2>
          <div className="code-block text-gray-300">
            <pre>{`import { useActionForm } from "hookform-action-standalone";

const form = useActionForm({
  submit: async (values) => post("/login", values),
  defaultValues: { email: "", password: "" },
  validationMode: "onChange",
});`}</pre>
          </div>
        </div>
      </div>
    </ExampleShell>
  );
}
