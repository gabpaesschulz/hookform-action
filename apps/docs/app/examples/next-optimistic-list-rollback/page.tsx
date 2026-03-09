import { ExampleShell } from "../_components/example-shell";
import { OptimisticTodoForm } from "../optimistic/optimistic-todo-form";

export const dynamic = "force-dynamic";

export default function NextOptimisticListRollbackPage() {
  return (
    <ExampleShell
      title="Next Optimistic List Rollback"
      subtitle="Advanced optimistic flow that predicts list updates and rolls back on failure."
      impact="Medio"
      differential="Shows robustness under latency and server errors."
      message="Optimistic UI seguro para mutacoes de lista."
    >
      <div className="bg-gray-900/50 border border-gray-800 rounded-xl p-8 mb-10">
        <OptimisticTodoForm />
      </div>

      <p className="text-sm text-gray-500">
        Tip: submit a todo containing <code className="text-gray-300">fail</code> to trigger rollback.
      </p>
    </ExampleShell>
  );
}

