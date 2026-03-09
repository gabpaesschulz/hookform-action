export default function RecipesPage() {
  return (
    <div className="max-w-4xl mx-auto px-6 py-16">
      <div className="mb-8">
        <a href="/" className="text-sm text-gray-500 hover:text-gray-300 transition-colors">
          ← Back to docs
        </a>
      </div>

      <div className="mb-14">
        <div className="inline-flex items-center gap-2 bg-brand-500/10 text-brand-400 border border-brand-500/20 rounded-full px-4 py-1.5 text-sm font-medium mb-6">
          Recipes
        </div>
        <h1 className="text-3xl font-bold mb-4">Recipes &amp; Common Patterns</h1>
        <p className="text-lg text-gray-400 max-w-2xl">
          Complete, copy-paste patterns for the most common <code>hookform-action</code> use cases. Each recipe includes
          a working server action, a typed client component, key concepts, and pitfalls to avoid.
        </p>
      </div>

      {/* ── Tier 1: Must-have ──────────────────────────────────── */}
      <section className="mb-14">
        <div className="flex items-center gap-3 mb-3">
          <h2 className="text-xl font-bold">Start Here</h2>
          <span className="text-xs font-bold bg-red-500/15 text-red-400 border border-red-500/25 rounded-full px-3 py-1">
            Tier 1 · Must-have
          </span>
        </div>
        <p className="text-gray-500 text-sm mb-6">
          These five recipes cover the patterns every app needs. Learn them first.
        </p>
        <div className="grid sm:grid-cols-2 gap-4">
          <a
            href="/recipes/login-form"
            className="group block bg-gray-900 border border-gray-800 hover:border-brand-500/50 rounded-xl p-5 transition-colors"
          >
            <div className="flex items-center gap-2 mb-2">
              <span className="text-xs text-gray-500 font-mono">#1</span>
            </div>
            <h3 className="font-semibold text-white group-hover:text-brand-400 transition-colors mb-1">Login Form</h3>
            <p className="text-sm text-gray-400">
              The foundation pattern: <code>withZod</code> action, <code>useActionForm</code>, <code>isPending</code>,
              and error display.
            </p>
          </a>

          <a
            href="/recipes/signup-server-errors"
            className="group block bg-gray-900 border border-gray-800 hover:border-brand-500/50 rounded-xl p-5 transition-colors"
          >
            <div className="flex items-center gap-2 mb-2">
              <span className="text-xs text-gray-500 font-mono">#2</span>
            </div>
            <h3 className="font-semibold text-white group-hover:text-brand-400 transition-colors mb-1">
              Sign Up with Server Errors
            </h3>
            <p className="text-sm text-gray-400">
              Business validation errors from the server mapped back to specific form fields.
            </p>
          </a>

          <a
            href="/recipes/reset-after-success"
            className="group block bg-gray-900 border border-gray-800 hover:border-brand-500/50 rounded-xl p-5 transition-colors"
          >
            <div className="flex items-center gap-2 mb-2">
              <span className="text-xs text-gray-500 font-mono">#3</span>
            </div>
            <h3 className="font-semibold text-white group-hover:text-brand-400 transition-colors mb-1">
              Reset After Success
            </h3>
            <p className="text-sm text-gray-400">
              Three canonical patterns: redirect, in-place reset with <code>onSuccess</code>, and{" "}
              <code>isSubmitSuccessful</code> guard.
            </p>
          </a>

          <a
            href="/recipes/edit-server-data"
            className="group block bg-gray-900 border border-gray-800 hover:border-brand-500/50 rounded-xl p-5 transition-colors"
          >
            <div className="flex items-center gap-2 mb-2">
              <span className="text-xs text-gray-500 font-mono">#4</span>
            </div>
            <h3 className="font-semibold text-white group-hover:text-brand-400 transition-colors mb-1">
              Edit Form with Server Data
            </h3>
            <p className="text-sm text-gray-400">
              Pre-populate from a Server Component, track dirty fields, and revalidate on success.
            </p>
          </a>

          <a
            href="/recipes/multi-step-wizard"
            className="group block bg-gray-900 border border-gray-800 hover:border-brand-500/50 rounded-xl p-5 transition-colors sm:col-span-2"
          >
            <div className="flex items-center gap-2 mb-2">
              <span className="text-xs text-gray-500 font-mono">#5</span>
              <span className="text-xs text-brand-400 font-medium">★ Featured</span>
            </div>
            <h3 className="font-semibold text-white group-hover:text-brand-400 transition-colors mb-1">
              Multi-Step Wizard
            </h3>
            <p className="text-sm text-gray-400">
              Per-step validation with <code>trigger()</code>, sessionStorage persistence with <code>persistKey</code>,
              and safe progress clearing on submit.
            </p>
          </a>
        </div>
      </section>

      {/* ── Tier 2: Common ────────────────────────────────────── */}
      <section className="mb-14">
        <div className="flex items-center gap-3 mb-3">
          <h2 className="text-xl font-bold">Intermediate Patterns</h2>
          <span className="text-xs font-bold bg-yellow-500/15 text-yellow-400 border border-yellow-500/25 rounded-full px-3 py-1">
            Tier 2 · Common
          </span>
        </div>
        <p className="text-gray-500 text-sm mb-6">Patterns you will reach for often as your app grows.</p>
        <div className="grid sm:grid-cols-2 gap-4">
          <a
            href="/recipes/optimistic-ui"
            className="group block bg-gray-900 border border-gray-800 hover:border-cyan-500/50 rounded-xl p-5 transition-colors"
          >
            <div className="flex items-center gap-2 mb-2">
              <span className="text-xs text-gray-500 font-mono">#6</span>
              <span className="text-xs text-cyan-400 font-medium">⚡ Advanced feature</span>
            </div>
            <h3 className="font-semibold text-white group-hover:text-cyan-400 transition-colors mb-1">Optimistic UI</h3>
            <p className="text-sm text-gray-400">
              Instant feedback with <code>optimisticData</code>, temporary IDs, and automatic rollback on error.
            </p>
          </a>

          <a
            href="/recipes/modal-form"
            className="group block bg-gray-900 border border-gray-800 hover:border-brand-500/50 rounded-xl p-5 transition-colors"
          >
            <div className="flex items-center gap-2 mb-2">
              <span className="text-xs text-gray-500 font-mono">#7</span>
            </div>
            <h3 className="font-semibold text-white group-hover:text-brand-400 transition-colors mb-1">
              Modal / Dialog Form
            </h3>
            <p className="text-sm text-gray-400">
              Form lifecycle inside a modal: reset on open, close on success, and Shadcn/ui Dialog integration.
            </p>
          </a>

          <a
            href="/recipes/field-array"
            className="group block bg-gray-900 border border-gray-800 hover:border-brand-500/50 rounded-xl p-5 transition-colors sm:col-span-2"
          >
            <div className="flex items-center gap-2 mb-2">
              <span className="text-xs text-gray-500 font-mono">#8</span>
            </div>
            <h3 className="font-semibold text-white group-hover:text-brand-400 transition-colors mb-1">
              Dynamic Fields with useFieldArray
            </h3>
            <p className="text-sm text-gray-400">
              Add and remove array items, validate each row, and submit a typed array to the server action using{" "}
              <code>useFieldArray</code> from React Hook Form.
            </p>
          </a>
        </div>
      </section>

      {/* ── Tier 3: Advanced ──────────────────────────────────── */}
      <section className="mb-14">
        <div className="flex items-center gap-3 mb-3">
          <h2 className="text-xl font-bold">Advanced Patterns</h2>
          <span className="text-xs font-bold bg-gray-700/50 text-gray-400 border border-gray-600/50 rounded-full px-3 py-1">
            Tier 3 · Specialized
          </span>
        </div>
        <p className="text-gray-500 text-sm mb-6">Edge cases, ecosystem integrations, and power-user patterns.</p>
        <div className="grid sm:grid-cols-2 gap-4">
          <a
            href="/recipes/file-upload"
            className="group block bg-gray-900 border border-gray-800 hover:border-brand-500/50 rounded-xl p-5 transition-colors"
          >
            <div className="flex items-center gap-2 mb-2">
              <span className="text-xs text-gray-500 font-mono">#9</span>
            </div>
            <h3 className="font-semibold text-white group-hover:text-brand-400 transition-colors mb-1">File Upload</h3>
            <p className="text-sm text-gray-400">
              FormData actions, file type and size validation, image preview, and <code>isPending</code> progress
              indicator.
            </p>
          </a>

          <a
            href="/recipes/nested-fields"
            className="group block bg-gray-900 border border-gray-800 hover:border-brand-500/50 rounded-xl p-5 transition-colors"
          >
            <div className="flex items-center gap-2 mb-2">
              <span className="text-xs text-gray-500 font-mono">#10</span>
            </div>
            <h3 className="font-semibold text-white group-hover:text-brand-400 transition-colors mb-1">
              Nested Fields &amp; Sub-components
            </h3>
            <p className="text-sm text-gray-400">
              Compose large forms from smaller components using <code>useFormContext</code> without prop drilling.
            </p>
          </a>

          <a
            href="/recipes/custom-error-mapper"
            className="group block bg-gray-900 border border-gray-800 hover:border-brand-500/50 rounded-xl p-5 transition-colors"
          >
            <div className="flex items-center gap-2 mb-2">
              <span className="text-xs text-gray-500 font-mono">#11</span>
            </div>
            <h3 className="font-semibold text-white group-hover:text-brand-400 transition-colors mb-1">
              Custom Error Mapper
            </h3>
            <p className="text-sm text-gray-400">
              Translate non-standard API error shapes (Laravel, Rails, REST) to React Hook Form field errors.
            </p>
          </a>

          <a
            href="/recipes/standalone-fetch"
            className="group block bg-gray-900 border border-gray-800 hover:border-emerald-500/50 rounded-xl p-5 transition-colors"
          >
            <div className="flex items-center gap-2 mb-2">
              <span className="text-xs text-gray-500 font-mono">#12</span>
              <span className="text-xs text-emerald-400 font-medium">🚀 Standalone</span>
            </div>
            <h3 className="font-semibold text-white group-hover:text-emerald-400 transition-colors mb-1">
              Standalone — Vite, Remix &amp; APIs
            </h3>
            <p className="text-sm text-gray-400">
              Use <code>hookform-action-standalone</code> with <code>fetch</code> or <code>axios</code> outside of
              Next.js.
            </p>
          </a>
        </div>
      </section>

      <div className="border-t border-gray-800 pt-8 text-sm text-gray-500">
        <p>
          All recipes use real, working code with full TypeScript types. Each pattern maps directly to a capability of
          the <code>hookform-action</code> API.{" "}
          <a href="/api-reference" className="text-brand-400 hover:text-brand-300 transition-colors">
            Read the API reference →
          </a>
        </p>
      </div>
    </div>
  );
}
