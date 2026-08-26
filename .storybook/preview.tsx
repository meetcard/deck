import type { Preview } from '@storybook/react-vite'
import '../src/index.css'

const preview: Preview = {
  tags: ['autodocs'],

  /**
   * Every story renders inside `.deck-root`, which is what applies Deck's
   * background, text color, and font tokens — the same wrapper a consuming
   * app puts on its shell. Without it, stories would sit on Storybook's own
   * canvas color and contrast checks would test the wrong pairing.
   */
  decorators: [
    (Story) => (
      <div className="deck-root" style={{ padding: '24px' }}>
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

    // Deck's breakpoints, for responsive checks in the toolbar.
    viewport: {
      options: {
        mobile: {
          name: 'Mobile (390px)',
          styles: { width: '390px', height: '844px' },
          type: 'mobile',
        },
        sm: {
          name: 'sm (640px)',
          styles: { width: '640px', height: '900px' },
          type: 'mobile',
        },
        md: {
          name: 'md (768px)',
          styles: { width: '768px', height: '1024px' },
          type: 'tablet',
        },
        lg: {
          name: 'lg (1024px)',
          styles: { width: '1024px', height: '900px' },
          type: 'desktop',
        },
        xl: {
          name: 'xl (1280px)',
          styles: { width: '1280px', height: '900px' },
          type: 'desktop',
        },
      },
    },
  },
}

export default preview
