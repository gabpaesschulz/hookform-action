import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'hookform-action – Docs',
  description:
    'Seamless integration between React Hook Form and Next.js Server Actions with Zod validation and multi-step persistence.',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="dark">
      <body className="min-h-screen">
        <nav className="border-b border-gray-800 bg-gray-950/80 backdrop-blur-sm sticky top-0 z-50">
          <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
            <a href="/" className="flex items-center gap-2 font-bold text-lg">
              <span className="text-brand-400">⚡</span>
              <span>hookform-action</span>
            </a>
            <div className="flex items-center gap-6 text-sm text-gray-400">
              <a href="/examples/login" className="hover:text-white transition-colors">
                Login
              </a>
              <a href="/examples/wizard" className="hover:text-white transition-colors">
                Wizard
              </a>
              <a href="/examples/optimistic" className="hover:text-white transition-colors">
                <span className="text-cyan-400">⚡</span> Optimistic
              </a>
              <a href="/examples/validation" className="hover:text-white transition-colors">
                <span className="text-cyan-400">⚡</span> Validation
              </a>
              <a href="/standalone" className="hover:text-white transition-colors">
                <span className="text-emerald-400">🚀</span> Standalone
              </a>
              <a href="/devtools" className="hover:text-white transition-colors">
                <span className="text-purple-400">🔍</span> DevTools
              </a>
              <a href="/api-reference" className="hover:text-white transition-colors">
                API Reference
              </a>
              <a
                href="https://github.com/gabpaesschulz/hookform-action"
                target="_blank"
                rel="noreferrer noopener"
                className="hover:text-white transition-colors"
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
