import type { Meta, StoryObj } from '@storybook/react-vite'
import { expect } from 'storybook/test'
import { CodeSnippet } from './CodeSnippet'

const EMBED = `<script src="https://cdn.meetcard.io/embed.js" async></script>
<meetcard-book type="person" handle="ben@meetcard" display="inline"></meetcard-book>`

const meta = {
  component: CodeSnippet,
  title: 'Build/Molecules/CodeSnippet',
  tags: ['molecule'],
  args: {
    label: 'Inline embed',
    description: 'Paste this into any page where the booking widget should appear.',
    code: EMBED,
  },
  render: (args) => (
    <div style={{ maxWidth: 520 }}>
      <CodeSnippet {...args} />
    </div>
  ),
} satisfies Meta<typeof CodeSnippet>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  play: async ({ canvas }) => {
    // The block is a named region a keyboard can reach, because it scrolls.
    await expect(canvas.getByRole('group', { name: 'Inline embed' })).toBeVisible()
    await expect(canvas.getByRole('button', { name: 'Copy code' })).toBeVisible()
    /* The copy round-trip is asserted in the unit spec with a stubbed
       clipboard instead of here: `navigator.clipboard` is denied in the
       story runner, and a story that fails on a browser permission tests
       the browser rather than the component. Degrading quietly to
       selectable text is the behaviour that matters, and it is what this
       renders. */
  },
}

/** One line is still a snippet when the angle brackets matter. */
export const SingleLine: Story = {
  args: {
    label: 'Script tag',
    description: undefined,
    code: '<script src="https://cdn.meetcard.io/embed.js" async></script>',
  },
}

/**
 * A line longer than the column scrolls inside the block. The page itself
 * never scrolls sideways.
 */
export const OverflowingLine: Story = {
  args: {
    label: 'Webhook payload',
    description: undefined,
    code: 'curl -X POST https://api.meetcard.io/v1/connections --header "Authorization: Bearer sk_live_51H8xQ2eZvKYlo2C" --data \'{"event":"card.exchanged"}\'',
  },
}

/** When the surrounding card already says what the code is. */
export const LabelHidden: Story = {
  args: { hideLabel: true, description: undefined },
}
