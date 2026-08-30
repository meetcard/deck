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

    const pile = canvas.getByRole('group', { name: 'Cards from Founders Dinner' })
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
    /* The written note reads on the card's back as prose, not as a field:
       it is closed until you press it to edit. */
    await waitFor(async () => {
      await expect(canvas.getByText(/Front Range meetup/)).toBeVisible()
    })
  },
}

/**
 * Phone. The pile stands its cards up — same 3.5x2in object, turned — and
 * the card re-lays itself around that: portrait, then the ways to reach
 * them, then the name.
 *
 * The sentence under the heading stops naming the event here, because the
 * collapsed timeline names it in a card two lines below.
 */
export const Mobile: Story = {
  globals: { viewport: { value: 'mobileS' } },
  parameters: { chromatic: { viewports: [375] } },
  play: async ({ canvas, canvasElement }) => {
    const pile = canvas.getByRole('group', { name: 'Cards from Founders Dinner' })
    await expect(pile).toHaveAttribute('data-card-orientation', 'portrait')

    // Said once: the timeline's own card, not the sentence above it.
    // `innerText`, not `textContent` — the name is dropped with
    // `display: none`, which textContent would happily read out anyway.
    const summary = canvas.getByText<HTMLElement>(/You have dropped 3 cards/)
    await expect(summary.innerText).not.toMatch(/Founders Dinner/)
    await expect(
      canvasElement.querySelector('.deck-event-timeline__current'),
    ).toHaveTextContent('Founders Dinner')

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

/**
 * The timeline is the index and the pile is what it opens: moving along the
 * line puts a different event's cards on the desk, squared up from the top.
 */
export const MovingAlongTheTimeline: Story = {
  play: async ({ canvas, userEvent }) => {
    await expect(
      canvas.getByRole('heading', { name: 'Ben Ackles' }),
    ).toBeVisible()

    await userEvent.click(canvas.getByRole('radio', { name: /SaaStr Annual/ }))

    await expect(
      await canvas.findByRole('heading', { name: 'Renée Ashford' }),
    ).toBeVisible()
    await expect(
      canvas.getByRole('group', { name: 'Cards from SaaStr Annual' }),
    ).toBeInTheDocument()
    // The page says whose pile this is, and how big it is. Asserted on the
    // whole sentence, since the event's name is a span of its own — the
    // phone drops it, and this width keeps it.
    await expect(
      canvas.getByText<HTMLElement>(/You have dropped 2 cards/).innerText,
    ).toMatch(/from SaaStr Annual/)
  },
}

/**
 * An event nobody has been to yet has an empty desk. Said plainly rather
 * than hidden — a timeline that skipped its empty events would be lying
 * about where the cards came from.
 */
export const AnEventWithNoCards: Story = {
  play: async ({ canvas, userEvent }) => {
    await userEvent.click(canvas.getByRole('radio', { name: /RevOps Summit/ }))

    await expect(
      await canvas.findByRole('heading', { name: 'No cards from this event' }),
    ).toBeVisible()
    await expect(
      canvas.queryByRole('heading', { name: 'Ben Ackles' }),
    ).not.toBeInTheDocument()
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
