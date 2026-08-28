import type { Meta, StoryObj } from '@storybook/react-vite'
import { expect, waitFor } from 'storybook/test'
import { EventDetails } from './EventDetails'

const meta = {
  component: EventDetails,
  title: 'Experience/Networking/Event Details',
  tags: ['page'],
  parameters: { layout: 'fullscreen' },
} satisfies Meta<typeof EventDetails>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {}

/**
 * Answering moves the tally. The page holds the counts so a person sees their
 * own answer reflected in the same numbers everyone else sees — which means
 * the previous answer has to be taken back off as the new one is added, and
 * that hand-off is the only real logic on the page.
 */
export const Rsvping: Story = {
  play: async ({ canvas, userEvent }) => {
    // Opens on "yes", counted.
    await expect(canvas.getByRole('radio', { name: 'Yes' })).toBeChecked()
    await expect(
      canvas.getByText('1 attending · 0 maybe · 0 not attending'),
    ).toBeVisible()

    await userEvent.click(canvas.getByRole('radio', { name: 'Maybe' }))

    // Moved, not added: yes gives up its one as maybe takes it.
    await waitFor(async () => {
      await expect(
        canvas.getByText('0 attending · 1 maybe · 0 not attending'),
      ).toBeVisible()
    })

    await userEvent.click(canvas.getByRole('radio', { name: 'No' }))
    await waitFor(async () => {
      await expect(
        canvas.getByText('0 attending · 0 maybe · 1 not attending'),
      ).toBeVisible()
    })

    // The attendee line reads from the same count, so it moves with it.
    await expect(canvas.getByText('0 attending')).toBeVisible()
  },
}
