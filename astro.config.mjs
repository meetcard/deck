import { defineConfig } from 'astro/config'
import react from '@astrojs/react'

// `srcDir` must point at src/site, not the default src: `src/pages` is
// Deck's own React page components (PublicCard.tsx, Events.tsx, …), and
// Astro would otherwise try to route them and build zero real pages.
export default defineConfig({
  integrations: [react()],
  srcDir: './src/site',
  publicDir: './public',
  outDir: './dist/site',
})
