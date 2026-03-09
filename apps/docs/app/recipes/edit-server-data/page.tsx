export default function EditServerDataPage() {
  return (
    <div className="max-w-4xl mx-auto px-6 py-16">
      <div className="mb-8">
        <a href="/recipes" className="text-sm text-gray-500 hover:text-gray-300 transition-colors">
          ← Back to Recipes
        </a>
      </div>

      <div className="mb-12">
        <div className="flex items-center gap-3 mb-4">
          <span className="text-xs font-bold bg-red-500/15 text-red-400 border border-red-500/25 rounded-full px-3 py-1">
            Tier 1 · Must-have
          </span>
          <span className="text-gray-500 text-sm font-mono">Recipe #4</span>
        </div>
        <h1 className="text-3xl font-bold mb-3">Edit Form with Server-Loaded Data</h1>
        <p className="text-lg text-gray-400">
          Pre-populate a form from a Server Component, track which fields the user actually changed, and revalidate the
          page data after a successful save.
        </p>
      </div>

      {/* Why it matters */}
      <section className="mb-12">
        <h2 className="text-xl font-bold mb-3">Why it matters</h2>
        <p className="text-gray-400 leading-relaxed">
          Edit forms are the second most common form type after login. They require loading data from the server and
          using it as <code>defaultValues</code> — but there&apos;s a fundamental tension: Server Components can fetch
          data asynchronously, while <code>useActionForm</code> lives in a Client Component. Getting the data handoff
          right prevents stale defaults and unintended dirty-field detection.
        </p>
        <p className="text-gray-400 leading-relaxed mt-3">
          This recipe shows the canonical Server → Client pattern, how to use <code>isDirty</code> to show the save
          button only when something changed, and how to use <code>router.refresh()</code> to revalidate without a full
          page reload.
        </p>
      </section>

      {/* Full Example */}
      <section className="mb-12">
        <h2 className="text-xl font-bold mb-6">Full Example</h2>

        <div className="mb-5">
          <span className="text-xs font-mono text-gray-400 bg-gray-800 px-2 py-0.5 rounded border border-gray-700">
            actions.ts
          </span>
          <div className="code-block mt-2 text-gray-300">
            <pre>{`'use server'
import { z } from 'zod'
import { withZod } from 'hookform-action-core/with-zod'

const profileSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  bio: z.string().max(160, 'Bio must be 160 characters or fewer'),
  website: z.string().url('Enter a valid URL').optional().or(z.literal('')),
})

export const updateProfileAction = withZod(profileSchema, async (data) => {
  // data is typed: { name: string; bio: string; website?: string }
  await db.profiles.update({
    where: { userId: session.userId },
    data,
  })
  return { success: true }
})`}</pre>
          </div>
        </div>

        <div className="mb-5">
          <span className="text-xs font-mono text-gray-400 bg-gray-800 px-2 py-0.5 rounded border border-gray-700">
            page.tsx — Server Component
          </span>
          <div className="code-block mt-2 text-gray-300">
            <pre>{`// This is a Server Component — it can be async and access the database directly
import { db } from '@/lib/db'
import { EditProfileForm } from './edit-profile-form'

export default async function EditProfilePage() {
  // Fetch the current profile on the server
  const profile = await db.profiles.findUnique({
    where: { userId: session.userId },
    select: { name: true, bio: true, website: true },
  })

  if (!profile) return <p>Profile not found.</p>

  // Pass to the Client Component as a plain prop
  return <EditProfileForm defaultValues={profile} />
}`}</pre>
          </div>
        </div>

        <div className="mb-5">
          <span className="text-xs font-mono text-gray-400 bg-gray-800 px-2 py-0.5 rounded border border-gray-700">
            edit-profile-form.tsx — Client Component
          </span>
          <div className="code-block mt-2 text-gray-300">
            <pre>{`'use client'
import { useActionForm } from 'hookform-action'
import { useRouter } from 'next/navigation'
import { updateProfileAction } from './actions'

interface EditProfileFormProps {
  defaultValues: {
    name: string
    bio: string
    website: string
  }
}

export function EditProfileForm({ defaultValues }: EditProfileFormProps) {
  const router = useRouter()
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isPending, isDirty, dirtyFields },
  } = useActionForm(updateProfileAction, {
    defaultValues,
    onSuccess: (result) => {
      // Re-fetch the Server Component data without a full reload
      router.refresh()
      // Optionally reset to the newly saved values to clear isDirty
      reset(defaultValues)
    },
  })

  return (
    <form onSubmit={handleSubmit()}>
      <div>
        <label htmlFor="name">Display Name</label>
        <input id="name" {...register('name')} />
        {errors.name && <p className="text-red-400">{errors.name.message}</p>}
      </div>

      <div>
        <label htmlFor="bio">
          Bio
          {dirtyFields.bio && (
            <span className="text-xs text-brand-400 ml-2">modified</span>
          )}
        </label>
        <textarea id="bio" {...register('bio')} rows={3} />
        {errors.bio && <p className="text-red-400">{errors.bio.message}</p>}
      </div>

      <div>
        <label htmlFor="website">Website</label>
        <input id="website" type="url" {...register('website')} />
        {errors.website && <p className="text-red-400">{errors.website.message}</p>}
      </div>

      {/* Only show the Save button when something has changed */}
      <button
        type="submit"
        disabled={isPending || !isDirty}
        className={!isDirty ? 'opacity-50 cursor-not-allowed' : ''}
      >
        {isPending ? 'Saving…' : isDirty ? 'Save Changes' : 'No Changes'}
      </button>
    </form>
  )
}`}</pre>
          </div>
        </div>
      </section>

      {/* Key Concepts */}
      <section className="mb-12">
        <h2 className="text-xl font-bold mb-4">Key Concepts</h2>
        <div className="space-y-3">
          <div className="bg-gray-900 border border-gray-800 rounded-lg p-4">
            <code className="text-brand-400">Server Component → Client Component data handoff</code>
            <p className="text-gray-400 text-sm mt-1">
              Fetch data in an async Server Component, then pass it as a plain prop to the Client Component. The Client
              Component receives it as a stable object and uses it as <code>defaultValues</code>. This avoids the{" "}
              <code>useEffect</code> fetch anti-pattern and leverages Next.js caching.
            </p>
          </div>
          <div className="bg-gray-900 border border-gray-800 rounded-lg p-4">
            <code className="text-brand-400">isDirty / dirtyFields</code>
            <p className="text-gray-400 text-sm mt-1">
              <code>isDirty</code> is <code>true</code> when at least one field differs from its{" "}
              <code>defaultValue</code>. <code>dirtyFields</code> is a record of which specific fields changed. Use them
              to disable the save button when nothing has been modified and to show per-field change indicators.
            </p>
          </div>
          <div className="bg-gray-900 border border-gray-800 rounded-lg p-4">
            <code className="text-brand-400">router.refresh()</code>
            <p className="text-gray-400 text-sm mt-1">
              Re-executes all Server Components on the current route without a full navigation. The Server Component
              re-fetches the updated data and passes it as new props to the Client Component. Call it in{" "}
              <code>onSuccess</code> after a successful save.
            </p>
          </div>
          <div className="bg-gray-900 border border-gray-800 rounded-lg p-4">
            <code className="text-brand-400">reset(newValues) after save</code>
            <p className="text-gray-400 text-sm mt-1">
              After a successful edit, call <code>reset(result.data)</code> or <code>reset(defaultValues)</code> to
              update the RHF baseline. This clears <code>isDirty</code> so the save button correctly disables again
              without a full remount.
            </p>
          </div>
        </div>
      </section>

      {/* Pitfalls */}
      <section className="mb-12">
        <h2 className="text-xl font-bold mb-4">⚠️ Pitfalls</h2>
        <ul className="space-y-3">
          <li className="flex gap-3 bg-yellow-500/5 border border-yellow-500/20 rounded-lg p-4">
            <span className="text-yellow-400 shrink-0 mt-0.5">⚠</span>
            <div>
              <p className="text-sm font-medium text-gray-200">
                Unstable <code>defaultValues</code> causing unintended resets
              </p>
              <p className="text-sm text-gray-400 mt-1">
                If <code>defaultValues</code> is an inline object literal created on every render, RHF may re-initialise
                and clear user edits. Always pass a stable reference — either from a Server Component prop, a{" "}
                <code>useMemo</code>, or a fetched query result.
              </p>
            </div>
          </li>
          <li className="flex gap-3 bg-yellow-500/5 border border-yellow-500/20 rounded-lg p-4">
            <span className="text-yellow-400 shrink-0 mt-0.5">⚠</span>
            <div>
              <p className="text-sm font-medium text-gray-200">
                <code>isSubmitSuccessful</code> stays <code>true</code> after save
              </p>
              <p className="text-sm text-gray-400 mt-1">
                For edit forms you usually want the user to stay on the page and keep editing. Avoid gating the form
                behind <code>isSubmitSuccessful</code> — it will hide the form after the first save. Use{" "}
                <code>onSuccess</code> for side effects only.
              </p>
            </div>
          </li>
          <li className="flex gap-3 bg-yellow-500/5 border border-yellow-500/20 rounded-lg p-4">
            <span className="text-yellow-400 shrink-0 mt-0.5">⚠</span>
            <div>
              <p className="text-sm font-medium text-gray-200">
                Forgetting <code>reset()</code> after a successful save
              </p>
              <p className="text-sm text-gray-400 mt-1">
                Without <code>reset()</code>, <code>isDirty</code> stays <code>true</code> even though the changes were
                saved. The save button remains enabled and the user may accidentally re-submit.
              </p>
            </div>
          </li>
        </ul>
      </section>

      {/* Related */}
      <section className="border-t border-gray-800 pt-8">
        <h2 className="text-lg font-semibold mb-4">Related</h2>
        <div className="flex flex-wrap gap-4 text-sm">
          <a href="/recipes/reset-after-success" className="text-brand-400 hover:text-brand-300 transition-colors">
            → Reset After Success
          </a>
          <a href="/recipes/modal-form" className="text-brand-400 hover:text-brand-300 transition-colors">
            → Modal / Dialog Form
          </a>
          <a href="/recipes/signup-server-errors" className="text-brand-400 hover:text-brand-300 transition-colors">
            → Sign Up with Server Errors
          </a>
          <a href="/api-reference" className="text-brand-400 hover:text-brand-300 transition-colors">
            → API Reference
          </a>
        </div>
      </section>
    </div>
  );
}
