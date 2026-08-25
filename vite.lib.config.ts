import { resolve } from 'node:path'
import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

/**
 * Library build for `@meetcard/deck`.
 *
 * Separate from the root config, which builds the local playground app and
 * carries the Storybook/Vitest wiring. React is external so consumers dedupe
 * to their own copy; declarations come from `tsconfig.build.json`.
 */
export default defineConfig({
  plugins: [react()],
  // The playground's public/ assets are not part of the library.
  publicDir: false,
  build: {
    outDir: 'dist',
    emptyOutDir: true,
    sourcemap: true,
    cssCodeSplit: false,
    lib: {
      entry: resolve(import.meta.dirname, 'src/index.ts'),
      formats: ['es'],
      fileName: () => 'deck.js',
    },
    rollupOptions: {
      external: ['react', 'react-dom', 'react/jsx-runtime'],
      output: {
        assetFileNames: (asset) =>
          asset.names?.some((name) => name.endsWith('.css'))
            ? 'deck.css'
            : '[name][extname]',
      },
    },
  },
})
