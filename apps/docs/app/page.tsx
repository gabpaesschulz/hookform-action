const comparisonRows = [
  {
    concern: 'Type safety from schema to submit handler',
    manual: 'Manual casting and duplicated generic types',
    withHookformAction: 'Inference from withZod schema to useActionForm',
  },
  {
    concern: 'Server validation errors to RHF fields',
    manual: 'Parse fieldErrors and loop setError() per field',
    withHookformAction: 'Automatic mapping through default error mapper',
  },
  {
    concern: 'Pending submit state',
    manual: 'Wire useTransition separately from RHF formState',
    withHookformAction: 'formState.isPending available in the hook result',
  },
  {
    concern: 'Optimistic UI with rollback',
    manual: 'Build custom useOptimistic wiring per form',
    withHookformAction: 'Enable optimisticData and optimisticKey options',
  },
  {
    concern: 'Multi-step persistence',
    manual: 'Custom sessionStorage effects and debounce logic',
    withHookformAction: 'Built-in persistKey and persistDebounce options',
  },
  {
    concern: 'Cross-framework submit flow',
    manual: 'Rewrite integration for each stack',
    withHookformAction: 'Same API in Next.js and standalone adapters',
  },
] as const

const featureClusters = [
  {
    title: 'Integration Layer',
    label: 'RHF + server submit flow',
    points: [
      'Single hook for React Hook Form and server submit handlers',
      'Schema-driven types from withZod into client usage',
      'Automatic data and error shape handling for common server responses',
    ],
  },
  {
    title: 'State And UX',
    label: 'Fast forms without custom plumbing',
    points: [
      'Pending state aligned with concurrent React submit flow',
      'Optimistic updates with rollback support',
      'Session persistence for multi-step and long forms',
    ],
  },
  {
    title: 'Extensibility',
    label: 'Fits existing architecture',
    points: [
      'Next.js adapter and standalone adapter with matching API',
      'Lifecycle callbacks for success and error integrations',
      'DevTools package for live form and submission inspection',
    ],
  },
  {
    title: 'Production Readiness',
    label: 'Built for real projects',
    points: [
      'ESM + CJS outputs and tree-shakeable package structure',
      'MIT licensed monorepo with separate package changelogs',
      'Automated test coverage in core and standalone adapters',
    ],
  },
] as const

const examples = [
  {
    title: 'Login With Server Errors',
    stack: 'Next.js Server Actions',
    level: 'Beginner',
    description: 'Typed login form with field-level server validation and pending button state.',
    href: '/examples/login',
    cta: 'Open login example',
  },
  {
    title: 'Optimistic Todo Submit',
    stack: 'Next.js + optimistic UI',
    level: 'Common',
    description: 'Immediate UI updates during submit, with rollback behavior when server fails.',
    href: '/examples/optimistic',
    cta: 'Open optimistic example',
  },
  {
    title: 'Multi-Step Wizard',
    stack: 'Next.js + persistence',
    level: 'Advanced',
    description: 'Persist form progress across reloads and steps with a shared persist key.',
    href: '/examples/wizard',
    cta: 'Open wizard example',
  },
  {
    title: 'Standalone Submit Flow',
    stack: 'Vite / Remix / Astro',
    level: 'Common',
    description: 'Same API using submit functions with fetch, axios, or RPC endpoints.',
    href: '/recipes/standalone-fetch',
    cta: 'Open standalone recipe',
  },
] as const

const trustSignals = [
  { title: 'Versioned Packages', detail: 'v4.0.x adapters and core published independently.' },
  { title: 'MIT License', detail: 'Open source license with permissive commercial usage.' },
  { title: 'Automated Tests', detail: 'Core and standalone packages include Vitest test suites.' },
  { title: 'CI In GitHub Actions', detail: 'Repository checks run in public workflow pipelines.' },
  { title: 'Changelogs', detail: 'Each package has explicit release notes and history.' },
  { title: 'SemVer Workflow', detail: 'Changesets + release process managed in monorepo scripts.' },
] as const

const faqItems = [
  {
    question: 'Is this too much abstraction over React Hook Form?',
    answer:
      'No. You still use RHF primitives directly. The library removes repeated glue code between RHF, server submit handlers, and schema validation.',
  },
  {
    question: 'Should I use it for small forms?',
    answer:
      'If your form never hits a server, native RHF is often enough. The value appears when multiple forms share server submit and validation flows.',
  },
  {
    question: 'Can I use it outside Next.js?',
    answer:
      'Yes. Use hookform-action-standalone for Vite, Remix, Astro, or any React app with async submit functions.',
  },
  {
    question: 'Do I need Zod?',
    answer:
      'Zod is optional, but recommended. withZod unlocks end-to-end type inference and automatic error mapping without duplicated schema setup.',
  },
] as const

