import type { Meta, StoryObj } from '@storybook/react-vite'
import { expect, waitFor } from 'storybook/test'
import { AppShell } from './AppShell'
import { EventDetails } from './EventDetails'
import { APP_EVENTS } from './eventsData'

const meta = {
  component: EventDetails,
  title: 'Experience/Application/Event Details',
  tags: ['page'],
  parameters: { layout: 'fullscreen' },
} satisfies Meta<typeof EventDetails>

export default meta
type Story = StoryObj<typeof meta>

/** The next event on the calendar, in full. */
export const Default: Story = {
  play: async ({ canvas }) => {
    await expect(
      canvas.getByRole('heading', { level: 1, name: 'RevOps Summit' }),
    ).toBeVisible()
    await expect(
      canvas.getByRole('list', { name: 'Schedule for RevOps Summit' }),
    ).toBeVisible()
    // The faces draw the group; the chips say who is in it.
    await expect(canvas.getByText('5 cards exchanged')).toBeVisible()
  },
}

/** One you are running rather than attending. */
export const Hosting: Story = {
  args: { event: APP_EVENTS[1] },
  play: async ({ canvas }) => {
    await expect(
      canvas.getByRole('heading', {
        level: 1,
        name: 'Boulder Climate Happy Hour',
      }),
    ).toBeVisible()
  },
}

/**
 * An event already behind you. No "Soon", and the cards are the whole reason
 * to be on this page.
 */
export const Past: Story = {
  args: { event: APP_EVENTS[4] },
  play: async ({ canvas }) => {
    await expect(canvas.queryByText('Soon')).not.toBeInTheDocument()
    await expect(canvas.getByText('7 cards exchanged')).toBeVisible()
  },
}

/** Sharing raises the same dialog every other shareable thing does. */
export const Sharing: Story = {
  play: async ({ canvas, userEvent }) => {
    await userEvent.click(canvas.getByRole('button', { name: 'Share' }))

    await waitFor(async () => {
      await expect(canvas.getByLabelText('Share link')).toHaveValue(
        'meetcard.io/events/revops',
      )
    })
  },
}

/** In the shell it renders under. */
export const InAppShell: Story = {
  render: (args) => (
    <AppShell currentId="/events">
      <EventDetails {...args} />
    </AppShell>
  ),
}

/** Phone. The cover stays landscape; the two fact panels stack. */
export const Mobile: Story = {
  globals: { viewport: { value: 'mobileS' } },
  parameters: { chromatic: { viewports: [375] } },
  render: (args) => (
    <AppShell currentId="/events">
      <EventDetails {...args} />
    </AppShell>
  ),
}
