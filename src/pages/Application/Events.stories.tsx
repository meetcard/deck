import type { Meta, StoryObj } from '@storybook/react-vite'
import { expect, waitFor, within } from 'storybook/test'
import { AppShell } from './AppShell'
import { Events } from './Events'

/*
 * The featured event is deliberately in both the header and the list below
 * it, so every query for a specific event is scoped to whichever list is
 * showing. `getByRole('link', { name })` on the canvas would find two.
 */
const list = (canvas: ReturnType<typeof within>, name: string) =>
  within(canvas.getByRole('list', { name }))

const meta = {
  component: Events,
  title: 'Experience/Application/Events',
  tags: ['page'],
  parameters: { layout: 'fullscreen' },
} satisfies Meta<typeof Events>

export default meta
type Story = StoryObj<typeof meta>

/** The page as you land on it: the next event up top, the calendar below. */
export const Default: Story = {
  play: async ({ canvas }) => {
    // "Events" is the page title, so it is the h1 — the featured event's name
    // sits under it rather than standing in for it.
    await expect(
      canvas.getByRole('heading', { level: 1, name: 'Events' }),
    ).toBeVisible()
    await expect(
      list(canvas, 'Upcoming events').getByRole('link', {
        name: 'RevOps Summit',
      }),
    ).toHaveAttribute('href', '/events/revops')
    // The row carries what the event is really for.
    await expect(
      within(
        canvas.getByRole('list', { name: 'Cards exchanged at RevOps Summit' })
          .parentElement as HTMLElement,
      ).getByText('5 cards exchanged'),
    ).toBeVisible()
  },
}

/** Events already behind you, and the cards that came out of them. */
export const PastEvents: Story = {
  play: async ({ canvas, userEvent }) => {
    await userEvent.click(canvas.getByRole('radio', { name: 'Past' }))

    await waitFor(async () => {
      await expect(
        canvas.getByRole('link', { name: 'Denver Design Week Mixer' }),
      ).toBeVisible()
    })
    // Upcoming events are out of the list, not merely dimmed.
    await expect(
      canvas.queryByRole('link', { name: 'SaaStr Annual' }),
    ).not.toBeInTheDocument()
  },
}

/**
 * The same events as cards. Not a different set, and not a different
 * filter — the switch changes the arrangement and nothing else.
 */
export const CardView: Story = {
  play: async ({ canvas, userEvent }) => {
    await userEvent.click(canvas.getByRole('radio', { name: 'Card view' }))

    await waitFor(async () => {
      await expect(
        canvas.getByRole('list', { name: 'Upcoming events' }),
      ).toBeVisible()
    })
    await expect(
      canvas.getByRole('link', { name: 'Founders Dinner' }),
    ).toBeVisible()
  },
}

/** Search runs over the venue, the host and the city, not just the name. */
export const Searching: Story = {
  play: async ({ canvas, userEvent }) => {
    await userEvent.type(canvas.getByLabelText('Search events'), 'moscone')

    await waitFor(async () => {
      await expect(
        canvas.getByRole('link', { name: 'SaaStr Annual' }),
      ).toBeVisible()
    })
    // The header keeps showing what is next whatever the search says — it is
    // the answer to "where am I going", not a search result.
    await expect(
      list(canvas, 'Upcoming events').queryByRole('link', {
        name: 'RevOps Summit',
      }),
    ).not.toBeInTheDocument()
  },
}

/** A search with nothing behind it says so, and says what to try instead. */
export const NoMatches: Story = {
  play: async ({ canvas, userEvent }) => {
    await userEvent.type(canvas.getByLabelText('Search events'), 'reykjavik')

    await waitFor(async () => {
      await expect(
        canvas.getByRole('heading', { name: 'No events match' }),
      ).toBeVisible()
    })
  },
}

/** A calendar with nothing on it yet. */
export const Empty: Story = {
  args: { events: [] },
  play: async ({ canvas }) => {
    await expect(
      canvas.getByRole('heading', { name: 'No upcoming events' }),
    ).toBeVisible()
  },
}

/** In the shell it renders under, at the `/events` destination. */
export const InAppShell: Story = {
  render: (args) => (
    <AppShell currentId="/events">
      <Events {...args} />
    </AppShell>
  ),
  play: async ({ canvas }) => {
    const events = canvas.getAllByRole('link', { name: 'Events' })
    await expect(
      events.some((link) => link.getAttribute('aria-current') === 'page'),
    ).toBe(true)
  },
}

/** Phone. The cover stays landscape, and the badges drop under each name. */
export const Mobile: Story = {
  globals: { viewport: { value: 'mobileS' } },
  parameters: { chromatic: { viewports: [375] } },
  render: (args) => (
    <AppShell currentId="/events">
      <Events {...args} />
    </AppShell>
  ),
}
