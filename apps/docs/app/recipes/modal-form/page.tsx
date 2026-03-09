export default function ModalFormPage() {
  return (
    <div className="max-w-4xl mx-auto px-6 py-16">
      <div className="mb-8">
        <a href="/recipes" className="text-sm text-gray-500 hover:text-gray-300 transition-colors">
          ← Back to Recipes
        </a>
      </div>

      <div className="mb-12">
        <div className="flex items-center gap-3 mb-4">
          <span className="text-xs font-bold bg-yellow-500/15 text-yellow-400 border border-yellow-500/25 rounded-full px-3 py-1">
            Tier 2 · Common
          </span>
          <span className="text-gray-500 text-sm font-mono">Recipe #7</span>
        </div>
        <h1 className="text-3xl font-bold mb-3">Modal / Dialog Form</h1>
        <p className="text-lg text-gray-400">
          Forms inside modals have a different lifecycle — they must reset when opened, close on success, and handle
          focus correctly. This recipe covers the canonical pattern and Shadcn/ui Dialog integration.
        </p>
      </div>

      {/* Why it matters */}
      <section className="mb-12">
        <h2 className="text-xl font-bold mb-3">Why it matters</h2>
        <p className="text-gray-400 leading-relaxed">
          A form inside a modal behaves differently from a page-level form. If the modal does not unmount when closed,
          the form keeps its state — including errors from the last submission. When the user opens it again, they see
          stale data. When they close it after a success, they may briefly see an empty form before the animation
          completes.
        </p>
        <p className="text-gray-400 leading-relaxed mt-3">
          This recipe solves these issues with two patterns: the{" "}
          <strong className="text-gray-200">useEffect reset</strong> pattern (for modals that stay mounted) and the{" "}
          <strong className="text-gray-200">key remount</strong> pattern (the nuclear option that guarantees a fresh
          form). It also shows Shadcn/ui <code>Dialog</code> integration.
        </p>
      </section>

      {/* Pattern 1 */}
      <section className="mb-12">
        <h2 className="text-xl font-bold mb-2">Pattern 1 — useEffect reset (stays mounted)</h2>
        <p className="text-gray-400 text-sm mb-5">
          Best for modals that are conditionally rendered but not unmounted on close (e.g. animated with CSS opacity).
          Reset the form when the modal opens and close it on success.
        </p>

        <div className="mb-5">
          <span className="text-xs font-mono text-gray-400 bg-gray-800 px-2 py-0.5 rounded border border-gray-700">
            create-item-modal.tsx
          </span>
          <div className="code-block mt-2 text-gray-300">
            <pre>{`'use client'
import { useEffect } from 'react'
import { useActionForm } from 'hookform-action'
import { createItemAction } from './actions'

interface CreateItemModalProps {
  isOpen: boolean
  onClose: () => void
}

export function CreateItemModal({ isOpen, onClose }: CreateItemModalProps) {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isPending },
  } = useActionForm(createItemAction, {
    defaultValues: { title: '', description: '' },
    onSuccess: () => {
      // Step 1: close the modal
      onClose()
      // Step 2: reset AFTER close to avoid flash of empty form
      // We use setTimeout(0) to let the close animation start first
      setTimeout(() => reset(), 150)
    },
  })

  // When the modal opens, clear any leftover state from the previous session
  useEffect(() => {
    if (isOpen) reset()
  }, [isOpen, reset])

  if (!isOpen) return null

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-title"
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60"
    >
      <div className="bg-gray-900 border border-gray-700 rounded-xl p-6 w-full max-w-md">
        <h2 id="modal-title" className="text-lg font-bold mb-4">
          Create Item
        </h2>

        <form onSubmit={handleSubmit()}>
          <div className="mb-4">
            <label htmlFor="title" className="block text-sm text-gray-400 mb-1">
              Title
            </label>
            <input
              id="title"
              autoFocus
              {...register('title')}
              className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white"
            />
            {errors.title && (
              <p className="text-red-400 text-sm mt-1">{errors.title.message}</p>
            )}
          </div>

          <div className="mb-6">
            <label htmlFor="description" className="block text-sm text-gray-400 mb-1">
              Description
            </label>
            <textarea
              id="description"
              rows={3}
              {...register('description')}
              className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white"
            />
            {errors.description && (
              <p className="text-red-400 text-sm mt-1">{errors.description.message}</p>
            )}
          </div>

          <div className="flex gap-3 justify-end">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-gray-400 hover:text-white transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isPending}
              className="px-4 py-2 bg-brand-600 hover:bg-brand-500 disabled:bg-gray-700 text-white rounded-lg transition-colors"
            >
              {isPending ? 'Creating…' : 'Create'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}`}</pre>
          </div>
        </div>
      </section>

      {/* Pattern 2: key remount */}
      <section className="mb-12">
        <h2 className="text-xl font-bold mb-2">Pattern 2 — key remount (unmount on close)</h2>
        <p className="text-gray-400 text-sm mb-5">
          The simplest approach: unmount and remount the form component on every open by passing a <code>key</code> that
          changes. React destroys and recreates the component, giving you a guaranteed fresh state. Best for modals
          where no CSS animation is needed.
        </p>

        <div className="mb-5">
          <span className="text-xs font-mono text-gray-400 bg-gray-800 px-2 py-0.5 rounded border border-gray-700">
            parent-component.tsx
          </span>
          <div className="code-block mt-2 text-gray-300">
            <pre>{`'use client'
import { useState } from 'react'
import { CreateItemModal } from './create-item-modal'

export function ItemList() {
  const [isOpen, setIsOpen] = useState(false)
  const [openCount, setOpenCount] = useState(0)

  const handleOpen = () => {
    setOpenCount((c) => c + 1)  // increment key to force remount
    setIsOpen(true)
  }

  return (
    <>
      <button onClick={handleOpen}>New Item</button>

      {isOpen && (
        // key changes on every open → CreateItemModal is remounted with fresh state
        <CreateItemModal
          key={openCount}
          onClose={() => setIsOpen(false)}
        />
      )}
    </>
  )
}`}</pre>
          </div>
        </div>
      </section>

      {/* Shadcn/ui Dialog */}
      <section className="mb-12">
        <h2 className="text-xl font-bold mb-2">Shadcn/ui Dialog integration</h2>
        <p className="text-gray-400 text-sm mb-5">
          Shadcn&apos;s <code>Dialog</code> keeps content mounted by default. Use the <code>useEffect</code> reset
          pattern and wire <code>onOpenChange</code> to close the modal.
        </p>

        <div className="mb-5">
          <span className="text-xs font-mono text-gray-400 bg-gray-800 px-2 py-0.5 rounded border border-gray-700">
            create-item-dialog.tsx
          </span>
          <div className="code-block mt-2 text-gray-300">
            <pre>{`'use client'
import { useEffect } from 'react'
import { useActionForm } from 'hookform-action'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog'
import { createItemAction } from './actions'

interface CreateItemDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function CreateItemDialog({ open, onOpenChange }: CreateItemDialogProps) {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isPending },
  } = useActionForm(createItemAction, {
    defaultValues: { title: '', description: '' },
    onSuccess: () => {
      onOpenChange(false)
      setTimeout(() => reset(), 150)
    },
  })

  useEffect(() => {
    if (open) reset()
  }, [open, reset])

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Create Item</DialogTitle>
        </DialogHeader>

        <form id="create-item-form" onSubmit={handleSubmit()}>
          <div className="space-y-4 py-4">
            <div>
              <label htmlFor="title" className="text-sm font-medium">Title</label>
              <input id="title" {...register('title')} className="w-full mt-1" />
              {errors.title && <p className="text-red-400 text-sm">{errors.title.message}</p>}
            </div>
            <div>
              <label htmlFor="description" className="text-sm font-medium">Description</label>
              <textarea id="description" {...register('description')} className="w-full mt-1" />
              {errors.description && (
                <p className="text-red-400 text-sm">{errors.description.message}</p>
              )}
            </div>
          </div>
        </form>

        <DialogFooter>
          <button type="button" onClick={() => onOpenChange(false)}>Cancel</button>
          <button type="submit" form="create-item-form" disabled={isPending}>
            {isPending ? 'Creating…' : 'Create'}
          </button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
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
            <code className="text-brand-400">reset() in useEffect on open</code>
            <p className="text-gray-400 text-sm mt-1">
              When the modal opens, reset the form to clear any state from the previous session. This is essential for
              modals that stay mounted between opens (e.g. animated with CSS).
            </p>
          </div>
          <div className="bg-gray-900 border border-gray-800 rounded-lg p-4">
            <code className="text-brand-400">setTimeout before reset on close</code>
            <p className="text-gray-400 text-sm mt-1">
              If you call <code>reset()</code> synchronously in <code>onSuccess</code> before closing the modal, the
              user briefly sees an empty form during the close animation. A small delay prevents the flash.
            </p>
          </div>
          <div className="bg-gray-900 border border-gray-800 rounded-lg p-4">
            <code className="text-brand-400">autoFocus on first field</code>
            <p className="text-gray-400 text-sm mt-1">
              Always add <code>autoFocus</code> to the first input in the modal for accessibility. Screen reader users
              and keyboard users expect focus to move to the dialog content when it opens.
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
              <p className="text-sm font-medium text-gray-200">Hiding the modal with CSS instead of unmounting</p>
              <p className="text-sm text-gray-400 mt-1">
                If you use <code>display: none</code> or <code>visibility: hidden</code> to hide the modal, the form
                component stays mounted and retains all its state. The user will see stale errors and values on the next
                open. Always pair this approach with an explicit <code>useEffect</code> reset.
              </p>
            </div>
          </li>
          <li className="flex gap-3 bg-yellow-500/5 border border-yellow-500/20 rounded-lg p-4">
            <span className="text-yellow-400 shrink-0 mt-0.5">⚠</span>
            <div>
              <p className="text-sm font-medium text-gray-200">
                Using <code>isSubmitSuccessful</code> to close the modal
              </p>
              <p className="text-sm text-gray-400 mt-1">
                <code>isSubmitSuccessful</code> does not give you access to the action result. Prefer{" "}
                <code>onSuccess</code>, which receives the full typed result and is a cleaner place to trigger{" "}
                <code>onClose()</code>.
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
          <a href="/recipes/edit-server-data" className="text-brand-400 hover:text-brand-300 transition-colors">
            → Edit Form with Server Data
          </a>
          <a href="/api-reference" className="text-brand-400 hover:text-brand-300 transition-colors">
            → API Reference
          </a>
        </div>
      </section>
    </div>
  );
}
