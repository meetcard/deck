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
      /*
       * `lucide-react` is listed here as a tripwire, not a requirement.
       *
       * It is a devDependency, and today it is unreachable from this entry:
       * only `src/pages/**` imports it, and `src/index.ts` exports nothing
       * from there. So it cannot reach the bundle and the published package
       * keeps its zero runtime dependencies.
       *
       * The day someone re-exports a page from `src/index.ts`, this line
       * turns a silent 30KB of inlined icons into a loud unresolved import.
       * If that day comes, both facts have to move together: lucide becomes
       * a real `dependency` (or a peer with an explicit range) *and* stays
       * external. A devDependency that ships in the export graph is a broken
       * package.
       */
      external: ['react', 'react-dom', 'react/jsx-runtime', 'lucide-react'],
      output: {
        assetFileNames: (asset) =>
          asset.names?.some((name) => name.endsWith('.css'))
            ? 'deck.css'
            : '[name][extname]',
      },
    },
  },
})
