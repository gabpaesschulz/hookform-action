export default function FileUploadPage() {
  return (
    <div className="max-w-4xl mx-auto px-6 py-16">
      <div className="mb-8">
        <a href="/recipes" className="text-sm text-gray-500 hover:text-gray-300 transition-colors">
          ← Back to Recipes
        </a>
      </div>

      <div className="mb-12">
        <div className="flex items-center gap-3 mb-4">
          <span className="text-xs font-bold bg-gray-700/50 text-gray-400 border border-gray-600/50 rounded-full px-3 py-1">
            Tier 3 · Specialized
          </span>
          <span className="text-gray-500 text-sm font-mono">Recipe #9</span>
        </div>
        <h1 className="text-3xl font-bold mb-3">File Upload</h1>
        <p className="text-lg text-gray-400">
          File uploads break the default JSON action model. This recipe shows how to use a FormData
          action, validate file type and size, show a preview, and surface a loading indicator.
        </p>
      </div>

      {/* Why it matters */}
      <section className="mb-12">
        <h2 className="text-xl font-bold mb-3">Why it matters</h2>
        <p className="text-gray-400 leading-relaxed">
          File uploads are fundamentally different from text-field submissions. Files must travel
          over the wire as <code>multipart/form-data</code>, not JSON. That means you need a{' '}
          <code>FormDataServerAction</code> instead of the <code>withZod</code> JSON wrapper.
          Validation also shifts: instead of a Zod schema on an object, you inspect the{' '}
          <code>File</code> object&apos;s <code>size</code>, <code>type</code>, and{' '}
          <code>name</code> on the server.
        </p>
        <p className="text-gray-400 leading-relaxed mt-3">
          Client-side validation (type/size checks before upload) is implemented with a custom{' '}
          <code>schema</code> using Zod&apos;s <code>.refine()</code>. This recipe covers the full
          pattern: action, form, preview, and a graceful loading state.
        </p>
      </section>

      {/* Full Example */}
      <section className="mb-12">
        <h2 className="text-xl font-bold mb-6">Full Example — Avatar Upload</h2>

        <div className="mb-5">
          <span className="text-xs font-mono text-gray-400 bg-gray-800 px-2 py-0.5 rounded border border-gray-700">
            actions.ts — FormData action (arity 2)
          </span>
          <div className="code-block mt-2 text-gray-300">
            <pre>{`'use server'

const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp']
const MAX_SIZE_BYTES = 5 * 1024 * 1024  // 5 MB

export async function uploadAvatarAction(
  prevState: unknown,
  formData: FormData
) {
  const file = formData.get('avatar') as File | null

  if (!file || file.size === 0) {
    return { errors: { avatar: ['Please select a file'] } }
  }

  if (file.size > MAX_SIZE_BYTES) {
    return { errors: { avatar: ['File must be under 5 MB'] } }
  }

  if (!ALLOWED_TYPES.includes(file.type)) {
    return { errors: { avatar: ['Only JPEG, PNG, and WebP images are allowed'] } }
  }

  // Upload to your storage provider (S3, Cloudflare R2, Vercel Blob, etc.)
  const url = await storage.upload(file)

  // Update the user's profile with the new avatar URL
  await db.profiles.update({
    where: { userId: session.userId },
    data: { avatarUrl: url },
  })

  return { success: true, url }
}`}</pre>
          </div>
        </div>

        <div className="mb-5">
          <span className="text-xs font-mono text-gray-400 bg-gray-800 px-2 py-0.5 rounded border border-gray-700">
            avatar-upload-form.tsx
          </span>
          <div className="code-block mt-2 text-gray-300">
            <pre>{`'use client'
import { useActionForm } from 'hookform-action'
import { useRef, useState } from 'react'
import { z } from 'zod'
import { uploadAvatarAction } from './actions'

// Client-side schema for early validation (before upload)
const avatarSchema = z.object({
  avatar: z
    .custom<FileList>()
    .refine((files) => files?.length > 0, 'Please select a file')
    .refine(
      (files) => files?.[0]?.size <= 5 * 1024 * 1024,
      'File must be under 5 MB'
    )
    .refine(
      (files) => ['image/jpeg', 'image/png', 'image/webp'].includes(files?.[0]?.type),
      'Only JPEG, PNG, and WebP images are allowed'
    ),
})

type AvatarResult = {
  success?: boolean
  url?: string
  errors?: { avatar?: string[] }
}

export function AvatarUploadForm() {
  const [preview, setPreview] = useState<string | null>(null)
  const previewUrlRef = useRef<string | null>(null)

  const {
    register,
    handleSubmit,
    formState: { errors, isPending, isSubmitSuccessful, actionResult },
  } = useActionForm<{ avatar: FileList }, AvatarResult>(uploadAvatarAction, {
    defaultValues: { avatar: undefined as unknown as FileList },
    schema: avatarSchema,
    validationMode: 'onChange',
    onSuccess: (result) => {
      // Revoke the local preview URL to free memory
      if (previewUrlRef.current) URL.revokeObjectURL(previewUrlRef.current)
    },
  })

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    // Generate a local preview before uploading
    if (previewUrlRef.current) URL.revokeObjectURL(previewUrlRef.current)
    const url = URL.createObjectURL(file)
    previewUrlRef.current = url
    setPreview(url)
  }

  return (
    <div className="space-y-4">
      {/* Preview */}
      {preview && !isSubmitSuccessful && (
        <div className="w-24 h-24 rounded-full overflow-hidden border-2 border-brand-500">
          <img src={preview} alt="Preview" className="w-full h-full object-cover" />
        </div>
      )}

      {/* Confirmed avatar */}
      {isSubmitSuccessful && actionResult?.url && (
        <div className="space-y-2">
          <div className="w-24 h-24 rounded-full overflow-hidden border-2 border-green-500">
            <img src={actionResult.url} alt="Your avatar" className="w-full h-full object-cover" />
          </div>
          <p className="text-green-400 text-sm">Avatar updated!</p>
        </div>
      )}

      <form onSubmit={handleSubmit()}>
        <div className="space-y-2">
          <label htmlFor="avatar" className="text-sm font-medium text-gray-300">
            Choose an image
          </label>
          <input
            id="avatar"
            type="file"
            accept="image/jpeg,image/png,image/webp"
            {...register('avatar', { onChange: handleFileChange })}
            className="block w-full text-sm text-gray-400 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:bg-brand-600 file:text-white hover:file:bg-brand-500"
          />
          {errors.avatar && (
            <p className="text-red-400 text-sm">{errors.avatar.message}</p>
          )}
        </div>

        <button
          type="submit"
          disabled={isPending || !preview}
          className="mt-4 px-4 py-2 bg-brand-600 hover:bg-brand-500 disabled:bg-gray-700 text-white rounded-lg transition-colors"
        >
          {isPending ? (
            <span className="flex items-center gap-2">
              <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" aria-hidden="true">
                <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" className="opacity-25" />
                <path fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" className="opacity-75" />
              </svg>
              Uploading…
            </span>
          ) : (
            'Upload Avatar'
          )}
        </button>
      </form>
    </div>
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
            <code className="text-brand-400">FormDataServerAction (arity 2)</code>
            <p className="text-gray-400 text-sm mt-1">
              File uploads require the <code>(prevState, formData) =&gt; Promise</code> signature.
              The hook detects this automatically (by checking the function&apos;s{' '}
              <code>length</code>) and sends the data as <code>multipart/form-data</code> instead of
              JSON.
            </p>
          </div>
          <div className="bg-gray-900 border border-gray-800 rounded-lg p-4">
            <code className="text-brand-400">z.custom&lt;FileList&gt;().refine()</code>
            <p className="text-gray-400 text-sm mt-1">
              Zod does not have a built-in file type. Use <code>z.custom&lt;FileList&gt;()</code>{' '}
              with <code>.refine()</code> for client-side validation. Avoid{' '}
              <code>z.instanceof(File)</code> — it fails in SSR environments where <code>File</code>{' '}
              is not defined.
            </p>
          </div>
          <div className="bg-gray-900 border border-gray-800 rounded-lg p-4">
            <code className="text-brand-400">URL.createObjectURL + cleanup</code>
            <p className="text-gray-400 text-sm mt-1">
              Use <code>URL.createObjectURL</code> for instant image previews. Always call{' '}
              <code>URL.revokeObjectURL</code> when the preview is no longer needed to prevent
              memory leaks. Store the URL in a <code>useRef</code> to access it across renders.
            </p>
          </div>
          <div className="bg-gray-900 border border-gray-800 rounded-lg p-4">
            <code className="text-brand-400">Next.js Server Action file size limit</code>
            <p className="text-gray-400 text-sm mt-1">
              Next.js Server Actions have a default body size limit of 1 MB. For larger files,
              configure <code>experimental.serverActionsBodySizeLimit</code> in{' '}
              <code>next.config.mjs</code>, or upload directly to your storage provider from the
              client (signed URL pattern).
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
                Using <code>withZod</code> for file uploads
              </p>
              <p className="text-sm text-gray-400 mt-1">
                <code>withZod</code> serialises data as JSON. Files cannot be serialised to JSON —
                you will receive an empty object. Always use the raw FormData action signature for
                file uploads.
              </p>
            </div>
          </li>
          <li className="flex gap-3 bg-yellow-500/5 border border-yellow-500/20 rounded-lg p-4">
            <span className="text-yellow-400 shrink-0 mt-0.5">⚠</span>
            <div>
              <p className="text-sm font-medium text-gray-200">
                Using <code>setValue</code> for file inputs
              </p>
              <p className="text-sm text-gray-400 mt-1">
                Browser security prevents programmatically setting file input values. Use{' '}
                <code>register</code> normally and listen to <code>onChange</code> for the preview
                logic. Do not try to control the file input&apos;s value via <code>setValue</code>.
              </p>
            </div>
          </li>
          <li className="flex gap-3 bg-yellow-500/5 border border-yellow-500/20 rounded-lg p-4">
            <span className="text-yellow-400 shrink-0 mt-0.5">⚠</span>
            <div>
              <p className="text-sm font-medium text-gray-200">Forgetting to revoke object URLs</p>
              <p className="text-sm text-gray-400 mt-1">
                Every <code>URL.createObjectURL</code> call holds a reference to the file in memory.
                Revoke it in <code>onSuccess</code> or in a <code>useEffect</code> cleanup to avoid
                memory leaks in long-running sessions.
              </p>
            </div>
          </li>
        </ul>
      </section>

      {/* Related */}
      <section className="border-t border-gray-800 pt-8">
        <h2 className="text-lg font-semibold mb-4">Related</h2>
        <div className="flex flex-wrap gap-4 text-sm">
          <a
            href="/recipes/signup-server-errors"
            className="text-brand-400 hover:text-brand-300 transition-colors"
          >
            → Sign Up with Server Errors
          </a>
          <a
            href="/recipes/custom-error-mapper"
            className="text-brand-400 hover:text-brand-300 transition-colors"
          >
            → Custom Error Mapper
          </a>
          <a
            href="/api-reference"
            className="text-brand-400 hover:text-brand-300 transition-colors"
          >
            → API Reference
          </a>
        </div>
      </section>
    </div>
  )
}
