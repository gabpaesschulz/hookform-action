import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'hookform-action - Docs',
  description:
    'React Hook Form + server submit flows with type-safe actions, Zod mapping, optimistic UI, persistence, and adapters for Next.js or standalone React apps.',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="dark">
      <body className="min-h-screen">
        <nav className="sticky top-0 z-50 border-b border-gray-800 bg-gray-950/85 backdrop-blur-sm">
          <div className="mx-auto max-w-6xl px-4 py-3 sm:px-6">
            <div className="mb-2 flex items-center justify-between">
              <a href="/" className="flex items-center gap-2 text-lg font-bold">
                <span className="text-brand-400">⚡</span>
                <span>hookform-action</span>
              </a>
              <span className="rounded-full border border-brand-500/20 bg-brand-500/10 px-2.5 py-1 text-xs font-medium text-brand-300">
                v4
              </span>
            </div>

            <div className="flex items-center gap-5 overflow-x-auto whitespace-nowrap pb-1 text-sm text-gray-400">
              <a
                href="/examples/next-quickstart-login"
                className="transition-colors hover:text-white"
              >
                Quick Start
              </a>
              <a href="/examples" className="transition-colors hover:text-white">
                Examples
              </a>
              <a href="/recipes" className="transition-colors hover:text-white">
                Recipes
              </a>
              <a href="/faq" className="transition-colors hover:text-white">
                FAQ
              </a>
              <a href="/troubleshooting" className="transition-colors hover:text-white">
                Troubleshooting
              </a>
              <a href="/standalone" className="transition-colors hover:text-white">
                Standalone
              </a>
              <a
                href="/examples/devtools-debug-submission-history"
                className="transition-colors hover:text-white"
              >
                DevTools
              </a>
              <a href="/api-reference" className="transition-colors hover:text-white">
                API
              </a>
              <a href="/why" className="transition-colors hover:text-white">
                Why
              </a>
              <a
                href="https://github.com/gabpaesschulz/hookform-action/blob/main/packages/next/CHANGELOG.md"
                target="_blank"
                rel="noreferrer noopener"
                className="transition-colors hover:text-white"
              >
                Changelog
              </a>
              <a
                href="https://github.com/gabpaesschulz/hookform-action"
                target="_blank"
                rel="noreferrer noopener"
                className="transition-colors hover:text-white"
              >
                GitHub
              </a>
            </div>
          </div>
        </nav>
        <main>{children}</main>
      </body>
    </html>
  )
}