export default function HomePage() {
  return (
    <div className="max-w-6xl mx-auto px-6 py-16 sm:py-20">
      <section className="relative mb-14 overflow-hidden rounded-3xl border border-gray-800 bg-gray-900/60 px-6 py-12 sm:px-10 sm:py-16">
        <div className="pointer-events-none absolute -top-28 -left-16 h-72 w-72 rounded-full bg-brand-600/20 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-24 right-0 h-64 w-64 rounded-full bg-cyan-500/20 blur-3xl" />
        <div className="relative">
          <div className="inline-flex items-center gap-2 rounded-full border border-brand-400/30 bg-brand-500/10 px-4 py-1.5 text-sm font-medium text-brand-300">
            <span>v4.0.x</span>
            <span className="text-gray-600">|</span>
            <span>Docs Home</span>
          </div>
          <h1 className="mt-6 text-4xl font-extrabold tracking-tight text-white sm:text-6xl">
            React Hook Form + server submit flows, without boilerplate.
          </h1>
          <p className="mt-5 max-w-3xl text-base leading-relaxed text-gray-300 sm:text-lg">
            Connect React Hook Form to Server Actions or submit functions with end-to-end types, Zod
            mapping, optimistic UI, and persistence for multi-step flows.
          </p>
          <p className="mt-3 text-sm text-gray-500">
            Pick your adapter. Keep one API. Ship production forms faster.
          </p>
          <div className="mt-8 flex flex-wrap items-center gap-3">
            <a
              href="/examples/login"
              className="inline-flex items-center rounded-lg bg-brand-600 px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-brand-500"
            >
              Build your first form in 2 minutes
            </a>
            <a
              href="/standalone"
              className="inline-flex items-center rounded-lg border border-emerald-600/60 px-5 py-2.5 text-sm font-semibold text-emerald-300 transition-colors hover:border-emerald-400"
            >
              Open Standalone Quick Start
            </a>
            <a
              href="/api-reference"
              className="inline-flex items-center rounded-lg border border-gray-700 px-5 py-2.5 text-sm font-semibold text-gray-200 transition-colors hover:border-gray-500"
            >
              Read full API
            </a>
          </div>
          <div className="mt-8 flex flex-wrap items-center gap-2 text-xs text-gray-400">
            <span className="rounded-full border border-gray-700 px-2.5 py-1">
              Next.js Server Actions
            </span>
            <span className="rounded-full border border-gray-700 px-2.5 py-1">Vite</span>
            <span className="rounded-full border border-gray-700 px-2.5 py-1">Remix</span>
            <span className="rounded-full border border-gray-700 px-2.5 py-1">Astro</span>
          </div>
        </div>
      </section>

      <section className="mb-20 rounded-2xl border border-gray-800 bg-gray-900/40 p-6 sm:p-8">
        <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
          <div>
            <h2 className="text-2xl font-bold text-white sm:text-3xl">Quick Start In 3 Steps</h2>
            <p className="mt-2 text-sm text-gray-400">
              From install to first submit in around two minutes.
            </p>
          </div>
          <div className="text-xs text-gray-500">
            New here? Start with{' '}
            <a href="/examples/login" className="text-brand-400 hover:text-brand-300">
              login example
            </a>
            .
          </div>
        </div>
        <div className="grid gap-4 lg:grid-cols-3">
          <div className="rounded-xl border border-gray-800 bg-gray-950/50 p-4">
            <p className="text-xs font-semibold uppercase tracking-widest text-brand-300">Step 1</p>
            <h3 className="mt-2 text-base font-semibold text-white">
              Install the adapter for your stack
            </h3>
            <div className="mt-3 space-y-2 text-xs">
              <div className="rounded-lg border border-gray-800 bg-gray-900 px-3 py-2 text-green-300">
                npm install hookform-action react-hook-form zod
              </div>
              <div className="rounded-lg border border-gray-800 bg-gray-900 px-3 py-2 text-green-300">
                npm install hookform-action-standalone react-hook-form zod
              </div>
            </div>
          </div>
          <div className="rounded-xl border border-gray-800 bg-gray-950/50 p-4">
            <p className="text-xs font-semibold uppercase tracking-widest text-brand-300">Step 2</p>
            <h3 className="mt-2 text-base font-semibold text-white">
              Wrap server logic with withZod
            </h3>
            <div className="code-block mt-3 text-xs leading-relaxed text-gray-300">
              <pre>{`export const action = withZod(schema, async (data) => {
  return { success: true };
});`}</pre>
            </div>
          </div>
          <div className="rounded-xl border border-gray-800 bg-gray-950/50 p-4">
            <p className="text-xs font-semibold uppercase tracking-widest text-brand-300">Step 3</p>
            <h3 className="mt-2 text-base font-semibold text-white">
              Call useActionForm and submit
            </h3>
            <div className="code-block mt-3 text-xs leading-relaxed text-gray-300">
              <pre>{`const form = useActionForm(action, {
  validationMode: 'onChange',
});
<form onSubmit={form.handleSubmit()} />`}</pre>
            </div>
          </div>
        </div>
      </section>

      <section className="mb-20" id="comparison">
        <h2 className="text-2xl font-bold text-white sm:text-3xl">
          Manual Wiring vs hookform-action
        </h2>
        <p className="mt-2 max-w-3xl text-sm text-gray-400">
          Same primitives, less glue code. You keep RHF and Zod control, but remove repeated
          submit-flow plumbing.
        </p>
        <div className="mt-6 overflow-x-auto rounded-2xl border border-gray-800 bg-gray-900/40">
          <table className="w-full min-w-[760px] text-left text-sm">
            <thead>
              <tr className="border-b border-gray-800 text-gray-400">
                <th className="px-4 py-3 font-semibold">Concern</th>
                <th className="px-4 py-3 font-semibold text-red-300">Manual</th>
                <th className="px-4 py-3 font-semibold text-brand-300">hookform-action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-800/70 text-gray-300">
              {comparisonRows.map((row) => (
                <tr key={row.concern}>
                  <td className="px-4 py-3.5 font-medium">{row.concern}</td>
                  <td className="px-4 py-3.5 text-gray-400">{row.manual}</td>
                  <td className="px-4 py-3.5">{row.withHookformAction}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="mt-6 grid gap-4 lg:grid-cols-2">
          <div className="rounded-xl border border-red-700/40 bg-red-950/10 p-5">
            <p className="text-xs font-semibold uppercase tracking-widest text-red-300">
              Before (manual)
            </p>
            <div className="code-block mt-3 text-xs leading-relaxed text-gray-300">
              <pre>{`const result = await action(values);
if (result.errors) {
  for (const [field, messages] of Object.entries(result.errors)) {
    setError(field as keyof Fields, { message: messages[0] });
  }
}`}</pre>
            </div>
          </div>
          <div className="rounded-xl border border-brand-700/40 bg-brand-950/10 p-5">
            <p className="text-xs font-semibold uppercase tracking-widest text-brand-300">
              After (hookform-action)
            </p>
            <div className="code-block mt-3 text-xs leading-relaxed text-gray-300">
              <pre>{`const { handleSubmit, formState: { errors, isPending } } =
  useActionForm(action, { validationMode: 'onChange' });

<form onSubmit={handleSubmit()} />;`}</pre>
            </div>
          </div>
        </div>

        <div className="mt-4 grid gap-3 sm:grid-cols-3">
          <div className="rounded-xl border border-gray-800 bg-gray-900/40 p-4 text-center">
            <p className="text-2xl font-bold text-brand-300">-1 layer</p>
            <p className="mt-1 text-xs text-gray-500">single integration API for submit flows</p>
          </div>
          <div className="rounded-xl border border-gray-800 bg-gray-900/40 p-4 text-center">
            <p className="text-2xl font-bold text-brand-300">+1 schema</p>
            <p className="mt-1 text-xs text-gray-500">server and client stay aligned</p>
          </div>
          <div className="rounded-xl border border-gray-800 bg-gray-900/40 p-4 text-center">
            <p className="text-2xl font-bold text-brand-300">-N bugs</p>
            <p className="mt-1 text-xs text-gray-500">less custom wiring to maintain per form</p>
          </div>
        </div>
      </section>

      <section className="mb-20" id="features">
        <h2 className="text-2xl font-bold text-white sm:text-3xl">Feature Clusters</h2>
        <p className="mt-2 max-w-3xl text-sm text-gray-400">
          Built on top of RHF. No lock-in, only less repetition.
        </p>
        <div className="mt-6 grid gap-4 md:grid-cols-2">
          {featureClusters.map((cluster) => (
            <article
              key={cluster.title}
              className="rounded-2xl border border-gray-800 bg-gray-900/40 p-6"
            >
              <p className="text-xs font-semibold uppercase tracking-widest text-brand-300">
                {cluster.label}
              </p>
              <h3 className="mt-2 text-lg font-semibold text-white">{cluster.title}</h3>
              <ul className="mt-4 space-y-2 text-sm text-gray-300">
                {cluster.points.map((point) => (
                  <li key={point} className="flex items-start gap-2">
                    <span className="mt-1 text-brand-300">•</span>
                    <span>{point}</span>
                  </li>
                ))}
              </ul>
            </article>
          ))}
        </div>
      </section>

      <section className="mb-20" id="examples">
        <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
          <div>
            <h2 className="text-2xl font-bold text-white sm:text-3xl">Examples You Can Copy</h2>
            <p className="mt-2 max-w-2xl text-sm text-gray-400">
              Use these as your onboarding path: beginner to advanced submit flows.
            </p>
          </div>
          <a href="/recipes" className="text-sm font-semibold text-brand-400 hover:text-brand-300">
            Browse all recipes
          </a>
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          {examples.map((example) => (
            <article
              key={example.title}
              className="rounded-2xl border border-gray-800 bg-gray-900/40 p-5"
            >
              <div className="flex flex-wrap items-center gap-2 text-xs">
                <span className="rounded-full border border-gray-700 px-2.5 py-1 text-gray-300">
                  {example.stack}
                </span>
                <span className="rounded-full border border-brand-600/40 px-2.5 py-1 text-brand-300">
                  {example.level}
                </span>
              </div>
              <h3 className="mt-3 text-lg font-semibold text-white">{example.title}</h3>
              <p className="mt-2 text-sm text-gray-400">{example.description}</p>
              <a
                href={example.href}
                className="mt-4 inline-flex items-center text-sm font-semibold text-emerald-300 hover:text-emerald-200"
              >
                {example.cta} →
              </a>
            </article>
          ))}
        </div>
      </section>

      <section className="mb-20 grid gap-4 lg:grid-cols-2" id="model">
        <article className="rounded-2xl border border-gray-800 bg-gray-900/40 p-6">
          <h2 className="text-2xl font-bold text-white">Mental Model</h2>
          <p className="mt-2 text-sm text-gray-400">One schema, one action, one form hook.</p>
          <ol className="mt-5 space-y-3 text-sm text-gray-300">
            <li>
              1. Define schema and server handler with <code>withZod</code>.
            </li>
            <li>
              2. Pass action (or submit function) into <code>useActionForm</code>.
            </li>
            <li>
              3. Render standard RHF fields and call <code>handleSubmit()</code>.
            </li>
            <li>
              4. Let the hook manage pending, error mapping, optimistic state, and persistence.
            </li>
          </ol>
        </article>
        <article className="rounded-2xl border border-gray-800 bg-gray-900/40 p-6">
          <h3 className="text-lg font-semibold text-white">Architecture</h3>
          <div className="code-block mt-4 text-xs leading-relaxed text-gray-300">
            <pre>{`withZod(schema, handler)
          |
          v
   useActionFormCore
      /        \\
     v          v
hookform-action   hookform-action-standalone
      \\          /
       v        v
   hookform-action-devtools`}</pre>
          </div>
        </article>
      </section>

      <section className="mb-20 grid gap-4 lg:grid-cols-2" id="compatibility">
        <article className="rounded-2xl border border-gray-800 bg-gray-900/40 p-6">
          <h2 className="text-2xl font-bold text-white">Compatibility</h2>
          <div className="mt-4 overflow-x-auto">
            <table className="w-full min-w-[380px] text-left text-sm">
              <thead>
                <tr className="border-b border-gray-800 text-gray-400">
                  <th className="py-2 pr-4">Dependency</th>
                  <th className="py-2 pr-4">Minimum</th>
                  <th className="py-2">Notes</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-800/70 text-gray-300">
                <tr>
                  <td className="py-2 pr-4">React</td>
                  <td className="py-2 pr-4">18.0+</td>
                  <td className="py-2">React 19 recommended for native useOptimistic behavior.</td>
                </tr>
                <tr>
                  <td className="py-2 pr-4">React Hook Form</td>
                  <td className="py-2 pr-4">7.50+</td>
                  <td className="py-2">Required peer dependency.</td>
                </tr>
                <tr>
                  <td className="py-2 pr-4">Zod</td>
                  <td className="py-2 pr-4">3.22+</td>
                  <td className="py-2">
                    Optional, recommended for withZod and typed validation flow.
                  </td>
                </tr>
                <tr>
                  <td className="py-2 pr-4">Next.js</td>
                  <td className="py-2 pr-4">14.0+</td>
                  <td className="py-2">Only required for the Next.js adapter package.</td>
                </tr>
              </tbody>
            </table>
          </div>
        </article>
        <article className="rounded-2xl border border-gray-800 bg-gray-900/40 p-6">
          <h3 className="text-lg font-semibold text-white">Upgrade Notes</h3>
          <p className="mt-3 text-sm text-gray-300">
            Current package line is <code>4.0.x</code>. Before upgrading, check package changelogs
            to confirm API notes and migration details for your adapter.
          </p>
          <div className="mt-5 space-y-2 text-sm">
            <a
              href="https://github.com/gabpaesschulz/hookform-action/blob/main/packages/next/CHANGELOG.md"
              target="_blank"
              rel="noreferrer noopener"
              className="block text-brand-400 hover:text-brand-300"
            >
              Open Next.js adapter changelog →
            </a>
            <a
              href="https://github.com/gabpaesschulz/hookform-action/blob/main/packages/standalone/CHANGELOG.md"
              target="_blank"
              rel="noreferrer noopener"
              className="block text-brand-400 hover:text-brand-300"
            >
              Open standalone adapter changelog →
            </a>
            <a href="/api-reference" className="block text-brand-400 hover:text-brand-300">
              Open API reference →
            </a>
          </div>
        </article>
      </section>

      <section className="mb-20" id="trust">
        <h2 className="text-2xl font-bold text-white sm:text-3xl">Maturity And Trust Signals</h2>
        <p className="mt-2 max-w-3xl text-sm text-gray-400">
          Production-focused signals to reduce adoption risk.
        </p>
        <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {trustSignals.map((item) => (
            <article
              key={item.title}
              className="rounded-xl border border-gray-800 bg-gray-900/40 p-5"
            >
              <h3 className="text-sm font-semibold text-white">{item.title}</h3>
              <p className="mt-2 text-sm text-gray-400">{item.detail}</p>
            </article>
          ))}
        </div>
        <div className="mt-6 flex flex-wrap items-center gap-3 text-sm">
          <a
            href="https://github.com/gabpaesschulz/hookform-action/actions"
            target="_blank"
            rel="noreferrer noopener"
            className="inline-flex items-center rounded-lg border border-gray-700 px-4 py-2 text-gray-300 transition-colors hover:border-gray-500"
          >
            View CI pipeline
          </a>
          <a
            href="https://github.com/gabpaesschulz/hookform-action"
            target="_blank"
            rel="noreferrer noopener"
            className="inline-flex items-center rounded-lg border border-gray-700 px-4 py-2 text-gray-300 transition-colors hover:border-gray-500"
          >
            View repository
          </a>
        </div>
      </section>

      <section className="mb-20" id="faq">
        <h2 className="text-2xl font-bold text-white sm:text-3xl">FAQ</h2>
        <div className="mt-6 space-y-3">
          {faqItems.map((item) => (
            <details
              key={item.question}
              className="rounded-xl border border-gray-800 bg-gray-900/40 p-5"
            >
              <summary className="cursor-pointer text-sm font-semibold text-white">
                {item.question}
              </summary>
              <p className="mt-3 text-sm leading-relaxed text-gray-400">{item.answer}</p>
            </details>
          ))}
        </div>
      </section>

      <section className="rounded-2xl border border-brand-700/40 bg-brand-950/20 p-6 sm:p-8">
        <h2 className="text-2xl font-bold text-white sm:text-3xl">
          Install And Ship Your First Form Today
        </h2>
        <p className="mt-2 max-w-3xl text-sm text-gray-300">
          Start with the adapter that matches your stack and move from setup to running form
          quickly.
        </p>
        <div className="mt-5 grid gap-3 md:grid-cols-2">
          <div className="rounded-lg border border-gray-800 bg-gray-950/70 px-3 py-2 text-xs text-green-300">
            npm install hookform-action react-hook-form zod
          </div>
          <div className="rounded-lg border border-gray-800 bg-gray-950/70 px-3 py-2 text-xs text-green-300">
            npm install hookform-action-standalone react-hook-form zod
          </div>
        </div>
        <div className="mt-6 flex flex-wrap gap-3">
          <a
            href="/examples/login"
            className="inline-flex items-center rounded-lg bg-brand-600 px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-brand-500"
          >
            Open quick start example
          </a>
          <a
            href="/api-reference"
            className="inline-flex items-center rounded-lg border border-gray-700 px-5 py-2.5 text-sm font-semibold text-gray-200 transition-colors hover:border-gray-500"
          >
            Read API reference
          </a>
        </div>
      </section>
    </div>
  )
}
