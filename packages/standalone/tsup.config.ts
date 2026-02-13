import { defineConfig } from 'tsup'

export default defineConfig({
  entry: ['src/index.ts'],
  format: ['cjs', 'esm'],
  dts: true,
  sourcemap: true,
  clean: true,
  external: ['react', 'react-dom', 'react-hook-form', 'zod', 'hookform-action-core'],
  treeshake: true,
  splitting: false,
  minify: false,
  banner: {
    js: "'use client'",
  },
})
