import { defineConfig } from 'tsup'

export default defineConfig([
  {
    entry: ['src/index.ts'],
    format: ['cjs', 'esm'],
    dts: true,
    sourcemap: true,
    clean: true,
    external: ['react', 'react-dom', 'react-hook-form', 'zod', 'next'],
    treeshake: true,
    splitting: false,
    minify: false,
    banner: {
      js: "'use client'",
    },
  },
  {
    entry: ['src/with-zod.ts'],
    format: ['cjs', 'esm'],
    dts: true,
    sourcemap: true,
    clean: false,
    external: ['react', 'react-dom', 'react-hook-form', 'zod', 'next'],
    treeshake: true,
    splitting: false,
    minify: false,
  },
  {
    entry: ['src/use-action-form-core.ts'],
    format: ['cjs', 'esm'],
    dts: true,
    sourcemap: true,
    clean: false,
    external: ['react', 'react-dom', 'react-hook-form', 'zod'],
    treeshake: true,
    splitting: false,
    minify: false,
    banner: {
      js: "'use client'",
    },
  },
  {
    entry: ['src/core-types.ts'],
    format: ['cjs', 'esm'],
    dts: true,
    sourcemap: true,
    clean: false,
    external: ['react', 'react-dom', 'react-hook-form', 'zod'],
    treeshake: true,
    splitting: false,
    minify: false,
  },
])
