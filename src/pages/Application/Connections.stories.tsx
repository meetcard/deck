import type { Meta, StoryObj } from '@storybook/react-vite'
import { expect, waitFor, within } from 'storybook/test'
import { AppShell } from './AppShell'
import { Connections } from './Connections'

const meta = {
  component: Connections,
  title: 'Experience/Application/Connections',
  tags: ['page'],
  parameters: { layout: 'fullscreen' },
  /*
   * Stands in for the app shell's content area. The page's own
   * `min-block-size: 100%` resolves against nothing in a bare Storybook
   * canvas, so without a host of a definite height the sticky rail has no
   * scroll to stick against — which is a fact about the canvas, not about
   * the page.
   *
   * A definite `block-size` rather than a `min-`, and a plain block rather
   * than a flex container: as a flex *item* the page would shrink to its
   * content's width instead of filling the canvas. `100dvb` is what
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

/**
 * The desk with room either side of it: the events in a rail on the left,
 * the pile in the middle, everyone else in it underneath.
 */
export const Default: Story = {
  play: async ({ canvas, canvasElement }) => {
    await expect(
      canvas.getByRole('heading', { level: 1, name: 'Connections' }),
    ).toBeVisible()
    // Only the front card is exposed; the rest are decorative depth.
    await expect(canvas.getByRole('heading', { name: 'Ben Ackles' })).toBeVisible()

    // The line has stood itself on end beside the desk.
    await expect(
      canvasElement.querySelector('.deck-event-timeline'),
    ).toHaveAttribute('data-orientation', 'vertical')

    // Which event this desk belongs to, said where the rail is small type
    // off to one side.
    const summary = canvasElement.querySelector('.connections__event')!
    await expect(summary).toBeVisible()
    await expect(summary).toHaveTextContent('Founders Dinner')
    await expect(summary).toHaveTextContent('3 cards')

    const pile = canvas.getByRole('group', { name: 'Cards from Founders Dinner' })
    await expect(pile).toHaveAttribute('data-card-orientation', 'landscape')

    const card = canvasElement.querySelector<HTMLElement>(
      '.deck-card-pile__layer--front .deck-person-card',
    )!
    // 7/4 = 1.75 — the card lying on its long edge.
    const ratio = card.offsetWidth / card.offsetHeight
    await expect(ratio).toBeGreaterThan(1.72)
    await expect(ratio).toBeLessThan(1.78)

    // And the contents page for the pile, as rows at this width.
    await expect(
      canvas.getByRole('list', { name: 'Everyone from Founders Dinner' }),
    ).toHaveAttribute('data-layout', 'rows')
  },
}

/** Flipping through — the next card comes to the top of the pile. */
export const AdvancingThePile: Story = {
  play: async ({ canvas, userEvent }) => {
    await userEvent.click(canvas.getByRole('button', { name: 'Next card' }))
    await expect(
      await canvas.findByRole('heading', { name: 'Grace Okafor' }),
    ).toBeVisible()
    // The counter follows the pile rather than the other way round.
    await expect(canvas.getByText('2 / 3')).toBeVisible()
  },
}

/**
 * The index is the way back. A pile hands you one card at a time, so the
 * third person you met is three swipes away with nothing to say they are
 * there — unless the page lists them.
 */
export const PickingSomeoneFromTheIndex: Story = {
  play: async ({ canvas, canvasElement, userEvent }) => {
    /* Scoped to the list: the card on the desk carries the same name in its
       own controls ("Email Mika Tanaka"), and a page-wide query for a person
       finds the card as readily as the row that deals it. */
    const index = within(
      canvas.getByRole('list', { name: 'Everyone from Founders Dinner' }),
    )
    /* Names, not whole rows: the current row also carries a "Showing"
       marker, which is supposed to move. What must not move is who is in
       the list and in what order. */
    const names = () =>
      [...canvasElement.querySelectorAll('.deck-card-index__name')].map(
        (name) => name.textContent,
      )
    const before = names()

    await userEvent.click(index.getByRole('button', { name: /Mika Tanaka/ }))

    await expect(
      await canvas.findByRole('heading', { name: 'Mika Tanaka' }),
    ).toBeVisible()
    await expect(
      index.getByRole('button', { name: /Mika Tanaka/ }),
    ).toHaveAttribute('aria-current', 'true')
    // Nobody dropped off the list: the card on top is marked, not removed,
    // so the row you were about to click doesn't move out from under you.
    await expect(names()).toEqual(before)
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
 *
 * The timeline is a row of dots above the desk with the selected event named
 * underneath, so the desk's own summary of that event stands down rather
 * than saying it twice. The index becomes a strip of faces: at this width it
 * is a way back to a card, not something to read.
 */
export const Mobile: Story = {
  globals: { viewport: { value: 'mobileS' } },
  parameters: { chromatic: { viewports: [375] } },
  play: async ({ canvas, canvasElement }) => {
    const pile = canvas.getByRole('group', { name: 'Cards from Founders Dinner' })
    await expect(pile).toHaveAttribute('data-card-orientation', 'portrait')

    // Said once: the timeline's own card, not a second block beside it.
    await expect(canvasElement.querySelector('.connections__event')).not.toBeVisible()
    await expect(
      canvasElement.querySelector('.deck-event-timeline__current'),
    ).toHaveTextContent('Founders Dinner')

    await expect(
      canvas.getByRole('list', { name: 'Everyone from Founders Dinner' }),
    ).toHaveAttribute('data-layout', 'strip')

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
 * One pixel short of the rail. The timeline is still a line above the desk —
 * labels and all — and the page is one column, which is the arrangement
 * every width between a phone and a laptop gets.
 */
export const BelowTheRail: Story = {
  globals: { viewport: { value: 'lgBelow' } },
  parameters: { chromatic: { viewports: [1023] } },
  play: async ({ canvas, canvasElement }) => {
    await expect(
      canvasElement.querySelector('.deck-event-timeline'),
    ).toHaveAttribute('data-orientation', 'horizontal')
    // The line names the event under its own dot, so the desk doesn't.
    await expect(canvasElement.querySelector('.connections__event')).not.toBeVisible()
    await expect(
      canvas.getByRole('radio', { name: /Founders Dinner/ }),
    ).toBeChecked()
  },
}

/**
 * The timeline is the index and the pile is what it opens: moving along the
 * line puts a different event's cards on the desk, squared up from the top.
 */
export const MovingAlongTheTimeline: Story = {
  play: async ({ canvas, canvasElement, userEvent }) => {
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

    // The desk follows the line: whose cards these are, and how many.
    const summary = canvasElement.querySelector('.connections__event')!
    await expect(summary).toHaveTextContent('SaaStr Annual')
    await expect(summary).toHaveTextContent('2 cards')
    await expect(
      canvas.getByRole('list', { name: 'Everyone from SaaStr Annual' }),
    ).toBeInTheDocument()
  },
}

/**
 * An event nobody has been to yet has an empty desk. Said plainly rather
 * than hidden — a timeline that skipped its empty events would be lying
 * about where the cards came from. There is no index either: a contents page
 * for nothing is furniture.
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
    await expect(
      canvas.queryByRole('list', { name: /Everyone from/ }),
    ).not.toBeInTheDocument()
  },
}

/** In the shell, where the desk finally has a room to sit in. */
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
