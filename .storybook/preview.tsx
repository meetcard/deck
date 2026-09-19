/**
 * Storybook's preview entry.
 *
 * The decorators and parameters live in `annotations.tsx`, which the docs site
 * also loads (see the header comment there). This file adds the two things
 * that cannot live there: the stylesheet, and the `autodocs` tag.
 *
 * The stylesheet is Deck's own and nothing else — what a consuming app
 * imports. Stories used to render against the Vite template's `index.css`,
 * which set an 18px root font and global `h1`/`h2`/`p` rules on top, so rem
 * lengths and bare elements looked different here than anywhere Deck ships.
 */
import type { Preview } from '@storybook/react-vite'
import '../src/styles/deck.css'
import annotations from './annotations'

const preview: Preview = {
  ...annotations,

  /**
   * Has to be written out here, not in `annotations.tsx`.
   *
   * Storybook's indexer finds `tags` by statically parsing this file — it does
   * not evaluate it, so it cannot follow a spread from another module. Moving
   * this line silently drops all 75 `--docs` pages from the index (466 entries
   * become 391) and every `?path=/docs/…--docs` link 404s. The build still
   * succeeds, which is what makes it worth a comment.
   */
  tags: ['autodocs'],
}

export default preview
