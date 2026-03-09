import type { ReactNode } from "react";

interface ExampleShellProps {
  title: string;
  subtitle: string;
  impact: string;
  differential: string;
  message: string;
  children: ReactNode;
}

export function ExampleShell({
  title,
  subtitle,
  impact,
  differential,
  message,
  children,
}: ExampleShellProps) {
  return (
    <div className="max-w-4xl mx-auto px-6 py-16">
      <div className="mb-8">
        <a href="/examples" className="text-sm text-gray-500 hover:text-gray-300 transition-colors">
          ← Back to examples hub
        </a>
      </div>

      <h1 className="text-3xl font-bold mb-2">{title}</h1>
      <p className="text-gray-400 mb-6">{subtitle}</p>

      <div className="grid sm:grid-cols-3 gap-3 mb-10 text-sm">
        <div className="border border-gray-800 rounded-lg p-3 bg-gray-900/30">
          <p className="text-gray-500 uppercase tracking-wide text-xs mb-1">Impact</p>
          <p className="text-brand-300 font-medium">{impact}</p>
        </div>
        <div className="border border-gray-800 rounded-lg p-3 bg-gray-900/30">
          <p className="text-gray-500 uppercase tracking-wide text-xs mb-1">Differential</p>
          <p className="text-gray-200">{differential}</p>
        </div>
        <div className="border border-gray-800 rounded-lg p-3 bg-gray-900/30">
          <p className="text-gray-500 uppercase tracking-wide text-xs mb-1">Message</p>
          <p className="text-emerald-300">{message}</p>
        </div>
      </div>

      {children}
    </div>
  );
}

