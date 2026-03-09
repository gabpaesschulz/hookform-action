type FaqItem = {
  question: string
  answer: string
  category:
    | 'Setup'
    | 'Validation'
    | 'Errors'
    | 'State'
    | 'Persistence'
    | 'Optimistic'
    | 'Standalone'
}

const faqItems: FaqItem[] = [
  {
    question: 'Which package should I install: hookform-action, standalone, or core?',
    answer:
      'Use hookform-action for Next.js Server Actions. Use hookform-action-standalone for Vite/Remix/Astro/SPA apps. Use core only for custom adapters.',
    category: 'Setup',
  },
  {
    question: 'Is withZod required?',
    answer:
      'No. It is optional but recommended. It gives typed server validation, a standard error shape, and schema auto-detection in useActionForm.',
    category: 'Validation',
  },
  {
    question: 'If I already use withZod, do I still need schema in useActionForm?',
    answer:
      'Usually no. The schema is auto-detected. Pass schema only when you want to override behavior explicitly.',
    category: 'Validation',
  },
  {
    question: 'What is the default error contract?',
    answer:
      'Return errors as { errors: Record<string, string[]> } so field mapping works out of the box.',
    category: 'Errors',
  },
  {
    question: 'What is the difference between mode and validationMode?',
    answer:
      'mode is the native React Hook Form validation strategy. validationMode controls when hookform-action runs client-side schema validation.',
    category: 'Validation',
  },
  {
    question: 'Should submit buttons use isPending or isSubmitting?',
    answer:
      'Prefer isPending for UI state during the full server round-trip. isSubmitting can be narrower depending on the flow.',
    category: 'State',
  },
  {
    question: 'What is the difference between formState.errors and formState.submitErrors?',
    answer:
      'errors is RHF-ready data for rendering. submitErrors is the raw error record returned by your action.',
    category: 'Errors',
  },
  {
    question: 'Why are old values restored when the form mounts?',
    answer:
      'If persistKey is set, persisted data takes precedence over defaultValues. Use scoped keys and clear persisted drafts when needed.',
    category: 'Persistence',
  },
  {
    question: 'When is persisted state cleared automatically?',
    answer:
      'Persisted data is cleared on successful submission. Failed submissions keep the draft for recovery.',
    category: 'Persistence',
  },
  {
    question: 'Why is optimistic undefined?',
    answer:
      'You need optimisticKey and optimisticData. optimisticInitial is recommended for predictable first render behavior.',
    category: 'Optimistic',
  },
  {
    question: 'Does optimistic rollback happen automatically?',
    answer:
      'Yes. Rollback runs on mapped action errors and thrown exceptions. Manual rollback() is also available.',
    category: 'Optimistic',
  },
  {
    question: 'Does standalone provide formAction too?',
    answer:
      'No. In standalone mode, you pass submit and call handleSubmit(). formAction is Next.js adapter specific.',
    category: 'Standalone',
  },
]

export default function FaqPage() {
  return (
    <div className="max-w-5xl mx-auto px-6 py-16">
      <div className="mb-8 flex items-center justify-between gap-4 flex-wrap">
        <a href="/" className="text-sm text-gray-500 hover:text-gray-300 transition-colors">
          ← Back to docs
        </a>
        <div className="flex items-center gap-4 text-sm">
          <a
            href="/troubleshooting"
            className="text-cyan-400 hover:text-cyan-300 transition-colors"
          >
            Troubleshooting →
          </a>
          <a href="/recipes" className="text-brand-400 hover:text-brand-300 transition-colors">
            Recipes →
          </a>
        </div>
      </div>

      <header className="mb-10">
        <h1 className="text-3xl font-bold mb-3">FAQ</h1>
        <p className="text-gray-400 max-w-3xl">
          Short answers for the most frequent adoption questions. If your issue is symptom-based, go
          straight to Troubleshooting.
        </p>
      </header>

      <section className="space-y-3 mb-10">
        {faqItems.map((item) => (
          <div key={item.question} className="border border-gray-800 rounded-xl p-5 bg-gray-900/30">
            <div className="flex items-center justify-between gap-3 mb-2">
              <h2 className="text-base font-semibold text-white">{item.question}</h2>
              <span className="text-xs text-gray-400 border border-gray-700 rounded-full px-2 py-0.5">
                {item.category}
              </span>
            </div>
            <p className="text-sm text-gray-400">{item.answer}</p>
          </div>
        ))}
      </section>

      <section className="border border-gray-800 rounded-xl p-6 bg-gradient-to-br from-brand-500/10 to-cyan-500/10">
        <h2 className="text-lg font-semibold mb-2">Still blocked?</h2>
        <p className="text-sm text-gray-300 mb-4">
          Use the troubleshooting checklist to debug by symptom: submit not firing, field errors not
          showing, stale persisted values, optimistic rollback issues, and upload edge cases.
        </p>
        <a
          href="/troubleshooting"
          className="text-cyan-300 hover:text-cyan-200 transition-colors text-sm"
        >
          Open Troubleshooting →
        </a>
      </section>
    </div>
  )
}
