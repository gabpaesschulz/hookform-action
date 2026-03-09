import { ExampleShell } from '../_components/example-shell'

export default function NextOptimisticProfileUpdatePage() {
  return (
    <ExampleShell
      title="Next Optimistic Profile Update"
      subtitle="Single-entity optimistic mutation with automatic rollback on server failure."
      impact="Alto"
      differential="No manual useOptimistic orchestration or rollback bookkeeping."
      message="UX instantanea com rollback seguro em poucas linhas."
    >
      <div className="code-block text-gray-300 mb-8">
        <pre>{`type Profile = { id: string; name: string; title: string };

const form = useActionForm(updateProfileAction, {
  defaultValues: { name: profile.name, title: profile.title },
  optimisticInitial: profile,
  optimisticData: (current: Profile, values) => ({
    ...current,
    ...values,
  }),
});

const view = form.optimistic?.data ?? profile;

return (
  <form onSubmit={form.handleSubmit()}>
    <h2>{view.name}</h2>
    <p>{view.title}</p>
    <input {...form.register("name")} />
    <input {...form.register("title")} />
    <button disabled={form.formState.isPending}>Save</button>
  </form>
);`}</pre>
      </div>

      <p className="text-sm text-gray-500">
        Want a live list scenario? Open{' '}
        <a
          className="text-brand-300 hover:text-brand-200"
          href="/examples/next-optimistic-list-rollback"
        >
          Next Optimistic List Rollback
        </a>
        .
      </p>
    </ExampleShell>
  )
}
