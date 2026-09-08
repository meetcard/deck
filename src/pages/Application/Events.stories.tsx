import type { Meta, StoryObj } from '@storybook/react-vite'
import { expect, within } from 'storybook/test'
import { AppShell } from './AppShell'
import { Events } from './Events'

const meta = {
  component: Events,
  title: 'Experience/Application/Events',
  tags: ['page'],
  parameters: { layout: 'fullscreen' },
} satisfies Meta<typeof Events>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  play: async ({ canvas, canvasElement }) => {
    await expect(
      canvas.getByRole('heading', { level: 1, name: 'Events' }),
    ).toBeVisible()
    // The next one up is lifted out of the list it would otherwise blend
    // into — with its own picture, which is how you recognise it before you
    // have read anything.
    await expect(
      canvas.getByRole('heading', { level: 2, name: 'RevOps Summit' }),
    ).toBeVisible()
    await expect(
      canvasElement.querySelector('.deck-event-hero__image'),
    ).not.toBeNull()

    /* The featured event and the list are two regions, and they both talk
       about the same events — so every query below says which one it
       means. */
    const featured = within(
      canvas.getByRole('region', { name: 'Featured event' }),
    )
    const list = within(canvas.getByRole('region', { name: 'Upcoming events' }))

    // And the one after it, because "and then?" is the second question.
    await expect(featured.getByText(/Up next/)).toBeVisible()
    await expect(
      featured.getByRole('link', { name: /Boulder Climate Happy Hour/ }),
    ).toBeInTheDocument()

    /* An event three weeks out cannot have produced a card yet, so the
       faces on its row are people you know who are going. The prototype
       says "cards exchanged" here; that would be the list inventing a
       past. */
    await expect(list.getByText('3 going')).toBeVisible()
  },
}

/**
 * Past events keep their attendance badge — "I spoke at that" is the reason
 * anyone scrolls back — and read newest first.
 */
export const Past: Story = {
  args: { defaultTab: 'past' },
  play: async ({ canvas }) => {
    await expect(canvas.getByRole('link', { name: 'Frontend Denver' })).toBeVisible()
    // An upcoming event must not leak into the past list.
    await expect(
      canvas.queryByRole('link', { name: 'SaaStr Annual' }),
    ).not.toBeInTheDocument()
  },
}

/** Switching lists. The counts are on the control, so neither is a surprise. */
export const SwitchingLists: Story = {
  play: async ({ canvas, userEvent }) => {
    await expect(canvas.getByRole('radio', { name: 'Upcoming (4)' })).toBeChecked()

    await userEvent.click(canvas.getByRole('radio', { name: 'Past (2)' }))
    await expect(canvas.getByRole('link', { name: 'SaaS North' })).toBeVisible()
  },
}

/** A new account. The empty list points at the next action rather than a void. */
export const NoEvents: Story = {
  args: { events: [] },
  play: async ({ canvas }) => {
    await expect(canvas.getByText('Nothing coming up')).toBeVisible()
  },
}

/**
 * Everything is behind you — no featured card, because there is nothing
 * coming to feature.
 */
export const AllPast: Story = {
  args: { today: '2028-01-01' },
}

/** The page in the shell it actually lives in. */
export const InTheShell: Story = {
  render: () => (
    <AppShell currentId="/events">
      <Events />
    </AppShell>
  ),
}

/**
 * Search cuts across the list you are in. It looks at the three things
 * anyone remembers about an event they are trying to find again: what it was
 * called, where it was held, and what town it was in.
 */
export const Searching: Story = {
  play: async ({ canvas, userEvent }) => {
    await userEvent.type(
      canvas.getByRole('searchbox', { name: 'Search events' }),
      'austin',
    )

    /* Scoped to the list: the featured event is not filtered — it is the
       next one up whatever you have typed — and it carries the same name. */
    const list = within(canvas.getByRole('region', { name: 'Upcoming events' }))
    await expect(list.getByRole('link', { name: 'RevOps Summit' })).toBeVisible()
    await expect(
      list.queryByRole('link', { name: 'SaaStr Annual' }),
    ).not.toBeInTheDocument()
  },
}

/** Nothing matched. The way out is the control that got you here. */
export const SearchWithNoMatches: Story = {
  play: async ({ canvas, userEvent }) => {
    await userEvent.type(
      canvas.getByRole('searchbox', { name: 'Search events' }),
      'helsinki',
    )

    await expect(
      await canvas.findByRole('heading', { name: 'No events match that' }),
    ).toBeVisible()

    await userEvent.click(canvas.getByRole('button', { name: 'Show all events' }))

    const list = within(canvas.getByRole('region', { name: 'Upcoming events' }))
    await expect(
      await list.findByRole('link', { name: 'SaaStr Annual' }),
    ).toBeVisible()
  },
}

/**
 * The same events as cards. Rows are for scanning a calendar down its left
 * edge; cards are for browsing when you are not sure what you are after.
 */
export const CardView: Story = {
  args: { defaultView: 'cards' },
  play: async ({ canvas, canvasElement }) => {
    await expect(canvasElement.querySelector('.events__grid')).not.toBeNull()
    const list = within(canvas.getByRole('region', { name: 'Upcoming events' }))
    await expect(
      list.getByRole('link', { name: 'Boulder Climate Happy Hour' }),
    ).toBeVisible()
  },
}

/** Switching between the two shapes without losing your place in the list. */
export const SwitchingViews: Story = {
  play: async ({ canvas, canvasElement, userEvent }) => {
    await userEvent.click(canvas.getByRole('radio', { name: 'Cards' }))
    await expect(canvasElement.querySelector('.events__grid')).not.toBeNull()

    await userEvent.click(canvas.getByRole('radio', { name: 'List' }))
    await expect(canvasElement.querySelector('.events__grid')).toBeNull()
    await expect(canvasElement.querySelector('.deck-event-row')).not.toBeNull()
  },
}

/**
 * Past events carry what you came away with — the faces and the count. That
 * is the only question anyone asks of an event a year later, and the reason
 * the list is worth scrolling back through.
 */
export const PastCarriesTheCards: Story = {
  args: { defaultTab: 'past' },
  play: async ({ canvas }) => {
    await expect(canvas.getByText('5 cards exchanged')).toBeVisible()
    await expect(canvas.getByText('4 cards exchanged')).toBeVisible()
  },
}

/**
 * Phone. The cover thumbnails come off the rows — the name needs the width
 * more than the picture does — and the toolbar wraps into stacked controls.
 */
export const Mobile: Story = {
  globals: { viewport: { value: 'mobileS' } },
  parameters: { chromatic: { viewports: [375] } },
  play: async ({ canvasElement }) => {
    const cover = canvasElement.querySelector('.deck-event-row__cover')!
    await expect(getComputedStyle(cover).display).toBe('none')
  },
}
