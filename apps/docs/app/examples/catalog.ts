export type ExampleFormat = 'live' | 'recipe'
export type ExampleImpact = 'Muito alto' | 'Alto' | 'Medio'

export interface StrategicExample {
  order: number
  slug: string
  title: string
  adapter: 'Next.js' | 'Standalone' | 'Cross' | 'Devtools'
  impact: ExampleImpact
  format: ExampleFormat
  differential: string
  message: string
}

export const strategicExamples: StrategicExample[] = [
  {
    order: 1,
    slug: 'next-quickstart-login',
    title: 'Next Quickstart Login',
    adapter: 'Next.js',
    impact: 'Muito alto',
    format: 'live',
    differential: 'RHF + Server Action + erro mapeado sem boilerplate',
    message: 'Conecte RHF a Server Actions em minutos.',
  },
  {
    order: 2,
    slug: 'standalone-quickstart-login',
    title: 'Standalone Quickstart Login',
    adapter: 'Standalone',
    impact: 'Muito alto',
    format: 'recipe',
    differential: 'Mesma API do Next adapter, sem dependencia de framework',
    message: 'Troque para submit() e rode em Vite, Remix ou Astro.',
  },
  {
    order: 3,
    slug: 'migration-rhf-manual-to-hookform-action',
    title: 'Migration Manual Wiring -> hookform-action',
    adapter: 'Cross',
    impact: 'Muito alto',
    format: 'recipe',
    differential: 'Antes/depois da DX em codigo real',
    message: 'Menos estados manuais, menos glue code, menos bugs.',
  },
  {
    order: 4,
    slug: 'next-schema-once-signup',
    title: 'Next Schema Once Signup',
    adapter: 'Next.js',
    impact: 'Alto',
    format: 'live',
    differential: 'withZod + inferencia de tipos + validacao client/server',
    message: 'Schema vive uma vez e tipa todo o fluxo.',
  },
  {
    order: 5,
    slug: 'standalone-rest-error-mapper',
    title: 'Standalone REST Error Mapper',
    adapter: 'Standalone',
    impact: 'Alto',
    format: 'recipe',
    differential: 'Mapeia contratos de erro legados sem refatorar backend',
    message: 'Adapte APIs reais sem retrabalho massivo.',
  },
  {
    order: 6,
    slug: 'next-optimistic-profile-update',
    title: 'Next Optimistic Profile Update',
    adapter: 'Next.js',
    impact: 'Alto',
    format: 'recipe',
    differential: 'Optimistic UI com rollback nativo em poucas linhas',
    message: 'Entrega UX instantanea com seguranca de estado.',
  },
  {
    order: 7,
    slug: 'next-wizard-onboarding-persist',
    title: 'Next Wizard Onboarding Persist',
    adapter: 'Next.js',
    impact: 'Alto',
    format: 'live',
    differential: 'Persistencia de wizard com persistKey e limpeza automatica',
    message: 'Usuario nao perde progresso ao navegar ou atualizar.',
  },
  {
    order: 8,
    slug: 'devtools-debug-submission-history',
    title: 'Devtools Debug Submission History',
    adapter: 'Devtools',
    impact: 'Medio',
    format: 'recipe',
    differential: 'Inspecao de estado e historico de submissions em runtime',
    message: 'Debug de form deixa de ser tentativa e erro.',
  },
  {
    order: 9,
    slug: 'cross-adapter-parity-next-vs-standalone',
    title: 'Cross Adapter Parity Next vs Standalone',
    adapter: 'Cross',
    impact: 'Medio',
    format: 'recipe',
    differential: 'Portabilidade comprovada com diff minimo',
    message: 'Evite lock-in de framework sem abrir mao de DX.',
  },
  {
    order: 10,
    slug: 'next-optimistic-list-rollback',
    title: 'Next Optimistic List Rollback',
    adapter: 'Next.js',
    impact: 'Medio',
    format: 'live',
    differential: 'Caso avancado de optimistic para lista com falha simulada',
    message: 'Mostra robustez em cenarios de producao.',
  },
]

export const topAdoptionSlugs = new Set([
  'next-quickstart-login',
  'standalone-quickstart-login',
  'migration-rhf-manual-to-hookform-action',
  'next-schema-once-signup',
  'next-wizard-onboarding-persist',
])
