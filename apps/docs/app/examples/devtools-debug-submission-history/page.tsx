import { ExampleShell } from "../_components/example-shell";

export default function DevtoolsDebugSubmissionHistoryPage() {
  return (
    <ExampleShell
      title="Devtools Debug Submission History"
      subtitle="Instrument forms in development with a floating panel for state + history."
      impact="Medio"
      differential="Faster diagnosis of validation and async submission regressions."
      message="Debug guiado por dados, nao por tentativa e erro."
    >
      <div className="code-block text-gray-300 mb-8">
        <pre>{`import { useActionForm } from "hookform-action";
import { FormDevTool } from "hookform-action-devtools";

function App() {
  const form = useActionForm(loginAction, {
    defaultValues: { email: "", password: "" },
  });

  return (
    <>
      <form onSubmit={form.handleSubmit()}>
        <input {...form.register("email")} />
        <input type="password" {...form.register("password")} />
      </form>
      {process.env.NODE_ENV === "development" && (
        <FormDevTool control={form.control} defaultOpen />
      )}
    </>
  );
}`}</pre>
      </div>

      <p className="text-sm text-gray-500">
        Strategic point: teams adopt faster when debugging behavior is visible and repeatable.
      </p>
    </ExampleShell>
  );
}

