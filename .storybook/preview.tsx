import type { Preview } from '@storybook/react-vite'
import '../src/styles/deck.css'

const preview: Preview = {
  tags: ['autodocs'],

  /**
   * Every story renders inside `.deck-root`, which is what applies Deck's
   * background, text color, and font tokens — the same wrapper a consuming
   * app puts on its shell. Without it, stories would sit on Storybook's own
   * canvas color and contrast checks would test the wrong pairing.
   *
   * The breathing room is skipped for `layout: 'fullscreen'` stories. Those
   * are the ones that go edge to edge — app bars, the nav, sheets, whole
   * screens — and padding them contradicts the layout they asked for. It
   * also silently narrowed them: 48px off a 375px canvas is most of a
   * bottom-nav label.
   */
  decorators: [
    (Story, context) => (
      <div
        className="deck-root"
        style={{
          padding: context.parameters.layout === 'fullscreen' ? 0 : '24px',
        }}
      >
        <Story />
      </div>
    ),
  ],

  parameters: {
    layout: 'fullscreen',

    controls: {
      matchers: {
        color: /(background|color)$/i,
        date: /Date$/i,
      },
    },

    a11y: {
      // Violations fail the test run, so an inaccessible story cannot merge.
      // 'todo' downgrades to a warning if you need to land work in stages.
      test: 'error',
      config: {
        // Page-scope rules that cannot hold for a single component rendered
        // in isolation. Leaving them on reports noise on every story and
        // hides real component-level findings. Assert these on full pages.
        rules: [
          { id: 'landmark-one-main', enabled: false },
          { id: 'page-has-heading-one', enabled: false },
          { id: 'region', enabled: false },
          { id: 'bypass', enabled: false },
        ],
      },
    },

    /**
     * Viewports for responsive checks, in two groups.
     *
     * Devices first, for "how does this look on a phone" — real widths, all
     * sitting between breakpoints rather than on them.
     *
     * Then edge pairs, for "does the breakpoint fire correctly". These
     * deliberately straddle rather than land on a breakpoint value: Deck's
     * queries are `max-width`, so a preset at exactly 640px matches the
     * mobile rule and shows the narrow layout, which is the opposite of what
     * someone reaching for "sm" expects. 639/641 shows each side honestly.
     *
     * The pairs cover the widths actually queried in the codebase — 640, 768
     * and 1024 — not the full token scale. `md` 768 is where the app shell
     * swaps its navigation entirely (rail above, bar below), which makes it
     * the most consequential edge here: the two sides render different
     * destinations, not just a different arrangement. `xl` 1280 still has no
     * `@media` rule anywhere and appears as a device width only.
     *
     * NOTE: at exactly 640px, Sheet's `min-width: 640px` rule and every other
     * component's `max-width: 640px` rule both apply, so the canvas shows
     * Sheet wide and everything else narrow. Another reason not to park a
     * preset on the line.
     */
    viewport: {
      options: {
        mobileS: {
          name: 'Mobile S — 375px',
          styles: { width: '375px', height: '812px' },
          type: 'mobile',
        },
        mobile: {
          name: 'Mobile — 390px',
          styles: { width: '390px', height: '844px' },
          type: 'mobile',
        },
        mobileL: {
          name: 'Mobile L — 430px',
          styles: { width: '430px', height: '932px' },
          type: 'mobile',
        },
        tablet: {
          name: 'Tablet — 768px',
          styles: { width: '768px', height: '1024px' },
          type: 'tablet',
        },
        tabletL: {
          name: 'Tablet landscape — 1024px',
          styles: { width: '1024px', height: '768px' },
          type: 'tablet',
        },
        laptop: {
          name: 'Laptop — 1280px',
          styles: { width: '1280px', height: '800px' },
          type: 'desktop',
        },
        desktop: {
          name: 'Desktop — 1440px',
          styles: { width: '1440px', height: '900px' },
          type: 'desktop',
        },
        smBelow: {
          name: 'Edge · sm − 1px (639px, narrow)',
          styles: { width: '639px', height: '900px' },
          type: 'mobile',
        },
        smAbove: {
          name: 'Edge · sm + 1px (641px, wide)',
          styles: { width: '641px', height: '900px' },
          type: 'tablet',
        },
        mdBelow: {
          name: 'Edge · md − 1px (767px, bottom nav)',
          styles: { width: '767px', height: '1024px' },
          type: 'tablet',
        },
        mdAbove: {
          name: 'Edge · md + 1px (769px, side rail)',
          styles: { width: '769px', height: '1024px' },
          type: 'tablet',
        },
        lgBelow: {
          name: 'Edge · lg − 1px (1023px, narrow)',
          styles: { width: '1023px', height: '800px' },
          type: 'tablet',
        },
        lgAbove: {
          name: 'Edge · lg + 1px (1025px, wide)',
          styles: { width: '1025px', height: '800px' },
          type: 'desktop',
        },
      },
    }
  },
}

export default preview
