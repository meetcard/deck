import { fileURLToPath } from 'node:url'
import { defineConfig } from 'astro/config'
import mdx from '@astrojs/mdx'
import react from '@astrojs/react'
import sitemap from '@astrojs/sitemap'

// `srcDir` must point at src/site, not the default src: `src/pages` is
// Deck's own React page components (PublicCard.tsx, Events.tsx, …), and
// Astro would otherwise try to route them and build zero real pages.
export default defineConfig({
  // Absolute base for canonical and og:image URLs — social scrapers reject
  // relative image paths, so these have to be fully qualified.
  site: 'https://deck.meetcard.io',
  integrations: [react(), mdx(), sitemap()],
  srcDir: './src/site',
  publicDir: './public',
  outDir: './dist/site',
  vite: {
    resolve: {
      alias: {
        // The docs pages in src/docs/ are CSF docs and import `<Meta>` from
        // Storybook. On the site that tag has nothing to attach to, so it
        // resolves to a no-op rather than dragging Storybook's docs UI into
        // the bundle. See src/site/lib/storybook-blocks.ts.
        '@storybook/addon-docs/blocks': fileURLToPath(
          new URL('./src/site/lib/storybook-blocks.ts', import.meta.url),
        ),
      },
    },
  },
})
