import { create } from 'storybook/theming'

import { deckWordmarkSvg } from '../src/foundations/brand/deckWordmark'

/**
 * Deck's Storybook theme — Deck's own mark and wordmark (not the default
 * Storybook logo), reskinned in the MeetCard brand palette so the tool and
 * the product it documents feel like one family.
 *
 * The logo identity stays Deck's own — MeetCard's brand (the `Mark`/
 * `Wordmark` React components exported from `src/foundations/brand`) is
 * what ships in actual product UI, e.g. the `AppBar` stories, and is
 * unaffected by this file. Only the chrome *colors* below are pulled from
 * MeetCard's palette (`src/foundations/tokens/primitives.css`) — Paper,
 * Ink, and Signal Green.
 *
 * `brandImage` only accepts a static image URL, not a live React component.
 * `manager.ts`/`theme.ts` are bundled by esbuild for the browser (no Node
 * `fs`, no Vite asset imports), so the SVG can't be read from disk here —
 * it is encoded as a data URI instead. The markup itself comes from
 * `deckWordmarkSvg`, which the Astro landing page renders too, so the two
 * surfaces cannot drift; a plain TS module (rather than an `.svg` import)
 * is what lets esbuild and Vite both consume it.
 *
 * The wordmark's type is Ink (#1A1A1A) on a light background, so the theme
 * is pinned to `base: 'light'` rather than following the visitor's OS color
 * scheme — on a dark manager theme that text would be nearly invisible.
 *
 * Colors below are literal hex, not `var(--deck-*)` references — like the
 * wordmark, this file has no access to Deck's own stylesheet, so the
 * primitives are copied in directly:
 *   paper #faf8f4 · sand #ede7dd · hairline #d9d2c7 · ink #1a1a1a ·
 *   mist-deep #565c5a · signal-green #2e6e5b
 */

const wordmarkDataUri = `data:image/svg+xml,${encodeURIComponent(deckWordmarkSvg)}`

export const deckTheme = create({
  base: 'light',
  brandTitle: 'Deck — MeetCard Design System',
  brandUrl: 'https://deck.meetcard.io',
  brandImage: wordmarkDataUri,
  brandTarget: '_self',

  fontBase:
    '"Inter", system-ui, -apple-system, "Segoe UI", Roboto, sans-serif',
  fontCode: 'ui-monospace, "SF Mono", Menlo, Consolas, monospace',

  colorPrimary: '#2e6e5b',
  colorSecondary: '#2e6e5b',

  appBg: '#faf8f4',
  appContentBg: '#ffffff',
  appPreviewBg: '#ffffff',
  appBorderColor: '#d9d2c7',
  appBorderRadius: 8,

  textColor: '#1a1a1a',
  textInverseColor: '#faf8f4',
  textMutedColor: '#565c5a',

  barBg: '#faf8f4',
  barTextColor: '#565c5a',
  barHoverColor: '#2e6e5b',
  barSelectedColor: '#2e6e5b',

  buttonBg: '#ffffff',
  buttonBorder: '#d9d2c7',
  booleanBg: '#ede7dd',
  booleanSelectedBg: '#2e6e5b',

  inputBg: '#ffffff',
  inputBorder: '#d9d2c7',
  inputTextColor: '#1a1a1a',
  inputBorderRadius: 6,
})
