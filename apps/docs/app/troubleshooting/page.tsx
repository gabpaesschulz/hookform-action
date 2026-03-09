type TroubleshootingItem = {
  symptom: string
  likelyCause: string
  quickFix: string
}

const troubleshootingItems: TroubleshootingItem[] = [
  {
    symptom: 'I click submit and nothing happens.',
    likelyCause:
      'handleSubmit is not wired correctly, submit button type is wrong, or client validation blocked execution.',
    quickFix: 'Use onSubmit={handleSubmit()} and inspect formState.errors after click.',
  },
  {
    symptom: 'Action is not called even with valid-looking fields.',
    likelyCause: 'Client-side schema validation failed before the network request.',
    quickFix: 'Check validationMode and verify each field against the schema.',
  },
  {
    symptom: 'Server errors are not shown on inputs.',
    likelyCause: 'Returned error shape does not match default mapper expectations.',
    quickFix: 'Return { errors: Record<string, string[]> } or implement errorMapper.',
  },
  {
    symptom: 'Errors show on the wrong field (nested/array forms).',
    likelyCause: 'Error keys do not match RHF field paths.',
    quickFix: 'Use RHF paths like address.city and items.0.price in server error keys.',
  },
  {
    symptom: 'Submit button enables too early and allows double submits.',
    likelyCause: 'UI is using isSubmitting instead of isPending.',
    quickFix: 'Disable by formState.isPending for end-to-end submit state.',
  },
  {
    symptom: 'Old values keep returning in edit forms.',
    likelyCause: 'persistKey restored an old draft and overrode defaults.',
    quickFix: 'Scope persistKey per entity and clear persisted drafts on load/success.',
  },
  {
    symptom: 'optimistic is undefined or has no effect.',
    likelyCause: 'Incomplete optimistic setup or UI is rendering confirmed data only.',
    quickFix: 'Provide optimisticKey + optimisticData and render optimistic.data while pending.',
  },
  {
    symptom: 'File upload fails or file is empty on server.',
    likelyCause: 'Using JSON flow for file input instead of FormData action handling.',
    quickFix: 'Use a FormData-based action and validate file type/size server-side.',
  },
  {
    symptom: 'onError does not fire when the form is invalid.',
    likelyCause: 'Invalid client form never reaches action execution.',
    quickFix:
      'Use formState.errors for client invalid state; onError handles action failure paths.',
  },
  {
    symptom: 'Standalone flow expects formAction but it does not exist.',
    likelyCause: 'Standalone API signature differs from Next.js adapter.',
    quickFix: 'Use submit in options and trigger with handleSubmit().',
  },
]

const checklist = [
  'Confirm package choice: next adapter vs standalone adapter.',
  'Confirm schema and validationMode match your intended UX.',
  'Confirm action return shape for field errors.',
  'Confirm field names and error keys use identical RHF paths.',
  'Confirm submit buttons are gated by isPending.',
  'Confirm persistKey scope and clear strategy.',
  'Confirm optimistic settings and rendering path.',
  'Confirm file flows use FormData, not JSON.',
]

export default function TroubleshootingPage() {
  return (
    <div className="max-w-5xl mx-auto px-6 py-16">
      <div className="mb-8 flex items-center justify-between gap-4 flex-wrap">
        <a href="/" className="text-sm text-gray-500 hover:text-gray-300 transition-colors">
          ← Back to docs
        </a>
        <div className="flex items-center gap-4 text-sm">
          <a href="/faq" className="text-brand-400 hover:text-brand-300 transition-colors">
            FAQ →
          </a>
          <a href="/recipes" className="text-cyan-400 hover:text-cyan-300 transition-colors">
            Recipes →
          </a>
        </div>
      </div>

      <header className="mb-10">
        <h1 className="text-3xl font-bold mb-3">Troubleshooting</h1>
        <p className="text-gray-400 max-w-3xl">
          Debug common adoption problems by symptom. Each item maps directly to a root cause and a
          minimal correction.
        </p>
      </header>

      <section className="space-y-3 mb-10">
        {troubleshootingItems.map((item) => (
          <div key={item.symptom} className="border border-gray-800 rounded-xl p-5 bg-gray-900/30">
            <h2 className="text-base font-semibold text-white mb-2">{item.symptom}</h2>
            <p className="text-sm text-gray-400 mb-1">
              <span className="text-gray-300 font-medium">Likely cause:</span> {item.likelyCause}
            </p>
            <p className="text-sm text-gray-300">
              <span className="text-cyan-300 font-medium">Quick fix:</span> {item.quickFix}
            </p>
          </div>
        ))}
      </section>

      <section className="border border-gray-800 rounded-xl p-6 bg-gradient-to-br from-cyan-500/10 to-brand-500/10">
        <h2 className="text-lg font-semibold mb-3">60-second checklist</h2>
        <ol className="space-y-2 text-sm text-gray-300">
          {checklist.map((item, index) => (
            <li key={item}>
              <span className="text-gray-500 mr-2">{index + 1}.</span>
              {item}
            </li>
          ))}
        </ol>
      </section>
    </div>
  )
}
