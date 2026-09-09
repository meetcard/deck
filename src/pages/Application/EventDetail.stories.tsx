import type { Meta, StoryObj } from '@storybook/react-vite'
import { expect, within } from 'storybook/test'
import { AppShell } from './AppShell'
import { EventDetail } from './EventDetail'

const meta = {
  component: EventDetail,
  title: 'Experience/Application/EventDetail',
  tags: ['page'],
  parameters: { layout: 'fullscreen' },
} satisfies Meta<typeof EventDetail>

export default meta
type Story = StoryObj<typeof meta>

/**
 * A conference two weeks out. Everything you would check standing in a lobby
 * is in the hero; everything you read once, before deciding, is below it.
 */
export const Default: Story = {
  play: async ({ canvas }) => {
    await expect(
      canvas.getByRole('heading', { level: 1, name: 'RevOps Summit' }),
    ).toBeVisible()
    await expect(canvas.getByText('Tuesday, May 18, 2027')).toBeVisible()
    await expect(canvas.getByText('9:00 AM – 4:30 PM')).toBeVisible()
    await expect(canvas.getByText(/Community Lead, RevOps Collective/)).toBeVisible()

    // Somebody else's conference: nothing here is yours to edit.
    await expect(
      canvas.queryByRole('link', { name: /Edit event/ }),
    ).not.toBeInTheDocument()
  },
}

/**
 * The RSVP moves the tally it sits above, so a person sees their own answer
 * in the same numbers everyone else sees.
 */
export const AnsweringTheRsvp: Story = {
  play: async ({ canvas, userEvent }) => {
    await expect(canvas.getByRole('radio', { name: /Yes/ })).toBeChecked()

    await userEvent.click(canvas.getByRole('radio', { name: /Maybe/ }))

    await expect(canvas.getByRole('radio', { name: /Maybe/ })).toBeChecked()
    // One moved out of attending and into maybe, in the tally everyone
    // else sees rather than in a line of its own.
    await expect(
      canvas.getByText(/420 attending · 19 maybe · 4 not attending/),
    ).toBeVisible()
  },
}

/**
 * An event you are hosting. The edit link appears only here — on someone
 * else's conference it would be a control that cannot do what it offers.
 */
export const HostingIt: Story = {
  args: { slug: 'boulder-climate' },
  play: async ({ canvas }) => {
    await expect(
      canvas.getByRole('link', { name: /Edit event/ }),
    ).toHaveAttribute('href', '/events/boulder-climate/edit')
    await expect(canvas.getByText('Hosting')).toBeVisible()
  },
}

/**
 * After the fact. The page stops asking whether you are coming and starts
 * answering what you came away with — which is the only reason an event is
 * still in the product a year later.
 */
export const APastEvent: Story = {
  args: { slug: 'saas-north' },
  play: async ({ canvas }) => {
    await expect(
      canvas.getByRole('heading', { level: 2, name: 'Cards exchanged' }),
    ).toBeVisible()
    await expect(canvas.getByText('5 cards exchanged')).toBeVisible()
    await expect(
      canvas.getByRole('link', { name: 'Open the stack in Connections' }),
    ).toBeVisible()

    // Nothing to RSVP to: it already happened.
    await expect(
      canvas.queryByRole('radio', { name: /Yes/ }),
    ).not.toBeInTheDocument()
  },
}

/**
 * Most events are entered in twenty seconds with no picture at all. The hero
 * falls back to the brand under the same scrim, so the page is quieter
 * rather than broken.
 */
export const WithoutACover: Story = {
  args: { slug: 'founders-dinner' },
  play: async ({ canvasElement }) => {
    await expect(
      canvasElement.querySelector('.deck-event-hero__image'),
    ).toBeNull()
    await expect(
      canvasElement.querySelector('.deck-event-hero__scrim'),
    ).not.toBeNull()
  },
}

/** A link that has gone stale. Said plainly, with the way back. */
export const NoSuchEvent: Story = {
  args: { slug: 'a-party-that-never-was' },
  play: async ({ canvas }) => {
    await expect(
      canvas.getByRole('heading', { name: 'No such event' }),
    ).toBeVisible()
    await expect(
      canvas.getByRole('link', { name: 'Back to events' }),
    ).toBeVisible()
  },
}

/**
 * Phone. This much in a hero is taller than a phone is wide, and that is
 * fine: the height is all words. What must not happen is a band of blurred
 * picture above them — the landscape frame is a floor, so the picture never
 * takes room the content has not asked for.
 */
export const Mobile: Story = {
  globals: { viewport: { value: 'mobileS' } },
  parameters: { chromatic: { viewports: [375] } },
  play: async ({ canvasElement }) => {
    const hero = canvasElement.querySelector<HTMLElement>('.deck-event-hero')!
    const content = canvasElement.querySelector<HTMLElement>(
      '.deck-event-hero__content',
    )!

    // Every pixel of the hero's height is content: no wasted picture above
    // the words, and nothing clipped below them.
    await expect(hero.clientHeight).toBe(content.offsetHeight)
    await expect(content.scrollHeight).toBeLessThanOrEqual(
      content.clientHeight + 1,
    )
    // And the frame it started from is still landscape.
    await expect(hero.clientHeight).toBeGreaterThan(
      (hero.clientWidth * 4) / 7 - 1,
    )
  },
}

/** In the shell, with Events still lit on the rail. */
export const InTheShell: Story = {
  render: () => (
    <AppShell currentId="/events">
      <EventDetail />
    </AppShell>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    /* Two links say "Events" here and they are different things: the way
       back, and the destination on the rail. Only the rail's is current. */
    const links = canvas.getAllByRole('link', { name: 'Events' })
    await expect(
      links.some((link) => link.getAttribute('aria-current') === 'page'),
    ).toBe(true)
  },
}
