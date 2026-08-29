import type { Meta, StoryObj } from '@storybook/react-vite'
import { expect, waitFor } from 'storybook/test'
import { AppShell } from './AppShell'
import { Connections } from './Connections'

const meta = {
  component: Connections,
  title: 'Experience/Application/Connections',
  tags: ['page'],
  parameters: { layout: 'fullscreen' },
  /*
   * Stands in for the app shell's content area, which is the only reason
   * this is here: the page centres its pile in the height it is given, and
   * `min-block-size: 100%` resolves against nothing in a bare Storybook
   * canvas. Without a host of a definite height the page collapses to its
   * content and the pile rides at the top of an empty screen — which is a
   * fact about the canvas, not about the page.
   *
   * A definite `block-size` rather than a `min-`, and a plain block rather
   * than a flex container: the page's own `min-block-size: 100%` needs a
   * parent height to resolve against, and as a flex *item* it would shrink
   * to its content's width instead of filling the canvas. `100dvb` is what
   * `AppShell` gives itself, for the same reason.
   */
  decorators: [
    (Story) => (
      <div style={{ blockSize: '100dvb' }}>
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof Connections>

export default meta
type Story = StoryObj<typeof meta>

/** The pile as it lands on a desk — landscape, most recent card face up. */
export const Default: Story = {
  play: async ({ canvas, canvasElement }) => {
    await expect(
      canvas.getByRole('heading', { level: 1, name: 'Recent connections' }),
    ).toBeVisible()
    // Only the front card is exposed; the rest are decorative depth.
    await expect(canvas.getByRole('heading', { name: 'Ben Ackles' })).toBeVisible()

    const pile = canvas.getByRole('group', { name: 'Recent connections' })
    await expect(pile).toHaveAttribute('data-card-orientation', 'landscape')

    const card = canvasElement.querySelector<HTMLElement>(
      '.deck-card-pile__layer--front .deck-person-card',
    )!
    // 7/4 = 1.75 — the card lying on its long edge.
    const ratio = card.offsetWidth / card.offsetHeight
    await expect(ratio).toBeGreaterThan(1.72)
    await expect(ratio).toBeLessThan(1.78)
  },
}

/** Flipping through — the next card comes to the top of the pile. */
export const AdvancingThePile: Story = {
  play: async ({ canvas, userEvent }) => {
    await userEvent.click(canvas.getByRole('button', { name: 'Next card' }))
    await expect(
      await canvas.findByRole('heading', { name: 'Grace Okafor' }),
    ).toBeVisible()
  },
}

/**
 * The private-note pill turns the card over rather than opening a panel
 * somewhere else — what you wrote about someone belongs on the back of their
 * card.
 */
export const TurningACardOver: Story = {
  play: async ({ canvas, userEvent }) => {
    await userEvent.click(
      canvas.getByRole('button', { name: /Your private note/ }),
    )
    await waitFor(async () => {
      await expect(
        canvas.getByDisplayValue(/Front Range meetup/),
      ).toBeVisible()
    })
  },
}

/**
 * Phone. The pile stands its cards up — same 3.5x2in object, turned — and
 * the card re-lays itself around that: portrait, then the ways to reach
 * them, then the name.
 */
export const Mobile: Story = {
  globals: { viewport: { value: 'mobileS' } },
  parameters: { chromatic: { viewports: [375] } },
  play: async ({ canvas, canvasElement }) => {
    const pile = canvas.getByRole('group', { name: 'Recent connections' })
    await expect(pile).toHaveAttribute('data-card-orientation', 'portrait')

    const card = canvasElement.querySelector<HTMLElement>(
      '.deck-card-pile__layer--front .deck-person-card',
    )!
    // 4/7 = 0.571 — the same card stood on its short edge.
    const ratio = card.offsetWidth / card.offsetHeight
    await expect(ratio).toBeGreaterThan(0.55)
    await expect(ratio).toBeLessThan(0.59)
    await expect(card.scrollHeight).toBeLessThanOrEqual(card.clientHeight + 1)
  },
}

/** In the shell, where the pile finally has a room to sit in the middle of. */
export const InAppShell: Story = {
  render: () => (
    <AppShell currentId="/connections">
      <Connections />
    </AppShell>
  ),
  play: async ({ canvas }) => {
    await expect(
      canvas.getByRole('link', { name: 'Connections' }),
    ).toHaveAttribute('aria-current', 'page')
  },
}
