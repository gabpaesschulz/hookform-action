import { strategicExamples, topAdoptionSlugs } from './catalog'

function ImpactBadge({ impact }: { impact: string }) {
  const color =
    impact === 'Muito alto'
      ? 'text-emerald-300 border-emerald-500/30 bg-emerald-500/10'
      : impact === 'Alto'
        ? 'text-cyan-300 border-cyan-500/30 bg-cyan-500/10'
        : 'text-gray-300 border-gray-700 bg-gray-800/70'
  return <span className={`text-xs border rounded-full px-2 py-0.5 ${color}`}>{impact}</span>
}

export default function ExamplesPage() {
  const topAdoption = strategicExamples.filter((item) => topAdoptionSlugs.has(item.slug))
  const fullCatalog = [...strategicExamples].sort((a, b) => a.order - b.order)

  return (
    <div className="max-w-5xl mx-auto px-6 py-16">
      <div className="mb-8">
        <a href="/" className="text-sm text-gray-500 hover:text-gray-300 transition-colors">
          ← Back to docs
        </a>
      </div>

      <header className="mb-10">
        <div className="inline-flex items-center gap-2 bg-brand-500/10 text-brand-400 border border-brand-500/20 rounded-full px-4 py-1.5 text-sm font-medium mb-4">
          <span>Examples Hub</span>
        </div>
        <h1 className="text-3xl font-bold mb-3">Examples that drive adoption</h1>
        <p className="text-gray-400 max-w-3xl">
          Start with the top adoption examples first. Then use the full catalog for deeper
          migration, adapter parity, optimistic flows, and debugging strategies.
        </p>
      </header>

      <section className="mb-12">
        <h2 className="text-xl font-semibold mb-4 text-emerald-300">Top adoption path</h2>
        <div className="grid sm:grid-cols-2 gap-4">
          {topAdoption.map((item) => (
            <a
              key={item.slug}
              href={`/examples/${item.slug}`}
              className="group block bg-gray-900/50 border border-gray-800 hover:border-emerald-500/40 rounded-xl p-5 transition-colors"
            >
              <div className="flex items-center justify-between gap-3 mb-2">
                <h3 className="font-semibold text-white group-hover:text-emerald-300 transition-colors">
                  {item.title}
                </h3>
                <ImpactBadge impact={item.impact} />
              </div>
              <p className="text-sm text-gray-400 mb-2">{item.differential}</p>
              <p className="text-sm text-gray-300">{item.message}</p>
            </a>
          ))}
        </div>
      </section>

      <section className="mb-10">
        <h2 className="text-xl font-semibold mb-4">Full example catalog</h2>
        <div className="overflow-x-auto border border-gray-800 rounded-xl">
          <table className="w-full text-sm text-left">
            <thead className="text-gray-400 border-b border-gray-800 bg-gray-900/40">
              <tr>
                <th className="py-3 px-4 w-14">#</th>
                <th className="py-3 px-4 min-w-[240px]">Example</th>
                <th className="py-3 px-4 min-w-[120px]">Adapter</th>
                <th className="py-3 px-4 min-w-[110px]">Format</th>
                <th className="py-3 px-4 min-w-[360px]">Differential</th>
              </tr>
            </thead>
            <tbody className="text-gray-300">
              {fullCatalog.map((item) => (
                <tr key={item.slug} className="border-b border-gray-800/60">
                  <td className="py-3 px-4 text-gray-500">{item.order}</td>
                  <td className="py-3 px-4">
                    <a
                      href={`/examples/${item.slug}`}
                      className="text-brand-300 hover:text-brand-200 transition-colors"
                    >
                      {item.title}
                    </a>
                  </td>
                  <td className="py-3 px-4 text-gray-400">{item.adapter}</td>
                  <td className="py-3 px-4 text-gray-400">{item.format}</td>
                  <td className="py-3 px-4 text-gray-400">{item.differential}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section className="border border-gray-800 rounded-xl p-6 bg-gray-900/30">
        <h2 className="text-lg font-semibold mb-2">Need deeper implementation guidance?</h2>
        <p className="text-sm text-gray-400 mb-4">
          Recipes cover concrete production patterns. FAQ and Troubleshooting cover support-heavy
          operational issues.
        </p>
        <div className="flex items-center gap-4 text-sm">
          <a href="/recipes" className="text-brand-400 hover:text-brand-300 transition-colors">
            Recipes →
          </a>
          <a href="/faq" className="text-gray-300 hover:text-white transition-colors">
            FAQ →
          </a>
          <a href="/troubleshooting" className="text-gray-300 hover:text-white transition-colors">
            Troubleshooting →
          </a>
        </div>
      </section>
    </div>
  )
}
